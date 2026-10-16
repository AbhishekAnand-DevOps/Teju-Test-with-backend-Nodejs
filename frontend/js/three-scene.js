/**
 * TEJASHWINI PORTFOLIO — THREE.JS 3D INTERACTIVE HERO SCENE
 * Generates an interactive iridescent geometric artifact & particle network
 * with smooth mouse/touch tracking, camera parallax, and mobile-optimized responsiveness.
 */

(function () {
  const container = document.getElementById('hero-3d-canvas');
  if (!container || typeof THREE === 'undefined') return;

  // Check reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Group for all rotating elements
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  function adjustLayoutForScreen() {
    const isMobile = window.innerWidth <= 768;
    const isSmallPhone = window.innerWidth <= 480;

    if (isSmallPhone) {
      mainGroup.scale.set(0.68, 0.68, 0.68);
      mainGroup.position.set(0, -0.3, 0);
    } else if (isMobile) {
      mainGroup.scale.set(0.8, 0.8, 0.8);
      mainGroup.position.set(0, -0.4, 0);
    } else {
      mainGroup.scale.set(1, 1, 1);
      mainGroup.position.set(1.2, 0, 0);
    }
  }

  adjustLayoutForScreen();

  // 1. Central Complex Torus Knot / Organic Artifact
  const torusKnotGeo = new THREE.TorusKnotGeometry(1.3, 0.38, 128, 32, 2, 3);
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1235,
    emissive: 0x1f0f3d,
    roughness: 0.15,
    metalness: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    wireframe: false,
  });

  const mainMesh = new THREE.Mesh(torusKnotGeo, torusMat);
  mainGroup.add(mainMesh);

  // 2. Outer Wireframe Hologram Layer
  const wireframeGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
  mainGroup.add(wireframeMesh);

  // 3. Orbiting Cyber Ring
  const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.4,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 3;
  mainGroup.add(ringMesh);

  // 4. Floating Particle Dust Network
  const particleCount = window.innerWidth <= 768 ? 100 : 180;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x8b5cf6), // Violet
    new THREE.Color(0xff2a70), // Coral
    new THREE.Color(0x00f2fe), // Cyan
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 12;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 8;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = chosenColor.r;
    colors[i3 + 1] = chosenColor.g;
    colors[i3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: window.innerWidth <= 768 ? 0.035 : 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Lights Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const violetLight = new THREE.PointLight(0x8b5cf6, 6, 20);
  violetLight.position.set(4, 3, 3);
  scene.add(violetLight);

  const coralLight = new THREE.PointLight(0xff2a70, 7, 20);
  coralLight.position.set(-4, -3, 2);
  scene.add(coralLight);

  const cyanLight = new THREE.DirectionalLight(0x00f2fe, 3);
  cyanLight.position.set(0, 5, 4);
  scene.add(cyanLight);

  // Mouse & Touch Interactivity
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  function updatePointerPos(clientX, clientY) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (clientX - windowHalfX) * 0.001;
    mouseY = (clientY - windowHalfY) * 0.001;
  }

  window.addEventListener('mousemove', (e) => {
    updatePointerPos(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Scroll Interactivity
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // Window Resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    adjustLayoutForScreen();
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Lerp pointer coordinates
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate Main Mesh
      mainMesh.rotation.x = elapsedTime * 0.25 + targetY * 2 + scrollY * 0.001;
      mainMesh.rotation.y = elapsedTime * 0.35 + targetX * 2 + scrollY * 0.0015;

      // Rotate Wireframe Cage
      wireframeMesh.rotation.x = -elapsedTime * 0.15;
      wireframeMesh.rotation.y = elapsedTime * 0.2;

      // Rotate Ring
      ringMesh.rotation.z = elapsedTime * 0.5;
      ringMesh.rotation.x = Math.PI / 3 + targetY;

      // Particle Drift
      particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 0.5;
      particleSystem.rotation.x = targetY * 0.3;

      // Subtle light oscillation
      violetLight.position.x = Math.sin(elapsedTime * 0.8) * 4;
      violetLight.position.y = Math.cos(elapsedTime * 0.6) * 3;
      coralLight.position.x = -Math.cos(elapsedTime * 0.7) * 4;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
