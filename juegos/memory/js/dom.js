// Atajos para buscar y crear elementos de la página.

export const $ = (id) => document.getElementById(id);

// Crea un elemento con su clase y, si se pasa, un trozo de HTML (iconos SVG).
export function make(tag, className = "", html = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

// Crea un elemento con texto. textContent no interpreta HTML, así que es seguro.
export function text(tag, className, content) {
  const el = make(tag, className);
  el.textContent = content;
  return el;
}
