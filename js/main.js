/**
 * Samiha Vahora — Portfolio Master Controller
 * Interactive 3D Tilt Cards, Hero Code Tabs, Project Filters, Toast & Contact Dispatcher
 */

(function () {
  'use strict';

  /* ----------------------------------------------------
     1. 3D CARD TILT & HOLOGRAPHIC REFLECTION
  ---------------------------------------------------- */
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card-wrapper, .project-glass-card, .experience-card-featured');
    if (window.innerWidth < 1024) return; // Disable on touch/small screens

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  /* ----------------------------------------------------
     2. HERO CONSOLE INTERACTIVE TABS
  ---------------------------------------------------- */
  function initConsoleTabs() {
    const tabs = document.querySelectorAll('.console-tab');
    const bodies = document.querySelectorAll('.console-body');
    const badge = document.querySelector('.console-badge-lang');

    const langMap = {
      'insurmatch': 'TypeScript',
      'ai-scanner': 'Kotlin / TFLite',
      'hrms': 'PHP / Laravel'
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        tabs.forEach((t) => t.classList.remove('active'));
        bodies.forEach((b) => b.classList.remove('active'));

        tab.classList.add('active');
        const activeBody = document.getElementById(`tab-${target}`);
        if (activeBody) {
          activeBody.classList.add('active');
        }

        if (badge && langMap[target]) {
          badge.textContent = langMap[target];
        }
      });
    });
  }

  /* ----------------------------------------------------
     3. PROJECT FILTERING TABS
  ---------------------------------------------------- */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-tab-btn');
    const projects = document.querySelectorAll('.project-glass-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        projects.forEach((card) => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            setTimeout(() => {
              card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 30);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ----------------------------------------------------
     4. ONE-CLICK EMAIL COPY & GLOBAL TOAST
  ---------------------------------------------------- */
  function initEmailCopy() {
    const copyBtns = [
      document.getElementById('copy-email-btn'),
      document.getElementById('btn-copy-channel')
    ];
    const toast = document.getElementById('global-toast');
    const toastText = document.getElementById('global-toast-text');

    function triggerToast(message) {
      if (!toast) return;
      if (toastText) toastText.textContent = message;
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 2800);
    }

    copyBtns.forEach((btn) => {
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = 'samihavahora71@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          triggerToast('Email copied to clipboard: ' + email);
        }).catch(() => {
          triggerToast('Direct Email: ' + email);
        });
      });
    });
  }

  /* ----------------------------------------------------
     5. NAVBAR SCROLLSPY & ACTIVE TRACKER
  ---------------------------------------------------- */
  function initNavbarScrollSpy() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      if (navbar) {
        if (scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      sections.forEach((section) => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 140;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------
     6. CONTACT FORM EMAIL DISPATCHER
  ---------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const formToast = document.getElementById('form-toast');
    const submitBtn = document.getElementById('btn-submit');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name')?.value || '';
      const email = document.getElementById('form-email')?.value || '';
      const subject = document.getElementById('form-subject')?.value || 'Portfolio Contact';
      const message = document.getElementById('form-message')?.value || '';

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Preparing Email...</span>';

      // Build complete formatted email body with all visitor info
      const fullSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject}`);
      const fullBody = encodeURIComponent(
        `Hello Samiha,\n\n` +
        `You received a new message from your portfolio website:\n\n` +
        `----------------------------------------\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Subject: ${subject}\n` +
        `----------------------------------------\n\n` +
        `Message:\n${message}\n\n` +
        `----------------------------------------`
      );

      // Trigger direct mailto delivery to samihavahora71@gmail.com
      const mailtoUrl = `mailto:samihavahora71@gmail.com?subject=${fullSubject}&body=${fullBody}`;
      
      setTimeout(() => {
        window.location.href = mailtoUrl;

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        if (formToast) {
          formToast.textContent = `Opening your email client to send your message to samihavahora71@gmail.com!`;
          formToast.className = 'form-feedback-toast success';
          formToast.style.display = 'block';

          setTimeout(() => {
            formToast.style.display = 'none';
          }, 8000);
        }
      }, 500);
    });
  }

  /* ----------------------------------------------------
     7. RESPONSIVE MOBILE NAVIGATION TOGGLE
  ---------------------------------------------------- */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-pill-list');

    if (!toggleBtn || !navMenu) return;

    function setMenuState(open) {
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggleBtn.classList.toggle('open', open);
      navMenu.classList.toggle('open', open);
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      setMenuState(!isOpen);
    });

    // Close on any link click
    const links = navMenu.querySelectorAll('.nav-link');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        setMenuState(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenuState(false);
        toggleBtn.focus();
      }
    });
  }

  /* ----------------------------------------------------
     8. DYNAMIC DEVELOPER TYPEWRITER ANIMATION
  ---------------------------------------------------- */
  function initTypewriter() {
    const textEl = document.getElementById('typewriter-text');
    if (!textEl) return;

    const phrases = [
      "I'm Samiha Vahora",
      "Full Stack Web & Mobile Engineer",
      "Shipped production systems at BLUEBOXX DA",
      "AI/ML Developer — YOLOv8 & pgvector",
      "Passionate learner, always exploring new tech",
      "Actively seeking full-time SDE roles & opportunities"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 65;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 30;
      } else {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 65;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of phrase
        isDeleting = true;
        typingSpeed = 2200;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 450;
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  /* ----------------------------------------------------
     INITIALIZATION ON DOM LOAD
  ---------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTiltCards();
    initConsoleTabs();
    initProjectFilters();
    initEmailCopy();
    initNavbarScrollSpy();
    initContactForm();
    initMobileMenu();
    initTypewriter();
  });

})();
