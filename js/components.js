/**
 * School Components — Shared UI building blocks
 * Provides: Header (topbar + navbar + ticker), Footer, Page Hero banner,
 *           Dropdown initialisation, and a one-call page bootstrap helper.
 *
 * Usage in every page:
 *   1. Include this file BEFORE main.js
 *   2. Place <div id="header-placeholder"></div> at the top of <body>
 *   3. Place <div id="footer-placeholder"></div> at the bottom of <body>
 *   4. School.initPage() is called automatically on DOMContentLoaded
 */

const School = (() => {

  /* ── Navigation links (single source of truth) ─────────────────────────── */
  const NAV_HTML = `
    <a href="/index.html" class="nav-link home-nav-item">Home</a>
    <div class="home-dropdown-container">
      <button class="dropdown-btn home-dropdown-trigger">About ▼</button>
      <div class="dropdown-menu home-dropdown-menu">
        <a href="/about.html"        class="home-dropdown-link">About Our School</a>
        <a href="/principal.html"    class="home-dropdown-link">About Principal</a>
        <a href="/vision.html"       class="home-dropdown-link">Vision &amp; Mission</a>
        <a href="/achievements.html" class="home-dropdown-link">Achievements</a>
        <a href="/rules-regulations.html" class="home-dropdown-link">Rules &amp; Regulations</a>
      </div>
    </div>
    <div class="home-dropdown-container">
      <button class="dropdown-btn home-dropdown-trigger">Academics ▼</button>
      <div class="dropdown-menu home-dropdown-menu">
        <a href="/syllabus.html"        class="home-dropdown-link">Syllabus</a>
        <a href="/timetable.html"    class="home-dropdown-link">Time Table</a>
      </div>
    </div>
    <a href="/gallery.html"    class="nav-link home-nav-item">Gallery</a>
    <a href="/admissions.html" class="nav-link home-nav-item">Admissions</a>
    <a href="/fees.html"       class="nav-link home-nav-item">School Fees</a>
    <a href="/contact.html"    class="nav-link home-nav-item">Contact</a>
    <a href="/admissions.html" class="btn btn-primary btn-small home-enroll-btn">Enroll Now</a>
  `;

  /* ── Header ─────────────────────────────────────────────────────────────── */
  function renderHeader() {
    return `
      <div class="home-topbar">
        <span class="home-topbar-info">📞 +91 98765 43210 &nbsp;|&nbsp; ✉ info@shakespeareschool.edu.in</span>
        <div class="home-topbar-right">
          <span class="home-topbar-badge">Affiliated: TN Matriculation Board</span>
          <a href="/login.html" class="home-topbar-login">Admin Login</a>
        </div>
      </div>

      <nav class="home-navbar">
        <div class="home-navbar-container">
          <a href="/index.html" class="school-logo-link">
            <div class="home-logo-icon">S</div>
            <div>
              <div class="home-logo-title">Shakespeare Ideal</div>
              <div class="home-logo-subtitle">Matriculation School</div>
            </div>
          </a>
          <div class="home-nav-links">${NAV_HTML}</div>
        </div>
      </nav>

      <div class="home-ticker-section">
        <span class="home-ticker-badge">Latest</span>
        <div class="home-ticker-container">
          <div id="ticker-text" class="ticker-animation home-ticker-text"></div>
        </div>
      </div>
    `;
  }

  /* ── Footer ─────────────────────────────────────────────────────────────── */
  function renderFooter() {
    return `
      <footer class="about-footer">
        <div class="about-footer-container">
          <div class="about-footer-grid">

            <div>
              <div class="about-footer-logo-row">
                <div class="about-footer-logo-icon">S</div>
                <div>
                  <div class="about-footer-logo-title">Shakespeare Ideal</div>
                  <div class="about-footer-logo-subtitle">Matriculation School</div>
                </div>
              </div>
              <p class="about-footer-desc">Nurturing young minds with quality education, strong values, and holistic development since 2000. TN Matriculation Board Affiliated.</p>
              <p id="footer-address" class="about-footer-meta">📍 123, Shakespeare Road, Anna Nagar, Chennai – 600 040</p>
              <p id="footer-phone"   class="about-footer-meta">📞 +91 98765 43210</p>
              <p id="footer-email"   class="about-footer-meta">✉ info@shakespeareschool.edu.in</p>
            </div>

            <div>
              <h4 class="about-footer-heading">Quick Links</h4>
              <ul class="about-footer-list">
                <li><a href="/index.html"      class="about-footer-link">→ Home</a></li>
                <li><a href="/about.html"       class="about-footer-link">→ About School</a></li>
                <li><a href="/principal.html"   class="about-footer-link">→ About Principal</a></li>
                <li><a href="/vision.html"      class="about-footer-link">→ Vision &amp; Mission</a></li>
                <li><a href="/admissions.html"  class="about-footer-link">→ Admissions</a></li>
                <li><a href="/rules-regulations.html" class="about-footer-link">→ Rules &amp; Regulations</a></li>
              </ul>
            </div>

            <div>
              <h4 class="about-footer-heading">Academics</h4>
              <ul class="about-footer-list">
                <li><a href="/syllabus.html"     class="about-footer-link">→ Syllabus</a></li>
                <li><a href="/timetable.html"    class="about-footer-link">→ Time Table</a></li>
                <li><a href="/gallery.html"      class="about-footer-link">→ Gallery</a></li>
                <li><a href="/fees.html"         class="about-footer-link">→ School Fees</a></li>
                <li><a href="/achievements.html" class="about-footer-link">→ Achievements</a></li>
              </ul>
            </div>

          </div>
          <div class="about-footer-bottom">
            <p class="about-footer-credits">© 2024 Shakespeare Ideal Matriculation School. All rights reserved.</p>
            <p class="about-footer-credits">Designed with ❤ for Quality Education</p>
          </div>
        </div>
      </footer>
    `;
  }

  /* ── Page Hero Banner ────────────────────────────────────────────────────── */
  /**
   * Returns the gradient hero banner HTML used at the top of every inner page.
   * @param {string} tagText  - Small coloured label above the title (e.g. "Our Story")
   * @param {string} title    - Main heading (e.g. "About Our School")
   */
  function renderPageHero(tagText, title) {
    return `
      <div class="page-hero">
        <p class="page-hero-tag">${tagText}</p>
        <h1 class="page-hero-title">${title}</h1>
        <div style="position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: rgba(245, 166, 35, 0.1);"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; border-radius: 50%; background: rgba(255, 255, 255, 0.05);"></div>
      </div>
    `;
  }

  /* ── Error / Loading helpers ─────────────────────────────────────────────── */
  function renderError(msg) {
    return `<div class="page-load-error">${msg || 'Failed to load content. Please try again later.'}</div>`;
  }

  /* ── Dropdown Initialisation ─────────────────────────────────────────────── */
  function initDropdown() {
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const menu   = btn.nextElementSibling;
        const isOpen = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(m => (m.style.display = 'none'));
        menu.style.display = isOpen ? 'none' : 'block';
        e.stopPropagation();
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(m => (m.style.display = 'none'));
    });
  }

  /* ── Active Nav Highlight ────────────────────────────────────────────────── */
  function highlightActiveNav() {
    const current = window.location.pathname;
    document.querySelectorAll('.home-nav-item, .home-dropdown-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && current.endsWith(href.replace(/^\//, ''))) {
        link.classList.add('active');
      }
    });
  }

  /* ── Bootstrap: inject header + footer + wire interactions ──────────────── */
  function initPage() {
    const headerEl = document.getElementById('header-placeholder');
    if (headerEl) headerEl.innerHTML = renderHeader();

    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) footerEl.innerHTML = renderFooter();

    initDropdown();
    highlightActiveNav();
  }

  /* ── Public API ──────────────────────────────────────────────────────────── */
  return {
    renderHeader,
    renderFooter,
    renderPageHero,
    renderError,
    initDropdown,
    initPage
  };

})();

// Auto-bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', School.initPage);
