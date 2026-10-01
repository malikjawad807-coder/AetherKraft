/**
 * AETHERKRAFT — A DIGITAL STUDIO BY JAWAD
 * High-Performance Zero-Lag Interaction & Hardware-Accelerated Animation Engine
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & DOM REFERENCES
     ========================================================================== */
  const TOTAL_FRAMES = 240;
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const frameCounterLabel = document.getElementById('frame-counter-label');
  const heroStageView = document.getElementById('hero-stage-view');
  const aboutStageView = document.getElementById('about-stage-view');
  const mainHeader = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const roleRotator = document.getElementById('role-rotator');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const copyToast = document.getElementById('copy-email-toast');
  const resumeModal = document.getElementById('resume-modal');
  const btnOpenResume = document.getElementById('btn-open-resume');
  const heroResumeTrigger = document.getElementById('hero-resume-trigger');
  const btnCloseResume = document.getElementById('btn-close-resume');
  const contactForm = document.getElementById('project-contact-form');
  const formStatus = document.getElementById('form-status');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorGlow = document.getElementById('cursor-glow');

  /* ==========================================================================
     2. FRAME PRELOADING & ZERO-LAG DIRTY-CHECKED RAF ENGINE
     ========================================================================== */
  const frameImages = new Array(TOTAL_FRAMES + 1);
  let targetFrame = 1;
  let currentDrawnFrame = -1;
  let isRafRunning = false;

  function getFrameSrc(index) {
    const padded = String(index).padStart(3, '0');
    return `ezgif-frame-${padded}.jpg`;
  }

  // Draw a frame onto the 1280x720 canvas with cover sizing
  function drawFrame(index) {
    if (!ctx || !canvas) return;

    // Boundary check
    const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
    let img = frameImages[safeIndex];

    // If target frame isn't ready yet, search nearest loaded frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 25; offset++) {
        const prev = frameImages[safeIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = frameImages[safeIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      currentDrawnFrame = safeIndex;

      if (frameCounterLabel) {
        const paddedNum = String(safeIndex).padStart(3, '0');
        frameCounterLabel.textContent = `FRAME ${paddedNum} / 240`;
      }
    }
  }

  // Dirty-checked RAF loop: ONLY draws when targetFrame changes!
  function tickRaf() {
    if (targetFrame !== currentDrawnFrame) {
      drawFrame(targetFrame);
    }
    requestAnimationFrame(tickRaf);
  }

  // Initialize Canvas
  if (canvas && ctx) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Load Frame 1 immediately
    const img1 = new Image();
    img1.src = getFrameSrc(1);
    img1.onload = () => {
      frameImages[1] = img1;
      drawFrame(1);
    };

    // Progressively load remaining frames
    // Priority: Keyframes first
    const keyframes = [15, 30, 60, 90, 120, 150, 180, 210, 240];
    keyframes.forEach((k) => {
      const img = new Image();
      img.src = getFrameSrc(k);
      img.onload = () => { frameImages[k] = img; };
    });

    // Background idle load for all remaining frames
    let bgIndex = 2;
    function loadNextBatch() {
      const end = Math.min(TOTAL_FRAMES, bgIndex + 10);
      for (; bgIndex <= end; bgIndex++) {
        if (!frameImages[bgIndex]) {
          const img = new Image();
          img.src = getFrameSrc(bgIndex);
          const idx = bgIndex;
          img.onload = () => { frameImages[idx] = img; };
        }
      }
      if (bgIndex < TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 50);
        }
      }
    }
    setTimeout(loadNextBatch, 200);

    // Start RAF loop
    if (!isRafRunning) {
      isRafRunning = true;
      requestAnimationFrame(tickRaf);
    }
  }

  /* ==========================================================================
     3. GSAP SCROLLTRIGGER FOR PINNED SEQUENCE & STAGE CROSS-FADE
     ========================================================================== */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.15, // ultra-smooth 60fps scrub
      onUpdate: (self) => {
        const progress = self.progress;

        // Map scroll progress (0.0 to 1.0) to frame 1 -> 240
        targetFrame = Math.round(1 + progress * (TOTAL_FRAMES - 1));

        // Cross-fade text stages
        if (progress < 0.45) {
          if (heroStageView && !heroStageView.classList.contains('active')) {
            heroStageView.classList.add('active');
            if (aboutStageView) aboutStageView.classList.remove('active');
          }
        } else {
          if (aboutStageView && !aboutStageView.classList.contains('active')) {
            aboutStageView.classList.add('active');
            if (heroStageView) heroStageView.classList.remove('active');
          }
        }
      }
    });
  }

  /* ==========================================================================
     4. ROLE ROTATOR TEXT ANIMATION
     ========================================================================== */
  if (roleRotator) {
    const roles = [
      'Creative Developer',
      'Full-Stack Engineer',
      'Digital Architect',
      'UI/UX Craftsman'
    ];
    let roleIdx = 0;

    setInterval(() => {
      roleRotator.style.opacity = '0';
      roleRotator.style.transform = 'translateY(-6px)';
      
      setTimeout(() => {
        roleIdx = (roleIdx + 1) % roles.length;
        roleRotator.textContent = roles[roleIdx];
        roleRotator.style.opacity = '1';
        roleRotator.style.transform = 'translateY(0)';
      }, 300);
    }, 2800);
  }

  /* ==========================================================================
     5. HEADER SCROLL STATE & MOBILE DRAWER
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && mobileNavDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile drawer on any navigation link click
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     6. PROJECTS FILTER PILLS
     ========================================================================== */
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const filterVal = pill.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  /* ==========================================================================
     7. TIMELINE / RESUME TABS (Experience vs. Education)
     ========================================================================== */
  const toggleExp = document.getElementById('toggle-experience');
  const toggleEdu = document.getElementById('toggle-education');
  const tabExp = document.getElementById('timeline-experience-tab');
  const tabEdu = document.getElementById('timeline-education-tab');

  if (toggleExp && toggleEdu && tabExp && tabEdu) {
    toggleExp.addEventListener('click', () => {
      toggleExp.classList.add('active');
      toggleEdu.classList.remove('active');
      tabExp.classList.add('active');
      tabEdu.classList.remove('active');
    });

    toggleEdu.addEventListener('click', () => {
      toggleEdu.classList.add('active');
      toggleExp.classList.remove('active');
      tabEdu.classList.add('active');
      tabExp.classList.remove('active');
    });
  }

  /* ==========================================================================
     8. RESUME MODAL HANDLERS
     ========================================================================== */
  function openResume() {
    if (resumeModal) {
      resumeModal.classList.add('open');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResume() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      resumeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (btnOpenResume) btnOpenResume.addEventListener('click', openResume);
  if (heroResumeTrigger) heroResumeTrigger.addEventListener('click', openResume);
  if (btnCloseResume) btnCloseResume.addEventListener('click', closeResume);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResume();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('open')) {
      closeResume();
    }
  });

  /* ==========================================================================
     9. PROMINENT "COPY EMAIL" BUTTON & TOAST
     ========================================================================== */
  if (btnCopyEmail && copyToast) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = btnCopyEmail.getAttribute('data-email') || 'contact.aetherkraft@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyToast.classList.add('visible');
        setTimeout(() => {
          copyToast.classList.remove('visible');
        }, 2500);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyToast.classList.add('visible');
        setTimeout(() => {
          copyToast.classList.remove('visible');
        }, 2500);
      }
    });
  }

  /* ==========================================================================
     10. PRICING CARD TO CONTACT BUDGET SELECTION
     ========================================================================== */
  document.querySelectorAll('[data-budget]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const budgetVal = btn.getAttribute('data-budget');
      const budgetSelect = document.getElementById('client-budget');
      if (budgetSelect && budgetVal) {
        budgetSelect.value = budgetVal;
      }
    });
  });

  /* ==========================================================================
     11. CONTACT FORM HANDLER
     ========================================================================== */
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('client-name')?.value || 'Client';
      
      formStatus.className = 'form-status-alert success';
      formStatus.innerHTML = `<strong>Thank you, ${name}!</strong> Your project inquiry has been received. Jawad will review your details and respond within 24 hours.`;
      
      contactForm.reset();
    });
  }

  /* ==========================================================================
     12. DUAL-LAYER CURSOR FOLLOW PHYSICS (Desktop only)
     ========================================================================== */
  if (cursorDot && cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

})();
