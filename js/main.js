/**
 * Samiha Vahora — Portfolio Master Controller
 * Streamlined, Accessible, High-Performance Interactions
 */

(function () {
  'use strict';

  /* ----------------------------------------------------
     1. PROJECT CATEGORY FILTER
  ---------------------------------------------------- */
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-tab-btn');
    const projectCards = document.querySelectorAll('.project-showcase-card, .project-compact-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update active tab state
        filterButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter cards smoothly
        projectCards.forEach((card) => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = '';
            card.style.opacity = '1';
            card.style.transform = 'none';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ----------------------------------------------------
     2. ONE-CLICK EMAIL COPY & GLOBAL TOAST
  ---------------------------------------------------- */
  function showToast(message) {
    const toast = document.getElementById('global-toast');
    const toastText = document.getElementById('global-toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  function initEmailCopy() {
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const btnCopyChannel = document.getElementById('btn-copy-channel');

    function handleCopy(email) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => showToast(`Copied ${email} to clipboard!`))
          .catch(() => showToast(`Email: ${email}`));
      } else {
        showToast(`Email: ${email}`);
      }
    }

    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        const email = copyEmailBtn.getAttribute('data-email') || 'samihavahora71@gmail.com';
        handleCopy(email);
      });
    }

    if (btnCopyChannel) {
      btnCopyChannel.addEventListener('click', (e) => {
        e.preventDefault();
        handleCopy('samihavahora71@gmail.com');
      });
    }
  }

  /* ----------------------------------------------------
     3. ASYNC WEB3FORMS CONTACT DISPATCHER
  ---------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const formToast = document.getElementById('form-toast');
    const submitBtn = document.getElementById('btn-submit');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name')?.value || '';
      const email = document.getElementById('form-email')?.value || '';
      const subject = document.getElementById('form-subject')?.value || 'Portfolio Contact';
      const message = document.getElementById('form-message')?.value || '';
      const accessKey = document.getElementById('form-access-key')?.value || '';

      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';

      // Fallback helper for mailto
      const triggerMailtoFallback = (noticeText) => {
        const fullSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject}`);
        const fullBody = encodeURIComponent(
          `Hello Samiha,\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Subject: ${subject}\n\n` +
          `Message:\n${message}\n`
        );
        window.location.href = `mailto:samihavahora71@gmail.com?subject=${fullSubject}&body=${fullBody}`;
        if (formToast) {
          formToast.textContent = noticeText || `Opening your email app to deliver to samihavahora71@gmail.com!`;
          formToast.className = 'form-feedback-toast success';
          formToast.style.display = 'block';
        }
      };

      // If access key is placeholder, trigger direct mailto fallback
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        setTimeout(() => {
          triggerMailtoFallback(`Opening your email client to send your message to samihavahora71@gmail.com!`);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          form.reset();
        }, 300);
        return;
      }

      try {
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          form.reset();
          if (formToast) {
            formToast.textContent = `✓ Thank you, ${name}! Your message has been sent directly to Samiha's inbox.`;
            formToast.className = 'form-feedback-toast success';
            formToast.style.display = 'block';
            setTimeout(() => {
              formToast.style.display = 'none';
            }, 7000);
          }
        } else {
          triggerMailtoFallback(`Notice: ${result.message || 'Connecting to email app...'}`);
        }
      } catch (err) {
        triggerMailtoFallback(`Notice: Opening email client to deliver message...`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  /* ----------------------------------------------------
     4. MOBILE NAVIGATION DRAWER
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

    // Close on link click
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
      }
    });
  }

  /* ----------------------------------------------------
     5. SCROLL SPY ACTIVE NAVIGATION HIGHLIGHT
  ---------------------------------------------------- */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-pill-list .nav-link');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ----------------------------------------------------
     INITIALIZATION ON DOM READY
  ---------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initProjectFilters();
    initEmailCopy();
    initContactForm();
    initMobileMenu();
    initScrollSpy();
  });

})();
