// Все рисунки игры «Кот-повар» — ПИКСЕЛЬ-АРТ, 16 бит.
// Каждый спрайт — сетка символов (палитра «символ → цвет»). Сетка автоматически
// получает тень по нижнему/правому краю и тёмный контур в 1 пиксель,
// а затем превращается в SVG: по одному <path> на цвет, shape-rendering="crispEdges".

// ---------- Палитра ----------
const PAL = {
  k: '#2b1a2e', K: '#2b1a2e',                 // контур (K — тонкая линия без своего контура)
  w: '#fff8ec', c: '#c9d6e3', s: '#8b9bb4', S: '#4f5d78',
  r: '#e83b3b', R: '#9e1f3a', p: '#ff9a8a',
  o: '#ff8c1a', O: '#c2511a',
  y: '#ffd93d', Y: '#d69a1c', e: '#fff0a8',
  g: '#5cc23a', G: '#2a7a35', V: '#2a7a35', l: '#b6ec6a',
  b: '#c8864a', B: '#7d4a2b', t: '#edc48c', h: '#8a5232', H: '#5a3220',
  m: '#b0306a', M: '#64163f', n: '#ffb6c8', N: '#e0708e',
  a: '#b6b0c8', A: '#7a7290', u: '#5ec8ff', U: '#2f7fd0',
};
const L = PAL.k; // цвет контура (оставлен для совместимости)
// какой цвет становится тенью у края спрайта
const SHADE = { o: 'O', r: 'R', y: 'Y', g: 'G', b: 'B', t: 'b', m: 'M', n: 'N', a: 'A', s: 'S', w: 'c', l: 'g', e: 'y', u: 'U', c: 's', h: 'H', p: 'r', L: 'J' };
const NOOUT = new Set(['K', 'V']); // эти пиксели не обводятся контуром

// ---------- Движок спрайтов ----------
const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
function ell(g, cx, cy, rx, ry, c, keep) {
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry;
    if (dx * dx + dy * dy <= 1 && (!keep || keep(x, y))) g[y][x] = c;
  }
}
function rc(g, x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < g[0].length) g[j][i] = c;
}
function pt(g, list, c) { list.forEach(([x, y]) => { if (g[y] && x >= 0 && x < g[0].length) g[y][x] = c; }); }
// точки + зеркальные (относительно центра сетки)
function sym(g, list, c) { const W = g[0].length; pt(g, list, c); pt(g, list.map(([x, y]) => [W - 1 - x, y]), c); }
function line(g, x0, y0, x1, y1, c, thick = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
    for (let t = 0; t < thick; t++) pt(g, [[x + t, y]], c);
  }
}
function padG(g, n) {
  const w = g[0].length + n * 2;
  const row = () => Array(w).fill('.');
  return [...Array.from({ length: n }, row), ...g.map(r => [...Array(n).fill('.'), ...r, ...Array(n).fill('.')]), ...Array.from({ length: n }, row)];
}
function shadeG(g) {
  const h = g.length, w = g[0].length, o = g.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = SHADE[g[y][x]]; if (!s) continue;
    if (x + 1 >= w || g[y][x + 1] === '.' || y + 1 >= h || g[y + 1][x] === '.') o[y][x] = s;
  }
  return o;
}
function outlineG(g) {
  const h = g.length, w = g[0].length, o = g.map(r => r.slice());
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && g[y][x] !== '.' && !NOOUT.has(g[y][x]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (g[y][x] === '.' && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) o[y][x] = 'k';
  return o;
}
// сетка/строки → готовая обработанная сетка
function sprite(src, { pad = 1, shade = true, outline = true } = {}) {
  let g = typeof src[0] === 'string' ? src.map(r => r.split('')) : src.map(r => r.slice());
  const w = Math.max(...g.map(r => r.length));
  g = g.map(r => { while (r.length < w) r.push('.'); return r; });
  if (pad) g = padG(g, pad);
  if (shade) g = shadeG(g);
  if (outline) g = outlineG(g);
  return g;
}
// сетка → SVG-пути (по одному на цвет)
function paths(g, pal = PAL) {
  const by = {};
  g.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const c = row[x];
      if (c === '.') { x++; continue; }
      let n = 1; while (row[x + n] === c) n++;
      by[c] = (by[c] || '') + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  return Object.entries(by).map(([c, d]) => `<path fill="${pal[c] || '#f0f'}" d="${d}"/>`).join('');
}
const SVGA = 'xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"';
function mix(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// ---------- Продукты (спрайты 14×14 + контур = 16×16) ----------
const FOOD_ROWS = {
  carrot: [
    '...g..gg..g...',
    '...gg.gg.gg...',
    '....gggggg....',
    '...oooooooo...',
    '...yooooooo...',
    '...yoooOOoo...',
    '....yooooo....',
    '....oOOooo....',
    '.....oooo.....',
    '.....ooOO.....',
    '......oo......',
    '......oo......',
    '......o.......',
    '..............'],
  potato: [
    '..............',
    '..............',
    '....tttttt....',
    '..tttttttttt..',
    '.tetttttbtttt.',
    '.ettttttttttt.',
    '.tttbtttttbtt.',
    '.tttttttttttt.',
    '.ttttttbttttt.',
    '..tbtttttttt..',
    '....tttttt....',
    '..............',
    '..............',
    '..............'],
  onion: [
    '.....g..g.....',
    '......gg......',
    '......yy......',
    '.....yyyy.....',
    '....yyyyyy....',
    '...eyYyyYyy...',
    '..eyyYyyYyyy..',
    '..eyyYyyYyyy..',
    '..yyyYyyYyyy..',
    '...yyYyyYyy...',
    '....yyyyyy....',
    '.....yyyy.....',
    '.....B..B.....',
    '..............'],
  tomato: [
    '..............',
    '......GG......',
    '...g.gggg.g...',
    '..rggggggggr..',
    '.rprrggggrrrr.',
    '.rpprrrrrrrrr.',
    '.rprrrrrrrrrr.',
    '.rrrrrrrrrrrr.',
    '.rrrrrrrrrrrr.',
    '.rrrrrrrrrrrr.',
    '..rrrrrrrrrr..',
    '...rrrrrrrr...',
    '.....rrrr.....',
    '..............'],
  cucumber: [
    '..............',
    '.........ggg..',
    '........glggg.',
    '.......gglggg.',
    '......glgggg..',
    '.....ggglgg...',
    '....gglggg....',
    '...glgggg.....',
    '..ggglgg......',
    '.glgggg.......',
    '.glggg........',
    '.gggg.........',
    '..gg..........',
    '..............'],
  cabbage: [
    '..............',
    '.....llll.....',
    '...llllllll...',
    '..lllllglllg..',
    '.gllllglllgg..',
    '.ggllgllllggg.',
    'gGgglllllggGg.',
    'gGggglllgggGg.',
    'gGGgggllggGGg.',
    '.gGGggggggGg..',
    '..gGGGggGGG...',
    '....gggggg....',
    '..............',
    '..............'],
  beet: [
    '...gg...gg....',
    '...ggg.ggg....',
    '.....gRg......',
    '......R.......',
    '....mmmmmm....',
    '...mnmmmmmm...',
    '..mnmmmmmmmm..',
    '..mnmmmmmmmm..',
    '..mmmmmmmmmm..',
    '...mmmmmmmm...',
    '....mmmmmm....',
    '.....mmmm.....',
    '......mm......',
    '.......M......'],
  mushroom: [
    '.....rrrr.....',
    '...rrwwrrrr...',
    '..rrrwwrrwwr..',
    '.rwwrrrrrwwrr.',
    '.rwwrrrrrrrrr.',
    'rrrrrrwwrrrrrr',
    'rrrrrrwwrrrrrr',
    '..tttttttttt..',
    '....wwwwww....',
    '....wwwwww....',
    '....wwwwww....',
    '...wwwwwwww...',
    '...wwwwwwww...',
    '..............'],
  cheese: [
    '..............',
    '..............',
    '..........eey.',
    '........eeeey.',
    '......eeeeeey.',
    '....eeeeeeeey.',
    '..eeeeeeeeeey.',
    '.yyyyyyyyyyyy.',
    '.yYYyyyyyyyyy.',
    '.yYYyyyyYYyyy.',
    '.yyyyyyyYYyyy.',
    '.yyyyYyyyyyyy.',
    '.yyyyyyyyyyyy.',
    '..............'],
  apple: [
    '.......B.gg...',
    '.......Bggg...',
    '..rrrr.Brrrr..',
    '.rrwrrrrrrrrr.',
    '.rwwrrrrrrrrr.',
    '.rwrrrrrrrrrr.',
    '.rprrrrrrrrrr.',
    '.rrrrrrrrrrrr.',
    '.rrrrrrrrrrrr.',
    '..rrrrrrrrrr..',
    '..rrrrrrrrrr..',
    '...rrrr.rrr...',
    '..............',
    '..............'],
  pear: [
    '......B.......',
    '......Bgg.....',
    '.....lll......',
    '.....llll.....',
    '....lllll.....',
    '....elllll....',
    '...elllllll...',
    '..elllllllll..',
    '..elllllllll..',
    '..llllllllll..',
    '..llllllllll..',
    '...llllllll...',
    '....llllll....',
    '..............'],
  cherry: [
    '........ggg...',
    '.......VVgg...',
    '......V..V....',
    '.....V...V....',
    '....V....V....',
    '...V.....V....',
    '...V......V...',
    '.rrrr...rrrr..',
    'rprrrr.rprrrr.',
    'rprrrr.rprrrr.',
    'rrrrrr.rrrrrr.',
    'rrrrrr.rrrrrr.',
    '.rrrr...rrrr..',
    '..............'],
  strawberry: [
    '....g.gg.g....',
    '...gggggggg...',
    '..rrggggggrr..',
    '.rrrrrggrrrrr.',
    '.rerrrrrrrerr.',
    '.rrrrerrrrrrr.',
    '.rrrrrrrerrrr.',
    '..rerrrrrrrr..',
    '..rrrrerrrer..',
    '...rrrrrrrr...',
    '....rerrrr....',
    '.....rrrr.....',
    '......rr......',
    '..............'],
  banana: [
    '..............',
    '..BB..........',
    '..yy..........',
    '..yyy.........',
    '..yyy.........',
    '..yyyy........',
    '..eyyyy.......',
    '...eyyyy......',
    '...eeyyyyy....',
    '....eeyyyyyyBB',
    '.....eeeyyyyy.',
    '.......eeee...',
    '..............',
    '..............'],
};
const FOOD = {
  carrot: { name: 'Морковка', kind: 'veg' },
  potato: { name: 'Картошка', kind: 'veg' },
  onion: { name: 'Лук', kind: 'veg' },
  tomato: { name: 'Помидор', kind: 'veg' },
  cucumber: { name: 'Огурец', kind: 'veg' },
  cabbage: { name: 'Капуста', kind: 'veg' },
  beet: { name: 'Свёкла', kind: 'veg' },
  mushroom: { name: 'Гриб', kind: 'veg' },
  cheese: { name: 'Сыр', kind: 'veg' },
  apple: { name: 'Яблоко', kind: 'fruit' },
  pear: { name: 'Груша', kind: 'fruit' },
  cherry: { name: 'Вишня', kind: 'fruit' },
  strawberry: { name: 'Клубника', kind: 'fruit' },
  banana: { name: 'Банан', kind: 'fruit' },
};
for (const id in FOOD) {
  FOOD[id].rows = FOOD_ROWS[id];
  FOOD[id].svg = paths(sprite(FOOD_ROWS[id])); // готовое содержимое для viewBox 0 0 16 16
}
// размер округляется до кратного 8 px, чтобы пиксели были ровными
const foodSvg = (id, size = 56) => {
  const s = Math.max(16, Math.floor(size / 8) * 8);
  return `<svg viewBox="0 0 16 16" width="${s}" height="${s}" ${SVGA} role="img" aria-label="${FOOD[id].name}">${FOOD[id].svg}</svg>`;
};

// ---------- Кот-повар (30×32 + контур = 32×34) ----------
// mood: 'happy' | 'calm' | 'sad' | 'cook' (+ 'worried' | 'angry')
function catGrid(mood) {
  const g = grid(30, 32);
  ell(g, 15, 34, 12.5, 10, 'w');                       // поварская куртка
  const ear = [[3, 4, 5], [4, 3, 6], [5, 3, 7], [6, 2, 8], [7, 2, 9], [8, 2, 9], [9, 2, 9], [10, 2, 9], [11, 3, 9], [12, 3, 9]];
  ear.forEach(([y, a, b]) => sym(g, Array.from({ length: b - a + 1 }, (_, i) => [a + i, y]), 'o'));
  [[5, 4, 5], [6, 4, 6], [7, 4, 7], [8, 4, 7], [9, 4, 6]].forEach(([y, a, b]) => sym(g, Array.from({ length: b - a + 1 }, (_, i) => [a + i, y]), 'n'));
  ell(g, 15, 16.5, 12.5, 7.6, 'o');                    // голова
  // колпак
  ell(g, 10.5, 4, 4, 4, 'w'); ell(g, 19.5, 4, 4, 4, 'w'); ell(g, 15, 3, 4.6, 3.3, 'w');
  rc(g, 9, 6, 12, 4, 'w'); rc(g, 9, 6, 12, 1, 'c');
  pt(g, [[12, 2], [12, 3], [17, 2], [17, 3], [11, 8], [14, 8], [17, 8]], 'c');
  // полоски
  sym(g, [[12, 10], [12, 11], [14, 10], [14, 11], [14, 12], [4, 15], [5, 15], [3, 17], [4, 17]], 'O');
  ell(g, 15, 19.6, 5.2, 3.3, 'w');                     // мордочка
  sym(g, [[13, 17], [14, 17], [14, 18]], 'n');         // нос
  // глаза и рот
  const E = (list, c = 'k') => sym(g, list, c);
  if (mood === 'happy') {
    E([[8, 15], [9, 14], [10, 14], [11, 15]]);
    E([[12, 19], [13, 19], [14, 19], [12, 20], [13, 21], [14, 21]]); sym(g, [[13, 20], [14, 20]], 'r');
    E([[6, 18], [7, 18]], 'p');
  } else if (mood === 'sad') {
    E([[9, 14], [10, 14], [9, 15], [10, 15]]); pt(g, [[9, 14], [19, 14]], 'w');
    E([[8, 12], [9, 12], [10, 11], [11, 11]]);
    E([[13, 20], [14, 20], [12, 21]]);
    pt(g, [[8, 16], [8, 17], [21, 16]], 'u');
  } else if (mood === 'angry' || mood === 'worried') {
    E([[9, 14], [10, 14], [9, 15], [10, 15]]); pt(g, [[9, 14], [19, 14]], 'w');
    E(mood === 'angry' ? [[8, 11], [9, 11], [10, 12], [11, 12]] : [[8, 12], [9, 12], [10, 11], [11, 11]]);
    E([[13, 20], [14, 20], [12, 21]]);
  } else {
    E([[9, 13], [10, 13], [9, 14], [10, 14], [9, 15], [10, 15]]); pt(g, [[9, 13], [19, 13]], 'w');
    E([[14, 19], [13, 20], [12, 20]]);
    if (mood === 'cook') E([[6, 18], [7, 18]], 'p');
  }
  // усы — тонкие линии
  sym(g, [[0, 18], [1, 18], [2, 18], [3, 18], [1, 21], [2, 20], [3, 20]], 'K');
  // шейный платок и пуговицы
  [[23, 11, 18], [24, 12, 17], [25, 13, 16], [26, 14, 15]].forEach(([y, a, b]) => rc(g, a, y, b - a + 1, 1, 'r'));
  pt(g, [[12, 24], [13, 25]], 'p');
  pt(g, [[11, 28], [18, 28], [11, 30], [18, 30]], 'S');
  return g;
}
function spoonGrid() {
  const g = grid(30, 32);
  line(g, 21, 29, 27, 16, 'b', 2);
  ell(g, 28, 12.5, 1.9, 3.4, 'b'); pt(g, [[27, 11], [27, 12]], 't');
  ell(g, 21.5, 27.5, 2.6, 2.3, 'o'); pt(g, [[20, 27], [22, 27]], 'O');
  return g;
}
const _catCache = {};
function catSvg(mood = 'calm', size = 140) {
  const k = Math.max(1, Math.round(size / 32));
  if (!_catCache[mood]) _catCache[mood] = paths(sprite(catGrid(mood)));
  if (!_catCache.spoon) _catCache.spoon = paths(sprite(spoonGrid()));
  const spoon = mood === 'cook' ? `<g class="spoon">${_catCache.spoon}</g>` : '';
  return `<svg viewBox="0 0 32 34" width="${32 * k}" height="${34 * k}" ${SVGA} role="img" aria-label="Кот-повар">${_catCache[mood]}${spoon}</svg>`;
}

// ---------- Гости (32×28 + контур = 34×30) ----------
// mood: 'happy' | 'calm' | 'worried' | 'angry' (+ 'sad')
const GUESTS = [
  { id: 'dog', name: 'Пёс Бублик', fur: 'b', ear: 'floppy', snout: 't' },
  { id: 'mouse', name: 'Мышка Пипа', fur: 'a', ear: 'round', snout: 'w' },
  { id: 'bunny', name: 'Зайка Ушастик', fur: 'w', ear: 'long', snout: 'w' },
  { id: 'bear', name: 'Мишка Тоша', fur: 'h', ear: 'small', snout: 't' },
  { id: 'fox', name: 'Лиса Рыжуля', fur: 'o', ear: 'pointy', snout: 'w' },
  { id: 'pig', name: 'Хрюша Пончик', fur: 'n', ear: 'pointy', snout: 'N' },
  { id: 'frog', name: 'Лягушка Ква', fur: 'g', ear: 'eyes', snout: 'l' },
];
function guestGrid(gs, mood) {
  const g = grid(32, 28), F = gs.fur, id = gs.id;
  const span = (y, a, b, c) => sym(g, Array.from({ length: b - a + 1 }, (_, i) => [a + i, y]), c);
  // уши (до головы)
  if (gs.ear === 'round') { ell(g, 7, 7, 5.6, 5.6, F); ell(g, 25, 7, 5.6, 5.6, F); ell(g, 7, 7, 3.2, 3.2, 'n'); ell(g, 25, 7, 3.2, 3.2, 'n'); }
  if (gs.ear === 'long') { ell(g, 10.5, 6.5, 3.2, 7, F); ell(g, 21.5, 6.5, 3.2, 7, F); ell(g, 10.5, 6.5, 1.3, 5, 'n'); ell(g, 21.5, 6.5, 1.3, 5, 'n'); }
  if (gs.ear === 'small') { ell(g, 7, 9, 4, 4, F); ell(g, 25, 9, 4, 4, F); ell(g, 7, 9, 2, 2, 't'); ell(g, 25, 9, 2, 2, 't'); }
  if (gs.ear === 'pointy') {
    const top = id === 'pig' ? 4 : 1;
    for (let y = top; y <= 12; y++) {
      const d = y - top;
      span(y, 6 - Math.floor(d / 3), 6 + Math.floor(d * .65), F);
      if (d >= 3) span(y, 6 - Math.floor(d / 3) + 1, 6 + Math.floor(d * .65) - 2, id === 'pig' ? 'N' : 'w');
    }
    if (id === 'fox') { span(top, 6, 6, 'B'); span(top + 1, 6, 7, 'B'); }
  }
  if (gs.ear === 'eyes') { ell(g, 10.5, 7, 4.8, 4.8, F); ell(g, 21.5, 7, 4.8, 4.8, F); }
  ell(g, 16, 17.5, 12.6, 10, F);                         // голова
  if (gs.ear === 'floppy') { ell(g, 4.5, 15, 3.2, 7.5, 'B'); ell(g, 27.5, 15, 3.2, 7.5, 'B'); }
  if (gs.ear === 'eyes') { ell(g, 10.5, 7, 3.2, 3.2, 'w'); ell(g, 21.5, 7, 3.2, 3.2, 'w'); }
  // мордочка
  let my = 22; // строка рта
  if (id === 'fox') { ell(g, 10, 22, 5.5, 4.5, 'w'); ell(g, 22, 22, 5.5, 4.5, 'w'); }
  else if (id === 'frog') ell(g, 16, 23, 9.5, 4.2, 'l');
  else if (id === 'pig') { ell(g, 16, 19.5, 5, 3.5, 'N'); my = 24; }
  else if (id !== 'bunny') ell(g, 16, 21.5, 6.2, 4.2, gs.snout);
  // нос
  if (id === 'pig') sym(g, [[14, 18], [14, 19]], 'k');
  else if (id === 'frog') sym(g, [[14, 18]], 'k');
  else if (id === 'mouse' || id === 'bunny') { span(18, 15, 15, 'N'); span(19, 15, 15, 'N'); }
  else { span(18, 14, 15, 'k'); span(19, 15, 15, 'k'); }
  if (id !== 'pig' && id !== 'frog') span(20, 15, 15, 'k');
  // глаза
  const ey = gs.ear === 'eyes' ? 6 : 14, ex = 10;
  const E = (list, c = 'k') => sym(g, list, c);
  if (mood === 'happy') E([[ex - 1, ey + 1], [ex, ey], [ex + 1, ey], [ex + 2, ey + 1]]);
  else if (mood === 'calm') { E([[ex, ey], [ex + 1, ey], [ex, ey + 1], [ex + 1, ey + 1], [ex, ey + 2], [ex + 1, ey + 2]]); pt(g, [[ex, ey], [31 - ex - 1, ey]], 'w'); }
  else {
    E([[ex, ey + 1], [ex + 1, ey + 1], [ex, ey + 2], [ex + 1, ey + 2]]); pt(g, [[ex, ey + 1], [31 - ex - 1, ey + 1]], 'w');
    if (mood === 'angry') E([[ex - 1, ey - 2], [ex, ey - 2], [ex + 1, ey - 1], [ex + 2, ey - 1]]);
    else E([[ex - 1, ey - 1], [ex, ey - 1], [ex + 1, ey - 2], [ex + 2, ey - 2]]);
  }
  // рот
  if (mood === 'happy') {
    span(my, 13, 15, 'k'); span(my + 1, 13, 13, 'k'); span(my + 1, 14, 15, 'r'); span(my + 2, 14, 15, 'k');
    E([[6, 19], [7, 19]], 'p');
  } else if (mood === 'calm') {
    span(my, 13, 13, 'k'); span(my + 1, 14, 15, 'k');
    E([[6, 19], [7, 19]], 'p');
  } else if (mood === 'worried' || mood === 'sad') {
    span(my, 14, 15, 'k'); span(my + 1, 14, 14, 'k'); span(my + 1, 15, 15, 'R'); span(my + 2, 15, 15, 'k');
    pt(g, [[25, 9], [24, 10], [25, 10], [24, 11], [25, 11]], 'u'); pt(g, [[24, 10]], 'w');
  } else if (mood === 'angry') {
    span(my, 14, 15, 'k'); span(my + 1, 13, 13, 'k');
    E([[6, 19], [7, 19]], 'r');
    pt(g, [[24, 4], [26, 4], [23, 5], [24, 5], [26, 5], [27, 5], [23, 7], [24, 7], [26, 7], [27, 7], [24, 8], [26, 8]], 'r');
  }
  if (id === 'bunny' && mood !== 'angry') pt(g, [[15, my + 2], [16, my + 2]], 'w');
  // усы
  if (id === 'mouse' || id === 'bunny' || id === 'fox' || id === 'dog') sym(g, [[0, 20], [1, 20], [2, 20], [3, 20], [1, 23], [2, 22], [3, 22]], 'K');
  return g;
}
const _gCache = {};
function guestSvg(g, mood = 'calm', size = 110) {
  const k = Math.max(1, Math.round(size / 34)), key = g.id + mood;
  if (!_gCache[key]) _gCache[key] = paths(sprite(guestGrid(g, mood)));
  return `<svg viewBox="0 0 34 30" width="${34 * k}" height="${30 * k}" ${SVGA} role="img" aria-label="${g.name}">${_gCache[key]}</svg>`;
}

// ---------- Посуда (96×64) ----------
function potSvg(liquid = '#f6c35b') {
  const g = grid(96, 64);
  // ручки
  rc(g, 2, 25, 9, 5, 'S'); rc(g, 3, 25, 7, 1, 's'); rc(g, 85, 25, 9, 5, 'S'); rc(g, 86, 25, 7, 1, 's');
  // корпус
  for (let y = 21; y <= 61; y++) { const d = Math.max(0, y - 57); rc(g, 9 + d, y, 78 - d * 2, 1, 's'); }
  rc(g, 16, 30, 3, 25, 'c'); rc(g, 17, 32, 1, 12, 'w'); rc(g, 22, 34, 1, 14, 'c');
  rc(g, 76, 28, 10, 30, 'S'); rc(g, 72, 30, 2, 26, 'S');
  rc(g, 9, 40, 78, 1, 'S'); rc(g, 9, 41, 78, 1, 'c');
  rc(g, 12, 58, 72, 3, 'S');
  // кромка и жидкость
  ell(g, 48, 21, 42, 7.6, 'c'); ell(g, 48, 21, 42, 7.6, 's', (x, y) => y < 20);
  ell(g, 48, 21, 39, 6, 'k');
  ell(g, 48, 21.6, 38, 5.2, 'L');
  ell(g, 48, 19.6, 36, 3.6, 'J', (x, y) => y < 19);
  rc(g, 26, 21, 9, 1, 'j'); rc(g, 30, 22, 3, 1, 'j'); rc(g, 58, 23, 6, 1, 'j'); rc(g, 70, 20, 4, 1, 'j');
  rc(g, 18, 26, 60, 1, 'w');
  const pal = { ...PAL, L: liquid, j: mix(liquid, '#ffffff', .45), J: mix(liquid, '#2b1a2e', .3) };
  return `<svg viewBox="0 0 96 64" width="100%" ${SVGA} preserveAspectRatio="xMidYMax meet">
    <g class="steam" fill="#fff"><rect x="36" y="8" width="2" height="2"/><rect x="38" y="4" width="2" height="2"/><rect x="58" y="6" width="2" height="2"/><rect x="56" y="2" width="2" height="2"/></g>
    ${paths(sprite(g, { pad: 0 }), pal)}
    <g class="bubbles" fill="#fff"><rect x="34" y="20" width="2" height="2"/><rect x="62" y="21" width="2" height="2"/><rect x="48" y="18" width="2" height="2"/></g>
  </svg>`;
}
function bowlSvg() {
  const g = grid(96, 64);
  rc(g, 34, 54, 28, 7, 'U'); rc(g, 34, 54, 28, 1, 'u');           // ножка
  ell(g, 48, 26, 44, 31, 'u', (x, y) => y >= 26);                 // чаша
  for (let x = 12; x < 86; x += 9) rc(g, x, 35, 4, 3, 'w');
  rc(g, 8, 42, 80, 1, 'U');
  rc(g, 16, 30, 2, 8, 'w');
  ell(g, 48, 26, 45, 7.4, 'w');                                   // кромка
  ell(g, 48, 26, 42, 5.8, 'k');
  ell(g, 48, 26.6, 41, 4.9, 'c');
  ell(g, 48, 24.8, 39, 3.2, 's', (x, y) => y < 24);
  return `<svg class="bowl" viewBox="0 0 96 64" width="100%" ${SVGA} preserveAspectRatio="xMidYMax meet">${paths(sprite(g, { pad: 0 }))}</svg>`;
}

// ---------- Мелочи (иконки 12×12) ----------
const _ic = {};
function icon(key, rows) { if (!_ic[key]) _ic[key] = paths(sprite(rows)); return _ic[key]; }
const HEART = ['.rrr..rrr.', 'rwrrrrrrrr', 'rwrrrrrrrr', 'rrrrrrrrrr', '.rrrrrrrr.', '..rrrrrr..', '...rrrr...', '....rr....'];
const COIN = ['...yyyy...', '.yyeyyyyy.', '.yeyyYyyy.', 'yeyyyYyyyy', 'yeyyyYyyyy', 'yyyyyYyyyy', 'yyyyyYyyyy', '.yyyyYyyy.', '.yyyyyyyy.', '...yyyy...'];
const SPEAKER = ['....w.....', '...ww.....', 'wwwww.....', 'wwwww.....', 'wwwww.....', 'wwwww.....', '...ww.....', '....w.....'];
function banGrid() {
  const g = grid(18, 18);
  for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) {
    const d = Math.hypot(x + .5 - 9, y + .5 - 9);
    if ((d <= 9 && d >= 6.6) || (d < 7 && Math.abs(x - y) <= 1)) g[y][x] = 'r';
  }
  return g;
}
function clockGrid() {
  const g = grid(10, 10); ell(g, 5, 5, 5, 5, 'w');
  pt(g, [[5, 2], [5, 3], [5, 4], [5, 5], [6, 5], [7, 6]], 'K'); return g;
}
const ICON = {
  heart: (on = true) => `<svg viewBox="0 -1 12 12" width="24" height="24" ${SVGA}>${on ? icon('h1', HEART) : icon('h0', HEART.map(r => r.replace(/r/g, 'a').replace(/w/g, 'c')))}</svg>`,
  coin: (s = 22) => { const z = Math.max(12, Math.round(s / 12) * 12); return `<svg viewBox="0 0 12 12" width="${z}" height="${z}" ${SVGA} style="vertical-align:-5px">${icon('coin', COIN)}</svg>`; },
  ban: `<svg viewBox="0 0 20 20" width="100%" height="100%" ${SVGA} style="position:absolute;inset:0">${paths(sprite(banGrid(), { shade: false }))}</svg>`,
  sound: (on) => {
    const g = SPEAKER.map(r => r.split(''));
    if (on) pt(g, [[6, 2], [7, 3], [7, 4], [6, 5], [8, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [8, 7]], 'K');
    else pt(g, [[6, 2], [9, 2], [7, 3], [8, 3], [7, 4], [8, 4], [6, 5], [9, 5]], 'r');
    return `<svg viewBox="0 -1 12 12" width="24" height="24" ${SVGA}>${paths(sprite(g))}</svg>`;
  },
  clock: `<svg viewBox="0 0 12 12" width="24" height="24" ${SVGA} style="vertical-align:-5px">${paths(sprite(clockGrid()))}</svg>`,
};
