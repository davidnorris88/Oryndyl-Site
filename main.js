const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const core = document.getElementById("core");
const word = document.getElementById("word");
const runesOverlay = document.getElementById("runesOverlay");
const camera = document.getElementById("camera");

let w,h;
function resize(){
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------------- LEAD EMBER (MAIN ACTOR) ---------------- */
let ember = {
  x: w * 0.2,
  y: h * 0.6,
  vx: 2.2,
  vy: -0.6,
  r: 3,
  a: 0
};

/* ---------------- TIMELINE STATE ---------------- */
let state = "void";
let start = performance.now();
let ignited = false;

/* ---------------- EASING ---------------- */
const ease = t => t*t*(3-2*t);

/* ---------------- STATE MACHINE ---------------- */
function updateState(s){
  if(s < 2) state = "void";
  else if(s < 4) state = "travel";
  else if(s < 6) state = "ignite";
  else state = "reveal";
}

/* ---------------- CAMERA ---------------- */
let shakeX = 0;
let shakeY = 0;

/* ---------------- LOOP ---------------- */
function loop(t){

  const s = (t - start)/1000;
  updateState(s);

  /* ---------------- CAMERA ---------------- */
  const zoom = 1 + ease(Math.min(s/8,1)) * 0.12;

  if(state === "ignite"){
    shakeX += (Math.random()-0.5)*12;
    shakeY += (Math.random()-0.5)*12;
  }

  shakeX *= 0.85;
  shakeY *= 0.85;

  camera.style.transform =
    `scale(${zoom}) translate(${shakeX}px,${shakeY}px)`;

  /* ---------------- CORE VISUAL ---------------- */
  core.style.opacity =
    state === "ignite" ? 1 :
    state === "travel" ? 0.3 : 0;

  /* ---------------- RUNE FIELD ---------------- */
  runesOverlay.style.opacity =
    state === "ignite" ? 1 : 0;

  /* ---------------- WORDMARK ---------------- */
  word.style.opacity =
    state === "reveal"
      ? Math.min(1, (s-6)/2)
      : 0;

  /* ---------------- EMBER LOGIC ---------------- */
  if(state === "travel"){
    ember.x += ember.vx;
    ember.y += ember.vy;
    ember.a = Math.min(1, ember.a + 0.02);
  }

  if(state === "ignite"){
    ember.vx *= 0.9;
    ember.vy *= 0.9;
    ember.r += 0.9;
    ember.a = 1;
  }

  if(state === "reveal"){
    ember.r *= 0.95;
    ember.a *= 0.92;
  }

  /* ---------------- DRAW ---------------- */
  ctx.clearRect(0,0,w,h);

  const glow = ctx.createRadialGradient(
    ember.x, ember.y, 0,
    ember.x, ember.y, ember.r * 12
  );

  glow.addColorStop(0, `rgba(255,140,60,${ember.a})`);
  glow.addColorStop(1, "transparent");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ember.x, ember.y, ember.r, 0, Math.PI*2);
  ctx.fill();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
