// Все рисунки игры «Кот-повар» — реалистичный вариант. Только векторная графика, нарисованная кодом (SVG).
// Общие градиенты, фильтры и маски лежат в одном скрытом <svg id="rz-defs"> — он вставляется в страницу один раз.
const ART = (() => {
  const f = (n) => Math.round(n * 100) / 100;
  const rand = (s) => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647; };

  // ---------- Помощники для градиентов ----------
  const st = (a) => a.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('');
  const LG = (id, p, s, a = '') => `<linearGradient id="${id}" x1="${p[0]}" y1="${p[1]}" x2="${p[2]}" y2="${p[3]}"${a}>${st(s)}</linearGradient>`;
  const RG = (id, p, s, a = '') => `<radialGradient id="${id}" cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fx="${p[3] ?? p[0]}" fy="${p[4] ?? p[1]}"${a}>${st(s)}</radialGradient>`;
  const BL = (id, s) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

  // Лист-«линза»: сужается к обоим концам. w — ширина, bend — изгиб.
  function lens(x1, y1, x2, y2, w, bend = 0) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    return `M${f(x1)} ${f(y1)}Q${f(mx + nx * (w + bend))} ${f(my + ny * (w + bend))} ${f(x2)} ${f(y2)}Q${f(mx - nx * (w - bend))} ${f(my - ny * (w - bend))} ${f(x1)} ${f(y1)}Z`;
  }
  const P = (d, fill, a = '') => `<path d="${d}" fill="${fill}"${a}/>`;
  const shadow = (cx, cy, rx, ry, o = .5) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#rz-sh)" opacity="${o}"/>`;
  const hl = (cx, cy, rx, ry, o = .8, rot = 0) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#rz-hl)" opacity="${o}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const bez = (p, t) => { const u = 1 - t; return [u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6], u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]]; };

  // ---------- Веки: формы глаза в единичных координатах (0..1) ----------
  const LIDS = {
    open: [[0, .52], [.06, .1, .94, .1, 1, .52], [.94, .9, .06, .9, 0, .52]],
    focus: [[0, .56], [.1, .3, .9, .3, 1, .56], [.92, .92, .08, .92, 0, .56]],
    happy: [[0, .64], [.18, .1, .82, .1, 1, .64], [.8, .42, .2, .42, 0, .64]],
    angry: [[0, .44], [.04, .3, .1, .26, .2, .27], [.6, .44, .9, .56, 1, .64], [.9, .95, .12, .95, 0, .44]],
    worried: [[0, .6], [.12, .36, .5, .12, .86, .12], [.96, .13, 1, .3, 1, .52], [.96, .93, .08, .94, 0, .6]],
    sad: [[0, .64], [.2, .46, .6, .3, .9, .3], [.98, .32, 1, .44, 1, .54], [.94, .9, .1, .92, 0, .64]],
  };
  const TOPN = { open: 1, focus: 1, happy: 1, angry: 2, worried: 2, sad: 2 }; // сколько отрезков — верхнее веко
  function lidPath(key, mirror, onlyTop) {
    const s = LIDS[key], mx = (x) => f(mirror ? 1 - x : x);
    let d = `M${mx(s[0][0])} ${s[0][1]}`;
    const n = onlyTop ? TOPN[key] : s.length - 1;
    for (let i = 1; i <= n; i++) { const c = s[i]; d += `C${mx(c[0])} ${c[1]} ${mx(c[2])} ${c[3]} ${mx(c[4])} ${c[5]}`; }
    return onlyTop ? d : d + 'Z';
  }

  // ---------- Текстуры для фона (CSS-переменные) ----------
  const svgUrl = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const TEX = {
    wood: svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='520' height='180'><filter id='w' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.07' numOctaves='5' seed='14' stitchTiles='stitch' result='a'/><feTurbulence type='fractalNoise' baseFrequency='0.03 0.7' numOctaves='2' seed='3' stitchTiles='stitch' result='b'/><feComposite in='a' in2='b' operator='arithmetic' k2='1' k3='.3' k4='-.13' result='c'/><feColorMatrix in='c' values='.8 0 0 0 .2  .55 0 0 0 .09  .32 0 0 0 .03  0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`),
    oak: svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='520' height='180'><filter id='w' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.07' numOctaves='5' seed='21' stitchTiles='stitch' result='a'/><feTurbulence type='fractalNoise' baseFrequency='0.025 0.8' numOctaves='2' seed='5' stitchTiles='stitch' result='b'/><feComposite in='a' in2='b' operator='arithmetic' k2='1' k3='.3' k4='-.13' result='c'/><feColorMatrix in='c' values='.8 0 0 0 .3  .62 0 0 0 .17  .4 0 0 0 .06  0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`),
    tile: svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='132' height='66'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fbf7f0'/><stop offset='.55' stop-color='#f1e9dd'/><stop offset='1' stop-color='#e3d7c6'/></linearGradient><linearGradient id='h' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='.3' stop-color='#fff' stop-opacity='.7'/><stop offset='.7' stop-color='#fff' stop-opacity='.15'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .3  0 0 0 .35 -.1'/></filter></defs><rect width='132' height='66' fill='#c9b9a2'/><g fill='url(#g)'><rect x='1.5' y='1.5' width='63' height='30' rx='2.5'/><rect x='67.5' y='1.5' width='63' height='30' rx='2.5'/><rect x='-31.5' y='34.5' width='63' height='30' rx='2.5'/><rect x='34.5' y='34.5' width='63' height='30' rx='2.5'/><rect x='100.5' y='34.5' width='63' height='30' rx='2.5'/></g><g fill='url(#h)'><rect x='4' y='3' width='58' height='3' rx='1.5'/><rect x='70' y='3' width='58' height='3' rx='1.5'/><rect x='-29' y='36' width='58' height='3' rx='1.5'/><rect x='37' y='36' width='58' height='3' rx='1.5'/><rect x='103' y='36' width='58' height='3' rx='1.5'/></g><rect width='132' height='66' filter='url(#n)'/></svg>`),
    linen: svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.8 .04' numOctaves='2' seed='2' stitchTiles='stitch' result='a'/><feTurbulence type='fractalNoise' baseFrequency='.04 .8' numOctaves='2' seed='7' stitchTiles='stitch' result='b'/><feBlend in='a' in2='b' mode='multiply'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .15  0 0 0 -.9 .55'/></filter><rect width='200' height='200' filter='url(#n)'/></svg>`),
  };

  // ---------- Общие определения ----------
  const DEFS = [
    // мягкие тени и блики
    RG('rz-sh', [.5, .5, .5], [[0, '#1a0c04', .9], [.45, '#1a0c04', .5], [1, '#1a0c04', 0]]),
    RG('rz-hl', [.5, .5, .5], [[0, '#fff', .95], [.35, '#fff', .55], [1, '#fff', 0]]),
    RG('rz-warm', [.5, .5, .5], [[0, '#ffd7a8', .8], [1, '#ffd7a8', 0]]),
    RG('rz-blush', [.5, .5, .5], [[0, '#ff6b6b', .55], [1, '#ff6b6b', 0]]),
    RG('rz-flush', [.5, .5, .5], [[0, '#d01c10', .5], [1, '#d01c10', 0]]),
    RG('rz-dark', [.5, .5, .5], [[0, '#1a0c04', .55], [1, '#1a0c04', 0]]),
    RG('rz-vol', [.36, .3, .75], [[0, '#fff', .28], [.35, '#fff', 0], [.7, '#2a1408', 0], [1, '#2a1408', .4]]),
    RG('rz-mouth', [.5, .3, .7], [[0, '#7a2424'], [.6, '#4a0e10'], [1, '#220405']]),
    LG('rz-tongue', [0, 0, 0, 1], [[0, '#c84a5c'], [.35, '#f0808e'], [1, '#e0606e']]),
    LG('rz-teeth', [0, 0, 0, 1], [[0, '#fffdf6'], [.7, '#f1e8d4'], [1, '#cdbf9e']]),
    RG('rz-nose', [.45, .35, .7], [[0, '#5a504c'], [.35, '#2a2220'], [1, '#070505']]),
    RG('rz-nostril', [.5, .5, .5], [[0, '#000'], [.7, '#120806'], [1, '#2a1a18', 0]]),
    LG('rz-drop', [0, 0, 1, 1], [[0, '#f4fbff', .95], [.5, '#bfe0f4', .75], [1, '#6fa6cc', .85]]),
    RG('rz-pinkin', [.5, .6, .6], [[0, '#ffd2cc'], [.55, '#f0a6a6'], [1, '#c26c74']]),
    RG('rz-bubble', [.5, .5, .5], [[0, '#fff', 0], [.7, '#fff', .15], [.92, '#fff', .75], [1, '#fff', 0]]),
    // радужки
    RG('rz-iris-green', [.5, .5, .5], [[0, '#2a1a08'], [.18, '#e9c24a'], [.45, '#c9b33c'], [.72, '#8fae42'], [.9, '#56772a'], [1, '#1f2a0c']]),
    RG('rz-iris-amber', [.5, .5, .5], [[0, '#2a1404'], [.2, '#f6c24c'], [.55, '#df9a26'], [.85, '#a8600e'], [1, '#3a1e04']]),
    RG('rz-iris-brown', [.5, .5, .5], [[0, '#1a0c04'], [.25, '#a2672f'], [.6, '#6e3c16'], [.88, '#3e1e08'], [1, '#140803']]),
    RG('rz-iris-dark', [.42, .38, .62], [[0, '#4a3a32'], [.5, '#1f1410'], [1, '#050302']]),
    RG('rz-iris-red', [.5, .5, .5], [[0, '#1a0604'], [.25, '#8a2a20'], [.7, '#4e120c'], [1, '#120302']]),
    RG('rz-iris-gold', [.5, .5, .5], [[0, '#fff0a8'], [.35, '#e8be4a'], [.75, '#b07a1a'], [1, '#3a2406']]),
    BL('b04', .4), BL('b08', .8), BL('b15', 1.5), BL('b3', 3), BL('b6', 6), BL('ub', .025), BL('ub2', .05),
    // шерсть: рваный край + волоски
    `<filter id="rz-fur" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".32" numOctaves="2" seed="4" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".9 .16" numOctaves="1" seed="9" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 .12  0 0 0 0 .05  0 0 0 0 0  -.9 0 0 0 .44" result="sd"/>
      <feComposite in="sd" in2="d" operator="in" result="sd2"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  .8 0 0 0 -.44" result="sl"/>
      <feComposite in="sl" in2="d" operator="in" result="sl2"/>
      <feMerge><feMergeNode in="d"/><feMergeNode in="sd2"/><feMergeNode in="sl2"/></feMerge></filter>`,
    // кожица: пятнышки + неровный цвет
    `<filter id="rz-skin" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .28  0 0 0 0 .16  0 0 0 0 .06  4.5 0 0 0 -2.55" result="d"/>
      <feComposite in="d" in2="SourceAlpha" operator="in" result="d2"/>
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="2" result="m"/>
      <feColorMatrix in="m" type="matrix" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .07  1.6 0 0 0 -.62" result="m2"/>
      <feComposite in="m2" in2="SourceAlpha" operator="in" result="m3"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="m3"/><feMergeNode in="d2"/></feMerge></filter>`,
    `<filter id="rz-fine" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .7 0 0 0 -.36" result="d"/>
      <feComposite in="d" in2="SourceAlpha" operator="in" result="d2"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="d2"/></feMerge></filter>`,
    `<filter id="rz-brushed" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".004 .9" numOctaves="2" seed="5" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -1.05" result="l"/>
      <feComposite in="l" in2="SourceAlpha" operator="in"/></filter>`,
    `<filter id="rz-speck" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="8" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 .95  0 0 0 0 .9  0 0 0 0 .8  4 0 0 0 -2.95" result="d"/>
      <feComposite in="d" in2="SourceAlpha" operator="in" result="d2"/>
      <feTurbulence type="fractalNoise" baseFrequency=".03 .12" numOctaves="3" seed="3" result="m"/>
      <feColorMatrix in="m" type="matrix" values="0 0 0 0 .45  0 0 0 0 .62  0 0 0 0 .7  1.8 0 0 0 -.8" result="m2"/>
      <feComposite in="m2" in2="SourceAlpha" operator="in" result="m3"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="m3"/><feMergeNode in="d2"/></feMerge></filter>`,
    `<filter id="rz-steam" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`,
    // веки
    ...Object.keys(LIDS).flatMap(k => k === 'open' || k === 'focus' || k === 'happy'
      ? [`<clipPath id="rz-lid-${k}"><path d="${lidPath(k, false)}"/></clipPath>`]
      : [`<clipPath id="rz-lid-${k}L"><path d="${lidPath(k, false)}"/></clipPath>`, `<clipPath id="rz-lid-${k}R"><path d="${lidPath(k, true)}"/></clipPath>`]),

    // ===== продукты =====
    LG('f-carrot', [0, 0, 1, 0], [[0, '#9a3608'], [.14, '#d9620f'], [.36, '#ff9a42'], [.5, '#ffad60'], [.64, '#f27e22'], [.86, '#c2510c'], [1, '#7e2a06']]),
    LG('f-carrot-v', [0, 0, 0, 1], [[0, '#5a1c02', .35], [.12, '#5a1c02', 0], [.7, '#5a1c02', 0], [1, '#4a1402', .45]]),
    LG('f-stem', [0, 0, 1, 1], [[0, '#2f6a1a'], [.5, '#5a9a2e'], [1, '#2c5a14']]),
    LG('f-leaf', [0, 0, 1, 1], [[0, '#7cbc48'], [.45, '#4e9430'], [1, '#2a5c18']]),
    LG('f-leaf2', [0, 0, 1, 1], [[0, '#5d9c3a'], [.5, '#367a26'], [1, '#1d4a12']]),
    RG('f-potato', [.42, .38, .62, .36, .3], [[0, '#f3d8a0'], [.4, '#dcb06c'], [.75, '#b38246'], [1, '#7a5328']]),
    RG('f-onion', [.42, .42, .62, .36, .36], [[0, '#ffd894'], [.35, '#eaa954'], [.7, '#c57530'], [1, '#7a3a12']]),
    LG('f-onion-neck', [0, 0, 1, 0], [[0, '#8a5424'], [.45, '#d6a868'], [1, '#7a4a1c']]),
    RG('f-tomato', [.45, .45, .6, .38, .36], [[0, '#ff8a68'], [.3, '#f24a30'], [.65, '#d1200f'], [.9, '#9a0e08'], [1, '#6a0805']]),
    LG('f-cuc', [0, 0, 0, 1], [[0, '#193f12'], [.18, '#356e22'], [.36, '#6fa646'], [.5, '#5b9440'], [.72, '#2e5e1e'], [1, '#132f0c']]),
    RG('f-cab', [.46, .4, .62, .4, .3], [[0, '#f0f7d0'], [.45, '#c4e09a'], [.8, '#8cba62'], [1, '#55843c']]),
    LG('f-cab-leaf', [0, 0, 1, 0], [[0, '#34683a'], [.45, '#6ea468'], [1, '#a9d08c']]),
    LG('f-cab-leafr', [1, 0, 0, 0], [[0, '#2c5e34'], [.5, '#5e9660'], [1, '#9cc884']]),
    RG('f-beet', [.42, .42, .62, .36, .34], [[0, '#b8466a'], [.4, '#7e1640'], [.8, '#4a0a24'], [1, '#2a0412']]),
    LG('f-beet-stem', [0, 0, 1, 0], [[0, '#6a0a30'], [.5, '#c03a64'], [1, '#6a0a30']]),
    RG('f-mush-cap', [.44, .4, .62, .38, .28], [[0, '#d39a5e'], [.35, '#a8622e'], [.75, '#733a14'], [1, '#4a220a']]),
    LG('f-mush-stem', [0, 0, 1, 0], [[0, '#a68c64'], [.25, '#e8dcc0'], [.5, '#f8f1e0'], [.8, '#d2c19e'], [1, '#8e7652']]),
    LG('f-mush-under', [0, 0, 0, 1], [[0, '#a88a50'], [1, '#e8d49a']]),
    LG('f-chz-top', [0, 0, 1, 1], [[0, '#fff3c0'], [.6, '#fbe18a'], [1, '#f1cc5e']]),
    LG('f-chz-front', [0, 0, 0, 1], [[0, '#f9d968'], [.5, '#ecbd42'], [1, '#c99428']]),
    LG('f-chz-hole', [0, 0, 0, 1], [[0, '#8f6410'], [.5, '#cf9e30'], [1, '#f6da80']]),
    LG('f-chz-hole2', [0, 0, 0, 1], [[0, '#b0861e'], [1, '#f8e7a8']]),
    LG('f-chz-rind', [0, 0, 0, 1], [[0, '#e6a92a'], [1, '#a0680e']]),
    RG('f-apple', [.42, .45, .62, .36, .38], [[0, '#ff7556'], [.3, '#e8352a'], [.65, '#b9181c'], [.9, '#7c0a12'], [1, '#55060c']]),
    RG('f-apple-y', [.5, .5, .5], [[0, '#f2c43a', .75], [1, '#f2c43a', 0]]),
    LG('f-wood-stem', [0, 0, 1, 0], [[0, '#3a2210'], [.5, '#8a6034'], [1, '#2e1a0a']]),
    RG('f-pear', [.42, .62, .7, .36, .55], [[0, '#f6ef8e'], [.35, '#dcd450'], [.72, '#aab42e'], [1, '#62701a']]),
    RG('f-pear-blush', [.5, .5, .5], [[0, '#e06a30', .55], [1, '#e06a30', 0]]),
    RG('f-cherry', [.4, .4, .62, .32, .28], [[0, '#ff5a64'], [.22, '#d0142e'], [.6, '#78061a'], [.9, '#360008'], [1, '#220005']]),
    RG('f-straw', [.44, .4, .64, .38, .3], [[0, '#ff6a52'], [.35, '#e8281e'], [.75, '#ac0c14'], [1, '#5c0408']]),
    LG('f-seed', [0, 0, 1, 1], [[0, '#fff2a6'], [.6, '#e2b84a'], [1, '#9a7420']]),
    LG('f-banana', [.75, .1, .25, .9], [[0, '#b88a10'], [.2, '#f0c832'], [.45, '#ffe57a'], [.62, '#f6d040'], [.85, '#d6a418'], [1, '#8f6408']]),
    LG('f-banana-stem', [0, 0, 1, 1], [[0, '#7a7a2a'], [.5, '#a69a4a'], [1, '#4a3a12']]),

    // ===== кот =====
    RG('c-head', [.48, .42, .62, .44, .3], [[0, '#f8bb72'], [.35, '#eb9a44'], [.68, '#d27a2a'], [.9, '#a8561a'], [1, '#7a380e']]),
    RG('c-ear', [.5, .7, .7], [[0, '#e8963e'], [.7, '#c2661e'], [1, '#86400e']]),
    RG('c-earin', [.5, .75, .7], [[0, '#f6c8b0'], [.5, '#dc9a82'], [1, '#9a5440']]),
    RG('c-muzzle', [.5, .4, .55], [[0, '#fffaf2'], [.6, '#f8e8cf'], [1, '#e8c69c', .2]]),
    RG('c-cream', [.5, .5, .5], [[0, '#fde3b8', .85], [1, '#fde3b8', 0]]),
    LG('c-nose', [0, 0, 0, 1], [[0, '#f2ae9c'], [.5, '#dc8676'], [1, '#a95448']]),
    LG('c-jacket', [0, 0, 1, 0], [[0, '#a7aeb6'], [.15, '#dde1e5'], [.42, '#ffffff'], [.68, '#f4f5f6'], [.88, '#c9cfd5'], [1, '#9aa1a9']]),
    LG('c-band', [0, 0, 1, 0], [[0, '#bcc2c8'], [.2, '#eef0f2'], [.45, '#ffffff'], [.75, '#f0f2f4'], [1, '#a9b0b8']]),
    RG('c-puff', [.46, .42, .62, .4, .25], [[0, '#ffffff'], [.6, '#f3f4f6'], [.88, '#d6dbe0'], [1, '#b4bbc3']]),
    RG('c-scarf', [.45, .35, .65], [[0, '#ec6248'], [.5, '#bd3021'], [1, '#6a120a']]),
    RG('c-btn', [.4, .35, .6], [[0, '#ffffff'], [.6, '#e4e6e8'], [1, '#9ea4aa']]),
    LG('c-wood', [0, 0, 1, 0], [[0, '#6a3e1c'], [.4, '#c48a52'], [.6, '#d9a066'], [1, '#7a4a22']]),
    RG('c-spoon', [.55, .62, .6], [[0, '#e9b47a'], [.6, '#b8783e'], [1, '#6a3c18']]),

    // ===== гости =====
    RG('g-dog', [.48, .4, .62, .44, .28], [[0, '#ecbc84'], [.45, '#cf9454'], [.8, '#a26834'], [1, '#6e421c']]),
    RG('g-dog-ear', [.4, .3, .8], [[0, '#a8703a'], [.6, '#7a4a22'], [1, '#4a2a10']]),
    RG('g-dog-muz', [.5, .35, .62], [[0, '#fff6ea'], [.5, '#f0dcbc'], [1, '#c9a47a']]),
    RG('g-mouse', [.48, .38, .62, .44, .28], [[0, '#d6ccc2'], [.45, '#aa9c92'], [.8, '#7a6c62'], [1, '#4e423a']]),
    RG('g-mouse-muz', [.5, .35, .6], [[0, '#f8f2ec'], [.6, '#d8cec4'], [1, '#a8988c', .3]]),
    RG('g-bun', [.48, .38, .62, .44, .28], [[0, '#ffffff'], [.5, '#f4efe8'], [.82, '#dcd2c4'], [1, '#aea08e']]),
    RG('g-bear', [.48, .38, .62, .44, .28], [[0, '#b07c50'], [.45, '#835434'], [.8, '#5a361c'], [1, '#38200c']]),
    RG('g-bear-muz', [.5, .35, .62], [[0, '#ecceA4'], [.55, '#c89e70'], [1, '#8a6440']]),
    RG('g-fox', [.48, .38, .62, .44, .28], [[0, '#f8a656'], [.45, '#e0712c'], [.8, '#b04a18'], [1, '#7a2c0c']]),
    LG('g-fox-ear', [0, 0, 0, 1], [[0, '#2a1810'], [.35, '#5a2e16'], [.7, '#c45a22'], [1, '#d9692a']]),
    RG('g-white', [.5, .3, .7], [[0, '#ffffff'], [.6, '#f4eee6'], [1, '#cbbfae']]),
    RG('g-pig', [.48, .38, .62, .44, .28], [[0, '#ffdcd4'], [.45, '#f5b5aa'], [.8, '#dc8e86'], [1, '#b0625c']]),
    RG('g-pig-snout', [.45, .4, .62], [[0, '#ffd0ca'], [.55, '#f4a4a0'], [1, '#cc7676']]),
    RG('g-frog', [.46, .32, .7, .42, .2], [[0, '#c8ea7a'], [.35, '#8cc444'], [.75, '#4e8c26'], [1, '#2a5a12']]),
    RG('g-frog-belly', [.5, .3, .6], [[0, '#f2f6c8'], [.7, '#d6e2a0'], [1, '#a8bc6a', 0]]),

    // ===== посуда =====
    LG('p-steel', [0, 0, 1, 0], [[0, '#3a4148'], [.05, '#7f8991'], [.12, '#dfe5ea'], [.18, '#b0b9c1'], [.3, '#626c75'], [.42, '#8e99a2'], [.52, '#cbd3d9'], [.6, '#f7f9fb'], [.68, '#b5bec6'], [.8, '#69737c'], [.9, '#a4adb5'], [.96, '#d9dfe4'], [1, '#4a525a']]),
    LG('p-steel-v', [0, 0, 0, 1], [[0, '#0e1216', .55], [.12, '#0e1216', 0], [.75, '#0e1216', 0], [1, '#0e1216', .5]]),
    LG('p-rim', [0, 0, 1, 0], [[0, '#5a636b'], [.1, '#e9eef2'], [.25, '#9aa4ad'], [.45, '#f7fafc'], [.6, '#c2cad1'], [.78, '#7d8790'], [.9, '#eef2f5'], [1, '#5f6870']]),
    LG('p-inwall', [0, 0, 0, 1], [[0, '#2c3238'], [.6, '#5c656d'], [1, '#9aa4ac']]),
    LG('p-handle', [0, 0, 0, 1], [[0, '#f4f7f9'], [.3, '#a7b0b8'], [.6, '#4e575f'], [1, '#c3cbd2']]),
    RG('p-rivet', [.4, .35, .6], [[0, '#ffffff'], [.5, '#aab3bb'], [1, '#3e464e']]),
    LG('b-out', [0, 0, 1, 0], [[0, '#101a24'], [.14, '#2c4458'], [.36, '#5c7a90'], [.48, '#7c98ac'], [.6, '#45627a'], [.84, '#21364a'], [1, '#0c141c']]),
    LG('b-out-v', [0, 0, 0, 1], [[0, '#c49a6a', .9], [.1, '#8a6a4a', .35], [.22, '#8a6a4a', 0], [.85, '#000', 0], [1, '#000', .45]]),
    LG('b-rim', [0, 0, 1, 0], [[0, '#a68a6a'], [.3, '#f2e8d8'], [.55, '#fffaf0'], [.8, '#e2d4be'], [1, '#9a7e5e']]),
    RG('b-in', [.5, .75, .7], [[0, '#fbf6ec'], [.55, '#efe5d4'], [.85, '#d2c3aa'], [1, '#a8957a']]),

    // ===== иконки =====
    RG('i-heart', [.38, .32, .75], [[0, '#ff8a80'], [.35, '#f0403a'], [.75, '#b81c22'], [1, '#6e0a10']]),
    RG('i-heart-off', [.38, .32, .75], [[0, '#f4eee8'], [.6, '#d8cec4'], [1, '#a89c90']]),
    LG('i-coin', [0, 0, 1, 1], [[0, '#fff3b8'], [.3, '#f2cc5a'], [.65, '#c8921e'], [1, '#7a520c']]),
    LG('i-coin-face', [1, 1, 0, 0], [[0, '#ffeaa0'], [.4, '#e8b844'], [1, '#a87418']]),
    LG('i-ban', [0, 0, 1, 1], [[0, '#ff6a58'], [.5, '#d8281e'], [1, '#8e0e0c']]),
    // маски-обрезки для продуктов
    `<clipPath id="rz-c-apple"><path d="M50 28C40 20 18 22 15 46C12 70 30 92 46 90C48 89 52 89 54 90C70 92 88 70 85 46C82 22 60 20 50 28Z"/></clipPath>`,
    `<clipPath id="rz-c-straw"><path d="M50 30C66 28 82 33 82 46C82 63 64 84 52 92C50 93 48 93 46 91C34 82 18 63 18 46C18 33 34 28 50 30Z"/></clipPath>`,
    `<clipPath id="rz-c-cuc"><path d="M14 50C14 40 22 37 34 37L68 37C80 37 88 42 88 50C88 58 80 63 68 63L34 63C22 63 14 60 14 50Z"/></clipPath>`,
    `<clipPath id="rz-c-pot"><path d="M36 58L264 58L256 176C255 186 246 192 232 192L68 192C54 192 45 186 44 176Z"/></clipPath>`,
    `<clipPath id="rz-c-bowl"><path d="M22 72C24 136 76 186 150 186C224 186 276 136 278 72Z"/></clipPath>`,
  ].join('');

  if (typeof document !== 'undefined' && !document.getElementById('rz-defs')) {
    const holder = document.createElement('div');
    holder.innerHTML = `<svg id="rz-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${DEFS}</defs></svg>`;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
    const r = document.documentElement.style;
    r.setProperty('--tex-wood', TEX.wood); r.setProperty('--tex-oak', TEX.oak);
    r.setProperty('--tex-tile', TEX.tile); r.setProperty('--tex-linen', TEX.linen);
  }

  // =====================================================================
  // ПРОДУКТЫ (viewBox 0 0 100 100)
  // =====================================================================
  function frond(p, n, len, w, fill = 'url(#f-leaf)') {
    let o = `<path d="M${p[0]} ${p[1]}C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}" fill="none" stroke="url(#f-stem)" stroke-width="1.7" stroke-linecap="round"/>`;
    for (let i = 1; i <= n; i++) {
      const t = .22 + .78 * i / n, [x, y] = bez(p, t), [x2, y2] = bez(p, Math.min(1, t + .03));
      const a = Math.atan2(y2 - y, x2 - x), l = len * (1.05 - t * .5);
      for (const s of [-1, 1]) {
        const b = a + s * .85;
        o += P(lens(x, y, x + Math.cos(b) * l, y + Math.sin(b) * l, w * (1.1 - t * .4), s * .6), i % 2 ? fill : 'url(#f-leaf2)');
      }
    }
    const [ex, ey] = bez(p, 1), [px, py] = bez(p, .96), a = Math.atan2(ey - py, ex - px);
    return o + P(lens(ex, ey, ex + Math.cos(a) * len * .7, ey + Math.sin(a) * len * .7, w * .8), fill);
  }

  function carrot() {
    let rings = '';
    [41, 48, 55, 62, 69, 76, 83].forEach((y, i) => {
      const w = 13.5 * (1 - (y - 34) / 62) + 1, s = i % 2 ? 1 : -1;
      rings += `<path d="M${f(50 - w)} ${y}Q${f(50 + s * 2)} ${y + 2.4} ${f(50 + w * .75)} ${y - .4}" fill="none" stroke="#6a2402" stroke-width="1" opacity=".4" stroke-linecap="round"/>`;
      rings += `<path d="M${f(50 - w * .9)} ${y + 1.2}Q${f(50 + s * 2)} ${y + 3.4} ${f(50 + w * .6)} ${y + .8}" fill="none" stroke="#ffd09a" stroke-width=".7" opacity=".45" stroke-linecap="round"/>`;
    });
    const body = 'M37 34C37 28.5 63 28.5 63 34C63 52 56.5 74 51.2 92C50.6 94 49.4 94 48.8 92C43.5 74 37 52 37 34Z';
    return `${shadow(48, 91, 30, 5.5, .55)}
    <g transform="rotate(28 50 56) translate(-8 -9) scale(1.16)">
      ${frond([49, 31, 46, 22, 38, 13, 28, 8], 5, 7, 2.6)}
      ${frond([52, 31, 56, 21, 64, 13, 74, 10], 5, 7, 2.6)}
      ${frond([50, 31, 50, 22, 50, 12, 51, 3], 5, 6.5, 2.4, 'url(#f-leaf2)')}
      ${P(body, 'url(#f-carrot)')}${P(body, 'url(#f-carrot-v)')}
      ${rings}
      <path d="M41 50l-4 -1M58.5 58l4 .5M45 72l-3.5 1.5M54.5 79l3 1" stroke="#e8b48a" stroke-width=".6" opacity=".8" stroke-linecap="round"/>
      ${P(lens(42.5, 37, 47.5, 82, 3.4, .8), '#fff', ' opacity=".28"')}
      <ellipse cx="50" cy="32.6" rx="12.8" ry="3.2" fill="#b4500f"/><ellipse cx="50" cy="32.2" rx="9" ry="2" fill="#e08436"/>
      <ellipse cx="50" cy="32" rx="3.6" ry="1.4" fill="#7a9a2a"/>
    </g>`;
  }

  function potato() {
    const body = 'M19 57C15 39 31 27 51 26C72 25 86 36 85 55C84 74 67 83 48 81C30 79 22 71 19 57Z';
    const eye = (x, y, r) => `<ellipse cx="${x}" cy="${y + .7}" rx="${r * 1.5}" ry="${r * .9}" fill="#f6dcaa" opacity=".55"/><ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r * .6}" fill="#5a3814" opacity=".85"/><ellipse cx="${x}" cy="${y - .6}" rx="${r * 2}" ry="${r * 1.4}" fill="url(#rz-dark)" opacity=".5"/>`;
    return `${shadow(52, 82, 36, 6, .6)}
      <g filter="url(#rz-skin)">${P(body, 'url(#f-potato)')}
      <ellipse cx="62" cy="62" rx="14" ry="8" fill="#8a5a2a" opacity=".18"/><ellipse cx="34" cy="50" rx="8" ry="6" fill="#8a5a2a" opacity=".14"/></g>
      ${eye(37, 45, 2)}${eye(64, 39, 1.6)}${eye(58, 66, 2.1)}${eye(33, 64, 1.5)}${eye(73, 54, 1.4)}
      ${hl(40, 38, 14, 8, .38, -15)}${hl(37, 36, 5, 2.5, .3, -15)}
      <path d="M70 74C62 79 46 80 36 76" fill="none" stroke="#f2d39e" stroke-width="1.5" opacity=".35" stroke-linecap="round"/>`;
  }

  function onion() {
    const body = 'M50 27C38 34 19 44 19 63C19 80 34 89 50 89C66 89 81 80 81 63C81 44 62 34 50 27Z';
    let veins = '';
    [-27, -18, -10, -3, 4, 11, 19, 27].forEach((k, i) => {
      veins += `<path d="M50 29C${50 + k * 1.15} 40 ${50 + k * 1.22} 74 50 87" fill="none" stroke="${i % 2 ? '#ffe0a8' : '#7a3a10'}" stroke-width="${i % 2 ? .8 : 1.1}" opacity="${i % 2 ? .32 : .2}"/>`;
    });
    return `${shadow(50, 90, 30, 5, .55)}
      <path d="M46 31C46 22 47 14 49.5 7C50.5 5 51.5 5 52 7C53 14 54 22 54 31Z" fill="url(#f-onion-neck)"/>
      <path d="M49.6 7C47 3 44 3 42 4.5M51.5 7.5C54 4 57 3.5 59 5" fill="none" stroke="#b88a4e" stroke-width="1" stroke-linecap="round"/>
      <g filter="url(#rz-fine)">${P(body, 'url(#f-onion)')}</g>
      ${veins}
      ${P('M60 72C66 66 70 60 72 54C75 64 72 74 64 80Z', '#fbe3b0', ' opacity=".35"')}
      ${hl(36, 52, 7, 13, .5, 12)}${hl(35, 49, 2.5, 5, .55, 12)}
      <path d="M46 88C44 92 42 95 40 97M49 89C49 93 48 96 48 98M52 89C53 93 55 95 57 97M54 88C57 91 60 93 62 94" fill="none" stroke="#d9c2a0" stroke-width=".75" stroke-linecap="round"/>
      <ellipse cx="50" cy="88" rx="5" ry="2" fill="#8a5a2a"/>`;
  }

  function tomato() {
    const body = 'M50 31C70 29 86 41 86 59C86 77 70 89 50 89C30 89 14 77 14 59C14 41 30 29 50 31Z';
    let sepals = '';
    [-160, -120, -75, -35, 10, 55, 100].forEach((a, i) => {
      const r = a * Math.PI / 180, L = 15 + (i % 3) * 2;
      sepals += P(lens(50, 31, 50 + Math.cos(r) * L, 31 + Math.sin(r) * L * .55 + 4, 3.6, i % 2 ? 1.2 : -1.2), i % 2 ? 'url(#f-leaf)' : 'url(#f-leaf2)');
    });
    return `${shadow(50, 90, 33, 5.5, .6)}
      ${P(body, 'url(#f-tomato)')}
      <path d="M50 36C40 37 30 44 25 56M50 36C60 37 70 44 75 56M50 36C49 46 48 56 49 66" fill="none" stroke="#7a0606" stroke-width="2.4" opacity=".16" stroke-linecap="round"/>
      <path d="M78 64C76 76 64 85 50 86" fill="none" stroke="#ff9070" stroke-width="2.5" opacity=".35" stroke-linecap="round"/>
      ${hl(35, 46, 10, 6.5, .65, -35)}<ellipse cx="33.5" cy="44.5" rx="3.6" ry="2" fill="#fff" opacity=".9" transform="rotate(-35 33.5 44.5)"/>
      <ellipse cx="62" cy="40" rx="3" ry="1.4" fill="#fff" opacity=".4" transform="rotate(20 62 40)"/>
      ${sepals}
      <path d="M50 33C50 28 50.5 24 52 20" fill="none" stroke="url(#f-stem)" stroke-width="3.4" stroke-linecap="round"/>
      <ellipse cx="50" cy="32" rx="3" ry="1.6" fill="#2c5a14"/>`;
  }

  function cucumber() {
    const r = rand(7); let bumps = '';
    for (let i = 0; i < 26; i++) {
      const x = 22 + r() * 60, y = 40 + r() * 20;
      bumps += `<circle cx="${f(x)}" cy="${f(y)}" r="1.25" fill="#a8d278" opacity=".55"/><circle cx="${f(x + .3)}" cy="${f(y + .35)}" r=".45" fill="#14240a" opacity=".8"/>`;
    }
    const body = 'M14 50C14 40 22 37 34 37L68 37C80 37 88 42 88 50C88 58 80 63 68 63L34 63C22 63 14 60 14 50Z';
    return `${shadow(50, 80, 36, 5, .55)}
    <g transform="rotate(-32 50 50)">
      ${P(body, 'url(#f-cuc)')}
      <g clip-path="url(#rz-c-cuc)">
        <path d="M14 45C40 43 62 45 90 44M14 54C38 56 64 53 90 55" fill="none" stroke="#b4dc80" stroke-width="2.4" opacity=".28"/>
        <path d="M14 49C40 48 62 50 90 49" fill="none" stroke="#1d4a12" stroke-width="1.6" opacity=".25"/>
        ${bumps}
        <ellipse cx="18" cy="50" rx="5" ry="9" fill="#d8c070" opacity=".35"/>
      </g>
      ${P(lens(24, 41.5, 78, 41.5, 2.6, 0), '#fff', ' opacity=".45"')}
      <ellipse cx="15.5" cy="50" rx="1.8" ry="3" fill="#b8a050"/>
      <path d="M87 50C89 50 92 49.5 94 48.5" fill="none" stroke="#6a6a2a" stroke-width="2.4" stroke-linecap="round"/>
    </g>`;
  }

  function cabbage() {
    let veins = '';
    [[-34, 54], [-24, 34], [-12, 24], [12, 24], [24, 34], [34, 54]].forEach(([dx, y]) => {
      veins += P(lens(50 + dx * .15, 86, 50 + dx, y, 2.2, dx > 0 ? -4 : 4), '#f4fae0', ' opacity=".55"');
    });
    return `${shadow(50, 90, 36, 6, .6)}
      <circle cx="50" cy="56" r="34" fill="url(#f-cab)"/>
      <path d="M38 30C44 40 46 50 47 62M62 30C56 40 54 50 53 62M30 40C38 46 44 54 47 64M70 40C62 46 56 54 53 64" fill="none" stroke="#7aa850" stroke-width="1.3" opacity=".55"/>
      ${P('M17 66C12 42 28 24 48 21C37 32 31 48 33 66C35 80 43 88 50 90C34 89 20 80 17 66Z', 'url(#f-cab-leaf)')}
      ${P('M83 66C88 42 72 24 52 21C63 32 69 48 67 66C65 80 57 88 50 90C66 89 80 80 83 66Z', 'url(#f-cab-leafr)')}
      ${P('M20 72C22 82 34 90 50 91C66 90 78 82 80 72C72 82 62 86 50 86C38 86 28 82 20 72Z', '#3a6e3a', ' opacity=".9"')}
      ${veins}
      ${P(lens(30, 74, 22, 50, 2.4, 3), '#e8f4d0', ' opacity=".45"')}${P(lens(70, 74, 78, 50, 2.4, -3), '#e8f4d0', ' opacity=".4"')}
      ${hl(40, 38, 12, 8, .55, -20)}`;
  }

  function beet() {
    const body = 'M50 31C31 31 21 46 23 62C25 78 39 86 49 91C59 86 75 78 77 62C79 46 69 31 50 31Z';
    const leaf = (x1, y1, x2, y2, b) => `${P(lens(x1, y1, x2, y2, 11, b), 'url(#f-leaf2)')}<path d="M${x1} ${y1}Q${(x1 + x2) / 2 + b * .4} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="#b02a58" stroke-width="1" opacity=".9"/>`;
    return `${shadow(50, 92, 28, 5, .55)}
      <path d="M46 32C43 24 38 18 33 14M54 32C57 23 62 16 68 11M50 31C50 24 51 18 52 12" fill="none" stroke="url(#f-beet-stem)" stroke-width="3" stroke-linecap="round"/>
      ${leaf(33, 15, 12, 6, -3)}${leaf(68, 12, 90, 5, 3)}${leaf(52, 13, 54, 1, 2)}
      <g filter="url(#rz-fine)">${P(body, 'url(#f-beet)')}</g>
      <path d="M49 90C50 94 52 97 55 99" fill="none" stroke="#5a0a26" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 52C40 54 58 54 70 51M28 64C42 67 58 67 72 63M33 76C42 78 56 78 66 75" fill="none" stroke="#d07090" stroke-width=".8" opacity=".35"/>
      ${hl(36, 46, 8, 11, .35, 15)}<ellipse cx="35" cy="44" rx="2.2" ry="4" fill="#fff" opacity=".35" transform="rotate(15 35 44)"/>
      <path d="M26 68l-4 1M74 70l4 1.5" stroke="#8a4a5a" stroke-width=".6" stroke-linecap="round"/>`;
  }

  function mushroom() {
    return `${shadow(50, 92, 28, 4.5, .6)}
      ${P('M36 56C33 70 33 83 39 90C45 95 56 95 62 90C68 83 68 70 64 56Z', 'url(#f-mush-stem)')}
      <path d="M40 70C46 72 54 72 60 70M38 80C46 83 56 83 63 80M42 62C47 64 54 64 59 62" fill="none" stroke="#b8a27a" stroke-width=".8" opacity=".5"/>
      <ellipse cx="50" cy="91" rx="12" ry="3" fill="#7a6040" opacity=".35"/>
      <ellipse cx="50" cy="60" rx="15" ry="5" fill="url(#rz-dark)" opacity=".8"/>
      ${P('M12 60C30 55 70 55 88 60C84 65 70 66 50 66C30 66 16 65 12 60Z', 'url(#f-mush-under)')}
      ${P('M7 57C7 33 27 16 50 16C73 16 93 33 93 57C93 61 89 63 83 62C63 58 37 58 17 62C11 63 7 61 7 57Z', 'url(#f-mush-cap)')}
      <path d="M10 58C30 54 70 54 90 58" fill="none" stroke="#dca46c" stroke-width="1.2" opacity=".5"/>
      ${hl(36, 30, 16, 7, .55, -18)}<ellipse cx="34" cy="28" rx="6" ry="2" fill="#fff" opacity=".45" transform="rotate(-18 34 28)"/>`;
  }

  function cheese() {
    const hole = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#f-chz-hole)"/><path d="M${x - rx * .8} ${y + ry * .55}Q${x} ${y + ry * 1.25} ${x + rx * .8} ${y + ry * .55}" fill="none" stroke="#fff6c8" stroke-width=".8" opacity=".7"/>`;
    return `${shadow(50, 87, 42, 5.5, .6)}
      <g>
      ${P('M8 62L92 41L92 67L8 87Z', 'url(#f-chz-front)')}
      ${P('M8 62L64 26L92 41Z', 'url(#f-chz-top)')}</g>
      ${P('M64 26L92 41L92 43.5L63 28Z', 'url(#f-chz-rind)')}
      ${P('M92 41L92 67L89.5 67.6L89.5 41.6Z', 'url(#f-chz-rind)')}
      ${hole(30, 69, 5.5, 4.2)}${hole(55, 62, 6.5, 5)}${hole(76, 59, 3.4, 2.8)}${hole(42, 80, 3, 2.3)}${hole(80, 70, 4, 3)}
      <ellipse cx="48" cy="44" rx="5" ry="2" fill="url(#f-chz-hole2)" transform="rotate(-30 48 44)"/>
      <ellipse cx="68" cy="37" rx="3" ry="1.3" fill="url(#f-chz-hole2)" transform="rotate(-25 68 37)"/>
      <path d="M8 62L92 41" stroke="#fff8d8" stroke-width="1.1" opacity=".85"/>
      ${hl(40, 46, 18, 4, .45, -32)}`;
  }

  function apple() {
    const r = rand(3); let dots = '', streaks = '';
    for (let i = 0; i < 26; i++) dots += `<circle cx="${f(22 + r() * 58)}" cy="${f(34 + r() * 50)}" r=".55" fill="#ffd8a0" opacity=".7"/>`;
    for (let i = 0; i < 14; i++) {
      const k = -32 + i * 5;
      streaks += `<path d="M50 31C${50 + k * 1.2} 44 ${50 + k * 1.25} 74 ${50 + k * .3} 90" fill="none" stroke="${i % 2 ? '#f6b44a' : '#6a0610'}" stroke-width="${i % 2 ? .9 : 1.4}" opacity="${i % 2 ? .13 : .14}"/>`;
    }
    const body = 'M50 28C40 20 18 22 15 46C12 70 30 92 46 90C48 89 52 89 54 90C70 92 88 70 85 46C82 22 60 20 50 28Z';
    return `${shadow(50, 91, 32, 5, .6)}
      ${P(body, 'url(#f-apple)')}
      <g clip-path="url(#rz-c-apple)"><ellipse cx="76" cy="58" rx="20" ry="26" fill="url(#f-apple-y)"/>${streaks}${dots}</g>
      <ellipse cx="50" cy="30" rx="9" ry="4.5" fill="url(#rz-dark)" opacity=".9"/>
      <path d="M50 31C50 23 52 15 56 9" fill="none" stroke="url(#f-wood-stem)" stroke-width="2.8" stroke-linecap="round"/>
      ${P(lens(55, 17, 78, 11, 9, -2), 'url(#f-leaf)')}<path d="M55 17Q67 15 78 11" fill="none" stroke="#c8e6a0" stroke-width=".7" opacity=".8"/>
      ${hl(31, 46, 7, 12, .6, 20)}<ellipse cx="30" cy="43" rx="2.2" ry="4.5" fill="#fff" opacity=".85" transform="rotate(20 30 43)"/>
      <path d="M76 70C72 80 64 86 56 88" fill="none" stroke="#ff8a70" stroke-width="2" opacity=".3" stroke-linecap="round"/>`;
  }

  function pear() {
    const r = rand(11); let dots = '';
    for (let i = 0; i < 34; i++) { const y = 30 + r() * 58, w = y < 44 ? 9 : 24; dots += `<circle cx="${f(50 + (r() * 2 - 1) * w)}" cy="${f(y)}" r=".6" fill="#7a5a1e" opacity=".55"/>`; }
    const body = 'M50 18C42 18 40 28 40 36C40 44 26 52 24 68C22 84 36 92 50 92C64 92 78 84 76 68C74 52 60 44 60 36C60 28 58 18 50 18Z';
    return `${shadow(50, 92, 28, 5, .6)}
      ${P(body, 'url(#f-pear)')}
      <ellipse cx="64" cy="66" rx="13" ry="16" fill="url(#f-pear-blush)"/>
      <ellipse cx="50" cy="22" rx="7" ry="6" fill="#8a6a2a" opacity=".35"/>
      ${dots}
      <path d="M50 20C50 12 52 8 56 4" fill="none" stroke="url(#f-wood-stem)" stroke-width="2.6" stroke-linecap="round"/>
      ${hl(36, 66, 6, 12, .55, 8)}<ellipse cx="35" cy="63" rx="1.8" ry="4" fill="#fff" opacity=".7" transform="rotate(8 35 63)"/>
      ${hl(45, 32, 3, 6, .4)}
      <path d="M72 74C70 84 62 89 52 90" fill="none" stroke="#f2ea9a" stroke-width="1.8" opacity=".4" stroke-linecap="round"/>`;
  }

  function cherry() {
    const one = (x, y, r) => `${P(`M${x} ${y - r * .85}C${x + r * .5} ${y - r * 1.05} ${x + r} ${y - r * .6} ${x + r} ${y}C${x + r} ${y + r * .62} ${x + r * .55} ${y + r} ${x} ${y + r}C${x - r * .55} ${y + r} ${x - r} ${y + r * .62} ${x - r} ${y}C${x - r} ${y - r * .6} ${x - r * .5} ${y - r * 1.05} ${x} ${y - r * .85}Z`, 'url(#f-cherry)')}
      <ellipse cx="${x}" cy="${y - r * .78}" rx="${r * .32}" ry="${r * .14}" fill="#1a0004" opacity=".7"/>
      <path d="M${x + r * .78} ${y + r * .2}C${x + r * .6} ${y + r * .7} ${x + r * .1} ${y + r * .92} ${x - r * .3} ${y + r * .9}" fill="none" stroke="#ff6a78" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>
      ${hl(x - r * .38, y - r * .3, r * .36, r * .26, .7, -30)}
      <ellipse cx="${x - r * .42}" cy="${y - r * .34}" rx="${r * .16}" ry="${r * .09}" fill="#fff" opacity=".95" transform="rotate(-30 ${x - r * .42} ${y - r * .34})"/>`;
    return `${shadow(32, 89, 17, 3.5, .6)}${shadow(68, 91, 17, 3.5, .6)}
      <path d="M31 59C35 38 48 20 64 10M69 61C66 44 65 26 64 10" fill="none" stroke="url(#f-stem)" stroke-width="2" stroke-linecap="round"/>
      ${P(lens(64, 10, 88, 16, 10, -2), 'url(#f-leaf)')}<path d="M64 10Q76 12 88 16" fill="none" stroke="#c8e6a0" stroke-width=".7" opacity=".8"/>
      ${one(31, 73, 16)}${one(69, 75, 16)}`;
  }

  function strawberry() {
    let seeds = '';
    for (let row = 0; row < 9; row++) {
      const y = 37 + row * 6, half = Math.max(0, (y < 50 ? 30 : 30 - (y - 50) * .78)) - 3;
      const step = 7.2, start = 50 - half + ((row % 2) ? step / 2 : 0);
      for (let x = start; x <= 50 + half; x += step) {
        const a = f((x - 50) * .9);
        seeds += `<g transform="rotate(${a} ${f(x)} ${y})"><ellipse cx="${f(x)}" cy="${y}" rx="1.7" ry="2.3" fill="#7a040c" opacity=".5"/><ellipse cx="${f(x)}" cy="${y - .2}" rx=".9" ry="1.5" fill="url(#f-seed)"/><ellipse cx="${f(x + .8)}" cy="${y + 1.7}" rx="1.3" ry=".6" fill="#ff8a7a" opacity=".55"/></g>`;
      }
    }
    let sep = '';
    [-170, -140, -110, -80, -50, -20, 8].forEach((a, i) => {
      const r = a * Math.PI / 180;
      sep += P(lens(50, 29, 50 + Math.cos(r) * 18, 31 + Math.abs(Math.sin(r)) * -6 + 9, 4, i % 2 ? 1.5 : -1.5), i % 2 ? 'url(#f-leaf)' : 'url(#f-leaf2)');
    });
    return `${shadow(50, 92, 26, 4.5, .6)}
      ${P('M50 30C66 28 82 33 82 46C82 63 64 84 52 92C50 93 48 93 46 91C34 82 18 63 18 46C18 33 34 28 50 30Z', 'url(#f-straw)')}
      <g clip-path="url(#rz-c-straw)">${seeds}</g>
      ${hl(34, 46, 8, 11, .5, 25)}<ellipse cx="33" cy="44" rx="2" ry="4" fill="#fff" opacity=".7" transform="rotate(25 33 44)"/>
      ${sep}
      <path d="M50 30C50 24 51 19 54 14" fill="none" stroke="url(#f-stem)" stroke-width="2.6" stroke-linecap="round"/>`;
  }

  function banana() {
    const r = rand(5); let spots = '';
    for (let i = 0; i < 9; i++) { const t = .15 + r() * .75, [x, y] = bez([20, 30, 22, 62, 46, 82, 80, 76], t); spots += `<ellipse cx="${f(x + r() * 4 - 2)}" cy="${f(y - r() * 6)}" rx="${f(.6 + r() * .9)}" ry="${f(.5 + r() * .5)}" fill="#5a3a0a" opacity=".55"/>`; }
    return `${shadow(54, 86, 34, 5, .55)}
      ${P('M16 27C16 64 44 89 82 79C85 78 88 75 87 72C86 70 82 69 77 70C50 72 33 54 28 25Z', 'url(#f-banana)')}
      <path d="M22 30C25 58 46 77 79 73" fill="none" stroke="#fff3b0" stroke-width="2" opacity=".6" stroke-linecap="round"/>
      <path d="M24 33C28 58 48 75 79 71.5" fill="none" stroke="#b88a14" stroke-width="1" opacity=".35"/>
      ${spots}
      <path d="M82 79C85 78 88 75 87 72C86 71 84.5 70.6 83 70.6Z" fill="#3a2608"/>
      ${P('M16 27L14 16C14 13 22 12 24 15L28 25Z', 'url(#f-banana-stem)')}
      <ellipse cx="19" cy="14.5" rx="5" ry="2" fill="#4a3a12"/>`;
  }

  const FOOD = {
    carrot: { name: 'Морковка', kind: 'veg', svg: carrot() },
    potato: { name: 'Картошка', kind: 'veg', svg: potato() },
    onion: { name: 'Лук', kind: 'veg', svg: onion() },
    tomato: { name: 'Помидор', kind: 'veg', svg: tomato() },
    cucumber: { name: 'Огурец', kind: 'veg', svg: cucumber() },
    cabbage: { name: 'Капуста', kind: 'veg', svg: cabbage() },
    beet: { name: 'Свёкла', kind: 'veg', svg: beet() },
    mushroom: { name: 'Гриб', kind: 'veg', svg: mushroom() },
    cheese: { name: 'Сыр', kind: 'veg', svg: cheese() },
    apple: { name: 'Яблоко', kind: 'fruit', svg: apple() },
    pear: { name: 'Груша', kind: 'fruit', svg: pear() },
    cherry: { name: 'Вишня', kind: 'fruit', svg: cherry() },
    strawberry: { name: 'Клубника', kind: 'fruit', svg: strawberry() },
    banana: { name: 'Банан', kind: 'fruit', svg: banana() },
  };
  const foodSvg = (id, size = 56) =>
    `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${FOOD[id].name}" style="overflow:visible">${FOOD[id].svg}</svg>`;

  // =====================================================================
  // ГЛАЗА, БРОВИ, РОТ — общие для кота и гостей
  // =====================================================================
  // side: 'L' — левый на картинке (внутренний угол справа), 'R' — правый.
  function eye(cx, cy, r, mood, side, o = {}) {
    const key = mood === 'calm' ? 'open' : mood === 'cook' ? 'focus' : mood;
    const clip = (key === 'open' || key === 'focus' || key === 'happy') ? key : key + side;
    const mir = side === 'R';
    const look = o.look || [0, 0];
    const wide = mood === 'worried';
    const ir = wide ? .34 : (o.irisR || .47);
    const ix = .5 + look[0] * (mir && o.mirrorLook ? -1 : 1), iy = .5 + look[1] + (mood === 'happy' ? .06 : 0);
    let pupil;
    const pk = { sad: 1.25, worried: .75, angry: .6, happy: 1.1 }[mood] || 1;
    if (o.pupil === 'slit') pupil = `<ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(ir * .2 * pk * (mood === 'sad' ? 2.2 : 1))}" ry="${f(ir * .86)}" fill="#060302"/>`;
    else if (o.pupil === 'hbar') pupil = `<ellipse cx="${f(ix)}" cy="${f(iy)}" rx="${f(ir * .55 * pk)}" ry="${f(ir * .28 * pk)}" fill="#060302"/>`;
    else pupil = `<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir * (o.pupilR || .5) * pk)}" fill="#060302"/>`;
    const hy = mood === 'happy' ? .4 : mood === 'angry' ? .5 : mood === 'sad' ? .52 : .34;
    const sclera = wide ? (o.sclera || '#f2ebe2') : (o.dark || '#1c120c');
    return `<ellipse cx="${cx}" cy="${cy + r * .1}" rx="${r * 1.55}" ry="${r * 1.35}" fill="url(#rz-dark)" opacity="${o.socket ?? .45}"/>
    <svg x="${f(cx - r)}" y="${f(cy - r)}" width="${f(2 * r)}" height="${f(2 * r)}" viewBox="0 0 1 1" overflow="visible">
      <g clip-path="url(#rz-lid-${clip})">
        <rect width="1" height="1" fill="${sclera}"/>
        ${wide ? `<rect width="1" height="1" fill="url(#rz-dark)" opacity=".5"/>` : ''}
        <circle cx="${f(ix)}" cy="${f(iy)}" r="${ir}" fill="url(#rz-iris-${o.iris || 'brown'})"/>
        ${pupil}
        <path d="${lidPath(key, mir, true)}" fill="none" stroke="#120804" stroke-width=".3" opacity=".6" filter="url(#ub2)"/>
        <ellipse cx="${f(mir ? .62 : .38)}" cy="${hy}" rx=".13" ry=".09" fill="#fff" opacity=".95" transform="rotate(-20 ${mir ? .62 : .38} ${hy})"/>
        <circle cx="${f(mir ? .36 : .64)}" cy="${f(hy + .3)}" r=".045" fill="#fff" opacity=".55"/>
      </g>
      <path d="${lidPath(key, mir, false)}" fill="none" stroke="${o.rim || '#140a05'}" stroke-width="${o.rimW || .08}" opacity=".85" stroke-linejoin="round"/>
    </svg>`;
  }
  // бровь: мягкий пучок шерсти над глазом
  function brow(cx, cy, r, mood, side, color, op = .75, k = 1) {
    const s = side === 'L' ? 1 : -1;
    const dyo = { calm: 0, happy: -.2, worried: .28, sad: .3, angry: -.35, cook: -.05 }[mood] * r * k;
    const dyi = { calm: 0, happy: -.3, worried: -.8, sad: -.62, angry: .78, cook: .22 }[mood] * r * k;
    const y = cy - r * 1.5;
    const xo = cx - s * r * 1.05, xi = cx + s * r * .95;
    const bend = (mood === 'happy' ? 2.2 : mood === 'worried' ? -1 : .8) * r * .18 * -s;
    return `<path d="${lens(xi, y + dyi, xo, y + dyo, r * .55, bend)}" fill="${color}" opacity="${op}" filter="url(#b04)"/>`;
  }
  function sweat(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx=".5" cy="9" rx="4" ry="1.4" fill="url(#rz-dark)" opacity=".35"/>
      <path d="M0 -7C1.2 -3.6 4.6 .4 4.6 3.6C4.6 6.4 2.6 8.4 0 8.4C-2.6 8.4 -4.6 6.4 -4.6 3.6C-4.6 .4 -1.2 -3.6 0 -7Z" fill="url(#rz-drop)"/>
      <path d="M-2.6 2.4C-2.6 .8 -1.6 -1.2 -.6 -2.6" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".95"/>
      <ellipse cx="1.6" cy="6" rx="1.6" ry=".8" fill="#fff" opacity=".5"/></g>`;
  }
  // рот «морды»: под носом — фильтрум и губы
  function snoutMouth(x, y, w, mood, o = {}) {
    const c = o.color || '#2a120a';
    const ph = `<path d="M${x} ${y - (o.ph || 6)}Q${x + .3} ${y - 2} ${x} ${y}" fill="none" stroke="${c}" stroke-width="1.3" opacity=".6"/>`;
    if (mood === 'happy') {
      const d = w * .5;
      return `${ph}<path d="M${x - w} ${y - 2}C${x - w * .6} ${y + 1} ${x + w * .6} ${y + 1} ${x + w} ${y - 2}C${x + w * .7} ${y + d * 1.3} ${x + w * .3} ${y + d * 1.9} ${x} ${y + d * 1.9}C${x - w * .3} ${y + d * 1.9} ${x - w * .7} ${y + d * 1.3} ${x - w} ${y - 2}Z" fill="url(#rz-mouth)"/>
        ${o.tongue !== false ? `<path d="M${x - w * .5} ${y + d * .9}C${x - w * .45} ${y + d * (o.tongueOut ? 3.1 : 2)} ${x + w * .45} ${y + d * (o.tongueOut ? 3.1 : 2)} ${x + w * .5} ${y + d * .9}C${x + w * .2} ${y + d * .6} ${x - w * .2} ${y + d * .6} ${x - w * .5} ${y + d * .9}Z" fill="url(#rz-tongue)"/><path d="M${x} ${y + d * 1}L${x} ${y + d * (o.tongueOut ? 2.6 : 1.7)}" stroke="#a83a4a" stroke-width=".8" opacity=".6"/>` : ''}
        ${o.incisors ? `<path d="M${x - 3.2} ${y - .6}L${x + 3.2} ${y - .6}L${x + 3} ${y + 4.4}L${x - 3} ${y + 4.4}Z" fill="url(#rz-teeth)"/><path d="M${x} ${y - .5}L${x} ${y + 4.3}" stroke="#a8987a" stroke-width=".5"/>` : ''}
        <path d="M${x - w - 1} ${y - 3.5}Q${x - w} ${y - 1.5} ${x - w + 1} ${y - 1}M${x + w + 1} ${y - 3.5}Q${x + w} ${y - 1.5} ${x + w - 1} ${y - 1}" fill="none" stroke="${c}" stroke-width="1.1" opacity=".55" stroke-linecap="round"/>`;
    }
    if (mood === 'angry') {
      const teeth = o.fangs ? `<path d="M${x - w * .7} ${y + 1}L${x + w * .7} ${y + 1}L${x + w * .66} ${y + 3.4}L${x - w * .66} ${y + 3.4}Z" fill="url(#rz-teeth)"/>
        <path d="M${x - w * .62} ${y + 1}L${x - w * .5} ${y + 6.2}L${x - w * .38} ${y + 1}ZM${x + w * .62} ${y + 1}L${x + w * .5} ${y + 6.2}L${x + w * .38} ${y + 1}Z" fill="url(#rz-teeth)"/>` : o.incisors ? `<path d="M${x - 3} ${y + .6}L${x + 3} ${y + .6}L${x + 2.8} ${y + 4.6}L${x - 2.8} ${y + 4.6}Z" fill="url(#rz-teeth)"/>` : '';
      return `${ph}<path d="M${x - w} ${y + 5}C${x - w * .6} ${y - 1} ${x + w * .6} ${y - 1} ${x + w} ${y + 5}C${x + w * .6} ${y + 6.5} ${x - w * .6} ${y + 6.5} ${x - w} ${y + 5}Z" fill="url(#rz-mouth)"/>${teeth}
        <path d="M${x - w - 1.5} ${y + 7}C${x - w * .6} ${y - 1.5} ${x + w * .6} ${y - 1.5} ${x + w + 1.5} ${y + 7}" fill="none" stroke="${c}" stroke-width="1.4" opacity=".7" stroke-linecap="round"/>`;
    }
    if (mood === 'worried') return `${ph}<path d="M${x - w * .8} ${y + 3}C${x - w * .5} ${y + .5} ${x - w * .2} ${y + 2.6} ${x} ${y + 1.4}C${x + w * .2} ${y + .4} ${x + w * .5} ${y + 2.6} ${x + w * .8} ${y + 3}" fill="none" stroke="${c}" stroke-width="1.3" opacity=".7" stroke-linecap="round"/>`;
    if (mood === 'sad') return `${ph}<path d="M${x - w * .8} ${y + 4}C${x - w * .4} ${y} ${x + w * .4} ${y} ${x + w * .8} ${y + 4}" fill="none" stroke="${c}" stroke-width="1.3" opacity=".7" stroke-linecap="round"/>`;
    return `${ph}<path d="M${x} ${y}C${x - w * .3} ${y + 2.6} ${x - w * .75} ${y + 2.8} ${x - w} ${y + .8}M${x} ${y}C${x + w * .3} ${y + 2.6} ${x + w * .75} ${y + 2.8} ${x + w} ${y + .8}" fill="none" stroke="${c}" stroke-width="1.25" opacity=".7" stroke-linecap="round"/>`;
  }
  function whiskers(x, y, side, len, n = 4, col = '#fbf7f0', spread = 7) {
    const s = side === 'L' ? -1 : 1; let o = '';
    for (let i = 0; i < n; i++) {
      const yy = y + i * 2.4, ex = x + s * len * (1 - i * .06), ey = yy - spread + i * spread * .8;
      const d = `M${x} ${yy}Q${f(x + s * len * .5)} ${f(yy - 2 + i * .3)} ${f(ex)} ${f(ey)}`;
      o += `<path d="${d}" fill="none" stroke="#2a1a10" stroke-width=".9" opacity=".22" transform="translate(0 .7)"/><path d="${d}" fill="none" stroke="${col}" stroke-width=".65" opacity=".9" stroke-linecap="round"/>`;
    }
    return o;
  }
  const blush = (pts, r, mood) => mood === 'happy' ? pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .7}" fill="url(#rz-blush)" opacity=".55"/>`).join('')
    : mood === 'angry' ? pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.2}" ry="${r * .8}" fill="url(#rz-flush)" opacity=".5"/>`).join('') : '';
  const furrow = (x, y, mood, c = '#2a1408') => mood === 'angry'
    ? `<path d="M${x - 3} ${y - 5}Q${x - 2} ${y} ${x - 2.6} ${y + 4}M${x + 3} ${y - 5}Q${x + 2} ${y} ${x + 2.6} ${y + 4}" fill="none" stroke="${c}" stroke-width="1.4" opacity=".35" stroke-linecap="round" filter="url(#b04)"/>`
    : mood === 'worried' ? `<path d="M${x - 8} ${y - 6}Q${x} ${y - 9} ${x + 8} ${y - 6}M${x - 6} ${y - 1}Q${x} ${y - 3.5} ${x + 6} ${y - 1}" fill="none" stroke="${c}" stroke-width="1.2" opacity=".28" stroke-linecap="round" filter="url(#b04)"/>` : '';

  // =====================================================================
  // КОТ-ПОВАР (viewBox 0 -14 200 214)
  // mood: 'happy' | 'calm' | 'sad' | 'cook'
  // =====================================================================
  function catSvg(mood = 'calm', size = 140) {
    const earRot = { happy: -3, calm: 0, cook: 3, sad: -34 }[mood];
    const ear = `<g transform="rotate(${earRot} 64 84)">
        ${P('M37 102C31 80 26 50 31 28C33 22 38 21 43 24C60 37 77 52 90 68Z', 'url(#c-ear)')}
        ${P('M45 92C41 74 38 52 40 36C53 46 67 57 79 70Z', 'url(#c-earin)')}
        <path d="M51 86C49 74 48 62 49 50M56 86C56 76 57 66 60 58M61 88C62 80 65 72 69 66" fill="none" stroke="#fff6e8" stroke-width=".9" opacity=".85" stroke-linecap="round"/>
      </g>`;
    const stripes = [
      lens(100, 60, 100, 88, 4.6), lens(91, 61, 93.5, 87, 3.8, -1), lens(109, 61, 106.5, 87, 3.8, 1),
      lens(82, 65, 86, 85, 3.2, -1), lens(118, 65, 114, 85, 3.2, 1),
      lens(64, 109, 37, 104, 3.4, -2), lens(66, 118, 38, 126, 3.2, 2), lens(136, 109, 163, 104, 3.4, 2), lens(134, 118, 162, 126, 3.2, -2),
      lens(54, 76, 40, 94, 3.2, 1.5), lens(146, 76, 160, 94, 3.2, -1.5), lens(60, 68, 50, 78, 2.6), lens(140, 68, 150, 78, 2.6),
      lens(62, 140, 52, 150, 2.6), lens(138, 140, 148, 150, 2.6),
    ].map(d => P(d, '#8a3a0c', ' opacity=".62"')).join('');
    const look = mood === 'cook' ? [.06, .06] : mood === 'sad' ? [0, .08] : [0, 0];
    const eo = { iris: 'green', pupil: 'slit', look, irisR: .48, rim: '#2a1206', rimW: .1, socket: .3 };
    const mouth = mood === 'happy'
      ? `<path d="M89.5 130C94 132.4 106 132.4 110.5 130C109 138 104.5 142.5 100 142.5C95.5 142.5 91 138 89.5 130Z" fill="url(#rz-mouth)"/>
         <path d="M93.6 136C95 141 97.8 142.6 100 142.6C102.2 142.6 105 141 106.4 136C104 137.6 96 137.6 93.6 136Z" fill="url(#rz-tongue)"/>
         <path d="M100 123.5Q100.3 127 100 130M88 128.5Q89 130 90 130.5M112 128.5Q111 130 110 130.5" fill="none" stroke="#5a2414" stroke-width="1.1" opacity=".6" stroke-linecap="round"/>`
      : mood === 'sad'
      ? `<path d="M100 123.5Q100.3 127 100 129.5M89 135C92 131 96 129.6 100 129.6C104 129.6 108 131 111 135" fill="none" stroke="#5a2414" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>`
      : `<path d="M100 123.5Q100.3 127 100 129M100 129C97 132 93 132.6 89.5 130.6M100 129C103 132 107 132.6 110.5 130.6" fill="none" stroke="#5a2414" stroke-width="1.2" opacity=".72" stroke-linecap="round"/>`;
    const spoon = mood === 'cook'
      ? `<g class="spoon">
          <path d="M150 151L181 73" stroke="#4a2a12" stroke-width="7.4" stroke-linecap="round" opacity=".35" transform="translate(1.5 1.5)"/>
          <path d="M150 151L181 73" stroke="url(#c-wood)" stroke-width="6.4" stroke-linecap="round"/>
          <path d="M148.6 149L179 72.6" stroke="#f2c08a" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
          <ellipse cx="184.5" cy="61" rx="9.5" ry="13.5" fill="url(#c-wood)" transform="rotate(22 184.5 61)"/>
          <ellipse cx="184.5" cy="60.5" rx="7" ry="10.5" fill="url(#c-spoon)" transform="rotate(22 184.5 60.5)"/>
          <ellipse cx="181.5" cy="56" rx="2" ry="4" fill="#fff" opacity=".35" transform="rotate(22 181.5 56)"/>
        </g>
        ${P('M128 200C131 182 139 167 145 158L163 163C161 175 160 187 162 200Z', 'url(#c-jacket)')}
        <path d="M143 159C150 156.5 158 158.5 164 163" fill="none" stroke="#9aa1a9" stroke-width="3" opacity=".45"/>
        <ellipse cx="153" cy="152" rx="12.5" ry="10.5" fill="url(#c-head)"/>
        <ellipse cx="150" cy="148" rx="6" ry="3.5" fill="#ffd9a0" opacity=".45"/>
        <path d="M146 147C148 145 151 144.4 154 145M147 151C150 149.6 154 149.6 157 151" fill="none" stroke="#8a3a0c" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>
        <path d="M146.5 160Q148.5 156.5 147.5 153M152.5 161.5Q154 157 153 153.5M158 160Q160 156.5 159.5 153" fill="none" stroke="#6a2a08" stroke-width="1" opacity=".55" stroke-linecap="round"/>`
      : '';
    return `<svg viewBox="0 -14 200 214" width="${size}" height="${f(size * 214 / 200)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Кот-повар">
    <!-- китель -->
    ${P('M22 200C24 176 40 162 66 156C78 153 122 153 134 156C160 162 176 176 178 200Z', 'url(#c-jacket)')}
    <ellipse cx="100" cy="158" rx="50" ry="13" fill="url(#rz-dark)" opacity=".55"/>
    ${P(lens(60, 172, 66, 200, 5, 1), '#8f98a2', ' opacity=".28"')}${P(lens(140, 172, 134, 200, 5, -1), '#8f98a2', ' opacity=".28"')}
    <path d="M102 160C104 172 108 186 112 200" fill="none" stroke="#9aa2ab" stroke-width="2.4" opacity=".55"/>
    <path d="M100.6 160C102.6 172 106.6 186 110.6 200" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
    ${[[86, 176], [86, 192], [124, 176], [124, 192]].map(([x, y]) => `<ellipse cx="${x + .6}" cy="${y + 1.4}" rx="3.8" ry="2.6" fill="url(#rz-dark)" opacity=".6"/><circle cx="${x}" cy="${y}" r="3.3" fill="url(#c-btn)"/>`).join('')}
    ${P('M68 157C80 150 120 150 132 157C128 164 72 164 68 157Z', '#eef0f2')}
    <path d="M70 158C84 162 116 162 130 158" fill="none" stroke="#a9b0b8" stroke-width="1.4" opacity=".7"/>
    <!-- платок -->
    ${P('M86 157C90 168 95 178 100 186C105 178 110 168 114 157Z', 'url(#c-scarf)')}
    <path d="M92 164C95 172 98 178 100 182M108 164C105 172 102 178 100 182" fill="none" stroke="#ff9a80" stroke-width="1" opacity=".35"/>
    <ellipse cx="100" cy="160" rx="8" ry="5.4" fill="url(#c-scarf)"/><ellipse cx="98" cy="158.4" rx="3" ry="1.4" fill="#ff9a80" opacity=".45"/>
    <!-- уши -->
    <g filter="url(#rz-fur)">${ear}<g transform="translate(200 0) scale(-1 1)">${ear}</g></g>
    <!-- голова -->
    <g filter="url(#rz-fur)">
      ${P('M100 58C136 58 160 76 166 102C170 115 174 123 169 129C172 136 163 141 159 146C151 157 130 164 100 164C70 164 49 157 41 146C37 141 28 136 31 129C26 123 30 115 34 102C40 76 64 58 100 58Z', 'url(#c-head)')}
      ${stripes}
      <ellipse cx="78" cy="104" rx="19" ry="14" fill="url(#c-cream)"/><ellipse cx="122" cy="104" rx="19" ry="14" fill="url(#c-cream)"/>
      ${P(lens(100, 92, 100, 120, 9), '#fde3b8', ' opacity=".55"')}
      <ellipse cx="88.5" cy="128" rx="14.5" ry="11.5" fill="url(#c-muzzle)"/><ellipse cx="111.5" cy="128" rx="14.5" ry="11.5" fill="url(#c-muzzle)"/>
      <ellipse cx="100" cy="146" rx="15" ry="10" fill="url(#c-muzzle)"/>
      <ellipse cx="62" cy="128" rx="14" ry="10" fill="url(#rz-warm)" opacity=".5"/><ellipse cx="138" cy="128" rx="14" ry="10" fill="url(#rz-warm)" opacity=".5"/>
    </g>
    ${[[82, 125], [85, 129], [80, 131], [118, 125], [115, 129], [120, 131]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".75" fill="#7a4a2a" opacity=".55"/>`).join('')}
    <!-- глаза -->
    <g transform="rotate(7 78 105)">${eye(78, 105, 13.6, mood, 'L', eo)}</g>
    <g transform="rotate(-7 122 105)">${eye(122, 105, 13.6, mood, 'R', eo)}</g>
    ${brow(78, 104, 13, mood, 'L', '#7a320a', .38, .8)}${brow(122, 104, 13, mood, 'R', '#7a320a', .38, .8)}
    <!-- нос и рот -->
    <path d="M94 104C96 110 104 110 106 104" fill="none" stroke="#c46a2a" stroke-width="3" opacity=".3"/>
    ${P('M92 115C92 111.4 108 111.4 108 115C108 118.6 103 122.6 100 123.6C97 122.6 92 118.6 92 115Z', 'url(#c-nose)')}
    <ellipse cx="97" cy="114.2" rx="3.2" ry="1.2" fill="#fff" opacity=".55"/>
    <path d="M94.5 117.6Q96 118.6 97.4 118M105.5 117.6Q104 118.6 102.6 118" fill="none" stroke="#7a3428" stroke-width=".9" opacity=".7"/>
    ${mouth}
    <!-- усы -->
    ${whiskers(84, 127, 'L', 50, 4, '#fffaf2', 8)}${whiskers(116, 127, 'R', 50, 4, '#fffaf2', 8)}
    <path d="M70 92Q64 84 58 76M74 90Q70 82 67 74M130 92Q136 84 142 76M126 90Q130 82 133 74" fill="none" stroke="#fffaf2" stroke-width=".55" opacity=".8" stroke-linecap="round"/>
    <!-- колпак -->
    <ellipse cx="100" cy="62" rx="33" ry="6" fill="url(#rz-dark)" opacity=".8"/>
    ${P('M70 33C70 31 130 31 130 33L129 58C129 61.5 71 61.5 71 58Z', 'url(#c-band)')}
    <path d="M72 57C84 60.6 116 60.6 128 57" fill="none" stroke="#9aa2ab" stroke-width="1.6" opacity=".7"/>
    <path d="M77 35V58M87 35V59.5M97 35V60M107 35V60M117 35V59.5M125 35V58" stroke="#aeb5bd" stroke-width=".5" opacity=".5"/>
    ${P('M72 36C54 36 49 15 63 7C63 -5 81 -13 92 -5C97 -12 110 -12 115 -5C125 -11 141 -5 138 7C152 13 147 36 128 36Z', 'url(#c-puff)')}
    ${P(lens(80, 35, 75, 6, 4.2, -1), '#8e98a3', ' opacity=".32"')}${P(lens(93, 35, 91, -4, 4.2, -.5), '#8e98a3', ' opacity=".3"')}
    ${P(lens(108, 35, 110, -4, 4.2, .5), '#8e98a3', ' opacity=".3"')}${P(lens(121, 35, 126, 6, 4.2, 1), '#8e98a3', ' opacity=".32"')}
    ${P(lens(86, 33, 83, 3, 3), '#fff', ' opacity=".9"')}${P(lens(100, 33, 100, -6, 3), '#fff', ' opacity=".9"')}${P(lens(114, 33, 117, 3, 3), '#fff', ' opacity=".7"')}
    <ellipse cx="100" cy="36" rx="30" ry="3.2" fill="url(#rz-dark)" opacity=".55"/>
    ${spoon}
  </svg>`;
  }

  // =====================================================================
  // ГОСТИ (viewBox 0 0 180 160)
  // mood: 'happy' | 'calm' | 'worried' | 'angry'
  // =====================================================================
  const GUESTS = [
    { id: 'dog', name: 'Пёс Бублик', fur: '#c89060', ear: 'floppy', snout: '#f1d7b8' },
    { id: 'mouse', name: 'Мышка Пипа', fur: '#a9a9b8', ear: 'round', snout: '#e7e2ef' },
    { id: 'bunny', name: 'Зайка Ушастик', fur: '#f2eee8', ear: 'long', snout: '#ffffff' },
    { id: 'bear', name: 'Мишка Тоша', fur: '#8a5a3b', ear: 'small', snout: '#d6ae86' },
    { id: 'fox', name: 'Лиса Рыжуля', fur: '#ff8a3d', ear: 'pointy', snout: '#fff3e6' },
    { id: 'pig', name: 'Хрюша Пончик', fur: '#ffb3c1', ear: 'pointy', snout: '#ff8fa3' },
    { id: 'frog', name: 'Лягушка Ква', fur: '#7cc45a', ear: 'eyes', snout: '#b6e39a' },
  ];
  const mirror = (s) => `<g transform="translate(180 0) scale(-1 1)">${s}</g>`;
  const pair = (fn) => fn('L') + mirror(fn('R'));
  const bigNose = (x, y, w, h) => `${P(`M${x - w} ${y - h * .2}C${x - w} ${y - h} ${x + w} ${y - h} ${x + w} ${y - h * .2}C${x + w} ${y + h * .5} ${x + w * .3} ${y + h} ${x} ${y + h}C${x - w * .3} ${y + h} ${x - w} ${y + h * .5} ${x - w} ${y - h * .2}Z`, 'url(#rz-nose)')}
      <path d="M${x - w * .72} ${y + h * .05}C${x - w * .5} ${y - h * .25} ${x - w * .25} ${y - h * .1} ${x - w * .2} ${y + h * .3}C${x - w * .4} ${y + h * .35} ${x - w * .6} ${y + h * .3} ${x - w * .72} ${y + h * .05}ZM${x + w * .72} ${y + h * .05}C${x + w * .5} ${y - h * .25} ${x + w * .25} ${y - h * .1} ${x + w * .2} ${y + h * .3}C${x + w * .4} ${y + h * .35} ${x + w * .6} ${y + h * .3} ${x + w * .72} ${y + h * .05}Z" fill="#000" opacity=".85"/>
      <ellipse cx="${x - w * .15}" cy="${y - h * .55}" rx="${w * .45}" ry="${h * .2}" fill="#fff" opacity=".42"/><ellipse cx="${x - w * .25}" cy="${y - h * .6}" rx="${w * .15}" ry="${h * .08}" fill="#fff" opacity=".8"/>`;

  const G = {
    dog(m) {
      const er = { happy: -8, calm: 0, worried: 12, angry: 18 }[m];
      const ear = (s) => `<g transform="rotate(${er} 56 48)">${P('M58 42C40 38 22 52 19 76C16 98 22 118 34 123C43 126 47 113 49 98C51 82 56 62 64 50Z', 'url(#g-dog-ear)')}
        <path d="M40 60C34 76 32 96 36 114" fill="none" stroke="#3a1e0a" stroke-width="2" opacity=".3"/></g>`;
      return `<g filter="url(#rz-fur)">
        ${P('M90 24C123 24 145 45 147 76C149 103 136 124 118 134C106 140 74 140 62 134C44 124 31 103 33 76C35 45 57 24 90 24Z', 'url(#g-dog)')}
        ${P(lens(90, 28, 90, 94, 13), '#f6e2c6', ' opacity=".55"')}
        ${P('M90 82C111 82 125 94 125 111C125 127 109 140 90 140C71 140 55 127 55 111C55 94 69 82 90 82Z', 'url(#g-dog-muz)')}
        ${pair(ear)}</g>
        ${eye(67, 72, 9.8, m, 'L', { iris: 'brown' })}${eye(113, 72, 9.8, m, 'R', { iris: 'brown' })}
        ${brow(67, 72, 9.8, m, 'L', '#5a3412', .8)}${brow(113, 72, 9.8, m, 'R', '#5a3412', .8)}
        ${furrow(90, 64, m, '#4a2a10')}
        ${m === 'angry' ? `<path d="M80 86Q90 82 100 86M82 90Q90 87 98 90" fill="none" stroke="#7a5a3a" stroke-width="1.2" opacity=".55"/>` : ''}
        ${bigNose(90, 99, 12, 8)}
        ${snoutMouth(90, 116, 15, m, { fangs: true, tongueOut: true, ph: 8 })}
        ${[[72, 108], [76, 112], [70, 114], [108, 108], [104, 112], [110, 114]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#7a5a3a" opacity=".6"/>`).join('')}
        ${blush([[50, 98], [130, 98]], 10, m)}
        ${m === 'worried' ? sweat(140, 50, 1) : ''}`;
    },
    mouse(m) {
      const er = { happy: -6, calm: 0, worried: 14, angry: 24 }[m];
      const ear = () => `<g transform="rotate(${-er} 64 62)"><circle cx="40" cy="42" r="29" fill="url(#g-mouse)"/><circle cx="41" cy="44" r="23" fill="url(#rz-pinkin)"/>
        <path d="M44 62C40 52 38 42 40 30M41 50C34 46 28 44 24 44M42 42C46 36 50 32 56 30" fill="none" stroke="#b05a66" stroke-width=".8" opacity=".55"/>
        <ellipse cx="34" cy="34" rx="8" ry="5" fill="#fff" opacity=".25" transform="rotate(-30 34 34)"/></g>`;
      return `${ear()}${mirror(ear())}
        <g filter="url(#rz-fur)">
        ${P('M90 40C120 40 140 58 140 82C140 100 128 112 112 120C104 124 98 130 90 133C82 130 76 124 68 120C52 112 40 100 40 82C40 58 60 40 90 40Z', 'url(#g-mouse)')}
        <ellipse cx="90" cy="112" rx="21" ry="17" fill="url(#g-mouse-muz)"/>
        ${P(lens(90, 46, 90, 100, 9), '#6a5c52', ' opacity=".3"')}</g>
        ${eye(67, 82, 9.4, m, 'L', { iris: 'dark', socket: .35 })}${eye(113, 82, 9.4, m, 'R', { iris: 'dark', socket: .35 })}
        ${brow(67, 82, 9.4, m, 'L', '#3e322a', .7)}${brow(113, 82, 9.4, m, 'R', '#3e322a', .7)}
        ${furrow(90, 74, m, '#3a2e26')}
        <ellipse cx="90" cy="123" rx="6.5" ry="4.6" fill="url(#g-pig-snout)"/><ellipse cx="88" cy="121.4" rx="2.4" ry="1.2" fill="#fff" opacity=".6"/>
        ${snoutMouth(90, 132, 6.5, m, { incisors: true, tongue: false, ph: 4.5, color: '#3a2220' })}
        ${whiskers(80, 120, 'L', 54, 4, '#fbf7f0', 6)}${whiskers(100, 120, 'R', 54, 4, '#fbf7f0', 6)}
        ${blush([[56, 104], [124, 104]], 10, m)}
        ${m === 'worried' ? sweat(134, 62, .9) : ''}`;
    },
    bunny(m) {
      const er = { happy: [-4, 6], calm: [-10, 10], worried: [-28, 52], angry: [-64, 64] }[m];
      const ear = (a) => `<g transform="rotate(${a} 72 58)">${P('M64 62C54 44 48 20 54 5C60 -2 72 3 76 18C80 34 81 50 80 62Z', 'url(#g-bun)')}
        ${P('M66 56C59 42 56 24 59 12C64 9 69 16 71 26C73 38 74 48 74 56Z', 'url(#rz-pinkin)')}
        <path d="M68 50C66 40 64 30 64 20M66 34L62 28M69 42L66 38" fill="none" stroke="#c46a74" stroke-width=".7" opacity=".5"/></g>`;
      return `<g filter="url(#rz-fur)">${ear(er[0])}${mirror(ear(-er[1]))}
        ${P('M90 46C120 46 142 64 142 92C142 106 140 114 134 122C126 132 112 138 102 140C96 141 84 141 78 140C68 138 54 132 46 122C40 114 38 106 38 92C38 64 60 46 90 46Z', 'url(#g-bun)')}
        <ellipse cx="80" cy="112" rx="13" ry="11" fill="url(#g-white)"/><ellipse cx="100" cy="112" rx="13" ry="11" fill="url(#g-white)"/>
        <ellipse cx="90" cy="128" rx="11" ry="8" fill="url(#g-white)"/></g>
        ${eye(62, 88, 10, m, 'L', { iris: 'brown', socket: .25 })}${eye(118, 88, 10, m, 'R', { iris: 'brown', socket: .25 })}
        ${brow(62, 88, 10, m, 'L', '#8a7a6a', .7)}${brow(118, 88, 10, m, 'R', '#8a7a6a', .7)}
        ${furrow(90, 76, m, '#6a5a4a')}
        ${P('M84 103C84 99.5 96 99.5 96 103C96 106 92 108.4 90 109.4C88 108.4 84 106 84 103Z', 'url(#g-pig-snout)')}<ellipse cx="88" cy="102" rx="2.4" ry="1" fill="#fff" opacity=".6"/>
        ${snoutMouth(90, 116, 7, m, { incisors: true, tongue: false, ph: 6, color: '#5a3a36' })}
        ${whiskers(80, 113, 'L', 50, 3, '#fff', 5)}${whiskers(100, 113, 'R', 50, 3, '#fff', 5)}
        ${blush([[56, 112], [124, 112]], 10, m)}
        ${m === 'worried' ? sweat(136, 74, .95) : ''}`;
    },
    bear(m) {
      const er = { happy: -6, calm: 0, worried: 14, angry: 24 }[m];
      const ear = () => `<g transform="rotate(${-er} 60 52)"><circle cx="44" cy="40" r="19" fill="url(#g-bear)"/><circle cx="45" cy="42" r="11" fill="#3a2210"/><circle cx="45" cy="43" r="8" fill="url(#g-bear-muz)" opacity=".5"/></g>`;
      return `<g filter="url(#rz-fur)">${ear()}${mirror(ear())}
        ${P('M90 30C126 30 150 52 150 84C150 112 132 134 104 140C96 142 84 142 76 140C48 134 30 112 30 84C30 52 54 30 90 30Z', 'url(#g-bear)')}
        ${P('M90 88C110 88 122 98 122 112C122 128 106 138 90 138C74 138 58 128 58 112C58 98 70 88 90 88Z', 'url(#g-bear-muz)')}</g>
        ${eye(64, 78, 8.4, m, 'L', { iris: 'brown', socket: .5 })}${eye(116, 78, 8.4, m, 'R', { iris: 'brown', socket: .5 })}
        ${brow(64, 78, 8.4, m, 'L', '#2a1608', .8, 1.1)}${brow(116, 78, 8.4, m, 'R', '#2a1608', .8, 1.1)}
        ${furrow(90, 70, m, '#1a0c04')}
        ${bigNose(90, 102, 13, 8.5)}
        ${snoutMouth(90, 120, 14, m, { fangs: true, ph: 8, color: '#2a160a' })}
        ${blush([[52, 104], [128, 104]], 10, m)}
        ${m === 'worried' ? sweat(142, 60, 1) : ''}`;
    },
    fox(m) {
      const er = { happy: -4, calm: 0, worried: 22, angry: 36 }[m];
      const ear = () => `<g transform="rotate(${-er} 60 54)">${P('M42 64C37 42 38 18 45 5C58 13 71 30 78 46Z', 'url(#g-fox-ear)')}
        ${P('M48 58C45 42 46 26 50 16C58 24 66 36 71 47Z', '#f4ebe0', ' opacity=".9"')}
        <path d="M52 54C51 44 52 34 54 26M56 54C57 46 60 40 63 36" fill="none" stroke="#fff" stroke-width=".9" opacity=".9"/></g>`;
      return `<g filter="url(#rz-fur)">${ear()}${mirror(ear())}
        ${P('M90 30C116 30 136 44 144 66C150 84 147 99 137 108C125 118 108 124 99 136C95 141 85 141 81 136C72 124 55 118 43 108C33 99 30 84 36 66C44 44 64 30 90 30Z', 'url(#g-fox)')}
        ${P('M40 90C52 100 68 98 78 104C85 108 88 113 90 118C92 113 95 108 102 104C112 98 128 100 140 90C140 104 126 114 112 122C104 127 98 136 90 141C82 136 76 127 68 122C54 114 40 104 40 90Z', 'url(#g-white)')}
        ${P(lens(90, 34, 90, 70, 8), '#ffc07a', ' opacity=".5"')}</g>
        <path d="M74 80C76 90 80 98 84 106M106 80C104 90 100 98 96 106" fill="none" stroke="#4a1c08" stroke-width="2" opacity=".35" stroke-linecap="round" filter="url(#b04)"/>
        ${eye(66, 75, 9.2, m, 'L', { iris: 'amber', pupil: 'slit' })}${eye(114, 75, 9.2, m, 'R', { iris: 'amber', pupil: 'slit' })}
        ${brow(66, 75, 9.2, m, 'L', '#6a2408', .75)}${brow(114, 75, 9.2, m, 'R', '#6a2408', .75)}
        ${furrow(90, 66, m, '#5a1c06')}
        ${bigNose(90, 122, 7.5, 5)}
        ${snoutMouth(90, 132, 8, m, { fangs: true, ph: 5, color: '#2a120a' })}
        ${whiskers(80, 124, 'L', 46, 3, '#fff', 5)}${whiskers(100, 124, 'R', 46, 3, '#fff', 5)}
        ${blush([[56, 100], [124, 100]], 10, m)}
        ${m === 'worried' ? sweat(140, 58, .95) : ''}`;
    },
    pig(m) {
      const er = { happy: -8, calm: 0, worried: 14, angry: 22 }[m];
      const r = rand(13); let hairs = '';
      for (let i = 0; i < 40; i++) { const x = 40 + r() * 100, y = 44 + r() * 90; hairs += `<path d="M${f(x)} ${f(y)}l${f(r() * 2 - 1)} -2.2" stroke="#fff" stroke-width=".45" opacity=".55"/>`; }
      const ear = () => `<g transform="rotate(${-er} 62 50)">${P('M48 64C36 46 32 26 34 10C50 13 68 26 78 44Z', 'url(#g-pig)')}
        ${P('M50 56C42 44 40 30 41 18C52 22 63 32 70 44Z', 'url(#rz-pinkin)', ' opacity=".8"')}
        <path d="M48 50C46 40 45 30 46 22M52 44L46 38" fill="none" stroke="#c4606a" stroke-width=".7" opacity=".5"/></g>`;
      return `<g>
        ${P('M90 34C126 34 152 58 152 90C152 120 126 144 90 144C54 144 28 120 28 90C28 58 54 34 90 34Z', 'url(#g-pig)')}</g>
        ${ear()}${mirror(ear())}
        ${hairs}
        ${eye(64, 78, 7.8, m, 'L', { iris: 'brown', socket: .3, rim: '#5a2a26' })}${eye(116, 78, 7.8, m, 'R', { iris: 'brown', socket: .3, rim: '#5a2a26' })}
        <path d="M56 70Q58 66 60 68M60 69Q62 64 64 67M120 69Q118 64 116 67M124 70Q122 66 120 68" fill="none" stroke="#3a1a18" stroke-width=".7" stroke-linecap="round"/>
        ${brow(64, 78, 7.8, m, 'L', '#a8504c', .75, 1.2)}${brow(116, 78, 7.8, m, 'R', '#a8504c', .75, 1.2)}
        ${furrow(90, 70, m, '#a04848')}
        <ellipse cx="90" cy="110" rx="24" ry="17" fill="#c06a6a"/>
        <ellipse cx="90" cy="107" rx="23" ry="15.5" fill="url(#g-pig-snout)"/>
        <ellipse cx="81" cy="107" rx="3.6" ry="5.6" fill="url(#rz-nostril)"/><ellipse cx="99" cy="107" rx="3.6" ry="5.6" fill="url(#rz-nostril)"/>
        <ellipse cx="84" cy="98.5" rx="8" ry="2.4" fill="#fff" opacity=".45"/>
        ${snoutMouth(90, 132, 14, m, { tongue: true, ph: 3, color: '#6a2a28' })}
        ${blush([[50, 106], [130, 106]], 11, m)}
        ${m === 'worried' ? sweat(140, 64, 1) : ''}`;
    },
    frog(m) {
      const r = rand(17); let spots = '';
      for (let i = 0; i < 12; i++) { const x = 30 + r() * 120, y = 66 + r() * 34; spots += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2 + r() * 4)}" ry="${f(1.5 + r() * 3)}" fill="#2a5a14" opacity=".45"/>`; }
      const mouth = {
        calm: `<path d="M26 104C52 116 128 116 154 104" fill="none" stroke="#1d3a0c" stroke-width="1.8" opacity=".8" stroke-linecap="round"/><path d="M30 107C54 118 126 118 150 107" fill="none" stroke="#e8f0b8" stroke-width="1.2" opacity=".45"/>`,
        happy: `<path d="M24 96C46 128 134 128 156 96C134 120 46 120 24 96Z" fill="url(#rz-mouth)"/><path d="M60 117C70 121 110 121 120 117C110 123 70 123 60 117Z" fill="url(#rz-tongue)"/><path d="M28 100C50 126 130 126 152 100" fill="none" stroke="#e8f0b8" stroke-width="1.2" opacity=".5"/>`,
        worried: `<path d="M34 112C44 106 54 110 64 108C76 106 84 110 90 108C96 106 104 110 116 108C126 106 136 110 146 112" fill="none" stroke="#1d3a0c" stroke-width="1.8" opacity=".8" stroke-linecap="round"/>`,
        angry: `<path d="M30 116C52 98 128 98 150 116" fill="none" stroke="#1d3a0c" stroke-width="2.2" opacity=".85" stroke-linecap="round"/><path d="M34 119C56 103 124 103 146 119" fill="none" stroke="#e8f0b8" stroke-width="1.1" opacity=".4"/>`,
      }[m];
      const ridge = (s) => {
        const a = { calm: 0, happy: -8, worried: -16, angry: 18 }[m];
        return `<g transform="rotate(${a} 56 32)">${P(lens(40, 30, 72, 30, 6, 2), '#3e7a1e', ' opacity=".8"')}</g>`;
      };
      return `${shadow(90, 146, 62, 6, .5)}
        ${P('M90 52C130 52 162 72 164 100C166 124 140 140 90 140C40 140 14 124 16 100C18 72 50 52 90 52Z', 'url(#g-frog)')}
        <circle cx="56" cy="52" r="25" fill="url(#g-frog)"/><circle cx="124" cy="52" r="25" fill="url(#g-frog)"/>
        <ellipse cx="90" cy="128" rx="54" ry="13" fill="url(#g-frog-belly)"/>
        ${spots}
        ${eye(56, 50, 16, m, 'L', { iris: 'gold', pupil: 'hbar', irisR: .5, socket: .25, rim: '#2a4a12', rimW: .06 })}
        ${eye(124, 50, 16, m, 'R', { iris: 'gold', pupil: 'hbar', irisR: .5, socket: .25, rim: '#2a4a12', rimW: .06 })}
        ${ridge('L')}${mirror(ridge('R'))}
        <ellipse cx="82" cy="80" rx="1.8" ry="1.2" fill="#14280a"/><ellipse cx="98" cy="80" rx="1.8" ry="1.2" fill="#14280a"/>
        ${mouth}
        ${hl(70, 76, 14, 5, .5, -10)}${hl(118, 84, 10, 4, .35, 10)}${hl(48, 34, 6, 3.4, .55, -30)}${hl(116, 34, 6, 3.4, .5, -30)}
        ${blush([[40, 104], [140, 104]], 12, m)}
        ${m === 'worried' ? sweat(152, 74, 1) : ''}`;
    },
  };
  function guestSvg(g, mood = 'calm', size = 110) {
    return `<svg viewBox="0 0 180 160" width="${size}" height="${f(size * 160 / 180)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${g.name}" style="overflow:visible">
      ${g.id !== 'frog' ? shadow(90, 148, 54, 6, .45) : ''}
      ${G[g.id](mood)}
    </svg>`;
  }

  // =====================================================================
  // ПОСУДА (viewBox 0 0 300 200; содержимое кладётся на верхнюю кромку)
  // =====================================================================
  let LIQ = 0;
  const mix = (hex, t, to = 0) => { // t: 0..1 к чёрному (to=0) или к белому (to=255)
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (to - v) * t));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  };
  function potSvg(liquid = '#f6c35b') {
    const id = 'rz-soup-' + (++LIQ);
    const handle = `<path d="M46 66C30 63 12 66 10 75C8 84 26 88 46 85L46 79C30 80 21 79 21 75C21 71 30 70 46 72Z" fill="url(#p-handle)"/>
      <path d="M44 67C30 65 15 68 13 74" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>
      <circle cx="51" cy="69" r="3" fill="url(#p-rivet)"/><circle cx="51" cy="82" r="3" fill="url(#p-rivet)"/>`;
    return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style="overflow:visible">
    <defs>${RG(id, [.5, .62, .6, .46, .5], [[0, mix(liquid, .55, 255)], [.4, liquid], [.85, mix(liquid, .28)], [1, mix(liquid, .55)]])}</defs>
    <ellipse cx="150" cy="193" rx="132" ry="9" fill="url(#rz-sh)" opacity=".8"/>
    ${handle}<g transform="translate(300 0) scale(-1 1)">${handle}</g>
    ${P('M36 58L264 58L256 176C255 186 246 192 232 192L68 192C54 192 45 186 44 176Z', 'url(#p-steel)')}
    <g clip-path="url(#rz-c-pot)">
      <rect x="30" y="56" width="240" height="140" fill="url(#p-steel-v)"/>
      <rect x="30" y="56" width="240" height="140" fill="#000" filter="url(#rz-brushed)" opacity=".22"/>
      <rect x="96" y="64" width="13" height="120" fill="#fff" opacity=".55" filter="url(#b3)"/>
      <rect x="114" y="66" width="4" height="116" fill="#fff" opacity=".5" filter="url(#b15)"/>
      <ellipse cx="226" cy="120" rx="20" ry="58" fill="#ffb070" opacity=".18" filter="url(#b6)"/>
      <ellipse cx="150" cy="200" rx="140" ry="22" fill="#1a0c04" opacity=".35" filter="url(#b6)"/>
      <path d="M44 168C90 176 210 176 256 168" fill="none" stroke="#fff" stroke-width="1.4" opacity=".45"/>
      <path d="M44 171C90 179 210 179 256 171" fill="none" stroke="#1a2026" stroke-width="2" opacity=".3"/>
    </g>
    <path d="M30 57A120 18 0 0 0 270 57A120 18 0 0 0 30 57ZM38 57A112 13 0 0 1 262 57A112 13 0 0 1 38 57Z" fill="url(#p-rim)" fill-rule="evenodd"/>
    <ellipse cx="150" cy="57" rx="112" ry="13" fill="url(#p-inwall)"/>
    <ellipse cx="150" cy="60" rx="108" ry="10.5" fill="url(#${id})"/>
    <ellipse cx="150" cy="60" rx="108" ry="10.5" fill="none" stroke="${mix(liquid, .5)}" stroke-width="2" opacity=".5"/>
    <ellipse cx="120" cy="57" rx="46" ry="3.5" fill="#fff" opacity=".35" filter="url(#b3)"/>
    ${[[96, 62, 2.4], [178, 58, 1.8], [205, 63, 2.6], [136, 64, 1.5], [70, 60, 1.6], [228, 60, 1.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.4}" ry="${r * .55}" fill="${mix(liquid, .4, 255)}" opacity=".8"/><ellipse cx="${x - r * .4}" cy="${y - r * .2}" rx="${r * .5}" ry="${r * .2}" fill="#fff" opacity=".8"/>`).join('')}
    <path d="M40 54A112 13 0 0 1 150 44" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9" stroke-linecap="round"/>
    <path d="M190 45A112 13 0 0 1 258 52" fill="none" stroke="#fff" stroke-width="1" opacity=".6" stroke-linecap="round"/>
    <g class="bubbles"><circle cx="112" cy="60" r="4.5" fill="url(#rz-bubble)"/><circle cx="184" cy="62" r="3.6" fill="url(#rz-bubble)"/><circle cx="150" cy="58" r="2.8" fill="url(#rz-bubble)"/></g>
    <g class="steam" fill="none" stroke="#fff" stroke-linecap="round" filter="url(#rz-steam)">
      <path d="M110 50C100 36 120 26 110 10C104 0 112 -10 108 -20" stroke-width="12" opacity=".38"/>
      <path d="M160 52C170 38 150 28 162 12C168 2 160 -8 164 -18" stroke-width="14" opacity=".32"/>
      <path d="M205 50C198 40 212 30 204 18" stroke-width="10" opacity=".3"/>
    </g>
  </svg>`;
  }
  function bowlSvg() {
    return `<svg viewBox="0 0 300 200" width="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" style="overflow:visible">
    <ellipse cx="150" cy="190" rx="110" ry="8" fill="url(#rz-sh)" opacity=".85"/>
    <ellipse cx="150" cy="185" rx="44" ry="5" fill="#2e2620"/>
    <g filter="url(#rz-speck)">${P('M22 72C24 136 76 186 150 186C224 186 276 136 278 72Z', 'url(#b-out)')}</g>
    <g clip-path="url(#rz-c-bowl)">
      ${P('M22 72C24 136 76 186 150 186C224 186 276 136 278 72Z', 'url(#b-out-v)')}
      <path d="M58 92C66 130 92 160 126 172" fill="none" stroke="#fff" stroke-width="9" opacity=".32" filter="url(#b6)"/>
      <path d="M66 96C72 124 90 148 112 160" fill="none" stroke="#fff" stroke-width="2.2" opacity=".55" filter="url(#b08)"/>
      <path d="M236 100C228 130 206 154 180 166" fill="none" stroke="#ffcf9a" stroke-width="6" opacity=".18" filter="url(#b3)"/>
    </g>
    <path d="M20 72A130 21 0 0 0 280 72A130 21 0 0 0 20 72ZM27 72A123 17 0 0 1 273 72A123 17 0 0 1 27 72Z" fill="url(#b-rim)" fill-rule="evenodd"/>
    <ellipse cx="150" cy="72" rx="123" ry="17" fill="url(#b-in)"/>
    <ellipse cx="150" cy="66" rx="116" ry="9" fill="url(#rz-dark)" opacity=".35"/>
    <path d="M32 68A123 17 0 0 1 140 55.5" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9" stroke-linecap="round"/>
    <path d="M190 88A123 17 0 0 0 262 78" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>
  </svg>`;
  }

  // =====================================================================
  // ИКОНКИ
  // =====================================================================
  const ICON = {
    heart: (on = true) => `<svg viewBox="0 0 24 24" width="24" height="24" style="overflow:visible"><ellipse cx="12" cy="21.6" rx="6" ry="1.2" fill="url(#rz-sh)" opacity="${on ? .6 : .3}"/><path d="M12 21C4 14.4 2 11 2 7.6C2 5 4 3 6.6 3C8.6 3 10.5 4.3 12 6.4C13.5 4.3 15.4 3 17.4 3C20 3 22 5 22 7.6C22 11 20 14.4 12 21Z" fill="url(#i-heart${on ? '' : '-off'})"/>${on ? `<ellipse cx="7.4" cy="7.2" rx="2.6" ry="1.6" fill="#fff" opacity=".75" transform="rotate(-35 7.4 7.2)"/><path d="M15 17C17.6 14.6 19.6 12.4 20.4 10" fill="none" stroke="#ff9a90" stroke-width=".9" opacity=".55" stroke-linecap="round"/>` : `<ellipse cx="7.4" cy="7.2" rx="2.4" ry="1.4" fill="#fff" opacity=".6" transform="rotate(-35 7.4 7.2)"/>`}</svg>`,
    coin: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="vertical-align:-5px;overflow:visible"><ellipse cx="12.6" cy="22.4" rx="7" ry="1.3" fill="url(#rz-sh)" opacity=".55"/><circle cx="12" cy="12" r="10.4" fill="url(#i-coin)"/><circle cx="12" cy="12" r="8.2" fill="url(#i-coin-face)"/>
      <g transform="translate(12 12.6)"><g fill="#8a5a0e" opacity=".55" transform="translate(.35 .35)"><ellipse cx="0" cy="1.6" rx="2.6" ry="2.1"/><circle cx="-2.7" cy="-1.6" r="1.05"/><circle cx="-.95" cy="-3" r="1.05"/><circle cx=".95" cy="-3" r="1.05"/><circle cx="2.7" cy="-1.6" r="1.05"/></g>
      <g fill="#ffe9a0"><ellipse cx="0" cy="1.6" rx="2.6" ry="2.1"/><circle cx="-2.7" cy="-1.6" r="1.05"/><circle cx="-.95" cy="-3" r="1.05"/><circle cx=".95" cy="-3" r="1.05"/><circle cx="2.7" cy="-1.6" r="1.05"/></g></g>
      <path d="M5 8.4A7.8 7.8 0 0 1 12 3.6" fill="none" stroke="#fff" stroke-width="1" opacity=".8" stroke-linecap="round"/></svg>`,
    ban: `<svg viewBox="0 0 100 100" width="100%" height="100%" style="position:absolute;inset:0;overflow:visible"><path d="M50 6A44 44 0 1 0 50.01 6ZM50 16A34 34 0 1 1 49.99 16Z" fill="#5a0606" opacity=".25" transform="translate(1.5 2.5)" fill-rule="evenodd"/><path d="M50 6A44 44 0 1 0 50.01 6ZM50 16A34 34 0 1 1 49.99 16Z" fill="url(#i-ban)" fill-rule="evenodd"/><path d="M23 30L30 23L77 70L70 77Z" fill="url(#i-ban)"/><path d="M18 34A36 36 0 0 1 40 10" fill="none" stroke="#fff" stroke-width="2.2" opacity=".55" stroke-linecap="round"/></svg>`,
    sound: (on) => `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9.2h3.6L12.4 5.2v13.6L7.6 14.8H4Z" fill="currentColor"/>${on
      ? `<path d="M15.6 8.6q2.6 3.4 0 6.8M18.2 6q4.6 6 0 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
      : `<path d="M16 9.4l5 5M21 9.4l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`}</svg>`,
    clock: `<svg viewBox="0 0 24 24" width="22" height="22" style="vertical-align:-5px"><circle cx="12" cy="13" r="8.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 8.4v4.8l3 2" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`,
  };

  return { FOOD, foodSvg, catSvg, GUESTS, guestSvg, potSvg, bowlSvg, ICON };
})();
const { FOOD, foodSvg, catSvg, GUESTS, guestSvg, potSvg, bowlSvg, ICON } = ART;
