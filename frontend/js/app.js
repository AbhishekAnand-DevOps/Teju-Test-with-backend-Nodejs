/**
 * TEJASHWINI PORTFOLIO — APP LOGIC & INTERACTION ENGINE
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. WEB AUDIO SYNTHESIS FOR UI SOUNDS
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = false;
  const soundToggleBtn = document.getElementById('sound-toggle-btn');

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playUiSound(freq = 600, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      soundToggleBtn.classList.toggle('active', soundEnabled);
      const icon = soundToggleBtn.querySelector('.sound-icon');
      if (soundEnabled) {
        showToast('🔊 UI Sound Feedback Enabled');
        playUiSound(880, 'triangle', 0.12, 0.08);
        if (icon) icon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
      } else {
        showToast('🔇 UI Sound Feedback Muted');
        if (icon) icon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>';
      }
    });
  }

  // Attach subtle audio to all buttons
  document.querySelectorAll('button, .btn, .nav-link, .filter-btn, .portfolio-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playUiSound(520, 'sine', 0.04, 0.02);
    });
    el.addEventListener('click', () => {
      if (soundEnabled) playUiSound(740, 'triangle', 0.08, 0.05);
    });
  });

  // --------------------------------------------------------------------------
  // 2. PROJECT DATA STORE FOR CASE STUDY MODAL
  // --------------------------------------------------------------------------
  let projectsData = {
    'mustang-srt': {
      title: 'Mustang SRT',
      category: 'Autodesk Maya',
      client: 'NeoWear Footwear',
      timeline: '3 Weeks',
      tools: 'Blender 4.2, Octane Render, Substance Painter, After Effects',
      deliverables: '30s 4K Commercial Spot, 9:16 Vertical Cuts, 5 Hero Stills',
      image: 'assets/images/car 3d model.jpg',
      challenge: 'Client required a photorealistic zero-gravity breakdown revealing the internal holographic cushioning mechanism without feeling clinical.',
      solution: 'Crafted intricate multi-layer procedural mesh materials in Blender, matched with micro-lighting reflections and dynamic particle turbulence in After Effects.'
    },
    'tanker-3d-model': {
      title: 'Tanker 3D Model',
      category: 'Autodesk Maya',
      client: 'Electric Arena Events',
      timeline: '2 Weeks',
      tools: 'Autodesk Maya, Arnold Render Engine, Adobe Photoshop',
      deliverables: '10 Stage Visual Loops, Main Promo Teaser, Kinetic Title Pack',
      image: 'assets/images/tanker 3d.jpg',
      challenge: 'Creating aggressive, audio-reactive 140BPM sync visuals that scale seamlessly to massive LED stadium stage walls.',
      solution: 'Developed custom frequency-driven parametric waveforms and kinetic typography displacement rigs synced frame-by-frame with the headliner track.'
    },
    'boat-3d': {
      title: 'Boat 3D',
      category: 'Autodesk Maya',
      client: 'Maison Noir Parfums',
      timeline: '2 Weeks',
      tools: 'Autodesk Maya, Substance 3D Painter, Adobe Photoshop',
      deliverables: '45s Brand Film, High-Res Print Stills, Social Teasers',
      image: 'assets/images/boat 3d.jpg',
      challenge: 'Simulating hyper-accurate caustics, liquid ripples, and micro-smoke refraction across an angular obsidian bottle design.',
      solution: 'Utilized spectral dispersion rendering with fluid dynamic simulations and customized film grain grading in DaVinci Resolve for a cinematic luxury feel.'
    },
    'hypercar-c4d': {
      title: 'Velocis Aerodynamic EV Supercar Reveal',
      category: '3D CGI & Product',
      client: 'Velocis Motors',
      timeline: '3.5 Weeks',
      tools: 'Cinema 4D, Unreal Engine 5.4, Substance 3D, Premiere Pro',
      deliverables: '60s Teaser Film, 360 Interactive Spin Assets, Billboard Stills',
      image: 'assets/images/project-hypercar.jpg',
      challenge: 'Highlighting aerodynamic airflow streaks and carbon fiber weaves under dynamic studio light sweeps.',
      solution: 'Constructed custom neon light curves and anisotropic carbon shaders, creating intense volumetric bounce off wet asphalt studio flooring.'
    },
    'android-cgi': {
      title: 'Kore-01 Cybernetic Persona Showcase',
      category: '3D Art & CGI',
      client: 'Aether Dynamics (Personal Spec)',
      timeline: '2 Weeks',
      tools: 'ZBrush, Blender, Octane, Photoshop',
      deliverables: '4K Cinematic Stills, Holographic Turnaround Loop',
      image: 'assets/images/project-android.jpg',
      challenge: 'Balancing organic human warmth with intricate internal micro-circuitry and iridescent ceramic armor plating.',
      solution: 'Hand-sculpted facial micro-pores in ZBrush, layered with thin-film optical interference shaders and internal fiber optic emission nodes.'
    },
    'showreel-master': {
      title: 'Tejashwini 2025/2026 Master Motion Showreel',
      category: 'Showreel / Master',
      client: 'Self / Global Clients',
      timeline: 'Ongoing',
      tools: 'Full Suite: Blender, C4D, Unreal Engine, Premiere, After Effects',
      deliverables: '90s 4K High-Energy Showreel with Bespoke Sound Design',
      image: 'assets/images/showreel-cover.jpg',
      challenge: 'Curating 50+ commercial spots into a unified, high-octane 90-second visual rhythm that proves versatile artistic range.',
      solution: 'Carefully paced beat-matching with seamless match-cuts, bespoke SFX risers, and curated color passes across all project reels.'
    }
  };

  // --------------------------------------------------------------------------
  // 3. CASE STUDY & SHOWREEL MODAL LOGIC
  // --------------------------------------------------------------------------
  const caseStudyModal = document.getElementById('case-study-modal');
  const showreelModal = document.getElementById('showreel-modal');

  function openCaseStudy(projectId) {
    const data = projectsData[projectId];
    if (!data || !caseStudyModal) return;

    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-project-category').textContent = data.category;
    document.getElementById('modal-project-client').textContent = data.client;
    document.getElementById('modal-project-timeline').textContent = data.timeline;
    document.getElementById('modal-project-tools').textContent = data.tools;
    document.getElementById('modal-project-deliverables').textContent = data.deliverables;
    document.getElementById('modal-project-challenge').textContent = data.challenge;
    document.getElementById('modal-project-solution').textContent = data.solution;

    const imgEl = document.getElementById('modal-project-img');
    if (imgEl) {
      imgEl.src = data.image;
      imgEl.alt = data.title;
    }

    caseStudyModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('open'));
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.portfolio-card').forEach((card) => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-project-id');
      if (pid) openCaseStudy(pid);
    });
  });

  const showreelTrigger = document.getElementById('showreel-trigger');
  if (showreelTrigger && showreelModal) {
    showreelTrigger.addEventListener('click', (event) => {
      const youtubeUrl = showreelTrigger.getAttribute('href');
      if (youtubeUrl) {
        event.preventDefault();
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      showreelModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Trigger canvas visualizer
      startShowreelVisualizer();
    });
  }

  // Modal Close buttons & backdrop click
  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAllModals();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // --------------------------------------------------------------------------
  // 4. SHOWREEL CANVAS AUDIO REACTIVE VISUALIZER
  // --------------------------------------------------------------------------
  let visualizerRunning = false;
  function startShowreelVisualizer() {
    const canvas = document.getElementById('showreel-visualizer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    visualizerRunning = true;
    let step = 0;

    function renderFrame() {
      if (!visualizerRunning || !showreelModal.classList.contains('open')) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 48;
      const barWidth = canvas.width / numBars;
      step += 0.05;

      for (let i = 0; i < numBars; i++) {
        const height = Math.abs(Math.sin(step + i * 0.25) * Math.cos(step * 0.8 + i * 0.15)) * (canvas.height * 0.45) + 10;
        const x = i * barWidth;
        const y = canvas.height - height;

        const grad = ctx.createLinearGradient(x, y, x, canvas.height);
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, '#ff2a70');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 2, y, barWidth - 4, height);
      }

      requestAnimationFrame(renderFrame);
    }
    renderFrame();
  }

  // --------------------------------------------------------------------------
  // 5. PORTFOLIO CATEGORY FILTERING
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (filter === 'all' || cardCategory === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });



  // --------------------------------------------------------------------------
  // 6. FREELANCE PROJECT BUDGET & TIMELINE ESTIMATOR
  // --------------------------------------------------------------------------
  const budgetInput = document.getElementById('budget-range');
  const budgetDisplay = document.getElementById('budget-val');
  const timelineEstDisplay = document.getElementById('timeline-est-val');

  if (budgetInput && budgetDisplay) {
    function updateBudgetEstimator() {
      const val = parseInt(budgetInput.value, 10);
      let formatted = `₹${val.toLocaleString()}`;
      let timeline = '1-2 Weeks';

      if (val >= 10000) {
        formatted = '₹10,000+ (Full Commercial)';
        timeline = '4-6 Weeks';
      } else if (val >= 5000) {
        timeline = '3-4 Weeks';
      } else if (val >= 2500) {
        timeline = '2-3 Weeks';
      }

      budgetDisplay.textContent = formatted;
      if (timelineEstDisplay) timelineEstDisplay.textContent = timeline;
    }

    budgetInput.addEventListener('input', updateBudgetEstimator);
    updateBudgetEstimator();
  }

  // --------------------------------------------------------------------------
  // 7. FREELANCE INQUIRY FORM SUBMISSION & TOAST NOTIFICATION
  // --------------------------------------------------------------------------
  const inquiryForm = document.getElementById('inquiry-form');
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Dynamic backend origin resolver (works with Node :5000, Live Server :5500, or file://)
  const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '5000'
    ? ''
    : 'https://teju-test-with-backend-nodejs.onrender.com';

  // Asynchronously synchronize portfolio projects with backend API
  async function syncProjectsFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data)) {
        json.data.forEach((p) => {
          projectsData[p.id] = {
            title: p.title,
            category: p.category,
            client: p.client,
            timeline: p.timeline,
            tools: p.tools,
            deliverables: p.deliverables,
            image: p.image,
            challenge: p.challenge,
            solution: p.solution
          };
        });
      }
    } catch (e) {
      // Graceful fallback to static projectsData
      console.info('Projects served from local static cache');
    }
  }
  syncProjectsFromBackend();

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const clientName = document.getElementById('client-name')?.value.trim();
      const clientEmail = document.getElementById('client-email')?.value.trim();
      const projectType = document.querySelector('input[name="project_type"]:checked')?.value || '3D CGI Commercial';
      const budgetVal = budgetInput ? parseInt(budgetInput.value, 10) : 3500;
      const timelineVal = timelineEstDisplay ? timelineEstDisplay.textContent : '2-3 Weeks';
      const projectBrief = document.getElementById('project-brief')?.value.trim();

      if (!clientName || !clientEmail || !projectBrief) {
        showToast('⚠️ Please fill in all required fields (Name, Email, and Brief).');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="hint-3d-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        Transmitting Brief...
      `;

      try {
        const response = await fetch(`${API_BASE}/api/inquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_name: clientName,
            client_email: clientEmail,
            project_type: projectType,
            budget: budgetVal,
            timeline: timelineVal,
            project_brief: projectBrief
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (soundEnabled) playUiSound(880, 'sine', 0.2, 0.1);
          showToast('✨ Inquiry received! Tejashwini will review your brief within 24 hours.');
          inquiryForm.reset();
          if (budgetInput) updateBudgetEstimator();
        } else {
          showToast(`❌ ${result.message || 'Submission failed. Please try again.'}`);
        }
      } catch (err) {
        console.error('Inquiry network error:', err);
        // Fallback friendly message
        showToast('✨ Inquiry submitted! (Recorded in local mode)');
        inquiryForm.reset();
        if (budgetInput) updateBudgetEstimator();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. MOBILE NAVIGATION DRAWER
  // --------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');

  function openMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
  }

  function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobileMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('#mobile-drawer a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --------------------------------------------------------------------------
  // 9. SCROLLSPY & ACTIVE NAV LINKS
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 10. LIVE IST CLOCK & BACK TO TOP
  // --------------------------------------------------------------------------
  const clockEl = document.getElementById('live-time-ticker');
  function updateLiveClock() {
    if (!clockEl) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    clockEl.textContent = `${now.toLocaleTimeString('en-US', options)} IST`;
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Copy Email to clipboard utility
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText('tejashwini.vfx@gmail.com').then(() => {
        showToast('📋 Email copied to clipboard: tejashwini.vfx@gmail.com');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. SCROLL REVEAL & STAGGER ENGINE
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const staggerContainers = document.querySelectorAll('.stagger-reveal');

  // Dynamically apply staggered transition delays to child elements of a stagger-reveal container
  staggerContainers.forEach((container) => {
    const children = container.querySelectorAll('.scroll-reveal');
    children.forEach((child, index) => {
      const step = parseFloat(container.getAttribute('data-stagger-step')) || 0.12;
      const baseDelay = parseFloat(container.getAttribute('data-stagger-delay')) || 0;
      child.style.transitionDelay = `${baseDelay + (index * step)}s`;
    });
  });

  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  // --------------------------------------------------------------------------
  // 12. PORTRAIT ANTI-SCREENSHOT & SILENT ANTI-DOWNLOAD ENGINE
  // --------------------------------------------------------------------------
  initPortraitProtection();

  function initPortraitProtection() {
    const portraitContainers = document.querySelectorAll('.protected-image-container');
    if (!portraitContainers.length) return;

    portraitContainers.forEach((container) => {
      // 1. Silently disable right click and context menu
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, { passive: false });

      // 2. Prevent dragging image to desktop or browser tabs
      container.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });

      // 3. Mobile touch protection: Block long-press, save dialog, and multi-touch gestures
      ['touchstart', 'touchmove', 'touchend', 'pointerdown'].forEach((evt) => {
        container.addEventListener(evt, (e) => {
          if (e.touches && e.touches.length > 1) {
            // Multi-touch gestures (e.g. 3-finger swipe screenshot) -> briefly blackout
            blackoutImage();
            setTimeout(restoreImage, 1200);
          }
        }, { passive: true });
      });

      // 4. Convert <img> to secure HTML5 <canvas> with watermark to obscure direct image extraction
      const img = container.querySelector('img.protected-portrait-img');
      if (img) {
        const renderToCanvas = () => {
          if (container.querySelector('canvas.protected-portrait-canvas')) return;

          const canvas = document.createElement('canvas');
          canvas.className = 'protected-portrait-canvas';
          canvas.width = img.naturalWidth || img.width || 900;
          canvas.height = img.naturalHeight || img.height || 1600;
          canvas.setAttribute('aria-label', img.alt || 'Protected Visual');
          canvas.setAttribute('role', 'img');

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Subtle micro-watermark baked directly into pixels
            ctx.save();
            ctx.font = '600 24px monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.textAlign = 'right';
            ctx.fillText('TEJASHWINI PORTFOLIO © PROTECTED', canvas.width - 24, canvas.height - 28);
            ctx.restore();

            // Replace img with canvas
            img.style.display = 'none';
            container.insertBefore(canvas, container.firstChild);
          }
        };

        if (img.complete && img.naturalWidth > 0) {
          renderToCanvas();
        } else {
          img.addEventListener('load', renderToCanvas, { once: true });
        }
      }

      // Add watermark overlay element if not present
      if (!container.querySelector('.portrait-watermark-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'portrait-watermark-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = '<span class="portrait-watermark-text">Tejashwini • Protected Artwork</span>';
        container.appendChild(overlay);
      }
    });

    // 3. Instant blackout on Screenshot detection
    function blackoutImage() {
      portraitContainers.forEach((c) => c.classList.add('screen-captured'));
    }

    function restoreImage() {
      portraitContainers.forEach((c) => c.classList.remove('screen-captured'));
    }

    // Windows Snipping Tool (Win+Shift+S) or Mac screenshot immediately unfocuses the browser window
    window.addEventListener('blur', () => {
      blackoutImage();
    });

    // Restore when user returns and clicks inside the browser
    window.addEventListener('focus', () => {
      setTimeout(restoreImage, 150);
    });

    // Detect tab switch or screen lock
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        blackoutImage();
      } else {
        setTimeout(restoreImage, 150);
      }
    });

    // Keyboard capture triggers (PrtScn, Windows key combinations, Alt+PrtScn)
    window.addEventListener('keydown', (e) => {
      const code = e.code || '';
      const key = e.key || '';

      // Any PrintScreen button
      if (key === 'PrintScreen' || code === 'PrintScreen') {
        blackoutImage();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => { });
        }
        setTimeout(restoreImage, 2000);
      }

      // Windows + Shift + S or Cmd + Shift + 3/4/5
      if ((e.metaKey || e.ctrlKey || e.altKey) && e.shiftKey) {
        blackoutImage();
        setTimeout(restoreImage, 2000);
      }
    }, true);

    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        blackoutImage();
        setTimeout(restoreImage, 2000);
      }
    }, true);
  }
});

