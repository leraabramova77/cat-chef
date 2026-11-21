'use strict';
// «Кот-повар», пиксельная версия 2.
// Вся картинка рисуется в маленьком холсте 176×320 — по одному логическому пикселю,
// без масштабирования спрайтов. Потом холст целиком растягивается в целое число раз,
// поэтому все пиксели на экране (кот, продукты, буквы, рамки) одного размера.

const W = 176, H = 320;
const view = document.getElementById('cv');
const out = view.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const c = buf.getContext('2d');
let K = 1;
function fit() {
  const dpr = window.devicePixelRatio || 1;
  K = Math.max(1, Math.floor(Math.min(innerWidth * dpr / W, innerHeight * dpr / H)));
  view.width = W * K; view.height = H * K;
  view.style.width = W * K / dpr + 'px'; view.style.height = H * K / dpr + 'px';
}
addEventListener('resize', fit); fit();

// ---------- Мелочи ----------
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const RANKS = ['Поварёнок', 'Помощник повара', 'Повар', 'Шеф-повар', 'Главный шеф', 'Кот-легенда'];
const rankOf = (n) => RANKS[Math.min(RANKS.length - 1, Math.floor(n / 5))];
const inR = (p, r) => p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h;

// ---------- Цвета сцены ----------
const C = {
  ink: '#2b1a2e', paper: '#fff8ec', cream: '#f6e7c8', muted: '#8a6f7e',
  wallA: '#f4dcae', wallB: '#ecd09c', wallLine: '#d9b47a',
  wood: '#c8864a', woodD: '#7d4a2b', woodL: '#edc48c', woodDD: '#5a3220',
  steel: '#c9d6e3', steelD: '#8b9bb4', steelDD: '#4f5d78',
  fridge: '#eef5fb', fridgeD: '#b9cbe0', fridgeIn: '#d4ecf7', glass: '#a9dcf2', ice: '#e4f6ff', iceD: '#8fd0f0',
  red: '#e83b3b', redD: '#9e1f3a', green: '#5cc23a', greenD: '#2a7a35', greenL: '#c9f0b0',
  yellow: '#ffd93d', yellowD: '#d69a1c', orange: '#ff8c1a', blue: '#5ec8ff', blueD: '#2f7fd0', sky: '#9ee0ff',
  dark: '#3a2a3e', darker: '#24162a', dlg: '#2a3a8c', dlgD: '#1a2560', floor: '#8a5a3a', floorD: '#6a4028',
  pinkL: '#ffd6d6',
};
Object.assign(PAL, { q: '#93a85a', Q: '#55663a', i: '#dff4ff', I: '#8fd0f0', x: '#6b4a8a' });

// ---------- Рисование ----------
const rd = Math.round;
c.imageSmoothingEnabled = false;
function R(x, y, w, h, col) { c.fillStyle = col; c.fillRect(rd(x), rd(y), rd(w), rd(h)); }
function box(x, y, w, h, fill, border = C.ink) {
  R(x + 1, y, w - 2, 1, border); R(x + 1, y + h - 1, w - 2, 1, border);
  R(x, y + 1, 1, h - 2, border); R(x + w - 1, y + 1, 1, h - 2, border);
  if (fill) R(x + 1, y + 1, w - 2, h - 2, fill);
}
function dither(x, y, w, h, col, ph = 0) {
  c.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = (j + ph) & 1; i < w; i += 2) c.fillRect(x + i, y + j, 1, 1);
}
function blit(img, x, y, flip) {
  if (!flip) { c.drawImage(img, rd(x), rd(y)); return; }
  c.save(); c.translate(rd(x) + img.width, rd(y)); c.scale(-1, 1); c.drawImage(img, 0, 0); c.restore();
}
const T = (s, x, y, col, o = {}) => drawText(c, s, rd(x), rd(y), col, FONT, o);
const TB = (s, x, y, col, o = {}) => drawText(c, s, rd(x), rd(y), col, FONT_BIG, o);
const TBox = (s, x, y, w, col, o = {}) => drawTextBox(c, s, rd(x), rd(y), w, col, FONT, o);

// ---------- Спрайты: сетки из sprites.js → маленькие холсты ----------
const SP = {};
const cache = (k, f) => SP[k] || (SP[k] = f());
function toCanvas(gr, pal = PAL) {
  const h = gr.length, w = gr[0].length, cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const x = cv.getContext('2d');
  let x1 = w, y1 = h, x2 = 0, y2 = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const ch = gr[j][i]; if (ch === '.') continue;
    x.fillStyle = pal[ch] || '#ff00ff'; x.fillRect(i, j, 1, 1);
    if (i < x1) x1 = i; if (j < y1) y1 = j; if (i + 1 > x2) x2 = i + 1; if (j + 1 > y2) y2 = j + 1;
  }
  cv.bb = { x1, y1, x2, y2 };
  cv.solid = (i, j) => gr[j] !== undefined && gr[j][i] !== undefined && gr[j][i] !== '.';
  return cv;
}
const rowsOf = (rows) => rows.map(r => r.split(''));
const spr = (rows, o) => toCanvas(sprite(typeof rows[0] === 'string' ? rowsOf(rows) : rows, o));

// продукт: целый / нарезанный / испорченный
const INNER = { carrot: 'y', potato: 'e', onion: 'w', tomato: 'p', cucumber: 'l', cabbage: 'l', beet: 'n', mushroom: 'w', cheese: 'e', apple: 'e', pear: 'e', cherry: 'p', strawberry: 'p', banana: 'e' };
function foodGrid(id, chopped, spoiled) {
  let g0 = rowsOf(FOOD_ROWS[id]);
  if (spoiled) g0 = g0.map((row, y) => row.map((ch, x) => ch === '.' ? ch
    : (x * 5 + y * 3) % 7 === 0 ? 'Q' : (x * 3 + y * 5) % 6 === 0 ? 'q' : ch));
  if (!chopped) return g0;
  const inner = INNER[id] || 'e', h = g0.length;
  const res = Array.from({ length: h + 1 }, () => Array(16).fill('.'));
  for (const [a, b, dx, dy] of [[0, 5, 0, 0], [5, 10, 6, 1], [10, 14, 12, 0]])
    for (let y = 0; y < h; y++) for (let x = a; x < b; x++) {
      let ch = g0[y][x]; if (ch === '.') continue;
      if ((x === b - 1 && b !== 14) || (x === a && a !== 0)) ch = spoiled ? 'q' : inner;
      res[y + dy][dx + x - a] = ch;
    }
  return res;
}
const foodSpr = (id, chopped = false, spoiled = false) => cache(`f:${id}:${chopped}:${spoiled}`, () => toCanvas(sprite(foodGrid(id, chopped, spoiled))));

const JUNK = {
  sock: { name: 'Носок', rows: [
    '....rrrrr.....', '....wwwww.....', '....rrrrr.....', '....wwwww.....', '....wwwww.....', '....wwwww.....',
    '....wwwwww....', '....wwwwwww...', '...wwwwwwwwww.', '..wwwwwwwwwww.', '..wwwwwwwwwww.', '...wwwwwwwww..'] },
  bone: { name: 'Рыбья кость', rows: [
    '..............', '...c.c.c.c....', 'c..c.c.c.c.ww.', 'cc.c.c.c.cwwww', 'ccccccccccwkww',
    'cc.c.c.c.cwwww', 'c..c.c.c.c.ww.', '...c.c.c.c....'] },
  can: { name: 'Ржавая банка', rows: [
    '...ssssssss...', '..sccccccccs..', '..ssssssssss..', '..rrrrrrrrrr..', '..rwwwwwwwwr..', '..rwyyBByywr..',
    '..rwwwwwwwwr..', '..rrrrrrrrrr..', '..sssshsssss..', '...sshhhsss...'] },
};
const MOUSE_SLEEP = spr(['..aa............', '.anna...........', '.aaaaaaaa.......', 'aaKaaaaaaa......', 'kaaaaaaaaaa.....', '.aaaaaaaaaaKKK..', '..aa..aa.....K..']);
const MOUSE_RUN = spr(['..aa............', '.anna...........', '.aaaaaaaa.......', 'akaaaaaaaa......', 'kaaaaaaaaaa.....', '.aaaaaaaaaaKKK..', '.a..a.a..a...K..']);

const ICONS = {
  heart: spr(HEART), heart0: spr(HEART.map(r => r.replace(/r/g, 'a').replace(/w/g, 'c'))), coin: spr(COIN),
  ban: toCanvas(sprite(banGrid(), { shade: false })),
  fire: spr(['....r.....', '...rr..r..', '...ror.r..', '..roorrr..', '..rooyorr.', '.rooyyyor.', '.royyyyor.', '.royyeyor.', '..ryyyyr..', '...rrrr...']),
  knife: spr(['.........c', '........cc', '.......ccs', '......ccs.', '.....ccs..', '....ccs...', '...BBs....', '..BBB.....', '.BBB......', '.BB.......']),
  spoon: spr(['.......bb.', '......bttb', '......bbbb', '.....bbbb.', '....bb....', '...bb.....', '..bb......', '.bb.......', 'bb........', 'b.........']),
  bigKnife: spr(['cccccccccc...', 'wccccccccccc.', 'ssssssssssssBBBBB', '...........BBBBBB', '............BBBB.']),
};
function speakerSpr(on) {
  return cache('spk' + on, () => {
    const g0 = rowsOf(SPEAKER);
    if (on) pt(g0, [[6, 2], [7, 3], [7, 4], [6, 5], [8, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [8, 7]], 'K');
    else pt(g0, [[6, 2], [9, 2], [7, 3], [8, 3], [7, 4], [8, 4], [6, 5], [9, 5]], 'r');
    return toCanvas(sprite(g0));
  });
}
const catSpr = (mood) => cache('cat' + mood, () => toCanvas(sprite(catGrid(mood))));
const SPOON = toCanvas(sprite(spoonGrid()));
const guestSpr = (gs, mood) => cache('g' + gs.id + mood, () => toCanvas(sprite(guestGrid(gs, mood))));

// кастрюля и миска: «задняя» часть (вся) и «передняя» (то, что ниже кромки) —
// продукты рисуются между ними и как будто тонут в супе
function vesselSprites(kind, liquid) {
  return cache(`v:${kind}:${liquid}`, () => {
    const gr = grid(54, 30);
    if (kind === 'pot') {
      rc(gr, 0, 9, 5, 4, 'S'); rc(gr, 49, 9, 5, 4, 'S');
      for (let y = 7; y <= 29; y++) { const d = Math.max(0, y - 26); rc(gr, 3 + d, y, 48 - d * 2, 1, 's'); }
      rc(gr, 7, 12, 2, 13, 'c'); rc(gr, 8, 13, 1, 6, 'w'); rc(gr, 42, 10, 5, 17, 'S');
      rc(gr, 3, 18, 48, 1, 'S'); rc(gr, 3, 19, 48, 1, 'c');
      ell(gr, 27, 7, 25.5, 4.4, 'c'); ell(gr, 27, 7, 23.5, 3.4, 'k');
      ell(gr, 27, 7.4, 22.5, 2.8, 'L'); ell(gr, 27, 6.6, 20, 1.6, 'J', (x, y) => y < 6);
      pt(gr, [[14, 7], [15, 7], [36, 8], [37, 8], [25, 6]], 'j');
    } else {
      rc(gr, 17, 25, 20, 5, 'U'); rc(gr, 17, 25, 20, 1, 'u');
      ell(gr, 27, 7, 26.5, 20, 'u', (x, y) => y >= 7);
      for (let x = 6; x < 50; x += 7) rc(gr, x, 14, 3, 2, 'w');
      rc(gr, 4, 19, 46, 1, 'U'); rc(gr, 7, 10, 2, 6, 'w');
      ell(gr, 27, 7, 26.5, 4.4, 'w'); ell(gr, 27, 7, 24, 3.4, 'k'); ell(gr, 27, 7.4, 23, 2.8, 'c');
    }
    const pal = { ...PAL, L: liquid, j: mix(liquid, '#ffffff', .45), J: mix(liquid, '#2b1a2e', .25) };
    const full = sprite(gr, { pad: 1 });
    const back = toCanvas(full, pal);
    // передняя часть: всё, что ниже нижнего края жидкости
    const front = full.map((row, y) => row.map((ch, x) => {
      const t = (x + .5 - 28) / 23.5;
      const edge = Math.abs(t) >= 1 ? 0 : 8.4 + 3 * Math.sqrt(1 - t * t);
      return y >= edge ? ch : '.';
    }));
    return { back, front: toCanvas(front, pal) };
  });
}

// ---------- Звук ----------
let actx = null, soundOn = store.get('catchef.sound', true);
function tone(freq, dur, type = 'square', delay = 0, vol = 0.06) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  } catch {}
}
const sfx = {
  pick() { tone(660, .05); }, drop() { tone(330, .06, 'triangle', 0, .1); },
  plop() { tone(300, .1, 'sine', 0, .12); tone(600, .08, 'sine', .04, .08); },
  chop() { tone(180 + rnd(60), .05, 'square', 0, .07); },
  crack() { tone(1200, .04, 'square', 0, .05); tone(900, .05, 'square', .03, .05); },
  shatter() { [1400, 1100, 1700, 900].forEach((f, i) => tone(f, .06, 'square', i * .03, .04)); },
  squeak() { tone(1800, .05, 'sine', 0, .08); tone(2200, .06, 'sine', .06, .08); },
  door() { tone(140, .12, 'triangle', 0, .1); }, click() { tone(900, .03, 'square', 0, .05); },
  stir() { tone(420 + rnd(80), .05, 'triangle', 0, .06); },
  trash() { tone(200, .08, 'square', 0, .06); tone(120, .1, 'square', .05, .06); },
  pour() { for (let i = 0; i < 5; i++) tone(700 - i * 90, .08, 'triangle', i * .05, .07); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .14, 'square', i * .08, .05)); },
  fail() { tone(220, .2, 'sawtooth', 0, .05); tone(165, .3, 'sawtooth', .15, .05); },
  tick() { tone(900, .04, 'square', 0, .03); },
};

// ---------- Блюда ----------
const DISH = {
  'компот': { kind: 'fruit', chop: false, vessel: 'pot', stir: 1, liquid: '#f08aa0' },
  'овощи': { kind: 'veg', chop: false, vessel: 'pot', stir: 1, liquid: '#e9d9a0', say: 'Варёные овощи!' },
  'варенье': { kind: 'fruit', chop: true, vessel: 'pot', stir: 2, liquid: '#c2185b' },
  'суп': { kind: 'veg', chop: true, vessel: 'pot', stir: 2, liquid: '#f6c35b' },
  'щи': { kind: 'veg', chop: true, vessel: 'pot', stir: 2, liquid: '#c8d86a' },
  'рагу': { kind: 'veg', chop: true, vessel: 'pot', stir: 2, liquid: '#d9813a' },
  'борщ': { kind: 'veg', chop: true, vessel: 'pot', stir: 2, liquid: '#d0405f' },
  'салат': { kind: 'veg', chop: true, vessel: 'bowl', stir: 2, liquid: '#c9d6e3' },
  'фруктовый салат': { kind: 'fruit', chop: true, vessel: 'bowl', stir: 2, liquid: '#c9d6e3' },
};
const WATER = '#bfe3f0';
const dishOf = () => DISH[S.order.dish];
const sayOf = (name) => DISH[name].say || name[0].toUpperCase() + name.slice(1) + '!';

// ---------- Геометрия кухни ----------
const FR = { x: 8, y: 80, w: 58, h: 176 };          // внутренность холодильника
const FRIDGE = { x: 4, y: 78, w: 64, h: 180 };
const SHELVES = [106, 150, 196, 246];               // пол морозилки и три полки
const COUNTER_Y = 214, FLOOR_Y = 266;
const POT = { x: 116, y: 176, cx: 144, sy: 184 };
const POT_ZONE = { x: 112, y: 158, w: 62, h: 52 };
const BOARD = { x: 74, y: 209, w: 36, cx: 92 };
const BOARD_ZONE = { x: 70, y: 186, w: 42, h: 30 };
const KNOB = { x: 136, y: 222, w: 14, h: 14 };
const BIN = { x: 76, y: 232, w: 22, h: 34 };
const CAT = { x: 76, y: 182 };
const CAT_ZONE = { x: 78, y: 174, w: 30, h: 22 };

// ---------- Состояние ----------
let screen = 'menu';
let S = null;                 // смена
let ITEMS = [];               // все продукты и предметы на кухне
let held = null;              // предмет в лапе (перетаскивается)
let toast = null;
let P = [];                   // частицы
let now = 0, uid = 0, zc = 0;
let BTNS = [];                // кнопки, нарисованные в этом кадре

function mkItem(o) {
  return Object.assign({ uid: ++uid, kind: 'food', id: null, chopped: false, spoiled: false, ice: 0, chop: 0,
    x: 0, y: 0, vy: 0, place: 'fridge', layer: 1, z: ++zc, ph: Math.random() * 6 }, o);
}
function itemSpr(it) {
  if (it.kind === 'food') return foodSpr(it.id, it.chopped, it.spoiled);
  if (it.kind === 'junk') return cache('j' + it.id, () => spr(JUNK[it.id].rows));
  return it.run ? MOUSE_RUN : MOUSE_SLEEP;
}
function itemName(it) {
  if (it.kind === 'junk') return JUNK[it.id].name;
  if (it.kind === 'mouse') return 'Мышка спит';
  let n = FOOD[it.id].name;
  if (it.ice) return n + ' во льду';
  if (it.spoiled) n = 'Испорчено: ' + n.toLowerCase();
  if (it.chopped) n += ' (кусочки)';
  return n;
}
function bbw(it) { const s = itemSpr(it); return { l: it.x + s.bb.x1, r: it.x + s.bb.x2, t: it.y + s.bb.y1, b: it.y + s.bb.y2 }; }
const potItems = () => ITEMS.filter(i => i.place === 'pot');
const boardItem = () => ITEMS.find(i => i.place === 'board');

// ---------- Физика: предметы падают на полку / стол / пол или на другие предметы ----------
function baseY(it, b) {
  if (it.place === 'fridge') {
    const off = it.layer ? 0 : -3;
    for (const s of SHELVES) if (s + off >= b.b - 0.5) return s + off;
    return SHELVES[SHELVES.length - 1] + off;
  }
  return it.place === 'counter' ? COUNTER_Y : FLOOR_Y;
}
function settle(dt) {
  for (const it of ITEMS) {
    if ((it.place !== 'fridge' && it.place !== 'counter' && it.place !== 'floor') || it === held || it.run) continue;
    const b = bbw(it), sb = itemSpr(it).bb;
    let s = baseY(it, b);
    for (const o of ITEMS) {
      if (o === it || o.place !== it.place || o.layer !== it.layer || o === held || o.run) continue;
      const q = bbw(o), ov = Math.min(b.r, q.r) - Math.max(b.l, q.l);
      if (ov >= 5 && q.t >= b.b - 0.5 && q.t < s) s = q.t;
    }
    if (b.b < s - 0.01) {
      it.vy = Math.min(it.vy + 700 * dt, 240); it.y += it.vy * dt;
      if (it.y + sb.y2 >= s) { it.y = s - sb.y2; if (it.vy > 90 && dt < .1) sfx.drop(); it.vy = 0; }
    } else { it.y = s - sb.y2; it.vy = 0; }
  }
}

// ---------- Заказ ----------
function makeOrder(n) {
  let dish;
  if (n <= 2) dish = pick(['компот', 'овощи']);
  else dish = pick(['суп', 'щи', 'рагу', 'борщ', 'салат', 'салат', 'фруктовый салат', 'варенье', 'компот', 'суп']);
  const d = DISH[dish];
  const pool = Object.keys(FOOD).filter(id => FOOD[id].kind === d.kind);
  const types = Math.min(1 + Math.ceil(n / 2), d.kind === 'fruit' ? 4 : 4);
  const maxQ = n < 3 ? 1 : n < 6 ? 2 : 3;
  let chosen = shuffle(pool).slice(0, types);
  if (dish === 'борщ' && !chosen.includes('beet')) chosen[0] = 'beet';
  if (dish !== 'борщ' && d.kind === 'veg' && chosen.includes('beet') && n > 2) dish = 'борщ';
  const need = {};
  chosen.forEach(id => need[id] = 1 + rnd(maxQ));
  const others = shuffle(Object.keys(FOOD).filter(id => !need[id]));
  let ban = null;
  if (n >= 4 && Math.random() < 0.6) ban = others.find(id => FOOD[id].kind === DISH[dish].kind) || others[0];
  const total = Object.values(need).reduce((a, b) => a + b, 0);
  const time = Math.max(40, 70 - n * 2) + total * 5 + (DISH[dish].chop ? total * 3 : 0);
  let g; do { g = pick(GUESTS); } while (g === S.lastGuest);
  S.lastGuest = g;
  return { dish, need, ban, time, guest: g, others };
}

// наполняем холодильник: нужное + запас + лишнее + сюрпризы
function stock(o, n) {
  ITEMS = []; held = null;
  const shelfList = [], freezer = [];
  for (const [id, q] of Object.entries(o.need)) for (let i = 0; i < q + 1; i++) shelfList.push(mkItem({ id }));
  const extra = o.others.filter(id => id !== o.ban).slice(0, Math.min(3 + n, 9));
  extra.forEach(id => shelfList.push(mkItem({ id })));
  if (o.ban) { shelfList.push(mkItem({ id: o.ban })); shelfList.push(mkItem({ id: o.ban })); }
  if (n >= 4) shuffle(Object.keys(o.need)).slice(0, 1 + (n > 7)).forEach(id => shelfList.push(mkItem({ id, spoiled: true })));
  if (n >= 2) shuffle(Object.keys(JUNK)).slice(0, 1 + (n > 5)).forEach(id => shelfList.push(mkItem({ kind: 'junk', id })));
  if (n >= 3 && Math.random() < 0.45) shelfList.push(mkItem({ kind: 'mouse', id: 'mouse' }));
  // морозилка: продукты во льду; с 3-го заказа там может лежать и нужный
  if (n >= 3) {
    const id = pick(Object.keys(o.need));
    const i = shelfList.findIndex(it => it.id === id && !it.spoiled);
    if (i >= 0) { const [it] = shelfList.splice(i, 1); it.ice = 3; freezer.push(it); }
  }
  for (let i = freezer.length; i < 2 + (n > 4); i++) freezer.push(mkItem({ id: pick(Object.keys(FOOD)), ice: 3 }));
  freezer.forEach((it, i) => { it.x = FR.x + 2 + i * 18 + rnd(3); it.y = SHELVES[0] - 18; it.layer = 1; });
  shuffle(shelfList).forEach((it, k) => {
    const s = 1 + (k % 3);
    it.layer = it.kind === 'mouse' ? 1 : rnd(2);
    it.x = FR.x + rnd(FR.w - 16) + (it.layer ? 0 : 1);
    it.y = SHELVES[s] - 16 - rnd(18) - Math.floor(k / 3) * 4;
  });
  ITEMS = [...freezer, ...shelfList];
  for (let i = 0; i < 300; i++) settle(0.03);
}

// если продуктов на заказ больше не хватает — кот приносит недостающие
function restock() {
  const have = {};
  for (const it of ITEMS) if (it.kind === 'food' && !it.spoiled) have[it.id] = (have[it.id] || 0) + 1;
  let added = 0;
  for (const [id, q] of Object.entries(S.order.need))
    for (let i = have[id] || 0; i < q; i++) {
      ITEMS.push(mkItem({ id, place: 'fridge', layer: 1, x: FR.x + rnd(FR.w - 16), y: SHELVES[0] + 4 })); added++;
    }
  if (added) catSay('Сбегал в магазин! Свежие продукты — в холодильнике.');
}

// ---------- Смена ----------
function startShift(mode) {
  S = { mode, n: 0, coins: 0, hearts: 3, served: 0, lastGuest: null };
  screen = 'game';
  nextOrder();
}
function nextOrder() {
  S.n++;
  S.order = makeOrder(S.n);
  stock(S.order, S.n);
  Object.assign(S, { left: S.order.time, fridgeOpen: false, fire: false, prog: 0, stirs: 0, stirAcc: 0, burnt: false,
    busy: false, mood: 'calm', catMood: 'calm', gx: -40, leaving: false, catTalk: null, msg: null, chopAnim: 0 });
  flash('Новый гость: ' + S.order.guest.name, 2.5);
}
function guestMood() {
  if (S.mode !== 'timed') return S.mood;
  if (S.mood === 'happy' || S.mood === 'angry') return S.mood;
  const k = S.left / S.order.time;
  return k > .5 ? 'calm' : k > .25 ? 'worried' : 'angry';
}
function catSay(text, t = 2.6) { S.catTalk = { text, until: now + t }; }
function flash(text, t = 2.2) { S.msg = { text, until: now + t }; }

// ---------- Проверка блюда ----------
function analyze() {
  const d = dishOf(), o = S.order, pi = potItems();
  const r = { missing: {}, extra: {}, cut: [], spoiled: 0, junk: [], ban: false, empty: !pi.length,
    raw: d.vessel === 'pot' && S.prog < 1, burnt: S.burnt, stir: S.stirs < d.stir };
  const cnt = {};
  for (const it of pi) {
    if (it.kind !== 'food') { r.junk.push(JUNK[it.id] ? JUNK[it.id].name.toLowerCase() : 'мышка'); continue; }
    if (it.spoiled) { r.spoiled++; continue; }
    if (it.id === o.ban) { r.ban = true; continue; }
    if (o.need[it.id] && it.chopped !== d.chop && !r.cut.includes(it.id)) r.cut.push(it.id);
    cnt[it.id] = (cnt[it.id] || 0) + 1;
  }
  for (const [id, q] of Object.entries(o.need)) if ((cnt[id] || 0) < q) r.missing[id] = q - (cnt[id] || 0);
  for (const [id, q] of Object.entries(cnt)) if (q > (o.need[id] || 0)) r.extra[id] = q - (o.need[id] || 0);
  r.ok = !r.empty && !Object.keys(r.missing).length && !Object.keys(r.extra).length && !r.cut.length &&
    !r.spoiled && !r.junk.length && !r.ban && !r.raw && !r.burnt && !r.stir;
  return r;
}
const listText = (obj) => Object.entries(obj).map(([id, q]) => `${FOOD[id].name} ×${q}`).join(', ');
function problems(r) {
  const d = dishOf(), L = [];
  if (r.empty) return ['Тут же пусто!'];
  if (r.ban) L.push(`Я же просил без «${FOOD[S.order.ban].name}»!`);
  if (r.junk.length) L.push(`Что тут делает ${r.junk[0]}?!`);
  if (r.spoiled) L.push('Фу! Тут испорченные продукты!');
  if (Object.keys(r.missing).length) L.push(`Не хватает: ${listText(r.missing)}.`);
  if (Object.keys(r.extra).length) L.push(`Лишнее: ${listText(r.extra)}.`);
  if (r.cut.length) L.push(d.chop ? `Надо было нарезать: ${r.cut.map(id => FOOD[id].name).join(', ')}.` : `Зачем резать? Я хотел целиком.`);
  if (r.burnt) L.push('Пригорело!');
  else if (r.raw) L.push('Сырое! Надо доварить.');
  if (r.stir && !r.burnt) L.push('Не перемешано!');
  return L;
}
function taste() {
  const r = analyze(), d = dishOf();
  sfx.click();
  let t;
  if (r.empty) t = 'Мяу? Тут пусто.';
  else if (r.junk.length || r.spoiled) t = 'Фу-у! Тут что-то не то!';
  else if (r.ban) t = 'Ой, этого гость не хотел!';
  else if (Object.keys(r.missing).length) t = 'Маловато: ' + FOOD[Object.keys(r.missing)[0]].name.toLowerCase();
  else if (Object.keys(r.extra).length) t = 'Лишнее: ' + FOOD[Object.keys(r.extra)[0]].name.toLowerCase();
  else if (r.cut.length) t = d.chop ? 'Надо порезать: ' + FOOD[r.cut[0]].name.toLowerCase() : 'Резать не надо было!';
  else if (r.burnt) t = 'Кха-кха! Горелое!';
  else if (r.raw) t = 'Хрустит… Ещё сырое.';
  else if (r.stir) t = 'Надо помешать!';
  else t = 'Мр-р-р! Вкуснотища!';
  S.catMood = r.ok ? 'happy' : 'worried';
  catSay(t);
}

function serve() {
  if (S.busy || toast) return;
  const r = analyze();
  if (r.empty) { flash('Сначала положи продукты'); return; }
  if (r.ok) return winOrder();
  if (S.mode === 'calm') {
    sfx.fail(); S.mood = 'worried'; S.catMood = 'worried';
    showToast('bad', 'Не совсем то…', problems(r).join('\n') + '\nИсправь и подай ещё раз!', 3.5);
  } else failOrder('Не то блюдо!', problems(r).join('\n'));
}
function winOrder() {
  S.busy = true;
  const types = Object.keys(S.order.need).length;
  const bonus = S.mode === 'timed' ? Math.ceil(S.left / 3) : 0;
  const gain = 10 + types * 3 + bonus;
  const oldRank = rankOf(S.served);
  S.coins += gain; S.served++;
  S.mood = 'happy'; S.catMood = 'happy';
  sfx.win(); confetti();
  const newRank = rankOf(S.served);
  let text = `+${gain} монет` + (bonus ? ` (${bonus} — за скорость)` : '');
  if (newRank !== oldRank) text += `\nНовое звание: ${newRank}!`;
  showToast('good', pick(['Вкуснятина!', 'Объедение!', 'Мур-р-р!', 'Пальчики оближешь!']), text, newRank !== oldRank ? 3 : 2, leaveAndNext);
}
function failOrder(title, why) {
  S.busy = true; S.hearts--;
  S.mood = 'angry'; S.catMood = 'sad';
  sfx.fail(); shake = 0.3;
  showToast('bad', title, why, 3.5, () => { if (S.hearts <= 0) gameOver(); else leaveAndNext(); });
}
function leaveAndNext() { S.leaving = true; setTimeout(nextOrder, 450); }
function gameOver() {
  const best = store.get('catchef.best', 0);
  S.isBest = S.served > best && S.served > 0;
  if (S.isBest) store.set('catchef.best', S.served);
  screen = 'over'; held = null;
  if (S.isBest) confetti();
}
function showToast(kind, title, text, t, then) { toast = { kind, title, text, until: now + t, then, t0: now }; }
function closeToast() { if (!toast) return; const f = toast.then; toast = null; if (f) f(); }

// ---------- Действия на кухне ----------
function toPot(it) {
  const d = dishOf();
  if (it.ice) { flash('Лёд в ' + (d.vessel === 'pot' ? 'кастрюлю нельзя' : 'миску нельзя') + '! Разбей его: нажимай на него'); return false; }
  if (potItems().length >= 14) { flash('Больше не помещается!'); return false; }
  it.place = 'pot'; it.ang = Math.random() * Math.PI * 2; it.rad = 2 + rnd(19); it.z = ++zc;
  sfx.plop();
  const col = d.vessel === 'pot' ? mix(WATER, d.liquid, Math.min(1, S.prog)) : '#ffffff';
  for (let i = 0; i < 6; i++) P.push({ x: POT.cx - 8 + rnd(16), y: POT.sy, vx: rnd(41) - 20, vy: -40 - rnd(40), life: .5, col, g: 200 });
  return true;
}
function trash(it) {
  it.place = 'gone'; ITEMS = ITEMS.filter(i => i !== it);
  sfx.trash(); S.binT = now;
  if (it.kind === 'junk' || it.spoiled) { S.coins += 1; flash('Чистота! +1 монета'); }
  restock();
}
function drop(it, p) {
  it.z = ++zc;
  if (inR(p, POT_ZONE) && toPot(it)) return;
  if (inR(p, BIN)) return trash(it);
  if (inR(p, BOARD_ZONE) && !boardItem()) {
    it.place = 'board'; sfx.drop();
    return;
  }
  const s = itemSpr(it);
  if (S.fridgeOpen && p.x >= FR.x - 2 && p.x < FR.x + FR.w + 2 && p.y >= FR.y && p.y < SHELVES[3]) {
    it.place = 'fridge'; it.layer = 1;
    it.x = Math.max(FR.x - s.bb.x1, Math.min(FR.x + FR.w - s.bb.x2, it.x));
    // не даём «провалиться» сквозь полку: ставим на ближайшую полку ниже точки отпускания
    const b = bbw(it); const sh = SHELVES.find(y => y >= p.y) || SHELVES[3];
    if (b.b > sh) it.y = sh - s.bb.y2;
    return;
  }
  if (p.x >= 72) { it.place = 'counter'; it.layer = 1; it.x = Math.max(72 - s.bb.x1, Math.min(W - s.bb.x2, it.x)); if (bbw(it).b > COUNTER_Y) it.y = COUNTER_Y - s.bb.y2; }
  else { it.place = 'floor'; it.layer = 1; it.x = Math.max(-s.bb.x1, Math.min(70 - s.bb.x2, it.x)); if (bbw(it).b > FLOOR_Y) it.y = FLOOR_Y - s.bb.y2; }
}
function tapItem(it) {
  if (it.kind === 'mouse') {
    if (!it.run) { it.run = true; sfx.squeak(); catSay('Ой! Мышка!'); S.catMood = 'worried'; }
    return;
  }
  if (it.ice) {
    it.ice--; sfx.crack();
    const b = bbw(it);
    for (let i = 0; i < 5; i++) P.push({ x: b.l + rnd(16), y: b.t + rnd(10), vx: rnd(61) - 30, vy: -50 - rnd(30), life: .5, col: pick([C.ice, C.iceD, '#ffffff']), g: 300 });
    if (!it.ice) { sfx.shatter(); flash('Лёд разбит!'); }
    return;
  }
  if (it.place === 'board') {
    if (it.kind !== 'food') { catSay('Это не режется!'); return; }
    if (it.chopped) { flash('Уже нарезано. Неси в ' + (dishOf().vessel === 'pot' ? 'кастрюлю' : 'миску')); return; }
    it.chop++; S.chopAnim = now; sfx.chop();
    const b = bbw(it);
    for (let i = 0; i < 4; i++) P.push({ x: b.l + rnd(b.r - b.l), y: b.t + 4, vx: rnd(61) - 30, vy: -40 - rnd(40), life: .4, col: PAL[INNER[it.id]] || '#fff', g: 300 });
    if (it.chop >= 3) { it.chopped = true; it.chop = 0; }
    return;
  }
  // лёгкий прыжок — просто показать, что это
  it.vy = -60; it.y -= 1; flash(itemName(it), 1.4);
}
function takeOut(it) {
  // кот достаёт продукт из кастрюли и кладёт на стол
  it.place = 'counter'; it.layer = 1; it.z = ++zc; it.vy = -80;
  const s = itemSpr(it); it.x = 118 + rnd(40) - s.bb.x1; it.y = POT.y - 10 - s.bb.y2;
  sfx.pick(); flash('Кот достал: ' + itemName(it), 1.6);
}
function toggleFire() {
  const d = dishOf();
  if (d.vessel !== 'pot') { catSay('Салат не варят! Режь и мешай в миске.'); return; }
  S.fire = !S.fire; sfx.click();
  if (S.fire) tone(90, .3, 'sawtooth', 0, .03);
}
function pour() {
  if (S.busy || toast) return;
  const pi = potItems();
  if (!pi.length && !S.prog) return;
  sfx.pour();
  ITEMS = ITEMS.filter(i => i.place !== 'pot');
  S.prog = 0; S.stirs = 0; S.stirAcc = 0; S.burnt = false;
  restock();
}

// ---------- Ввод ----------
const ptr = { down: false, x: 0, y: 0, sx: 0, sy: 0, moved: false, item: null, btn: null, stir: false, ang: 0, offx: 0, offy: 0 };
function toLogical(e) {
  const r = view.getBoundingClientRect();
  return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
}
function hitItem(p) {
  const list = drawOrder().reverse();
  for (const pass of [0, 1]) for (const it of list) {
    const s = itemSpr(it), ix = Math.floor(p.x - rd(it.x)), iy = Math.floor(p.y - rd(it.y));
    if (pass === 0 ? s.solid(ix, iy) : (ix >= s.bb.x1 - 2 && ix < s.bb.x2 + 2 && iy >= s.bb.y1 - 2 && iy < s.bb.y2 + 2)) return it;
  }
  return null;
}
view.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  try { view.setPointerCapture(e.pointerId); } catch {}
  if (actx && actx.state === 'suspended') actx.resume();
  const p = toLogical(e);
  Object.assign(ptr, { down: true, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false, item: null, btn: null, stir: false, potItem: null });
  if (toast) { if (now - toast.t0 > .3) closeToast(); return; }
  const b = BTNS.find(b => inR(p, b));
  if (b) { ptr.btn = b; return; }
  if (screen !== 'game' || S.busy) return;
  const it = hitItem(p);
  if (it && it.place === 'pot') { ptr.potItem = it; ptr.stir = true; ptr.ang = Math.atan2((p.y - POT.sy) * 3, p.x - POT.cx); return; }
  if (it) { ptr.item = it; ptr.offx = p.x - it.x; ptr.offy = p.y - it.y; return; }
  if (inR(p, KNOB)) return toggleFire();
  if (inR(p, CAT_ZONE)) return taste();
  if (inR(p, POT_ZONE)) { ptr.stir = true; ptr.ang = Math.atan2((p.y - POT.sy) * 3, p.x - POT.cx); return; }
  if (!S.fridgeOpen && inR(p, FRIDGE)) { S.fridgeOpen = true; sfx.door(); return; }
  if (S.fridgeOpen && p.x < FR.x && p.y > FRIDGE.y && p.y < FRIDGE.y + FRIDGE.h) { S.fridgeOpen = false; sfx.door(); return; }
});
view.addEventListener('pointermove', (e) => {
  if (!ptr.down) return;
  const p = toLogical(e);
  ptr.x = p.x; ptr.y = p.y;
  if (Math.hypot(p.x - ptr.sx, p.y - ptr.sy) > 3) ptr.moved = true;
  if (ptr.item && ptr.moved && !held && ptr.item.kind !== 'mouse') {
    held = ptr.item; held.prev = held.place; held.place = 'hand'; held.vy = 0; sfx.pick();
  }
  if (held) {
    const s = itemSpr(held);
    held.x = p.x - (s.bb.x1 + s.bb.x2) / 2; held.y = p.y - s.bb.y2 - 3; // над пальцем, чтобы было видно
  }
  if (ptr.stir) {
    const a = Math.atan2((p.y - POT.sy) * 3, p.x - POT.cx);
    let da = a - ptr.ang; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2;
    ptr.ang = a;
    if (!potItems().length) return;
    S.stirAcc += Math.abs(da);
    for (const it of potItems()) it.ang += da;
    S.stirring = now;
    if (S.stirAcc >= Math.PI * 2) {
      S.stirAcc -= Math.PI * 2; S.stirs++; sfx.stir();
      if (S.stirs === dishOf().stir) flash('Перемешано!');
    }
  }
});
function up(e) {
  if (!ptr.down) return;
  ptr.down = false;
  const p = e ? toLogical(e) : { x: ptr.x, y: ptr.y };
  if (ptr.btn) { const b = ptr.btn; ptr.btn = null; if (inR(p, b)) { sfx.click(); b.on(); } return; }
  if (held) { const it = held; held = null; drop(it, p); return; }
  if (ptr.item && !ptr.moved) tapItem(ptr.item);
  if (ptr.potItem && !ptr.moved) takeOut(ptr.potItem);
  else if (ptr.stir && !ptr.moved && potItems().length) flash('Чтобы помешать, води пальцем по кругу');
  ptr.item = null; ptr.stir = false;
}
view.addEventListener('pointerup', up);
view.addEventListener('pointercancel', () => up(null));

// ---------- Частицы и эффекты ----------
let shake = 0;
function confetti() {
  for (let i = 0; i < 60; i++) P.push({ x: rnd(W), y: -rnd(60), vx: rnd(21) - 10, vy: 30 + rnd(50), life: 3, col: pick([C.red, C.yellow, C.green, C.blue, '#c86bd6', C.orange]), g: 20, sq: 1 });
}
function updParticles(dt) {
  for (const p of P) { p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  P = P.filter(p => p.life > 0 && p.y < H + 4);
}

// ---------- Обновление ----------
function update(dt) {
  now += dt;
  updParticles(dt);
  if (shake > 0) shake -= dt;
  if (screen !== 'game') return;
  settle(dt);
  if (S.gx < 0 && !S.leaving) S.gx = Math.min(0, S.gx + 140 * dt);
  if (S.leaving) S.gx += 140 * dt;
  for (const it of ITEMS) if (it.run) { it.x -= 110 * dt; it.y += Math.sin(now * 40) * .3; }
  ITEMS = ITEMS.filter(it => !(it.run && it.x < -24));
  if (toast) { if (now > toast.until) closeToast(); return; }
  if (S.busy) return;
  const d = dishOf(), pi = potItems();
  if (d.vessel === 'pot' && S.fire && pi.length) {
    S.prog += dt / 7;
    if (S.prog >= 1.8 && !S.burnt) { S.burnt = true; sfx.fail(); catSay('Ой-ой! Пригорело!'); S.catMood = 'sad'; }
    if (Math.random() < dt * (S.burnt ? 14 : 6)) P.push({ x: POT.cx - 18 + rnd(36), y: POT.sy - 2, vx: rnd(11) - 5, vy: -14 - rnd(10), life: 1.4, col: S.burnt ? '#5a4a5a' : '#ffffff', g: -4 });
  }
  if (S.mode === 'timed') {
    const before = S.left;
    S.left -= dt;
    if (S.left / S.order.time < .25 && Math.floor(before) !== Math.floor(S.left)) sfx.tick();
    if (S.left <= 0) failOrder('Гость ушёл голодным!', 'Не успели приготовить вовремя.');
  }
}

// ---------- Фон (рисуется один раз) ----------
const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
function drawWall(x0, y0, w, h) {
  R(x0, y0, w, h, C.wallA);
  for (let y = y0; y < y0 + h; y += 12) R(x0, y, w, 1, C.wallLine);
  for (let y = y0, r = 0; y < y0 + h; y += 12, r++) for (let x = x0 + (r & 1) * 6; x < x0 + w; x += 12) { R(x, y + 1, 1, 11, C.wallLine); R(x + 1, y + 1, 10, 1, '#fbe8c4'); }
}
(function paintBg() {
  // рисуем в общий буфер (он пока пустой) и копируем в отдельный холст фона
  // стена
  drawWall(0, 16, W, 250);
  // окно
  box(122, 84, 48, 40, C.sky, C.woodD); R(123, 85, 46, 1, '#c8f0ff');
  R(145, 85, 2, 38, C.woodD); R(123, 103, 46, 2, C.woodD);
  R(126, 94, 10, 3, '#ffffff'); R(128, 92, 6, 2, '#ffffff'); R(150, 110, 12, 3, '#ffffff'); R(152, 108, 7, 2, '#ffffff');
  R(150, 88, 6, 6, C.yellow); R(151, 87, 4, 1, C.yellow); R(151, 94, 4, 1, C.yellow);
  R(120, 124, 52, 3, C.wood); R(120, 127, 52, 1, C.woodD);
  // полочка с баночками
  R(76, 132, 40, 3, C.wood); R(76, 135, 40, 1, C.woodD);
  [[78, C.red], [88, C.yellow], [98, C.green], [107, C.blue]].forEach(([x, col], i) => {
    box(x, 120 - (i % 2) * 2, 8, 12 + (i % 2) * 2, col); R(x + 1, 120 - (i % 2) * 2, 6, 3, C.cream); R(x + 2, 125, 1, 4, '#ffffff');
  });
  // часы
  box(84, 86, 16, 16, C.paper); R(92, 89, 1, 6, C.ink); R(92, 94, 4, 1, C.ink); R(91, 87, 2, 1, C.red);
  // половник на крючке
  R(110, 90, 1, 2, C.steelDD); R(110, 92, 1, 16, C.steelD); box(106, 106, 9, 6, C.steel);
  // пол
  R(0, 258, 72, 8, C.floor); for (let x = 0; x < 72; x += 8) R(x, 258, 1, 8, C.floorD); R(0, 258, 72, 1, C.floorD);
  bg.getContext('2d').drawImage(buf, 0, 0);
})();

// столешница и тумбы — рисуются поверх кота
function drawCounter() {
  // тумбы
  R(72, 220, 104, 46, C.wood);
  R(72, 220, 104, 1, C.woodD);
  // духовка под плитой
  box(112, 222, 62, 44, C.steel, C.ink); R(113, 223, 60, 12, C.steelD);
  box(118, 240, 50, 22, '#3a3050'); R(120, 242, 46, 2, '#5a5070'); R(122, 254, 42, 6, S && S.fire ? '#7a3a2a' : '#2a2238');
  R(132, 237, 22, 2, C.steelDD);
  // ящик над мусоркой
  box(100, 222, 12, 44, C.wood, C.woodD); R(104, 230, 4, 2, C.woodDD);
  R(72, 264, 104, 2, C.woodDD);
  // столешница
  R(70, 214, 106, 6, C.woodL); R(70, 214, 106, 1, '#f8dcae'); R(70, 219, 106, 1, C.woodD); R(70, 220, 106, 1, C.woodDD);
  // конфорка
  R(118, 208, 52, 2, C.ink); R(120, 210, 48, 4, '#3a3050'); R(122, 210, 44, 1, '#5a5070');
}
function knobSpr(on) {
  return cache('knob' + on, () => {
    const gr = grid(12, 12);
    ell(gr, 6, 6, 6, 6, on ? 'r' : 'w'); ell(gr, 6, 6, 3.6, 3.6, on ? 'R' : 'c');
    if (on) rc(gr, 5, 0, 2, 6, 'w'); else rc(gr, 0, 5, 6, 2, 'k');
    return toCanvas(sprite(gr));
  });
}
function drawKnob() {
  blit(knobSpr(S.fire), KNOB.x, KNOB.y);
  blit(ICONS.fire, KNOB.x + 16, KNOB.y + 2);
}
function drawBin() {
  const x = BIN.x, y = BIN.y, open = now - (S.binT || -9) < .4 || (held && inR({ x: ptr.x, y: ptr.y }, BIN));
  box(x, y + 4, 22, 30, C.steelD); R(x + 1, y + 5, 20, 2, C.steel);
  for (let i = 0; i < 4; i++) R(x + 4 + i * 4, y + 10, 1, 20, C.steelDD);
  if (open) { box(x - 2, y - 4, 24, 5, C.steel); R(x + 8, y - 6, 6, 2, C.steelDD); }
  else { box(x - 1, y + 1, 24, 5, C.steel); R(x + 8, y - 1, 6, 2, C.steelDD); }
}
function drawFridge() {
  const f = FRIDGE;
  if (!S.fridgeOpen) {
    box(f.x, f.y, f.w, f.h, C.fridge);
    R(f.x + 1, f.y + 1, 2, f.h - 2, '#ffffff'); R(f.x + f.w - 4, f.y + 1, 3, f.h - 2, C.fridgeD);
    R(f.x + 1, 106, f.w - 2, 1, C.ink); R(f.x + 1, 107, f.w - 2, 1, C.fridgeD);
    box(f.x + f.w - 10, 86, 4, 16, C.steelD); box(f.x + f.w - 10, 114, 4, 34, C.steelD);
    // магнитики и записка
    box(14, 120, 22, 26, C.paper); for (let i = 0; i < 4; i++) R(17, 126 + i * 5, 16, 1, C.steelD); R(23, 118, 6, 4, C.red);
    box(40, 160, 8, 8, C.yellow); R(42, 162, 4, 4, C.orange);
    box(16, 176, 10, 7, C.green); R(18, 178, 6, 3, C.greenD);
    blit(foodSpr('strawberry'), 34, 184);
    R(f.x + 2, f.y + f.h - 6, f.w - 4, 4, C.fridgeD);
    if (S.n <= 2 && Math.floor(now * 2) % 2) T('▶', 40, 238, C.red);
    return;
  }
  // открытый: внутренность
  box(f.x, f.y, f.w, f.h, C.fridgeIn);
  R(FR.x, FR.y, FR.w, SHELVES[0] - FR.y, C.ice);
  for (let i = 0; i < 9; i++) R(FR.x + 3 + i * 6, FR.y + 2 + (i % 3) * 3, 1, 1, '#ffffff');
  R(FR.x + FR.w - 8, FR.y + 1, 6, 2, C.yellow); dither(FR.x + 30, FR.y + 3, 26, 3, '#fff7c0', 0);
  R(f.x + f.w - 3, f.y + 1, 2, f.h - 2, C.fridgeD);
}
function drawFridgeFront() {
  if (!S.fridgeOpen) return;
  for (const y of SHELVES) { R(FR.x, y, FR.w, 1, C.ink); R(FR.x, y + 1, FR.w, 2, C.glass); R(FR.x, y + 3, FR.w, 1, '#8ab8d0'); }
  // открытая дверца (узкая, в перспективе) с бутылками
  box(0, 76, 8, 184, C.fridge); R(1, 77, 2, 182, '#ffffff');
  R(1, 130, 6, 1, C.fridgeD); R(1, 190, 6, 1, C.fridgeD);
  box(2, 112, 5, 18, C.green); R(3, 110, 3, 3, C.greenD);
  box(2, 172, 5, 18, '#ffffff'); R(3, 170, 3, 3, C.blue);
  box(2, 232, 5, 16, C.orange);
}

// ---------- Порядок отрисовки предметов ----------
function drawOrder() {
  const L = [];
  const by = (a, b) => a.z - b.z;
  if (S.fridgeOpen) {
    L.push(...ITEMS.filter(i => i.place === 'fridge' && i.layer === 0).sort(by));
    L.push(...ITEMS.filter(i => i.place === 'fridge' && i.layer === 1).sort(by));
  }
  L.push(...ITEMS.filter(i => i.place === 'floor' || i.place === 'counter').sort(by));
  const bi = boardItem(); if (bi) L.push(bi);
  L.push(...potItems().sort((a, b) => Math.sin(a.ang) - Math.sin(b.ang)));
  return L;
}
function placePotItems() {
  const boil = S.fire && S.prog > .2 ? 1 : 0;
  for (const it of potItems()) {
    const s = itemSpr(it);
    it.x = rd(POT.cx + Math.cos(it.ang) * it.rad - (s.bb.x1 + s.bb.x2) / 2);
    it.y = rd(POT.sy + 9 + Math.sin(it.ang) * 3 - s.bb.y2 + (boil ? Math.round(Math.sin(now * 8 + it.uid)) : 0));
  }
  const bi = boardItem();
  if (bi) { const s = itemSpr(bi); bi.x = rd(BOARD.cx - (s.bb.x1 + s.bb.x2) / 2); bi.y = BOARD.y - s.bb.y2; }
}
function drawItem(it) {
  const s = itemSpr(it);
  blit(s, it.x, it.y, it.run);
  if (it.ice) {
    const b = bbw(it), x = rd(b.l) - 2, y = rd(b.t) - 2, w = b.r - b.l + 4, h = b.b - b.t + 3;
    c.globalAlpha = .5; R(x + 1, y + 1, w - 2, h - 2, C.ice); c.globalAlpha = 1;
    R(x + w - 4, y + h - 4, 1, 1, '#ffffff'); R(x + 3, y + h - 3, 2, 1, '#ffffff');
    box(x, y, w, h, null, C.iceD); R(x + 2, y + 1, 4, 1, '#ffffff'); R(x + 1, y + 2, 1, 3, '#ffffff');
    if (it.ice <= 2) { R(x + 5, y + 3, 1, 3, C.blueD); R(x + 6, y + 6, 1, 2, C.blueD); R(x + 7, y + 7, 2, 1, C.blueD); }
    if (it.ice <= 1) { R(x + w - 5, y + 2, 1, 4, C.blueD); R(x + w - 6, y + 6, 1, 3, C.blueD); R(x + 3, y + h - 4, 4, 1, C.blueD); }
  }
  if (it.spoiled && !it.ice) {
    const b = bbw(it), t = now * 6 + it.ph;
    R(b.l + 6 + Math.round(Math.cos(t) * 6), b.t - 3 + Math.round(Math.sin(t * 1.7) * 2), 1, 1, C.ink);
    R(b.l + 8 + Math.round(Math.sin(t * 1.3) * 5), b.t - 5 + Math.round(Math.cos(t) * 2), 1, 1, C.ink);
  }
  if (it.kind === 'mouse' && !it.run && Math.floor(now * 1.5 + it.ph) % 2) T('z', it.x + 12, it.y - 9, C.blueD);
}

// ---------- Интерфейс ----------
function button(b) {
  BTNS.push(b);
  const p = ptr.btn === b && ptr.down ? 1 : 0;
  box(b.x, b.y + 2, b.w, b.h, b.dark);
  box(b.x, b.y + p, b.w, b.h, b.col);
  R(b.x + 2, b.y + p + 1, b.w - 4, 1, b.light || '#ffffff');
  const cx = b.x + b.w / 2;
  if (b.sub) {
    TB(b.label, cx, b.y + p + 3, b.txt || C.ink, { align: 'center' });
    T(b.sub, cx, b.y + p + 4 + FONT_BIG.h, b.txt || C.ink, { align: 'center' });
  } else if (b.big) TB(b.label, cx, b.y + p + Math.floor((b.h - FONT_BIG.h) / 2), b.txt || C.ink, { align: 'center' });
  else T(b.label, cx, b.y + p + Math.floor((b.h - FONT.h) / 2) + 1, b.txt || C.ink, { align: 'center' });
}
function topBar() {
  R(0, 0, W, 16, C.darker); R(0, 15, W, 1, C.ink);
  button({ x: 2, y: 1, w: 34, h: 12, label: '◀ Меню', col: C.cream, dark: C.woodD, on: toMenu });
  T(`Заказ №${S.n}`, 70, 3, C.cream, { align: 'center' });
  blit(ICONS.coin, 112, 2); T(String(S.coins), 126, 3, C.yellow);
  button({ x: 158, y: 1, w: 16, h: 12, label: '', col: C.cream, dark: C.woodD, on: () => { soundOn = !soundOn; store.set('catchef.sound', soundOn); } });
  blit(speakerSpr(soundOn), 160, 2 + (ptr.btn && ptr.btn.x === 158 && ptr.down ? 1 : 0));
}
function guestPanel() {
  const o = S.order, d = dishOf(), gs = o.guest, mood = guestMood();
  // окошко гостя
  box(2, 18, 40, 36, C.sky, C.woodD); R(3, 44, 38, 9, '#8fd07a'); R(3, 44, 38, 1, '#6cb85a');
  c.save(); c.beginPath(); c.rect(3, 19, 38, 34); c.clip();
  blit(guestSpr(gs, mood), 5 + rd(S.gx), 22 + (mood === 'happy' ? Math.round(Math.abs(Math.sin(now * 8))) * -1 : 0));
  c.restore();
  if (S.mode === 'timed') {
    for (let i = 0; i < 3; i++) blit(i < S.hearts ? ICONS.heart : ICONS.heart0, 3 + i * 13, 56);
    const k = Math.max(0, S.left / o.time), n = Math.ceil(k * 9);
    box(2, 67, 40, 7, C.ink);
    const col = k > .5 ? C.green : k > .25 ? C.yellow : C.red;
    for (let i = 0; i < 9; i++) R(4 + i * 4, 69, 3, 3, i < n ? col : C.dark);
  } else T('Без спешки', 22, 60, C.muted, { align: 'center' });
  // пузырь с заказом
  const bx = 46, by = 18, bw = 128, bh = 56;
  box(bx, by, bw, bh, C.paper);
  R(bx - 3, by + 14, 3, 1, C.ink); R(bx - 4, by + 15, 1, 1, C.ink); R(bx - 3, by + 16, 4, 1, C.ink); R(bx - 3, by + 15, 4, 1, C.paper);
  T(sayOf(o.dish), bx + 4, by + 4, C.ink);
  // список продуктов
  const cnt = {};
  for (const it of potItems()) if (it.kind === 'food' && !it.spoiled) cnt[it.id] = (cnt[it.id] || 0) + 1;
  let x = bx + 4, y = by + 18;
  const place = (w) => { if (x + w > bx + bw - 3) { x = bx + 4; y += 17; } const r = [x, y]; x += w + 4; return r; };
  for (const [id, q] of Object.entries(o.need)) {
    const label = '×' + q, w = 17 + textWidth(label);
    const [ex, ey] = place(w);
    const have = cnt[id] || 0;
    if (have === q) R(ex - 1, ey - 1, w + 2, 18, C.greenL); else if (have > q) R(ex - 1, ey - 1, w + 2, 18, C.pinkL);
    blit(foodSpr(id, d.chop), ex, ey);
    T(label, ex + 17, ey + 4, C.ink);
  }
  if (o.ban) {
    const w = textWidth('без') + 21, [ex, ey] = place(w);
    if (cnt[o.ban]) R(ex - 1, ey - 1, w + 2, 18, C.pinkL);
    T('без', ex, ey + 4, C.red); blit(foodSpr(o.ban), ex + w - 17, ey); blit(ICONS.ban, ex + w - 19, ey - 2);
  }
  // способ приготовления
  const steps = [];
  if (d.chop) steps.push([ICONS.knife, '']);
  if (d.vessel === 'pot') steps.push([ICONS.fire, '']);
  steps.push([ICONS.spoon, '×' + d.stir]);
  const sw = steps.reduce((a, [, t]) => a + 12 + (t ? textWidth(t) + 1 : 0), 0) + 2;
  let sx, sy;
  if (textWidth(sayOf(o.dish)) + sw + 12 < bw) { sx = bx + bw - 4 - sw; sy = by + 2; } else { [sx, sy] = place(sw); sy += 2; }
  R(sx - 2, sy, sw + 3, 12, C.cream);
  for (const [ic, t] of steps) { blit(ic, sx, sy + 1); sx += 12; if (t) { T(t, sx, sy + 2, S.stirs >= d.stir ? C.greenD : C.ink); sx += textWidth(t) + 1; } }
}
function meter() {
  const d = dishOf();
  if (d.vessel !== 'pot') return;
  const x = 122, y = 154, w = 44;
  box(x, y, w, 7, C.ink);
  const zone = (a, b, col) => R(x + 1 + Math.floor(a * (w - 2) / 2), y + 1, Math.ceil((b - a) * (w - 2) / 2), 5, col);
  zone(0, 1, C.dark); zone(1, 1.8, '#2f5a2f'); zone(1.8, 2, '#5a2030');
  const p = Math.min(2, S.prog);
  zone(0, Math.min(p, 1), C.yellowD);
  if (p > 1) zone(1, Math.min(p, 1.8), C.green);
  if (p > 1.8) zone(1.8, p, C.red);
  const mx = x + 1 + Math.floor(p * (w - 2) / 2);
  R(mx, y - 2, 1, 11, C.paper);
}
function hintText() {
  if (S.msg && now < S.msg.until) return S.msg.text;
  if (held) return itemName(held);
  const d = dishOf(), pi = potItems(), bi = boardItem(), v = d.vessel === 'pot' ? 'кастрюлю' : 'миску';
  if (S.burnt) return 'Пригорело! Вылей и свари заново';
  if (bi && bi.kind === 'food' && !bi.chopped && !bi.ice && d.chop) return 'Нажимай на продукт на доске — кот режет';
  if (bi && bi.chopped && d.chop) return 'Нарезано! Тащи кусочки в ' + v;
  if (!pi.length) {
    if (!S.fridgeOpen) return 'Открой холодильник: нажми на него';
    return d.chop ? 'Тащи продукт на доску, чтобы нарезать' : 'Перетащи нужные продукты в ' + v;
  }
  if (d.vessel === 'pot' && !S.fire) return 'Включи огонь: нажми на ручку плиты';
  if (S.stirs < d.stir) return 'Помешай: води пальцем по кругу в ' + (d.vessel === 'pot' ? 'кастрюле' : 'миске');
  if (d.vessel === 'pot' && S.prog < 1) return 'Варится… Стрелка должна дойти до зелёного';
  if (d.vessel === 'pot' && S.prog > 1.45) return 'Скорее подавай, а то пригорит!';
  return 'Готово? Жми «Подать!» Нажми на кота — он попробует';
}
function bottomBar() {
  R(0, 266, W, 54, C.darker); R(0, 266, W, 1, C.ink);
  TBox(hintText(), W / 2, 269, W - 10, C.cream, { align: 'center' });
  button({ x: 3, y: 291, w: 58, h: 24, label: 'Вылить', col: C.cream, dark: C.woodD, on: pour, big: true });
  button({ x: 65, y: 291, w: 108, h: 24, label: 'Подать!', col: C.green, dark: C.greenD, light: '#a8f080', txt: C.ink, on: serve, big: true });
}
function catBubble() {
  if (!S.catTalk || now > S.catTalk.until) return;
  const lines = wrapText(S.catTalk.text, 92), h = lines.length * (FONT.h + 1) + 5;
  const x = 74, y = 178 - h;
  box(x, y, 100, h, C.paper);
  R(x + 14, y + h - 1, 4, 1, C.paper); R(x + 14, y + h, 3, 1, C.ink); R(x + 17, y + h, 1, 1, C.ink); R(x + 15, y + h, 2, 1, C.paper); R(x + 15, y + h + 1, 1, 1, C.ink);
  lines.forEach((l, i) => T(l, x + 4, y + 3 + i * (FONT.h + 1), C.ink));
}
function drawToast() {
  if (!toast) return;
  c.globalAlpha = .6; R(0, 0, W, H, C.darker); c.globalAlpha = 1;
  const lines = toast.text ? wrapText(toast.text, 136) : [];
  const h = 14 + FONT_BIG.h + lines.length * (FONT.h + 2) + 10;
  const x = 12, y = Math.max(20, 140 - h / 2), w = W - 24;
  box(x - 2, y - 2, w + 4, h + 4, C.paper, C.ink);
  box(x, y, w, h, C.dlg, C.paper);
  R(x + 1, y + 1, w - 2, 1, '#4a5ac0');
  TB(toast.title, x + w / 2, y + 7, toast.kind === 'good' ? C.yellow : '#ff8a8a', { align: 'center', shadow: C.dlgD });
  lines.forEach((l, i) => T(l, x + w / 2, y + 12 + FONT_BIG.h + i * (FONT.h + 2), C.paper, { align: 'center' }));
  if (Math.floor(now * 3) % 2) T('▼', x + w - 10, y + h - 10, C.paper);
}
function drawParticles() {
  for (const p of P) R(rd(p.x), rd(p.y), p.sq ? 2 : 1, p.sq ? 2 : 1, p.col);
}

// ---------- Экраны ----------
function drawGame() {
  c.drawImage(bg, 0, 0);
  placePotItems();
  const d = dishOf();
  drawFridge();
  if (S.fridgeOpen) for (const it of drawOrder()) if (it.place === 'fridge') drawItem(it);
  drawFridgeFront();
  // кот за столом
  const cm = (now - (S.stirring || -9) < .3) ? 'cook' : S.catMood;
  const bob = Math.floor(now * 2) % 2;
  blit(catSpr(cm === 'cook' ? 'cook' : cm), CAT.x, CAT.y + bob);
  drawCounter();
  drawBin();
  drawKnob();
  // доска
  box(BOARD.x, BOARD.y, BOARD.w, 6, C.woodL, C.woodD); R(BOARD.x + 2, BOARD.y + 1, BOARD.w - 4, 1, '#f8dcae'); R(BOARD.x + BOARD.w - 6, BOARD.y + 2, 3, 2, C.woodD);
  const bi = boardItem(); if (bi) drawItem(bi);
  if (bi && now - S.chopAnim < .15) blit(ICONS.bigKnife, BOARD.cx - 6, BOARD.y - 12);
  else if (bi && bi.kind === 'food' && !bi.chopped && d.chop) blit(ICONS.bigKnife, BOARD.cx - 2, BOARD.y - 22);
  // огонь, кастрюля, продукты в ней
  const liquid = d.vessel === 'pot' ? (S.burnt ? '#4a3438' : mix(WATER, d.liquid, Math.min(1, Math.round(S.prog * 5) / 5))) : '#c9d6e3';
  const v = vesselSprites(d.vessel, liquid);
  blit(v.back, POT.x, POT.y);
  for (const it of potItems().sort((a, b) => Math.sin(a.ang) - Math.sin(b.ang))) drawItem(it);
  blit(v.front, POT.x, POT.y);
  if (d.vessel === 'pot' && S.fire) {
    for (let x = 120; x < 168; x += 3) {
      const h = 2 + ((Math.floor(now * 12) + x) % 3);
      R(x, 210 - h, 2, h, C.orange); R(x, 210 - Math.max(1, h - 2), 1, Math.max(1, h - 2), C.yellow);
    }
  }
  if (now - (S.stirring || -9) < .3) blit(SPOON, POT.cx - 22 + Math.round(Math.cos(ptr.ang) * 6), POT.y - 18 + Math.round(Math.sin(ptr.ang) * 2));
  meter();
  for (const it of drawOrder()) if (it.place === 'counter' || it.place === 'floor') drawItem(it);
  if (held) drawItem(held);
  drawParticles();
  catBubble();
  topBar(); guestPanel(); bottomBar();
  drawToast();
}
function drawMenu() {
  drawWall(0, 16, W, 254);
  R(0, 0, W, 16, C.darker);
  TB('Кот-повар', W / 2, 22, C.yellow, { align: 'center', outline: C.ink });
  // сценка: кот и гость
  box(14, 46, 148, 66, C.sky, C.woodD);
  R(15, 96, 146, 15, C.woodL); R(15, 96, 146, 1, C.woodD);
  blit(catSpr(Math.floor(now / 2) % 3 === 2 ? 'happy' : 'cook'), 40, 62 + Math.floor(now * 2) % 2);
  const g = GUESTS[Math.floor(now / 2.5) % GUESTS.length];
  blit(guestSpr(g, 'happy'), 104, 66);
  blit(foodSpr('carrot'), 22, 82); blit(foodSpr('tomato', true), 76, 84); blit(foodSpr('apple'), 140, 84);
  box(10, 118, 156, 64, C.paper);
  TBox('Гости заказывают блюда. Достань продукты из холодильника, нарежь, свари, помешай — и подай ровно то, что просили!', 15, 122, 146, C.ink, { align: 'left' });
  button({ x: 10, y: 190, w: 156, h: 32, label: 'На время', sub: 'Гость ждёт · 3 ошибки', col: C.orange, dark: C.redD, light: C.yellow, on: () => startShift('timed') });
  button({ x: 10, y: 230, w: 156, h: 32, label: 'Спокойно', sub: 'Без таймера и спешки', col: C.greenL, dark: C.greenD, on: () => startShift('calm') });
  const best = store.get('catchef.best', 0);
  R(0, 270, W, 50, C.darker);
  if (best) TBox(`Рекорд «На время»: ${best} · ${rankOf(best)}`, W / 2, 276, W - 12, C.cream, { align: 'center' });
  T('Кот-повар · пиксельная версия', W / 2, 304, C.muted, { align: 'center' });
}
function drawOver() {
  drawWall(0, 16, W, 254);
  R(0, 0, W, 16, C.darker);
  box(8, 24, 160, 236, C.dlg, C.paper);
  TB('Смена окончена!', W / 2, 34, C.yellow, { align: 'center', shadow: C.dlgD });
  blit(catSpr(S.served ? 'happy' : 'sad'), W / 2 - 16, 58 + Math.floor(now * 2) % 2);
  T('Накормлено гостей:', W / 2, 102, C.paper, { align: 'center' });
  TB(String(S.served), W / 2, 114, C.paper, { align: 'center' });
  blit(ICONS.coin, W / 2 - 22, 138); T('Монет: ' + S.coins, W / 2 - 8, 139, C.yellow);
  const rk = rankOf(S.served), rw = textWidth(rk) + 10;
  box(W / 2 - rw / 2, 156, rw, 15, C.yellow); T(rk, W / 2, 159, C.ink, { align: 'center' });
  if (S.isBest) T('Новый рекорд!', W / 2, 178, C.yellow, { align: 'center' });
  button({ x: 18, y: 196, w: 140, h: 24, label: 'Ещё смену', col: C.orange, dark: C.redD, light: C.yellow, big: true, on: () => startShift(S.mode) });
  button({ x: 18, y: 226, w: 140, h: 24, label: 'В меню', col: C.cream, dark: C.woodD, big: true, on: () => { screen = 'menu'; } });
}
function toMenu() {
  held = null; toast = null;
  if (S && S.mode === 'timed' && S.served) gameOver(); else screen = 'menu';
}

// ---------- Главный цикл ----------
let last = performance.now();
function frame(t) {
  const dt = Math.max(0, Math.min(0.05, (t - last) / 1000)); last = t;
  update(dt);
  BTNS = [];
  c.clearRect(0, 0, W, H);
  if (screen === 'menu') drawMenu(); else if (screen === 'game') drawGame(); else drawOver();
  if (screen !== 'game') drawParticles();
  out.imageSmoothingEnabled = false;
  const sx = shake > 0 ? (rnd(3) - 1) * K : 0;
  out.fillStyle = C.darker; out.fillRect(0, 0, view.width, view.height);
  out.drawImage(buf, sx, 0, W * K, H * K);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// для автоматических проверок
window.GAME = { get S() { return S; }, get ITEMS() { return ITEMS; }, get screen() { return screen; }, get toast() { return toast; }, analyze, W, H,
  step(dt) { update(dt); }, nextOrder, startShift, potItems, boardItem, bbw, hitItem };
