/**
 * Nahama — KinCare Unified Bilingual (EN/ES) Voice Concierge & Executive Back-Office Assistant
 * Modes:
 *   1. Public Visitor & Applicant Concierge (EN / ES + Voice TTS + Speech-to-Text Mic)
 *   2. PIN-Protected Executive Co-Pilot for Nahama (Secretary • Accountant/QuickBooks • Smart Scheduler)
 */
(function () {
  'use strict';
  if (document.getElementById('nahama-widget')) return;

  const NAVY = '#0A1628';
  const LIME = '#32CD32';
  const WHITE = '#FFFFFF';
  const AVATAR = 'nahama-avatar.png';

  let currentLang = localStorage.getItem('kincare_lang') || 'en';
  let voiceEnabled = localStorage.getItem('kincare_voice') !== 'off';
  let isExecutiveUnlocked = window.location.pathname.includes('admin.html') || sessionStorage.getItem('kincare_exec_unlocked') === '1';
  let currentMode = isExecutiveUnlocked ? 'secretary' : 'visitor'; // 'visitor' | 'secretary' | 'accountant' | 'scheduler'

  /* ─── Site-Wide Bilingual Navbar & Page Translation Engine ─── */
  const PAGE_TRANSLATIONS = {
    es: {
      'Services': 'Servicios',
      'How It Works': 'Cómo Funciona',
      'Trust & Safety': 'Seguridad',
      'Pricing': 'Precios',
      'Careers': 'Empleos',
      'Community': 'Comunidad',
      'Log In': 'Iniciar Sesión',
      'Get Started': 'Comenzar',
      'Book a Sitter Now →': 'Reservar Cuidador Ahora →',
      'Become a Provider': 'Ser Proveedor ($17–$35/hr)',
      'Apply Now': 'Aplicar Ahora',
      'Submit Application': 'Enviar Solicitud',
      'Request Vetted Caregiver Now': 'Solicitar Cuidador Verificado Ahora'
    },
    en: {
      'Servicios': 'Services',
      'Cómo Funciona': 'How It Works',
      'Seguridad': 'Trust & Safety',
      'Precios': 'Pricing',
      'Empleos': 'Careers',
      'Comunidad': 'Community',
      'Iniciar Sesión': 'Log In',
      'Comenzar': 'Get Started',
      'Reservar Cuidador Ahora →': 'Book a Sitter Now →',
      'Ser Proveedor ($17–$35/hr)': 'Become a Provider',
      'Aplicar Ahora': 'Apply Now',
      'Enviar Solicitud': 'Submit Application',
      'Solicitar Cuidador Verificado Ahora': 'Request Vetted Caregiver Now'
    }
  };

  function applyPageLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kincare_lang', lang);
    const dict = PAGE_TRANSLATIONS[lang] || {};
    document.querySelectorAll('.nav-links a, .nav-cta a, .btn, button[type="submit"]').forEach(el => {
      const txt = el.textContent.trim();
      if (dict[txt]) el.textContent = dict[txt];
    });
    const navToggle = document.getElementById('kincare-nav-lang-btn');
    if (navToggle) navToggle.innerHTML = lang === 'es' ? '🇪🇸 ES | 🇺🇸 EN' : '🇺🇸 EN | 🇪🇸 ES';
    const chatLangBtn = document.getElementById('nahama-lang-btn');
    if (chatLangBtn) chatLangBtn.textContent = lang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN';
  }

  function injectNavbarLangButton() {
    const navInner = document.querySelector('.nav-inner') || document.querySelector('.topbar-actions') || document.querySelector('.topbar');
    if (!navInner || document.getElementById('kincare-nav-lang-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'kincare-nav-lang-btn';
    btn.type = 'button';
    btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:1.5px solid #32CD32;background:rgba(50,205,50,0.12);color:#32CD32;font-weight:700;font-size:0.78rem;cursor:pointer;margin-left:8px;font-family:inherit;white-space:nowrap;';
    btn.innerHTML = currentLang === 'es' ? '🇪🇸 ES | 🇺🇸 EN' : '🇺🇸 EN | 🇪🇸 ES';
    btn.title = 'Switch Language / Cambiar Idioma (English / Español)';
    btn.addEventListener('click', () => {
      const next = currentLang === 'en' ? 'es' : 'en';
      applyPageLanguage(next);
      if (isOpen) {
        showBotMessage(
          next === 'es'
            ? '🇪🇸 <strong>Idioma cambiado a Español.</strong> ¡Hola! Soy Nahama. ¿En qué puedo ayudarte hoy?'
            : '🇺🇸 <strong>Switched to English.</strong> Hi! I\'m Nahama. How can I help you today?',
          getQuickChips()
        );
      }
    });
    navInner.appendChild(btn);
  }

  /* ─── Paloma-Style Neural Voice TTS & Speech Recognition ─── */
  function speakText(htmlText) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const plain = htmlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plain) return;
      const utter = new SpeechSynthesisUtterance(plain);
      utter.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
      utter.rate = 1.02;
      utter.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        currentLang === 'es'
          ? (v.lang.startsWith('es') && /female|paulina|monica|sabina|helena|google/i.test(v.name))
          : (v.lang.startsWith('en') && /aria|jenny|zira|samantha|google us english/i.test(v.name))
      ) || voices.find(v => v.lang.startsWith(currentLang));
      if (preferred) utter.voice = preferred;

      utter.onstart = () => {
        fab.classList.add('is-speaking');
        const hAvatar = widget.querySelector('.nahama-header__avatar');
        if (hAvatar) hAvatar.classList.add('is-speaking');
      };
      utter.onend = utter.onerror = () => {
        fab.classList.remove('is-speaking');
        const hAvatar = widget.querySelector('.nahama-header__avatar');
        if (hAvatar) hAvatar.classList.remove('is-speaking');
      };
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  /* ─── Inject Styles ─── */
  const style = document.createElement('style');
  style.textContent = `
#nahama-widget *, #nahama-widget *::before, #nahama-widget *::after { box-sizing: border-box; margin: 0; padding: 0; }
#nahama-widget { font-family: 'Inter', -apple-system, sans-serif; position: fixed; bottom: 24px; right: 24px; z-index: 10000; }
.nahama-fab {
  position: relative !important; width: 200px !important; height: 200px !important; border-radius: 50% !important;
  border: 5px solid ${LIME} !important; cursor: pointer !important; background: ${NAVY} !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  box-shadow: 0 12px 48px rgba(0,0,0,.6) !important; transition: transform .25s, box-shadow .25s !important; outline: none !important;
}
.nahama-fab:hover { transform: scale(1.05) !important; box-shadow: 0 16px 56px rgba(50,205,50,.5) !important; }
.nahama-fab.is-speaking { box-shadow: 0 0 0 8px rgba(50,205,50,0.35), 0 0 35px #32CD32 !important; }
.nahama-fab__avatar {
  width: 184px !important; height: 184px !important; min-width: 184px !important; min-height: 184px !important;
  border-radius: 50% !important; object-fit: cover !important; pointer-events: none !important; transition: opacity .25s !important;
}
.nahama-fab__close {
  position: absolute !important; display: flex !important; align-items: center !important; justify-content: center !important;
  color: ${WHITE} !important; opacity: 0; transition: opacity .25s; pointer-events: none; background: ${NAVY};
  width: 100% !important; height: 100% !important; border-radius: 50% !important;
}
.nahama-fab.is-open .nahama-fab__avatar { opacity: 0; }
.nahama-fab.is-open .nahama-fab__close  { opacity: 1; }
.nahama-fab::before {
  content: '' !important; position: absolute !important; inset: -10px !important; border-radius: 50% !important;
  border: 5px solid ${LIME} !important; animation: nahamaPulse 2s ease-in-out infinite !important;
}
.nahama-fab.is-open::before { animation: none; opacity: 0; }
@keyframes nahamaPulse { 0% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.15); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
.nahama-panel {
  position: absolute !important; bottom: 215px !important; right: 0 !important; width: 410px; height: 575px;
  border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;
  background: rgba(255,255,255,.97); backdrop-filter: blur(18px);
  box-shadow: 0 16px 56px rgba(0,0,0,.35), 0 0 0 1px rgba(50,205,50,.3);
  transform: translateY(24px) scale(.96); opacity: 0; pointer-events: none; transition: transform .3s, opacity .25s;
}
.nahama-panel.is-visible { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }
.nahama-header {
  background: ${NAVY}; color: ${WHITE}; padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.nahama-header__avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid ${LIME}; flex-shrink: 0; }
.nahama-header__avatar.is-speaking { box-shadow: 0 0 0 4px rgba(50,205,50,0.45); }
.nahama-header__info { flex: 1; min-width: 0; }
.nahama-header__name { font-weight: 700; font-size: 14.5px; }
.nahama-header__sub { font-size: 11px; color: #A0AEC0; display: flex; align-items: center; gap: 5px; }
.nahama-header__dot { width: 7px; height: 7px; border-radius: 50%; background: ${LIME}; display: inline-block; }
.nahama-ctrl-btn {
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2); color: ${WHITE};
  border-radius: 6px; padding: 4px 7px; font-size: 11px; font-weight: 700; cursor: pointer;
}
.nahama-ctrl-btn:hover, .nahama-ctrl-btn.active { background: ${LIME}; color: ${NAVY}; border-color: ${LIME}; }
.nahama-modes {
  background: #111D35; display: flex; gap: 4px; padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,.1); flex-shrink: 0;
}
.nahama-mode-tab {
  flex: 1; text-align: center; padding: 5px 4px; font-size: 11px; font-weight: 700; border-radius: 6px;
  background: rgba(255,255,255,.06); color: #CBD5E1; border: none; cursor: pointer; transition: all .15s;
}
.nahama-mode-tab.active { background: ${LIME}; color: ${NAVY}; }
.nahama-body {
  flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: #F8FAFC;
}
.nahama-msg { display: flex; align-items: flex-end; gap: 8px; max-width: 90%; animation: nahamaFade .2s ease; }
@keyframes nahamaFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.nahama-msg--bot { align-self: flex-start; }
.nahama-msg--user { align-self: flex-end; flex-direction: row-reverse; }
.nahama-msg__avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.nahama-msg__bubble { padding: 10px 13px; border-radius: 14px; font-size: 13px; line-height: 1.48; word-break: break-word; }
.nahama-msg--bot .nahama-msg__bubble { background: ${WHITE}; color: ${NAVY}; border: 1px solid #E2E8F0; border-bottom-left-radius: 4px; }
.nahama-msg--user .nahama-msg__bubble { background: ${NAVY}; color: ${WHITE}; border-bottom-right-radius: 4px; }
.nahama-chips { display: flex; flex-wrap: wrap; gap: 5px; padding-left: 36px; }
.nahama-chip {
  font-size: 11.5px; font-weight: 600; color: ${NAVY}; background: ${WHITE}; border: 1.5px solid ${LIME};
  border-radius: 16px; padding: 5px 11px; cursor: pointer; transition: all .15s;
}
.nahama-chip:hover { background: ${LIME}; color: ${NAVY}; }
.nahama-input { display: flex; align-items: center; gap: 6px; padding: 9px 12px; border-top: 1px solid #E2E8F0; background: ${WHITE}; }
.nahama-input__field {
  flex: 1; border: 1.5px solid #CBD5E1; border-radius: 20px; padding: 8px 13px; font-size: 13px; color: ${NAVY}; outline: none;
}
.nahama-input__field:focus { border-color: ${LIME}; }
.nahama-mic-btn, .nahama-input__send {
  width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.nahama-mic-btn { background: #F1F5F9; color: ${NAVY}; font-size: 15px; }
.nahama-mic-btn.listening { background: #EF4444; color: ${WHITE}; animation: nahamaPulse 1s infinite; }
.nahama-input__send { background: ${LIME}; color: ${NAVY}; font-weight: 700; }
.nahama-footer { text-align: center; font-size: 10.5px; color: #64748B; padding: 4px 10px 7px; background: #F8FAFC; }
@media (max-width: 480px) {
  .nahama-panel { width: 95vw; right: -12px !important; height: 78vh; bottom: 135px !important; }
  .nahama-fab { width: 115px !important; height: 115px !important; }
  .nahama-fab__avatar { width: 103px !important; height: 103px !important; min-width: 103px !important; min-height: 103px !important; }
}
`;
  document.head.appendChild(style);

  /* ─── Build Widget DOM ─── */
  const widget = document.createElement('div');
  widget.id = 'nahama-widget';
  widget.innerHTML = `
    <button class="nahama-fab" aria-label="Chat with Nahama" style="width:200px !important; height:200px !important;">
      <img class="nahama-fab__avatar" src="${AVATAR}" alt="Nahama" style="width:184px !important; height:184px !important; min-width:184px !important; min-height:184px !important;" />
      <span class="nahama-fab__close">✕</span>
    </button>
    <div class="nahama-panel" role="dialog" aria-label="Nahama AI Concierge & Executive Co-Pilot">
      <div class="nahama-header">
        <img class="nahama-header__avatar" src="${AVATAR}" alt="Nahama" />
        <div class="nahama-header__info">
          <div class="nahama-header__name">Nahama AI</div>
          <div class="nahama-header__sub"><span class="nahama-header__dot"></span> <span id="nahama-role-label">KinCare Concierge (EN/ES)</span></div>
        </div>
        <button class="nahama-ctrl-btn" id="nahama-lang-btn" title="Switch English / Español">${currentLang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}</button>
        <button class="nahama-ctrl-btn ${voiceEnabled ? 'active' : ''}" id="nahama-voice-btn" title="Toggle Spoken Voice">${voiceEnabled ? '🔊' : '🔇'}</button>
        <button class="nahama-ctrl-btn" id="nahama-exec-btn" title="Owner Executive Mode (Secretary, Accountant, Scheduler)">🔑</button>
        <button class="nahama-ctrl-btn" id="nahama-close-btn" title="Close">✕</button>
      </div>
      <div class="nahama-modes" id="nahama-modes-bar" style="display:${isExecutiveUnlocked ? 'flex' : 'none'};">
        <button class="nahama-mode-tab ${currentMode === 'visitor' ? 'active' : ''}" data-mode="visitor">👋 Visitor</button>
        <button class="nahama-mode-tab ${currentMode === 'secretary' ? 'active' : ''}" data-mode="secretary">📋 Secretary</button>
        <button class="nahama-mode-tab ${currentMode === 'accountant' ? 'active' : ''}" data-mode="accountant">💰 Accountant</button>
        <button class="nahama-mode-tab ${currentMode === 'scheduler' ? 'active' : ''}" data-mode="scheduler">📅 Scheduler</button>
      </div>
      <div class="nahama-body" id="nahama-body"></div>
      <div class="nahama-input">
        <button class="nahama-mic-btn" id="nahama-mic-btn" title="Speak to Nahama (Voice Input)">🎤</button>
        <input class="nahama-input__field" id="nahama-input-field" type="text" placeholder="Ask anything or give a command..." />
        <button class="nahama-input__send" id="nahama-send-btn">➤</button>
      </div>
      <div class="nahama-footer">KinCare Agency LLC • Bilingual Voice AI &amp; Executive Co-Pilot</div>
    </div>
  `;
  document.body.appendChild(widget);
  injectNavbarLangButton();
  if (currentLang === 'es') applyPageLanguage('es');

  const fab = widget.querySelector('.nahama-fab');
  const panel = widget.querySelector('.nahama-panel');
  const body = widget.querySelector('#nahama-body');
  const input = widget.querySelector('#nahama-input-field');
  const sendBtn = widget.querySelector('#nahama-send-btn');
  const micBtn = widget.querySelector('#nahama-mic-btn');
  const langBtn = widget.querySelector('#nahama-lang-btn');
  const voiceBtn = widget.querySelector('#nahama-voice-btn');
  const execBtn = widget.querySelector('#nahama-exec-btn');
  const closeBtn = widget.querySelector('#nahama-close-btn');
  const modesBar = widget.querySelector('#nahama-modes-bar');
  const roleLabel = widget.querySelector('#nahama-role-label');

  let isOpen = false;
  let hasOpened = false;

  function getQuickChips() {
    if (currentMode === 'secretary') {
      return ['Daily Briefing', 'Draft $35 Checkr Reminder (EN/ES)', 'Draft Welcome Email', 'Company EIN & Articles', 'Export Providers CSV'];
    }
    if (currentMode === 'accountant') {
      return ['Financial Summary', 'Export QuickBooks CSV', '1099-NEC Tax Check', 'Create Client Invoice'];
    }
    if (currentMode === 'scheduler') {
      return ['Match Bilingual Sitter (ES)', 'Match Kid Transport', 'Match Senior Care', 'Show Cleared Roster'];
    }
    if (currentLang === 'es') {
      return ['¿Cómo reservo un cuidador?', 'Quiero trabajar ($17–$35/hr)', '¿Cómo funciona el pago de $35?', 'Cámaras y Seguridad', 'Ayuda Financiera'];
    }
    return ['Book a Caregiver', 'Apply for a Job ($17–$35/hr)', 'How the $35 Checkr Fee Works', 'Body-Cams & Safety', 'Community Care Aid'];
  }

  function showBotMessage(html, chips) {
    body.querySelectorAll('.nahama-chips').forEach(el => el.remove());
    const row = document.createElement('div');
    row.className = 'nahama-msg nahama-msg--bot';
    row.innerHTML = `<img class="nahama-msg__avatar" src="${AVATAR}" alt="Nahama" /><div class="nahama-msg__bubble">${html}</div>`;
    body.appendChild(row);
    if (chips && chips.length) {
      const wrap = document.createElement('div');
      wrap.className = 'nahama-chips';
      chips.forEach(c => {
        const b = document.createElement('button');
        b.className = 'nahama-chip';
        b.textContent = c;
        b.addEventListener('click', () => handleUserInput(c));
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
    }
    body.scrollTop = body.scrollHeight;
    speakText(html);
  }

  function showUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'nahama-msg nahama-msg--user';
    const d = document.createElement('div');
    d.textContent = text;
    row.innerHTML = `<div class="nahama-msg__bubble">${d.innerHTML}</div>`;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function setMode(mode) {
    currentMode = mode;
    modesBar.querySelectorAll('.nahama-mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    const labels = {
      visitor: currentLang === 'es' ? 'Asistente KinCare (ES)' : 'KinCare Concierge (EN/ES)',
      secretary: '📋 Virtual Secretary Mode',
      accountant: '💰 Accountant & QuickBooks',
      scheduler: '📅 Smart Dispatcher'
    };
    roleLabel.textContent = labels[mode] || 'KinCare AI';
    if (mode === 'secretary') {
      const apps = (window.KinCareAutomator && window.KinCareAutomator.getApplicants()) || [];
      const pending = apps.filter(a => a.checkrStatus !== 'passed').length;
      showBotMessage(`📋 <strong>Executive Secretary Active:</strong> Welcome back, Nahama! You currently have <strong>${apps.length} providers</strong> on file (${pending} awaiting Checkr verification). How can I help you manage KinCare Agency LLC today?`, getQuickChips());
    } else if (mode === 'accountant') {
      const invs = (window.KinCareAutomator && window.KinCareAutomator.getInvoices()) || [];
      const total = invs.reduce((s, i) => s + Number(i.amount || 0), 0);
      showBotMessage(`💰 <strong>Virtual Accountant Active:</strong> KinCare Agency LLC (EIN: <code>42-4337623</code>). Tracked Invoices: <strong>$${total.toFixed(2)}</strong> (25% agency net = <strong>$${(total * 0.25).toFixed(2)}</strong>). Click below to export your QuickBooks CSV or check 1099-NEC thresholds.`, getQuickChips());
    } else if (mode === 'scheduler') {
      showBotMessage(`📅 <strong>Smart Scheduler & Dispatcher Active:</strong> Tell me what service or language you need (e.g., <em>"Match Bilingual Sitter"</em> or <em>"Match Senior Care"</em>) and I will rank your Checkr-cleared, 0-strike providers!`, getQuickChips());
    } else {
      showBotMessage(
        currentLang === 'es'
          ? '¡Hola! 👋 Soy <strong>Nahama</strong>, fundadora de <strong>KinCare, LLC</strong>. Puedes escribir o hablarme con el micrófono 🎤. ¿Buscas cuidado para tu familia o deseas aplicar a un empleo ($17–$35/hr)?'
          : 'Hi there! 👋 I\'m <strong>Nahama</strong>, founder of <strong>KinCare, LLC</strong>. You can type or tap the mic 🎤 to talk with me in English or Español! How can I help you today?',
        getQuickChips()
      );
    }
  }

  /* ─── Intelligent Intent Router (Visitor EN/ES + Executive Secretary/Accountant/Scheduler) ─── */
  function generateSmartReply(inputRaw) {
    const q = inputRaw.toLowerCase();
    const cfg = (window.KinCareAutomator && window.KinCareAutomator.getConfig()) || { stripeScreeningLink: 'https://checkout.stripe.com/c/pay/cs_live_kincare_screening_35', ein: '42-4337623', articlesUrl: 'https://drive.google.com/file/d/1TUl8ghMYeKCj2c6dV_nzEa2Ts26EXTn7/view?usp=sharing' };

    // Auto-detect Spanish input
    if (/[áéíóúñ¿¡]|\b(hola|precio|trabajo|empleo|cuanto|cámara|ayuda|español|cuidar)\b/.test(q) && currentLang !== 'es') {
      applyPageLanguage('es');
    }

    // 1. EXECUTIVE SECRETARY / ACCOUNTANT / SCHEDULER INTENTS (when unlocked)
    if (isExecutiveUnlocked) {
      if (q.includes('briefing') || q.includes('summary') && currentMode === 'secretary') {
        const apps = (window.KinCareAutomator && window.KinCareAutomator.getApplicants()) || [];
        const cleared = apps.filter(a => a.checkrStatus === 'passed').length;
        const pending = apps.length - cleared;
        return `📋 <strong>Daily Executive Briefing for Nahama:</strong><br>• <strong>Active Roster:</strong> ${cleared} Checkr-cleared providers<br>• <strong>Pending Screening:</strong> ${pending} applicants awaiting Checkr<br>• <strong>Bilingual (EN/ES) Staff:</strong> ${apps.filter(a => (a.languages || []).includes('Español')).length} providers<br>• <strong>Action Needed:</strong> Send $35 Checkr payment reminders to pending applicants.`;
      }
      if (q.includes('draft $35') || q.includes('reminder')) {
        return `✉️ <strong>Ready-to-Send $35 Checkr Reminder (EN &amp; ES):</strong><br><br><strong>English:</strong> <em>"Hi! Thank you for applying to KinCare Agency LLC. To activate your $17–$35/hr provider profile, please complete your $35 Checkr background check here: ${cfg.stripeScreeningLink}"</em><br><br><strong>Español:</strong> <em>"¡Hola! Gracias por aplicar a KinCare Agency LLC. Para activar tu perfil ($17–$35/hr), completa tu verificación de antecedentes de $35 aquí: ${cfg.stripeScreeningLink}"</em>`;
      }
      if (q.includes('welcome email')) {
        return `🎉 <strong>Approved Provider Welcome Message:</strong><br><em>"Welcome to the KinCare Agency LLC active roster! Your Checkr screening is clear. You start at a guaranteed $17+/hr base plus 100% of family tips. Remember our body-cam safety policy and 3-Strike standard."</em>`;
      }
      if (q.includes('ein') || q.includes('articles') || q.includes('llc')) {
        return `🏢 <strong>Official KinCare Agency LLC Records:</strong><br>• <strong>Entity:</strong> KinCare Agency LLC (NC)<br>• <strong>IRS Federal EIN:</strong> <code>42-4337623</code><br>• <strong>Articles of Organization:</strong> <a href="${cfg.articlesUrl}" target="_blank" style="color:#16A34A;font-weight:700;">Open Official PDF ↗</a>`;
      }
      if (q.includes('export providers')) {
        if (window.KinCareAutomator) window.KinCareAutomator.exportApplicantsCSV();
        return `✅ <strong>Providers CSV Exported!</strong> Check your downloads folder for your Excel-ready provider roster.`;
      }
      if (q.includes('quickbooks') || q.includes('financial summary')) {
        if (q.includes('export') && window.KinCareAutomator) window.KinCareAutomator.exportQuickBooksCSV();
        return `💰 <strong>QuickBooks &amp; Financial Ledger:</strong><br>• <strong>Gross Revenue YTD:</strong> $18,450.00<br>• <strong>1099 Provider Payouts (75%):</strong> $13,837.50<br>• <strong>KinCare Net Commission (25%):</strong> $4,612.50<br>• <strong>Suggested 20% Tax Reserve:</strong> $922.50<br><button onclick="window.KinCareAutomator && window.KinCareAutomator.exportQuickBooksCSV()" style="margin-top:6px;padding:6px 12px;background:#32CD32;color:#0A1628;border:none;border-radius:6px;font-weight:700;cursor:pointer;">📊 Download QuickBooks .CSV Now</button>`;
      }
      if (q.includes('1099')) {
        const apps = (window.KinCareAutomator && window.KinCareAutomator.getApplicants()) || [];
        const over600 = apps.filter(a => (a.ytdEarnings || 0) >= 600);
        return `🏛️ <strong>IRS Form 1099-NEC Tracker (EIN 42-4337623):</strong><br>You have <strong>${over600.length} contractors</strong> over the $600/yr IRS reporting threshold:<br>` + over600.map(a => `• <strong>${a.fullName}</strong>: $${(a.ytdEarnings || 0).toFixed(2)} YTD (${a.tier})`).join('<br>');
      }
      if (q.includes('create client invoice')) {
        if (typeof window.switchView === 'function') window.switchView('invoices', document.querySelector('[data-view=invoices]'));
        return `🧾 I just opened the <strong>Invoices &amp; Billing Generator</strong> for you! Fill in the client name and amount to calculate the 75/25 split and email their invoice.`;
      }
      if (q.includes('match') || q.includes('roster') || currentMode === 'scheduler') {
        const service = q.includes('transport') ? 'Kid Transport' : q.includes('senior') ? 'Senior Companion' : q.includes('pet') ? 'Pet Care' : 'Babysitting';
        const lang = (q.includes('bilingual') || q.includes('es') || q.includes('spanish')) ? 'Español' : '';
        const matches = window.KinCareAutomator ? window.KinCareAutomator.matchProviders({ service, language: lang }) : [];
        if (!matches.length) return `📅 No providers matched that exact filter. Try viewing all providers in the Providers tab.`;
        return `📅 <strong>Top Recommended Providers (${service}${lang ? ' • 🇪🇸 Español' : ''}):</strong><br>` +
          matches.slice(0, 3).map(m => `• <strong>${m.fullName}</strong> (${m.tier} • $${m.baseRate}/hr • ⭐ ${m.rating}) — ${(m.languages || ['English']).join(', ')} [${m.checkrStatus === 'passed' ? '✓ Checkr Clear' : '⏳ Pending'}]`).join('<br>');
      }
    }

    // 2. SPANISH VISITOR & APPLICANT Q&A
    if (currentLang === 'es') {
      if (q.includes('trabaj') || q.includes('emple') || q.includes('aplicar') || q.includes('17') || q.includes('pago')) {
        return `💼 <strong>Empleos en KinCare, LLC ($17–$35/hr + 100% Propinas):</strong><br>• <strong>Pago Base Garantizado:</strong> $17.00/hr mínimo (Nivel Plata para bilingües: $19+/hr, Oro: $22/hr, Platino: $25–$35/hr).<br>• <strong>Propinas:</strong> Te quedas con el 100% de las propinas.<br>• <a href="careers.html#apply" style="color:#16A34A;font-weight:700;">Haz clic aquí para llenar la solicitud en línea ↗</a>`;
      }
      if (q.includes('35') || q.includes('checkr') || q.includes('antecedentes')) {
        return `🛡️ <strong>Verificación de Antecedentes Checkr ($35):</strong><br>Todos los proveedores pasan una verificación nacional Checkr y registro de conducción (MVR). Después de enviar tu solicitud en línea, puedes pagar la tarifa única de $35 aquí:<br><a href="${cfg.stripeScreeningLink}" target="_blank" style="display:inline-block;margin-top:6px;padding:6px 12px;background:#32CD32;color:#0A1628;border-radius:6px;font-weight:700;text-decoration:none;">💳 Pagar $35 de Verificación Checkr</a>`;
      }
      if (q.includes('cámara') || q.includes('seguridad') || q.includes('gps')) {
        return `📹 <strong>Seguridad Triple y Cámaras Corporales:</strong><br>Cada cuidador usa una cámara corporal en vivo y rastreo GPS en tiempo real. Además, aplicamos una política estricta de <strong>3 Faltas (3-Strikes)</strong> para proteger a las familias y trabajadores.`;
      }
      if (q.includes('ayuda') || q.includes('comunidad') || q.includes('descuento')) {
        return `🤝 <strong>Fondo de Cuidado Comunitario:</strong><br>Ofrecemos tarifas reducidas y becas de cuidado para familias trabajadoras. <a href="community.html#apply" style="color:#16A34A;font-weight:700;">Solicita ayuda comunitaria aquí ↗</a>`;
      }
      return `👨‍👩‍👧 <strong>Reservar un Cuidador Verificado:</strong><br>Ofrecemos cuidado de niños, mascotas, transporte infantil, compañía para adultos mayores y tutoría (con proveedores bilingües en inglés y español). <a href="index.html#cta" style="color:#16A34A;font-weight:700;">Solicita un cuidador aquí ↗</a> o escríbenos a <strong>KinCare@gmail.com</strong>.`;
    }

    // 3. ENGLISH VISITOR & APPLICANT Q&A
    if (q.includes('apply') || q.includes('job') || q.includes('career') || q.includes('work') || q.includes('17') || q.includes('tier') || q.includes('pay')) {
      return `💼 <strong>Work with KinCare, LLC ($17–$35/hr + 100% Tips):</strong><br>• <strong>Guaranteed Minimum:</strong> Every provider earns at least <strong>$17.00/hr</strong> base pay + <strong>100% of customer tips</strong>.<br>• <strong>Provider Tiers:</strong> Bronze ($17/hr), Silver ($19/hr — automatic for Bilingual EN/ES!), Gold ($22/hr), Platinum ($25–$35/hr).<br>• <a href="careers.html#apply" style="color:#16A34A;font-weight:700;">Fill out the online application form here ↗</a>`;
    }
    if (q.includes('35') || q.includes('checkr') || q.includes('background') || q.includes('screen')) {
      return `🛡️ <strong>How the $35 Checkr Background Screening Works:</strong><br>1. Fill out the online application on <a href="careers.html#apply" style="color:#16A34A;font-weight:700;">careers.html</a>.<br>2. Click the green Stripe button to pay the one-time <strong>$35 Checkr fee</strong>.<br>3. Checkr runs your national criminal &amp; driving check so you can join the active dispatch roster!<br><a href="${cfg.stripeScreeningLink}" target="_blank" style="display:inline-block;margin-top:6px;padding:6px 12px;background:#32CD32;color:#0A1628;border-radius:6px;font-weight:700;text-decoration:none;">💳 Pay $35 Checkr Screening Fee</a>`;
    }
    if (q.includes('cam') || q.includes('safety') || q.includes('trust') || q.includes('gps') || q.includes('strike')) {
      return `📹 <strong>Body-Cam Verification, Live GPS &amp; 3-Strike Policy:</strong><br>Every KinCare provider is Checkr background-checked, wears a live-streaming body camera during sessions, and is GPS-tracked (<a href="live-tracker.html" style="color:#16A34A;font-weight:700;">View Live Tracker Demo ↗</a>). Both providers and families are held to our strict <strong>3-Strike Safety Policy</strong>.`;
    }
    if (q.includes('community') || q.includes('aid') || q.includes('sliding') || q.includes('donate')) {
      return `🤝 <strong>KinCare Community Care Fund:</strong><br>We offer sliding-scale subsidized care, emergency care grants, and family sponsorships so no family is left behind. <a href="community.html#apply" style="color:#16A34A;font-weight:700;">Apply for assistance or sponsor a family here ↗</a>`;
    }
    if (q.includes('book') || q.includes('price') || q.includes('cost') || q.includes('sitter') || q.includes('service')) {
      return `📅 <strong>Book Vetted Care in 60 Seconds:</strong><br>We cover Babysitting, Pet Care, Kid Transport, Senior Companion Care, Home Help, and Tutoring ($15–$25/hr with Family Plan savings). Bilingual (English/Español) caregivers are available!<br><a href="index.html#cta" style="display:inline-block;margin-top:6px;padding:6px 12px;background:#32CD32;color:#0A1628;border-radius:6px;font-weight:700;text-decoration:none;">📝 Request a Caregiver Now</a>`;
    }

    return `I can help you <strong>book a vetted caregiver</strong>, <strong>apply as a provider ($17–$35/hr)</strong>, complete your <strong>$35 Checkr background check</strong>, or switch to <strong>Español (🇪🇸 ES)</strong>! What would you like to do?`;
  }

  function handleUserInput(text) {
    if (!text || !text.trim()) return;
    const cleaned = text.trim();
    showUserMessage(cleaned);
    setTimeout(() => {
      const reply = generateSmartReply(cleaned);
      showBotMessage(reply, getQuickChips());
    }, 350);
  }

  /* ─── Event Listeners ─── */
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    fab.classList.toggle('is-open', isOpen);
    panel.classList.toggle('is-visible', isOpen);
    if (isOpen && !hasOpened) {
      hasOpened = true;
      setMode(currentMode);
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    fab.classList.remove('is-open');
    panel.classList.remove('is-visible');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  langBtn.addEventListener('click', () => {
    const next = currentLang === 'en' ? 'es' : 'en';
    applyPageLanguage(next);
    setMode(currentMode);
  });

  voiceBtn.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    localStorage.setItem('kincare_voice', voiceEnabled ? 'on' : 'off');
    voiceBtn.textContent = voiceEnabled ? '🔊' : '🔇';
    voiceBtn.classList.toggle('active', voiceEnabled);
    if (!voiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  execBtn.addEventListener('click', () => {
    if (isExecutiveUnlocked) {
      modesBar.style.display = modesBar.style.display === 'none' ? 'flex' : 'none';
      if (currentMode === 'visitor') setMode('secretary');
      return;
    }
    const pin = prompt('🔑 Enter Nahama Owner Passcode (Default: first 4 digits of EIN = 4243):');
    const cfg = (window.KinCareAutomator && window.KinCareAutomator.getConfig()) || { ownerPin: '4243' };
    if (pin === (cfg.ownerPin || '4243')) {
      isExecutiveUnlocked = true;
      sessionStorage.setItem('kincare_exec_unlocked', '1');
      modesBar.style.display = 'flex';
      setMode('secretary');
    } else if (pin !== null) {
      alert('Incorrect passcode.');
    }
  });

  modesBar.querySelectorAll('.nahama-mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  sendBtn.addEventListener('click', () => {
    handleUserInput(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserInput(input.value);
      input.value = '';
    }
  });

  /* ─── Speech-to-Text Microphone ─── */
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      micBtn.classList.remove('listening');
      handleUserInput(transcript);
    };
    rec.onerror = rec.onend = () => micBtn.classList.remove('listening');
    micBtn.addEventListener('click', () => {
      try {
        rec.lang = currentLang === 'es' ? 'es-MX' : 'en-US';
        micBtn.classList.add('listening');
        rec.start();
      } catch (_) { micBtn.classList.remove('listening'); }
    });
  } else {
    micBtn.style.display = 'none';
  }
})();
