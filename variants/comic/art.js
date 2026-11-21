// Все рисунки игры «Кот-повар» — стиль КОМИКС (поп-арт): жирный чёрный контур
// со смещённой «тенью-обводкой», плоские яркие цвета, точки Бен-Дея в тенях.
const K = '#141414'; // чернила
const L = K;         // совместимость со старым именем

// ---------- Общие узоры (один раз на страницу) ----------
// Точки Бен-Дея и маска «тень снизу-справа». id уникальны и общие для всех рисунков.
(function () {
  const defs = `<svg id="ccDefs" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <pattern id="ccDots" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="3" cy="3" r="1.55" fill="${K}" fill-opacity=".62"/></pattern>
    <pattern id="ccDotsW" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="3" cy="3" r="1.4" fill="#fff" fill-opacity=".85"/></pattern>
    <pattern id="ccDotsR" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="3.5" cy="3.5" r="2.4" fill="#e8212b" fill-opacity=".9"/></pattern>
    <pattern id="ccDotsP" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="2.5" cy="2.5" r="1.5" fill="#ff3d7f"/></pattern>
    <linearGradient id="ccShadeG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#000"/><stop offset=".52" stop-color="#000"/>
      <stop offset=".6" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="ccShade" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
      <rect width="1" height="1" fill="url(#ccShadeG)"/></mask>
  </defs></svg>`;
  const put = () => { if (!document.getElementById('ccDefs')) document.body.insertAdjacentHTML('afterbegin', defs); };
  if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
})();

// ---------- Помощники рисования ----------
const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
// Фигура «как в комиксе»: чёрная подложка со сдвигом (контур толще снизу-справа),
// плоская заливка, точки в тени и чернильная обводка.
function ink(d, fill, o = {}) {
  const sw = o.sw ?? 4.5, off = o.off ?? 3, shade = o.shade ?? true, t = o.t ? ` transform="${o.t}"` : '';
  const tOff = `translate(${off} ${off})${o.t ? ' ' + o.t : ''}`;
  return `${off ? `<path d="${d}" fill="${K}" transform="${tOff}"/>` : ''}<path d="${d}" fill="${fill}"${t}/>` +
    `${shade ? `<path d="${d}" fill="url(#${o.dots || 'ccDots'})" mask="url(#ccShade)"${t}/>` : ''}` +
    `<path d="${d}" fill="none" stroke="${K}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${t}/>`;
}
// Линия-«стебель»: чёрная толстая и цветная тонкая поверх
const line2 = (d, color, w = 4) =>
  `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const stroke = (d, w = 3.5, c = K) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const glint = (d, w = 4) => stroke(d, w, '#fff');
function star(cx, cy, R, r, n = 5) {
  let p = '';
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI * i / n - Math.PI / 2, q = i % 2 ? r : R;
    p += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1);
  }
  return p + 'Z';
}
const sparkle = (x, y, r) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

// ---------- Продукты (viewBox 0 0 100 100) ----------
const GREEN = '#17b33c';
const FOOD = {
  carrot: { name: 'Морковка', kind: 'veg', svg: `
    ${ink('M50 34 C40 24 26 20 24 8 C36 6 46 16 50 26 C48 14 52 4 62 2 C66 12 60 22 55 32 C62 24 72 20 82 22 C78 32 64 34 56 36Z', GREEN, { sw: 3.5, off: 2 })}
    ${ink('M28 38 C34 26 66 26 72 38 C73 56 61 78 50 96 C39 78 27 56 28 38Z', '#ff7a00')}
    ${stroke('M35 50 h11 M55 60 h11 M39 72 h9 M54 82 h6', 4)}
    ${glint('M37 42 C35 50 37 58 40 63')}` },
  potato: { name: 'Картошка', kind: 'veg', svg: `
    ${ink('M14 56 C10 34 32 20 56 22 C78 24 92 40 88 58 C84 78 62 86 42 84 C24 82 16 70 14 56Z', '#e8ae45')}
    ${stroke('M34 42 l5 3 M62 36 l4 4 M60 64 l6 -2 M30 64 l4 3 M74 58 l3 4', 3.5)}
    <g fill="${K}"><circle cx="48" cy="56" r="1.8"/><circle cx="72" cy="50" r="1.6"/><circle cx="44" cy="72" r="1.6"/><circle cx="24" cy="52" r="1.4"/></g>
    ${glint('M24 46 q4 -12 18 -16')}` },
  onion: { name: 'Лук', kind: 'veg', svg: `
    ${line2('M48 30 C44 22 44 14 47 6 M53 30 C57 22 60 16 58 8', GREEN, 4)}
    ${ink('M50 26 C24 40 14 60 25 77 C34 91 66 91 75 77 C86 60 76 40 50 26Z', '#f59a16')}
    ${stroke('M50 32 C40 46 38 66 46 86 M50 32 C60 46 62 66 54 86 M50 32 V88', 2.5)}
    ${stroke('M43 90 l-5 7 M50 91 v7 M57 90 l5 7', 3)}
    ${glint('M30 56 C30 48 34 42 40 38')}` },
  tomato: { name: 'Помидор', kind: 'veg', svg: `
    ${ink(circ(50, 58, 35), '#ee1c25')}
    ${ink('M50 22 L42 12 L45 26 L30 23 L41 32 L50 35 L59 32 L70 23 L55 26 L58 12Z', GREEN, { sw: 3, off: 1.5, shade: false })}
    ${stroke('M50 24 V12', 4.5)}
    <ellipse cx="34" cy="46" rx="6" ry="10" fill="#fff" transform="rotate(32 34 46)"/>
    <circle cx="28" cy="62" r="3" fill="#fff"/>` },
  cucumber: { name: 'Огурец', kind: 'veg', svg: `
    ${ink(rr(12, 34, 76, 32, 16), '#1f9e3f', { t: 'rotate(-38 50 50)' })}
    <g transform="rotate(-38 50 50)">
      ${stroke('M24 42 H70', 3.5, '#8de06a')}
      <g fill="${K}"><circle cx="28" cy="52" r="2"/><circle cx="42" cy="58" r="2"/><circle cx="56" cy="51" r="2"/><circle cx="70" cy="58" r="2"/><circle cx="36" cy="46" r="1.6"/><circle cx="64" cy="45" r="1.6"/></g>
      ${ink(rr(84, 45, 8, 10, 3), '#7a5a1a', { sw: 3, off: 0, shade: false })}
    </g>` },
  cabbage: { name: 'Капуста', kind: 'veg', svg: `
    ${ink('M12 58 C8 40 20 22 34 20 C40 14 60 14 66 20 C80 22 92 40 88 58 C90 76 72 92 50 92 C28 92 10 76 12 58Z', '#3fb83a')}
    ${ink('M50 28 C70 28 78 44 76 58 C74 74 62 84 50 84 C38 84 26 74 24 58 C22 44 30 28 50 28Z', '#a8e65a', { sw: 3.5, off: 0 })}
    ${stroke('M50 30 C44 46 44 64 50 82 M28 48 C40 52 46 58 50 68 M72 48 C60 52 54 58 50 68', 3)}
    ${stroke('M16 60 q7 -3 11 2 M84 60 q-7 -3 -11 2 M30 22 q4 6 2 12 M70 22 q-4 6 -2 12', 3)}
    ${glint('M34 40 q4 -6 10 -8')}` },
  beet: { name: 'Свёкла', kind: 'veg', svg: `
    ${ink('M46 30 C34 26 24 16 28 6 C38 6 46 16 48 28Z', GREEN, { sw: 3, off: 2, shade: false })}
    ${ink('M54 30 C58 18 68 8 78 10 C78 20 66 28 56 32Z', GREEN, { sw: 3, off: 2, shade: false })}
    ${ink('M50 28 C28 30 16 48 22 64 C28 80 44 86 50 97 C56 86 72 80 78 64 C84 48 72 30 50 28Z', '#b5125e')}
    ${stroke('M45 86 l-6 2 M56 84 l6 1 M66 60 l7 -2', 3.2)}
    ${glint('M28 54 C29 46 33 40 39 37')}` },
  mushroom: { name: 'Гриб', kind: 'veg', svg: `
    ${ink('M37 54 C35 70 35 82 39 92 L61 92 C65 82 65 70 63 54 Z', '#fff3d6')}
    ${ink('M7 58 C7 28 28 9 50 9 C72 9 93 28 93 58 C80 64 20 64 7 58Z', '#e8212b')}
    ${ink(circ(30, 36, 6.5), '#fff', { sw: 3, off: 0, shade: false })}
    ${ink(circ(55, 22, 5), '#fff', { sw: 3, off: 0, shade: false })}
    ${ink(circ(74, 42, 6.5), '#fff', { sw: 3, off: 0, shade: false })}
    ${ink(circ(50, 46, 4), '#fff', { sw: 3, off: 0, shade: false })}
    ${stroke('M44 70 v12', 3)}` },
  cheese: { name: 'Сыр', kind: 'veg', svg: `
    ${ink('M10 70 L86 32 L88 78 L12 86 Z', '#ffc400')}
    ${ink('M10 70 L86 32 L58 22 Z', '#ffe55c', { off: 0, shade: false })}
    ${ink(circ(36, 75, 5.5), '#c98a00', { sw: 3, off: 0, shade: false })}
    ${ink(circ(64, 64, 6.5), '#c98a00', { sw: 3, off: 0, shade: false })}
    ${ink(circ(79, 77, 3.5), '#c98a00', { sw: 2.5, off: 0, shade: false })}
    ${ink(ell(56, 34, 4, 2.5), '#c98a00', { sw: 2.5, off: 0, shade: false })}
    ${glint('M22 68 L46 56', 3.5)}` },
  apple: { name: 'Яблоко', kind: 'fruit', svg: `
    ${ink('M50 30 C36 18 12 26 14 52 C16 78 38 94 50 86 C62 94 84 78 86 52 C88 26 64 18 50 30 Z', '#e8212b')}
    ${stroke('M50 31 C50 22 52 13 57 7', 5)}
    ${ink('M55 18 C62 6 76 8 79 13 C72 23 61 23 55 18 Z', GREEN, { sw: 3, off: 1.5, shade: false })}
    <ellipse cx="30" cy="46" rx="5.5" ry="10" fill="#fff" transform="rotate(16 30 46)"/>
    <circle cx="27" cy="62" r="2.6" fill="#fff"/>` },
  pear: { name: 'Груша', kind: 'fruit', svg: `
    ${ink('M50 16 C39 16 37 30 37 40 C22 50 18 66 24 79 C31 92 69 92 76 79 C82 66 78 50 63 40 C63 30 61 16 50 16 Z', '#c4dc1a')}
    ${stroke('M50 17 C50 11 52 6 57 3', 5)}
    ${ink('M54 12 C60 4 70 4 74 8 C68 15 60 16 54 12 Z', GREEN, { sw: 3, off: 1.5, shade: false })}
    <ellipse cx="34" cy="64" rx="5" ry="10" fill="#fff" transform="rotate(10 34 64)"/>
    <circle cx="41" cy="44" r="2.4" fill="#fff"/>` },
  cherry: { name: 'Вишня', kind: 'fruit', svg: `
    ${line2('M30 62 C36 40 50 22 64 10 M70 64 C66 44 65 26 64 10', '#6b8f1e', 3.5)}
    ${ink('M64 10 C72 4 84 8 88 15 C78 21 69 18 64 10 Z', GREEN, { sw: 3, off: 1.5, shade: false })}
    ${ink(circ(30, 72, 17), '#c8002f')}
    ${ink(circ(70, 74, 17), '#c8002f')}
    <ellipse cx="23" cy="66" rx="3.5" ry="5.5" fill="#fff" transform="rotate(30 23 66)"/>
    <ellipse cx="63" cy="68" rx="3.5" ry="5.5" fill="#fff" transform="rotate(30 63 68)"/>` },
  strawberry: { name: 'Клубника', kind: 'fruit', svg: `
    ${ink('M18 38 C18 24 82 24 82 38 C82 62 63 87 50 94 C37 87 18 62 18 38 Z', '#ee1c25')}
    <g fill="#ffe14d" stroke="${K}" stroke-width="1.4">
      <ellipse cx="34" cy="46" rx="2.4" ry="3.4"/><ellipse cx="50" cy="44" rx="2.4" ry="3.4"/><ellipse cx="66" cy="46" rx="2.4" ry="3.4"/>
      <ellipse cx="42" cy="60" rx="2.4" ry="3.4"/><ellipse cx="58" cy="60" rx="2.4" ry="3.4"/><ellipse cx="50" cy="75" rx="2.4" ry="3.4"/>
      <ellipse cx="30" cy="58" rx="2" ry="3"/><ellipse cx="70" cy="58" rx="2" ry="3"/></g>
    ${ink('M26 32 L34 16 L43 28 L50 10 L57 28 L66 16 L74 32 L60 36 L50 32 L40 36 Z', GREEN, { sw: 3, off: 1.5, shade: false })}
    ${glint('M26 42 C26 50 28 56 31 60', 3.5)}` },
  banana: { name: 'Банан', kind: 'fruit', svg: `
    ${ink('M18 28 C18 64 46 88 84 77 C88 75 88 70 84 68 C54 70 34 54 29 24 Z', '#ffd400')}
    ${ink('M18 30 L14 20 L24 17 L29 25 Z', '#7a4e1a', { sw: 3, off: 0, shade: false })}
    ${ink('M84 68 L90 70 L88 77 L84 77 Z', '#7a4e1a', { sw: 3, off: 0, shade: false })}
    ${stroke('M28 38 C34 58 52 70 74 72', 3)}
    ${glint('M22 40 C24 52 30 62 38 68', 3.5)}` },
};
const foodSvg = (id, size = 56) =>
  `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${FOOD[id].name}" style="overflow:visible">${FOOD[id].svg}</svg>`;

// ---------- Кот-повар (бравый комиксный шеф) ----------
// mood: 'happy' | 'calm' | 'sad' | 'cook'
function catSvg(mood = 'calm', size = 140) {
  const OR = '#ff8a1f';
  const white = (cx, cy, rx, ry) => ink(ell(cx, cy, rx, ry), '#fff', { sw: 4, off: 0, shade: false });
  let eyes = '', brows = '', mouth = '', extra = '';
  if (mood === 'happy') {
    eyes = stroke('M66 108 Q78 92 90 108 M110 108 Q122 92 134 108', 7);
    brows = stroke('M62 84 q14 -9 28 -3 M138 84 q-14 -9 -28 -3', 6);
    mouth = ink('M78 128 Q100 160 122 128 Z', '#8a0018', { sw: 4.5, off: 0, shade: false }) +
      `<path d="M82 129 H118 L115 135 H85 Z" fill="#fff" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M90 146 Q100 138 110 146 Q105 151 100 151 Q95 151 90 146 Z" fill="#ff5c8a"/>`;
    extra = ink(sparkle(22, 52, 13), '#ffd400', { sw: 3, off: 2, shade: false }) +
      ink(sparkle(182, 92, 10), '#ffd400', { sw: 3, off: 2, shade: false }) +
      ink(sparkle(176, 40, 7), '#fff', { sw: 3, off: 1.5, shade: false });
  } else if (mood === 'sad') {
    eyes = white(78, 106, 11, 12) + white(122, 106, 11, 12) +
      `<circle cx="78" cy="111" r="5.5" fill="${K}"/><circle cx="122" cy="111" r="5.5" fill="${K}"/>`;
    brows = stroke('M64 96 L90 86 M136 96 L110 86', 6.5);
    mouth = stroke('M86 144 Q100 132 114 144', 5);
    extra = ink('M68 118 C64 128 62 132 66 137 C70 140 76 136 74 129 Z', '#36c5ff', { sw: 3, off: 0, shade: false }) +
      stroke('M30 30 q6 6 0 12 q-6 6 0 12', 3.5) + stroke('M172 34 q-6 6 0 12 q6 6 0 12', 3.5);
  } else {
    const look = mood === 'cook' ? [6, 4] : [2, 2];
    eyes = white(78, 104, 11, 12.5) + white(122, 104, 11, 12.5) +
      `<circle cx="${78 + look[0]}" cy="${104 + look[1]}" r="5.8" fill="${K}"/><circle cx="${122 + look[0]}" cy="${104 + look[1]}" r="5.8" fill="${K}"/>` +
      `<circle cx="${76 + look[0]}" cy="${102 + look[1]}" r="1.8" fill="#fff"/><circle cx="${120 + look[0]}" cy="${102 + look[1]}" r="1.8" fill="#fff"/>`;
    if (mood === 'cook') {
      brows = `<path d="M62 84 L92 92 L90 98 L64 91 Z M138 84 L108 92 L110 98 L136 91 Z" fill="${K}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
      mouth = stroke('M84 136 Q100 142 116 132', 4.5) +
        ink('M104 138 Q112 138 112 146 Q110 152 104 150 Q100 146 104 138 Z', '#ff5c8a', { sw: 3, off: 0, shade: false });
    } else {
      brows = `<path d="M62 88 Q76 80 92 88 L90 93 Q76 87 64 94 Z M138 86 Q124 80 108 88 L110 93 Q124 87 136 92 Z" fill="${K}" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`;
      mouth = stroke('M84 134 Q100 144 118 128', 4.5) + stroke('M118 128 l5 -1', 3.5);
    }
  }
  const spoon = mood === 'cook'
    ? `<g class="spoon">${line2('M150 150 L183 72', '#d9822b', 6)}
       ${ink(ell(185, 62, 10, 14), '#d9822b', { sw: 3.5, off: 2, shade: false, t: 'rotate(22 185 62)' })}
       ${ink(circ(150, 152, 12), OR, { sw: 4, off: 2 })}
       ${stroke('M144 150 v6 M150 149 v7', 2.5)}</g>
       ${stroke('M172 104 q10 6 8 18 M182 96 q12 10 8 26', 3.5)}`
    : '';
  return `<svg viewBox="0 -14 200 214" width="${size}" height="${size * 214 / 200}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Кот-повар" style="overflow:visible">
    ${ink('M24 200 L50 152 L150 152 L176 200 Z', '#e8212b', { sw: 5, off: 4 })}
    ${ink('M44 200 C44 168 66 152 100 152 C134 152 156 168 156 200 Z', '#fff', { sw: 5, off: 4 })}
    ${stroke('M100 170 V200', 3.5)}
    <g fill="${K}"><circle cx="88" cy="178" r="3.6"/><circle cx="88" cy="192" r="3.6"/><circle cx="112" cy="178" r="3.6"/><circle cx="112" cy="192" r="3.6"/></g>
    ${ink('M38 86 L26 20 L82 56 Z', OR, { sw: 5, off: 3 })}
    ${ink('M162 86 L174 20 L118 56 Z', OR, { sw: 5, off: 3 })}
    <path d="M44 72 L36 36 L66 58 Z M156 72 L164 36 L134 58 Z" fill="#ffb3c8" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>
    ${ink('M36 104 C36 70 62 54 100 54 C138 54 164 70 164 104 C164 118 160 128 170 136 C158 137 155 142 148 147 C136 156 118 160 100 160 C82 160 64 156 52 147 C45 142 42 137 30 136 C40 128 36 118 36 104 Z', OR, { sw: 5, off: 4 })}
    <path d="M93 56 L100 72 L107 56 Z M76 59 L84 72 L87 57 Z M124 59 L116 72 L113 57 Z M37 96 L54 101 L37 107 Z M163 96 L146 101 L163 107 Z" fill="${K}"/>
    ${ink(ell(100, 132, 30, 20), '#fff4dc', { sw: 3, off: 0, shade: false })}
    ${eyes}${brows}
    ${ink('M92 118 H108 L100 127 Z', '#ff5c8a', { sw: 3, off: 0, shade: false })}
    ${mouth}
    ${stroke('M40 120 l30 4 M38 133 l32 -2 M160 120 l-30 4 M162 133 l-32 -2', 2.8)}
    ${ink('M78 156 L100 180 L122 156 Q100 164 78 156 Z', '#00a8e8', { sw: 4, off: 2, shade: false })}
    ${ink(circ(100, 160, 6), '#00a8e8', { sw: 3.5, off: 0, shade: false })}
    ${ink('M66 36 C44 36 42 4 66 4 C68 -11 96 -12 102 1 C110 -11 136 -7 134 6 C156 4 156 36 134 36 Z', '#fff', { sw: 5, off: 3 })}
    ${stroke('M84 14 q4 8 2 18 M114 12 q-3 10 0 20', 3)}
    ${ink('M66 30 H134 V54 H66 Z', '#fff', { sw: 5, off: 3, shade: false })}
    <path d="M66 46 H134 V54 H66 Z" fill="url(#ccDots)"/>
    ${ink(star(100, 42, 10, 4.5), '#ffd400', { sw: 2.5, off: 1.5, shade: false })}
    ${extra}
    ${spoon}
  </svg>`;
}

// ---------- Гости ----------
// mood: 'happy' | 'calm' | 'worried' | 'angry'
const GUESTS = [
  { id: 'dog', name: 'Пёс Бублик', fur: '#e8963a', ear: 'floppy', snout: '#fff0d6', earc: '#7a3e14' },
  { id: 'mouse', name: 'Мышка Пипа', fur: '#a9b2dc', ear: 'round', snout: '#eef0ff', inner: '#ff8fb6' },
  { id: 'bunny', name: 'Зайка Ушастик', fur: '#ffffff', ear: 'long', snout: '#ffffff', inner: '#ff8fb6' },
  { id: 'bear', name: 'Мишка Тоша', fur: '#a65a26', ear: 'small', snout: '#f2c48a', inner: '#f2c48a' },
  { id: 'fox', name: 'Лиса Рыжуля', fur: '#ff6a00', ear: 'pointy', snout: '#ffffff', inner: '#ffffff' },
  { id: 'pig', name: 'Хрюша Пончик', fur: '#ff9ec4', ear: 'pointy', snout: '#ff6fa8', inner: '#ff6fa8' },
  { id: 'frog', name: 'Лягушка Ква', fur: '#3fc04a', ear: 'eyes', snout: '#a8ec7a' },
];
function guestSvg(g, mood = 'calm', size = 110) {
  const F = g.fur, E = { sw: 4.5, off: 3 };
  let ears = '';
  if (g.ear === 'floppy') ears = ink(ell(34, 74, 17, 32), g.earc, { ...E, t: 'rotate(22 34 74)' }) + ink(ell(146, 74, 17, 32), g.earc, { ...E, t: 'rotate(-22 146 74)' });
  if (g.ear === 'round') ears = ink(circ(38, 42, 27), F, E) + ink(circ(38, 42, 15), g.inner, { sw: 3, off: 0, shade: false }) +
    ink(circ(142, 42, 27), F, E) + ink(circ(142, 42, 15), g.inner, { sw: 3, off: 0, shade: false });
  if (g.ear === 'long') ears = ink(ell(64, 24, 14, 34), F, E) + ink(ell(64, 26, 6, 24), g.inner, { sw: 3, off: 0, shade: false }) +
    ink(ell(116, 24, 14, 34), F, { ...E, t: 'rotate(10 116 50)' }) + ink(ell(116, 26, 6, 24), g.inner, { sw: 3, off: 0, shade: false, t: 'rotate(10 116 50)' });
  if (g.ear === 'small') ears = ink(circ(44, 42, 17), F, E) + ink(circ(44, 42, 8), g.inner, { sw: 3, off: 0, shade: false }) +
    ink(circ(136, 42, 17), F, E) + ink(circ(136, 42, 8), g.inner, { sw: 3, off: 0, shade: false });
  if (g.ear === 'pointy') ears = ink('M32 64 L40 10 L78 40 Z', F, E) + ink('M42 50 L45 24 L64 40 Z', g.inner, { sw: 3, off: 0, shade: false }) +
    ink('M148 64 L140 10 L102 40 Z', F, E) + ink('M138 50 L135 24 L116 40 Z', g.inner, { sw: 3, off: 0, shade: false }) +
    (g.id === 'fox' ? `<path d="M40 10 L37 30 L50 20 Z M140 10 L143 30 L130 20 Z" fill="${K}"/>` : '');
  if (g.ear === 'eyes') ears = ink(circ(60, 38, 22), F, E) + ink(circ(120, 38, 22), F, E);
  const frog = g.ear === 'eyes';
  const ey = frog ? 38 : 74;
  const ex = frog ? [60, 120] : [66, 114];
  const head = ell(90, 88, 62, 56);
  let body = ink(head, F, { sw: 5, off: 4 });
  if (frog) body += `<circle cx="60" cy="38" r="19.5" fill="${F}"/><circle cx="120" cy="38" r="19.5" fill="${F}"/>`;
  if (g.id === 'dog') body += `<ellipse cx="116" cy="70" rx="19" ry="17" fill="${g.earc}"/>`;
  if (mood === 'angry') body += `<path d="${head}" fill="url(#ccDotsR)"/>` + (frog ? `<circle cx="60" cy="38" r="19" fill="url(#ccDotsR)"/><circle cx="120" cy="38" r="19" fill="url(#ccDotsR)"/>` : '');
  const snout = frog || g.id === 'pig' ? '' : ink(ell(90, 108, 30, 20), g.snout, { sw: 3, off: 0, shade: false });
  const cheeks = mood === 'angry' ? '' : `<circle cx="44" cy="110" r="10" fill="url(#ccDotsP)"/><circle cx="136" cy="110" r="10" fill="url(#ccDotsP)"/>`;
  const white = (x, y, rx, ry) => ink(ell(x, y, rx, ry), '#fff', { sw: 3.5, off: 0, shade: false });

  let eyes = '', mouth = '', fx = '';
  const [a, b] = ex;
  if (mood === 'happy') {
    eyes = stroke(`M${a - 11} ${ey + 4} Q${a} ${ey - 12} ${a + 11} ${ey + 4} M${b - 11} ${ey + 4} Q${b} ${ey - 12} ${b + 11} ${ey + 4}`, 6);
    mouth = ink('M66 110 Q90 146 114 110 Z', '#8a0018', { sw: 4.5, off: 0, shade: false }) +
      `<path d="M70 111 H110 L107 117 H73 Z" fill="#fff" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M78 128 Q90 120 102 128 Q97 134 90 134 Q83 134 78 128 Z" fill="#ff5c8a"/>`;
    fx = ink(sparkle(18, 30, 12), '#ffd400', { sw: 3, off: 2, shade: false }) +
      ink(sparkle(164, 20, 9), '#ffd400', { sw: 3, off: 2, shade: false }) +
      ink(sparkle(170, 64, 6), '#fff', { sw: 2.5, off: 1.5, shade: false });
  } else if (mood === 'calm') {
    eyes = white(a, ey, 9.5, 11) + white(b, ey, 9.5, 11) +
      `<circle cx="${a + 1.5}" cy="${ey + 1.5}" r="5.2" fill="${K}"/><circle cx="${b + 1.5}" cy="${ey + 1.5}" r="5.2" fill="${K}"/>` +
      `<circle cx="${a}" cy="${ey}" r="1.8" fill="#fff"/><circle cx="${b}" cy="${ey}" r="1.8" fill="#fff"/>` +
      stroke(`M${a - 10} ${ey - 18} q10 -5 20 0 M${b - 10} ${ey - 18} q10 -5 20 0`, 4.5);
    mouth = stroke('M76 116 Q90 128 104 116', 4.5);
  } else if (mood === 'worried') {
    eyes = white(a, ey, 10.5, 12.5) + white(b, ey, 10.5, 12.5) +
      `<circle cx="${a}" cy="${ey + 2}" r="3.6" fill="${K}"/><circle cx="${b}" cy="${ey + 2}" r="3.6" fill="${K}"/>` +
      stroke(`M${a - 13} ${ey - 14} L${a + 8} ${ey - 23} M${b + 13} ${ey - 14} L${b - 8} ${ey - 23}`, 5.5);
    mouth = stroke('M72 120 q4.5 -7 9 0 q4.5 7 9 0 q4.5 -7 9 0 q4.5 7 9 0', 4);
    fx = ink('M154 34 C148 46 146 52 150 58 C154 62 162 60 162 52 C162 46 158 42 154 34 Z', '#36c5ff', { sw: 3, off: 1.5, shade: false }) +
      ink('M26 52 C22 60 21 63 23 67 C26 70 31 68 31 63 C31 59 29 56 26 52 Z', '#36c5ff', { sw: 2.5, off: 1, shade: false });
  } else { // angry
    eyes = white(a, ey + 2, 10, 9) + white(b, ey + 2, 10, 9) +
      `<circle cx="${a + 3}" cy="${ey + 4}" r="4.4" fill="${K}"/><circle cx="${b - 3}" cy="${ey + 4}" r="4.4" fill="${K}"/>` +
      `<path d="M${a - 15} ${ey - 16} L${a + 13} ${ey - 3} L${a + 13} ${ey + 2} L${a - 15} ${ey - 9} Z M${b + 15} ${ey - 16} L${b - 13} ${ey - 3} L${b - 13} ${ey + 2} L${b + 15} ${ey - 9} Z" fill="${K}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>`;
    mouth = ink('M68 112 H112 Q114 128 102 130 H78 Q66 128 68 112 Z', '#fff', { sw: 4.5, off: 0, shade: false }) +
      stroke('M69 121 H112 M79 112 V130 M90 112 V130 M101 112 V130', 2.6);
    fx = stroke('M138 30 q7 0 7 -7 M156 30 q-7 0 -7 -7 M138 42 q7 0 7 7 M156 42 q-7 0 -7 7', 8) +
      stroke('M138 30 q7 0 7 -7 M156 30 q-7 0 -7 -7 M138 42 q7 0 7 7 M156 42 q-7 0 -7 7', 4.5, '#e8212b') +
      stroke('M14 70 l12 4 M10 86 l14 0 M14 102 l12 -4', 4);
  }
  let nose = `<ellipse cx="90" cy="99" rx="9" ry="6.5" fill="${K}"/><ellipse cx="87" cy="97" rx="3" ry="1.8" fill="#fff"/>`;
  if (g.id === 'mouse' || g.id === 'bunny') nose = ink(ell(90, 99, 7, 5), '#ff5c8a', { sw: 3, off: 0, shade: false });
  if (g.id === 'pig') nose = ink(ell(90, 100, 20, 13), g.snout, { sw: 4, off: 2, shade: false }) + `<ellipse cx="83" cy="100" rx="3" ry="4" fill="${K}"/><ellipse cx="97" cy="100" rx="3" ry="4" fill="${K}"/>`;
  if (frog) nose = `<circle cx="84" cy="94" r="2.4" fill="${K}"/><circle cx="96" cy="94" r="2.4" fill="${K}"/>`;
  const whisk = (g.id === 'mouse' || g.id === 'bunny' || g.id === 'fox')
    ? stroke('M38 102 l26 2 M38 114 l26 -4 M142 102 l-26 2 M142 114 l-26 -4', 2.6) : '';
  const bow = g.id === 'mouse' ? ink('M22 10 L40 20 L22 30 Z', '#e8212b', { sw: 3, off: 1.5, shade: false }) + ink('M58 10 L40 20 L58 30 Z', '#e8212b', { sw: 3, off: 1.5, shade: false }) +
    ink(circ(40, 20, 4.5), '#ffd400', { sw: 2.5, off: 0, shade: false }) : '';
  return `<svg viewBox="0 0 180 160" width="${size}" height="${size * 160 / 180}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${g.name}" style="overflow:visible">
    ${ears}${body}${snout}${cheeks}${bow}
    ${eyes}${nose}${mouth}${whisk}${fx}
  </svg>`;
}

// ---------- Посуда ----------
function potSvg(liquid = '#f6c35b') {
  return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style="overflow:visible">
    ${stroke('M16 44 q-8 -10 0 -20 q8 -10 0 -20 M284 44 q8 -10 0 -20 q-8 -10 0 -20', 4.5)}
    ${ink(rr(4, 62, 46, 22, 11), '#2b2b2b', { sw: 5, off: 3, shade: false })}
    ${ink(rr(250, 62, 46, 22, 11), '#2b2b2b', { sw: 5, off: 3, shade: false })}
    ${ink('M36 50 L264 50 L250 176 C248 188 240 194 226 194 L74 194 C60 194 52 188 50 176 Z', '#1e63d6', { sw: 6, off: 5 })}
    ${ink('M43 112 L257 112 L254 138 L46 138 Z', '#ffd400', { sw: 4, off: 0 })}
    <g fill="#e8212b" stroke="${K}" stroke-width="2.5"><circle cx="80" cy="125" r="5"/><circle cx="120" cy="125" r="5"/><circle cx="160" cy="125" r="5"/><circle cx="200" cy="125" r="5"/><circle cx="240" cy="125" r="5"/></g>
    ${glint('M60 70 L66 104 M70 148 L74 172', 9)}
    ${glint('M82 70 L84 88', 5)}
    <g fill="${K}"><circle cx="52" cy="66" r="4"/><circle cx="248" cy="66" r="4"/></g>
    ${ink(ell(150, 50, 122, 22), '#0b2f6e', { sw: 6, off: 0, shade: false })}
    <ellipse class="soup" cx="150" cy="53" rx="108" ry="15" fill="${liquid}" stroke="${K}" stroke-width="4"/>
    <ellipse cx="150" cy="53" rx="108" ry="15" fill="url(#ccDotsW)" mask="url(#ccShade)" opacity=".7"/>
    <g class="bubbles" fill="#fff" stroke="${K}" stroke-width="2.5"><circle cx="110" cy="50" r="6"/><circle cx="184" cy="54" r="5"/><circle cx="150" cy="46" r="3.5"/></g>
  </svg>`;
}
function bowlSvg() {
  return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style="overflow:visible">
    ${ink('M108 178 H192 L200 196 H100 Z', '#e8212b', { sw: 5, off: 3, shade: false })}
    ${ink('M20 70 L280 70 C280 140 220 190 150 190 C80 190 20 140 20 70 Z', '#ffd400', { sw: 6, off: 5 })}
    ${ink('M28 104 C80 118 220 118 272 104 L264 126 C210 140 90 140 36 126 Z', '#e8212b', { sw: 4, off: 0, shade: false })}
    <g fill="#fff" stroke="${K}" stroke-width="2"><circle cx="70" cy="120" r="4.5"/><circle cx="110" cy="125" r="4.5"/><circle cx="150" cy="126" r="4.5"/><circle cx="190" cy="125" r="4.5"/><circle cx="230" cy="120" r="4.5"/></g>
    ${glint('M44 98 C50 128 66 150 86 164', 8)}
    ${ink(ell(150, 70, 130, 20), '#fff8e0', { sw: 6, off: 0, shade: false })}
    <ellipse cx="150" cy="74" rx="112" ry="12" fill="#ffe08a" stroke="${K}" stroke-width="2.5"/>
  </svg>`;
}

// ---------- Мелочи ----------
const ICON = {
  heart: (on = true) => `<svg viewBox="-1 -1 27 27" width="26" height="26" style="overflow:visible"><path d="M12 21 C4 14 2 11 2 7.5 C2 5 4 3 6.5 3 C8.5 3 10.5 4.5 12 6.5 C13.5 4.5 15.5 3 17.5 3 C20 3 22 5 22 7.5 C22 11 20 14 12 21 Z" fill="${K}" transform="translate(1.8 1.8)"/><path d="M12 21 C4 14 2 11 2 7.5 C2 5 4 3 6.5 3 C8.5 3 10.5 4.5 12 6.5 C13.5 4.5 15.5 3 17.5 3 C20 3 22 5 22 7.5 C22 11 20 14 12 21 Z" fill="${on ? '#e8212b' : '#d9d2c0'}" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>${on ? `<path d="M5.5 6.5 q1.5 -2 3.5 -1.2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>` : stroke('M8 9 l3 3 M11 9 l-3 3 M14 9 l3 3 M17 9 l-3 3', 1.6)}</svg>`,
  coin: (s = 22) => `<svg viewBox="-1 -1 27 27" width="${s}" height="${s}" style="vertical-align:-5px;overflow:visible"><circle cx="13.5" cy="13.5" r="10" fill="${K}"/><circle cx="12" cy="12" r="10" fill="#ffd400" stroke="${K}" stroke-width="2.2"/><path d="${star(12, 12.3, 5.6, 2.4)}" fill="#ff8a00" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.6 9 q1.5 -3.5 5 -4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`,
  ban: `<svg viewBox="0 0 100 100" width="100%" height="100%" style="position:absolute;inset:0"><circle cx="50" cy="50" r="42" fill="none" stroke="${K}" stroke-width="15"/><path d="M22 22 L78 78" stroke="${K}" stroke-width="15" stroke-linecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke="#e8212b" stroke-width="8"/><path d="M22 22 L78 78" stroke="#e8212b" stroke-width="8" stroke-linecap="round"/></svg>`,
  sound: (on) => `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 9 h4 l6 -5 v16 l-6 -5 h-4 Z" fill="#ffd400" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>${on
    ? `<path d="M16 8 q3 4 0 8 M18.5 5.5 q5 6.5 0 13" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : `<path d="M16 9 l6 6 M22 9 l-6 6" stroke="#e8212b" stroke-width="2.6" stroke-linecap="round"/>`}</svg>`,
  clock: `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:-5px"><circle cx="12" cy="13" r="9" fill="#fff" stroke="${K}" stroke-width="2.2"/><path d="M12 8 v5 l3 2" stroke="#e8212b" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
};
