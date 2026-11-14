// Elementos gráficos de la marca dibujados en SVG: atarraya, sello, favicon e iconos.

// La atarraya: red de lanzar del pescador del Magdalena.
// variante: 'abierta' (completa, nudos y plomos) | 'sencilla' (menos rayos, trazo grueso)
function atarraya({ variante = 'abierta', clase = '', dibujar = false, ficha = false } = {}) {
  const W = 400, H = 330, cx = W / 2, top = 8;
  const sencilla = variante === 'sencilla';
  const n = sencilla ? 14 : 30;
  const R = 290, abertura = 60 * Math.PI / 180;
  const anillos = sencilla ? [0.42, 0.62, 0.82, 1] : [0.18, 0.3, 0.42, 0.53, 0.64, 0.74, 0.84, 0.93, 1];
  const sw = sencilla ? 3 : 1.4;
  const pts = t => Array.from({ length: n + 1 }, (_, i) => {
    const a = -abertura + (2 * abertura * i) / n;
    return [cx + Math.sin(a) * R * t, top + Math.cos(a) * R * t * 0.98];
  });
  const f = v => v.toFixed(1);
  let rayos = '';
  for (const [x, y] of pts(1)) rayos += `<path class="rayo" stroke-width="${sw}" d="M${cx} ${top}L${f(x)} ${f(y)}"/>`;
  let anillo = '';
  for (const t of anillos) {
    const p = pts(t);
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i];
      d += `Q${f((x0 + x1) / 2)} ${f((y0 + y1) / 2 + 3 + t * 4)} ${f(x1)} ${f(y1)}`;
    }
    anillo += `<path class="anillo" stroke-width="${t === 1 ? sw * 1.5 : sw}" d="${d}"/>`;
  }
  let plomos = '';
  for (const [x, y] of pts(1)) plomos += `<ellipse class="plomo" cx="${f(x)}" cy="${f(y + (sencilla ? 9 : 7))}" rx="${sencilla ? 4 : 3.2}" ry="${sencilla ? 6 : 5}"/>`;
  let nudos = '';
  if (!sencilla) for (const t of anillos.slice(2, -1)) for (const [x, y] of pts(t).filter((_, i) => i % 3 === 0)) nudos += `<circle class="nudo" cx="${f(x)}" cy="${f(y)}" r="1.6"/>`;
  const fichaSvg = ficha ? `<g transform="translate(250 195) rotate(-8)"><rect width="56" height="72" rx="2" fill="#F2B33D"/></g>` : '';
  return `<svg class="atarraya ${dibujar ? 'atarraya--dibujar' : ''} ${clase}" viewBox="0 0 ${W} ${H + 12}" aria-hidden="true" focusable="false">${rayos}${anillo}${nudos}${plomos}${fichaSvg}</svg>`;
}

// Sello circular: H impresa + signo de inserción cañaguate + texto de archivo
function sello({ clase = 'sello', fondo = '#1E2747', tinta = '#F1E9D8', acento = '#F2B33D' } = {}) {
  const texto = 'HICIMOS LO QUE QUISIMOS · GACETA LITERARIA · UPC AGUACHICA · ';
  return `<svg class="${clase}" viewBox="0 0 200 200" role="img" aria-label="Sello de Hicimos lo que quisimos">
<defs><path id="circulo-sello" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs>
<circle cx="100" cy="100" r="98" fill="${fondo}"/>
<circle cx="100" cy="100" r="86" fill="none" stroke="${tinta}" stroke-width="1" stroke-dasharray="1 4"/>
<text font-family="IBM Plex Mono, monospace" font-size="11.2" letter-spacing="2.2" fill="${tinta}"><textPath href="#circulo-sello">${texto}</textPath></text>
<text x="100" y="122" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="84" fill="${tinta}">H</text>
<path d="M82 150 L100 132 L118 150" fill="none" stroke="${acento}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Favicon (sin texto circular, como dice el manual)
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1E2747"/><path fill="#F1E9D8" d="M17 13h11v2.2l-3 .6v12.4h14V15.8l-3-.6V13h11v2.2l-3 .6v27.4l3 .6V46H36v-2.2l3-.6V31.4H25v11.8l3 .6V46H17v-2.2l3-.6V15.8l-3-.6z"/><path d="M24 57 32 49 40 57" fill="none" stroke="#F2B33D" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Iconos de trazo de lápiz: retícula 24, trazo 1.5, extremos redondeados
const T = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${d}</svg>`;
const iconos = {
  buscar: T('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>'),
  menu: T('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  luna: T('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  sol: T('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  compartir: T('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>'),
  descarga: T('<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
  audio: T('<path d="M4 9.5h3l4.5-4v13l-4.5-4H4z"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11"/>'),
  video: T('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
  autor: T('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  ficha: T('<rect x="4.5" y="4" width="15" height="16" rx="1.5"/><path d="M8 9h8M8 12.5h8M8 16h5M10 4v-1.5h4V4"/>'),
  enmienda: T('<path d="m6 16 6-8 6 8"/>'),
  licencia: T('<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.5a3.5 3.5 0 1 0 0 5"/>'),
  correo: T('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>'),
  enlace: T('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  imprimir: T('<path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="6"/>'),
  calendario: T('<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>'),
  lugar: T('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  flecha: T('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  instagram: T('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>'),
  x: T('<path d="M4 4l16 16M20 4 4 20" />'),
  tiktok: T('<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.4 4.4 5 4.6"/>'),
  facebook: T('<path d="M14.5 8H17V4.5h-2.5A3.5 3.5 0 0 0 11 8v2.5H8.5V14H11v6.5h3.5V14H17l.5-3.5h-3V8z"/>'),
  youtube: T('<rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9.5 4.5 2.5-4.5 2.5z"/>'),
  whatsapp: T('<path d="M4 20l1.2-4A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.4-1.6-1-2-2l1-1-1-2z"/>'),
  spotify: T('<circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-1 6.5-.7 9 .8M8 12.5c2.5-.7 5.2-.4 7.3.8M8.5 15.3c2-.5 4-.3 5.6.6"/>'),
  web: T('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/>'),
  poesia: T('<path d="M5 6h10M5 10h12M5 14h8M5 18h10M17 4c2 1 2 3 0 4"/>'),
  narrativa: T('<path d="M3 5.5c3-1 6-1 9 1v13c-3-2-6-2-9-1zM21 5.5c-3-1-6-1-9 1v13c3-2 6-2 9-1z"/>'),
  cronica: T('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>'),
  oralitura: T('<path d="M4 12h1M7 8v8M10 5v14M13 9v6M16 7v10M19 11v2"/>'),
  taller: T('<path d="m14.5 5.5 4 4L9 19H5v-4z"/><path d="m12.5 7.5 4 4"/>'),
  archivo: T('<path d="M12 3 5 18M12 3l-3 15M12 3v15M12 3l3 15M12 3l7 15M5 18c4 2 10 2 14 0M7 12.5c3 1.2 7 1.2 10 0"/>'),
  hibrida: T('<path d="M4 7h7v7H4zM13 10h7v7h-7z"/><path d="M11 10.5h2"/>'),
  ensayo: T('<path d="M6 4h9l3 3v13H6z"/><path d="M15 4v3h3M9 11h6M9 14h6M9 17h4"/>'),
  convocatoria: T('<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>'),
};
const icono = (nombre, clase = '') => (iconos[nombre] || iconos.ficha).replace('<svg ', `<svg class="icono ${clase}" `);

module.exports = { atarraya, sello, favicon, icono, iconos };
