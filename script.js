<script>
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let w, h;
function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------------- EMBERS ---------------- */
let embers = [];
let intensity = 0;

function spawnEmber(boost=false){
  return {
    x: Math.random()*w,
    y: h + Math.random()*50,
    r: Math.random()*2.2 + 0.3,
    vx: (Math.random()-0.5)*(boost?1.4:0.3),
    vy: -(Math.random()*(boost?2.8:0.6) + (boost?1.4:0.2)),
    a: Math.random()*0.8 + 0.2
  };
}

for(let i=0;i<60;i++) embers.push(spawnEmber(false));

/* ---------------- AUDIO ENGINE ---------------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audio = new AudioCtx();

let master = audio.createGain();
master.gain.value = 0.9;
master.connect(audio.destination);

// LOW DRONE (bass swell)
function bassSwell(){
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(40, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, audio.currentTime + 6);

  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.35, audio.currentTime + 4);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 10);

  osc.connect(gain);
  gain.connect(master);

  osc.start();
  osc.stop(audio.currentTime + 10);
}

// SUB RUMBLE LAYER
function subRumble(){
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.value = 55;

  gain.gain.value = 0.08;

  osc.connect(gain);
  gain.connect(master);

  osc.start();
  osc.stop(audio.currentTime + 10);
}

// IGNITION HIT (rune activation)
function ignitionHit(){
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(180, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, audio.currentTime + 0.4);

  gain.gain.setValueAtTime(0.4, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.6);

  osc.connect(gain);
  gain.connect(master);

  osc.start();
  osc.stop(audio.currentTime + 0.6);
}

// EMBER CRACKLE (noise texture)
function crackle(){
  const bufferSize = audio.sampleRate * 2;
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);

  for(let i=0;i<bufferSize;i++){
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;

  const gain = audio.createGain();
  gain.gain.value = 0.05;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  noise.start();
}

/* ---------------- START AUDIO ON FIRST FRAME ---------------- */
let audioStarted = false;
function startAudio(){
  if(audioStarted) return;
  audioStarted = true;

  audio.resume();
  bassSwell();
  subRumble();
  crackle();

  setTimeout(() => ignitionHit(), 4000);
}

/* ---------------- TIMELINE ---------------- */
const start = performance.now();

const core = document.getElementById("core");
const word = document.getElementById("word");
const runes = document.getElementById("runes");

function timeline(t){
  const s = t/1000;

  if(s < 2){
    intensity = 0.2;
  }

  if(s >= 2 && s < 4){
    intensity = 0.6;
    core.style.opacity = (s-2)/2;
  }

  if(s >= 4 && s < 6){
    intensity = 2.0;
    core.style.opacity = 1;
    runes.style.opacity = (s-4)/2;

    for(let i=0;i<6;i++) embers.push(spawnEmber(true));
  }

  if(s >= 6 && s < 8){
    intensity = 1.0;
    word.style.opacity = (s-6)/2;
  }

  if(s >= 8){
    intensity = 0.3;
    word.style.opacity = 1 - (s-8)/2;
    runes.style.opacity = 0.6 - (s-8)/2;
  }
}

/* ---------------- DRAW LOOP ---------------- */
function draw(now){
  startAudio(); // ensure synced start

  const elapsed = now - start;
  const s = elapsed/1000;

  timeline(elapsed);

  ctx.clearRect(0,0,w,h);

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0,0,w,h);

  for(let i=embers.length-1;i>=0;i--){
    const e = embers[i];

    e.x += e.vx * intensity;
    e.y += e.vy * intensity;
    e.a *= 0.995;

    if(e.y < -20 || e.a < 0.02){
      embers.splice(i,1);
      continue;
    }

    const g = ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*6);
    g.addColorStop(0, `rgba(255,140,60,${e.a})`);
    g.addColorStop(1, "rgba(255,70,20,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r*3,0,Math.PI*2);
    ctx.fill();
  }

  if(s < 10){
    requestAnimationFrame(draw);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0,0,w,h);
  }
}

requestAnimationFrame(draw);
</script>
