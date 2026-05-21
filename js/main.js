/**
 * main.js — Global page utilities
 * Handles: Announcement ticker + dynamic footer contact data.
 * Depends on: components.js (must be loaded first)
 */

const API_BASE = '/api';

/* ── Ticker ──────────────────────────────────────────────────────────────── */
async function loadTicker() {
  try {
    const res           = await fetch(`${API_BASE}/announcements`);
    const announcements = await res.json();
    const tickerEl      = document.getElementById('ticker-text');
    if (!tickerEl) return;
    const text = announcements.join('     ✦     ');
    tickerEl.innerHTML = text + '&nbsp;&nbsp;&nbsp;&nbsp;' + text;
  } catch (err) {
    console.error('Ticker load error:', err);
  }
}

/* ── Footer dynamic contact data ─────────────────────────────────────────── */
function loadFooterContact() {
  fetch(`${API_BASE}/data/contact`)
    .then(res => res.json())
    .then(contact => {
      const set = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };
      set('footer-address', `📍 ${contact.address}`);
      set('footer-phone',   `📞 ${contact.phone}`);
      set('footer-email',   `✉ ${contact.email}`);
    })
    .catch(err => console.error('Footer contact load error:', err));
}

/* ── Initialise on DOM ready ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadTicker();
  loadFooterContact();
  setInterval(loadTicker, 30000); // refresh ticker every 30s
});
