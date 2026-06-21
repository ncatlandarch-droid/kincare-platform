/* ========================================
   KinCare — Interactive JavaScript
   Animations, Theme Toggle, Scroll Effects
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Theme Toggle ----------
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Remove any saved dark theme since we're using light mode now
  html.removeAttribute('data-theme');
  localStorage.removeItem('kincare-theme');

  if (themeToggle) {
    const saved = localStorage.getItem('kincare-theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
      themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
    }
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('kincare-theme', next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // ---------- Navbar Scroll Effect ----------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ---------- Mobile Menu ----------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = mobileMenuBtn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ---------- Scroll Reveal Animations ----------
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();
    const suffix = el.textContent.includes('%') ? '%' : target >= 1000 ? '+' : '+';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      if (target >= 10000) {
        el.textContent = (current / 1000).toFixed(current < target ? 1 : 0) + 'K+';
      } else if (target >= 1000) {
        el.textContent = current.toLocaleString() + '+';
      } else {
        el.textContent = current + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Email Signup Form ----------
  const signupForm = document.getElementById('signupForm');
  const signupEmail = document.getElementById('signup-email');

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupEmail.value.trim();
    if (!email) return;

    // Simulate signup
    const btn = signupForm.querySelector('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓ You\'re In!';
    btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
    signupEmail.value = '';
    signupEmail.placeholder = 'Check your inbox! 🎉';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.style.boxShadow = '';
      signupEmail.placeholder = 'Enter your email';
    }, 4000);
  });

  // ---------- Email input focus style ----------
  signupEmail.addEventListener('focus', () => {
    signupEmail.style.borderColor = '#32CD32';
    signupEmail.style.boxShadow = '0 0 0 3px rgba(50, 205, 50, 0.15)';
  });

  signupEmail.addEventListener('blur', () => {
    signupEmail.style.borderColor = '';
    signupEmail.style.boxShadow = '';
  });

  // ---------- Service Cards Tilt Effect ----------
  const serviceCards = document.querySelectorAll('.service-card');

  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---------- Parallax on Hero Orbs ----------
  const orbs = document.querySelectorAll('.hero-orb');

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 15;
      orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  }, { passive: true });

  // ---------- Pricing Card Hover Glow ----------
  const pricingCards = document.querySelectorAll('.pricing-card');

  pricingCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 107, 107, 0.05), var(--bg-card) 50%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // ---------- Active nav link highlighting ----------
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
          link.style.color = '#32CD32';
        }
      }
    });
  }, { passive: true });

});
