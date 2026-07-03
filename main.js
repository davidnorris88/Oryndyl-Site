const ember = document.getElementById("ember");
const flame = document.getElementById("flame");
const logo = document.getElementById("logo");
const fx = document.getElementById("fx");
const ctx = fx.getContext("2d");

let w,h;
function resize(){
  w = fx.width = innerWidth;
  h = fx.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

const start = performance.now();

/* easing for cinematic motion */
const ease = t => t*t*(3-2*t);

/* ember physics (minimal, intentional) */
let ex = 0.2 * window.innerWidth;
let ey = 0.5 * window.innerHeight;

function loop(t){

  const s = (t - start)/1000;

  /* clear subtle fog trail */
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0,0,w,h);

  /* ------------------- 0–2s VOID ------------------- */
  if(s < 2){
    ember.style.opacity = 0;
    flame.style.opacity = 0;
    logo.style.opacity = 0;
  }

  /* ------------------- 2–4s EMBER ARRIVAL ------------------- */
  if(s >= 2 && s < 4){

    const t2 = ease((s-2)/2);

    ember.style.opacity = 1;
    ex += (w*0.5 - ex) * 0.02;
    ey += (h*0.5 - ey) * 0.01;

    ember.style.left = ex + "px";
    ember.style.top = ey + "px";

    ember.style.transform = `scale(${0.5 + t2*2})`;
  }

  /* ------------------- 4–5.5s IGNITION ------------------- */
  if(s >= 4 && s < 5.5){

    const t3 = (s-4)/1.5;

    flame.style.opacity = t3;
    flame.style.transform = `translate(-50%,-50%) scale(${1 + t3*2.5})`;

    ember.style.opacity = 1 - t3*0.7;

    /* spark burst */
    for(let i=0;i<3;i++){
      ctx.fillStyle = `rgba(255,140,60,${0.08})`;
      ctx.beginPath();
      ctx.arc(
        ex + (Math.random()-0.5)*30,
        ey + (Math.random()-0.5)*30,
        Math.random()*2,
        0,Math.PI*2
      );
      ctx.fill();
    }
  }

  /* ------------------- 5.5–7.5s FLAME REVEAL ------------------- */
  if(s >= 5.5 && s < 7.5){

    const t4 = ease((s-5.5)/2);

    flame.style.opacity = 1;
    logo.style.opacity = t4;

    flame.style.filter = `blur(${18 - t4*10}px)`;

    logo.style.letterSpacing = `${18 - t4*6}px`;
  }

  /* ------------------- 7.5–10s SETTLE ------------------- */
  if(s >= 7.5){

    logo.style.opacity = 1;
    flame.style.opacity = 0.8;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
