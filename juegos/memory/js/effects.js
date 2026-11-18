// Efectos visuales con DOM y CSS (sin <canvas>): chispas, confeti, números que flotan,
// sacudidas y movimiento suave de cartas. Si el sistema pide menos movimiento, se omiten.

export const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

let layer = null;
function fxLayer() {
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.append(layer);
  }
  return layer;
}

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

function spawn(className, x, y, vars = {}) {
  const s = document.createElement("span");
  s.className = className;
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  for (const [k, v] of Object.entries(vars)) s.style.setProperty(k, v);
  s.addEventListener("animationend", () => s.remove(), { once: true });
  fxLayer().append(s);
  return s;
}

// Chispas de colores que salen de una carta al acertar.
export function burst(el, hue = 45, count = 16) {
  if (reducedMotion() || !el) return;
  const { x, y } = center(el);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 50 + Math.random() * 60;
    spawn(`spark s${i % 3}`, x, y, {
      "--dx": `${Math.cos(angle) * dist}px`,
      "--dy": `${Math.sin(angle) * dist}px`,
      "--h": hue + Math.round(Math.random() * 60 - 30),
      "--rot": `${Math.round(Math.random() * 360)}deg`,
    });
  }
}

// Texto que sube y se desvanece (puntos, combo...).
export function floatText(el, text, kind = "points") {
  if (!el) return;
  const { x, y } = center(el);
  spawn(`float-text ${kind}`, x, y - 10).textContent = text;
}

// Lluvia de confeti al ganar.
export function confetti(count = 90) {
  if (reducedMotion()) return;
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    spawn(`confetti c${i % 4}`, Math.random() * w, -20, {
      "--h": Math.round(Math.random() * 360),
      "--delay": `${Math.random() * 0.8}s`,
      "--dur": `${2.2 + Math.random() * 1.8}s`,
      "--drift": `${Math.round(Math.random() * 160 - 80)}px`,
      "--rot": `${Math.round(Math.random() * 720 - 360)}deg`,
    });
  }
}

// Vuelve a poner una clase para que su animación empiece de nuevo aunque ya estuviera.
// Medir el elemento obliga al navegador a notar que la clase se quitó.
export function replay(el, className) {
  el.classList.remove(className);
  el.getBoundingClientRect();
  el.classList.add(className);
}

// Como replay, pero la clase se quita al terminar la animación.
export function pulse(el, className) {
  if (!el) return;
  replay(el, className);
  el.addEventListener("animationend", () => el.classList.remove(className), { once: true });
}

// Técnica FLIP: mide dónde estaban los elementos, aplica el cambio y los desliza a su nuevo sitio.
export function flipMove(container, change) {
  const items = [...container.children];
  const before = new Map(items.map((n) => [n, n.getBoundingClientRect()]));
  change();
  if (reducedMotion()) return;
  for (const n of items) {
    const a = before.get(n);
    const b = n.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (!dx && !dy) continue;
    n.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(.92)` }, { transform: "translate(0, 0) scale(1)" }],
      { duration: 700, easing: "cubic-bezier(.25, 1, .5, 1)" },
    );
  }
}

// Cuenta de 0 al número final (para los puntos de la tarjeta de victoria).
export function countUp(el, to, ms = 900) {
  if (reducedMotion() || to <= 0) {
    el.textContent = to;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / ms);
    el.textContent = Math.round(to * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
