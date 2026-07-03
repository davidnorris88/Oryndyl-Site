const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const emberEl = document.getElementById("ember");
const brand = document.getElementById("brand");

let w,h;
function resize(){
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------------- TIMELINE ---------------- */
const start = performance.now();

/* ember state (single actor only) */
const ember = {
  x: w/2,
  y: h/2 + 40,
  glow: 0,
  heat: 0
};

/* easing */
const ease = t => t*t*(3-2*t);

/* ---------------- LOOP ---------------- */
function loop(t){

  const s = (t - start)/1000;
  const e = Math.min(1, s/8);
  const easeT = ease(e);

  /* CAMERA FEEL (subtle drift, not shake-heavy) */
  const driftX = Math.sin(s * 0.6) * 2;
  const driftY = Math.cos(s * 0.5) * 1.5;

  canvas.style.transform =
    `scale(${1 + easeT * 0.06}) translate(${driftX}px, ${driftY}px)`;

  /* ---------------- PHASES ---------------- */

  // 0–2s VOID
  if(s < 2){
    ember.glow = 0;
    ember.heat = 0;
    emberEl.style.opacity = 0;
    brand.style.opacity = 0;
  }

  // 2–4s EMBER AWAKENING (NO MOVEMENT, ONLY BREATHING)
  if(s >= 2 && s < 4){
    const t = (s-2)/2;

    ember.glow = t;
    ember.heat = t * 0.3;

    emberEl.style.opacity = t;
    emberEl.style.transform =
      `translate(-50%, -50%) scale(${1 + t*1.2})`;
  }

  // 4–6s IGNITION (FORGE MOMENT)
  if(s >= 4 && s < 6){
    const t = (s-4)/2;

    ember.glow = 1;
    ember.heat = 1;

    emberEl.style.opacity = 1;
    emberEl.style.transform =
      `translate(-50%, -50%) scale(${2 + t*3})`;

    // subtle energy bloom
    ctx.fillStyle = `rgba(255,120,40,${0.08 - t*0.06})`;
    ctx.fillRect(0,0,w,h);
  }

  // 6–8s REVEAL (FORMATION, NOT FADE-IN)
  if(s >= 6 && s < 8){
    const t = (s-6)/2;

    emberEl.style.opacity = 1 - t;
    brand.style.opacity = t;

    brand.style.letterSpacing = `${16 - t*6}px`;
  }

  // 8–10s SETTLE (AFTERIMAGE)
  if(s >= 8){
    brand.style.opacity = 1;
  }

  /* subtle forge haze */
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0,0,w,h);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
