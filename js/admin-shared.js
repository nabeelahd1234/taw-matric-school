// ══════════════════════════════════════════════
// SHAKESPEARE SCHOOL — SHARED ADMIN UTILITIES
// Included by all admin pages
// ══════════════════════════════════════════════

// ── Auth ──────────────────────────────────────
const token = localStorage.getItem('adminToken');
if (!token) window.location.href = '/login.html';

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = '/login.html';
}

async function api(url, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData))
    opts.headers['Content-Type'] = 'application/json';
  const r = await fetch(url, opts);
  if (r.status === 401) { logoutAdmin(); throw new Error('Session expired'); }
  return r.json();
}
async function apiGet(url) { return (await fetch(url)).json(); }

// ── Toast ─────────────────────────────────────
function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = (type==='success' ? '✅ ' : '❌ ') + msg;
  el.className = `show toast-${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = '', 3000);
}

// ── Helpers ───────────────────────────────────
function esc(s='') { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function emptyState(msg='No records found.') {
  return `<div class="empty-state"><div class="empty-state-icon">📭</div><p>${msg}</p></div>`;
}

// ── Accordion toggle ───────────────────────────
// Defined at top level so onclick="toggleAccordion(...)" can always find it.
function toggleAccordion(key) {
  const el = document.getElementById('acc-' + key);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.nav-accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ── Smart section navigation ───────────────────
// Called by sidebar sub-item links.
// • If switchSection exists on this page → stay here, switch section in-place.
// • Otherwise → follow the href to the correct module page.
function navSection(e, sectionId) {
  const link = e.currentTarget;
  const targetUrl = link.getAttribute('href');
  const currentPath = window.location.pathname;

  // If the link goes to a different page → let the browser navigate normally
  if (targetUrl && targetUrl !== currentPath && !targetUrl.startsWith('#')) {
    return; // do not prevent default
  }

  // Same-page link → use switchSection if available
  if (typeof switchSection === 'function') {
    e.preventDefault();
    switchSection(sectionId);
  }
}

// ── Build Sidebar HTML ─────────────────────────
// activeModule:  'academic' | 'people' | 'pages'
// activeSection: optional — highlights the active sub-item (e.g. 'students')
function buildSidebar(activeModule, activeSection) {

  // Every item has:
  //   id       — matches switchSection() arg
  //   icon     — emoji
  //   label    — display text
  //   href     — page to navigate to when switchSection is NOT available
  //              (people items point to their own standalone page;
  //               academic/pages items point back to their single-page module)
  const modules = [
    {
      key: 'academic',
      icon: '📚',
      label: 'Academic',
      items: [
        { id:'classes',       icon:'📋', label:'Classes &amp; Sections', href:'/admin-academic.html' },
        { id:'syllabus',      icon:'📖', label:'Syllabus',               href:'/admin-academic.html' },
        { id:'timetable',     icon:'⏰', label:'Timetable',              href:'/admin-academic.html' },
        { id:'fees',          icon:'💰', label:'Fee Structure',          href:'/admin-academic.html' },
        { id:'announcements', icon:'📢', label:'Announcements',          href:'/admin-academic.html' },
      ]
    },
    {
      key: 'people',
      icon: '👥',
      label: 'People &amp; Media',
      items: [
        { id:'students', icon:'👨‍🎓', label:'Students',      href:'/admin/students.html' },
        { id:'teachers', icon:'👩‍🏫', label:'Teachers',      href:'/admin/teachers.html' },
        { id:'gallery',  icon:'🖼️',  label:'Media Gallery', href:'/admin/gallery.html'  },
      ]
    },
    {
      key: 'pages',
      icon: '🌐',
      label: 'Website Pages',
      items: [
        { id:'home',              icon:'🏠',  label:'Home Page',               href:'/admin/admin-home.html' },
        { id:'about',             icon:'📄',  label:'About Page',              href:'/admin/admin-about.html' },
        { id:'principal',         icon:'👩‍💼', label:'Principal Message',       href:'/admin/admin-principal.html' },
        { id:'vision',            icon:'🎯',  label:'Vision &amp; Mission',    href:'/admin/admin-vision.html' },
        { id:'achievements',      icon:'🏆',  label:'Achievements',            href:'/admin/admin-achievements.html' },
        { id:'admissions',        icon:'📋',  label:'Admissions',              href:'/admin/admin-admissions.html' },
        { id:'rules-regulations', icon:'📝',  label:'Rules &amp; Regulations', href:'/admin/admin-rules.html' },
      ]
    }
  ];

  const accordionHtml = modules.map(mod => {
    const isOpen = mod.key === activeModule;

    const itemsHtml = mod.items.map(item => {
      const isActive = item.id === activeSection;
      // All items are <a> links now.
      // navSection() decides at runtime whether to switch in-place or navigate.
      return `<a class="nav-sub-item${isActive ? ' active' : ''}"
           href="${item.href}"
           data-section="${item.id}"
           onclick="navSection(event,'${item.id}')">
          <span class="nav-sub-icon">${item.icon}</span>${item.label}
        </a>`;
    }).join('');

    return `
      <div class="nav-accordion-item${isOpen ? ' open' : ''}" id="acc-${mod.key}">
        <button class="nav-accordion-header" onclick="toggleAccordion('${mod.key}')">
          <span class="nav-acc-icon">${mod.icon}</span>
          <span class="nav-acc-label">${mod.label}</span>
          <span class="nav-acc-arrow">&#8250;</span>
        </button>
        <div class="nav-accordion-body">
          <div class="nav-accordion-inner">
            ${itemsHtml}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <style>
      
    </style>

    <div class="sidebar-brand">
      <div class="brand-circle">S</div>
      <div>
        <div class="brand-text">Shakespeare School</div>
        <div class="brand-sub">Admin Panel</div>
      </div>
    </div>

    <div class="nav-group">
      <div class="nav-label">Navigation</div>
      ${accordionHtml}
    </div>

    <div class="sidebar-footer">
      <button class="btn-logout" onclick="logoutAdmin()">🔒 Logout</button>
    </div>`;
}

// ── Shared CSS (injected into each page's <style>) ─
// (CSS lives in each HTML file for zero-dependency; this file is JS only)