/* ====================================================
   script.js
   - Three.js 배경 파티클
   - 3D 카드 틸트
   - Firebase 제출 & 모달 로직
   ==================================================== */

// ── Three.js 배경 ──────────────────────────────────────
const canvas   = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x080818);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6;

function makeParticles(count, color, size, spread) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.65, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

const pinkDots   = makeParticles(200, 0xff6496, 0.045, 22);
const purpleDots = makeParticles(140, 0x9664ff, 0.035, 22);
const whiteDots  = makeParticles(80,  0xffffff, 0.025, 18);
scene.add(pinkDots, purpleDots, whiteDots);

const g1 = new THREE.SphereGeometry(1.8, 32, 32);
const m1 = new THREE.MeshBasicMaterial({ color: 0xff6496, transparent: true, opacity: 0.04 });
const b1 = new THREE.Mesh(g1, m1);
b1.position.set(-3, 2, -4);
scene.add(b1);

const g2 = new THREE.SphereGeometry(2.2, 32, 32);
const m2 = new THREE.MeshBasicMaterial({ color: 0x9664ff, transparent: true, opacity: 0.04 });
const b2 = new THREE.Mesh(g2, m2);
b2.position.set(3.5, -2, -5);
scene.add(b2);

const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

let bgTime = 0;
function animateBg() {
  requestAnimationFrame(animateBg);
  bgTime += 0.004;
  pinkDots.rotation.y    =  bgTime * 0.18;
  pinkDots.rotation.x    =  bgTime * 0.08;
  purpleDots.rotation.y  = -bgTime * 0.14;
  purpleDots.rotation.z  =  bgTime * 0.06;
  whiteDots.rotation.x   =  bgTime * 0.10;
  camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.03;
  camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.03;
  camera.lookAt(scene.position);
  b1.position.y = 2 + Math.sin(bgTime) * 0.3;
  b2.position.y = -2 + Math.cos(bgTime * 0.8) * 0.4;
  renderer.render(scene, camera);
}
animateBg();

// ── 3D 카드 틸트 ───────────────────────────────────────
const cardScene = document.getElementById('scene');
const card      = document.getElementById('card');

let cx = 0, cy = 0, tx = 0, ty = 0, hovering = false;

cardScene.addEventListener('mousemove', (e) => {
  const r = card.getBoundingClientRect();
  tx = -(e.clientY - (r.top  + r.height / 2)) / 18;
  ty =  (e.clientX - (r.left + r.width  / 2)) / 18;
});
cardScene.addEventListener('mouseenter', () => hovering = true);
cardScene.addEventListener('mouseleave', () => { hovering = false; tx = 0; ty = 0; });

cardScene.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const r = card.getBoundingClientRect();
  tx = -(t.clientY - (r.top  + r.height / 2)) / 20;
  ty =  (t.clientX - (r.left + r.width  / 2)) / 20;
}, { passive: false });
cardScene.addEventListener('touchend', () => { tx = 0; ty = 0; });

function animateCard() {
  requestAnimationFrame(animateCard);
  const ease = hovering ? 0.12 : 0.06;
  cx += (tx - cx) * ease;
  cy += (ty - cy) * ease;
  if (Math.abs(cx) > 0.01 || Math.abs(cy) > 0.01) {
    card.style.transform = `rotateX(${cx}deg) rotateY(${cy}deg)`;
  }
}
animateCard();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── 모달 유틸 ──────────────────────────────────────────
let currentIgId = '';

function showStep(n) {
  ['step1','step2','step3'].forEach((id, i) => {
    document.getElementById(id).style.display = (i + 1 === n) ? 'flex' : 'none';
  });
}

function handleCTA() {
  document.getElementById('ig-input').value = '';
  document.getElementById('input-error').textContent = '';
  showStep(1);
  document.getElementById('modal-overlay').classList.add('active');
  setTimeout(() => document.getElementById('ig-input').focus(), 300);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function overlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// ── Step 1: ID 입력 & Firebase 저장 ────────────────────
async function submitStep1() {
  const raw = document.getElementById('ig-input').value.trim().replace(/^@/, '');
  const err = document.getElementById('input-error');

  if (!raw) {
    err.textContent = '아이디를 입력해주세요.';
    return;
  }
  if (!/^[\w.]{1,30}$/.test(raw)) {
    err.textContent = '올바른 인스타그램 아이디 형식이 아니에요.';
    return;
  }

  err.textContent = '';
  currentIgId = raw;

  // Firebase에 저장
  try {
    await db.collection('submissions').add({
      instagramId: raw,
      timestamp:   firebase.firestore.FieldValue.serverTimestamp(),
      userAgent:   navigator.userAgent,
      referrer:    document.referrer || 'direct'
    });
  } catch (e) {
    console.warn('Firebase 저장 실패 (설정 확인 필요):', e.message);
    // 저장 실패해도 모달 진행은 계속
  }

  document.getElementById('step2-sub').textContent =
    `@${raw}님, 팔로우 버튼을 눌러주세요 ☺️`;
  showStep(2);
}

// ── Step 2: 인스타그램 팔로우 이동 ──────────────────────
function followIG() {
  const igUrl = 'https://www.instagram.com/nxptune0/';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // 앱 딥링크 시도 후 웹으로 폴백
    window.location.href = 'instagram://user?username=nxptune0';
    setTimeout(() => window.open(igUrl, '_blank'), 1500);
  } else {
    window.open(igUrl, '_blank');
  }

  showStep(3);
}
