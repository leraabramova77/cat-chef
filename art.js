// Все рисунки игры «Кот-повар» — нарисованы кодом (SVG), без смайликов.
const L = '#3b2a20'; // цвет контура

// ---------- Продукты (viewBox 0 0 100 100) ----------
const FOOD = {
  carrot: { name: 'Морковка', kind: 'veg', svg: `
    <path d="M50 30 C40 20 30 10 36 6 C42 4 46 14 50 22 C52 10 58 2 64 6 C68 10 58 20 54 30" fill="#4caf50" stroke="${L}" stroke-width="3"/>
    <path d="M34 34 C40 26 60 26 66 34 C66 50 58 78 50 94 C42 78 34 50 34 34 Z" fill="#ff8a2a" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 46 h8 M46 60 h8 M42 72 h6" stroke="#c45f0f" stroke-width="3" stroke-linecap="round"/>` },
  potato: { name: 'Картошка', kind: 'veg', svg: `
    <path d="M18 54 C14 34 34 22 54 24 C76 26 88 40 84 58 C80 76 60 82 42 80 C26 78 20 68 18 54 Z" fill="#d8a864" stroke="${L}" stroke-width="4"/>
    <circle cx="38" cy="44" r="3" fill="#9a6b33"/><circle cx="62" cy="40" r="2.5" fill="#9a6b33"/>
    <circle cx="56" cy="64" r="3" fill="#9a6b33"/><circle cx="34" cy="64" r="2" fill="#9a6b33"/>` },
  onion: { name: 'Лук', kind: 'veg', svg: `
    <path d="M50 8 C46 18 46 24 48 28 M52 28 C56 22 58 16 56 10" stroke="#5a9e3a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 28 C26 40 18 58 26 74 C34 88 66 88 74 74 C82 58 74 40 50 28 Z" fill="#e8b94a" stroke="${L}" stroke-width="4"/>
    <path d="M50 32 C40 46 38 66 46 84 M50 32 C60 46 62 66 54 84" stroke="#c48a22" stroke-width="2.5" fill="none"/>
    <path d="M44 86 l-4 8 M50 87 v8 M56 86 l4 8" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>` },
  tomato: { name: 'Помидор', kind: 'veg', svg: `
    <circle cx="50" cy="56" r="34" fill="#e53935" stroke="${L}" stroke-width="4"/>
    <path d="M50 24 L42 16 L46 28 L32 26 L44 32 L50 36 L56 32 L68 26 L54 28 L58 16 Z" fill="#43a047" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="36" cy="46" rx="6" ry="9" fill="#ff8a80" transform="rotate(30 36 46)"/>` },
  cucumber: { name: 'Огурец', kind: 'veg', svg: `
    <g transform="rotate(-35 50 50)">
    <rect x="14" y="36" width="72" height="28" rx="14" fill="#4f9d3a" stroke="${L}" stroke-width="4"/>
    <circle cx="30" cy="46" r="2.5" fill="#cde8a6"/><circle cx="46" cy="54" r="2.5" fill="#cde8a6"/>
    <circle cx="60" cy="44" r="2.5" fill="#cde8a6"/><circle cx="72" cy="54" r="2.5" fill="#cde8a6"/></g>` },
  cabbage: { name: 'Капуста', kind: 'veg', svg: `
    <circle cx="50" cy="54" r="36" fill="#8bc34a" stroke="${L}" stroke-width="4"/>
    <circle cx="50" cy="54" r="24" fill="#b5dc6e" stroke="${L}" stroke-width="3"/>
    <path d="M50 30 C44 44 44 64 50 78 M30 46 C40 50 46 56 50 64 M70 46 C60 50 54 56 50 64" stroke="#6b9a30" stroke-width="2.5" fill="none"/>` },
  beet: { name: 'Свёкла', kind: 'veg', svg: `
    <path d="M48 30 C42 20 36 12 40 6 M52 30 C56 18 62 10 68 10" stroke="#4caf50" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50 28 C28 30 18 48 24 64 C30 80 44 86 50 96 C56 86 70 80 76 64 C82 48 72 30 50 28 Z" fill="#8e1b4a" stroke="${L}" stroke-width="4"/>
    <ellipse cx="38" cy="48" rx="5" ry="8" fill="#c2507f"/>` },
  mushroom: { name: 'Гриб', kind: 'veg', svg: `
    <path d="M38 52 C36 68 36 80 40 88 L60 88 C64 80 64 68 62 52 Z" fill="#f5e6c8" stroke="${L}" stroke-width="4"/>
    <path d="M10 54 C10 26 30 12 50 12 C70 12 90 26 90 54 Z" fill="#c8572f" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="32" cy="36" r="5" fill="#fff"/><circle cx="56" cy="26" r="4" fill="#fff"/><circle cx="70" cy="42" r="5" fill="#fff"/>` },
  cheese: { name: 'Сыр', kind: 'veg', svg: `
    <path d="M12 70 L86 34 L88 76 L14 84 Z" fill="#ffd54f" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M12 70 L86 34 L60 26 Z" fill="#ffe082" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="40" cy="70" r="5" fill="#e0a800"/><circle cx="66" cy="62" r="6" fill="#e0a800"/><circle cx="78" cy="74" r="3" fill="#e0a800"/>` },
  apple: { name: 'Яблоко', kind: 'fruit', svg: `
    <path d="M50 30 C36 18 14 26 16 50 C18 76 38 92 50 84 C62 92 82 76 84 50 C86 26 64 18 50 30 Z" fill="#e53935" stroke="${L}" stroke-width="4"/>
    <path d="M50 30 C50 22 52 14 56 8" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M54 18 C62 8 74 10 76 14 C70 22 60 22 54 18 Z" fill="#4caf50" stroke="${L}" stroke-width="2.5"/>
    <ellipse cx="32" cy="46" rx="5" ry="9" fill="#ff8a80"/>` },
  pear: { name: 'Груша', kind: 'fruit', svg: `
    <path d="M50 16 C40 16 38 30 38 40 C24 50 20 66 26 78 C32 90 68 90 74 78 C80 66 76 50 62 40 C62 30 60 16 50 16 Z" fill="#cddc39" stroke="${L}" stroke-width="4"/>
    <path d="M50 16 C50 10 52 6 56 4" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="64" rx="5" ry="9" fill="#eef59b"/>` },
  cherry: { name: 'Вишня', kind: 'fruit', svg: `
    <path d="M30 64 C36 40 50 20 66 10 M70 66 C66 44 66 26 66 10" stroke="#5d7a2a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M66 10 C74 6 84 10 86 16 C78 20 70 18 66 10 Z" fill="#4caf50" stroke="${L}" stroke-width="2.5"/>
    <circle cx="30" cy="72" r="16" fill="#c2185b" stroke="${L}" stroke-width="4"/>
    <circle cx="70" cy="74" r="16" fill="#c2185b" stroke="${L}" stroke-width="4"/>
    <circle cx="24" cy="66" r="4" fill="#f48fb1"/><circle cx="64" cy="68" r="4" fill="#f48fb1"/>` },
  strawberry: { name: 'Клубника', kind: 'fruit', svg: `
    <path d="M20 36 C20 24 80 24 80 36 C80 60 62 86 50 92 C38 86 20 60 20 36 Z" fill="#ef3b3b" stroke="${L}" stroke-width="4"/>
    <path d="M28 30 L36 16 L44 28 L50 12 L56 28 L64 16 L72 30 Z" fill="#43a047" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/>
    <g fill="#ffe082"><ellipse cx="36" cy="46" rx="2" ry="3"/><ellipse cx="50" cy="44" rx="2" ry="3"/><ellipse cx="64" cy="46" rx="2" ry="3"/>
    <ellipse cx="42" cy="60" rx="2" ry="3"/><ellipse cx="58" cy="60" rx="2" ry="3"/><ellipse cx="50" cy="74" rx="2" ry="3"/></g>` },
  banana: { name: 'Банан', kind: 'fruit', svg: `
    <path d="M18 30 C20 64 46 86 82 76 C86 74 86 70 82 68 C54 70 34 54 28 26 Z" fill="#ffe14d" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M18 30 L16 22 L24 20 L28 26" fill="#8d6e3a" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 40 C36 58 52 68 72 70" stroke="#d4b000" stroke-width="2.5" fill="none"/>` },
};
const foodSvg = (id, size = 56) =>
  `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${FOOD[id].name}">${FOOD[id].svg}</svg>`;

// ---------- Кот-повар ----------
// mood: 'happy' | 'calm' | 'sad' | 'cook'
function catSvg(mood = 'calm', size = 140) {
  const eyes = mood === 'happy'
    ? `<path d="M70 104 q8 -10 16 0 M114 104 q8 -10 16 0" stroke="${L}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : mood === 'sad'
    ? `<circle cx="78" cy="106" r="6" fill="${L}"/><circle cx="122" cy="106" r="6" fill="${L}"/>
       <path d="M66 94 l18 6 M134 94 l-18 6" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`
    : `<ellipse cx="78" cy="104" rx="7" ry="9" fill="${L}"/><ellipse cx="122" cy="104" rx="7" ry="9" fill="${L}"/>
       <circle cx="80" cy="101" r="2.5" fill="#fff"/><circle cx="124" cy="101" r="2.5" fill="#fff"/>`;
  const mouth = mood === 'sad'
    ? `<path d="M88 136 q12 -8 24 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood === 'happy'
    ? `<path d="M86 126 q14 18 28 0 Z" fill="#e26a6a" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`
    : `<path d="M88 126 q6 8 12 0 q6 8 12 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const spoon = mood === 'cook'
    ? `<g class="spoon"><path d="M150 150 L182 70" stroke="#a0704a" stroke-width="7" stroke-linecap="round"/>
       <ellipse cx="184" cy="62" rx="9" ry="13" fill="#c08a5a" stroke="${L}" stroke-width="3" transform="rotate(22 184 62)"/></g>`
    : '';
  return `<svg viewBox="0 -14 200 214" width="${size}" height="${size * 214 / 200}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Кот-повар">
    <path d="M40 200 C40 160 64 146 100 146 C136 146 160 160 160 200 Z" fill="#fff" stroke="${L}" stroke-width="5"/>
    <path d="M86 150 L100 170 L114 150" fill="#e74c3c" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="100" cy="182" r="4" fill="${L}"/>
    <path d="M44 70 L52 20 L86 52 Z" fill="#f2a654" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M156 70 L148 20 L114 52 Z" fill="#f2a654" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M54 58 L56 36 L72 52 Z M146 58 L144 36 L128 52 Z" fill="#ffc9b0"/>
    <ellipse cx="100" cy="106" rx="64" ry="52" fill="#f2a654" stroke="${L}" stroke-width="5"/>
    <path d="M88 60 q12 10 24 0 M62 76 l12 6 M138 76 l-12 6" stroke="#c97a2c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="100" cy="126" rx="26" ry="18" fill="#fff3e6"/>
    ${eyes}
    <path d="M94 116 h12 l-6 7 Z" fill="#e2807a" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
    ${mouth}
    <path d="M40 116 l30 4 M38 130 l32 -2 M160 116 l-30 4 M162 130 l-32 -2" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="62" cy="124" r="8" fill="#ff9e9e" opacity=".6"/><circle cx="138" cy="124" r="8" fill="#ff9e9e" opacity=".6"/>
    <g transform="translate(0 -6)">
      <rect x="66" y="40" width="68" height="24" rx="4" fill="#fff" stroke="${L}" stroke-width="5"/>
      <path d="M66 46 C46 46 44 14 68 14 C70 -4 96 -8 102 8 C110 -6 136 -2 134 16 C156 14 156 46 134 46 Z" fill="#fff" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>
    </g>
    ${spoon}
  </svg>`;
}

// ---------- Гости ----------
// mood: 'happy' | 'calm' | 'worried' | 'angry'
const GUESTS = [
  { id: 'dog', name: 'Пёс Бублик', fur: '#c89060', ear: 'floppy', snout: '#f1d7b8' },
  { id: 'mouse', name: 'Мышка Пипа', fur: '#a9a9b8', ear: 'round', snout: '#e7e2ef' },
  { id: 'bunny', name: 'Зайка Ушастик', fur: '#f2eee8', ear: 'long', snout: '#ffffff' },
  { id: 'bear', name: 'Мишка Тоша', fur: '#8a5a3b', ear: 'small', snout: '#d6ae86' },
  { id: 'fox', name: 'Лиса Рыжуля', fur: '#ff8a3d', ear: 'pointy', snout: '#fff3e6' },
  { id: 'pig', name: 'Хрюша Пончик', fur: '#ffb3c1', ear: 'pointy', snout: '#ff8fa3' },
  { id: 'frog', name: 'Лягушка Ква', fur: '#7cc45a', ear: 'eyes', snout: '#b6e39a' },
];
function guestSvg(g, mood = 'calm', size = 110) {
  let ears = '';
  if (g.ear === 'floppy') ears = `<ellipse cx="34" cy="70" rx="16" ry="30" fill="#7a4e2a" stroke="${L}" stroke-width="4" transform="rotate(20 34 70)"/>
    <ellipse cx="146" cy="70" rx="16" ry="30" fill="#7a4e2a" stroke="${L}" stroke-width="4" transform="rotate(-20 146 70)"/>`;
  if (g.ear === 'round') ears = `<circle cx="38" cy="40" r="26" fill="${g.fur}" stroke="${L}" stroke-width="4"/><circle cx="38" cy="40" r="14" fill="#f7b6c6"/>
    <circle cx="142" cy="40" r="26" fill="${g.fur}" stroke="${L}" stroke-width="4"/><circle cx="142" cy="40" r="14" fill="#f7b6c6"/>`;
  if (g.ear === 'long') ears = `<ellipse cx="66" cy="22" rx="13" ry="34" fill="${g.fur}" stroke="${L}" stroke-width="4"/><ellipse cx="66" cy="22" rx="6" ry="24" fill="#f7b6c6"/>
    <ellipse cx="114" cy="22" rx="13" ry="34" fill="${g.fur}" stroke="${L}" stroke-width="4"/><ellipse cx="114" cy="22" rx="6" ry="24" fill="#f7b6c6"/>`;
  if (g.ear === 'small') ears = `<circle cx="44" cy="42" r="16" fill="${g.fur}" stroke="${L}" stroke-width="4"/><circle cx="136" cy="42" r="16" fill="${g.fur}" stroke="${L}" stroke-width="4"/>`;
  if (g.ear === 'pointy') ears = `<path d="M34 60 L42 14 L76 40 Z" fill="${g.fur}" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M146 60 L138 14 L104 40 Z" fill="${g.fur}" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`;
  if (g.ear === 'eyes') ears = `<circle cx="60" cy="38" r="20" fill="${g.fur}" stroke="${L}" stroke-width="4"/><circle cx="120" cy="38" r="20" fill="${g.fur}" stroke="${L}" stroke-width="4"/>`;
  const ey = g.ear === 'eyes' ? 38 : 74;
  const ex = g.ear === 'eyes' ? [60, 120] : [66, 114];
  let eyes;
  if (mood === 'happy') eyes = `<path d="M${ex[0]-8} ${ey+2} q8 -10 16 0 M${ex[1]-8} ${ey+2} q8 -10 16 0" stroke="${L}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else {
    eyes = `<circle cx="${ex[0]}" cy="${ey}" r="7" fill="${L}"/><circle cx="${ex[1]}" cy="${ey}" r="7" fill="${L}"/>
      <circle cx="${ex[0]+2}" cy="${ey-2}" r="2.5" fill="#fff"/><circle cx="${ex[1]+2}" cy="${ey-2}" r="2.5" fill="#fff"/>`;
    if (mood === 'angry') eyes += `<path d="M${ex[0]-12} ${ey-14} l20 7 M${ex[1]+12} ${ey-14} l-20 7" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
    if (mood === 'worried') eyes += `<path d="M${ex[0]-10} ${ey-10} l18 -6 M${ex[1]+10} ${ey-10} l-18 -6" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
  }
  const mouth = {
    happy: `<path d="M74 112 q16 18 32 0 Z" fill="#e26a6a" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`,
    calm: `<path d="M78 112 q12 10 24 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    worried: `<path d="M80 116 q10 -6 20 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    angry: `<path d="M76 120 q14 -14 28 0" stroke="${L}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  }[mood];
  let nose = `<ellipse cx="90" cy="98" rx="9" ry="6" fill="${L}"/>`;
  if (g.id === 'pig') nose = `<ellipse cx="90" cy="98" rx="18" ry="12" fill="${g.snout}" stroke="${L}" stroke-width="4"/><circle cx="84" cy="98" r="3" fill="${L}"/><circle cx="96" cy="98" r="3" fill="${L}"/>`;
  if (g.id === 'frog') nose = `<circle cx="84" cy="92" r="2" fill="${L}"/><circle cx="96" cy="92" r="2" fill="${L}"/>`;
  const whisk = (g.id === 'mouse' || g.id === 'bunny' || g.id === 'fox')
    ? `<path d="M40 100 l26 2 M40 112 l26 -4 M140 100 l-26 2 M140 112 l-26 -4" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>` : '';
  const snout = g.id === 'frog' || g.id === 'pig' ? '' : `<ellipse cx="90" cy="106" rx="30" ry="20" fill="${g.snout}"/>`;
  return `<svg viewBox="0 0 180 160" width="${size}" height="${size * 160 / 180}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${g.name}">
    ${ears}
    <ellipse cx="90" cy="88" rx="62" ry="56" fill="${g.fur}" stroke="${L}" stroke-width="4"/>
    ${g.ear === 'eyes' ? `<circle cx="60" cy="38" r="17" fill="${g.fur}"/><circle cx="120" cy="38" r="17" fill="${g.fur}"/><circle cx="60" cy="38" r="12" fill="#fff"/><circle cx="120" cy="38" r="12" fill="#fff"/>` : ''}
    ${snout}
    <circle cx="48" cy="104" r="9" fill="#ff9e9e" opacity=".55"/><circle cx="132" cy="104" r="9" fill="#ff9e9e" opacity=".55"/>
    ${eyes}${nose}${mouth}${whisk}
  </svg>`;
}

// ---------- Посуда ----------
function potSvg(liquid = '#f6c35b') {
  return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
    <rect x="8" y="64" width="38" height="18" rx="9" fill="#6d7a86" stroke="${L}" stroke-width="5"/>
    <rect x="254" y="64" width="38" height="18" rx="9" fill="#6d7a86" stroke="${L}" stroke-width="5"/>
    <path d="M36 50 L264 50 L250 178 C248 190 240 196 226 196 L74 196 C60 196 52 190 50 178 Z" fill="#9aa8b4" stroke="${L}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M60 80 L64 170" stroke="#c7d1d9" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="150" cy="50" rx="118" ry="20" fill="${liquid}" stroke="${L}" stroke-width="6" class="soup"/>
    <g class="bubbles" fill="#fff" opacity=".75"><circle cx="110" cy="46" r="5"/><circle cx="180" cy="52" r="4"/><circle cx="150" cy="42" r="3"/></g>
  </svg>`;
}
function bowlSvg() {
  return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
    <path d="M20 70 L280 70 C280 140 220 190 150 190 C80 190 20 140 20 70 Z" fill="#6fb3d9" stroke="${L}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M40 100 C70 110 230 110 260 100" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="2 18" stroke-linecap="round"/>
    <ellipse cx="150" cy="70" rx="130" ry="20" fill="#e9f6ff" stroke="${L}" stroke-width="6"/>
  </svg>`;
}

// ---------- Мелочи ----------
const ICON = {
  heart: (on = true) => `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 21 C4 14 2 11 2 7.5 C2 5 4 3 6.5 3 C8.5 3 10.5 4.5 12 6.5 C13.5 4.5 15.5 3 17.5 3 C20 3 22 5 22 7.5 C22 11 20 14 12 21 Z" fill="${on ? '#e74c3c' : '#e8d9cc'}" stroke="${L}" stroke-width="1.8"/></svg>`,
  coin: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="vertical-align:-5px"><circle cx="12" cy="12" r="10" fill="#ffc83d" stroke="${L}" stroke-width="1.8"/><circle cx="12" cy="12" r="6" fill="none" stroke="#d99a00" stroke-width="1.6"/></svg>`,
  ban: `<svg viewBox="0 0 100 100" width="100%" height="100%" style="position:absolute;inset:0"><circle cx="50" cy="50" r="42" fill="none" stroke="#e53935" stroke-width="9"/><path d="M22 22 L78 78" stroke="#e53935" stroke-width="9" stroke-linecap="round"/></svg>`,
  sound: (on) => `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9 h4 l5 -4 v14 l-5 -4 h-4 Z" fill="${L}"/>${on
    ? `<path d="M16 8 q3 4 0 8 M18.5 5.5 q5 6.5 0 13" stroke="${L}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<path d="M16 9 l6 6 M22 9 l-6 6" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`}</svg>`,
  clock: `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:-5px"><circle cx="12" cy="13" r="9" fill="#fff" stroke="${L}" stroke-width="2"/><path d="M12 8 v5 l3 2" stroke="${L}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
};
