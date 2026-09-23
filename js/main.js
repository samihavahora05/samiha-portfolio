/**
 * Samiha Vahora — 3D Bioluminescent Quantum Particle Swarm & Interactive Engine
 * Three.js Fluid Point Cloud + Mouse Curl Physics + 3D Tilt Controller
 */

(function () {
  'use strict';

  /* ----------------------------------------------------
     1. THREE.JS 3D QUANTUM SWARM ENGINE
  ---------------------------------------------------- */
  const container = document.getElementById('webgl-container');
  let scene, camera, renderer;
  let particleSystem, particlePositions, originalPositions, particleColors, particleVelocities;
  let particleCount = window.innerWidth < 768 ? 8000 : 18000;
  let isMobile = window.innerWidth < 768;

  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 };
  let scrollProgress = 0, targetScrollProgress = 0;

  function init3D() {
    if (!container || typeof THREE === 'undefined') return;

    // Scene with deep obsidian fog
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.035);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Create 3D Swarm System
    createParticleSwarm();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Animation Loop
    animate(0);
  }

  /* ----------------------------------------------------
     2. BIOLUMINESCENT PARTICLE SWARM CREATION
  ---------------------------------------------------- */
  function createParticleSwarm() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    originalPositions = new Float32Array(particleCount * 3);
    particleColors = new Float32Array(particleCount * 3);
    particleVelocities = new Float32Array(particleCount * 3);

    // Color Palette matching reference (Intense White core, Royal Blue, Sky Blue, Deep Indigo)
    const colorWhite = new THREE.Color(0xffffff);
    const colorSky = new THREE.Color(0x60a5fa);
    const colorRoyal = new THREE.Color(0x3b82f6);
    const colorIndigo = new THREE.Color(0x4338ca);

    for (let i = 0; i < particleCount; i++) {
      // Swirling vertical fluid cloud distribution (matching reference center)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Vertical elongated cloud
      const radius = Math.pow(Math.random(), 2.2) * 2.2 + 0.2;
      const height = (Math.random() - 0.5) * 4.8;
      
      const x = (Math.sin(phi) * Math.cos(theta) * radius * 0.9) + (Math.sin(height * 1.5) * 0.4);
      const y = height + (Math.sin(theta * 2) * 0.2);
      const z = (Math.sin(phi) * Math.sin(theta) * radius * 0.8) + (Math.cos(height * 1.2) * 0.3);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Color gradient: Dense center is glowing bright white, transitioning to royal & sky blue at edges
      const distFromCore = Math.sqrt(x * x + z * z);
      let pColor;
      if (distFromCore < 0.6 && Math.random() > 0.4) {
        pColor = colorWhite.clone().lerp(colorSky, Math.random() * 0.3);
      } else if (distFromCore < 1.4) {
        pColor = colorSky.clone().lerp(colorRoyal, Math.random());
      } else {
        pColor = colorRoyal.clone().lerp(colorIndigo, Math.random() * 0.8);
      }

      particleColors[i * 3] = pColor.r;
      particleColors[i * 3 + 1] = pColor.g;
      particleColors[i * 3 + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom circular soft glow texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(147,197,253,0.85)');
    grad.addColorStop(0.6, 'rgba(59,130,246,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.095,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  /* ----------------------------------------------------
     3. EVENT HANDLERS
  ---------------------------------------------------- */
  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    mouse.worldX = mouse.targetX * 3.5;
    mouse.worldY = mouse.targetY * 2.5;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      mouse.worldX = mouse.targetX * 3.5;
      mouse.worldY = mouse.targetY * 2.5;
    }
  }

  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScrollProgress = Math.max(0, Math.min(1, scrollY / (maxScroll || 1)));

    const nav = document.getElementById('navbar');
    if (nav) {
      if (scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  }

  function onWindowResize() {
    isMobile = window.innerWidth < 768;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /* ----------------------------------------------------
     4. SIMULATION ANIMATION LOOP
  ---------------------------------------------------- */
  function animate(timestamp) {
    requestAnimationFrame(animate);

    // Smooth Lerps
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

    const time = timestamp * 0.001;

    // Camera Motion with scroll and mouse parallax
    camera.position.x = mouse.x * 0.4 + Math.sin(scrollProgress * Math.PI) * 0.5;
    camera.position.y = mouse.y * 0.3 - scrollProgress * 1.5;
    camera.lookAt(0, -scrollProgress * 1.5, 0);

    // Fluid Swarm Physics Simulation
    if (particleSystem && particlePositions) {
      const pos = particlePositions;
      const orig = originalPositions;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Base Harmonic Wave & Curl Motion
        const ox = orig[i3];
        const oy = orig[i3 + 1];
        const oz = orig[i3 + 2];

        // Wave calculation
        const waveX = Math.sin(time * 1.2 + oy * 1.5) * 0.15 + Math.cos(time * 0.8 + oz * 1.2) * 0.1;
        const waveY = Math.cos(time * 1.0 + ox * 1.4) * 0.18 + Math.sin(time * 0.6 + oz * 1.5) * 0.12;
        const waveZ = Math.sin(time * 0.9 + ox * 1.2) * 0.15;

        let curX = ox + waveX;
        let curY = oy + waveY;
        let curZ = oz + waveZ;

        // Mouse Repulsion / Attraction Fluid Force
        const dx = curX - mouse.worldX;
        const dy = curY - mouse.worldY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.8) {
          const force = (1.8 - dist) * 0.35;
          const angle = Math.atan2(dy, dx);
          curX += Math.cos(angle + 1.2) * force; // Swirl angle
          curY += Math.sin(angle + 1.2) * force;
          curZ += Math.sin(dist * 4.0 - time * 2.0) * 0.25;
        }

        pos[i3] = curX;
        pos[i3 + 1] = curY;
        pos[i3 + 2] = curZ;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = time * 0.15 + scrollProgress * Math.PI;
    }

    renderer.render(scene, camera);
  }

  /* ----------------------------------------------------
     5. 3D TILT ON CODE CARD & INTERACTIVE FORMS
  ---------------------------------------------------- */
  function initCardTilts() {
    const codeCard = document.querySelector('.hero-right-code-card');
    if (codeCard) {
      codeCard.addEventListener('mousemove', (e) => {
        const rect = codeCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -8;
        const rotY = ((x - cx) / cx) * 8;
        codeCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
      codeCard.addEventListener('mouseleave', () => {
        codeCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    }

    // Contact Form Handling
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('contact-toast');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('form-name')?.value || 'Friend';
        const email = document.getElementById('form-email')?.value || '';
        const subject = document.getElementById('form-subject')?.value || 'Project Inquiry';
        const message = document.getElementById('form-message')?.value || '';

        if (toast) {
          toast.textContent = `Thank you, ${name}! Opening mail client...`;
          toast.className = 'toast-feedback-lux success';
          setTimeout(() => {
            window.location.href = `mailto:samihavahora71@gmail.com?subject=${encodeURIComponent(
              subject
            )}&body=${encodeURIComponent(`Hi Samiha,\n\n${message}\n\nFrom: ${name} (${email})`)}`;
          }, 700);
        }
      });
    }

    // Nav Link Active Scroll Spy
    const navLinks = document.querySelectorAll('.nav-link-btn');
    const sections = document.querySelectorAll('section, header.ref-hero-section');

    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach((s) => {
        const top = s.offsetTop - 160;
        if (window.scrollY >= top) cur = s.getAttribute('id');
      });

      navLinks.forEach((a) => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${cur}`) a.classList.add('active');
      });
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    init3D();
    initCardTilts();
  });
})();
