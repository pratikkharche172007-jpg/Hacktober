# Nova AI Frontend Demo

A responsive AI assistant dashboard built with plain HTML, CSS and JavaScript.

## Files
- `index.html` — page structure
- `style.css` — layout, styling, responsive rules and dark theme
- `script.js` — chat interactions and demo replies

## Run in VS Code
1. Extract `nova-ai-frontend.zip`.
2. Open VS Code.
3. Select **File → Open Folder...** and choose the extracted `ai_assistant_frontend` folder.
4. Open `index.html`.
5. Recommended: install the **Live Server** extension by Ritwick Dey, then right-click `index.html` and choose **Open with Live Server**.
6. Try the prompt cards, send a message, create a new chat, use the theme toggle, and resize the browser to test mobile layout.

You can also double-click `index.html` to open it in a browser, but Live Server is more convenient while editing.

## Important
This is a frontend demo. The assistant responses are local placeholder rules in `script.js`, not real AI. File selection is not an upload. To connect real AI, make a backend endpoint and have the frontend call it. **Never put an API secret key in browser JavaScript.**
