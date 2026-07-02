document.addEventListener("mousemove", (e) => {
  const glow = document.querySelector(".glow");
  if (!glow) return;

  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  glow.style.transform = `translate(${x}px, ${y}px)`;
});
