// Iconos y siluetas en SVG (dibujados a mano, sin imágenes externas).

const icon = (body, extra = "") =>
  `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${body}</svg>`;

export const ICONS = {
  image: icon('<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5"/><circle cx="16" cy="8.5" r="1.5"/>'),
  name: icon('<rect x="2.5" y="6.5" width="19" height="11" rx="1.5"/><path d="M7 12h10"/><circle cx="5" cy="9" r=".6" fill="currentColor"/><circle cx="19" cy="9" r=".6" fill="currentColor"/><circle cx="5" cy="15" r=".6" fill="currentColor"/><circle cx="19" cy="15" r=".6" fill="currentColor"/>'),
  barrio: icon('<path d="M12 21.5s-6.5-6.3-6.5-11.3a6.5 6.5 0 1 1 13 0c0 5-6.5 11.3-6.5 11.3z"/><circle cx="12" cy="10" r="2.4"/>'),
  fact: icon('<path d="M8 3.5h10.5a2 2 0 0 1 2 2V7h-3.5"/><path d="M8 3.5a2 2 0 0 0-2 2V18a2.5 2.5 0 0 0 2.5 2.5H17a2 2 0 0 0 2-2V7"/><path d="M8 3.5a2 2 0 0 1 2 2V18a2.5 2.5 0 0 1-1.5 2.3"/><path d="M12.5 10h4M12.5 13h4M12.5 16h2.5"/>'),
  lupa: icon('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/><path d="M8 8.5a3 3 0 0 1 3-1.5"/>'),
  trampa: icon('<path d="M3 7h3.5c2 0 3 1 4.5 3l2 3c1.5 2 2.5 3 4.5 3H21"/><path d="M18 13l3 3-3 3"/><path d="M3 17h3.5c1.4 0 2.3-.5 3.2-1.4"/><path d="M14.3 8.4c.9-.9 1.8-1.4 3.2-1.4H21"/><path d="M18 4l3 3-3 3"/>'),
  hint: icon('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'),
  help: icon('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.7"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>'),
  soundOn: icon('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  soundOff: icon('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
  lock: icon('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  restart: icon('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>'),
  check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
  close: icon('<path d="M6 6l12 12M18 6L6 18"/>'),
  clock: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  star: '<svg viewBox="0 0 24 24" class="icon star-icon" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
  play: icon('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
};

// Siluetas de reserva (mientras no haya render del monumento). viewBox 100 × 100.
// body = la forma (color oscuro) · detail = ventanas y arcos (color claro).
const SHAPES = {
  spires: {
    body: "M8 92V64h84v28z M14 64V40l4-24 4 24v24z M27 64V30l5-26 5 26v34z M42 64V22l8-20 8 20v42z M63 64V30l5-26 5 26v34z M78 64V40l4-24 4 24v24z",
    detail: "M44 92V80a6 6 0 0 1 12 0v12z M20 92V82a4 4 0 0 1 8 0v10z M72 92V82a4 4 0 0 1 8 0v10z M48 40a2 3 0 0 1 4 0v8h-4z",
  },
  gothic: {
    body: "M16 92V50h12V36l4-8 4 8v14h28V36l4-8 4 8v14h12v42z M44 50V24l6-20 6 20v26z",
    detail: "M50 58a8 8 0 1 0 .01 0z M44 92V84a6 6 0 0 1 12 0v8z M23 76v-8a3 3 0 0 1 6 0v8z M71 76v-8a3 3 0 0 1 6 0v8z",
  },
  temple: {
    body: "M0 92C18 80 34 78 50 80s34 0 50 12z M26 82V58h48v24z M42 58V30h16v28z M29 58V46l4-8 4 8v12z M63 58V46l4-8 4 8v12z M48.5 30V14h3v16z M45 19h10v3H45z",
    detail: "M45 82V72a5 5 0 0 1 10 0v10z M46 44a4 4 0 1 0 8 0 4 4 0 1 0-8 0z",
  },
  castle: {
    body: "M2 92C20 78 80 78 98 92z M16 84V56h6v-6h6v6h6v-6h6v6h20v-6h6v6h6v-6h6v6h6v28z M42 56V30h16v26z M40 30v-6h4v3h4v-3h4v3h4v-3h4v6z",
    detail: "M44 84V74a6 6 0 0 1 12 0v10z M47 38h6v8h-6z M24 66h4v6h-4z M72 66h4v6h-4z",
  },
  tower: {
    body: "M32 92V42C32 20 40 6 50 6s18 14 18 36v50z",
    detail: "M38 28h24v2H38z M35 40h30v2H35z M34 52h32v2H34z M34 64h32v2H34z M34 76h32v2H34z",
  },
  market: {
    body: "M8 92V48h84v44z M24 48Q50 18 76 48z",
    detail: "M28 92V70a22 22 0 0 1 44 0v22z M40 42a4 4 0 1 0 8 0 4 4 0 1 0-8 0z M52 42a4 4 0 1 0 8 0 4 4 0 1 0-8 0z M12 60h8v8h-8z M80 60h8v8h-8z",
  },
  wave: {
    body: "M20 92V34c6-6 10-6 15-2s10 4 15 0 10-4 15 0 10 4 15 0v60z M44 34c0-10 4-16 6-16s6 6 6 16z",
    detail: "M27 46a3 4 0 0 1 6 0v6h-6z M47 46a3 4 0 0 1 6 0v6h-6z M67 46a3 4 0 0 1 6 0v6h-6z M27 62a3 4 0 0 1 6 0v6h-6z M47 62a3 4 0 0 1 6 0v6h-6z M67 62a3 4 0 0 1 6 0v6h-6z M42 92V80c0-4 4-6 8-6s8 2 8 6v12z",
  },
  palace: {
    body: "M10 92V52h80v40z M36 52V42a14 14 0 0 1 28 0v10z M48.5 28v-8h3v8z M8 54l42-12 42 12z",
    detail: "M18 92V76a5 5 0 0 1 10 0v16z M45 92V74a5 5 0 0 1 10 0v18z M72 92V76a5 5 0 0 1 10 0v16z M20 60h6v6h-6z M47 58h6v8h-6z M74 60h6v6h-6z",
  },
  park: {
    body: "M0 92c10-10 20 0 30-6s20 2 40-4 20 6 30 0v10z M30 84V58h20v26z M26 60Q40 34 54 60z M38.5 42V30h3v12z M35 34h10v3H35z M66 84V64h3v20z M58 66a9.5 9.5 0 1 1 19 0 9.5 9.5 0 1 1-19 0z M12 84V70h3v14z M6 70a7.5 7.5 0 1 1 15 0 7.5 7.5 0 1 1-15 0z",
    detail: "M36 84V74a4 4 0 0 1 8 0v10z M33 52h3v3h-3z M44 52h3v3h-3z",
  },
  cloister: {
    body: "M8 92V66h84v26z M28 66V50l16-10 16 10v16z M62 66V36l7-7 7 7v30z M60 36l9-12 9 12z",
    detail: "M13 92V82a4 4 0 0 1 8 0v10z M26 92V82a4 4 0 0 1 8 0v10z M39 92V82a4 4 0 0 1 8 0v10z M52 92V82a4 4 0 0 1 8 0v10z M65 92V82a4 4 0 0 1 8 0v10z M78 92V82a4 4 0 0 1 8 0v10z M66.5 42h5v8h-5z M41 54a3 3 0 1 0 6 0 3 3 0 1 0-6 0z",
  },
};

export function silhouette(shape) {
  const s = SHAPES[shape] ?? SHAPES.palace;
  return `<svg viewBox="0 0 100 100" class="sil" aria-hidden="true" focusable="false"><path class="sil-body" d="${s.body}"/><path class="sil-detail" d="${s.detail}"/></svg>`;
}
