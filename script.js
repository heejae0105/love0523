/* ====================================================
   script.js — Three.js 배경 파티클 + 3D 카드 틸트
   ==================================================== */

// ── Three.js 배경 설정 ──────────────────────────────
const canvas   = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6;

// 배경 그라디언트 색상 (어두운 네이비~퍼플)
scene.background = new THREE.Color(0x080818);

// ── 파티클 레이어 생성 헬퍼 ───────────────────────────
function makeParticles(count, color, size, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    pos[i] = (Math.random() - 0.5) * spread;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.65, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

const pinkDots   = makeParticles(200, 0xff6496, 0.045, 22);
const purpleDots = makeParticles(140, 0x9664ff, 0.035, 22);
const whiteDots  = makeParticles(80,  0xffffff, 0.025, 18);
scene.add(pinkDots, purpleDots, whiteDots);

// ── 큰 빛나는 구체 (배경 분위기용) ────────────────────
const glowGeo = new THREE.SphereGeometry(1.8, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6496, transparent: true, opacity: 0.04 });
const glowBall = new THREE.Mesh(glowGeo, glowMat);
glowBall.position.set(-3, 2, -4);
scene.add(glowBall);

const glowGeo2 = new THREE.SphereGeometry(2.2, 32, 32);
const glowMat2 = new THREE.MeshBasicMaterial({ color: 0x9664ff, transparent: true, opacity: 0.04 });
const glowBall2 = new THREE.Mesh(glowGeo2, glowMat2);
glowBall2.position.set(3.5, -2, -5);
scene.add(glowBall2);

// ── 마우스 위치 추적 (배경 시차 효과) ─────────────────
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── 애니메이션 루프 ────────────────────────────────────
let time = 0;
function animateBg() {
  requestAnimationFrame(animateBg);
  time += 0.004;

  // 파티클 자체 회전
  pinkDots.rotation.y   =  time * 0.18;
  pinkDots.rotation.x   =  time * 0.08;
  purpleDots.rotation.y = -time * 0.14;
  purpleDots.rotation.z =  time * 0.06;
  whiteDots.rotation.x  =  time * 0.10;

  // 카메라 시차 (마우스 따라 살짝 이동)
  camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.03;
  camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.03;
  camera.lookAt(scene.position);

  // 글로우 구체 부유
  glowBall.position.y  = 2 + Math.sin(time) * 0.3;
  glowBall2.position.y = -2 + Math.cos(time * 0.8) * 0.4;

  renderer.render(scene, camera);
}
animateBg();

// ── 3D 카드 틸트 (마우스 기반) ─────────────────────────
const cardScene = document.getElementById('scene');
const card      = document.getElementById('card');

let currentRotX = 0;
let currentRotY = 0;
let targetRotX  = 0;
let targetRotY  = 0;
let isHovering  = false;

cardScene.addEventListener('mousemove', (e) => {
  const rect    = card.getBoundingClientRect();
  const centerX = rect.left + rect.width  / 2;
  const centerY = rect.top  + rect.height / 2;

  targetRotX = -(e.clientY - centerY) / 18;
  targetRotY =  (e.clientX - centerX) / 18;
});

cardScene.addEventListener('mouseenter', () => { isHovering = true; });
cardScene.addEventListener('mouseleave', () => {
  isHovering = false;
  targetRotX = 0;
  targetRotY = 0;
});

// 부드러운 보간 애니메이션
function animateCard() {
  requestAnimationFrame(animateCard);
  const ease = isHovering ? 0.12 : 0.06;
  currentRotX += (targetRotX - currentRotX) * ease;
  currentRotY += (targetRotY - currentRotY) * ease;

  if (Math.abs(currentRotX) > 0.01 || Math.abs(currentRotY) > 0.01) {
    card.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
  }
}
animateCard();

// ── 터치 디바이스 틸트 ─────────────────────────────────
cardScene.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t      = e.touches[0];
  const rect   = card.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  targetRotX   = -(t.clientY - cy) / 20;
  targetRotY   =  (t.clientX - cx) / 20;
}, { passive: false });

cardScene.addEventListener('touchend', () => {
  targetRotX = 0;
  targetRotY = 0;
});

// ── 창 크기 변경 대응 ──────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── 지원하기 모달 ──────────────────────────────────────
function handleCTA() {
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// 모달 배경 클릭시 닫기
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
