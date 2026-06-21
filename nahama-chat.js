/**
 * Nahama Chat — KinCare AI Assistant Widget
 * Self-contained JS file: injects all HTML + CSS.
 * Usage: <script src="nahama-chat.js"></script>
 */
(function () {
  'use strict';

  /* ─── brand tokens ─── */
  const NAVY    = '#0A1628';
  const LIME    = '#32CD32';
  const LIME_DK = '#28a428';
  const WHITE   = '#FFFFFF';
  const CLOUD   = '#F8F9FC';
  const GRAY_BG = '#F3F4F6';
  const GRAY_TX = '#374151';
  const AVATAR  = 'nahama-avatar.png';
  const TYPING_DELAY = 800;

  /* ─── SVG icons (no emojis in UI) ─── */
  const ICON_SEND = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const ICON_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const ICON_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  /* ─── pre-built responses ─── */
  const RESPONSES = {
    'Book a Sitter': {
      text: `Booking a sitter is easy! Head over to your <a href="dashboard.html" target="_blank">KinCare Dashboard</a> where you can browse verified caregivers, view their profiles and reviews, and book in just a few taps. You can filter by availability, experience, and certifications. 💚`,
      chips: ['Find Pet Care', 'How Pricing Works', 'Body Camera Info']
    },
    'Find Pet Care': {
      text: `We love fur-babies too! KinCare offers trusted pet care services including dog walking, overnight stays, and pet sitting. Check out our <a href="#services">Services section</a> to see all pet care options and find a provider near you. 🐾`,
      chips: ['Book a Sitter', 'How Pricing Works', 'Become a Provider']
    },
    'How Pricing Works': {
      text: `Our pricing is transparent and competitive. Rates start based on service type and duration — no hidden fees, ever. Visit the <a href="#pricing">Pricing section</a> for a full breakdown. You only pay for the time you need, and all payments are handled securely through the platform. 💚`,
      chips: ['Book a Sitter', 'Find Pet Care', 'Become a Provider']
    },
    'Become a Provider': {
      text: `Join our community and earn <strong>$18–$35/hr</strong> doing meaningful work! We're looking for babysitters, pet sitters, elder care aides, and more. Visit our <a href="careers.html" target="_blank">Careers page</a> to apply — it takes less than 5 minutes. Background checks and training are provided. 💚`,
      chips: ['How Pricing Works', 'Body Camera Info', 'Book a Sitter']
    },
    'Body Camera Info': {
      text: `Transparency is at the heart of KinCare. Our optional <strong>body camera</strong> feature lets parents live-stream or review recorded sessions for complete peace of mind. Providers wear a small, discreet camera — and families can opt in or out at any time. It's safety you can see. 💚`,
      chips: ['Book a Sitter', 'How Pricing Works', 'Find Pet Care']
    }
  };

  const FALLBACK = {
    text: `Great question! For now, you can explore our services or call us at <strong>(336) 555-CARE</strong>. I'm getting smarter every day! 💚`,
    chips: ['Book a Sitter', 'Find Pet Care', 'How Pricing Works', 'Become a Provider']
  };

  const WELCOME = {
    text: `Hi! I'm Nahama, your KinCare guide. 💚 How can I help you today?`,
    chips: ['Book a Sitter', 'Find Pet Care', 'How Pricing Works', 'Become a Provider', 'Body Camera Info']
  };

  /* ─── inject stylesheet ─── */
  const style = document.createElement('style');
  style.textContent = `
/* === Nahama Chat Widget === */
#nahama-widget *,
#nahama-widget *::before,
#nahama-widget *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#nahama-widget {
  font-family: inherit;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
}

/* ── Floating trigger button ── */
.nahama-fab {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${NAVY};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(0,0,0,.35);
  transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s;
  overflow: visible;
  outline: none;
}
.nahama-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 30px rgba(0,0,0,.45);
}
.nahama-fab:active { transform: scale(.96); }

/* avatar inside fab */
.nahama-fab__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  pointer-events: none;
  transition: opacity .25s;
}
.nahama-fab__close {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${WHITE};
  opacity: 0;
  transition: opacity .25s;
  pointer-events: none;
}
.nahama-fab.is-open .nahama-fab__avatar { opacity: 0; }
.nahama-fab.is-open .nahama-fab__close  { opacity: 1; }

/* pulsing ring */
.nahama-fab::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 3px solid ${LIME};
  animation: nahamaPulse 2s ease-in-out infinite;
}
.nahama-fab.is-open::before { animation: none; opacity: 0; }

@keyframes nahamaPulse {
  0%   { transform: scale(1);   opacity: .85; }
  50%  { transform: scale(1.18); opacity: 0; }
  100% { transform: scale(1);   opacity: 0; }
}

/* tooltip */
.nahama-fab__tip {
  position: absolute;
  right: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(6px);
  background: ${NAVY};
  color: ${WHITE};
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s, transform .2s;
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
}
.nahama-fab__tip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: ${NAVY};
}
.nahama-fab:hover .nahama-fab__tip,
.nahama-fab:focus .nahama-fab__tip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
.nahama-fab.is-open .nahama-fab__tip { display: none; }

/* ── Chat panel ── */
.nahama-panel {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 520px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  box-shadow: 0 12px 48px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.12);
  transform: translateY(24px) scale(.96);
  opacity: 0;
  pointer-events: none;
  transition: transform .35s cubic-bezier(.4,0,.2,1), opacity .3s;
}
.nahama-panel.is-visible {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: auto;
}

/* header */
.nahama-header {
  background: ${NAVY};
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.nahama-header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,.15);
}
.nahama-header__info {
  flex: 1;
  min-width: 0;
}
.nahama-header__name {
  color: ${WHITE};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}
.nahama-header__sub {
  color: rgba(255,255,255,.6);
  font-size: 12px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.nahama-header__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${LIME};
  display: inline-block;
  box-shadow: 0 0 6px ${LIME};
}
.nahama-header__close {
  background: none;
  border: none;
  color: rgba(255,255,255,.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color .2s, background .2s;
}
.nahama-header__close:hover {
  color: ${WHITE};
  background: rgba(255,255,255,.1);
}

/* messages area */
.nahama-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: ${WHITE};
  scroll-behavior: smooth;
}
.nahama-body::-webkit-scrollbar { width: 5px; }
.nahama-body::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,.12);
  border-radius: 10px;
}

/* message row */
.nahama-msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 88%;
  animation: nahamaFadeUp .3s ease-out both;
}
.nahama-msg--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.nahama-msg--bot {
  align-self: flex-start;
}

@keyframes nahamaFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.nahama-msg__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.nahama-msg__bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}
.nahama-msg--bot .nahama-msg__bubble {
  background: ${GRAY_BG};
  color: ${GRAY_TX};
  border-bottom-left-radius: 4px;
}
.nahama-msg--bot .nahama-msg__bubble a {
  color: ${LIME_DK};
  font-weight: 600;
  text-decoration: none;
}
.nahama-msg--bot .nahama-msg__bubble a:hover {
  text-decoration: underline;
}
.nahama-msg--user .nahama-msg__bubble {
  background: ${LIME};
  color: ${WHITE};
  border-bottom-right-radius: 4px;
}

/* typing indicator */
.nahama-typing {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  align-self: flex-start;
  max-width: 88%;
  animation: nahamaFadeUp .3s ease-out both;
}
.nahama-typing__dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: ${GRAY_BG};
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}
.nahama-typing__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9CA3AF;
  animation: nahamaBounce 1.2s ease-in-out infinite;
}
.nahama-typing__dot:nth-child(2) { animation-delay: .15s; }
.nahama-typing__dot:nth-child(3) { animation-delay: .3s; }

@keyframes nahamaBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-6px); }
}

/* quick-reply chips */
.nahama-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 10px 36px;
  animation: nahamaFadeUp .35s ease-out both;
}
.nahama-chip {
  background: ${WHITE};
  color: ${NAVY};
  border: 1.5px solid #D1D5DB;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, border-color .2s, color .2s, transform .15s;
  white-space: nowrap;
  outline: none;
}
.nahama-chip:hover {
  background: ${LIME};
  color: ${WHITE};
  border-color: ${LIME};
  transform: translateY(-1px);
}
.nahama-chip:active { transform: scale(.96); }

/* input bar */
.nahama-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: ${CLOUD};
  border-top: 1px solid #E5E7EB;
  flex-shrink: 0;
}
.nahama-input__field {
  flex: 1;
  border: 1.5px solid #D1D5DB;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background: ${WHITE};
  color: ${NAVY};
  transition: border-color .2s, box-shadow .2s;
}
.nahama-input__field::placeholder {
  color: #9CA3AF;
}
.nahama-input__field:focus {
  border-color: ${LIME};
  box-shadow: 0 0 0 3px rgba(50,205,50,.15);
}
.nahama-input__send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${LIME};
  color: ${WHITE};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s, transform .15s;
  flex-shrink: 0;
}
.nahama-input__send:hover { background: ${LIME_DK}; }
.nahama-input__send:active { transform: scale(.92); }

/* branding footer */
.nahama-footer {
  text-align: center;
  padding: 6px 0 8px;
  font-size: 10px;
  color: #9CA3AF;
  background: ${CLOUD};
  flex-shrink: 0;
  letter-spacing: .3px;
}

/* mobile responsive */
@media (max-width: 480px) {
  #nahama-widget { bottom: 0; right: 0; }
  .nahama-panel {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
  .nahama-fab {
    bottom: 16px;
    right: 16px;
    position: fixed;
  }
}
`;
  document.head.appendChild(style);

  /* ─── build DOM ─── */
  const widget = document.createElement('div');
  widget.id = 'nahama-widget';
  widget.innerHTML = `
    <!-- Floating Action Button -->
    <button class="nahama-fab" aria-label="Chat with Nahama">
      <img class="nahama-fab__avatar" src="${AVATAR}" alt="Nahama" />
      <span class="nahama-fab__close">${ICON_CLOSE}</span>
      <span class="nahama-fab__tip">Chat with Nahama</span>
    </button>

    <!-- Chat Panel -->
    <div class="nahama-panel" role="dialog" aria-label="Chat with Nahama">
      <!-- Header -->
      <div class="nahama-header">
        <img class="nahama-header__avatar" src="${AVATAR}" alt="Nahama" />
        <div class="nahama-header__info">
          <div class="nahama-header__name">Nahama</div>
          <div class="nahama-header__sub"><span class="nahama-header__dot"></span> KinCare Assistant</div>
        </div>
        <button class="nahama-header__close" aria-label="Close chat">${ICON_CLOSE}</button>
      </div>

      <!-- Messages -->
      <div class="nahama-body"></div>

      <!-- Input -->
      <div class="nahama-input">
        <input class="nahama-input__field" type="text" placeholder="Type a message..." aria-label="Type a message" />
        <button class="nahama-input__send" aria-label="Send message">${ICON_SEND}</button>
      </div>

      <!-- Footer -->
      <div class="nahama-footer">Powered by KinCare AI</div>
    </div>
  `;
  document.body.appendChild(widget);

  /* ─── element refs ─── */
  const fab      = widget.querySelector('.nahama-fab');
  const panel    = widget.querySelector('.nahama-panel');
  const body     = widget.querySelector('.nahama-body');
  const input    = widget.querySelector('.nahama-input__field');
  const sendBtn  = widget.querySelector('.nahama-input__send');
  const closeBtn = widget.querySelector('.nahama-header__close');

  let isOpen      = false;
  let hasOpened   = false;
  let isTyping    = false;

  /* ─── notification sound (Web Audio API) ─── */
  function playDing() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) { /* silent fail */ }
  }

  /* ─── toggle chat ─── */
  function toggleChat() {
    isOpen = !isOpen;
    fab.classList.toggle('is-open', isOpen);
    panel.classList.toggle('is-visible', isOpen);
    if (isOpen) {
      if (!hasOpened) {
        hasOpened = true;
        showBotMessage(WELCOME.text, WELCOME.chips);
      }
      setTimeout(() => input.focus(), 350);
    }
  }

  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  /* ─── scroll helper ─── */
  function scrollBottom() {
    requestAnimationFrame(() => {
      body.scrollTop = body.scrollHeight;
    });
  }

  /* ─── append user message ─── */
  function showUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'nahama-msg nahama-msg--user';
    row.innerHTML = `<div class="nahama-msg__bubble">${escapeHTML(text)}</div>`;
    body.appendChild(row);
    scrollBottom();
  }

  /* ─── append bot message ─── */
  function showBotMessage(html, chips) {
    const row = document.createElement('div');
    row.className = 'nahama-msg nahama-msg--bot';
    row.innerHTML = `
      <img class="nahama-msg__avatar" src="${AVATAR}" alt="Nahama" />
      <div class="nahama-msg__bubble">${html}</div>
    `;
    body.appendChild(row);

    if (chips && chips.length) {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'nahama-chips';
      chips.forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'nahama-chip';
        btn.textContent = label;
        btn.addEventListener('click', () => handleUserInput(label));
        chipWrap.appendChild(btn);
      });
      body.appendChild(chipWrap);
    }

    scrollBottom();
    playDing();
  }

  /* ─── typing indicator ─── */
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'nahama-typing';
    el.id = 'nahama-typing-indicator';
    el.innerHTML = `
      <img class="nahama-msg__avatar" src="${AVATAR}" alt="Nahama" />
      <div class="nahama-typing__dots">
        <span class="nahama-typing__dot"></span>
        <span class="nahama-typing__dot"></span>
        <span class="nahama-typing__dot"></span>
      </div>
    `;
    body.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('nahama-typing-indicator');
    if (el) el.remove();
  }

  /* ─── handle input ─── */
  function handleUserInput(text) {
    if (!text.trim() || isTyping) return;
    const cleaned = text.trim();

    /* remove any existing chip rows so they don't pile up */
    body.querySelectorAll('.nahama-chips').forEach(el => el.remove());

    showUserMessage(cleaned);

    isTyping = true;
    showTyping();

    const match = RESPONSES[cleaned] || FALLBACK;

    setTimeout(() => {
      hideTyping();
      showBotMessage(match.text, match.chips);
      isTyping = false;
    }, TYPING_DELAY);
  }

  /* ─── send via button / Enter ─── */
  sendBtn.addEventListener('click', () => {
    handleUserInput(input.value);
    input.value = '';
    input.focus();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(input.value);
      input.value = '';
    }
  });

  /* ─── util ─── */
  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
})();
