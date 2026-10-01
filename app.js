/**
 * AETHER KRAFT — A DIGITAL STUDIO BY JAWAD
 * Ultra-Performance Script: 60+ FPS Scroll, Lightweight Reveals & Touch Navigation
 */

(function () {
  'use strict';

  // DOM Elements
  const siteHeader = document.getElementById('site-header');
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const contactForm = document.getElementById('project-contact-form');
  const formStatus = document.getElementById('form-status');

  /* ==========================================================================
     1. HIGH-PERFORMANCE THROTTLED HEADER SCROLL LISTENER
     ========================================================================== */
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  /* ==========================================================================
     2. ACCESSIBLE & TOUCH-FRIENDLY MOBILE NAVIGATION
     ========================================================================== */
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

    // Close drawer when any mobile nav link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileNavDrawer.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });
  }

  /* ==========================================================================
     3. LIGHTWEIGHT INTERSECTION OBSERVER REVEALS (ZERO SCROLL LAG)
     Uses native GPU compositor without JS scroll scrub
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.about-card, .pricing-showcase-card, .work-card, .gallery-card, .channel-card'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(el);
    });
  }

  /* ==========================================================================
     4. ACTIVE NAVIGATION LINK TRACKING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-item');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ==========================================================================
     5. DIRECT MESSAGE FORM SUBMISSION
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('client-name').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const budget = document.getElementById('client-budget').value;
      const whatsapp = document.getElementById('client-whatsapp').value.trim();
      const message = document.getElementById('client-message').value.trim();
      const submitBtn = contactForm.querySelector('.btn-submit-form');

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.className = 'form-status-alert error';
          formStatus.textContent = 'Please fill out all required fields.';
        }
        return;
      }

      // Visual feedback
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Transmission...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Message Dispatched</span> <i class="fa-solid fa-check"></i>';
        
        if (formStatus) {
          formStatus.className = 'form-status-alert success';
          formStatus.innerHTML = `Thank you, ${name}! Your inquiry has been sent to Jawad at <strong>contact.aetherkraft@gmail.com</strong>. You can also message immediately on <a href="https://wa.me/923709315445" target="_blank" rel="noopener noreferrer" style="color:#25D366;text-decoration:underline;">WhatsApp (+92 370 9315445)</a>.`;
        }

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = '<span>Send Message to Jawad</span> <i class="fa-solid fa-paper-plane"></i>';
        }, 6000);
      }, 900);
    });
  }

})();
