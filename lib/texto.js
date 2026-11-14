// Utilidades de texto: escape, slugs, fechas y un Markdown pequeño
// con la "gramática de la enmienda":
//   ~~debes~~        → palabra tachada con lápiz rojo
//   ^^quieras^^      → enmienda escrita a mano (con signo ‸)
//   ~~debes~~^^quieras^^ → las dos cosas juntas

const esc = (s = '') => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const slugify = (s = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizar = (s = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function aFecha(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v);
  // Fechas sin hora se interpretan en hora local de Colombia (evita correr un día)
  let d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) d = new Date(s + 'T12:00:00-05:00');
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) d = new Date(s + '-05:00');
  else d = new Date(s);
  return isNaN(d) ? null : d;
}
// Partes de la fecha en hora de Colombia (UTC−5, sin horario de verano)
function partes(v) {
  const d = aFecha(v); if (!d) return null;
  const c = new Date(d.getTime() - 5 * 3600 * 1000);
  return { a: c.getUTCFullYear(), m: c.getUTCMonth(), d: c.getUTCDate(), dia: c.getUTCDay(), h: c.getUTCHours(), min: c.getUTCMinutes() };
}
const pad = n => String(n).padStart(2, '0');
const fechaFicha = v => { const p = partes(v); return p ? `${pad(p.d)} · ${pad(p.m + 1)} · ${p.a}` : ''; };
const fechaLarga = v => { const p = partes(v); return p ? `${p.d} de ${MESES[p.m]} de ${p.a}` : ''; };
const fechaEvento = v => { const p = partes(v); return p ? `${DIAS[p.dia]} ${p.d} de ${MESES[p.m]}` : ''; };
const hora = v => {
  const p = partes(v); if (!p || (p.h === 12 && p.min === 0 && /^\d{4}-\d{2}-\d{2}$/.test(String(v)))) return '';
  const h12 = ((p.h + 11) % 12) + 1;
  return `${h12}:${pad(p.min)} ${p.h < 12 ? 'a. m.' : 'p. m.'}`;
};
const anio = v => { const p = partes(v); return p ? p.a : ''; };
const diaMes = v => { const p = partes(v); return p ? { dia: p.d, mes: MESES_CORTOS[p.m] } : { dia: '', mes: '' }; };

// ---------- Markdown en línea ----------
function enLinea(s, url = x => x) {
  let t = esc(s);
  const guard = [];
  const keep = html => { guard.push(html); return `\u0000${guard.length - 1}\u0000`; };
  t = t.replace(/`([^`]+)`/g, (_, c) => keep(`<code>${c}</code>`));
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src) => keep(`<img src="${esc(url(unesc(src)))}" alt="${alt}" loading="lazy" data-ampliar>`));
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
    const h = unesc(href); const ext = /^https?:/.test(h);
    return keep(`<a href="${esc(url(h))}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`);
  });
  t = t.replace(/~~(.+?)~~\^\^(.+?)\^\^/g, (_, a, b) => `<del class="tacha">${a}</del> <ins class="enmienda">${b}</ins>`);
  t = t.replace(/~~(.+?)~~/g, '<del class="tacha">$1</del>');
  t = t.replace(/\^\^(.+?)\^\^/g, '<ins class="enmienda">$1</ins>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
  t = t.replace(/(^|\W)_(?!\s)(.+?)_(?=\W|$)/g, '$1<em>$2</em>');
  t = t.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, (m) => /\u0000/.test(m) ? m : keep(`<a href="${m}" target="_blank" rel="noopener">${m}</a>`));
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => guard[+i]);
}
function unesc(s) { return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }

// ---------- Markdown de bloques ----------
function md(src = '', url = x => x) {
  if (!src) return '';
  const lineas = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = []; let i = 0;
  const esBlanco = l => /^\s*$/.test(l);
  while (i < lineas.length) {
    const l = lineas[i];
    if (esBlanco(l)) { i++; continue; }
    // HTML crudo (lo escribe el equipo editorial)
    if (/^\s*<(div|section|iframe|figure|table|p|aside|details|video|audio|blockquote|span|center|form|script|style)\b/i.test(l)) {
      const buf = []; while (i < lineas.length && !esBlanco(lineas[i])) buf.push(lineas[i++]);
      out.push(buf.join('\n')); continue;
    }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { const n = Math.min(m[1].length + 1, 4); out.push(`<h${n}>${enLinea(m[2], url)}</h${n}>`); i++; continue; }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s*>/.test(l)) {
      const buf = []; while (i < lineas.length && /^\s*>/.test(lineas[i])) buf.push(lineas[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${md(buf.join('\n'), url)}</blockquote>`); continue;
    }
    if (/^\s*([-*+])\s+/.test(l)) {
      const buf = []; while (i < lineas.length && /^\s*([-*+])\s+/.test(lineas[i])) buf.push(lineas[i++].replace(/^\s*[-*+]\s+/, ''));
      out.push(`<ul>${buf.map(x => `<li>${enLinea(x, url)}</li>`).join('')}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      const buf = []; while (i < lineas.length && /^\s*\d+[.)]\s+/.test(lineas[i])) buf.push(lineas[i++].replace(/^\s*\d+[.)]\s+/, ''));
      out.push(`<ol>${buf.map(x => `<li>${enLinea(x, url)}</li>`).join('')}</ol>`); continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lineas.length && /^\s*\|[\s:|-]+\|\s*$/.test(lineas[i + 1])) {
      const celdas = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const cab = celdas(l); i += 2; const filas = [];
      while (i < lineas.length && /^\s*\|.*\|\s*$/.test(lineas[i])) filas.push(celdas(lineas[i++]));
      out.push(`<table><thead><tr>${cab.map(c => `<th>${enLinea(c, url)}</th>`).join('')}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${enLinea(c, url)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    // Párrafo: los saltos de línea simples se respetan (texto literario)
    const buf = [];
    while (i < lineas.length && !esBlanco(lineas[i]) && !/^(#{1,4}\s|\s*>|\s*[-*+]\s|\s*\d+[.)]\s|\s*(---|\*\*\*)\s*$)/.test(lineas[i])) buf.push(lineas[i++]);
    if (!buf.length) { buf.push(lineas[i++]); }
    out.push(`<p>${buf.map(x => enLinea(x.replace(/\s+$/, ''), url)).join('<br>\n')}</p>`);
  }
  return out.join('\n');
}

// Verso: respeta sangrías, blancos y tachaduras del autor
function verso(src = '', url = x => x) {
  return String(src).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n').map(l => enLinea(l, url)).join('\n');
}

const resumen = (s = '', n = 160) => {
  const t = String(s).replace(/[#>*_`~^|]/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
};

module.exports = { esc, slugify, normalizar, md, enLinea, verso, resumen, aFecha, fechaFicha, fechaLarga, fechaEvento, hora, anio, diaMes, partes };
