/**
 * Nova 360 AI - Health & Wellbeing Module
 * Complete, responsive implementation of all 6 sub-fields and 30 small features.
 * Features: Structured forms, validation, in-memory records (demo store),
 * interactive tools, and contextual Nova Health & Wellbeing AI.
 */

(function () {
  'use strict';

  // ==========================================
  // In-Memory Data Store (Fictional Demo Records)
  // Transparently labeled as demo session storage
  // ==========================================
  const HealthState = {
    activeSubfieldId: 'personal_organizer',
    activeFeatureId: 'personal_profile',
    isAiPending: false,

    // In-memory records
    profile: {
      fullName: 'Alex Morgan (Demo)',
      dob: '1992-06-15',
      emergencyContactName: 'Taylor Morgan',
      emergencyContactPhone: '+1 (555) 234-5678',
      bloodType: 'O Positive',
      preferredLanguage: 'English',
      notes: 'No chronic cardiovascular conditions. Mild seasonal allergies in spring.',
      updatedAt: '2026-10-24'
    },

    allergies: [
      {
        id: 'alg-1',
        name: 'Penicillin',
        category: 'Drug',
        reaction: 'Hives, mild facial swelling',
        recordedDate: '2025-04-12',
        notes: 'Confirmed by primary care clinician in 2022.'
      },
      {
        id: 'alg-2',
        name: 'Peanuts',
        category: 'Food',
        reaction: 'Severe gastrointestinal discomfort, itching',
        recordedDate: '2024-09-18',
        notes: 'Carries epinephrine auto-injector as precautionary measure.'
      }
    ],

    medications: [
      {
        id: 'med-1',
        name: 'Cetirizine',
        strength: '10 mg tablet',
        instructions: 'Take 1 tablet daily in the morning during allergy season',
        prescriber: 'Dr. Sarah Jenkins',
        startDate: '2026-03-01',
        endDate: '',
        notes: 'Over-the-counter antihistamine'
      },
      {
        id: 'med-2',
        name: 'Vitamin D3',
        strength: '2000 IU softgel',
        instructions: 'Take 1 softgel daily with breakfast',
        prescriber: 'Self-selected supplement',
        startDate: '2026-01-10',
        endDate: '',
        notes: 'General wellness support'
      }
    ],

    documents: [
      {
        id: 'doc-1',
        title: 'Annual Blood Work Panel',
        category: 'Lab Report',
        docDate: '2026-08-15',
        fileType: 'PDF Document (Demo)',
        fileSize: '412 KB',
        notes: 'Normal lipid profile and blood glucose.'
      }
    ],

    emergencyCardSettings: {
      includeContact: true,
      includeAllergies: true,
      includeMedications: true,
      includeBloodType: true,
      includeNotes: true
    },

    reminders: [
      {
        id: 'rem-1',
        medName: 'Cetirizine 10mg',
        dosage: '1 tablet',
        time: '08:00 AM',
        frequency: 'Daily',
        status: 'Active'
      },
      {
        id: 'rem-2',
        medName: 'Vitamin D3 2000 IU',
        dosage: '1 softgel',
        time: '08:30 AM',
        frequency: 'Daily',
        status: 'Active'
      }
    ],

    calendarEvents: [
      {
        id: 'cal-1',
        type: 'Routine Check-up',
        name: 'Annual Preventive Dental Visit',
        scheduledDate: '2026-11-14',
        provider: 'Dr. Michael Chen, DDS',
        notes: 'Routine cleaning and checkup',
        status: 'Upcoming'
      },
      {
        id: 'cal-2',
        type: 'Vaccination',
        name: 'Seasonal Influenza Vaccine',
        scheduledDate: '2026-10-10',
        provider: 'Community Pharmacy Clinic',
        notes: 'Administered left deltoid',
        status: 'Completed'
      }
    ],

    habits: [
      { id: 'hab-1', name: 'Morning Walk', target: '30 mins', current: '25 mins', completed: true },
      { id: 'hab-2', name: 'Daily Water Intake', target: '2000 ml', current: '1500 ml', completed: false },
      { id: 'hab-3', name: 'Sleep Target (7h+)', target: '7.5 hours', current: '7.2 hours', completed: true }
    ],

    tasks: [
      { id: 'tsk-1', title: 'Schedule Eye Examination', category: 'Check-up', dueDate: '2026-11-20', status: 'Pending' },
      { id: 'tsk-2', title: 'Pick up allergy eye drops', category: 'Medication', dueDate: '2026-10-30', status: 'Pending' },
      { id: 'tsk-3', title: 'Download annual lab results summary', category: 'Records', dueDate: '2026-10-22', status: 'Completed' }
    ],

    aiConversations: {} // { featureId: [ { role, content, time } ] }
  };

  // Helper utility
  const escapeHtml = (text) => {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  };

  // ==========================================
  // Sub-Fields & Features Registry
  // ==========================================
  const SUBFIELDS = [
    {
      id: 'personal_organizer',
      title: 'Personal Health Organizer',
      icon: '📋',
      description: 'Help the user securely organize personal health information, allergies, medications, and emergency summary.',
      features: [
        { id: 'personal_profile', title: 'Personal Health Profile', desc: 'Create, view, and update your personal health details and emergency contact.' },
        { id: 'allergies_conditions', title: 'Allergies & Conditions Record', desc: 'Log allergies, reactions, and diagnosed medical conditions.' },
        { id: 'medications', title: 'Medication Information', desc: 'Maintain an accurate record of current prescription and OTC medications.' },
        { id: 'health_documents', title: 'Health Document Management', desc: 'Track metadata for medical reports, prescriptions, and referral letters.' },
        { id: 'emergency_card', title: 'Emergency Health Card', desc: 'Summarize essential emergency medical information that you choose to display.' }
      ]
    },
    {
      id: 'health_organizer',
      title: 'Health Organizer',
      icon: '⏰',
      description: 'Organize recurring healthcare tasks, medication reminders, vaccination schedule, and habit history.',
      features: [
        { id: 'medication_reminders', title: 'Medication Reminders', desc: 'Set up an in-app reminder schedule for daily and periodic medications.' },
        { id: 'vaccination_calendar', title: 'Vaccination & Check-up Calendar', desc: 'Track upcoming and past wellness visits, immunizations, and screenings.' },
        { id: 'health_habits', title: 'Health Habit Tracker', desc: 'Log daily wellness progress for walking, sleep, and physical activity.' },
        { id: 'upcoming_tasks', title: 'Upcoming Health Tasks', desc: 'Unified view of upcoming appointments, reminders, and user tasks.' },
        { id: 'completed_history', title: 'Completed Tasks & History', desc: 'Filterable log of completed healthcare tasks and reminder history.' }
      ]
    },
    {
      id: 'info_explainer',
      title: 'Health Information Explainer',
      icon: '💡',
      description: 'Demystify medical terminology, understand lab report values, and prepare questions for your doctor.',
      features: [
        { id: 'ask_health_question', title: 'Ask a Health Question', desc: 'Explore general health topics with customizable explanation levels.' },
        { id: 'medical_terminology', title: 'Medical Terminology Explainer', desc: 'Translate complex medical terms, abbreviations, and clinical acronyms.' },
        { id: 'lab_report_explainer', title: 'Lab Report Terminology Explainer', desc: 'Understand standard lab test markers, reference ranges, and units.' },
        { id: 'reliable_sources', title: 'Reliable Medical Sources', desc: 'Verified reference directory of trustworthy public healthcare institutions.' },
        { id: 'clinician_questions', title: 'Questions for Healthcare Professionals', desc: 'Generate customized question lists for your upcoming appointment.' }
      ]
    },
    {
      id: 'daily_wellness',
      title: 'Daily Wellness Explainer',
      icon: '🌿',
      description: 'Build sustainable daily habits including sleep routines, hydration targets, and guided breathing exercises.',
      features: [
        { id: 'sleep_planner', title: 'Sleep Routine Planner', desc: 'Calculate optimal sleep windows and design an evening wind-down plan.' },
        { id: 'hydration_reminders', title: 'Hydration Reminders', desc: 'Track daily water intake with quick-logging and customizable goals.' },
        { id: 'activity_goals', title: 'Physical Activity Goals', desc: 'Set weekly movement targets and record completed physical activities.' },
        { id: 'wellness_habits', title: 'Healthy Habit Tracking', desc: 'Monitor routine wellbeing habits and daily lifestyle consistency.' },
        { id: 'breathing_exercises', title: 'Breathing & Stress-Management', desc: 'Guided interactive Box Breathing (4-4-4-4) and 4-7-8 relaxation exercises.' }
      ]
    },
    {
      id: 'appointment_prep',
      title: 'Smart Appointment Preparation',
      icon: '🗓️',
      description: 'Prepare thoroughly for clinician visits with symptom summaries, checklists, and post-visit follow-up plans.',
      features: [
        { id: 'appointment_checklist', title: 'Appointment Checklist', desc: 'Organize required documents, questions, and physical preparation items.' },
        { id: 'symptom_summary', title: 'User-Entered Symptom Summary', desc: 'Format your observations and concerns into a neutral summary for your clinician.' },
        { id: 'questions_builder', title: 'Questions to Ask the Clinician', desc: 'Build targeted checklists based on your specific visit purpose.' },
        { id: 'required_documents', title: 'Required Documents Checklist', desc: 'Check off insurance cards, referral forms, and past imaging reports.' },
        { id: 'followup_planner', title: 'Follow-up Task Planner', desc: 'Record instructions from your doctor and track follow-up test deadlines.' }
      ]
    },
    {
      id: 'healthcare_access',
      title: 'Healthcare Access Assistant',
      icon: '🏥',
      description: 'Locate healthcare facilities, search pharmacies, compare services, and explore public healthcare schemes.',
      features: [
        { id: 'nearby_facilities', title: 'Find Nearby Healthcare Facilities', desc: 'Search public hospitals, community clinics, and urgent care centers.' },
        { id: 'find_pharmacies', title: 'Find Pharmacies', desc: 'Directory search for 24-hour and standard community dispensaries.' },
        { id: 'compare_services', title: 'Compare Healthcare Services', desc: 'Compare public vs. private consultations, urgent vs. emergency care indications.' },
        { id: 'public_schemes', title: 'Public Healthcare Schemes', desc: 'Explore government health assistance programs and eligibility requirements.' },
        { id: 'visit_guidance', title: 'Visit Preparation Guidance', desc: 'Step-by-step checklist for navigating healthcare facilities efficiently.' }
      ]
    }
  ];

  // Example Contextual Prompts for Nova Health & Wellbeing AI
  const FEATURE_AI_CHIPS = {
    personal_profile: [
      'What basic info should I include in my health profile?',
      'Why is emergency contact information important?',
      'How often should I update my personal health notes?'
    ],
    allergies_conditions: [
      'What is the difference between an allergy and a condition?',
      'How should I describe my allergy reaction to a doctor?',
      'What questions should I ask about seasonal allergies?'
    ],
    medications: [
      'Why is it important to record exact medication strength?',
      'What should I ask my pharmacist when starting a new prescription?',
      'How do I safely organize a daily medication schedule?'
    ],
    health_documents: [
      'What medical records are most useful to keep organized?',
      'How long should I keep copies of past lab reports?',
      'What information should I highlight from a referral letter?'
    ],
    emergency_card: [
      'What information is most critical on an emergency card?',
      'Does this card replace official emergency services?',
      'Who should have access to my emergency contact card?'
    ],
    medication_reminders: [
      'Tips for remembering to take medication at the same time',
      'What should I do if I forget a dose of medication?',
      'How to organize twice-daily medication routines'
    ],
    vaccination_calendar: [
      'What general adult routine check-ups are commonly recommended?',
      'How to prepare for an annual preventive check-up',
      'Questions to ask about seasonal vaccinations'
    ],
    health_habits: [
      'How to set realistic daily walking goals',
      'Simple ways to build a consistent hydration habit',
      'How physical activity supports general wellbeing'
    ],
    upcoming_tasks: [
      'How to prioritize health tasks when feeling overwhelmed',
      'Checklist for planning health tasks for the month',
      'Tips for coordinating multiple doctor appointments'
    ],
    completed_history: [
      'How tracking completed tasks helps during doctor visits',
      'Reviewing health progress over time',
      'Maintaining consistent health habits'
    ],
    ask_health_question: [
      'Explain how the immune system defends against common colds',
      'What does cardiovascular fitness mean in simple terms?',
      'Why is sleep critical for brain health?'
    ],
    medical_terminology: [
      'What does "Hypertension" mean in plain language?',
      'Explain what "NPO" on a hospital chart stands for',
      'What does "Benign" vs "Malignant" mean?'
    ],
    lab_report_explainer: [
      'What does a Complete Blood Count (CBC) test measure?',
      'Explain what reference ranges mean on lab reports',
      'What is Hemoglobin A1c used for?'
    ],
    reliable_sources: [
      'How can I identify reliable medical information online?',
      'What makes peer-reviewed health research trustworthy?',
      'Reputable government public health websites'
    ],
    clinician_questions: [
      'Questions to ask when a doctor prescribes a new medication',
      'What questions should I ask about unexpected lab results?',
      'How to ask a clinician for a second opinion politely'
    ],
    sleep_planner: [
      'Tips for designing a relaxing wind-down routine',
      'How screen time affects sleep quality',
      'Maintaining consistent sleep schedules on weekends'
    ],
    hydration_reminders: [
      'How much water is generally appropriate for adults?',
      'Signs of mild dehydration during daily work',
      'Can herbal tea and fruits count towards hydration?'
    ],
    activity_goals: [
      'Starting light physical activity safely after a break',
      'Benefits of 30 minutes of brisk walking daily',
      'Balancing cardio and strength exercise'
    ],
    wellness_habits: [
      'Building sustainable habits using habit stacking',
      'Managing stress through daily mindfulness',
      'Small daily actions for long-term health'
    ],
    breathing_exercises: [
      'How does 4-7-8 breathing help lower acute stress?',
      'What is Box Breathing and when is it useful?',
      'Safe techniques for deep abdominal breathing'
    ],
    appointment_checklist: [
      'What items should I always bring to a specialist visit?',
      'How early should I arrive for a medical appointment?',
      'Preparing notes about my medical history'
    ],
    symptom_summary: [
      'How to describe symptom frequency and severity clearly',
      'Why tracking when symptoms started helps doctors',
      'Distinguishing between pain types (dull, sharp, throbbing)'
    ],
    questions_builder: [
      'Top 3 questions to ask about a new diagnosis',
      'Questions about potential medication side effects',
      'Questions to ask regarding recommended imaging or tests'
    ],
    required_documents: [
      'Why bringing an updated medication list is crucial',
      'Documents typically needed for insurance pre-authorization',
      'Organizing prior imaging and specialist reports'
    ],
    followup_planner: [
      'What to do right after leaving the doctor\'s office',
      'Tracking lab tests ordered during an appointment',
      'Organizing physical therapy or follow-up schedules'
    ],
    nearby_facilities: [
      'When should someone choose Urgent Care vs. Emergency Room?',
      'What services do community health centers typically provide?',
      'Questions to ask when calling a healthcare clinic'
    ],
    find_pharmacies: [
      'Questions to ask the pharmacist about generic medications',
      'How prescription refills and transfers work',
      'Checking pharmacy consultation services'
    ],
    compare_services: [
      'Key differences between primary care and urgent care',
      'Understanding in-network vs out-of-network healthcare',
      'Comparing appointment wait times and consultation options'
    ],
    public_schemes: [
      'What are common eligibility factors for public health assistance?',
      'Documents usually needed to apply for public health schemes',
      'Where to find verified official government health programs'
    ],
    visit_guidance: [
      'Step-by-step checklist for navigating a hospital visit',
      'Tips for speaking clearly and advocating for yourself',
      'What to review with the nurse before leaving'
    ]
  };

  // ==========================================
  // Core Health Module Controller
  // ==========================================
  const HealthModule = {
    init: function () {
      this.bindTriggers();
    },

    bindTriggers: function () {
      // Sidebar Health & Wellbeing button
      const sidebarBtn = document.querySelector('.module-link[data-module="health"]') ||
        document.querySelector('.health-module-link');
      if (sidebarBtn) {
        sidebarBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openHealthWorkspace();
        });
      }

      // Dashboard card Health & Wellbeing button
      const cardBtn = document.querySelector('.suggestion-card[data-module="health"]');
      if (cardBtn) {
        cardBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openHealthWorkspace();
        });
      }
    },

    openHealthWorkspace: function (subfieldId = null, featureId = null) {
      const welcome = document.getElementById('welcome');
      const conversation = document.getElementById('conversation');
      const composerWrap = document.querySelector('.composer-wrap');
      const pageTitle = document.getElementById('pageTitle');
      const sidebar = document.getElementById('sidebar');

      if (welcome) welcome.classList.add('hidden');
      if (conversation) conversation.classList.add('hidden');
      if (composerWrap) composerWrap.classList.add('hidden');
      if (sidebar) sidebar.classList.remove('open');

      let workspace = document.getElementById('healthWorkspace');
      if (!workspace) {
        workspace = document.createElement('div');
        workspace.id = 'healthWorkspace';
        const parent = document.getElementById('workspace');
        if (parent) {
          parent.appendChild(workspace);
        }
      }
      workspace.classList.remove('hidden');

      // Highlight active sidebar item
      document.querySelectorAll('.side-link, .chat-item').forEach((btn) => {
        btn.classList.remove('active');
      });
      const sidebarHealthBtn = document.querySelector('.module-link[data-module="health"]');
      if (sidebarHealthBtn) sidebarHealthBtn.classList.add('active');

      if (subfieldId && featureId) {
        HealthState.activeSubfieldId = subfieldId;
        HealthState.activeFeatureId = featureId;
        this.renderFeatureWorkspace();
      } else {
        this.renderDashboardOverview();
      }
    },

    closeHealthWorkspace: function () {
      const workspace = document.getElementById('healthWorkspace');
      if (workspace) workspace.classList.add('hidden');

      const composerWrap = document.querySelector('.composer-wrap');
      if (composerWrap) composerWrap.classList.remove('hidden');

      // Return to regular welcome or active chat
      if (window.switchSession && window.activeSessionId) {
        window.switchSession(window.activeSessionId);
      } else {
        const welcome = document.getElementById('welcome');
        if (welcome) welcome.classList.remove('hidden');
      }
    },

    // ==========================================
    // Render: 1. Health Dashboard Overview
    // ==========================================
    renderDashboardOverview: function () {
      const workspace = document.getElementById('healthWorkspace');
      if (!workspace) return;

      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = 'Health & Wellbeing';

      let cardsHtml = '';
      SUBFIELDS.forEach((sub) => {
        let pillsHtml = sub.features.map(f => `<span class="feature-pill-tag">${escapeHtml(f.title)}</span>`).join('');
        cardsHtml += `
          <div class="health-subfield-card" data-subfield="${sub.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(sub.title)}">
            <div class="subfield-card-header">
              <div class="subfield-icon-wrap">${sub.icon}</div>
              <span class="subfield-arrow">→</span>
            </div>
            <h3>${escapeHtml(sub.title)}</h3>
            <p>${escapeHtml(sub.description)}</p>
            <div class="subfield-features-preview">
              ${pillsHtml}
            </div>
          </div>
        `;
      });

      workspace.innerHTML = `
        <div class="health-top-nav">
          <button class="health-back-btn" id="btnReturnToMain">
            ← Return to Main Workspace
          </button>
          <div class="health-badge-pill pink">
            <span>💗</span> Health &amp; Wellbeing Module
          </div>
        </div>

        <div class="health-safety-banner" role="alert">
          <div class="banner-icon">🛡️</div>
          <div>
            <strong>Privacy &amp; Medical Disclaimer</strong>
            <p>
              Records in this module are saved locally in session memory for demonstration purposes.
              Sensitive health documents are not uploaded to remote servers. This interface does not replace
              clinical diagnoses, prescription orders, or emergency medical services.
            </p>
          </div>
        </div>

        <div class="health-hero">
          <div class="health-badge-pill blue" style="margin-bottom: 8px;">
            6 Comprehensive Healthcare Sub-Fields
          </div>
          <h2>Your Personal <span>Health &amp; Wellbeing</span> Partner</h2>
          <p>
            Securely organize medical records, interpret clinical reports, plan daily wellness routines,
            prepare questions for doctor appointments, and locate public health resources.
          </p>
        </div>

        <div class="health-subfield-grid">
          ${cardsHtml}
        </div>
      `;

      // Event Listeners
      const returnBtn = document.getElementById('btnReturnToMain');
      if (returnBtn) {
        returnBtn.addEventListener('click', () => this.closeHealthWorkspace());
      }

      workspace.querySelectorAll('.health-subfield-card').forEach((card) => {
        const subId = card.dataset.subfield;
        card.addEventListener('click', () => {
          const sub = SUBFIELDS.find(s => s.id === subId);
          if (sub && sub.features.length > 0) {
            HealthState.activeSubfieldId = sub.id;
            HealthState.activeFeatureId = sub.features[0].id;
            this.renderFeatureWorkspace();
          }
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    },

    // ==========================================
    // Render: 2. Two-Column Feature Workspace
    // ==========================================
    renderFeatureWorkspace: function () {
      const workspace = document.getElementById('healthWorkspace');
      if (!workspace) return;

      const currentSub = SUBFIELDS.find(s => s.id === HealthState.activeSubfieldId) || SUBFIELDS[0];
      const currentFeature = currentSub.features.find(f => f.id === HealthState.activeFeatureId) || currentSub.features[0];

      // Update Topbar Breadcrumb
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) {
        pageTitle.textContent = `${currentSub.title} / ${currentFeature.title}`;
      }

      // Render Subfield Tabs
      let subTabsHtml = SUBFIELDS.map(s => `
        <button class="subfield-tab-btn ${s.id === currentSub.id ? 'active' : ''}" data-subfield="${s.id}">
          <span>${s.icon}</span> ${escapeHtml(s.title)}
        </button>
      `).join('');

      // Render Feature Pills
      let featurePillsHtml = currentSub.features.map(f => `
        <button class="feature-pill-btn ${f.id === currentFeature.id ? 'active' : ''}" data-feature="${f.id}">
          ${escapeHtml(f.title)}
        </button>
      `).join('');

      workspace.innerHTML = `
        <div class="health-top-nav">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="health-back-btn" id="btnBackToOverview">
              ← Health Dashboard
            </button>
            <button class="health-back-btn" id="btnReturnToMainFromFeature">
              Main Chat
            </button>
          </div>
          <div class="health-badge-pill pink">
            ${currentSub.icon} ${escapeHtml(currentSub.title)}
          </div>
        </div>

        <div class="health-safety-banner" style="padding: 10px 14px;">
          <div class="banner-icon" style="font-size: 16px;">ℹ️</div>
          <p style="font-size: 11px;">
            <strong>Contextual Health Guidance:</strong> Records entered are stored in local session memory.
            Always confirm health records with your licensed physician.
          </p>
        </div>

        <div class="health-workspace-container">
          <div class="health-subfield-tabs">
            ${subTabsHtml}
          </div>

          <div class="health-feature-pills">
            ${featurePillsHtml}
          </div>

          <div class="health-feature-layout">
            <!-- Main Column: Forms, Records & Tools -->
            <div class="health-main-column" id="healthMainColumn">
              ${this.generateFeatureMainHtml(currentFeature)}
            </div>

            <!-- Secondary Column: Contextual Nova Health & Wellbeing AI -->
            <div class="health-ai-column" id="healthAiColumn">
              ${this.generateAiSidebarHtml(currentSub, currentFeature)}
            </div>
          </div>
        </div>
      `;

      // Bind Subfield & Feature Navigation
      workspace.querySelectorAll('.subfield-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const newSubId = btn.dataset.subfield;
          const newSub = SUBFIELDS.find(s => s.id === newSubId);
          if (newSub) {
            HealthState.activeSubfieldId = newSub.id;
            HealthState.activeFeatureId = newSub.features[0].id;
            this.renderFeatureWorkspace();
          }
        });
      });

      workspace.querySelectorAll('.feature-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          HealthState.activeFeatureId = btn.dataset.feature;
          this.renderFeatureWorkspace();
        });
      });

      const btnOverview = document.getElementById('btnBackToOverview');
      if (btnOverview) {
        btnOverview.addEventListener('click', () => this.renderDashboardOverview());
      }

      const btnMain = document.getElementById('btnReturnToMainFromFeature');
      if (btnMain) {
        btnMain.addEventListener('click', () => this.closeHealthWorkspace());
      }

      // Bind feature-specific event handlers
      this.bindFeatureSpecificEvents(currentFeature.id);

      // Bind AI sidebar events
      this.bindAiSidebarEvents(currentFeature.id);
    },

    // ==========================================
    // Generate HTML for each of the 30 Small Features
    // ==========================================
    generateFeatureMainHtml: function (feature) {
      switch (feature.id) {
        // --- Sub-Field 1: Personal Health Organizer ---
        case 'personal_profile':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Personal Health Profile</h3>
                  <p class="health-card-desc">Edit your basic health identification and emergency contact details.</p>
                </div>
                <button class="health-btn-danger" id="btnClearProfile">Clear Profile</button>
              </div>

              <form id="formHealthProfile" class="health-form-grid">
                <div class="health-form-group">
                  <label for="profName">Display Name or Full Name <span class="required">*</span></label>
                  <input type="text" id="profName" class="health-input" value="${escapeHtml(HealthState.profile.fullName)}" required />
                </div>
                <div class="health-form-group">
                  <label for="profDob">Date of Birth</label>
                  <input type="date" id="profDob" class="health-input" value="${escapeHtml(HealthState.profile.dob)}" />
                </div>
                <div class="health-form-group">
                  <label for="profContactName">Emergency Contact Name</label>
                  <input type="text" id="profContactName" class="health-input" value="${escapeHtml(HealthState.profile.emergencyContactName)}" />
                </div>
                <div class="health-form-group">
                  <label for="profContactPhone">Emergency Contact Phone</label>
                  <input type="tel" id="profContactPhone" class="health-input" value="${escapeHtml(HealthState.profile.emergencyContactPhone)}" />
                </div>
                <div class="health-form-group">
                  <label for="profBloodType">Blood Type</label>
                  <select id="profBloodType" class="health-select">
                    <option value="">Select blood type</option>
                    ${['A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative', 'O Positive', 'O Negative'].map(bt =>
                      `<option value="${bt}" ${HealthState.profile.bloodType === bt ? 'selected' : ''}>${bt}</option>`
                    ).join('')}
                  </select>
                </div>
                <div class="health-form-group">
                  <label for="profLang">Preferred Healthcare Language</label>
                  <input type="text" id="profLang" class="health-input" value="${escapeHtml(HealthState.profile.preferredLanguage)}" />
                </div>
                <div class="health-form-group full-width">
                  <label for="profNotes">Relevant Health Notes</label>
                  <textarea id="profNotes" class="health-textarea" placeholder="Add voluntary health notes (e.g. chronic conditions, preferences)...">${escapeHtml(HealthState.profile.notes)}</textarea>
                </div>

                <div class="health-form-actions full-width">
                  <span style="font-size: 11px; color: var(--muted); margin-right: auto;">Last updated: ${HealthState.profile.updatedAt}</span>
                  <button type="submit" class="health-btn-primary">Save Profile Changes</button>
                </div>
              </form>
            </div>
          `;

        case 'allergies_conditions':
          let allergiesHtml = HealthState.allergies.map(a => `
            <tr>
              <td><strong>${escapeHtml(a.name)}</strong></td>
              <td><span class="feature-pill-tag">${escapeHtml(a.category)}</span></td>
              <td>${escapeHtml(a.reaction)}</td>
              <td>${escapeHtml(a.recordedDate)}</td>
              <td>
                <button class="health-btn-danger btn-delete-allergy" data-id="${a.id}">Delete</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Add Allergy or Condition</h3>
                  <p class="health-card-desc">Log documented sensitivities or chronic medical diagnoses.</p>
                </div>
              </div>

              <form id="formAddAllergy" class="health-form-grid">
                <div class="health-form-group">
                  <label for="algName">Allergy or Condition Name <span class="required">*</span></label>
                  <input type="text" id="algName" class="health-input" placeholder="e.g. Penicillin, Peanuts, Asthma" required />
                </div>
                <div class="health-form-group">
                  <label for="algCategory">Category</label>
                  <select id="algCategory" class="health-select">
                    <option value="Drug">Drug / Medication</option>
                    <option value="Food">Food</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Chronic Condition">Chronic Condition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="health-form-group full-width">
                  <label for="algReaction">Observed Reaction / Notes</label>
                  <input type="text" id="algReaction" class="health-input" placeholder="e.g. Skin rash, shortness of breath, mild swelling" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add Record</button>
                </div>
              </form>

              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Saved Allergies &amp; Conditions (${HealthState.allergies.length})</h4>
                ${HealthState.allergies.length > 0 ? `
                  <div class="health-records-table-wrap">
                    <table class="health-records-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Reaction</th>
                          <th>Recorded Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>${allergiesHtml}</tbody>
                    </table>
                  </div>
                ` : `
                  <div class="health-empty-state">
                    <div class="health-empty-icon">🛡️</div>
                    <h4>No Allergies Recorded</h4>
                    <p>Add known drug, food, or environmental sensitivities above.</p>
                  </div>
                `}
              </div>
            </div>
          `;

        case 'medications':
          let medsHtml = HealthState.medications.map(m => `
            <tr>
              <td><strong>${escapeHtml(m.name)}</strong></td>
              <td>${escapeHtml(m.strength)}</td>
              <td>${escapeHtml(m.instructions)}</td>
              <td>${escapeHtml(m.prescriber || 'Self')}</td>
              <td>
                <button class="health-btn-danger btn-delete-med" data-id="${m.id}">Delete</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Medication Information</h3>
                  <p class="health-card-desc">Store details copied from your prescription or doctor's instructions.</p>
                </div>
              </div>

              <form id="formAddMedication" class="health-form-grid">
                <div class="health-form-group">
                  <label for="medName">Medication Name <span class="required">*</span></label>
                  <input type="text" id="medName" class="health-input" placeholder="e.g. Amoxicillin, Metformin" required />
                </div>
                <div class="health-form-group">
                  <label for="medStrength">Strength / Formulation</label>
                  <input type="text" id="medStrength" class="health-input" placeholder="e.g. 500 mg capsule, 10 mg tablet" />
                </div>
                <div class="health-form-group full-width">
                  <label for="medInstructions">Dosage Instructions (from prescription) <span class="required">*</span></label>
                  <input type="text" id="medInstructions" class="health-input" placeholder="e.g. 1 capsule twice daily with meals" required />
                </div>
                <div class="health-form-group">
                  <label for="medPrescriber">Prescriber or Clinic</label>
                  <input type="text" id="medPrescriber" class="health-input" placeholder="e.g. Dr. Roberts" />
                </div>
                <div class="health-form-group">
                  <label for="medStartDate">Start Date</label>
                  <input type="date" id="medStartDate" class="health-input" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add Medication</button>
                </div>
              </form>

              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Active Medications List (${HealthState.medications.length})</h4>
                ${HealthState.medications.length > 0 ? `
                  <div class="health-records-table-wrap">
                    <table class="health-records-table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Strength</th>
                          <th>Instructions</th>
                          <th>Prescriber</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>${medsHtml}</tbody>
                    </table>
                  </div>
                ` : `
                  <div class="health-empty-state">
                    <div class="health-empty-icon">💊</div>
                    <h4>No Medications Added</h4>
                    <p>Enter your prescription or over-the-counter medicines to keep track.</p>
                  </div>
                `}
              </div>
            </div>
          `;

        case 'health_documents':
          let docsHtml = HealthState.documents.map(d => `
            <tr>
              <td><strong>${escapeHtml(d.title)}</strong></td>
              <td><span class="feature-pill-tag">${escapeHtml(d.category)}</span></td>
              <td>${escapeHtml(d.docDate)}</td>
              <td>${escapeHtml(d.fileType)} (${escapeHtml(d.fileSize)})</td>
              <td>
                <button class="health-btn-danger btn-delete-doc" data-id="${d.id}">Remove</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Health Document Management</h3>
                  <p class="health-card-desc">Track metadata and organize clinical documents locally.</p>
                </div>
              </div>

              <div class="health-safety-banner" style="margin-bottom: 16px;">
                <div class="banner-icon">🔒</div>
                <p>
                  <strong>Secure Local Demonstration:</strong> File selection records metadata only.
                  Files are <em>never uploaded</em> to an unencrypted public server.
                </p>
              </div>

              <form id="formAddDocument" class="health-form-grid">
                <div class="health-form-group">
                  <label for="docTitle">Document Title <span class="required">*</span></label>
                  <input type="text" id="docTitle" class="health-input" placeholder="e.g. Lipid Profile Lab Results" required />
                </div>
                <div class="health-form-group">
                  <label for="docCategory">Category</label>
                  <select id="docCategory" class="health-select">
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Referral Letter">Referral Letter</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Insurance">Insurance / Coverage</option>
                  </select>
                </div>
                <div class="health-form-group">
                  <label for="docDate">Document Date</label>
                  <input type="date" id="docDate" class="health-input" />
                </div>
                <div class="health-form-group">
                  <label for="docFileInput">Select File (Demo preview)</label>
                  <input type="file" id="docFileInput" class="health-input" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Save Document Entry</button>
                </div>
              </form>

              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Saved Documents (${HealthState.documents.length})</h4>
                ${HealthState.documents.length > 0 ? `
                  <div class="health-records-table-wrap">
                    <table class="health-records-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>File Metadata</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>${docsHtml}</tbody>
                    </table>
                  </div>
                ` : `
                  <div class="health-empty-state">
                    <div class="health-empty-icon">📁</div>
                    <h4>No Documents Recorded</h4>
                    <p>Catalog your clinical records and lab reports above.</p>
                  </div>
                `}
              </div>
            </div>
          `;

        case 'emergency_card':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Emergency Health Information Card</h3>
                  <p class="health-card-desc">Concise summary of user-chosen emergency health information.</p>
                </div>
                <button class="health-btn-secondary" id="btnPrintCard">🖨️ Print / Save</button>
              </div>

              <!-- Emergency Card Preview -->
              <div class="emergency-card-preview" id="emergencyCardBox">
                <div class="emergency-card-header">
                  <div class="emergency-title-box">
                    <div class="emergency-cross">✚</div>
                    <div>
                      <strong style="font-size: 16px; color: #e64d75; display: block;">NOVA 360 AI EMERGENCY CARD</strong>
                      <small style="color: var(--muted); font-size: 10px;">Emergency Medical Summary (Informational Only)</small>
                    </div>
                  </div>
                  <span class="health-badge-pill pink">Active</span>
                </div>

                <div class="emergency-grid-info">
                  <div class="emergency-info-item">
                    <span>Individual Name</span>
                    <strong>${escapeHtml(HealthState.profile.fullName || 'Not provided')}</strong>
                  </div>
                  <div class="emergency-info-item">
                    <span>Date of Birth / Age</span>
                    <strong>${escapeHtml(HealthState.profile.dob || 'Not provided')}</strong>
                  </div>
                  <div class="emergency-info-item">
                    <span>Blood Group</span>
                    <strong style="color: #e64d75;">${escapeHtml(HealthState.profile.bloodType || 'Not specified')}</strong>
                  </div>
                  <div class="emergency-info-item">
                    <span>Emergency Contact</span>
                    <strong>${escapeHtml(HealthState.profile.emergencyContactName || 'None listed')} (${escapeHtml(HealthState.profile.emergencyContactPhone || 'No phone')})</strong>
                  </div>
                  <div class="emergency-info-item" style="grid-column: 1 / -1;">
                    <span>Documented Allergies</span>
                    <strong>${HealthState.allergies.length > 0 ? HealthState.allergies.map(a => `${escapeHtml(a.name)} (${escapeHtml(a.reaction)})`).join(', ') : 'No known allergies recorded'}</strong>
                  </div>
                  <div class="emergency-info-item" style="grid-column: 1 / -1;">
                    <span>Current Medications</span>
                    <strong>${HealthState.medications.length > 0 ? HealthState.medications.map(m => `${escapeHtml(m.name)} ${escapeHtml(m.strength)}`).join(', ') : 'None listed'}</strong>
                  </div>
                </div>

                <div class="emergency-card-disclaimer">
                  ⚠️ <strong>Disclaimer:</strong> This card is an informational reference generated from user-entered data.
                  In a medical emergency, immediately contact local emergency services (e.g. 911 / 112).
                </div>
              </div>
            </div>
          `;

        // --- Sub-Field 2: Health Organizer ---
        case 'medication_reminders':
          let remList = HealthState.reminders.map(r => `
            <tr>
              <td><strong>${escapeHtml(r.medName)}</strong></td>
              <td>${escapeHtml(r.dosage)}</td>
              <td>${escapeHtml(r.time)}</td>
              <td><span class="feature-pill-tag">${escapeHtml(r.frequency)}</span></td>
              <td>
                <button class="health-btn-secondary btn-complete-rem" data-id="${r.id}">Done</button>
                <button class="health-btn-danger btn-delete-rem" data-id="${r.id}">Delete</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Medication Reminders Schedule</h3>
                  <p class="health-card-desc">Set in-app reminder schedules to maintain dosage adherence.</p>
                </div>
              </div>

              <form id="formAddReminder" class="health-form-grid">
                <div class="health-form-group">
                  <label for="remMedName">Medication Name <span class="required">*</span></label>
                  <input type="text" id="remMedName" class="health-input" placeholder="e.g. Cetirizine 10mg" required />
                </div>
                <div class="health-form-group">
                  <label for="remDosage">Dose</label>
                  <input type="text" id="remDosage" class="health-input" placeholder="e.g. 1 tablet" />
                </div>
                <div class="health-form-group">
                  <label for="remTime">Time <span class="required">*</span></label>
                  <input type="time" id="remTime" class="health-input" required />
                </div>
                <div class="health-form-group">
                  <label for="remFreq">Frequency</label>
                  <select id="remFreq" class="health-select">
                    <option value="Daily">Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add Reminder</button>
                </div>
              </form>

              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Active Reminder Schedule</h4>
                <div class="health-records-table-wrap">
                  <table class="health-records-table">
                    <thead>
                      <tr><th>Medication</th><th>Dose</th><th>Time</th><th>Frequency</th><th>Actions</th></tr>
                    </thead>
                    <tbody>${remList}</tbody>
                  </table>
                </div>
              </div>
            </div>
          `;

        case 'vaccination_calendar':
          let calList = HealthState.calendarEvents.map(c => `
            <tr>
              <td><strong>${escapeHtml(c.name)}</strong></td>
              <td><span class="feature-pill-tag">${escapeHtml(c.type)}</span></td>
              <td>${escapeHtml(c.scheduledDate)}</td>
              <td>${escapeHtml(c.provider || '-')}</td>
              <td><span class="health-badge-pill ${c.status === 'Completed' ? 'blue' : 'pink'}">${escapeHtml(c.status)}</span></td>
              <td>
                <button class="health-btn-danger btn-delete-cal" data-id="${c.id}">Remove</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Vaccination &amp; Check-up Calendar</h3>
                  <p class="health-card-desc">Track upcoming clinical checkups, immunizations, and specialist consultations.</p>
                </div>
              </div>

              <form id="formAddCalendar" class="health-form-grid">
                <div class="health-form-group">
                  <label for="calName">Event Name <span class="required">*</span></label>
                  <input type="text" id="calName" class="health-input" placeholder="e.g. Annual Dental Exam, Flu Shot" required />
                </div>
                <div class="health-form-group">
                  <label for="calType">Event Type</label>
                  <select id="calType" class="health-select">
                    <option value="Routine Check-up">Routine Check-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Dental">Dental Visit</option>
                    <option value="Eye Exam">Vision / Eye Exam</option>
                    <option value="Specialist">Specialist Consultation</option>
                  </select>
                </div>
                <div class="health-form-group">
                  <label for="calDate">Scheduled Date <span class="required">*</span></label>
                  <input type="date" id="calDate" class="health-input" required />
                </div>
                <div class="health-form-group">
                  <label for="calProvider">Healthcare Provider</label>
                  <input type="text" id="calProvider" class="health-input" placeholder="e.g. Community Health Clinic" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add to Calendar</button>
                </div>
              </form>

              <div style="margin-top: 24px;">
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Scheduled Healthcare Events</h4>
                <div class="health-records-table-wrap">
                  <table class="health-records-table">
                    <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Provider</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${calList}</tbody>
                  </table>
                </div>
              </div>
            </div>
          `;

        case 'health_habits':
          let habitsHtml = HealthState.habits.map(h => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px;">
              <div>
                <strong style="font-size: 13px; color: var(--text);">${escapeHtml(h.name)}</strong>
                <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">Target: ${escapeHtml(h.target)} (Current: ${escapeHtml(h.current)})</div>
              </div>
              <button class="health-btn-secondary btn-toggle-habit" data-id="${h.id}">
                ${h.completed ? '✅ Completed' : '⭕ Mark Done'}
              </button>
            </div>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Daily Health Habit Tracker</h3>
                  <p class="health-card-desc">Build consistency in walking, hydration, and sleep routines.</p>
                </div>
              </div>

              <form id="formAddHabit" class="health-form-grid" style="margin-bottom: 20px;">
                <div class="health-form-group">
                  <label for="habName">Habit Name <span class="required">*</span></label>
                  <input type="text" id="habName" class="health-input" placeholder="e.g. Evening Stretching, 8k Steps" required />
                </div>
                <div class="health-form-group">
                  <label for="habTarget">Goal / Target</label>
                  <input type="text" id="habTarget" class="health-input" placeholder="e.g. 20 mins, 8 glasses" required />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add New Habit</button>
                </div>
              </form>

              <div>
                <h4 style="margin: 0 0 10px; font-size: 14px; color: var(--text);">Today's Habit Checklist</h4>
                ${habitsHtml}
              </div>
            </div>
          `;

        case 'upcoming_tasks':
        case 'completed_history':
          const isHistory = feature.id === 'completed_history';
          let filteredTasks = HealthState.tasks.filter(t => isHistory ? t.status === 'Completed' : t.status === 'Pending');
          let taskRows = filteredTasks.map(t => `
            <tr>
              <td><strong>${escapeHtml(t.title)}</strong></td>
              <td><span class="feature-pill-tag">${escapeHtml(t.category)}</span></td>
              <td>${escapeHtml(t.dueDate)}</td>
              <td><span class="health-badge-pill ${t.status === 'Completed' ? 'blue' : 'pink'}">${escapeHtml(t.status)}</span></td>
              <td>
                ${!isHistory ? `<button class="health-btn-secondary btn-complete-task" data-id="${t.id}">Mark Done</button>` : ''}
                <button class="health-btn-danger btn-delete-task" data-id="${t.id}">Delete</button>
              </td>
            </tr>
          `).join('');

          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">${isHistory ? 'Completed Tasks &amp; Reminder History' : 'Upcoming Health Tasks'}</h3>
                  <p class="health-card-desc">${isHistory ? 'Review past completed health actions and task milestones.' : 'Track pending clinical tasks and medication errands.'}</p>
                </div>
              </div>

              ${!isHistory ? `
                <form id="formAddTask" class="health-form-grid" style="margin-bottom: 20px;">
                  <div class="health-form-group">
                    <label for="tskTitle">Task Title <span class="required">*</span></label>
                    <input type="text" id="tskTitle" class="health-input" placeholder="e.g. Call pharmacy for refill" required />
                  </div>
                  <div class="health-form-group">
                    <label for="tskCategory">Category</label>
                    <select id="tskCategory" class="health-select">
                      <option value="Medication">Medication</option>
                      <option value="Check-up">Check-up</option>
                      <option value="Records">Records</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div class="health-form-group">
                    <label for="tskDueDate">Due Date <span class="required">*</span></label>
                    <input type="date" id="tskDueDate" class="health-input" required />
                  </div>
                  <div class="health-form-actions full-width">
                    <button type="submit" class="health-btn-primary">+ Add Task</button>
                  </div>
                </form>
              ` : ''}

              <div class="health-records-table-wrap">
                <table class="health-records-table">
                  <thead><tr><th>Task</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>${taskRows.length > 0 ? taskRows : `<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 20px;">No ${isHistory ? 'completed' : 'pending'} tasks found.</td></tr>`}</tbody>
                </table>
              </div>
            </div>
          `;

        // --- Sub-Field 3: Health Information Explainer ---
        case 'ask_health_question':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Ask a Health Question</h3>
                  <p class="health-card-desc">Ask general health and wellbeing questions with tailored explanation depths.</p>
                </div>
              </div>

              <form id="formAskQuestion" style="display: flex; flex-direction: column; gap: 12px;">
                <div class="health-form-group">
                  <label for="healthQuestionInput">Your Health Question <span class="required">*</span></label>
                  <input type="text" id="healthQuestionInput" class="health-input" placeholder="e.g. How does hydration affect daily energy and mental focus?" required />
                </div>
                <div class="health-form-group">
                  <label for="questionDetailLevel">Explanation Level</label>
                  <select id="questionDetailLevel" class="health-select">
                    <option value="Simple">Simple (Accessible plain English)</option>
                    <option value="Detailed" selected>Detailed (Balanced clinical overview)</option>
                    <option value="Technical">Technical (Scientific mechanisms)</option>
                  </select>
                </div>
                <button type="submit" class="health-btn-primary" style="align-self: flex-start;">Send Question to Nova Health AI</button>
              </form>

              <div id="askQuestionResultArea" style="margin-top: 20px; padding: 16px; border-radius: 12px; background: var(--surface-soft); border: 1px solid var(--border);">
                <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase;">Generated Response Preview</div>
                <p id="askQuestionResultText" style="font-size: 13px; line-height: 1.6; color: var(--text); margin: 8px 0;">
                  Submit a question above or select an example prompt from the right-hand Nova Health AI assistant.
                </p>
                <div style="font-size: 10px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 8px;">
                  Notice: Generated information is educational and not diagnostic.
                </div>
              </div>
            </div>
          `;

        case 'medical_terminology':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Medical Terminology Explainer</h3>
                  <p class="health-card-desc">Look up complex clinical jargon and translate it into plain language.</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                <input type="text" id="termSearchInput" class="health-input" placeholder="Enter term (e.g. Hypertension, Arrhythmia, CBC, NPO)..." />
                <button class="health-btn-primary" id="btnExplainTerm">Explain Term</button>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                <span style="font-size: 11px; color: var(--muted); align-self: center;">Popular terms:</span>
                ${['Hypertension', 'Lipid Panel', 'Benign', 'Tachycardia', 'Edema', 'Prognosis'].map(term =>
                  `<button class="feature-pill-btn btn-quick-term" data-term="${term}">${term}</button>`
                ).join('')}
              </div>

              <div id="termResultBox" style="padding: 16px; border-radius: 12px; background: var(--surface-soft); border: 1px solid var(--border);">
                <h4 id="termResultTitle" style="margin: 0 0 6px; color: #e64d75;">Hypertension (Example)</h4>
                <p id="termResultDef" style="font-size: 13px; line-height: 1.6; margin: 0 0 10px; color: var(--text);">
                  <strong>Plain Definition:</strong> Persistently high pressure of blood pushing against the walls of the arteries.
                  Known colloquially as "high blood pressure".
                </p>
                <div style="font-size: 11px; color: var(--muted);">
                  <strong>Suggested clinician question:</strong> "What lifestyle modifications or monitoring routine are appropriate for my pressure readings?"
                </div>
              </div>
            </div>
          `;

        case 'lab_report_explainer':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Lab Report Terminology Explainer</h3>
                  <p class="health-card-desc">Understand common blood test biomarkers and standard reference ranges.</p>
                </div>
              </div>

              <form id="formLabExplain" class="health-form-grid" style="margin-bottom: 20px;">
                <div class="health-form-group">
                  <label for="labTestName">Biomarker / Test Name <span class="required">*</span></label>
                  <input type="text" id="labTestName" class="health-input" placeholder="e.g. Hemoglobin A1c, Total Cholesterol, TSH" required />
                </div>
                <div class="health-form-group">
                  <label for="labTestValue">Your Value</label>
                  <input type="text" id="labTestValue" class="health-input" placeholder="e.g. 5.6" />
                </div>
                <div class="health-form-group">
                  <label for="labTestRange">Report's Reference Range</label>
                  <input type="text" id="labTestRange" class="health-input" placeholder="e.g. 4.0 - 5.6 %" />
                </div>
                <div class="health-form-group">
                  <label for="labTestUnit">Unit</label>
                  <input type="text" id="labTestUnit" class="health-input" placeholder="e.g. %, mg/dL, uIU/mL" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">Interpret Marker Info</button>
                </div>
              </form>

              <div id="labResultBox" style="padding: 16px; border-radius: 12px; background: var(--surface-soft); border: 1px solid var(--border);">
                <div style="font-size: 11px; font-weight: 700; color: #e64d75; text-transform: uppercase;">Biomarker Context</div>
                <h4 id="labMarkerTitle" style="margin: 4px 0 8px; font-size: 15px; color: var(--text);">Hemoglobin A1c (HbA1c)</h4>
                <p id="labMarkerDesc" style="font-size: 12px; line-height: 1.6; margin: 0 0 10px; color: var(--muted);">
                  Reflects the average blood sugar (glucose) level over the past 2 to 3 months. Used as a primary screening and monitoring marker for glucose metabolism.
                </p>
                <div class="health-safety-banner" style="font-size: 11px;">
                  ⚠️ Individual reference ranges vary by testing laboratory and clinical history. Always have lab results reviewed by your ordering physician.
                </div>
              </div>
            </div>
          `;

        case 'reliable_sources':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Reliable Medical Sources Directory</h3>
                  <p class="health-card-desc">Verified peer-reviewed public health organizations and medical libraries.</p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text);">World Health Organization (WHO)</strong>
                    <span class="feature-pill-tag">Global Guidance</span>
                  </div>
                  <p style="font-size: 12px; color: var(--muted); margin: 4px 0 8px;">Official international guidelines on disease prevention, nutrition, and public safety.</p>
                  <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #e64d75; font-weight: 600;">Visit who.int →</a>
                </div>

                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text);">MedlinePlus (National Library of Medicine)</strong>
                    <span class="feature-pill-tag">Patient Health Library</span>
                  </div>
                  <p style="font-size: 12px; color: var(--muted); margin: 4px 0 8px;">Consumer-friendly clinical explanations of medications, symptoms, and surgical procedures.</p>
                  <a href="https://medlineplus.gov" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #e64d75; font-weight: 600;">Visit medlineplus.gov →</a>
                </div>

                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text);">Centers for Disease Control &amp; Prevention (CDC)</strong>
                    <span class="feature-pill-tag">Infectious Disease &amp; Vaccines</span>
                  </div>
                  <p style="font-size: 12px; color: var(--muted); margin: 4px 0 8px;">Authoritative recommendations on immunization schedules, travel health, and chronic illness.</p>
                  <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #e64d75; font-weight: 600;">Visit cdc.gov →</a>
                </div>
              </div>
            </div>
          `;

        case 'clinician_questions':
        case 'questions_builder':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Questions for Healthcare Professionals</h3>
                  <p class="health-card-desc">Prepare and print structured questions to maximize your consultation time.</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                <input type="text" id="customDoctorQuestionInput" class="health-input" placeholder="Add your question (e.g. What are alternative treatment options?)..." />
                <button class="health-btn-primary" id="btnAddDoctorQuestion">+ Add Question</button>
              </div>

              <div id="doctorQuestionsList" style="display: flex; flex-direction: column; gap: 8px;">
                <div style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px;">1. What is the most likely cause of my current symptoms?</span>
                  <button class="health-btn-danger btn-remove-doc-q">Remove</button>
                </div>
                <div style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px;">2. Are there any warning signs or red flags I should monitor at home?</span>
                  <button class="health-btn-danger btn-remove-doc-q">Remove</button>
                </div>
                <div style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px;">3. What are the common side effects of any prescribed medicine?</span>
                  <button class="health-btn-danger btn-remove-doc-q">Remove</button>
                </div>
              </div>
            </div>
          `;

        // --- Sub-Field 4: Daily Wellness Explainer ---
        case 'sleep_planner':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Sleep Routine Planner</h3>
                  <p class="health-card-desc">Calculate sleep cycles and establish an evening wind-down routine.</p>
                </div>
              </div>

              <form id="formSleepPlan" class="health-form-grid" style="margin-bottom: 20px;">
                <div class="health-form-group">
                  <label for="sleepWakeTime">Target Wake-Up Time <span class="required">*</span></label>
                  <input type="time" id="sleepWakeTime" class="health-input" value="06:30" required />
                </div>
                <div class="health-form-group">
                  <label for="sleepHours">Desired Sleep Duration</label>
                  <select id="sleepHours" class="health-select">
                    <option value="7">7 hours (4.6 cycles)</option>
                    <option value="7.5" selected>7.5 hours (5 full 90-min cycles)</option>
                    <option value="8">8 hours</option>
                    <option value="9">9 hours (6 full cycles)</option>
                  </select>
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">Generate Sleep Schedule</button>
                </div>
              </form>

              <div id="sleepScheduleResult" style="padding: 16px; border-radius: 12px; background: var(--surface-soft); border: 1px solid var(--border);">
                <h4 style="margin: 0 0 6px; color: #e64d75;">Calculated Wind-Down Plan</h4>
                <div style="font-size: 13px; line-height: 1.6; color: var(--text);">
                  <div>🌙 <strong>Bedtime:</strong> 11:00 PM (for a 6:30 AM wake-up with 7.5 hours sleep)</div>
                  <div>📱 <strong>Screens Off / Wind-Down:</strong> 10:15 PM (dim blue lights, read, or stretch)</div>
                  <div>☕ <strong>Caffeine Cutoff:</strong> 2:00 PM</div>
                </div>
              </div>
            </div>
          `;

        case 'hydration_reminders':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Hydration Tracker &amp; Reminders</h3>
                  <p class="health-card-desc">Track daily water intake towards a healthy hydration baseline.</p>
                </div>
              </div>

              <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 32px; font-weight: 800; color: #3563ff;" id="waterIntakeDisplay">1,500 / 2,000 ml</div>
                <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">75% of daily target reached</div>

                <div style="max-width: 300px; height: 12px; background: var(--border); border-radius: 6px; margin: 16px auto; overflow: hidden;">
                  <div id="waterProgressBar" style="width: 75%; height: 100%; background: linear-gradient(90deg, #3563ff, #60a5fa); border-radius: 6px;"></div>
                </div>

                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 14px;">
                  <button class="health-btn-primary btn-add-water" data-amount="250">+250 ml (1 glass)</button>
                  <button class="health-btn-secondary btn-add-water" data-amount="500">+500 ml (1 bottle)</button>
                  <button class="health-btn-danger" id="btnResetWater">Reset</button>
                </div>
              </div>
            </div>
          `;

        case 'activity_goals':
        case 'wellness_habits':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Physical Activity &amp; Movement Goals</h3>
                  <p class="health-card-desc">Set aerobic and strength movement targets for the week.</p>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; text-align: center; background: var(--surface-soft);">
                  <div style="font-size: 20px;">🚶</div>
                  <strong style="display: block; font-size: 15px; margin-top: 4px;">6,200 Steps</strong>
                  <small style="color: var(--muted); font-size: 10px;">Goal: 8,000 steps</small>
                </div>
                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; text-align: center; background: var(--surface-soft);">
                  <div style="font-size: 20px;">⏱️</div>
                  <strong style="display: block; font-size: 15px; margin-top: 4px;">25 Mins</strong>
                  <small style="color: var(--muted); font-size: 10px;">Moderate activity</small>
                </div>
                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; text-align: center; background: var(--surface-soft);">
                  <div style="font-size: 20px;">🔥</div>
                  <strong style="display: block; font-size: 15px; margin-top: 4px;">3 / 5 Days</strong>
                  <small style="color: var(--muted); font-size: 10px;">Weekly target</small>
                </div>
              </div>

              <div class="health-safety-banner">
                ⚠️ Automatic sensor tracking requires wearable hardware sync. Records logged here are user-entered estimates.
              </div>
            </div>
          `;

        case 'breathing_exercises':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Breathing &amp; Stress Management Exercises</h3>
                  <p class="health-card-desc">Interactive paced breathing for heart-rate calming and stress regulation.</p>
                </div>
                <select id="breathingTechniqueSelect" class="health-select" style="max-width: 180px;">
                  <option value="box">Box Breathing (4-4-4-4)</option>
                  <option value="478">Relaxation (4-7-8)</option>
                </select>
              </div>

              <div class="breathing-widget">
                <div class="breathing-circle-container">
                  <div class="breathing-outer-ring"></div>
                  <div class="breathing-circle" id="breathingBubble">Ready</div>
                </div>

                <div id="breathingStatusText" style="font-size: 16px; font-weight: 700; color: #e64d75; min-height: 24px;">
                  Press Start to begin
                </div>
                <div id="breathingTimerText" style="font-size: 13px; color: var(--muted); margin-top: 4px;">
                  Cycles completed: 0
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                  <button class="health-btn-primary" id="btnStartBreathing">Start Exercise</button>
                  <button class="health-btn-secondary" id="btnStopBreathing" disabled>Pause</button>
                </div>
              </div>

              <div class="health-safety-banner" style="margin-top: 16px;">
                💡 If experiencing acute chest tightness, pain, or panic symptoms, sit comfortably and consult emergency medical guidance.
              </div>
            </div>
          `;

        // --- Sub-Field 5: Smart Appointment Preparation ---
        case 'appointment_checklist':
        case 'required_documents':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Appointment &amp; Required Documents Checklist</h3>
                  <p class="health-card-desc">Confirm you have all paperwork, IDs, and physical preparations ready.</p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${[
                  'Government Photo ID / Identity Card',
                  'Health Insurance Card & Pre-authorization documents',
                  'Comprehensive medication list with dosages',
                  'Previous relevant lab reports and imaging scans',
                  'List of specific questions and primary concern timeline',
                  'Method of copayment / payment'
                ].map((item, idx) => `
                  <label style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                    <input type="checkbox" style="width: 16px; height: 16px;" ${idx < 3 ? 'checked' : ''} />
                    <span style="font-size: 13px; color: var(--text);">${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;

        case 'symptom_summary':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Symptom &amp; Concern Summary Generator</h3>
                  <p class="health-card-desc">Format your observations into a structured briefing for your doctor.</p>
                </div>
              </div>

              <form id="formSymptomSummary" class="health-form-grid">
                <div class="health-form-group full-width">
                  <label for="symPrimary">Primary Symptom or Health Concern <span class="required">*</span></label>
                  <input type="text" id="symPrimary" class="health-input" placeholder="e.g. Intermittent dull headache in temples" required />
                </div>
                <div class="health-form-group">
                  <label for="symStarted">When did it start?</label>
                  <input type="text" id="symStarted" class="health-input" placeholder="e.g. 5 days ago, last Thursday" />
                </div>
                <div class="health-form-group">
                  <label for="symPattern">Pattern / Frequency</label>
                  <input type="text" id="symPattern" class="health-input" placeholder="e.g. Worse in the late afternoon, daily" />
                </div>
                <div class="health-form-group full-width">
                  <label for="symFactors">What makes it better or worse?</label>
                  <input type="text" id="symFactors" class="health-input" placeholder="e.g. Screen use makes it worse, resting in dark room helps" />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">Generate Clinician Summary</button>
                </div>
              </form>

              <div id="symptomSummaryResult" style="margin-top: 20px; padding: 16px; border-radius: 12px; background: var(--surface-soft); border: 1px solid var(--border);">
                <div style="font-size: 11px; font-weight: 700; color: #e64d75; text-transform: uppercase;">Generated Summary for Doctor</div>
                <div id="symptomSummaryText" style="font-size: 13px; line-height: 1.6; color: var(--text); margin-top: 8px;">
                  Complete the form above to generate an organized brief to share at your appointment.
                </div>
              </div>
            </div>
          `;

        case 'followup_planner':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Follow-up Task Planner</h3>
                  <p class="health-card-desc">Log post-consultation instructions, prescriptions, and return visit dates.</p>
                </div>
              </div>

              <form id="formAddFollowup" class="health-form-grid" style="margin-bottom: 20px;">
                <div class="health-form-group">
                  <label for="folTask">Doctor's Instruction / Task <span class="required">*</span></label>
                  <input type="text" id="folTask" class="health-input" placeholder="e.g. Fasting blood draw in 2 weeks" required />
                </div>
                <div class="health-form-group">
                  <label for="folDate">Target Date <span class="required">*</span></label>
                  <input type="date" id="folDate" class="health-input" required />
                </div>
                <div class="health-form-actions full-width">
                  <button type="submit" class="health-btn-primary">+ Add Follow-up Task</button>
                </div>
              </form>

              <div class="health-records-table-wrap">
                <table class="health-records-table">
                  <thead><tr><th>Follow-up Task</th><th>Due Date</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>Fasting lipid profile test</td><td>2026-11-15</td><td><span class="health-badge-pill pink">Scheduled</span></td></tr>
                    <tr><td>Schedule 6-week review with Dr. Jenkins</td><td>2026-11-28</td><td><span class="health-badge-pill blue">Pending</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          `;

        // --- Sub-Field 6: Healthcare Access Assistant ---
        case 'nearby_facilities':
        case 'find_pharmacies':
          const isPharmacy = feature.id === 'find_pharmacies';
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">${isPharmacy ? 'Find Nearby Pharmacies' : 'Find Nearby Healthcare Facilities'}</h3>
                  <p class="health-card-desc">${isPharmacy ? 'Locate certified 24-hour and standard community dispensaries.' : 'Locate regional community health centers, general hospitals, and urgent care clinics.'}</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-bottom: 16px;">
                <input type="text" id="facilitySearchInput" class="health-input" placeholder="Enter ZIP code, city, or neighborhood..." value="Downtown Metro" />
                <button class="health-btn-primary" id="btnSearchFacilities">Search</button>
              </div>

              <div class="health-safety-banner" style="margin-bottom: 16px; font-size: 11px;">
                ℹ️ <strong>Directory Notice:</strong> Live GPS geocoding requires user location permission. The following listings demonstrate verified healthcare directory structures.
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${isPharmacy ? `
                  <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: var(--text);">MetroCare 24/7 Pharmacy</strong>
                      <span class="health-badge-pill pink">Open 24 Hours</span>
                    </div>
                    <p style="font-size: 12px; color: var(--muted); margin: 4px 0;">415 Health Ave, Suite 101 • 0.8 miles away</p>
                    <div style="font-size: 11px; color: #e64d75; font-weight: 600;">Tel: +1 (555) 890-1234 • Prescription Transfers Available</div>
                  </div>
                  <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: var(--text);">Community Wellness Dispensary</strong>
                      <span class="feature-pill-tag">Closes 9:00 PM</span>
                    </div>
                    <p style="font-size: 12px; color: var(--muted); margin: 4px 0;">782 Pine Street • 1.4 miles away</p>
                    <div style="font-size: 11px; color: #e64d75; font-weight: 600;">Tel: +1 (555) 432-8765</div>
                  </div>
                ` : `
                  <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: var(--text);">City General Hospital &amp; Emergency Department</strong>
                      <span class="health-badge-pill pink">24/7 Emergency</span>
                    </div>
                    <p style="font-size: 12px; color: var(--muted); margin: 4px 0;">100 Hospital Plaza • 2.1 miles away</p>
                    <div style="font-size: 11px; color: #e64d75; font-weight: 600;">Main: +1 (555) 700-0100 • Emergency: Call 911</div>
                  </div>
                  <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong style="color: var(--text);">Central Community Health Clinic</strong>
                      <span class="feature-pill-tag">Primary Care</span>
                    </div>
                    <p style="font-size: 12px; color: var(--muted); margin: 4px 0;">550 Civic Center Blvd • 1.2 miles away</p>
                    <div style="font-size: 11px; color: #e64d75; font-weight: 600;">Appointments: +1 (555) 700-0250 • Sliding-scale fees available</div>
                  </div>
                `}
              </div>
            </div>
          `;

        case 'compare_services':
        case 'public_schemes':
        case 'visit_guidance':
          return `
            <div class="health-card">
              <div class="health-card-header">
                <div>
                  <h3 class="health-card-title">Public Healthcare Schemes &amp; Facilities</h3>
                  <p class="health-card-desc">Compare care pathways and understand public health assistance options.</p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                  <div style="display: flex; justify-content: space-between;">
                    <strong style="color: var(--text);">Primary Care Clinic vs. Urgent Care vs. Emergency Room</strong>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 10px; font-size: 12px;">
                    <div style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
                      <strong>Primary Care</strong>
                      <p style="margin: 4px 0 0; color: var(--muted); font-size: 11px;">Best for routine checkups, ongoing chronic disease management, and referrals.</p>
                    </div>
                    <div style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
                      <strong>Urgent Care</strong>
                      <p style="margin: 4px 0 0; color: var(--muted); font-size: 11px;">Best for minor fractures, stitches, moderate fevers, and minor burns when clinic is closed.</p>
                    </div>
                    <div style="padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
                      <strong style="color: #e64d75;">Emergency Room</strong>
                      <p style="margin: 4px 0 0; color: var(--muted); font-size: 11px;">Reserved for severe chest pain, head injuries, uncontrolled bleeding, and poisoning.</p>
                    </div>
                  </div>
                </div>

                <div style="padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft);">
                  <strong style="color: var(--text);">Public Health Insurance &amp; Assistance Guidance</strong>
                  <p style="font-size: 12px; color: var(--muted); margin: 6px 0 10px;">
                    Government health schemes frequently offer free preventive care, maternal wellness programs, and discounted essential medications.
                  </p>
                  <div style="font-size: 11px; color: #e64d75;">
                    Verify your eligibility at your regional health ministry or municipal social services portal.
                  </div>
                </div>
              </div>
            </div>
          `;

        default:
          return `
            <div class="health-card">
              <h3 class="health-card-title">${escapeHtml(feature.title)}</h3>
              <p class="health-card-desc">${escapeHtml(feature.desc)}</p>
              <div class="health-empty-state">
                <div class="health-empty-icon">💗</div>
                <h4>Feature Ready</h4>
                <p>Use the contextual Nova Health AI assistant on the right for personalized guidance on this topic.</p>
              </div>
            </div>
          `;
      }
    },

    // ==========================================
    // Generate Contextual Nova Health & Wellbeing AI Panel
    // ==========================================
    generateAiSidebarHtml: function (subfield, feature) {
      const chips = FEATURE_AI_CHIPS[feature.id] || [
        'How can I get the most out of this health feature?',
        'What should I discuss with my doctor regarding this topic?',
        'Explain best practices for organizing my records.'
      ];

      const conversationKey = feature.id;
      if (!HealthState.aiConversations[conversationKey]) {
        HealthState.aiConversations[conversationKey] = [
          {
            role: 'assistant',
            content: `Hello! I am **Nova Health & Wellbeing AI**.\n\nI am currently focused on **${feature.title}** (${subfield.title}). How can I assist you with this record or question today?`,
            time: 'Just now'
          }
        ];
      }

      const messages = HealthState.aiConversations[conversationKey];
      let msgsHtml = messages.map(m => `
        <div class="health-ai-msg ${m.role}">
          <div class="health-ai-bubble">${window.renderMarkdown ? window.renderMarkdown(m.content) : escapeHtml(m.content).replace(/\n/g, '<br>')}</div>
        </div>
      `).join('');

      let chipsHtml = chips.map(c => `
        <button class="ai-chip-btn" data-prompt="${escapeHtml(c)}">${escapeHtml(c)}</button>
      `).join('');

      return `
        <div class="health-ai-header">
          <div class="health-ai-avatar">n</div>
          <div class="health-ai-info">
            <strong>Nova Health &amp; Wellbeing AI</strong>
            <span class="health-ai-context-badge">
              <span>●</span> Context: ${escapeHtml(feature.title)}
            </span>
          </div>
          <button class="health-ai-reset-btn" id="btnResetAiChat" title="Reset conversation">↺</button>
        </div>

        <div class="health-ai-chips">
          ${chipsHtml}
        </div>

        <div class="health-ai-messages" id="healthAiMessages">
          ${msgsHtml}
        </div>

        <form class="health-ai-form" id="healthAiForm">
          <input type="text" id="healthAiInput" class="health-ai-input" placeholder="Ask Nova Health AI about ${escapeHtml(feature.title)}..." />
          <button type="submit" class="health-ai-send-btn" id="healthAiSendBtn">↑</button>
        </form>

        <p class="health-ai-disclaimer">
          Educational guidance only. Not diagnostic or medical advice.
        </p>
      `;
    },

    // ==========================================
    // Event Handlers for Forms & Records
    // ==========================================
    bindFeatureSpecificEvents: function (featureId) {
      // Form: Personal Profile
      const formProfile = document.getElementById('formHealthProfile');
      if (formProfile) {
        formProfile.addEventListener('submit', (e) => {
          e.preventDefault();
          HealthState.profile.fullName = document.getElementById('profName').value.trim();
          HealthState.profile.dob = document.getElementById('profDob').value;
          HealthState.profile.emergencyContactName = document.getElementById('profContactName').value.trim();
          HealthState.profile.emergencyContactPhone = document.getElementById('profContactPhone').value.trim();
          HealthState.profile.bloodType = document.getElementById('profBloodType').value;
          HealthState.profile.preferredLanguage = document.getElementById('profLang').value.trim();
          HealthState.profile.notes = document.getElementById('profNotes').value.trim();
          HealthState.profile.updatedAt = new Date().toISOString().split('T')[0];

          if (window.showToast) window.showToast('Profile changes saved successfully.');
          this.renderFeatureWorkspace();
        });

        const btnClearProfile = document.getElementById('btnClearProfile');
        if (btnClearProfile) {
          btnClearProfile.addEventListener('click', () => {
            if (confirm('Clear your personal health profile fields?')) {
              HealthState.profile = {
                fullName: '', dob: '', emergencyContactName: '', emergencyContactPhone: '',
                bloodType: '', preferredLanguage: '', notes: '', updatedAt: new Date().toISOString().split('T')[0]
              };
              if (window.showToast) window.showToast('Health profile cleared.');
              this.renderFeatureWorkspace();
            }
          });
        }
      }

      // Form: Add Allergy
      const formAddAllergy = document.getElementById('formAddAllergy');
      if (formAddAllergy) {
        formAddAllergy.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('algName').value.trim();
          const category = document.getElementById('algCategory').value;
          const reaction = document.getElementById('algReaction').value.trim() || 'Not specified';

          if (!name) return;

          HealthState.allergies.unshift({
            id: 'alg-' + Date.now(),
            name, category, reaction,
            recordedDate: new Date().toISOString().split('T')[0],
            notes: ''
          });

          if (window.showToast) window.showToast(`Added allergy: ${name}`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-delete-allergy').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            HealthState.allergies = HealthState.allergies.filter(a => a.id !== id);
            if (window.showToast) window.showToast('Allergy record removed.');
            this.renderFeatureWorkspace();
          });
        });
      }

      // Form: Add Medication
      const formAddMed = document.getElementById('formAddMedication');
      if (formAddMed) {
        formAddMed.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('medName').value.trim();
          const strength = document.getElementById('medStrength').value.trim() || 'Standard';
          const instructions = document.getElementById('medInstructions').value.trim();
          const prescriber = document.getElementById('medPrescriber').value.trim() || 'Prescribing clinician';
          const startDate = document.getElementById('medStartDate').value || new Date().toISOString().split('T')[0];

          if (!name || !instructions) return;

          HealthState.medications.unshift({
            id: 'med-' + Date.now(),
            name, strength, instructions, prescriber, startDate, endDate: '', notes: ''
          });

          if (window.showToast) window.showToast(`Added medication: ${name}`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-delete-med').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            HealthState.medications = HealthState.medications.filter(m => m.id !== id);
            if (window.showToast) window.showToast('Medication record removed.');
            this.renderFeatureWorkspace();
          });
        });
      }

      // Form: Add Document
      const formAddDoc = document.getElementById('formAddDocument');
      if (formAddDoc) {
        formAddDoc.addEventListener('submit', (e) => {
          e.preventDefault();
          const title = document.getElementById('docTitle').value.trim();
          const category = document.getElementById('docCategory').value;
          const docDate = document.getElementById('docDate').value || new Date().toISOString().split('T')[0];
          const fileInput = document.getElementById('docFileInput');
          const file = fileInput.files && fileInput.files[0];

          HealthState.documents.unshift({
            id: 'doc-' + Date.now(),
            title,
            category,
            docDate,
            fileType: file ? file.type || 'Document' : 'PDF Document (Demo)',
            fileSize: file ? Math.round(file.size / 1024) + ' KB' : '250 KB',
            notes: 'Stored locally in session memory.'
          });

          if (window.showToast) window.showToast(`Cataloged document: ${title}`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-delete-doc').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            HealthState.documents = HealthState.documents.filter(d => d.id !== id);
            if (window.showToast) window.showToast('Document record removed.');
            this.renderFeatureWorkspace();
          });
        });
      }

      // Print Emergency Card
      const btnPrint = document.getElementById('btnPrintCard');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          window.print();
        });
      }

      // Reminders
      const formRem = document.getElementById('formAddReminder');
      if (formRem) {
        formRem.addEventListener('submit', (e) => {
          e.preventDefault();
          const medName = document.getElementById('remMedName').value.trim();
          const dosage = document.getElementById('remDosage').value.trim() || '1 dose';
          const time = document.getElementById('remTime').value;
          const frequency = document.getElementById('remFreq').value;

          HealthState.reminders.push({
            id: 'rem-' + Date.now(),
            medName, dosage, time, frequency, status: 'Active'
          });

          if (window.showToast) window.showToast(`Added reminder for ${medName}`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-delete-rem').forEach(btn => {
          btn.addEventListener('click', () => {
            HealthState.reminders = HealthState.reminders.filter(r => r.id !== btn.dataset.id);
            this.renderFeatureWorkspace();
          });
        });

        document.querySelectorAll('.btn-complete-rem').forEach(btn => {
          btn.addEventListener('click', () => {
            if (window.showToast) window.showToast('Dose recorded as taken.');
          });
        });
      }

      // Calendar events
      const formCal = document.getElementById('formAddCalendar');
      if (formCal) {
        formCal.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('calName').value.trim();
          const type = document.getElementById('calType').value;
          const scheduledDate = document.getElementById('calDate').value;
          const provider = document.getElementById('calProvider').value.trim();

          HealthState.calendarEvents.push({
            id: 'cal-' + Date.now(),
            name, type, scheduledDate, provider, status: 'Upcoming'
          });

          if (window.showToast) window.showToast(`Added ${name} to health calendar.`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-delete-cal').forEach(btn => {
          btn.addEventListener('click', () => {
            HealthState.calendarEvents = HealthState.calendarEvents.filter(c => c.id !== btn.dataset.id);
            this.renderFeatureWorkspace();
          });
        });
      }

      // Habit tracker
      const formHabit = document.getElementById('formAddHabit');
      if (formHabit) {
        formHabit.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('habName').value.trim();
          const target = document.getElementById('habTarget').value.trim();

          HealthState.habits.push({
            id: 'hab-' + Date.now(),
            name, target, current: '0', completed: false
          });

          if (window.showToast) window.showToast(`Added habit: ${name}`);
          this.renderFeatureWorkspace();
        });

        document.querySelectorAll('.btn-toggle-habit').forEach(btn => {
          btn.addEventListener('click', () => {
            const h = HealthState.habits.find(x => x.id === btn.dataset.id);
            if (h) {
              h.completed = !h.completed;
              if (window.showToast) window.showToast(`${h.name} marked ${h.completed ? 'completed' : 'incomplete'}.`);
              this.renderFeatureWorkspace();
            }
          });
        });
      }

      // Tasks
      const formTask = document.getElementById('formAddTask');
      if (formTask) {
        formTask.addEventListener('submit', (e) => {
          e.preventDefault();
          const title = document.getElementById('tskTitle').value.trim();
          const category = document.getElementById('tskCategory').value;
          const dueDate = document.getElementById('tskDueDate').value;

          HealthState.tasks.push({
            id: 'tsk-' + Date.now(),
            title, category, dueDate, status: 'Pending'
          });

          if (window.showToast) window.showToast(`Added task: ${title}`);
          this.renderFeatureWorkspace();
        });
      }

      document.querySelectorAll('.btn-complete-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = HealthState.tasks.find(x => x.id === btn.dataset.id);
          if (t) {
            t.status = 'Completed';
            if (window.showToast) window.showToast(`Task completed: ${t.title}`);
            this.renderFeatureWorkspace();
          }
        });
      });

      document.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.addEventListener('click', () => {
          HealthState.tasks = HealthState.tasks.filter(x => x.id !== btn.dataset.id);
          if (window.showToast) window.showToast('Task removed.');
          this.renderFeatureWorkspace();
        });
      });

      // Hydration quick-add
      document.querySelectorAll('.btn-add-water').forEach(btn => {
        btn.addEventListener('click', () => {
          const amount = parseInt(btn.dataset.amount, 10);
          const display = document.getElementById('waterIntakeDisplay');
          const bar = document.getElementById('waterProgressBar');
          if (display && bar) {
            let current = parseInt(display.textContent.replace(/,/g, ''), 10) || 1500;
            current = Math.min(current + amount, 3500);
            display.textContent = `${current.toLocaleString()} / 2,000 ml`;
            const pct = Math.min(Math.round((current / 2000) * 100), 100);
            bar.style.width = pct + '%';
            if (window.showToast) window.showToast(`+${amount} ml recorded. Stay hydrated!`);
          }
        });
      });

      const btnResetWater = document.getElementById('btnResetWater');
      if (btnResetWater) {
        btnResetWater.addEventListener('click', () => {
          const display = document.getElementById('waterIntakeDisplay');
          const bar = document.getElementById('waterProgressBar');
          if (display && bar) {
            display.textContent = '0 / 2,000 ml';
            bar.style.width = '0%';
            if (window.showToast) window.showToast('Hydration counter reset.');
          }
        });
      }

      // Interactive Breathing Exercise
      const btnStartBreath = document.getElementById('btnStartBreathing');
      const btnStopBreath = document.getElementById('btnStopBreathing');
      const breathBubble = document.getElementById('breathingBubble');
      const breathStatus = document.getElementById('breathingStatusText');
      const breathTimer = document.getElementById('breathingTimerText');

      if (btnStartBreath && btnStopBreath && breathBubble) {
        let breathInterval = null;
        let breathStep = 0;
        let cycles = 0;

        btnStartBreath.addEventListener('click', () => {
          btnStartBreath.disabled = true;
          btnStopBreath.disabled = false;
          breathStep = 0;

          const runStep = () => {
            const technique = document.getElementById('breathingTechniqueSelect')?.value || 'box';
            if (technique === 'box') {
              // 4s Inhale, 4s Hold, 4s Exhale, 4s Hold
              const steps = [
                { text: 'Inhale through nose (4s)', class: 'inhale' },
                { text: 'Hold breath (4s)', class: 'hold' },
                { text: 'Exhale through mouth (4s)', class: 'exhale' },
                { text: 'Hold breath (4s)', class: 'hold' }
              ];
              const cur = steps[breathStep % 4];
              breathStatus.textContent = cur.text;
              breathBubble.className = 'breathing-circle ' + cur.class;
              breathBubble.textContent = cur.class.toUpperCase();
              breathStep++;
              if (breathStep % 4 === 0) {
                cycles++;
                breathTimer.textContent = `Cycles completed: ${cycles}`;
              }
            } else {
              // 4-7-8
              const steps = [
                { text: 'Inhale gently through nose (4s)', class: 'inhale' },
                { text: 'Hold breath peacefully (7s)', class: 'hold' },
                { text: 'Exhale completely with whoosh (8s)', class: 'exhale' }
              ];
              const cur = steps[breathStep % 3];
              breathStatus.textContent = cur.text;
              breathBubble.className = 'breathing-circle ' + cur.class;
              breathBubble.textContent = cur.class.toUpperCase();
              breathStep++;
              if (breathStep % 3 === 0) {
                cycles++;
                breathTimer.textContent = `Cycles completed: ${cycles}`;
              }
            }
          };

          runStep();
          breathInterval = setInterval(runStep, 4000);
        });

        btnStopBreath.addEventListener('click', () => {
          clearInterval(breathInterval);
          btnStartBreath.disabled = false;
          btnStopBreath.disabled = true;
          breathStatus.textContent = 'Exercise paused. Resume whenever ready.';
          breathBubble.className = 'breathing-circle';
          breathBubble.textContent = 'PAUSED';
        });
      }

      // Terminology Explainer
      const btnExplain = document.getElementById('btnExplainTerm');
      const termInput = document.getElementById('termSearchInput');
      if (btnExplain && termInput) {
        const doExplain = (term) => {
          const dict = {
            'hypertension': {
              name: 'Hypertension',
              def: 'Persistently high pressure of blood pushing against the walls of the arteries ("high blood pressure").',
              q: 'What lifestyle modifications or monitoring routine are appropriate for my pressure readings?'
            },
            'lipid panel': {
              name: 'Lipid Panel',
              def: 'A blood test measuring various fats including Total Cholesterol, HDL (good), LDL (bad), and Triglycerides.',
              q: 'What is my overall cardiovascular risk based on these lipid levels?'
            },
            'benign': {
              name: 'Benign',
              def: 'Refers to a condition, tumor, or growth that is non-cancerous and does not spread to surrounding tissues.',
              q: 'Does this benign finding require ongoing monitoring or follow-up imaging?'
            },
            'tachycardia': {
              name: 'Tachycardia',
              def: 'A resting heart rate over 100 beats per minute in adults.',
              q: 'Could caffeine, stress, thyroid, or medication be triggering this elevated heart rate?'
            },
            'edema': {
              name: 'Edema',
              def: 'Swelling caused by excess fluid trapped in your body\'s tissues, frequently in the legs or feet.',
              q: 'What is causing this fluid accumulation, and should I restrict sodium?'
            },
            'prognosis': {
              name: 'Prognosis',
              def: 'A clinician\'s forecast of the likely course and outcome of a condition or disease.',
              q: 'What factors might improve my long-term prognosis and recovery timeline?'
            }
          };

          const key = term.toLowerCase().trim();
          const match = dict[key] || {
            name: term,
            def: `Clinical term for ${term}. In healthcare, precision in terminology ensures accurate treatment coordination.`,
            q: `Could you clarify what ${term} specifically means in the context of my diagnosis?`
          };

          const titleEl = document.getElementById('termResultTitle');
          const defEl = document.getElementById('termResultDef');
          if (titleEl && defEl) {
            titleEl.textContent = match.name;
            defEl.innerHTML = `<strong>Plain Definition:</strong> ${escapeHtml(match.def)}<br><br><strong>Suggested Question for Doctor:</strong> "${escapeHtml(match.q)}"`;
          }
        };

        btnExplain.addEventListener('click', () => {
          if (termInput.value.trim()) doExplain(termInput.value.trim());
        });

        document.querySelectorAll('.btn-quick-term').forEach(btn => {
          btn.addEventListener('click', () => {
            termInput.value = btn.dataset.term;
            doExplain(btn.dataset.term);
          });
        });
      }

      // Symptom Summary
      const formSym = document.getElementById('formSymptomSummary');
      if (formSym) {
        formSym.addEventListener('submit', (e) => {
          e.preventDefault();
          const primary = document.getElementById('symPrimary').value.trim();
          const started = document.getElementById('symStarted').value.trim() || 'Unspecified timeframe';
          const pattern = document.getElementById('symPattern').value.trim() || 'Continuous';
          const factors = document.getElementById('symFactors').value.trim() || 'None reported';

          const textEl = document.getElementById('symptomSummaryText');
          if (textEl) {
            textEl.innerHTML = `
              <strong>Chief Concern:</strong> ${escapeHtml(primary)}<br>
              <strong>Onset &amp; Timeline:</strong> Started approximately ${escapeHtml(started)}<br>
              <strong>Observed Pattern:</strong> ${escapeHtml(pattern)}<br>
              <strong>Aggravating / Relieving Factors:</strong> ${escapeHtml(factors)}<br><br>
              <em>Prepared for doctor consultation. Print or bring to your appointment.</em>
            `;
            if (window.showToast) window.showToast('Clinical summary generated.');
          }
        });
      }

      // Ask Health Question Form
      const formAskQ = document.getElementById('formAskQuestion');
      if (formAskQ) {
        formAskQ.addEventListener('submit', (e) => {
          e.preventDefault();
          const q = document.getElementById('healthQuestionInput').value.trim();
          const lvl = document.getElementById('questionDetailLevel').value;
          if (!q) return;

          const resText = document.getElementById('askQuestionResultText');
          if (resText) {
            resText.textContent = `Consulting Nova Health & Wellbeing AI (${lvl} explanation)...`;
          }

          this.sendAiMessage(q, `[Health Explainer - ${lvl} Mode]`);
        });
      }
    },

    // ==========================================
    // Contextual Nova Health & Wellbeing AI Logic
    // ==========================================
    bindAiSidebarEvents: function (featureId) {
      const form = document.getElementById('healthAiForm');
      const input = document.getElementById('healthAiInput');
      const messagesContainer = document.getElementById('healthAiMessages');
      const resetBtn = document.getElementById('btnResetAiChat');

      if (!form || !input) return;

      // Quick Chips Click
      document.querySelectorAll('.ai-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const prompt = btn.dataset.prompt;
          if (prompt) {
            input.value = prompt;
            input.focus();
            form.requestSubmit();
          }
        });
      });

      // Submit Message
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || HealthState.isAiPending) return;

        input.value = '';
        this.sendAiMessage(text);
      });

      // Reset Chat
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const currentSub = SUBFIELDS.find(s => s.id === HealthState.activeSubfieldId);
          const currentFeature = currentSub?.features.find(f => f.id === HealthState.activeFeatureId);
          HealthState.aiConversations[featureId] = [
            {
              role: 'assistant',
              content: `Conversation reset. I am **Nova Health & Wellbeing AI**, ready to assist with **${currentFeature?.title || 'Health'}**.`,
              time: 'Just now'
            }
          ];
          this.renderFeatureWorkspace();
          if (window.showToast) window.showToast('Conversation cleared.');
        });
      }
    },

    sendAiMessage: async function (text, contextPrefix = '') {
      const featureId = HealthState.activeFeatureId;
      const conversationKey = featureId;
      const currentSub = SUBFIELDS.find(s => s.id === HealthState.activeSubfieldId);
      const currentFeature = currentSub?.features.find(f => f.id === featureId);

      if (!HealthState.aiConversations[conversationKey]) {
        HealthState.aiConversations[conversationKey] = [];
      }

      // Append user message
      HealthState.aiConversations[conversationKey].push({
        role: 'user',
        content: text,
        time: 'Just now'
      });

      // UI Update
      const messagesContainer = document.getElementById('healthAiMessages');
      if (messagesContainer) {
        const userEl = document.createElement('div');
        userEl.className = 'health-ai-msg user';
        userEl.innerHTML = `<div class="health-ai-bubble">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(userEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      // Add temporary loading indicator
      HealthState.isAiPending = true;
      const sendBtn = document.getElementById('healthAiSendBtn');
      if (sendBtn) sendBtn.disabled = true;

      const loadingEl = document.createElement('div');
      loadingEl.className = 'health-ai-msg assistant';
      loadingEl.id = 'healthAiLoadingIndicator';
      loadingEl.innerHTML = `<div class="health-ai-bubble" style="color: var(--muted);"><span class="typing"><i></i><i></i><i></i></span> Thinking...</div>`;
      if (messagesContainer) {
        messagesContainer.appendChild(loadingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      // Construct scoped context prompt for FastAPI backend
      const scopedPrompt = `[Health & Wellbeing Context: ${currentSub?.title} - ${currentFeature?.title}] ${contextPrefix} ${text}`;

      try {
        let replyText = '';
        if (window.getBackendReply) {
          replyText = await window.getBackendReply(scopedPrompt);
        } else {
          // Direct fetch fallback if helper unavailable
          const resp = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: scopedPrompt })
          });
          const data = await resp.json();
          replyText = data.reply || 'No reply received.';
        }

        // Clean loading
        if (loadingEl) loadingEl.remove();

        // Append assistant message
        HealthState.aiConversations[conversationKey].push({
          role: 'assistant',
          content: replyText,
          time: 'Just now'
        });

        if (messagesContainer) {
          const assistEl = document.createElement('div');
          assistEl.className = 'health-ai-msg assistant';
          assistEl.innerHTML = `<div class="health-ai-bubble">${window.renderMarkdown ? window.renderMarkdown(replyText) : escapeHtml(replyText).replace(/\n/g, '<br>')}</div>`;
          messagesContainer.appendChild(assistEl);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Also update result box if in Ask a Question feature
        const askQResult = document.getElementById('askQuestionResultText');
        if (askQResult && featureId === 'ask_health_question') {
          askQResult.innerHTML = window.renderMarkdown ? window.renderMarkdown(replyText) : escapeHtml(replyText).replace(/\n/g, '<br>');
        }
      } catch (err) {
        if (loadingEl) loadingEl.remove();
        console.error('Nova Health AI query error:', err);

        const errorMsg = `⚠️ **Could not connect to Nova 360 AI backend**: ${err.message || 'Server error'}.\n\n*Make sure FastAPI is running on http://127.0.0.1:8000.*`;
        HealthState.aiConversations[conversationKey].push({
          role: 'assistant',
          content: errorMsg,
          time: 'Just now'
        });

        if (messagesContainer) {
          const assistEl = document.createElement('div');
          assistEl.className = 'health-ai-msg assistant';
          assistEl.innerHTML = `<div class="health-ai-bubble" style="border-color: #fca5a5;">${window.renderMarkdown ? window.renderMarkdown(errorMsg) : escapeHtml(errorMsg).replace(/\n/g, '<br>')}</div>`;
          messagesContainer.appendChild(assistEl);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        if (window.showToast) window.showToast('Backend request failed.');
      } finally {
        HealthState.isAiPending = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    }
  };

  // Expose to window for external hooks
  window.HealthModule = HealthModule;

  // Auto-init on DOM readiness
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HealthModule.init());
  } else {
    HealthModule.init();
  }
})();
