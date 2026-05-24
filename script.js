// ===== TAW MATRIC SCHOOL - SHARED JS =====

// Hamburger menu
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // Active nav link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll animation for cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Utility: Create floating emoji decorations
function createFloatingEmojis(emojis, container) {
  emojis.forEach((emoji, i) => {
    const el = document.createElement('div');
    el.textContent = emoji;
    el.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 1.5 + 1}rem;
      top: ${Math.random() * 80 + 5}%;
      left: ${Math.random() * 90 + 5}%;
      opacity: ${Math.random() * 0.4 + 0.2};
      animation: floatEmoji ${Math.random() * 4 + 4}s ease-in-out ${Math.random() * 2}s infinite alternate;
      pointer-events: none;
    `;
    container && container.appendChild(el);
  });
}
