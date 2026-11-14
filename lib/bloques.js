// Dibuja cada tipo de bloque del constructor de páginas.
const { esc, md, enLinea, verso } = require('./texto');
const { atarraya, icono } = require('./graficos');

const COLOR = { rojo: 'var(--rojo)', indigo: 'var(--indigo)', canaguate: 'var(--canaguate)', buchon: 'var(--buchon)', lodo: 'var(--lodo)', grafito: 'var(--grafito)' };
const colorCss = (c, libre) => (libre && /^#[0-9a-f]{3,8}$/i.test(libre)) ? libre : (COLOR[c] || 'var(--rojo)');

function titulo(texto, tachado, escrito, nivel = 'h2', clase = '') {
  if (!texto && !tachado && !escrito) return '';
  let t = esc(texto || '');
  if (tachado || escrito) t += ` ${tachado ? `<span class="tacha">${esc(tachado)}</span>` : ''}${escrito ? `<span class="enmienda enmienda--sin-signo">${esc(escrito)}</span>` : ''}`;
  return `<${nivel} class="titular-enmendado ${clase}">${t}</${nivel}>`;
}

function botones(lista = [], ctx, alin = '') {
  const b = (lista || []).filter(x => x && x.texto);
  if (!b.length) return '';
  return `<div class="botones ${alin === 'centro' ? 'botones--centro' : ''}">${b.map(x => {
    const cls = x.estilo === 'contorno' ? '' : `boton--${x.estilo || 'primario'}`;
    const href = x.enlace ? ctx.href(x.enlace) : ctx.mailto();
    const ext = /^https?:/.test(x.enlace || '') ? ' target="_blank" rel="noopener"' : '';
    return `<a class="boton ${cls}" href="${esc(href)}"${ext}>${esc(x.texto)}</a>`;
  }).join('')}</div>`;
}

function embedVideo(url = '') {
  let m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/))) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return `https://player.vimeo.com/video/${m[1]}`;
  if ((m = url.match(/tiktok\.com\/.*\/video\/(\d+)/))) return `https://www.tiktok.com/embed/v2/${m[1]}`;
  if (/facebook\.com/.test(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) return `https://drive.google.com/file/d/${m[1]}/preview`;
  return '';
}

function video(b, ctx) {
  if (b.archivo) return `<div class="video"><video controls preload="metadata" src="${esc(ctx.u(b.archivo))}"></video></div>`;
  const e = embedVideo(b.url || '');
  if (e) return `<div class="video"><iframe src="${esc(e)}" title="${esc(b.titulo || 'Video')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  if (b.url) return `<a class="boton" href="${esc(b.url)}" target="_blank" rel="noopener">${icono('video')} Ver video</a>`;
  return '';
}

function audio(b, ctx) {
  const src = b.archivo ? ctx.u(b.archivo) : '';
  let reproductor = '';
  if (src) reproductor = `<div class="audio__onda" aria-hidden="true">${Array.from({ length: 48 }, (_, i) => `<i style="height:${20 + Math.round(70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .37)))}%"></i>`).join('')}</div><audio controls preload="none" src="${esc(src)}"></audio>`;
  else if (b.url) {
    const sp = b.url.match(/open\.spotify\.com\/(episode|track|show|playlist)\/(\w+)/);
    const sc = /soundcloud\.com/.test(b.url);
    if (sp) reproductor = `<iframe style="border-radius:8px;width:100%;margin-top:.75rem" src="https://open.spotify.com/embed/${sp[1]}/${sp[2]}" height="152" frameborder="0" loading="lazy" allow="encrypted-media"></iframe>`;
    else if (sc) reproductor = `<iframe width="100%" height="166" style="margin-top:.75rem" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(b.url)}&color=%23d7372b"></iframe>`;
    else reproductor = `<p><a class="boton boton--chico" href="${esc(b.url)}" target="_blank" rel="noopener">${icono('audio')} Escuchar</a></p>`;
  }
  return `<div class="audio">
    <div class="sobretitulo">${icono('audio', 'icono-inline')} Registro sonoro</div>
    ${b.titulo ? `<h3>${esc(b.titulo)}</h3>` : ''}${b.interprete ? `<div class="meta">${esc(b.interprete)}</div>` : ''}
    ${reproductor}
    ${b.contexto ? `<p class="nota-margen" style="margin-top:1rem"><span class="etiqueta">Contexto</span>${esc(b.contexto)}</p>` : ''}
    ${b.transcripcion ? `<details class="transcripcion"><summary>Leer la transcripción</summary><div class="texto-md">${md(b.transcripcion, ctx.u)}</div></details>` : ''}
  </div>`;
}

const R = {
  portada(b, ctx) {
    return { html: `<div class="portada__red">${b.atarraya !== false ? atarraya({ dibujar: true }) : ''}</div>
      <div class="portada__grid">
        <div>
          ${b.sobretitulo ? `<p class="sobretitulo">${esc(b.sobretitulo)}</p>` : ''}
          <h1 class="titular-enmendado"><span class="linea">${esc(b.antes || '')}</span>${b.tachado ? `<span class="tacha">${esc(b.tachado)}</span>` : ''}${b.escrito ? `<span class="enmienda enmienda--sin-signo">${esc(b.escrito)}</span>` : ''}</h1>
          ${b.intro ? `<p class="portada__intro">${enLinea(b.intro, ctx.u)}</p>` : ''}
          ${botones(b.botones, ctx)}
        </div>
        <div>${b.enmienda_frase !== false ? R.enmienda_frase({ pregunta: b.pregunta, ejemplo: 'algo serio' }, ctx).html : ''}</div>
      </div>`, clase: 'portada' };
  },
  encabezado(b) {
    return `${b.sobretitulo ? `<p class="sobretitulo">${esc(b.sobretitulo)}</p>` : ''}${titulo(b.titulo, b.tachado, b.escrito, b.tamano === 'mediano' ? 'h2' : 'h1')}${b.bajada ? `<p class="cabeza-pagina bajada" style="padding:0">${enLinea(b.bajada)}</p>` : ''}`;
  },
  texto(b, ctx) {
    return `<div class="${b.margen ? 'margen-cuaderno' : ''}">${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<div class="texto-md ${b.apariencia?.ancho === 'ancho' ? 'ancho' : ''}">${md(b.cuerpo, ctx.u)}</div></div>`;
  },
  verso(b, ctx) {
    return `<div class="obra__texto" style="display:grid;grid-template-columns:minmax(0,1fr) 14rem;gap:2rem">
      <div>${b.titulo ? `<h2 style="font-style:italic">${esc(b.titulo)}</h2>` : ''}${b.autor ? `<span class="obra__autor">${esc(b.autor)}</span>` : ''}<div class="verso">${verso(b.texto, ctx.u)}</div></div>
      <div>${b.nota ? `<p class="nota-margen">${esc(b.nota)}</p>` : ''}</div></div>`;
  },
  cita(b, ctx) {
    return `<figure class="cita ${b.tamano === 'grande' ? 'cita--grande' : ''}"><blockquote><p>${enLinea(b.texto || '', ctx.u)}</p></blockquote>
      ${b.autor ? `<figcaption>${b.enlace ? `<a href="${esc(ctx.href(b.enlace))}">${esc(b.autor)}</a>` : esc(b.autor)}</figcaption>` : ''}
      ${b.nota ? `<p class="nota-margen">${esc(b.nota)}</p>` : ''}</figure>`;
  },
  imagen(b, ctx) {
    if (!b.imagen) return '';
    const img = `<img src="${esc(ctx.u(b.imagen))}" alt="${esc(b.alt || b.pie || '')}" loading="lazy" ${b.enlace ? '' : 'data-ampliar'}>`;
    return `<figure class="figura figura--${b.tamano || 'ancho'}">${b.enlace ? `<a href="${esc(ctx.href(b.enlace))}">${img}</a>` : img}${b.pie ? `<figcaption>${esc(b.pie)}</figcaption>` : ''}</figure>`;
  },
  galeria(b, ctx) {
    const imgs = (b.imagenes || []).filter(x => x.imagen);
    return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}<div class="galeria ${b.recortar === false ? 'galeria--libre' : ''}" style="--cols:${+b.columnas || 3}">${imgs.map(x => `<figure><img src="${esc(ctx.u(x.imagen))}" alt="${esc(x.alt || x.pie || '')}" loading="lazy" data-ampliar data-pie="${esc(x.pie || '')}">${x.pie ? `<figcaption>${esc(x.pie)}</figcaption>` : ''}</figure>`).join('')}</div>`;
  },
  video(b, ctx) { return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}${video(b, ctx)}${b.pie ? `<p class="meta" style="margin-top:.75rem">${esc(b.pie)}</p>` : ''}`; },
  audio(b, ctx) { return audio(b, ctx); },
  botones(b, ctx) { return botones(b.botones, ctx, b.apariencia?.alineacion); },
  tarjetas(b, ctx) {
    return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}<div class="tarjetas" style="--cols:${+b.columnas || 3}">${(b.items || []).map(x => {
      const tag = x.enlace ? 'a' : 'div';
      return `<${tag} class="tarjeta"${x.enlace ? ` href="${esc(ctx.href(x.enlace))}"` : ''}>${x.imagen ? `<img src="${esc(ctx.u(x.imagen))}" alt="" loading="lazy">` : ''}<div class="tarjeta__cuerpo">${x.etiqueta ? `<div class="sobretitulo">${esc(x.etiqueta)}</div>` : ''}<h3>${esc(x.titulo || '')}</h3>${x.texto ? `<p>${enLinea(x.texto)}</p>` : ''}</div></${tag}>`;
    }).join('')}</div>`;
  },
  columnas(b, ctx) {
    const c = b.columnas || [];
    return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}<div class="columnas" style="--cols:${Math.min(c.length || 1, 4)}">${c.map(x => `<div>${x.titulo ? `<h3>${esc(x.titulo)}</h3>` : ''}<div class="texto-md">${md(x.cuerpo, ctx.u)}</div></div>`).join('')}</div>`;
  },
  fichas(b, ctx) {
    let obras = ctx.obras.slice();
    if (b.coleccion) obras = obras.filter(o => o.coleccion === b.coleccion);
    if (b.autor) obras = obras.filter(o => (o.autores || []).includes(b.autor));
    if (b.etiqueta) obras = obras.filter(o => (o.etiquetas || []).some(e => (e.etiqueta || e) === b.etiqueta));
    if (b.destacadas) obras = obras.filter(o => o.destacada);
    if (b.orden === 'antiguas') obras.reverse();
    else if (b.orden === 'alfabetico') obras.sort((a, z) => a.titulo.localeCompare(z.titulo, 'es'));
    else if (b.orden === 'azar') obras.sort(() => Math.random() - .5);
    else if (b.orden === 'codigo' || b.orden === 'codigo_desc') { obras.sort((a, z) => ctx.numCodigo(a) - ctx.numCodigo(z)); if (b.orden === 'codigo_desc') obras.reverse(); }
    else obras.sort((a, z) => (!!z.destacada - !!a.destacada) || 0);
    obras = obras.slice(0, +b.cantidad || 6);
    return `<div class="encabezado-seccion"><div>${b.sobretitulo ? `<p class="sobretitulo">${esc(b.sobretitulo)}</p>` : ''}${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}</div>${b.ver_todo !== false ? `<a class="boton boton--chico" href="${ctx.link('/archivo/')}">Ver todo el archivo ${icono('flecha')}</a>` : ''}</div>
      ${obras.length ? `<div class="fichas">${obras.map(o => ctx.ficha(o, { imagen: b.imagenes })).join('')}</div>` : `<div class="vacio"><span class="mano">Aquí vendrán las primeras fichas</span>El archivo se llena con lo que escribas.</div>`}`;
  },
  colecciones(b, ctx) {
    return `<div class="encabezado-seccion"><div>${b.sobretitulo ? `<p class="sobretitulo">${esc(b.sobretitulo)}</p>` : ''}${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}</div></div>
      <div class="colecciones">${ctx.colecciones.map(c => `<a class="coleccion" style="--col:${c.colorCss}" href="${ctx.link(`/coleccion/${c.slug}/`)}">${icono(c.icono || 'poesia')}<h3>${esc(c.nombre)}</h3>${c.lema ? `<p>${esc(c.lema)}</p>` : ''}<span class="meta">${c.total} ${c.total === 1 ? 'obra' : 'obras'}</span></a>`).join('')}</div>`;
  },
  cifras(b, ctx) {
    const items = [];
    if (b.automaticas !== false) {
      const s = ctx.estadisticas;
      items.push([s.obras, s.obras === 1 ? 'obra' : 'obras'], [s.autores, s.autores === 1 ? 'autor/a' : 'autores'], [s.municipios, s.municipios === 1 ? 'municipio' : 'municipios']);
      if (s.audios) items.push([s.audios, s.audios === 1 ? 'registro sonoro' : 'registros sonoros']);
    }
    for (const x of b.extra || []) items.push([x.numero, x.etiqueta]);
    return `<div class="cifras">${items.map(([n, e]) => `<div class="cifra"><b>${esc(n)}</b><span>${esc(e)}</span></div>`).join('')}${b.nota ? `<span class="contador">${esc(b.nota)}</span>` : ''}</div>`;
  },
  agenda(b, ctx) {
    let ev = ctx.agenda.filter(e => (b.pasados || !e.pasado) && (!b.tipo || e.tipo === b.tipo));
    ev = ev.slice(0, +b.cantidad || 3);
    return `<div class="encabezado-seccion"><h2>${enLinea(b.titulo || 'Agenda')}</h2><a class="boton boton--chico" href="${ctx.link('/agenda/')}">Toda la agenda ${icono('flecha')}</a></div>
      ${ev.length ? `<div class="agenda">${ev.map(e => ctx.evento(e)).join('')}</div>` : `<div class="vacio"><span class="mano">Pronto anunciamos lo que viene</span></div>`}`;
  },
  bitacora(b, ctx) {
    let en = ctx.bitacora;
    if (b.etiqueta) en = en.filter(e => (e.etiquetas || []).some(x => (x.etiqueta || x) === b.etiqueta));
    en = en.slice(0, +b.cantidad || 3);
    if (!en.length) return '';
    return `<div class="encabezado-seccion"><h2>${enLinea(b.titulo || 'Bitácora')}</h2><a class="boton boton--chico" href="${ctx.link('/bitacora/')}">Toda la bitácora ${icono('flecha')}</a></div><div class="entradas">${en.map(e => ctx.entrada(e)).join('')}</div>`;
  },
  equipo(b, ctx) {
    const m = ctx.equipo.miembros || [];
    return `${b.titulo ? `<h2 class="${b.apariencia?.alineacion === 'centro' ? 'alinear-centro' : ''}">${enLinea(b.titulo)}</h2>` : ''}${b.intro ? `<p>${enLinea(b.intro)}</p>` : ''}<div class="personas" style="margin-top:2rem">${m.map(p => ctx.persona(p)).join('')}</div>`;
  },
  autores(b, ctx) {
    const a = (+b.cantidad ? ctx.autores.slice(0, +b.cantidad) : ctx.autores);
    if (!a.length) return '';
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<div class="personas" style="margin-top:2rem">${a.map(p => ctx.persona(p, ctx.link(`/autor/${p.slug}/`))).join('')}</div>`;
  },
  enmiendas(b, ctx) {
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<div class="enmiendas">${(b.lineas || []).map(l => `<p>${esc(l.antes || '')} ${l.tachado ? `<span class="tacha">${esc(l.tachado)}</span>` : ''}${l.escrito ? `<span class="enmienda">${esc(l.escrito)}</span>` : ''}${l.despues ? ` ${esc(l.despues)}` : ''}</p>`).join('')}</div>${b.cierre ? `<div class="texto-md" style="margin-top:1.5rem;font-size:1.3rem">${md(b.cierre, ctx.u)}</div>` : ''}`;
  },
  enmienda_frase(b) {
    return { html: `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<form class="enmienda-tu-frase" data-enmienda onsubmit="return false">
      <label for="enm-${b._i}">${esc(b.pregunta || '¿Qué te dijeron que debías escribir?')}</label>
      <input id="enm-${b._i}" type="text" maxlength="60" autocomplete="off" placeholder="${esc(b.ejemplo || 'algo serio')}">
      <output aria-live="polite">Te dijeron que escribieras <span class="tacha">${esc(b.ejemplo || 'algo serio')}</span><span class="enmienda">y escribiste lo que quisiste.</span></output>
      <small>Enmienda tu propia frase. Nada se guarda.</small></form>`, clase: '' };
  },
  ruta(b) {
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<ol class="ruta">${(b.pasos || []).map(p => `<li><h3>${esc(p.titulo || '')}</h3><p>${enLinea(p.texto || '')}</p></li>`).join('')}</ol>${b.nota ? `<p class="nota-margen" style="margin-top:1.5rem">${esc(b.nota)}</p>` : ''}`;
  },
  envio(b, ctx) {
    return `<div class="columnas" style="--cols:2"><div>${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<div class="texto-md">${md(b.texto, ctx.u)}</div>
      <div class="botones" style="margin-top:1.5rem"><a class="boton boton--primario" href="${esc(ctx.mailto())}">${icono('correo')} ${esc(b.boton || 'Envía tu creación')}</a></div>
      <p class="meta" style="margin-top:1rem">Escribe a <a href="mailto:${esc(ctx.sitio.correo)}">${esc(ctx.sitio.correo)}</a></p></div>
      ${(b.requisitos || []).length ? `<div class="fondo-ficha" style="padding:1.5rem;border:1px solid var(--linea)"><p class="sobretitulo">Qué adjuntar</p><div class="texto-md"><ul>${b.requisitos.map(r => `<li>${enLinea(r.item || '')}</li>`).join('')}</ul></div></div>` : ''}</div>`;
  },
  preguntas(b, ctx) {
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<div class="preguntas">${(b.items || []).map(x => `<details><summary>${esc(x.pregunta || '')}</summary><div class="respuesta texto-md">${md(x.respuesta, ctx.u)}</div></details>`).join('')}</div>`;
  },
  linea_tiempo(b, ctx) {
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}<ol class="linea-tiempo">${(b.items || []).map(x => `<li><span class="meta">${esc(x.fecha || '')}</span><h3>${esc(x.titulo || '')}</h3><div class="texto-md">${md(x.texto, ctx.u)}</div></li>`).join('')}</ol>`;
  },
  llamado(b, ctx) {
    return `<div class="llamado"><div>${titulo(b.titulo, b.tachado, b.escrito)}${b.texto ? `<p>${enLinea(b.texto)}</p>` : ''}</div>${botones(b.botones, ctx)}</div>`;
  },
  descarga(b, ctx) {
    if (!b.archivo) return '';
    return `<a class="descarga" href="${esc(ctx.u(b.archivo))}" download>${icono('descarga')}<div><h3>${esc(b.titulo || 'Descargar')}</h3>${b.descripcion ? `<p>${esc(b.descripcion)}</p>` : ''}</div><span class="boton boton--chico" style="margin-left:auto">${esc(b.boton || 'Descargar')}</span></a>`;
  },
  pdf(b, ctx) {
    if (!b.archivo) return '';
    return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}<object data="${esc(ctx.u(b.archivo))}" type="application/pdf" style="width:100%;height:${+b.alto || 800}px;border:1px solid var(--linea)"><p><a class="boton" href="${esc(ctx.u(b.archivo))}">${icono('descarga')} Abrir el PDF</a></p></object>`;
  },
  mapa(b) {
    const src = b.url ? (b.url.match(/src="([^"]+)"/)?.[1] || b.url) : (b.lugar ? `https://www.google.com/maps?q=${encodeURIComponent(b.lugar)}&output=embed` : '');
    if (!src) return '';
    return `${b.titulo ? `<h2>${esc(b.titulo)}</h2>` : ''}<div class="mapa"><iframe src="${esc(src)}" loading="lazy" title="${esc(b.titulo || 'Mapa')}" referrerpolicy="no-referrer-when-downgrade"></iframe></div>${b.lugar ? `<p class="meta" style="margin-top:.75rem">${icono('lugar')} ${esc(b.lugar)}</p>` : ''}`;
  },
  redes(b, ctx) {
    return `${b.titulo ? `<h2>${enLinea(b.titulo)}</h2>` : ''}${b.texto ? `<p>${enLinea(b.texto)}</p>` : ''}${ctx.redes()}`;
  },
  separador(b) {
    if (b.estilo === 'parrafo') return '<hr class="parrafo">';
    if (b.estilo === 'linea') return '<hr class="separador-linea">';
    if (b.estilo === 'espacio') return '<div style="height:2rem"></div>';
    return `<div class="separador-atarraya">${atarraya({ variante: 'sencilla' })}</div>`;
  },
  html(b) { return `<div class="embed-libre">${b.codigo || ''}</div>`; },
};

function bloques(lista = [], ctx) {
  return (lista || []).map((b, i) => {
    if (!b || b.apariencia?.oculto) return '';
    const fn = R[b.tipo || b.type];
    if (!fn) return '';
    b._i = `${b.tipo}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    let r = fn(b, ctx);
    let extraClase = '';
    if (r && typeof r === 'object') { extraClase = r.clase || ''; r = r.html; }
    if (!r) return '';
    const a = b.apariencia || {};
    const fondo = a.fondo && a.fondo !== 'papel' ? `fondo-${a.fondo}` : '';
    const espacio = a.espacio === 'compacto' ? 'bloque--compacto' : a.espacio === 'amplio' ? 'bloque--amplio' : a.espacio === 'sin' ? 'bloque--sin-espacio' : '';
    const cont = a.ancho === 'lectura' ? 'contenedor--lectura' : a.ancho === 'ancho' ? 'contenedor--ancho' : 'contenedor';
    const completo = b.tipo === 'imagen' && b.tamano === 'completo';
    const alin = a.alineacion === 'centro' ? 'alinear-centro' : '';
    const id = a.ancla ? ` id="${esc(a.ancla.replace(/^#/, ''))}"` : '';
    if (b.tipo === 'portada') return `<section class="bloque portada ${fondo}"${id}><div class="contenedor">${r}</div></section>`;
    return `<section class="bloque bloque--${b.tipo} ${fondo} ${espacio} ${alin} ${extraClase}"${id}>${completo ? r : `<div class="${cont}">${r}</div>`}</section>`;
  }).join('\n');
}

module.exports = { bloques, botones, titulo, colorCss, video, audio, embedVideo };
