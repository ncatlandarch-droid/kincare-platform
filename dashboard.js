/* ========================================
   KinCare Dashboard — Interactive Logic
   DoorDash/Uber Eats Style Booking App
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== PROVIDER DATA =====
  const providers = [
    { id: 1, name: "Aisha Williams", emoji: "👩🏾", category: "baby", services: ["Babysitting", "Newborn Care"], rating: 4.9, reviews: 127, rate: 22, eta: 8, distance: 0.4, bio: "Certified pediatric nurse with 6 years of babysitting experience. CPR & First Aid certified. Specializes in infant and toddler care.", badges: ["Background Checked", "CPR Certified", "ID Verified"], status: "available", pin: { top: "25%", left: "55%" } },
    { id: 2, name: "Marcus Johnson", emoji: "👨🏾", category: "pet", services: ["Dog Walking", "Pet Sitting", "Overnight Boarding"], rating: 4.8, reviews: 89, rate: 18, eta: 12, distance: 0.7, bio: "Lifelong animal lover and certified dog trainer. Experienced with all breeds. Your fur babies are in great hands.", badges: ["Background Checked", "Pet CPR", "ID Verified"], status: "available", pin: { top: "35%", left: "30%" } },
    { id: 3, name: "Sofia Rodriguez", emoji: "👩🏽", category: "baby", services: ["Babysitting", "After-School Care", "Homework Help"], rating: 5.0, reviews: 203, rate: 25, eta: 5, distance: 0.2, bio: "Bilingual (English/Spanish) education student at UNCC. 4 years experience with children ages 2-12. Activities, homework help, and endless patience.", badges: ["Background Checked", "CPR Certified", "ID Verified", "Top Rated"], status: "available", pin: { top: "42%", left: "60%" } },
    { id: 4, name: "James Chen", emoji: "👨🏻", category: "tutor", services: ["Math Tutoring", "Science Tutoring", "Test Prep"], rating: 4.9, reviews: 156, rate: 30, eta: 15, distance: 1.2, bio: "Duke University grad with a passion for making STEM fun. Specializes in middle and high school math, AP Physics, and SAT prep.", badges: ["Background Checked", "Teaching Cert", "ID Verified"], status: "available", pin: { top: "20%", left: "75%" } },
    { id: 5, name: "Destiny Parker", emoji: "👩🏾", category: "baby", services: ["Babysitting", "Infant Specialist"], rating: 4.7, reviews: 64, rate: 20, eta: 18, distance: 1.5, bio: "Mother of 3, experienced with newborns and toddlers. Calm, nurturing, and highly reliable. Available for date nights and emergencies.", badges: ["Background Checked", "CPR Certified", "ID Verified"], status: "available", pin: { top: "70%", left: "25%" } },
    { id: 6, name: "Tyler Brooks", emoji: "👨🏼", category: "transport", services: ["School Pickup", "Activity Shuttle", "Carpool"], rating: 4.8, reviews: 92, rate: 15, eta: 10, distance: 0.8, bio: "Clean driving record, 5-star safety rating. Reliable school pickup and activity transport. Real-time GPS tracking on every trip.", badges: ["Background Checked", "License Verified", "Vehicle Inspected"], status: "available", pin: { top: "60%", left: "50%" } },
    { id: 7, name: "Nina Patel", emoji: "👩🏽", category: "senior", services: ["Companion Visits", "Med Reminders", "Errands"], rating: 5.0, reviews: 178, rate: 24, eta: 20, distance: 1.8, bio: "Former home health aide with 8 years of elder care experience. Compassionate, patient, and trained in medication management.", badges: ["Background Checked", "CNA Certified", "ID Verified"], status: "available", pin: { top: "15%", left: "40%" } },
    { id: 8, name: "DeAndre Mitchell", emoji: "👨🏾", category: "pet", services: ["Dog Walking", "Cat Sitting"], rating: 4.6, reviews: 45, rate: 16, eta: 7, distance: 0.3, bio: "College athlete who loves dogs. Energetic walks and plenty of playtime guaranteed. Available mornings and evenings.", badges: ["Background Checked", "ID Verified"], status: "available", pin: { top: "50%", left: "70%" } },
    { id: 9, name: "Emma Thompson", emoji: "👩🏼", category: "home", services: ["Errand Running", "Grocery Pickup", "Light Cleaning"], rating: 4.9, reviews: 134, rate: 20, eta: 14, distance: 1.0, bio: "Organized, efficient, and detail-oriented. I handle your to-do list so you can focus on what matters. Errands, groceries, meal prep — I've got it.", badges: ["Background Checked", "ID Verified", "Top Rated"], status: "available", pin: { top: "80%", left: "55%" } },
    { id: 10, name: "Carlos Mendez", emoji: "👨🏽", category: "tutor", services: ["Spanish Tutoring", "Reading Help", "ESL"], rating: 4.8, reviews: 67, rate: 28, eta: 22, distance: 2.0, bio: "Native Spanish speaker and certified ESL teacher. I make language learning fun and interactive for all ages.", badges: ["Background Checked", "Teaching Cert", "ID Verified"], status: "available", pin: { top: "30%", left: "15%" } },
    { id: 11, name: "Keisha Brown", emoji: "👩🏾", category: "baby", services: ["Babysitting", "Overnight Care"], rating: 4.9, reviews: 211, rate: 24, eta: 9, distance: 0.5, bio: "10+ years of professional childcare experience. Former preschool teacher. Your kids will be safe, entertained, and loved.", badges: ["Background Checked", "CPR Certified", "ID Verified", "Top Rated"], status: "available", pin: { top: "55%", left: "35%" } },
    { id: 12, name: "Ryan O'Brien", emoji: "👨🏻", category: "home", services: ["Handyman", "Furniture Assembly", "Yard Work"], rating: 4.7, reviews: 78, rate: 25, eta: 25, distance: 2.2, bio: "Jack of all trades — furniture assembly, minor repairs, yard work, and more. Reliable, friendly, and always on time.", badges: ["Background Checked", "ID Verified", "Insured"], status: "available", pin: { top: "75%", left: "80%" } },
  ];

  const categoryMap = {
    baby: { label: "Babysitting", color: "#FF6B6B", pinClass: "pin-baby" },
    pet: { label: "Pet Care", color: "#3B82F6", pinClass: "pin-pet" },
    transport: { label: "Transport", color: "#10B981", pinClass: "pin-transport" },
    home: { label: "Home Help", color: "#F59E0B", pinClass: "pin-home" },
    tutor: { label: "Tutoring", color: "#8B5CF6", pinClass: "pin-tutor" },
    senior: { label: "Senior Care", color: "#EC4899", pinClass: "pin-senior" },
  };

  const reviewBank = [
    { stars: "★★★★★", text: "Absolutely wonderful! My kids didn't want them to leave.", author: "Sarah M." },
    { stars: "★★★★★", text: "So reliable and professional. Booking again next week!", author: "Mike T." },
    { stars: "★★★★☆", text: "Great experience overall. Very communicative.", author: "Lisa K." },
  ];

  // ===== DOM REFS =====
  const providersGrid = document.getElementById('providersGrid');
  const mapPins = document.getElementById('mapPins');
  const categoryBar = document.getElementById('categoryBar');
  const providerCount = document.getElementById('providerCount');
  const mapCount = document.getElementById('mapCount');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerHeader = document.getElementById('drawerHeader');
  const drawerBody = document.getElementById('drawerBody');
  const drawerFooter = document.getElementById('drawerFooter');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const searchInput = document.getElementById('searchInput');

  let activeCategory = 'all';
  let activeSearch = '';

  // ===== RENDER PROVIDERS =====
  function renderProviders(filter = 'all', search = '') {
    let filtered = providers;
    if (filter !== 'all') filtered = filtered.filter(p => p.category === filter);
    if (search) filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.services.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );

    providerCount.textContent = `${filtered.length} available`;
    mapCount.textContent = filtered.length;

    // Cards
    providersGrid.innerHTML = filtered.map(p => {
      const cat = categoryMap[p.category];
      const badgeType = p.rating >= 4.9 ? 'badge-top' : 'badge-available';
      const badgeText = p.rating >= 4.9 ? '⭐ Top Rated' : '🟢 Available';
      return `
        <div class="provider-card" data-id="${p.id}" onclick="window.openDrawer(${p.id})">
          <div class="provider-card-image" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}11);">
            <span>${p.emoji}</span>
            <span class="provider-card-badge ${badgeType}">${badgeText}</span>
            <button class="provider-card-fav" onclick="event.stopPropagation(); this.classList.toggle('liked'); this.textContent = this.classList.contains('liked') ? '❤️' : '🤍'">🤍</button>
          </div>
          <div class="provider-card-body">
            <div class="provider-card-top">
              <span class="provider-card-name">${p.name}</span>
              <span class="provider-card-rating"><span class="star">★</span> ${p.rating}</span>
            </div>
            <div class="provider-card-services">
              ${p.services.map(s => `<span class="tag">${s}</span>`).join('')}
            </div>
            <div class="provider-card-meta">
              <span class="provider-card-price">$${p.rate}<span>/hr</span></span>
              <span class="provider-card-eta"><span class="eta-dot"></span> ${p.eta} min away</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Map Pins
    mapPins.innerHTML = filtered.map(p => {
      const cat = categoryMap[p.category];
      return `<div class="map-pin ${cat.pinClass}" style="top:${p.pin.top};left:${p.pin.left};" title="${p.name} — ${cat.label}" onclick="window.openDrawer(${p.id})">${p.emoji}</div>`;
    }).join('');
  }

  // ===== CATEGORY FILTER =====
  categoryBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    categoryBar.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeCategory = pill.dataset.category;
    renderProviders(activeCategory, activeSearch);
  });

  // ===== FILTER CHIPS =====
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ===== SEARCH =====
  searchInput.addEventListener('input', (e) => {
    activeSearch = e.target.value;
    renderProviders(activeCategory, activeSearch);
  });

  // ===== PROVIDER DRAWER =====
  window.openDrawer = function(id) {
    const p = providers.find(pr => pr.id === id);
    if (!p) return;
    const cat = categoryMap[p.category];

    drawerHeader.style.background = `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`;
    drawerHeader.querySelector('.drawer-close').insertAdjacentHTML('afterend', '');

    // Clear and rebuild
    const existingEmoji = drawerHeader.querySelector('.drawer-emoji');
    if (existingEmoji) existingEmoji.remove();
    drawerHeader.insertAdjacentHTML('beforeend', `<span class="drawer-emoji" style="font-size:5rem;position:relative;z-index:1">${p.emoji}</span>`);

    document.getElementById('drawerVerified').innerHTML = p.badges.map(b => 
      `<span class="verified-badge">✅ ${b}</span>`
    ).join('');

    drawerBody.innerHTML = `
      <h2 class="drawer-name">${p.name}</h2>
      <p class="drawer-tagline">${cat.label} • ${p.distance} mi away • Available now</p>
      
      <div class="drawer-stats">
        <div class="drawer-stat">
          <div class="drawer-stat-val">${p.rating}</div>
          <div class="drawer-stat-label">Rating</div>
        </div>
        <div class="drawer-stat">
          <div class="drawer-stat-val">${p.reviews}</div>
          <div class="drawer-stat-label">Reviews</div>
        </div>
        <div class="drawer-stat">
          <div class="drawer-stat-val">${p.eta} min</div>
          <div class="drawer-stat-label">ETA</div>
        </div>
        <div class="drawer-stat">
          <div class="drawer-stat-val">$${p.rate}</div>
          <div class="drawer-stat-label">Per Hour</div>
        </div>
      </div>

      <div class="drawer-section">
        <h4>About</h4>
        <p>${p.bio}</p>
      </div>

      <div class="drawer-section">
        <h4>Services</h4>
        <div class="drawer-services-list">
          ${p.services.map(s => `<span class="drawer-service-tag">${s}</span>`).join('')}
        </div>
      </div>

      <div class="drawer-section">
        <h4>Recent Reviews</h4>
        <div class="drawer-reviews">
          ${reviewBank.map(r => `
            <div class="mini-review">
              <div class="mini-review-stars">${r.stars}</div>
              <div class="mini-review-text">"${r.text}"</div>
              <div class="mini-review-author">— ${r.author}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    drawerFooter.innerHTML = `
      <div class="drawer-footer-row">
        <span class="drawer-price">$${p.rate}<span>/hr</span></span>
        <span class="drawer-eta-label"><span class="eta-dot"></span> ${p.eta} min away</span>
      </div>
      <button class="drawer-book-btn" onclick="window.bookProvider(${p.id})">
        Book ${p.name.split(' ')[0]} Now →
      </button>
    `;

    drawerOverlay.classList.add('open');
    drawer.classList.add('open');
  };

  function closeDrawer() {
    drawerOverlay.classList.remove('open');
    drawer.classList.remove('open');
  }

  drawerOverlay.addEventListener('click', closeDrawer);
  drawerClose.addEventListener('click', closeDrawer);

  // ===== BOOKING FLOW =====
  window.bookProvider = function(id) {
    const p = providers.find(pr => pr.id === id);
    if (!p) return;
    closeDrawer();

    const now = new Date();
    const arrival = new Date(now.getTime() + p.eta * 60000);
    const timeStr = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    modalContent.innerHTML = `
      <div class="modal-success-icon">✅</div>
      <h2>Booking Confirmed!</h2>
      <p>${p.name} is on the way. They'll arrive at your location in approximately ${p.eta} minutes.</p>
      
      <div class="detail-row">
        <span class="detail-label">Provider</span>
        <span class="detail-value">${p.emoji} ${p.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${p.services[0]}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Rate</span>
        <span class="detail-value">$${p.rate}/hr</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Est. Arrival</span>
        <span class="detail-value">${timeStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Verification</span>
        <span class="detail-value">🛡️ Triple Verified</span>
      </div>

      <button class="btn-done" onclick="document.getElementById('modalOverlay').classList.remove('open')">Done</button>
      <br>
      <button class="track-btn" onclick="window.location.href='live-tracker.html'">
        📍 Track ${p.name.split(' ')[0]} Live
      </button>
    `;

    modalOverlay.classList.add('open');
  };

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });

  // ===== QUICK BOOK =====
  document.getElementById('quickBookBtn').addEventListener('click', () => {
    // Find nearest available provider
    const nearest = [...providers].sort((a, b) => a.eta - b.eta)[0];
    window.openDrawer(nearest.id);
  });

  // ===== REFRESH MAP =====
  document.getElementById('refreshMap').addEventListener('click', () => {
    const btn = document.getElementById('refreshMap');
    btn.textContent = '↻ Refreshing...';
    setTimeout(() => {
      btn.textContent = '↻ Refresh Map';
      renderProviders(activeCategory, activeSearch);
    }, 800);
  });

  // ===== INITIAL RENDER =====
  renderProviders();

});
