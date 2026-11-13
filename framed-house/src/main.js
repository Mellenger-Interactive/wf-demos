import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { products } from './products.js';
import { BUILD_SECONDS, PART_RAMP, STAGES, stageLabel } from './timeline.js';

// The house is public/framed-house.glb, exported from Blender (wf_framed_house.blend) by
// export_web_glb.py: ~330 merged parts, each one product, tagged (glTF extras → userData) with
// wf_product, wf_layer, wf_stage (when it drops in, 0–1) and wf_explode (exploded offset).
const MODEL_URL = `${import.meta.env.BASE_URL}framed-house.glb`;
// Scenery, not products: always shown (foundation, gravel) or shown with the house (stairs,
// sill gasket). Not selectable.
const BASE = ['foundation', 'site'];

const $ = (s) => document.querySelector(s),
  canvas = $('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Lighting is the wood-house page's, value for value (tone mapping, sky, sun, fill).
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 150);
// Fraction of the canvas height the house sits below centre (less on phones, where the view
// buttons sit under it).
const VIEW_DROP = { desktop: 0.08, phone: 0.03 };
const TARGET = new THREE.Vector3(0, 3.4, 0);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 14;
controls.maxDistance = 48;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
function reset() {
  camera.position.set(12.6, 14.3, 23.7); // front-right, the garage's open bay facing you
  controls.target.copy(TARGET);
  controls.update();
}
reset();
const hemi = new THREE.HemisphereLight(0xffffff, 0x7f8971, 2.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d8, 4);
sun.position.set(-8, 18, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -14;
sun.shadow.camera.right = 14;
sun.shadow.camera.top = 14;
sun.shadow.camera.bottom = -14;
sun.shadow.camera.far = 60;
sun.shadow.normalBias = 0.035;
sun.shadow.bias = -0.0001;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd4e4ff, 1.2);
fill.position.set(10, 8, -12);
scene.add(fill);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ color: 0x536044, opacity: 0.17 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.07;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(36, 36, 0xdde1d6, 0xe0e5da);
grid.position.y = -0.065;
grid.material.transparent = true;
grid.material.opacity = 0.22;
scene.add(grid);

// The wood-house page's OSB texture (same code): pale board with soft, low-contrast strands.
// It replaces the model's darker, busier OSB image on the 'WF OSB' material (wall sheathing,
// rimboard, I-joist webs). One tile covers 1.2 m, the model's OSB UV scale.
function osbTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d2ad7c'; // a touch warmer than wood-house's #c9ac79, which read green here
  ctx.fillRect(0, 0, 256, 256);
  let seed = 29;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 2200; i++) {
    ctx.save();
    ctx.translate(rnd() * 256, rnd() * 256);
    ctx.rotate(rnd() * Math.PI);
    ctx.fillStyle = `rgba(112,72,32,${rnd() * 0.17})`;
    ctx.fillRect(0, 0, rnd() * 22 + 3, rnd() * 4 + 1);
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const osbMap = osbTexture();

const house = new THREE.Group();
scene.add(house);
/** Merged model parts (one product each), filled when the GLB loads. */
let parts = [];
/** Per-product material clones: { mat, product, color } (shared GLB materials are split per
 * product so selection can highlight one product). */
const mats = [];

let progress = 1,
  playing = false,
  exploded = false,
  explodeValue = 0,
  selected = null; // the most recent pick, shown in the detail panel
// Products shown in isolation. Cards (and parts in the view) toggle in and out; empty shows all.
const selection = new Set();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const productIds = new Set(products.map((p) => p.id));

$('#products').innerHTML = products
  .map(
    (p) =>
      `<button class="product" data-id="${p.id}" aria-pressed="false"><span class="swatch" style="--color:${p.color}"></span><span>${p.name}<small>${p.type}</small></span></button>`,
  )
  .join('');
// select(id) toggles a product in or out of the selection; select(null) clears it.
function select(id) {
  if (id === null) selection.clear();
  else if (!selection.delete(id)) selection.add(id);
  selected = [...selection].at(-1) ?? null;
  document.querySelectorAll('.product').forEach((el) => {
    el.classList.toggle('active', selection.has(el.dataset.id));
    el.setAttribute('aria-pressed', selection.has(el.dataset.id));
  });
  const p = products.find((p) => p.id === selected);
  $('#detail').innerHTML = p
    ? `<span class="eyebrow">${p.type} · IN THE HOUSE</span><h3>${p.name}</h3><p>${p.desc}</p><a href="${p.url}" target="_blank" rel="noopener">Learn More →</a><button id="clear">Show all products</button>`
    : `<span class="eyebrow">ATTRIBUTES OF WOOD</span><h3>Carbon Storage</h3><p>Responsibly sourced wood products are grown naturally, capture carbon dioxide from the atmosphere as they grow and continue to store carbon throughout their lifetime.</p><a href="https://www.westfraser.com/products" target="_blank" rel="noopener">Explore Our Products →</a>`;
  $('#clear')?.addEventListener('click', () => select(null));
  if (p) {
    progress = 1;
    playing = false;
    syncUI();
  }
}
select(null);
$('#products').addEventListener('click', (e) => {
  const b = e.target.closest('[data-id]');
  if (b) select(b.dataset.id);
});
function syncUI() {
  $('#progress').value = progress * 100;
  $('#percent').innerHTML = `${Math.round(progress * 100)}<span>%</span>`;
  $('#play').textContent = playing ? 'Ⅱ' : '▶';
  $('#play').setAttribute('aria-label', playing ? 'Pause build animation' : 'Play build animation');
  $('#stage-label').textContent = stageLabel(progress);
}
$('#play').onclick = () => {
  if (!playing) {
    if (progress >= 0.999) progress = 0;
    if (selection.size) select(null);
    exploded = false;
    $('#explode').setAttribute('aria-pressed', 'false');
  }
  playing = !playing;
  syncUI();
};
$('#progress').oninput = (e) => {
  playing = false;
  progress = Number(e.target.value) / 100;
  syncUI();
};
$('.timeline-labels').innerHTML = STAGES.map(
  (s) => `<button data-progress="${s.stop}">${s.button}</button>`,
).join('');
document.querySelectorAll('[data-progress]').forEach(
  (b) =>
    (b.onclick = () => {
      progress = Number(b.dataset.progress) / 100;
      playing = false;
      syncUI();
    }),
);
$('#explode').onclick = () => {
  exploded = !exploded;
  $('#explode').setAttribute('aria-pressed', exploded);
  progress = 1;
  playing = false;
  syncUI();
};
$('#reset').onclick = () => {
  reset();
  exploded = false;
  $('#explode').setAttribute('aria-pressed', 'false');
  progress = 1;
  playing = false;
  syncUI();
  select(null);
};

const raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2();
let down;
canvas.addEventListener('pointerdown', (e) => {
  down = [e.clientX, e.clientY];
});
// The part (top-level node) a mesh belongs to.
const partOf = (o) => {
  while (o && !o.userData.wf_product) o = o.parent;
  return o;
};
function hit(e) {
  const r = canvas.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  for (const h of raycaster.intersectObjects(parts, true)) {
    const part = partOf(h.object);
    if (part?.visible && productIds.has(part.userData.wf_product)) return part;
  }
  return null;
}
canvas.addEventListener('pointerup', (e) => {
  if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) {
    const part = hit(e);
    if (part) select(part.userData.wf_product);
  }
  down = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons || !parts.length) return;
  const part = hit(e),
    label = $('#hover-label');
  label.hidden = !part;
  canvas.style.cursor = part ? 'pointer' : 'grab';
  if (part) {
    label.textContent = products.find((p) => p.id === part.userData.wf_product).name;
    const r = canvas.getBoundingClientRect();
    label.style.left = Math.min(e.clientX - r.left + 14, r.width - 220) + 'px';
    label.style.top = e.clientY - r.top - 35 + 'px';
  }
});
canvas.addEventListener('pointerleave', () => ($('#hover-label').hidden = true));
function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 550 ? 46 : 35;
  // Lens shift: draw the house lower in the frame without moving the orbit pivot.
  camera.setViewOffset(
    width,
    height,
    0,
    -Math.round(height * VIEW_DROP[width < 550 ? 'phone' : 'desktop']),
    width,
    height,
  );
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

new GLTFLoader().load(
  MODEL_URL,
  (gltf) => {
    const root = gltf.scene;
    // Centre the house on the orbit pivot (gravel top at y 0).
    const box = new THREE.Box3();
    root.children.forEach((o) => {
      if (o.userData.wf_product !== 'site') box.expandByObject(o);
    });
    const c = box.getCenter(new THREE.Vector3());
    house.position.set(-c.x, 0, -c.z);
    const cache = new Map();
    parts = [...root.children];
    for (const part of parts) {
      const product = part.userData.wf_product;
      part.userData.basePosition = part.position.clone();
      part.userData.baseScale = part.scale.clone();
      part.userData.explode = new THREE.Vector3().fromArray(part.userData.wf_explode ?? [0, 0, 0]);
      part.traverse((m) => {
        if (!m.isMesh) return;
        m.castShadow = product !== 'site';
        m.receiveShadow = true;
        m.material = [m.material].flat().map((src) => {
          const key = `${product}|${src.uuid}`;
          if (!cache.has(key)) {
            const mat = src.clone();
            if (src.name === 'WF OSB') mat.map = osbMap;
            if (mat.map) mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
            if (mat.metalness > 0.2) mat.metalness = 0.2; // no environment map to reflect
            cache.set(key, mat);
            mats.push({ mat, product, color: mat.color.clone() });
          }
          return cache.get(key);
        });
        if (m.material.length === 1) m.material = m.material[0];
      });
    }
    house.add(...parts);
    $('#loading').hidden = true;
    window.houseExplorer.parts = parts.length;
  },
  undefined,
  (err) => {
    console.error(err);
    $('#loading').textContent = 'The house could not be loaded.';
  },
);

const DIM = new THREE.Color('#e6e9df');
function updateParts(dt) {
  explodeValue = THREE.MathUtils.damp(explodeValue, exploded ? 1 : 0, reduced ? 100 : 5, dt);
  for (const { mat, product, color } of mats) {
    mat.color.copy(color);
    if (selection.size && !selection.has(product)) mat.color.lerp(DIM, 0.76);
    mat.emissive.set(selection.has(product) ? '#40331b' : '#000000');
    mat.emissiveIntensity = 0.12;
  }
  for (const part of parts) {
    const d = part.userData,
      product = d.wf_product,
      base = BASE.includes(product);
    const f = base ? 1 : THREE.MathUtils.clamp((progress - (d.wf_stage ?? 0)) / PART_RAMP, 0, 1),
      smooth = 1 - Math.pow(1 - f, 3);
    part.visible = f > 0;
    // A selection shows only the selected products (on the foundation).
    if (selection.size && !base && !selection.has(product)) part.visible = false;
    part.position.copy(d.basePosition);
    part.position.y += (1 - smooth) * 3;
    part.position.addScaledVector(d.explode, explodeValue);
    part.scale.copy(d.baseScale).multiplyScalar(Math.max(0.001, smooth));
  }
}
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (playing) {
    progress = Math.min(1, progress + dt / BUILD_SECONDS);
    if (progress === 1) playing = false;
    syncUI();
  }
  updateParts(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

window.houseExplorer = {
  parts: 0,
  products: products.length,
  getState: () => ({ progress, playing, exploded, selected, selection: [...selection] }),
  scene,
  camera,
  controls,
  renderer,
};
