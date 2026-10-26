/**
 * Nova 360 AI - Frontend Application Logic
 * Pair programmed and improved for responsive layout, session management,
 * safe markdown rendering, dark mode persistence, and robust backend integration.
 */

// DOM helper utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Elements
const welcome = $("#welcome");
const conversation = $("#conversation");
const form = $("#chatForm");
const input = $("#messageInput");
const chatList = $("#chatList");
const pageTitle = $("#pageTitle");
const toast = $("#toast");
const fileInput = $("#fileInput");
const fileName = $("#fileName");
const sidebar = $("#sidebar");
const themeToggle = $("#themeToggle");
const voiceButton = $("#voiceButton");
const sendButton = $("#sendButton");

// Storage keys
const STORAGE_THEME_KEY = "nova360_theme";
const STORAGE_SESSIONS_KEY = "nova360_sessions_v2";
const STORAGE_ACTIVE_ID_KEY = "nova360_active_session_id_v2";

// API Endpoint
const BACKEND_API_URL = "http://127.0.0.1:8000/api/chat";

// Application State
let sessions = [];
let activeSessionId = null;
let isPendingRequest = false;
let toastTimer = null;

// ==========================================
// 1. Toast Notification Helper
// ==========================================
function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ==========================================
// 2. Dark Mode Implementation
// ==========================================
function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
  } catch (err) {
    console.warn("Could not read theme from localStorage:", err);
  }

  // Fallback to system preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  document.body.classList.toggle("dark-mode", isDark);

  // Clear any old conflicting inline styles if they were set previously
  [
    "--bg",
    "--surface",
    "--surface-soft",
    "--text",
    "--muted",
    "--border",
    "--primary",
    "--primary-soft"
  ].forEach((prop) => document.body.style.removeProperty(prop));

  if (themeToggle) {
    themeToggle.setAttribute(
      "title",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  try {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  } catch (err) {
    console.warn("Could not persist theme to localStorage:", err);
  }
}

function initTheme() {
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentDark = document.body.classList.contains("dark");
      const nextTheme = currentDark ? "light" : "dark";
      applyTheme(nextTheme);
      showToast(nextTheme === "dark" ? "Dark theme enabled" : "Light theme enabled");
    });
  }
}

// ==========================================
// 3. Safe Markdown Parsing and Sanitization
// ==========================================
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Built-in secure fallback Markdown renderer.
 * Safely handles paragraphs, bold, italic, inline code, fenced code blocks, and lists
 * after complete HTML escaping.
 */
function renderSafeMarkdownFallback(text) {
  if (!text) return "";

  // 1. Pre-escape all HTML tags to prevent XSS
  let safe = escapeHtml(text);

  // 2. Fenced code blocks ```lang\ncode\n```
  safe = safe.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${langClass}>${code.trim()}</code></pre>`;
  });

  // 3. Inline code `code`
  safe = safe.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // 4. Bold: **text** or __text__
  safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 5. Italic: *text* or _text_
  safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  safe = safe.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 6. Split into blocks by double newlines for paragraphs & lists
  const blocks = safe.split(/\n{2,}/);
  const formatted = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<pre>")) return trimmed;

    const lines = trimmed.split("\n");
    const isUnordered = lines.every((line) => /^[*-]\s+/.test(line.trim()));
    const isOrdered = lines.every((line) => /^\d+\.\s+/.test(line.trim()));

    if (isUnordered) {
      const items = lines
        .map((l) => `<li>${l.trim().replace(/^[*-]\s+/, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }

    if (isOrdered) {
      const items = lines
        .map((l) => `<li>${l.trim().replace(/^\d+\.\s+/, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }

    return `<p>${lines.join("<br>")}</p>`;
  });

  return formatted.filter(Boolean).join("");
}

/**
 * Main Markdown renderer:
 * Uses DOMPurify + marked if loaded from CDN,
 * otherwise safely falls back to built-in renderer.
 */
function renderMarkdown(rawText) {
  if (!rawText) return "";

  if (typeof window.marked !== "undefined" && typeof window.DOMPurify !== "undefined") {
    try {
      const rawHtml = window.marked.parse(rawText, {
        gfm: true,
        breaks: true
      });
      return window.DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "b", "em", "i", "code", "pre",
          "ul", "ol", "li", "blockquote", "h1", "h2", "h3",
          "h4", "h5", "h6", "hr", "table", "thead", "tbody",
          "tr", "th", "td", "a", "span"
        ],
        ALLOWED_ATTR: ["href", "title", "target", "rel", "class"]
      });
    } catch (e) {
      console.warn("Marked/DOMPurify failed, falling back to safe built-in parser:", e);
    }
  }

  return renderSafeMarkdownFallback(rawText);
}

// ==========================================
// 4. Session History Management
// ==========================================
function getDefaultSessions() {
  const now = Date.now();
  return [
    {
      id: "demo-meeting-summary",
      title: "Meeting summary",
      createdAt: now - 3600000 * 3,
      messages: [
        {
          role: "user",
          text: "Can you summarize the action items from our project kickoff meeting?",
          timestamp: now - 3600000 * 3
        },
        {
          role: "assistant",
          text: "Here is a summary of the action items from your kickoff meeting:\n\n- **Frontend**: Polish dark mode theme, avatar alignments, and typing animations.\n- **Backend**: Connect FastAPI `/api/chat` with verified CORS configuration.\n- **Integration**: Verify automated tests and session persistence.\n\nLet me know if you would like me to draft follow-up notes for the team!",
          timestamp: now - 3600000 * 3 + 2000
        }
      ]
    },
    {
      id: "demo-team-report",
      title: "Team report",
      createdAt: now - 3600000 * 2,
      messages: [
        {
          role: "user",
          text: "Help me draft a structure for our weekly sprint report.",
          timestamp: now - 3600000 * 2
        },
        {
          role: "assistant",
          text: "Here is a clean outline for your team report:\n\n1. **Sprint Goal** — High-level objective.\n2. **Shipped Features** — Completed pull requests and tasks.\n3. **In-Flight Tasks** — Items currently in progress or QA.\n4. **Blockers & Dependencies** — Issues requiring attention.\n5. **Next Sprint Focus** — Top 3 priorities.",
          timestamp: now - 3600000 * 2 + 2000
        }
      ]
    },
    {
      id: "demo-email-drafting",
      title: "Email drafting",
      createdAt: now - 3600000 * 1,
      messages: [
        {
          role: "user",
          text: "Draft a concise project update email for stakeholders.",
          timestamp: now - 3600000 * 1
        },
        {
          role: "assistant",
          text: "**Subject**: Nova 360 AI — Milestone Update\n\nHi team,\n\nI am pleased to share that we have completed key frontend and backend enhancements for Nova 360 AI, including session history, responsive message layouts, and dark mode support.\n\nPlease feel free to review and share feedback.\n\nBest regards,\nNova Team",
          timestamp: now - 3600000 * 1 + 2000
        }
      ]
    }
  ];
}

function loadSessionsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (!raw) return getDefaultSessions();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultSessions();
    }

    // Validate data structure and sanitize
    const valid = parsed
      .filter((s) => s && typeof s === "object" && typeof s.id === "string" && typeof s.title === "string")
      .map((s) => ({
        id: s.id,
        title: s.title,
        createdAt: typeof s.createdAt === "number" ? s.createdAt : Date.now(),
        messages: Array.isArray(s.messages)
          ? s.messages.filter(
              (m) =>
                m &&
                typeof m.text === "string" &&
                (m.role === "user" || m.role === "assistant")
            )
          : []
      }));

    return valid.length > 0 ? valid : getDefaultSessions();
  } catch (err) {
    console.warn("Failed to parse sessions from localStorage, using defaults:", err);
    return getDefaultSessions();
  }
}

function saveSessionsToStorage() {
  try {
    // Save only clean conversation history; never expose any tokens or credentials
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    if (activeSessionId) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeSessionId);
    }
  } catch (err) {
    console.warn("Failed to persist sessions to localStorage:", err);
  }
}

function getActiveSession() {
  return sessions.find((s) => s.id === activeSessionId) || null;
}

// ==========================================
// 5. Chat View & Messages Rendering
// ==========================================
function showConversationView() {
  welcome.classList.add("hidden");
  conversation.classList.remove("hidden");
}

function showWelcomeView() {
  welcome.classList.remove("hidden");
  conversation.classList.add("hidden");
  conversation.innerHTML = "";
}

/**
 * Creates and appends a single message DOM row.
 * - User messages: Right aligned, avatar 'U', safe textContent.
 * - AI messages: Left aligned, avatar 'n', sanitized Markdown.
 */
function createMessageElement(role, text) {
  const isUser = role === "user";
  const row = document.createElement("div");
  row.className = `message ${isUser ? "user" : "assistant"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = isUser ? "U" : "n";
  avatar.setAttribute("aria-label", isUser ? "User" : "Nova AI");

  const content = document.createElement("div");
  content.className = "message-content";

  if (isUser) {
    // User messages are strictly plain text (immune to injection)
    content.textContent = text;
  } else {
    // AI messages are parsed and sanitized
    content.innerHTML = renderMarkdown(text);
  }

  row.append(avatar, content);
  return row;
}

function renderConversationMessages(messages) {
  conversation.innerHTML = "";
  if (!messages || messages.length === 0) {
    showWelcomeView();
    return;
  }

  showConversationView();
  messages.forEach((m) => {
    const el = createMessageElement(m.role, m.text);
    conversation.appendChild(el);
  });

  conversation.scrollTop = conversation.scrollHeight;
}

function renderSessionList() {
  chatList.innerHTML = "";

  sessions.forEach((s) => {
    const button = document.createElement("button");
    const isActive = s.id === activeSessionId;
    button.className = `chat-item${isActive ? " active" : ""}`;
    button.dataset.sessionId = s.id;
    button.dataset.chat = s.title;

    button.innerHTML = '<span>◷</span><span class="chat-title"></span>';
    button.querySelector(".chat-title").textContent = s.title;

    button.addEventListener("click", () => {
      switchSession(s.id);
    });

    chatList.appendChild(button);
  });
}

function switchSession(sessionId) {
  const hw = $("#healthWorkspace");
  if (hw) hw.classList.add("hidden");
  const comp = $(".composer-wrap");
  if (comp) comp.classList.remove("hidden");

  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return;

  activeSessionId = target.id;
  pageTitle.textContent = target.title;
  sidebar.classList.remove("open");

  renderSessionList();
  saveSessionsToStorage();

  if (target.messages.length > 0) {
    renderConversationMessages(target.messages);
  } else {
    showWelcomeView();
  }

  showToast(`Switched to "${target.title}"`);
}

function createNewChat() {
  const hw = $("#healthWorkspace");
  if (hw) hw.classList.add("hidden");
  const comp = $(".composer-wrap");
  if (comp) comp.classList.remove("hidden");

  // Check if current active session is already an empty fresh session
  const current = getActiveSession();
  if (current && current.messages.length === 0) {
    showWelcomeView();
    input.value = "";
    resizeInput();
    input.focus();
    sidebar.classList.remove("open");
    return;
  }

  const newSession = {
    id: "session-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    title: "New chat",
    createdAt: Date.now(),
    messages: []
  };

  sessions.unshift(newSession);
  activeSessionId = newSession.id;
  pageTitle.textContent = "New chat";

  saveSessionsToStorage();
  renderSessionList();
  showWelcomeView();

  input.value = "";
  resizeInput();
  if (fileName) fileName.textContent = "";
  if (fileInput) fileInput.value = "";

  sidebar.classList.remove("open");
  input.focus();
  showToast("Started a new chat session.");
}

// ==========================================
// 6. Typing Indicator
// ==========================================
function showTypingIndicator() {
  removeTypingIndicator();

  const row = document.createElement("div");
  row.className = "message assistant typing-indicator-row";
  row.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "n";
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "message-content";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.setAttribute("role", "status");
  typing.setAttribute("aria-label", "Nova AI is generating a response");
  typing.innerHTML = "<i></i><i></i><i></i>";

  content.appendChild(typing);
  row.append(avatar, content);
  conversation.appendChild(row);
  conversation.scrollTop = conversation.scrollHeight;

  return row;
}

function removeTypingIndicator() {
  const existing = document.getElementById("typingIndicator");
  if (existing) {
    existing.remove();
  }
  $$(".typing-indicator-row").forEach((el) => el.remove());
}

// ==========================================
// 7. Composer Controls & Input Resizing
// ==========================================
function resizeInput() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
}

function setComposerPending(pending) {
  isPendingRequest = pending;
  if (sendButton) {
    sendButton.disabled = pending;
    sendButton.setAttribute("aria-busy", pending ? "true" : "false");
  }
  if (input) {
    input.setAttribute("aria-busy", pending ? "true" : "false");
  }
}

// ==========================================
// 8. Backend API Integration
// ==========================================
async function getBackendReply(message) {
  let response;
  try {
    response = await fetch(BACKEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });
  } catch (networkError) {
    throw new Error(
      `Unable to connect to Nova 360 AI backend at ${BACKEND_API_URL}. ` +
      `Please ensure the server is running (e.g. uvicorn backend.main:app --reload).`
    );
  }

  if (!response.ok) {
    let details = "";
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        details = Array.isArray(errorData.detail)
          ? errorData.detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
          : errorData.detail;
      }
    } catch (_) {
      // Non-JSON error response fallback
    }

    throw new Error(
      `Backend error ${response.status}${details ? `: ${details}` : ""}`
    );
  }

  const data = await response.json();
  if (!data || typeof data.reply !== "string") {
    throw new Error("Invalid response format: 'reply' string was not returned by the backend.");
  }

  return data.reply;
}

// ==========================================
// 9. Send Message Workflow
// ==========================================
async function sendMessage(rawText) {
  if (isPendingRequest) return;

  const text = (rawText || "").trim();
  if (!text) {
    showToast("Please type a message first.");
    input.focus();
    return;
  }

  let session = getActiveSession();
  if (!session) {
    createNewChat();
    session = getActiveSession();
  }

  // Update session title on the first user message
  if (session.messages.length === 0) {
    const generatedTitle =
      text.length > 25 ? text.slice(0, 25).trim() + "…" : text;
    session.title = generatedTitle;
    pageTitle.textContent = generatedTitle;
    renderSessionList();
  }

  // Append user message
  const userMsg = {
    role: "user",
    text,
    timestamp: Date.now()
  };
  session.messages.push(userMsg);
  saveSessionsToStorage();

  // Update UI
  showConversationView();
  const userEl = createMessageElement("user", text);
  conversation.appendChild(userEl);
  conversation.scrollTop = conversation.scrollHeight;

  // Clear input and reset height
  input.value = "";
  resizeInput();

  // Indicate pending state
  setComposerPending(true);
  showTypingIndicator();

  try {
    const reply = await getBackendReply(text);

    removeTypingIndicator();

    const assistantMsg = {
      role: "assistant",
      text: reply,
      timestamp: Date.now()
    };
    session.messages.push(assistantMsg);
    saveSessionsToStorage();

    const assistantEl = createMessageElement("assistant", reply);
    conversation.appendChild(assistantEl);
    conversation.scrollTop = conversation.scrollHeight;
  } catch (error) {
    removeTypingIndicator();

    const errorMessage =
      `**Connection / Service Notice**:\n\n${error.message}\n\n` +
      `*Check the backend terminal to ensure FastAPI is active on 127.0.0.1:8000.*`;

    const assistantMsg = {
      role: "assistant",
      text: errorMessage,
      timestamp: Date.now()
    };
    session.messages.push(assistantMsg);
    saveSessionsToStorage();

    const assistantEl = createMessageElement("assistant", errorMessage);
    conversation.appendChild(assistantEl);
    conversation.scrollTop = conversation.scrollHeight;

    console.error("Nova 360 AI request failure:", error);
    showToast("Request failed. See chat details.");
  } finally {
    removeTypingIndicator();
    setComposerPending(false);
  }
}

// ==========================================
// 10. AI Modules Feature Selection
// ==========================================
function selectFeature(button) {
  // If button is the health module, open the health workspace dashboard!
  if (button.dataset.module === "health") {
    if (window.HealthModule && window.HealthModule.openHealthWorkspace) {
      window.HealthModule.openHealthWorkspace();
      return;
    }
  }

  // Ensure health workspace is hidden when selecting another module
  const hw = $("#healthWorkspace");
  if (hw) hw.classList.add("hidden");
  const comp = $(".composer-wrap");
  if (comp) comp.classList.remove("hidden");

  const prompt = button.dataset.prompt;
  if (!prompt) return;

  input.value = prompt;
  resizeInput();
  input.focus();

  // Determine human-readable label without icon text
  const strongEl = button.querySelector("strong");
  let featureName = "";
  if (strongEl) {
    featureName = strongEl.textContent.trim();
  } else {
    const clone = button.cloneNode(true);
    clone.querySelectorAll(".module-icon").forEach((el) => el.remove());
    featureName = clone.textContent.trim();
  }

  if (featureName) {
    pageTitle.textContent = featureName;
    showToast(`${featureName} selected. Review prompt and press Send.`);
  }

  sidebar.classList.remove("open");
}

function initFeatureModules() {
  // Suggestion cards on dashboard
  $$(".suggestion-card").forEach((btn) => {
    btn.addEventListener("click", () => selectFeature(btn));
  });

  // Sidebar AI module links
  $$(".module-link").forEach((btn) => {
    btn.addEventListener("click", () => selectFeature(btn));
  });
}

// ==========================================
// 11. Event Handlers & Initialization
// ==========================================
function initEventHandlers() {
  // Chat form submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  // Textarea input auto-expansion
  input.addEventListener("input", resizeInput);

  // Enter to send, Shift+Enter for new line
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isPendingRequest) {
        form.requestSubmit();
      }
    }
  });

  // New Chat button
  $("#newChat").addEventListener("click", createNewChat);

  // Mobile sidebar toggles
  $("#openSidebar").addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  $("#closeSidebar").addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // Search chats
  $("#searchToggle").addEventListener("click", () => {
    const query = prompt("Search recent chats:");
    if (query === null) return;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      showToast("Please enter a word to search.");
      return;
    }

    const matches = sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(trimmed) ||
        s.messages.some((m) => m.text.toLowerCase().includes(trimmed))
    );

    if (matches.length > 0) {
      switchSession(matches[0].id);
      showToast(`Found ${matches.length} matching chat(s).`);
    } else {
      showToast(`No chats found matching "${query}".`);
    }
  });

  // Clear chats
  $("#clearChats").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all recent chat sessions?")) {
      sessions = [];
      try {
        localStorage.removeItem(STORAGE_SESSIONS_KEY);
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      } catch (_) {}
      createNewChat();
      showToast("All recent chats have been cleared.");
    }
  });

  // File selection
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (fileName) {
        fileName.textContent = file ? file.name : "";
        fileName.title = file ? file.name : "";
      }
      if (file) {
        showToast(
          `Selected: ${file.name} (upload endpoint not yet configured)`
        );
      }
    });
  }

  // Voice input
  if (voiceButton) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      let isListening = false;

      recognition.onstart = () => {
        isListening = true;
        voiceButton.classList.add("listening");
        voiceButton.setAttribute("aria-label", "Listening... click to stop");
        showToast("Listening… speak now.");
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          input.value = (input.value ? input.value + " " : "") + transcript;
          resizeInput();
          input.focus();
        }
      };

      recognition.onerror = (event) => {
        isListening = false;
        voiceButton.classList.remove("listening");
        if (event.error === "not-allowed") {
          showToast("Microphone permission denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          showToast("No speech detected. Please try speaking again.");
        } else {
          showToast(`Voice input error: ${event.error || "unknown"}`);
        }
      };

      recognition.onend = () => {
        isListening = false;
        voiceButton.classList.remove("listening");
      };

      voiceButton.addEventListener("click", () => {
        if (isListening) {
          recognition.stop();
          isListening = false;
          voiceButton.classList.remove("listening");
          showToast("Voice input stopped.");
        } else {
          try {
            recognition.start();
          } catch (e) {
            showToast("Could not start voice recognition.");
          }
        }
      });
    } else {
      voiceButton.addEventListener("click", () => {
        showToast("Voice recognition is not supported in this browser.");
      });
    }
  }

  // Library & Profile demo items
  $("#libraryBtn").addEventListener("click", () => {
    showToast("Library is a demo feature.");
  });

  $("#profileBtn").addEventListener("click", () => {
    showToast("Personal workspace · Nova 360 AI");
  });

  // Global keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#newChat").click();
    }
    if (event.key === "Escape") {
      sidebar.classList.remove("open");
    }
  });
}

// ==========================================
// 12. Application Boot
// ==========================================
function initApp() {
  initTheme();
  initFeatureModules();
  initEventHandlers();

  // Load sessions
  sessions = loadSessionsFromStorage();

  // Restore active session ID or select the first session
  let savedActiveId = null;
  try {
    savedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
  } catch (_) {}

  const initialSession =
    sessions.find((s) => s.id === savedActiveId) || sessions[0];

  if (initialSession) {
    activeSessionId = initialSession.id;
    pageTitle.textContent = initialSession.title;
    renderSessionList();
    if (initialSession.messages.length > 0) {
      renderConversationMessages(initialSession.messages);
    } else {
      showWelcomeView();
    }
  } else {
    createNewChat();
  }

  // Expose helpers for modular sub-modules (such as Health & Wellbeing)
  window.getBackendReply = getBackendReply;
  window.renderMarkdown = renderMarkdown;
  window.showToast = showToast;
  window.switchSession = switchSession;
  window.createNewChat = createNewChat;
}

// Start on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
