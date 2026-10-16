/**
 * TEJASHWINI PORTFOLIO — MAGNETIC CURSOR & SPOTLIGHT ENGINE
 */

(function () {
  // Disable on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Update global CSS spotlight coordinates
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
  });

  function renderCursor() {
    // Smooth lerp for outer ring
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    // Fast lerp for inner dot
    dotX += (mouseX - dotX) * 0.65;
    dotY += (mouseY - dotY) * 0.65;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(renderCursor);
  }

  requestAnimationFrame(renderCursor);

  // Hover states on interactive elements
  const interactiveSelector = 'a, button, input, textarea, select, .portfolio-card, .filter-btn, .showreel-banner, .process-card, .value-prop-card, .pill-option, .testimonial-card';

  function attachCursorHoverListeners() {
    const targets = document.querySelectorAll(interactiveSelector);
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  attachCursorHoverListeners();

  // Re-attach if DOM changes
  const observer = new MutationObserver(() => {
    attachCursorHoverListeners();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
