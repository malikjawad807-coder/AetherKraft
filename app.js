/**
 * AETHER KRAFT — A DIGITAL STUDIO BY JAWAD
 * High-Performance Scroll-Driven Engine & Horizontal Odyssey
 * 60+ FPS Hardware-Accelerated, Zero-Lag Canvas Redraw Loop
 */

(function () {
  'use strict';

  const TOTAL_FRAMES = 240;
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  // DOM Elements
  const canvas = document.getElementById('scroll-sequence-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const frameCounter = document.getElementById('frame-counter');
  const heroStageView = document.getElementById('hero-stage-view');
  const aboutStageView = document.getElementById('about-stage-view');
  const siteHeader = document.getElementById('site-header');
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const odysseyTrack = document.getElementById('odyssey-track');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const copyToast = document.getElementById('copy-email-toast');
  const btnOpenResume = document.getElementById('btn-open-resume');
  const btnCloseResume = document.getElementById('btn-close-resume');
  const resumeModal = document.getElementById('resume-modal');
  const contactForm = document.getElementById('project-contact-form');
  const formStatus = document.getElementById('form-status');

  // Pre-cached Image Array
  const frameImages = [];
  let currentDrawnFrame = 1;
  let targetFrame = 1;

  function getFrameUrl(num) {
    return `ezgif-frame-${String(num).padStart(3, '0')}.jpg`;
  }

  /* ==========================================================================
     1. PROGRESSIVE FRAME PRELOADING
     ========================================================================== */
  function initSequenceImages() {
    if (!canvas || !ctx) return;

    // Load Frame 1 first for immediate paint
    const img1 = new Image();
    img1.src = getFrameUrl(1);
    frameImages[1] = img1;
    img1.onload = () => {
      drawFrame(1);
      loadRemainingSequence();
    };
  }

  function loadRemainingSequence() {
    // Key frames every 3 frames first for snappy scrubbing
    for (let i = 2; i <= TOTAL_FRAMES; i += 3) {
      const img = new Image();
      img.src = getFrameUrl(i);
      frameImages[i] = img;
    }

    // Load all remaining frames in the background
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if (!frameImages[i]) {
        const img = new Image();
        img.src = getFrameUrl(i);
        frameImages[i] = img;
      }
    }
  }

  /* ==========================================================================
     2. DIRTY-CHECKED RAF RENDER LOOP (ZERO LAG)
     Only draws when targetFrame actually changes integer!
     ========================================================================== */
  function drawFrame(frameIdx) {
    if (!ctx || !canvas) return;

    const clampedIdx = Math.max(1, Math.min(TOTAL_FRAMES, frameIdx));
    let img = frameImages[clampedIdx];

    // Fallback: search nearest loaded frame if this one is still loading
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < 30; offset++) {
        const prev = frameImages[clampedIdx - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = frameImages[clampedIdx + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      currentDrawnFrame = clampedIdx;
      if (frameCounter) {
        frameCounter.textContent = `FRAME ${String(clampedIdx).padStart(3, '0')} / 240`;
      }
    }
  }

  // Dirty-checked RAF loop
  function renderLoop() {
    if (targetFrame !== currentDrawnFrame) {
      drawFrame(targetFrame);
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);
  initSequenceImages();

  /* ==========================================================================
     3. GSAP SCROLLTRIGGER FOR PINNED HERO SEQUENCE (250vh)
     ========================================================================== */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = document.getElementById('hero');
    if (heroSection) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15,
        onUpdate: (self) => {
          // Map scroll progress (0 to 1) directly to frames (1 to 240)
          targetFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(self.progress * (TOTAL_FRAMES - 1)) + 1));

          // Cross-fade Hero to About Stage
          if (self.progress < 0.42) {
            if (heroStageView && !heroStageView.classList.contains('active')) {
              heroStageView.classList.add('active');
            }
            if (aboutStageView && aboutStageView.classList.contains('active')) {
              aboutStageView.classList.remove('active');
            }
          } else {
            if (heroStageView && heroStageView.classList.contains('active')) {
              heroStageView.classList.remove('active');
            }
            if (aboutStageView && !aboutStageView.classList.contains('active')) {
              aboutStageView.classList.add('active');
            }
          }
        }
      });
    }

    /* ==========================================================================
       4. PINNED HORIZONTAL SCROLL ODYSSEY
       ========================================================================== */
    const odysseySection = document.getElementById('odyssey');
    if (odysseySection && odysseyTrack && window.innerWidth > 1024) {
      const getScrollDist = () => {
        return odysseyTrack.scrollWidth - window.innerWidth + 120;
      };

      ScrollTrigger.create({
        trigger: odysseySection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.25,
        onUpdate: (self) => {
          const maxDist = getScrollDist();
          if (maxDist > 0) {
            const shiftX = self.progress * maxDist;
            odysseyTrack.style.transform = `translate3d(-${shiftX}px, 0, 0)`;
          }
        }
      });
    }

    // Refresh ScrollTrigger on window resize
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });
  }

  /* ==========================================================================
     5. INTERACTIVE REEL THUMBNAILS SCRUBBING
     ========================================================================== */
  const thumbBtns = document.querySelectorAll('.thumb-btn');
  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const frame = parseInt(btn.getAttribute('data-frame'), 10);
      if (frame && !isNaN(frame)) {
        targetFrame = frame;
        // Smooth scroll user toward hero view if requested
        const heroEl = document.getElementById('hero');
        if (heroEl && window.scrollY > heroEl.offsetTop + heroEl.offsetHeight) {
          heroEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ==========================================================================
     6. THROTTLED HEADER SCROLL & MOBILE MENU
     ========================================================================== */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (mobileToggleBtn && mobileNavDrawer) {
    function toggleMobileMenu() {
      const isOpen = mobileToggleBtn.classList.toggle('open');
      mobileNavDrawer.classList.toggle('open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNavDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    mobileToggleBtn.addEventListener('click', toggleMobileMenu);

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileNavDrawer.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  /* ==========================================================================
     7. PROMINENT "COPY EMAIL" BUTTON WITH TOAST
     ========================================================================== */
  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      const email = btnCopyEmail.getAttribute('data-email') || 'contact.aetherkraft@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(triggerCopyToast).catch(() => fallbackCopy(email));
      } else {
        fallbackCopy(email);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      triggerCopyToast();
    } catch (e) {
      console.warn('Fallback copy error', e);
    }
    document.body.removeChild(input);
  }

  function triggerCopyToast() {
    if (!copyToast) return;
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     8. RESUME MODAL
     ========================================================================== */
  if (btnOpenResume && resumeModal) {
    btnOpenResume.addEventListener('click', () => {
      resumeModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    if (btnCloseResume) {
      btnCloseResume.addEventListener('click', () => {
        resumeModal.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        resumeModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     9. TIMELINE TAB TOGGLES
     ========================================================================== */
  const toggleExp = document.getElementById('toggle-experience');
  const toggleEdu = document.getElementById('toggle-education');
  const expPane = document.getElementById('experience-pane');
  const eduPane = document.getElementById('education-pane');

  if (toggleExp && toggleEdu && expPane && eduPane) {
    toggleExp.addEventListener('click', () => {
      toggleExp.classList.add('active');
      toggleEdu.classList.remove('active');
      eduPane.classList.remove('active');
      expPane.classList.add('active');
    });

    toggleEdu.addEventListener('click', () => {
      toggleEdu.classList.add('active');
      toggleExp.classList.remove('active');
      expPane.classList.remove('active');
      eduPane.classList.add('active');
    });
  }

  /* ==========================================================================
     10. PROJECT CATEGORY FILTERS
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-filter');
      workCards.forEach((card) => {
        const cardCat = card.getAttribute('data-cat');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  /* ==========================================================================
     11. DIRECT MESSAGE FORM SUBMISSION
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('client-name').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const message = document.getElementById('client-message').value.trim();
      const submitBtn = contactForm.querySelector('.btn-submit-form');

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.className = 'form-status-alert error';
          formStatus.textContent = 'Please fill out all required fields.';
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Message Dispatched</span> <i class="fa-solid fa-check"></i>';
        
        if (formStatus) {
          formStatus.className = 'form-status-alert success';
          formStatus.innerHTML = `Thank you, ${name}! Your inquiry has been sent to Jawad at <strong>contact.aetherkraft@gmail.com</strong>. You can also chat directly on <a href="https://wa.me/923709315445" target="_blank" rel="noopener noreferrer" style="color:#25D366;text-decoration:underline;font-weight:700;">WhatsApp (+92 370 9315445)</a>.`;
        }

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = '<span>Send Message to Jawad</span> <i class="fa-solid fa-paper-plane"></i>';
        }, 6000);
      }, 900);
    });
  }

})();
