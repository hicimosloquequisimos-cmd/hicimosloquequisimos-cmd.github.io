#!/usr/bin/env node
// =========================================================
//  Generador de la gaceta «Hicimos lo que quisimos»
//  Sin dependencias: solo necesita Node 18 o superior.
//
//  Uso:   node build.js            → genera el sitio en _site/
//         BASE=/repo node build.js → para sitios en una subcarpeta
// =========================================================
const fs = require('fs');
const path = require('path');
const { esc, slugify, normalizar, md, enLinea, verso, resumen, aFecha, fechaFicha, fechaLarga, fechaEvento, hora, anio, diaMes } = require('./lib/texto');
const { atarraya, sello, favicon, icono } = require('./lib/graficos');
const { bloques, colorCss, video, audio } = require('./lib/bloques');
const panel = require('./lib/panel');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, process.env.SALIDA || '_site');
const BASE = (process.env.BASE || '').replace(/\/$/, '');
const INDEX_EXPLICITO = process.env.INDEX_EXPLICITO === '1'; // para vistas previas sin servidor
const REPO = process.env.GITHUB_REPOSITORY || process.env.REPO || 'USUARIO/REPOSITORIO';
const RAMA = process.env.RAMA || 'main';
const AHORA = new Date();

// ---------- Lectura de contenido ----------
const leerJSON = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.warn(`⚠ No se pudo leer ${path.relative(RAIZ, f)}: ${e.message}`); return null; } };
const leerCarpeta = dir => {
  const d = path.join(RAIZ, 'content', dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(f => f.endsWith('.json')).map(f => {
    const data = leerJSON(path.join(d, f)); if (!data) return null;
    return { ...data, slug: f.replace(/\.json$/, '') };
  }).filter(Boolean);
};
const ajuste = n => leerJSON(path.join(RAIZ, 'content', 'ajustes', `${n}.json`)) || {};

const sitio = { nombre: 'Hicimos lo que quisimos', correo: 'hicimosloquequisimos@gmail.com', ...ajuste('sitio') };
// Dirección completa del sitio: la de Ajustes, la que da GitHub Pages, o la deducida del repositorio
if (!sitio.url) {
  const [dueno] = REPO.split('/');
  sitio.url = process.env.SITE_URL || (dueno && dueno !== 'USUARIO' ? `https://${dueno.toLowerCase()}.github.io${BASE}` : '');
}
sitio.url = (sitio.url || '').replace(/\/$/, '');
const menu = ajuste('menu');
const inicio = ajuste('inicio');
const equipo = ajuste('equipo');
const archivoAj = ajuste('archivo');
const secciones = ajuste('secciones');
// Encabezado de una sección: lo del panel, o el texto de siempre si está vacío
const cabSeccion = (clave, def) => { const a = secciones[clave] || {}; const vacio = !a.titulo && !a.escrito && !a.sobretitulo && !a.bajada && !a.tachado; return vacio ? def : { sobretitulo: a.sobretitulo, titulo: a.titulo, tachado: a.tachado, escrito: a.escrito, bajada: a.bajada }; };

// ---------- Enlaces ----------
const u = (p = '') => {
  if (!p) return '';
  if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(p)) return p;
  return BASE + (p.startsWith('/') ? p : '/' + p);
};
const link = (p = '/') => {
  let r = u(p);
  if (INDEX_EXPLICITO && !/^(https?:|mailto:|#)/.test(p)) {
    const [ruta, hash = ''] = r.split('#');
    r = (ruta.endsWith('/') ? ruta + 'index.html' : ruta) + (hash ? '#' + hash : '');
  }
  return r;
};
const href = p => (/^(https?:|mailto:|tel:|#)/.test(p || '') ? p : link(p));

const mailto = () => {
  const cuerpo = sitio.cuerpo_envio || '';
  return `mailto:${sitio.correo}?subject=${encodeURIComponent(sitio.asunto_envio || 'ENVÍO | GÉNERO | TÍTULO')}${cuerpo ? `&body=${encodeURIComponent(cuerpo)}` : ''}`;
};

// ---------- Datos derivados ----------
const colecciones = leerCarpeta('colecciones')
  .map(c => ({ ...c, colorCss: colorCss(c.color, c.color_libre) }))
  .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99) || a.nombre.localeCompare(b.nombre, 'es'));
const colPorSlug = Object.fromEntries(colecciones.map(c => [c.slug, c]));

const autores = leerCarpeta('autores').sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const autPorSlug = Object.fromEntries(autores.map(a => [a.slug, a]));
// Nombre que se muestra en obras y fichas: el seudónimo si lo hay
const publico = a => (a && (a.seudonimo || a.nombre)) || '';
// Integrantes del equipo que también publican: nombre del integrante → autor
const autorDeMiembro = n => autores.find(a => a.equipo && normalizar(a.equipo) === normalizar(n));
const idMiembro = n => 'equipo-' + slugify(n || '');

const todasObras = leerCarpeta('obras');
const obras = todasObras
  .filter(o => (o.estado || 'publicada') === 'publicada' && o.titulo)
  .map(o => ({ ...o, autores: [].concat(o.autores || []).filter(Boolean), _fecha: aFecha(o.fecha_publicacion) || new Date(0) }))
  .sort((a, b) => b._fecha - a._fecha || a.titulo.localeCompare(b.titulo, 'es'));
// Códigos automáticos para las fichas sin código (en orden de publicación)
{
  const usados = new Set(obras.map(o => o.codigo).filter(Boolean));
  let n = 1;
  for (const o of obras.slice().reverse()) {
    if (o.codigo) continue;
    while (usados.has(`HLQQ-${String(n).padStart(3, '0')}`)) n++;
    o.codigo = `HLQQ-${String(n).padStart(3, '0')}`; usados.add(o.codigo);
  }
}
for (const o of obras) {
  o.col = colPorSlug[o.coleccion] || { nombre: o.coleccion || 'Sin colección', slug: o.coleccion || '', colorCss: 'var(--grafito)' };
  o.nombresAutores = o.autores.map(s => publico(autPorSlug[s]) || s);
  o.nombresBusqueda = o.autores.map(s => [autPorSlug[s]?.nombre, autPorSlug[s]?.seudonimo].filter(Boolean).join(' '));
  if (o.autor_texto) o.nombresAutores.push(o.autor_texto);
  o.firma = o.nombresAutores.join(', ') || 'Anónimo';
  o.url = `/obra/${o.slug}/`;
  o.textoPlano = o.forma === 'prosa' ? (o.prosa || '') : (o.verso || o.prosa || '');
  o.extractoFinal = o.extracto || (o.forma === 'prosa' ? resumen(o.prosa, 150) : String(o.verso || '').split('\n').filter(l => l.trim()).slice(0, 2).map(l => l.trim()).join(' / ').replace(/~~|\^\^/g, ''));
}
for (const c of colecciones) c.total = obras.filter(o => o.coleccion === c.slug).length;

const agenda = leerCarpeta('agenda').filter(e => e.titulo).map(e => {
  const ini = aFecha(e.inicio), fin = aFecha(e.fin) || ini;
  return { ...e, _ini: ini, _fin: fin, pasado: fin ? fin < AHORA : false, url: `/agenda/${e.slug}/` };
}).sort((a, b) => (a.pasado - b.pasado) || (a.pasado ? b._ini - a._ini : a._ini - b._ini));

const bitacora = leerCarpeta('bitacora').filter(e => e.titulo && e.publicada !== false)
  .map(e => ({ ...e, _fecha: aFecha(e.fecha) || new Date(0), url: `/bitacora/${e.slug}/` }))
  .sort((a, b) => b._fecha - a._fecha);

const RESERVADAS = new Set(['archivo', 'obra', 'coleccion', 'autores', 'autor', 'agenda', 'bitacora', 'equipo-editorial', 'admin', 'assets', 'media', 'buscar', 'perfil', 'privacidad']);
const paginas = leerCarpeta('paginas').filter(p => p.titulo).map(p => {
  let s = slugify(p.url || p.slug) || p.slug;
  if (RESERVADAS.has(s)) { console.warn(`⚠ La página «${p.titulo}» usa una dirección reservada (/${s}/); se cambia a /p-${s}/`); s = 'p-' + s; }
  return { ...p, ruta: s, url: `/${s}/` };
});

const municipios = new Set(obras.map(o => normalizar(o.municipio || '').trim()).filter(Boolean));
const autoresConObra = new Set(obras.flatMap(o => o.nombresAutores));
const estadisticas = { obras: obras.length, autores: autoresConObra.size, municipios: municipios.size, audios: obras.filter(o => o.audio || o.audio_url).length };

// ---------- Componentes ----------
function firmaEnlazada(o) {
  const partes = o.autores.map(sl => autPorSlug[sl] ? `<a href="${link(`/autor/${sl}/`)}">${esc(publico(autPorSlug[sl]))}</a>` : esc(sl));
  if (o.autor_texto) partes.push(esc(o.autor_texto));
  return partes.join(', ') || 'Anónimo';
}

function ficha(o, { imagen = false } = {}) {
  return `<article class="ficha" style="--col:${o.col.colorCss}" data-col="${esc(o.coleccion || '')}" data-mun="${esc(normalizar(o.municipio || ''))}" data-anio="${anio(o.fecha_publicacion)}" data-texto="${esc(normalizar([o.titulo, o.firma, ...(o.nombresBusqueda || []), o.municipio, o.col.nombre, o.codigo, o.procedencia, o.extractoFinal, ...(o.etiquetas || []).map(e => e.etiqueta || e)].join(' ')))}" data-cuerpo="${esc(normalizar(String(o.textoPlano || '').replace(/~~|\^\^|[#>*_`|]/g, ' ').replace(/\s+/g, ' ')).slice(0, 6000))}" data-autor="${esc(normalizar(o.firma))}" data-codigo="${numCodigo(o)}" data-fecha="${o._fecha.toISOString()}" data-titulo="${esc(normalizar(o.titulo))}">
    ${o.destacada ? '<span class="sello-destacada">Destacada</span>' : ''}
    <div class="ficha__cabeza"><span class="ficha__col">${esc(o.col.nombre)}</span><span>${esc(o.codigo)}</span></div>
    ${imagen && o.portada ? `<div class="ficha__imagen"><img src="${esc(u(o.portada))}" alt="" loading="lazy"></div>` : ''}
    <h3><a class="ficha__enlace" href="${link(o.url)}">${enLinea(o.titulo)}</a></h3>
    ${o.extractoFinal ? `<p>${esc(o.extractoFinal)}</p>` : ''}
    ${o.ejemplo ? '<span class="ficha__ejemplo">‸ obra de ejemplo</span>' : ''}
    <div class="ficha__pie"><span class="ficha__autor">${firmaEnlazada(o)}</span><span>${[o.municipio, anio(o.fecha_publicacion)].filter(Boolean).map(esc).join(' · ')}</span></div>
  </article>`;
}

function cajaAutor(a) {
  const n = obras.filter(o => o.autores.includes(a.slug)).length;
  return `<aside class="caja-autor">
    <a class="persona__foto" href="${link(`/autor/${a.slug}/`)}" tabindex="-1" aria-hidden="true">${a.foto ? `<img src="${esc(u(a.foto))}" alt="" loading="lazy">` : '<span class="h">H</span>'}</a>
    <div>
      <span class="meta">Quien escribe</span>
      <h3><a href="${link(`/autor/${a.slug}/`)}">${esc(publico(a))}</a></h3>
      ${a.perfil || a.municipio ? `<p class="meta caja-autor__perfil">${[a.perfil, a.municipio].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
      ${a.bio ? `<p>${esc(resumen(a.bio, 220))}</p>` : ''}
      <a class="boton boton--chico" href="${link(`/autor/${a.slug}/`)}">${icono('autor')} Ver perfil${n > 1 ? ` y sus ${n} obras` : ''}</a>
    </div>
  </aside>`;
}

function persona(p, enlace) {
  const tag = enlace || p.enlace ? 'a' : 'div';
  const h = enlace || (p.enlace ? href(p.enlace) : '');
  return `<${tag} class="persona"${h ? ` href="${esc(h)}"` : ''}>
    <div class="persona__foto">${p.foto ? `<img src="${esc(u(p.foto))}" alt="" loading="lazy">` : '<span class="h" aria-hidden="true">H</span>'}</div>
    <h3>${esc(p.nombre || '')}</h3>${p.seudonimo ? `<span class="persona__seudonimo mano">${esc(p.seudonimo)}</span>` : ''}${p.rol || p.perfil ? `<span class="rol">${esc(p.rol || p.perfil)}</span>` : ''}${p.bio && !enlace ? `<p>${esc(p.bio)}</p>` : ''}
  </${tag}>`;
}

const TIPO_EVENTO = { convocatoria: ['Convocatoria', 'var(--rojo)'], taller: ['Taller', 'var(--buchon)'], lectura: ['Lectura pública', 'var(--canaguate)'], lanzamiento: ['Lanzamiento', 'var(--indigo)'], feria: ['Feria', 'var(--lodo)'], otro: ['Evento', 'var(--grafito)'] };
function evento(e) {
  const [tipo, col] = TIPO_EVENTO[e.tipo] || TIPO_EVENTO.otro;
  const dm = diaMes(e.inicio);
  const cierre = e.tipo === 'convocatoria' && e.fin ? `Recepción hasta el ${fechaLarga(e.fin)}` : [fechaEvento(e.inicio), hora(e.inicio)].filter(Boolean).join(' · ');
  return `<a class="evento ${e.pasado ? 'pasado' : ''}" href="${link(e.url)}" style="--col:${col}" data-fin="${e._fin ? e._fin.toISOString() : ''}">
    <div class="evento__fecha"><b>${dm.dia}</b>${dm.mes}</div>
    <div><span class="meta">${tipo}${e.pasado ? ' · ya pasó' : ''}${e.ejemplo ? ' · ejemplo' : ''}</span><h3>${esc(e.titulo)}</h3><p>${esc(cierre)}${e.lugar ? ` · ${esc(e.lugar)}` : ''}</p></div>
    <span class="boton boton--chico">Ver ${icono('flecha')}</span>
  </a>`;
}
function entrada(e) {
  return `<a class="entrada" href="${link(e.url)}">${e.portada ? `<div class="entrada__img"><img src="${esc(u(e.portada))}" alt="" loading="lazy"></div>` : `<div class="entrada__img fondo-indigo" style="display:grid;place-items:center;color:var(--canaguate)">${atarraya({ variante: 'sencilla' }).replace('class="atarraya', 'style="width:40%" class="atarraya')}</div>`}
    <span class="meta">${fechaLarga(e.fecha)}${e.autor ? ` · ${esc(e.autor)}` : ''}</span><h3>${esc(e.titulo)}</h3>${e.resumen ? `<p>${esc(e.resumen)}</p>` : ''}</a>`;
}

const RED_ICONO = { instagram: 'instagram', x: 'x', tiktok: 'tiktok', facebook: 'facebook', youtube: 'youtube', whatsapp: 'whatsapp', spotify: 'spotify', web: 'web' };
const redes = () => `<div class="redes">${(sitio.redes || []).filter(r => r.url).map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.red)} ${esc(r.usuario || '')}">${icono(RED_ICONO[r.red] || 'web')}</a>`).join('')}</div>`;

const numCodigo = o => { const m = String(o.codigo || '').match(/(\d+)/); return m ? +m[1] : 1e9; };
// Cada publicación cambia este número: así los navegadores bajan siempre la versión nueva del estilo y del código
const VERSION_ARCHIVOS = Date.now().toString(36);
const ctx = { numCodigo, u, link, href, mailto, firmaEnlazada, obras, colecciones, autores, agenda, bitacora, equipo, sitio, estadisticas, ficha, persona, evento, entrada, redes };

// ---------- Plantilla general ----------
function enlacesMenu() {
  const l = [...(menu.enlaces || [])];
  if (menu.incluir_paginas !== false) paginas.filter(p => p.en_menu).sort((a, b) => (a.orden_menu ?? 10) - (b.orden_menu ?? 10)).forEach(p => { if (!l.some(x => x.enlace === p.url)) l.push({ texto: p.titulo, enlace: p.url }); });
  return l;
}

function pagina({ titulo, descripcion, ruta, cuerpo, franja = '', imagen = '', tipo = 'website', clase = '' }) {
  const marca = sitio.marca || {};
  const vars = ['indigo', 'papel', 'rojo', 'canaguate'].filter(k => marca[k] && /^#[0-9a-f]{3,8}$/i.test(marca[k])).map(k => `--${k}:${marca[k]}`).join(';');
  const tituloCompleto = titulo ? `${titulo} · ${sitio.nombre}` : `${sitio.nombre} · ${sitio.descripcion || 'Gaceta literaria'}`;
  const desc = descripcion || sitio.descripcion || '';
  const urlAbs = (sitio.url || '').replace(/\/$/, '') + ruta;
  const img = imagen || sitio.imagen_compartir;
  const imgAbs = img ? (/^https?:/.test(img) ? img : (sitio.url || '').replace(/\/$/, '') + u(img)) : '';
  const actual = ruta;
  const aviso = sitio.aviso?.activo && sitio.aviso.texto ? `<div class="aviso aviso--${esc(sitio.aviso.color || 'canaguate')}">${enLinea(sitio.aviso.texto)}${sitio.aviso.enlace ? ` · <a href="${esc(href(sitio.aviso.enlace))}">${esc(sitio.aviso.texto_enlace || 'Ver más')}</a>` : ''}</div>` : '';
  const botonEnvio = menu.boton_texto !== '' ? `<a class="boton boton--envio boton--chico" href="${esc(menu.boton_enlace ? href(menu.boton_enlace) : mailto())}">${esc(menu.boton_texto || 'Envía tu creación')}</a>` : '';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(titulo || sitio.nombre)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="${esc(sitio.nombre)}">
<meta property="og:locale" content="es_CO">
${sitio.url ? `<meta property="og:url" content="${esc(urlAbs)}"><link rel="canonical" href="${esc(urlAbs)}">` : ''}
${imgAbs ? `<meta property="og:image" content="${esc(imgAbs)}"><meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta name="theme-color" content="#1E2747">
<link rel="icon" type="image/svg+xml" href="${u('/favicon.svg')}">
<link rel="alternate" type="application/rss+xml" title="${esc(sitio.nombre)}" href="${u('/feed.xml')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap">
<link rel="stylesheet" href="${u('/assets/css/gaceta.css')}?v=${VERSION_ARCHIVOS}">
${vars ? `<style>:root{${vars}}</style>` : ''}
<script>try{var t=localStorage.getItem('tema');if(t)document.documentElement.dataset.tema=t;}catch(e){}</script>
${sitio.codigo_cabecera || ''}
</head>
<body class="${clase}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
${aviso}
<header class="cabecera">
  <div class="contenedor cabecera__fila">
    <a class="logo ${marca.animar_logo !== false ? 'logo--anima' : ''}" href="${link('/')}" aria-label="${esc(sitio.nombre)}, ir al inicio">Hicimos <i>lo que</i> <span class="logo-tacha">debíamos</span><span class="logo-signo" aria-hidden="true">‸</span><span class="logo-mano" aria-hidden="true">quisimos</span></a>
    <nav class="nav" id="nav" aria-label="Principal">
      ${enlacesMenu().map(l => { const h = href(l.enlace || '/'); const act = l.enlace && l.enlace !== '/' && actual.startsWith(l.enlace) || l.enlace === actual; return `<a href="${esc(h)}"${act ? ' aria-current="page"' : ''}${/^https?:/.test(l.enlace || '') ? ' target="_blank" rel="noopener"' : ''}>${esc(l.texto)}</a>`; }).join('')}
      ${menu.boton_texto !== '' ? `<a class="boton boton--envio boton--chico nav__envio" href="${esc(menu.boton_enlace ? href(menu.boton_enlace) : mailto())}">${esc(menu.boton_texto || 'Envía tu creación')}</a>` : ''}
    </nav>
    ${botonEnvio}
    <div class="cuenta-lector" data-cuenta hidden></div>
    ${marca.modo_oscuro !== false ? `<button class="boton-icono" type="button" data-tema-boton aria-label="Cambiar entre modo claro y oscuro">${icono('luna')}</button>` : ''}
    <button class="boton-icono menu-movil" type="button" aria-controls="nav" aria-expanded="false" data-menu aria-label="Abrir menú">${icono('menu')}</button>
  </div>
</header>
${franja ? `<div class="franja" style="--franja:${franja}"></div>` : ''}
<main id="contenido">
${cuerpo}
</main>
<footer class="pie">
  <div class="contenedor">
    <div class="pie__grid">
      <div>
        <div style="display:flex;gap:1.5rem;align-items:center;margin-bottom:1.5rem">${sello()}<p class="pie__frase" style="margin:0">${esc(sitio.frase_pie || 'Lo que el río se lleva, la voz lo devuelve.')}</p></div>
        ${sitio.texto_pie ? `<p>${enLinea(sitio.texto_pie)}</p>` : ''}
        ${redes()}
      </div>
      <div>
        <h4>Recorre</h4>
        <ul>${[{ texto: 'Inicio', enlace: '/' }, ...enlacesMenu(), { texto: 'Agenda', enlace: '/agenda/' }, { texto: 'Bitácora', enlace: '/bitacora/' }].filter((x, i, a) => a.findIndex(y => y.enlace === x.enlace) === i).map(l => `<li><a href="${esc(href(l.enlace))}">${esc(l.texto)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>La gaceta</h4>
        ${(sitio.frases_pie || []).map(f => `<p style="margin:0 0 .4rem">${enLinea(f.frase || f)}</p>`).join('')}
        <p style="margin-top:1rem">${icono('correo', 'icono-inline')} <a href="mailto:${esc(sitio.correo)}">${esc(sitio.correo)}</a></p>
        <p class="meta" style="margin-top:1rem">${esc(sitio.licencia || '')}</p>
      </div>
    </div>
    <div class="pie__base"><span>${esc(sitio.nombre)} · ${esc(sitio.institucion || '')}</span><span>${AHORA.getFullYear()} · <a href="${u('/admin/')}">Panel del equipo</a></span></div>
  </div>
</footer>
<div class="visor" data-visor role="dialog" aria-modal="true" aria-label="Imagen ampliada"><button type="button" aria-label="Cerrar">✕</button><figure style="margin:0"><img alt=""><p></p></figure></div>
<div class="toast" data-toast role="status"></div>
<script src="${u('/assets/js/gaceta.js')}?v=${VERSION_ARCHIVOS}" defer></script>
<script src="${u('/assets/js/lectores-config.js')}?v=${VERSION_ARCHIVOS}" defer></script>
<script src="${u('/assets/js/lectores.js')}?v=${VERSION_ARCHIVOS}" defer></script>
</body>
</html>`;
}

function cabezaPagina({ sobretitulo, titulo, tachado, escrito, bajada, migas = [] }) {
  return `<header class="cabeza-pagina"><div class="contenedor">
    ${migas.length ? `<nav class="migas" aria-label="Migas">${migas.map(([t, h]) => h ? `<a href="${link(h)}">${esc(t)}</a>` : esc(t)).join('<span>‸</span>')}</nav>` : ''}
    ${sobretitulo ? `<p class="sobretitulo">${esc(sobretitulo)}</p>` : ''}
    <h1 class="titular-enmendado">${enLinea(titulo || '')}${tachado ? ` <span class="tacha">${esc(tachado)}</span>` : ''}${escrito ? `<span class="enmienda enmienda--sin-signo">${esc(escrito)}</span>` : ''}</h1>
    ${bajada ? `<p class="bajada">${enLinea(bajada)}</p>` : ''}
  </div></header>`;
}

// ---------- Política de privacidad (cuentas de lectores) ----------
function privacidad() {
  const correo = sitio.correo || 'hicimosloquequisimos@gmail.com';
  return `## Quiénes somos
**${sitio.nombre}**, gaceta literaria de la ${sitio.institucion || 'Licenciatura en Literatura y Lengua Castellana'} (Universidad Popular del Cesar, seccional Aguachica), es responsable del tratamiento de los datos de las cuentas de lectores. Contacto: [${correo}](mailto:${correo}).

## Qué datos guardamos
Cuando entras con tu cuenta de Google guardamos tu **nombre**, tu **correo electrónico** y tu **foto de perfil** de Google, y la fecha en que creaste la cuenta y la última vez que entraste. También guardamos **las obras que te gustan**, **los autores que sigues** y, si eres autor, **tu solicitud para vincular tu perfil**. Nunca recibimos ni guardamos tu contraseña de Google.

## Para qué los usamos
- Mostrar tus likes, tus obras guardadas y los autores que sigues.
- Contar los likes y los seguidores de cada obra y cada autor (solo se muestra el número, nunca quién dio like).
- Avisarte por correo cuando un autor que sigues publica algo nuevo (puedes apagarlo en tu perfil).
- Verificar que quien pide vincular un perfil de autor sea realmente esa persona.

No vendemos ni compartimos tus datos con terceros, ni los usamos para publicidad.

## Dónde se guardan
En los servicios de Google (Hojas de cálculo y Apps Script) de la cuenta de la gaceta, con acceso solo para el equipo editorial.

## Tus derechos
Como titular de tus datos puedes **conocerlos, actualizarlos, rectificarlos y pedir que los borremos**, revocar esta autorización y presentar quejas ante la Superintendencia de Industria y Comercio. Puedes **borrar tu cuenta tú mismo** desde [Mi perfil](${u('/perfil/')}) («Borrar mi cuenta»): se eliminan tus datos, likes y seguimientos. Para cualquier otra solicitud, escríbenos a [${correo}](mailto:${correo}); respondemos en un máximo de 15 días hábiles.

## Menores de edad
Si tienes menos de 18 años, crea tu cuenta con el acompañamiento de tu madre, padre o acudiente.

## Cambios
Si cambiamos esta política, lo publicaremos en esta página. Última actualización: noviembre de 2026.`;
}

// ---------- Escritura ----------
const escritos = [];
function escribir(ruta, html) {
  const destino = path.join(SALIDA, ruta.endsWith('/') ? ruta + 'index.html' : ruta);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (process.env.RELATIVO === '1') {
    // Vista previa: enlaces relativos para poder abrir el sitio desde cualquier carpeta
    const prof = ruta.endsWith('/') ? ruta.split('/').filter(Boolean).length : ruta.split('/').filter(Boolean).length - 1;
    const pre = prof ? '../'.repeat(prof) : './';
    html = html.replace(/(href|src|data-copiar)="\/(?!\/)/g, `$1="${pre}`);
  }
  fs.writeFileSync(destino, html);
  escritos.push(ruta);
}
function copiar(origen, destino) {
  const o = path.join(RAIZ, origen); if (!fs.existsSync(o)) return;
  fs.cpSync(o, path.join(SALIDA, destino), { recursive: true });
}

// ---------- Páginas ----------
function construir() {
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.mkdirSync(SALIDA, { recursive: true });

  // Inicio
  escribir('/', pagina({ ruta: '/', cuerpo: bloques(inicio.bloques, ctx), clase: 'es-inicio' }));

  // Archivo
  const municipiosLista = [...new Map(obras.filter(o => o.municipio).map(o => [normalizar(o.municipio), o.municipio])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const anios = [...new Set(obras.map(o => anio(o.fecha_publicacion)).filter(Boolean))].sort((a, b) => b - a);
  escribir('/archivo/', pagina({
    titulo: 'Archivo', ruta: '/archivo/', descripcion: `Repositorio de escritura: ${obras.length} obras de libre lectura.`,
    cuerpo: `${cabezaPagina({ sobretitulo: archivoAj.sobretitulo || 'Archivo', titulo: archivoAj.titulo || 'Todo lo que', tachado: archivoAj.tachado, escrito: archivoAj.escrito || 'quisimos', bajada: archivoAj.bajada })}
    <section class="bloque" style="padding-top:0"><div class="contenedor" data-archivo>
      <div class="buscador">${icono('buscar')}<label for="q" class="sr">Buscar</label><input id="q" type="search" placeholder="${esc(archivoAj.placeholder || 'río, abuela, Gamarra…')}" data-q autocomplete="off"></div>
      <div class="filtros" role="group" aria-label="Colecciones">
        <button class="chip" type="button" aria-pressed="true" data-col="">Todo</button>
        ${colecciones.map(c => `<button class="chip" type="button" aria-pressed="false" data-col="${esc(c.slug)}" style="--col:${c.colorCss}"><i></i>${esc(c.nombre)}</button>`).join('')}
      </div>
      <div class="filtros">
        ${municipiosLista.length ? `<select data-mun aria-label="Municipio"><option value="">Todos los municipios</option>${municipiosLista.map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}</select>` : ''}
        ${anios.length ? `<select data-anio aria-label="Año"><option value="">Todos los años</option>${anios.map(a => `<option>${a}</option>`).join('')}</select>` : ''}
        <select data-orden aria-label="Orden">${[['recientes', 'Más recientes'], ['antiguas', 'Más antiguas'], ['codigo', 'Por código'], ['codigo_desc', 'Por código (desc.)'], ['alfabetico', 'De la A a la Z']].map(([v, l]) => `<option value="${v}"${(archivoAj.orden || 'recientes') === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <span class="contador" data-contador>${obras.length} fichas</span>
      </div>
      <div class="fichas" data-lista>${(() => { const l = obras.slice(); const o = archivoAj.orden; if (o === 'antiguas') l.reverse(); else if (o === 'alfabetico') l.sort((a, z) => a.titulo.localeCompare(z.titulo, 'es')); else if (o === 'codigo' || o === 'codigo_desc') { l.sort((a, z) => numCodigo(a) - numCodigo(z)); if (o === 'codigo_desc') l.reverse(); } return l; })().map(o => ficha(o)).join('')}</div>
      <div class="vacio" data-vacio ${obras.length ? 'hidden' : ''}><span class="mano">Nada por aquí todavía</span>Prueba con otra palabra, o <a href="${esc(mailto())}">envíanos lo que escribiste</a>.</div>
    </div></section>
    ${bloques(archivoAj.bloques, ctx)}`,
  }));

  // Colecciones
  for (const c of colecciones) {
    const lista = obras.filter(o => o.coleccion === c.slug);
    escribir(`/coleccion/${c.slug}/`, pagina({
      titulo: c.nombre, ruta: `/coleccion/${c.slug}/`, descripcion: c.lema, franja: c.colorCss,
      cuerpo: `${cabezaPagina({ sobretitulo: `Archivo · ${c.nombre}`, titulo: c.nombre, bajada: c.lema, migas: [['Archivo', '/archivo/'], [c.nombre]] })}
      ${c.descripcion ? `<section class="bloque bloque--compacto" style="padding-top:0"><div class="contenedor"><div class="texto-md">${md(c.descripcion, u)}</div></div></section>` : ''}
      <section class="bloque" style="padding-top:1rem"><div class="contenedor">
        ${lista.length ? `<div class="fichas">${lista.map(o => ficha(o, { imagen: true })).join('')}</div>` : `<div class="vacio"><span class="mano">Esta orilla espera su primera obra</span><a class="boton boton--primario" href="${esc(mailto())}" style="margin-top:1rem">Envía tu creación</a></div>`}
      </div></section>
      ${bloques(c.bloques, ctx)}`,
    }));
  }

  // Obras
  for (const o of obras) {
    const hermanas = obras.filter(x => x.coleccion === o.coleccion);
    const i = hermanas.indexOf(o);
    const ant = hermanas[i + 1], sig = hermanas[i - 1];
    const autoresLinks = o.autores.map(s => autPorSlug[s] ? `<a href="${link(`/autor/${s}/`)}">${esc(publico(autPorSlug[s]))}</a>` : esc(s));
    if (o.autor_texto) autoresLinks.push(esc(o.autor_texto));
    const urlAbs = (sitio.url || '').replace(/\/$/, '') + u(o.url);
    const cita = `${o.firma}. (${anio(o.fecha_publicacion)}). ${o.titulo} [${o.col.nombre.toLowerCase()}]. ${sitio.nombre}, ${o.codigo}. ${urlAbs}`;
    const notas = (o.notas || []).filter(n => n.texto);
    const oscuro = /canaguate/.test(o.col.colorCss);
    const texto = o.forma === 'prosa' && o.prosa ? `<div class="prosa texto-md">${md(o.prosa, u)}</div>` : `<div class="verso">${verso(o.verso || '', u)}</div>${o.prosa && o.forma !== 'prosa' ? `<div class="prosa texto-md prosa--sin-capitular" style="margin-top:2rem">${md(o.prosa, u)}</div>` : ''}`;
    escribir(o.url, pagina({
      titulo: o.titulo, ruta: o.url, tipo: 'article', franja: o.col.colorCss, imagen: o.portada,
      descripcion: o.descripcion_seo || `${o.col.nombre} de ${o.firma}. ${o.extractoFinal}`,
      cuerpo: `<div class="contenedor"><article class="obra">
        <aside class="obra__ficha" aria-label="Ficha catalográfica">
          <span class="etiqueta-col ${oscuro ? 'etiqueta-col--oscuro' : ''}" style="--col:${o.col.colorCss}">${esc(o.col.nombre)}</span>
          <dl>
            <dt>Ficha</dt><dd>${esc(o.codigo)}</dd>
            <dt>Publicado</dt><dd>${fechaFicha(o.fecha_publicacion)}</dd>
            ${o.fecha_escritura ? `<dt>Escrito</dt><dd>${fechaFicha(o.fecha_escritura)}</dd>` : ''}
            ${o.municipio ? `<dt>Lugar</dt><dd>${esc(o.municipio)}${o.departamento ? `, ${esc(o.departamento)}` : ''}</dd>` : ''}
            ${o.procedencia ? `<dt>Procedencia</dt><dd>${esc(o.procedencia)}</dd>` : ''}
            ${o.evaluacion ? `<dt>Evaluación</dt><dd>${esc(o.evaluacion)}</dd>` : ''}
            <dt>Licencia</dt><dd>${esc(o.licencia || 'CC BY-NC-ND 4.0')}</dd>
          </dl>
          <div class="botones">
            <button class="boton boton--chico boton-like" type="button" data-like="${esc(o.codigo)}" hidden aria-pressed="false">Me gusta</button>
            <button class="boton boton--chico boton-guardar" type="button" data-guardar="${esc(o.codigo)}" hidden aria-pressed="false">Guardar</button>
            ${o.audio || o.audio_url ? `<a class="boton boton--chico" href="#lectura">${icono('audio')} Escuchar lectura</a>` : ''}
            ${o.autores[0] && autPorSlug[o.autores[0]] ? `<a class="boton boton--chico" href="${link(`/autor/${o.autores[0]}/`)}">${icono('autor')} Ver autor/a</a>` : ''}
            ${o.pdf ? `<a class="boton boton--chico" href="${esc(u(o.pdf))}" download>${icono('descarga')} Descargar PDF</a>` : ''}
            <button class="boton boton--chico" type="button" data-compartir data-titulo="${esc(o.titulo)}">${icono('compartir')} Compartir</button>
          </div>
        </aside>
        <div class="obra__texto">
          <nav class="migas" aria-label="Migas"><a href="${link('/archivo/')}">Archivo</a><span>‸</span><a href="${link(`/coleccion/${o.col.slug}/`)}">${esc(o.col.nombre)}</a></nav>
          <h1>${enLinea(o.titulo)}</h1>
          <span class="obra__autor">${autoresLinks.join(', ') || 'Anónimo'}</span>
          ${o.ejemplo ? '<p class="nota-margen" style="margin-bottom:1.5rem">Esta es una obra de ejemplo para ver el diseño. Bórrala desde el panel.</p>' : ''}
          ${o.portada ? `<figure class="obra__portada"><img src="${esc(u(o.portada))}" alt="${esc(o.portada_pie || '')}" data-ampliar data-pie="${esc(o.portada_pie || '')}">${o.portada_pie ? `<figcaption>${esc(o.portada_pie)}</figcaption>` : ''}</figure>` : ''}
          ${texto}
          ${(o.galeria || []).filter(g => g.imagen).length ? `<div class="galeria galeria--libre" style="--cols:2;margin-top:2.5rem">${o.galeria.filter(g => g.imagen).map(g => `<figure><img src="${esc(u(g.imagen))}" alt="${esc(g.pie || '')}" loading="lazy" data-ampliar data-pie="${esc(g.pie || '')}">${g.pie ? `<figcaption>${esc(g.pie)}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}
          ${o.audio || o.audio_url ? `<div id="lectura" style="margin-top:2.5rem">${audio({ titulo: 'Lectura en voz', interprete: o.firma, archivo: o.audio, url: o.audio_url, transcripcion: o.transcripcion }, ctx)}</div>` : ''}
          ${o.video ? `<div style="margin-top:2.5rem">${video({ url: o.video }, ctx)}</div>` : ''}
          ${(o.etiquetas || []).length ? `<div class="etiquetas">${o.etiquetas.map(e => `<a href="${link('/archivo/')}?q=${encodeURIComponent(e.etiqueta || e)}">${esc(e.etiqueta || e)}</a>`).join('')}</div>` : ''}
          <div class="like-final"><span class="mano">¿Te gustó?</span><button class="boton boton--chico boton-like" type="button" data-like="${esc(o.codigo)}" hidden aria-pressed="false">Me gusta</button><button class="boton boton--chico boton-guardar" type="button" data-guardar="${esc(o.codigo)}" hidden aria-pressed="false">Guardar</button></div>
          ${o.autores.filter(sl => autPorSlug[sl]).map(sl => cajaAutor(autPorSlug[sl])).join('')}
          <div class="citar"><span class="meta">${icono('ficha', 'icono-inline')} Cómo citar esta obra</span><code data-cita>${esc(cita)}</code> <button class="boton boton--chico" type="button" data-copiar="${esc(cita)}" style="margin-top:.75rem">Copiar cita</button></div>
          <nav class="navegacion-obras" aria-label="Más de la colección">
            ${ant ? `<a href="${link(ant.url)}"><small>‹ Anterior en ${esc(o.col.nombre)}</small><span>${esc(ant.titulo)}</span></a>` : '<span></span>'}
            ${sig ? `<a href="${link(sig.url)}" style="text-align:right"><small>Siguiente en ${esc(o.col.nombre)} ›</small><span>${esc(sig.titulo)}</span></a>` : ''}
          </nav>
        </div>
        <aside class="obra__notas" aria-label="Notas al margen">
          ${notas.map(n => `<p class="nota-margen"><span class="etiqueta">${esc(n.tipo || 'Nota del editor')}</span>${esc(n.texto)}</p>`).join('')}
        </aside>
      </article></div>
      ${bloques(o.bloques, ctx)}`,
    }));
  }

  // Autores
  escribir('/autores/', pagina({
    titulo: 'Autores', ruta: '/autores/', descripcion: 'Quienes escriben en la gaceta.',
    cuerpo: `${cabezaPagina(cabSeccion('autores', { sobretitulo: 'Archivo · Autores', titulo: 'Quienes', escrito: 'escriben', bajada: 'Estudiantes, docentes, colegios, cantadoras y comunidades del sur del Cesar y la ribera del Magdalena.' }))}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor">${autores.length ? `<div class="buscar-autores"><label class="sr-only" for="buscar-autor">Buscar autor</label><input id="buscar-autor" type="search" data-buscar-autores placeholder="Busca por nombre o seudónimo" autocomplete="off"><p class="meta" data-sin-autores hidden>No encontramos ese nombre. Prueba con otro o con el seudónimo.</p></div>
    <div class="personas" data-lista-autores>${autores.map(a => persona(a, link(`/autor/${a.slug}/`)).replace('<a class="persona"', `<a class="persona" data-buscar="${esc(normalizar([a.nombre, a.seudonimo, a.municipio].filter(Boolean).join(' ')))}"`)).join('')}</div>` : '<div class="vacio"><span class="mano">Pronto, sus nombres</span></div>'}</div></section>
    ${bloques(secciones.autores?.bloques, ctx)}`,
  }));
  for (const a of autores) {
    const lista = obras.filter(o => o.autores.includes(a.slug));
    escribir(`/autor/${a.slug}/`, pagina({
      titulo: a.nombre, ruta: `/autor/${a.slug}/`, descripcion: a.perfil || resumen(a.bio), imagen: a.foto, franja: colorCss(a.color),
      cuerpo: `<div class="contenedor"><div class="perfil">
        <div>${persona({ foto: a.foto }).replace(/<h3><\/h3>/, '')}</div>
        <div><nav class="migas"><a href="${link('/autores/')}">Autores</a></nav><h1>${esc(a.nombre)}</h1>
          ${a.seudonimo ? `<p class="seudonimo">Firma como <span class="mano">${esc(a.seudonimo)}</span></p>` : ''}
          <p class="sobretitulo">${[a.perfil, a.municipio].filter(Boolean).map(esc).join(' · ')}</p>
          ${(() => { const m = a.equipo && (equipo.miembros || []).find(x => normalizar(x.nombre) === normalizar(a.equipo)); return m ? `<p class="sello-equipo"><a href="${link('/equipo-editorial/')}#${esc(idMiembro(m.nombre))}">Equipo editorial${m.rol ? ' · ' + esc(m.rol) : ''}</a></p>` : ''; })()}
          <div class="texto-md">${md(a.bio, u)}</div>
          <div class="cifras" style="margin-top:2rem"><div class="cifra"><b>${lista.length}</b><span>${lista.length === 1 ? 'obra' : 'obras'}</span></div>${[...new Set(lista.map(o => o.col.nombre))].map(n => `<div class="cifra"><span>${esc(n)}</span></div>`).join('')}</div>
          <div class="acciones-autor" data-autor-acciones="${esc(a.slug)}" data-nombre="${esc(publico(a) || a.nombre)}" hidden></div>
          ${(a.redes || []).filter(r => r.url).length ? `<div class="botones" style="margin-top:1.5rem">${a.redes.filter(r => r.url).map(r => `<a class="boton boton--chico" href="${esc(r.url)}" target="_blank" rel="noopener">${icono('enlace')} ${esc(r.nombre || 'Enlace')}</a>`).join('')}</div>` : ''}
        </div></div>
        <h2>Sus obras</h2><div class="fichas" style="margin-bottom:4rem">${lista.map(o => ficha(o)).join('') || '<p>Aún no hay obras publicadas.</p>'}</div>
      </div>
      ${a.correo_publico ? `<div class="contenedor" style="margin-bottom:3rem"><a class="boton" href="mailto:${esc(a.correo_publico)}">${icono('correo')} ${esc(a.correo_publico)}</a></div>` : ''}
      ${bloques(a.bloques, ctx)}`,
    }));
  }

  // Equipo editorial (misma dirección que en Wix)
  escribir('/equipo-editorial/', pagina({
    titulo: equipo.titulo || 'Equipo editorial', ruta: '/equipo-editorial/', descripcion: 'El equipo editorial de la gaceta.',
    cuerpo: `${cabezaPagina({ sobretitulo: 'La gaceta', titulo: equipo.titulo || 'Equipo editorial', bajada: equipo.intro })}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor"><div class="personas">${(equipo.miembros || []).map(m => { const a = autorDeMiembro(m.nombre); return `<div id="${esc(idMiembro(m.nombre))}" class="persona-equipo">${persona(m)}${a ? `<a class="boton boton--chico persona__obras" href="${link(`/autor/${a.slug}/`)}">${icono('autor')} También publica: sus obras</a>` : ''}</div>`; }).join('')}</div></div></section>
    ${bloques(equipo.bloques, ctx)}`,
  }));

  // Agenda
  const proximos = agenda.filter(e => !e.pasado), pasados = agenda.filter(e => e.pasado);
  escribir('/agenda/', pagina({
    titulo: 'Agenda', ruta: '/agenda/', descripcion: 'Convocatorias, talleres y lecturas.',
    cuerpo: `${cabezaPagina(cabSeccion('agenda', { sobretitulo: 'Agenda', titulo: 'Lo que', escrito: 'viene', bajada: 'Convocatorias, talleres, lecturas públicas y lanzamientos.' }))}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor">
      ${proximos.length ? `<div class="agenda" data-agenda>${proximos.map(evento).join('')}</div>` : '<div class="vacio"><span class="mano">Pronto anunciamos lo que viene</span></div>'}
      ${pasados.length ? `<h2 style="margin-top:4rem">Ya pasó</h2><div class="agenda">${pasados.map(evento).join('')}</div>` : ''}
    </div></section>
    ${bloques(secciones.agenda?.bloques, ctx)}`,
  }));
  for (const e of agenda) {
    const [tipo, col] = TIPO_EVENTO[e.tipo] || TIPO_EVENTO.otro;
    escribir(e.url, pagina({
      titulo: e.titulo, ruta: e.url, descripcion: e.resumen, imagen: e.imagen, franja: col,
      cuerpo: `${cabezaPagina({ sobretitulo: `${tipo}${e.pasado ? ' · ya pasó' : ''}`, titulo: e.titulo, bajada: e.resumen, migas: [['Agenda', '/agenda/'], [tipo]] })}
      <section class="bloque" style="padding-top:0"><div class="contenedor"><div class="columnas" style="--cols:2;grid-template-columns:1fr 1.3fr">
        <div>
          <div class="cifras" style="flex-direction:column;align-items:flex-start;gap:.75rem">
            <div class="cifra">${icono('calendario', 'icono-inline')}<span>${fechaEvento(e.inicio)}${hora(e.inicio) ? ` · ${hora(e.inicio)}` : ''}</span></div>
            ${e.fin ? `<div class="cifra">${icono('calendario', 'icono-inline')}<span>${e.tipo === 'convocatoria' ? 'Cierra' : 'Hasta'} el ${fechaLarga(e.fin)}${hora(e.fin) ? ` · ${hora(e.fin)}` : ''}</span></div>` : ''}
            ${e.lugar ? `<div class="cifra">${icono('lugar', 'icono-inline')}<span>${esc(e.lugar)}</span></div>` : ''}
          </div>
          ${e.enlace && !e.pasado ? `<div class="botones" style="margin-top:1.5rem"><a class="boton boton--primario" href="${esc(href(e.enlace))}"${/^https?:/.test(e.enlace) ? ' target="_blank" rel="noopener"' : ''}>${esc(e.texto_enlace || 'Inscríbete')}</a></div>` : ''}
          <div class="texto-md" style="margin-top:2rem">${md(e.descripcion, u)}</div>
          ${e.ejemplo ? '<p class="nota-margen">Evento de ejemplo: cámbialo o bórralo desde el panel.</p>' : ''}
        </div>
        <div>${e.imagen ? `<figure class="figura"><img src="${esc(u(e.imagen))}" alt="Afiche: ${esc(e.titulo)}" data-ampliar></figure>` : `<div class="fondo-indigo" style="padding:2rem;color:var(--canaguate)">${atarraya({})}</div>`}</div>
      </div></div></section>
      ${bloques(e.bloques, ctx)}`,
    }));
  }

  // Bitácora
  escribir('/bitacora/', pagina({
    titulo: 'Bitácora', ruta: '/bitacora/', descripcion: 'Noticias y crónicas del equipo.',
    cuerpo: `${cabezaPagina(cabSeccion('bitacora', { sobretitulo: 'Bitácora', titulo: 'Lo que', escrito: 'pasó', bajada: 'Noticias, crónicas del equipo y resultados de convocatorias.' }))}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor">${bitacora.length ? `<div class="entradas">${bitacora.map(entrada).join('')}</div>` : '<div class="vacio"><span class="mano">La primera entrada viene en camino</span></div>'}</div></section>
    ${bloques(secciones.bitacora?.bloques, ctx)}`,
  }));
  for (const e of bitacora) {
    escribir(e.url, pagina({
      titulo: e.titulo, ruta: e.url, descripcion: e.resumen, imagen: e.portada, tipo: 'article',
      cuerpo: `${cabezaPagina({ sobretitulo: `${fechaLarga(e.fecha)}${e.autor ? ` · ${e.autor}` : ''}`, titulo: e.titulo, bajada: e.resumen, migas: [['Bitácora', '/bitacora/']] })}
      ${e.portada ? `<div class="contenedor" style="margin-bottom:2rem"><figure class="figura"><img src="${esc(u(e.portada))}" alt="" data-ampliar></figure></div>` : ''}
      ${e.cuerpo ? `<section class="bloque" style="padding-top:0"><div class="contenedor--lectura"><div class="texto-md prosa">${md(e.cuerpo, u)}</div>${(e.etiquetas || []).length ? `<div class="etiquetas">${e.etiquetas.map(x => `<span>${esc(x.etiqueta || x)}</span>`).join('')}</div>` : ''}</div></section>` : ''}
      ${bloques(e.bloques, ctx)}`,
    }));
  }

  // Páginas libres
  for (const p of paginas) {
    const franja = p.franja ? colorCss(p.franja) : '';
    escribir(p.url, pagina({
      titulo: p.titulo, ruta: p.url, descripcion: p.descripcion_seo || p.bajada, imagen: p.imagen_seo, franja,
      cuerpo: `${p.cabeza !== false ? cabezaPagina({ sobretitulo: p.sobretitulo, titulo: p.titulo, tachado: p.tachado, escrito: p.escrito, bajada: p.bajada }) : ''}${bloques(p.bloques, ctx)}`,
    }));
  }

  // Cuentas de lectores: perfil, privacidad y revisión de solicitudes de autores
  escribir('/perfil/', pagina({
    titulo: 'Mi perfil', ruta: '/perfil/', descripcion: 'Tus obras guardadas y los autores que sigues en la gaceta.',
    cuerpo: `<section class="bloque"><div class="contenedor" style="max-width:52rem"><div data-perfil-lector><noscript>Necesitas JavaScript para ver tu perfil.</noscript><p class="meta">Cargando…</p></div></div></section>`,
  }));
  if (!paginas.some(p => p.url === '/privacidad/')) escribir('/privacidad/', pagina({
    titulo: 'Política de privacidad', ruta: '/privacidad/', descripcion: 'Cómo tratamos los datos de las cuentas de lectores.',
    cuerpo: `${cabezaPagina({ sobretitulo: 'Tratamiento de datos personales', titulo: 'Tus datos,', escrito: 'con cuidado', bajada: 'Política para las cuentas de lectores de la gaceta, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.' })}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor"><div class="texto-md" style="max-width:var(--ancho-lectura)">${md(privacidad(), u)}</div></div></section>`,
  }));
  escribir('/admin/solicitudes/', pagina({
    titulo: 'Solicitudes de autores', ruta: '/admin/solicitudes/', descripcion: 'Panel del equipo.',
    cuerpo: `${cabezaPagina({ sobretitulo: 'Plataforma · Panel del equipo', titulo: 'Solicitudes de', escrito: 'autores', bajada: 'Personas que piden vincular su cuenta de lector con su perfil de autor en la gaceta. Revisa cada caso antes de aprobar.', migas: [['Panel', '/admin/']] })}
    <section class="bloque" style="padding-top:1rem"><div class="contenedor" style="max-width:56rem"><div data-solicitudes-autores><p class="meta">Cargando…</p></div></div></section>
    <script>if (/[?&]panel=1/.test(location.search)) { document.documentElement.classList.add('en-panel'); document.querySelectorAll('a[href]').forEach(function (a) { if (!a.closest('[data-solicitudes-autores]') || a.hostname !== location.hostname || a.pathname.indexOf('/autor/') > -1) a.target = '_blank'; }); }</script>`,
  }));

  // 404
  escribir('/404.html', pagina({
    titulo: 'Página no encontrada', ruta: '/404.html',
    cuerpo: `<section class="bloque bloque--amplio"><div class="contenedor alinear-centro">
      <p class="sobretitulo">Error 404</p><h1 class="titular-enmendado">Aquí había <span class="tacha">una página</span><span class="enmienda enmienda--sin-signo">un río</span></h1>
      <p>Lo que buscas se lo llevó la corriente. Prueba en el archivo.</p>
      <div class="botones botones--centro"><a class="boton boton--primario" href="${link('/archivo/')}">Ir al archivo</a><a class="boton" href="${link('/')}">Volver al inicio</a></div>
    </div></section>`,
  }));

  // Recursos estáticos
  copiar('assets', 'assets');
  copiar('media', 'media');
  fs.writeFileSync(path.join(SALIDA, 'favicon.svg'), favicon);
  fs.writeFileSync(path.join(SALIDA, '.nojekyll'), '');

  // Panel de edición
  fs.mkdirSync(path.join(SALIDA, 'admin'), { recursive: true });
  const conf = panel.config(REPO, RAMA);
  if (sitio.url) { conf.site_url = sitio.url; conf.display_url = sitio.url; } else { delete conf.site_url; delete conf.display_url; }
  conf.logo_url = (sitio.url || '') + '/favicon.svg';
  conf.public_folder = BASE + '/media/subidas';
  fs.writeFileSync(path.join(SALIDA, 'admin', 'config.yml'), JSON.stringify(conf, null, 2));
  // Cuentas y autores: página propia del panel (con el estilo del panel, no el de la gaceta)
  fs.mkdirSync(path.join(SALIDA, 'admin', 'cuentas'), { recursive: true });
  fs.copyFileSync(path.join(RAIZ, 'admin', 'cuentas.css'), path.join(SALIDA, 'admin', 'cuentas', 'cuentas.css'));
  fs.writeFileSync(path.join(SALIDA, 'admin', 'cuentas', 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Cuentas y autores · Panel</title><link rel="icon" type="image/svg+xml" href="${BASE}/favicon.svg"><link rel="stylesheet" href="${BASE}/admin/cuentas/cuentas.css?v=${Date.now()}"></head>
<body><main id="contenido"><div data-solicitudes-autores><p class="lec-suave">Cargando…</p></div></main><div class="toast" data-toast role="status" aria-live="polite"></div>
<script src="${u('/assets/js/lectores-config.js')}?v=${VERSION_ARCHIVOS}"></script><script src="${u('/assets/js/lectores.js')}?v=${VERSION_ARCHIVOS}"></script></body></html>`);
  fs.writeFileSync(path.join(SALIDA, 'admin', 'index.html'), fs.readFileSync(path.join(RAIZ, 'admin', 'index.html'), 'utf8').replace(/\{\{BASE\}\}/g, BASE));

  // Feed RSS, sitemap y datos abiertos
  const abs = p => (sitio.url || '').replace(/\/$/, '') + u(p);
  const xml = s => esc(s);
  fs.writeFileSync(path.join(SALIDA, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${xml(sitio.nombre)}</title><link>${xml(abs('/'))}</link><description>${xml(sitio.descripcion || '')}</description><language>es-co</language>
${[...obras.map(o => ({ t: `${o.titulo} · ${o.firma}`, l: o.url, d: o._fecha, s: o.extractoFinal })), ...bitacora.map(e => ({ t: e.titulo, l: e.url, d: e._fecha, s: e.resumen || '' }))].sort((a, b) => b.d - a.d).slice(0, 40).map(i => `<item><title>${xml(i.t)}</title><link>${xml(abs(i.l))}</link><guid>${xml(abs(i.l))}</guid><pubDate>${i.d.toUTCString()}</pubDate><description>${xml(i.s)}</description></item>`).join('\n')}
</channel></rss>`);
  fs.writeFileSync(path.join(SALIDA, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${escritos.filter(r => r.endsWith('/')).map(r => `<url><loc>${xml(abs(r))}</loc></url>`).join('')}</urlset>`);
  fs.writeFileSync(path.join(SALIDA, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /perfil/\n${sitio.url ? `Sitemap: ${abs('/sitemap.xml')}\n` : ''}`);
  fs.writeFileSync(path.join(SALIDA, 'obras.json'), JSON.stringify(obras.map(o => ({ codigo: o.codigo, titulo: o.titulo, autores: o.nombresAutores, autoresSlugs: o.autores, coleccion: o.col.nombre, municipio: o.municipio || '', fecha: o.fecha_publicacion, licencia: o.licencia || 'CC BY-NC-ND 4.0', url: abs(o.url) })), null, 1));

  fs.writeFileSync(path.join(SALIDA, 'equipo.json'), JSON.stringify((equipo.miembros || []).map(m => { const a = autorDeMiembro(m.nombre); return { nombre: m.nombre, rol: m.rol || '', id: idMiembro(m.nombre), autor: a ? a.slug : '' }; }), null, 1));
  fs.writeFileSync(path.join(SALIDA, 'autores.json'), JSON.stringify(autores.map(a => ({ slug: a.slug, nombre: publico(a) || a.nombre, obras: obras.filter(o => o.autores.includes(a.slug)).length, url: abs(`/autor/${a.slug}/`) })), null, 1));

  const borradores = todasObras.length - obras.length;
  console.log(`✓ Sitio generado en ${path.relative(RAIZ, SALIDA) || '.'}/`);
  console.log(`  ${obras.length} obras publicadas${borradores ? ` (${borradores} en borrador o evaluación)` : ''} · ${colecciones.length} colecciones · ${autores.length} autores · ${paginas.length} páginas · ${agenda.length} eventos · ${bitacora.length} entradas`);
}

construir();
