const bg = document.getElementById("bg");
const mid = document.getElementById("mid");
const fg = document.getElementById("fg");
const fx = document.getElementById("fx");

const b = bg.getContext("2d");
const m = mid.getContext("2d");
const f = fg.getContext("2d");
const x = fx.getContext("2d");

const word = document.getElementById("word");
const core = document.getElementById("core");
const runesOverlay = document.getElementById("runesOverlay");
const camera = document.getElementById("camera");

let w,h;
function resize(){
  w = bg.width = mid.width = fg.width = fx.width = innerWidth;
  h = bg.height = mid.height = fg.height = fx.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------------- STATE ---------------- */
let start = performance.now();
let hitPlayed = false;

/* ---------------- GLYPHS ---------------- */
const RUNES = ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ"];

const glyphs = Array.from({length: 40}, () => ({
  x: Math.random()*w,
  y: Math.random()*h,
  tx: w/2,
  ty: h/2,
  c: RUNES[Math.floor(Math.random()*RUNES.length)],
  a: 0
}));

/* ---------------- PARTICLES ---------------- */
const particles = Array.from({length: 80}, () => ({
  x: Math.random()*w,
  y: Math.random()*h,
  vx: (Math.random()-0.5)*0.3,
  vy: -Math.random()*0.6,
  a: Math.random()
}));

/* ---------------- AUDIO (MINIMAL MIX) ---------------- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const master = audioCtx.createGain();
master.gain.value = 0.8;
master.connect(audioCtx.destination);

function hit(){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type="sine";
  o.frequency.setValueAtTime(180,audioCtx.currentTime);
  g.gain.setValueAtTime(0.4,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+0.5);
  o.connect(g); g.connect(master);
  o.start(); o.stop(audioCtx.currentTime+0.5);
}

/* ---------------- UTILS ---------------- */
const ease = t => t*t*(3-2*t);

/* ---------------- LOOP ---------------- */
function loop(t){
  const s = (t - start)/1000;
  const e = Math.min(1, s/8);
  const easeT = ease(e);

  /* CAMERA */
  let shake = (s>3.9 && s<4.2) ? (Math.random()-0.5)*10 : 0;
  camera.style.transform = `scale(${1 + easeT*0.12}) translate(${shake}px,${shake}px)`;

  /* DOM FX */
  core.style.opacity = Math.min(1, s/4);
  runesOverlay.style.opacity = Math.max(0, (s-3)/3);
  word.style.opacity = Math.max(0, (s-6)/2);

  /* HIT */
  if(s>4 && !hitPlayed){
    hit(); hitPlayed=true;
  }

  /* CLEAR */
  b.clearRect(0,0,w,h);
  m.clearRect(0,0,w,h);
  f.clearRect(0,0,w,h);
  x.clearRect(0,0,w,h);

  /* GLYPHS (MID LAYER) */
  m.fillStyle="rgba(255,200,140,0.9)";
  m.font="20px Georgia";

  glyphs.forEach(g=>{
    if(s>2){
      g.x += (g.tx-g.x)*0.02;
      g.y += (g.ty-g.y)*0.02;
      g.a = Math.min(1,g.a+0.01);
    }

    if(s>6) g.a *= 0.97;

    m.globalAlpha = g.a;
    m.fillText(g.c,g.x,g.y);
  });

  /* PARTICLES (FG LAYER) */
  particles.forEach(p=>{
    const heat = Math.sin(p.x*0.01+s)*Math.cos(p.y*0.01+s);

    p.x += p.vx + heat*0.2;
    p.y += p.vy + heat*0.2;

    if(p.y<0) p.y=h;

    const grd = f.createRadialGradient(p.x,p.y,0,p.x,p.y,10);
    grd.addColorStop(0,"rgba(255,140,60,"+p.a+")");
    grd.addColorStop(1,"transparent");

    f.fillStyle=grd;
    f.beginPath();
    f.arc(p.x,p.y,3,0,Math.PI*2);
    f.fill();
  });

  /* FX PASS */
  x.fillStyle="rgba(0,0,0,0.03)";
  x.fillRect(0,0,w,h);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
