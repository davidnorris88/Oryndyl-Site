const emberField = document.querySelector(".ember-field");

function createEmber() {
  const ember = document.createElement("span");
  ember.className = "ember";

  ember.style.left = Math.random() * 100 + "vw";
  ember.style.animationDuration = 4 + Math.random() * 6 + "s";
  ember.style.opacity = 0.25 + Math.random() * 0.75;
  ember.style.transform = `scale(${0.6 + Math.random() * 1.8})`;

  emberField.appendChild(ember);

  setTimeout(() => {
    ember.remove();
  }, 10000);
}

setInterval(createEmber, 350);

document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
