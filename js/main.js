/**
 * Samiha Vahora — Portfolio Master Controller & 3D WebGL Aurora Engine
 * High-performance Three.js Fluid Point Cloud, 3D Card Tilt, Tabs & Interactions
 */

(function () {
  'use strict';

  /* ----------------------------------------------------
     1. THREE.JS 3D AURORA FLUID SWARM ENGINE (LIGHT THEME)
  ---------------------------------------------------- */
  const container = document.getElementById('webgl-container');
  let scene, camera, renderer;
  let particleSystem, particlePositions, originalPositions, particleVelocities;
  let particleCount = window.innerWidth < 768 ? 6000 : 12000;
  let isMobile = window.innerWidth < 768;

  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0, targetScrollProgress = 0;

  function init3D() {
    if (!container || typeof THREE === 'undefined') return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // WebGL Renderer with transparency for light background
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Build Particle Mesh
    createAuroraSwarm();

    // Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Render loop
    animate(0);
  }

  function createAuroraSwarm() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    originalPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    particleVelocities = new Float32Array(particleCount * 3);

    // Light Theme Color Palette (Electric Cyan, Royal Indigo, Violet, Rose, Amber)
    const colorIndigo = new THREE.Color(0x4f46e5);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorViolet = new THREE.Color(0x7c3aed);
    const colorRose = new THREE.Color(0xf43f5e);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Elongated fluid helix / ribbon formation
      const radius = Math.pow(Math.random(), 2.0) * 2.6 + 0.3;
      const height = (Math.random() - 0.5) * 5.2;
      
      const x = (Math.sin(phi) * Math.cos(theta) * radius * 0.95) + (Math.sin(height * 1.2) * 0.5);
      const y = height + (Math.sin(theta * 2.5) * 0.25);
      const z = (Math.sin(phi) * Math.sin(theta) * radius * 0.85) + (Math.cos(height * 1.1) * 0.4);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.015;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015;

      // Color mapping
      const distFromCenter = Math.sqrt(x * x + z * z);
      let pColor;
      if (distFromCenter < 0.8) {
        pColor = colorIndigo.clone().lerp(colorViolet, Math.random() * 0.5);
      } else if (distFromCenter < 1.6) {
        pColor = colorViolet.clone().lerp(colorCyan, Math.random() * 0.7);
      } else {
        pColor = colorCyan.clone().lerp(colorRose, Math.random() * 0.6);
      }

      particleColors[i * 3] = pColor.r;
      particleColors[i * 3 + 1] = pColor.g;
      particleColors[i * 3 + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Crisp glowing soft circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.045 : 0.055,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }

  function onScroll() {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0) {
      targetScrollProgress = window.scrollY / totalScroll;
    }
  }

  function animate(time) {
    requestAnimationFrame(animate);

    // Smooth dampening
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.06;

    const elapsed = time * 0.001;

    if (particleSystem) {
      // Rotation & gentle levitation
      particleSystem.rotation.y = elapsed * 0.08 + mouse.x * 0.35;
      particleSystem.rotation.x = Math.sin(elapsed * 0.15) * 0.1 + mouse.y * 0.25;
      particleSystem.rotation.z = Math.cos(elapsed * 0.1) * 0.05 + scrollProgress * 0.5;

      const positions = particleSystem.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const origX = originalPositions[i3];
        const origY = originalPositions[i3 + 1];
        const origZ = originalPositions[i3 + 2];

        // Fluid curling wave motion
        const wave = Math.sin(elapsed * 1.5 + origY * 2.0 + origX) * 0.05;
        const waveZ = Math.cos(elapsed * 1.2 + origX * 2.0) * 0.04;

        positions[i3] = origX + wave + (mouse.x * 0.15);
        positions[i3 + 1] = origY + Math.cos(elapsed + origZ) * 0.03;
        positions[i3 + 2] = origZ + waveZ;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  /* ----------------------------------------------------
     2. 3D CARD TILT & HOLOGRAPHIC REFLECTION
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

        const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  /* ----------------------------------------------------
     3. HERO CONSOLE INTERACTIVE TABS
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
     4. PROJECT FILTERING TABS
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
     5. ONE-CLICK EMAIL COPY & GLOBAL TOAST
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
     6. NAVBAR SCROLLSPY & ACTIVE TRACKER
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
     7. CONTACT FORM EMAIL DISPATCHER
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
     INITIALIZATION ON DOM LOAD
  ---------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    init3D();
    initTiltCards();
    initConsoleTabs();
    initProjectFilters();
    initEmailCopy();
    initNavbarScrollSpy();
    initContactForm();
  });

})();
