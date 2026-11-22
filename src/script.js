import * as THREE from 'three';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from './shaders.js';

const CONFIG = {
  totalImages: 10,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
};

gsap.registerPlugin(ScrollTrigger);
const hero = document.querySelector('.hero');
const state = {
  isMobile: innerWidth < 768, width: hero.clientWidth, height: hero.clientHeight,
  scrollProgress: 0, scrollVelocity: 0, spinVelocity: 0,
  targetCameraY: 0, currentCameraY: 0, mouseX: 0, mouseY: 0,
  targetTiltX: 0, targetTiltZ: 0, currentTiltX: 0, currentTiltZ: 0,
};

const lenis = new Lenis({
  duration: 1.2, smoothWheel: true, smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ({ scroll, limit, velocity }) => {
  state.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
  state.scrollVelocity = velocity;
  state.spinVelocity += velocity * CONFIG.scrollRotationMultiplier * CONFIG.scrollMultiplier;
  ScrollTrigger.update();
});
(function lenisLoop(t) { lenis.raf(t); requestAnimationFrame(lenisLoop); })(0);

document.querySelectorAll('.hero__eyebrow').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo('#this-week'); }));
// Sidebar anchors on the home page scroll through Lenis
document.querySelectorAll('.nav a[href^="/#"]').forEach((a) => a.addEventListener('click', (e) => {
  const target = document.querySelector(a.getAttribute('href').slice(1));
  if (target) { e.preventDefault(); lenis.scrollTo(target); }
}));
document.querySelectorAll('.nav a[href="/"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(0); }));

function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, theta = t * arcAngle;
    const x = Math.sin(theta) * radius, z = Math.cos(theta) * radius;
    pos.push(x, tileHeight / 2, z, x, -tileHeight / 2, z);
    uv.push(t, 1, t, 0);
  }
  for (let i = 0; i < segments; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function loadTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  return Promise.all(Array.from({ length: CONFIG.totalImages }, (_, i) => new Promise((resolve) => {
    loader.load(`/images/img${i + 1}.jpg`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
      tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
      resolve(tex);
    }, undefined, () => {
      const t = new THREE.DataTexture(new Uint8Array([22, 22, 24, 255]), 1, 1);
      t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; resolve(t);
    });
  })));
}

async function initWebGL() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 100);
  camera.position.set(0, 0, CONFIG.cameraZ + (state.isMobile ? 3 : 0));
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(state.width, state.height);
  renderer.setClearColor(0, 0);
  renderer.domElement.classList.add('hero__canvas');
  hero.appendChild(renderer.domElement);

  const textures = await loadTextures(renderer);
  const total = CONFIG.tilesPerRevolution * CONFIG.revolutions;
  const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;
  const arcAngle = angleStep + CONFIG.tileOverlap;
  const chord = 2 * CONFIG.startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * CONFIG.tileHeightRatio;
  const startY = ((total - 1) * CONFIG.spiralGap) / 2;

  const spiral = new THREE.Group();
  for (let i = 0; i < total; i++) {
    const r = THREE.MathUtils.lerp(CONFIG.startRadius, CONFIG.endRadius, i / (total - 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: { uMap: { value: textures[i % CONFIG.totalImages] }, uCameraPosition: { value: camera.position } },
      side: THREE.DoubleSide, transparent: true,
    });
    const tile = new THREE.Mesh(createCurvedTileGeometry(r, arcAngle, tileHeight, CONFIG.tileSegments), mat);
    tile.position.y = startY - i * CONFIG.spiralGap;
    tile.rotation.y = i * angleStep;
    spiral.add(tile);
  }
  spiral.position.y = CONFIG.spiralOffsetY;
  scene.add(spiral);
  renderer.domElement.classList.add('is-ready');

  window.addEventListener('mousemove', (e) => {
    if (state.isMobile) return;
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / innerHeight) * 2 - 1;
    state.targetTiltX = state.mouseY * CONFIG.parallaxStrength;
    state.targetTiltZ = state.mouseX * CONFIG.parallaxStrength * -0.5;
  });
  window.addEventListener('resize', () => {
    state.isMobile = innerWidth < 768;
    state.width = hero.clientWidth; state.height = hero.clientHeight;
    camera.aspect = state.width / state.height; camera.updateProjectionMatrix();
    camera.position.z = CONFIG.cameraZ + (state.isMobile ? 3 : 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(state.width, state.height);
    if (state.isMobile) { state.targetTiltX = 0; state.targetTiltZ = 0; }
  });

  (function tick() {
    spiral.rotation.y += CONFIG.baseRotationSpeed + state.spinVelocity;
    state.spinVelocity *= CONFIG.rotationDecay;
    if (!state.isMobile) {
      state.currentTiltX += (state.targetTiltX - state.currentTiltX) * CONFIG.cameraSmoothing;
      state.currentTiltZ += (state.targetTiltZ - state.currentTiltZ) * CONFIG.cameraSmoothing;
      spiral.rotation.x = state.currentTiltX;
      spiral.rotation.z = state.currentTiltZ;
    }
    state.targetCameraY = -state.scrollProgress * CONFIG.cameraYMultiplier * 10;
    state.currentCameraY += (state.targetCameraY - state.currentCameraY) * CONFIG.cameraSmoothing;
    camera.position.y = state.currentCameraY;
    camera.lookAt(0, state.currentCameraY * 0.4, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  })();
}
if ('requestIdleCallback' in window) requestIdleCallback(initWebGL, { timeout: 1500 });
else requestAnimationFrame(() => requestAnimationFrame(initWebGL));

const ctx = gsap.context(() => {
  gsap.utils.toArray('.reveal-text').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none', once: true },
    });
  });
});
if (import.meta.hot) import.meta.hot.dispose(() => ctx.revert());
window.addEventListener('load', () => ScrollTrigger.refresh());
