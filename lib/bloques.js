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
    return `<div class="encabezado-seccion"><div><h2>${enLinea(b.titulo || 'Agenda')}</h2></div><a class="boton boton--chico" href="${ctx.link('/agenda/')}">Toda la agenda ${icono('flecha')}</a></div>
      ${ev.length ? `<div class="agenda">${ev.map(e => ctx.evento(e)).join('')}</div>` : `<div class="vacio"><span class="mano">Pronto anunciamos lo que viene</span></div>`}`;
  },
  bitacora(b, ctx) {
    let en = ctx.bitacora;
    if (b.etiqueta) en = en.filter(e => (e.etiquetas || []).some(x => (x.etiqueta || x) === b.etiqueta));
    en = en.slice(0, +b.cantidad || 3);
    if (!en.length) return '';
    return `<div class="encabezado-seccion"><div><h2>${enLinea(b.titulo || 'Bitácora')}</h2></div><a class="boton boton--chico" href="${ctx.link('/bitacora/')}">Toda la bitácora ${icono('flecha')}</a></div><div class="entradas">${en.map(e => ctx.entrada(e)).join('')}</div>`;
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
      ${b.formulario !== false ? (() => {
        const plantilla = re => (b.requisitos || []).find(r => r.archivo && re.test(r.item || ''));
        const desc = (r, texto) => r ? `<a class="boton boton--chico" href="${esc(ctx.u(r.archivo))}" download>${icono('descarga')} ${esc(texto)}</a>` : '';
        const ficha = plantilla(/ficha/i), lic = plantilla(/licencia/i);
        return `<div class="botones" style="margin-top:1.5rem" data-abrir-envio-caja hidden><button class="boton boton--primario" type="button" data-abrir-envio>${icono('correo')} ${esc(b.boton || 'Envía tu creación')}</button></div>
      <form class="form-envio" id="formulario" data-form-envio hidden novalidate>
        <fieldset class="paso-envio"><legend><span>1</span> Tus datos</legend>
          <div class="form-envio__fila"><label class="campo-envio"><span>Nombre o seudónimo *</span><input name="nombre" required maxlength="120" autocomplete="name"></label>
          <label class="campo-envio"><span>Tu correo *</span><input name="correo" type="email" required maxlength="120" autocomplete="email"></label></div>
          <div class="form-envio__fila"><label class="campo-envio"><span>Género *</span><select name="genero" required><option value="">Elige…</option>${(() => {
            const textos = ['Poesía', 'Cuento', 'Microrrelato', 'Crónica', 'Ensayo', 'Fragmento de obra mayor', 'Dramaturgia'];
            const otros = ['Formas híbridas', 'Ilustración, collage o poesía visual', 'Fotografía', 'Historieta o cómic', 'Obra sonora o podcast', 'Videopoema o videoensayo', 'Cortometraje o performance', 'Narrativa digital', 'Narrativa para redes'];
            const extra = (ctx.colecciones || []).map(c => c.nombre).filter(n => n && !textos.includes(n) && !otros.includes(n));
            return `<optgroup label="Textos">${[...textos, ...extra].map(n => `<option>${esc(n)}</option>`).join('')}</optgroup><optgroup label="Otros formatos (llevan nota de obra)">${otros.map(n => `<option data-nota="1">${esc(n)}</option>`).join('')}</optgroup>`;
          })()}<option>Otro</option></select></label>
          <label class="campo-envio"><span>Título de la obra *</span><input name="titulo" required maxlength="160"></label></div></fieldset>
        <fieldset class="paso-envio"><legend><span>2</span> Tu obra</legend>
          <p class="paso-envio__ayuda">Texto, audio, imagen o video. Súbela <b>sin tu nombre</b> dentro: la evalúan sin saber quién la hizo.</p>
          <label class="campo-envio"><span>Archivo de la obra (hasta 20 MB)</span><input name="obra" type="file" accept=".doc,.docx,.pdf,.odt,.rtf,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.m4a,.wav,.ogg,.mp4,.mov,.m4v,.webm,.zip"></label>
          <label class="campo-envio"><span>…o un enlace, si pesa más (video, audio)</span><input name="enlace" type="url" inputmode="url" placeholder="https://" maxlength="500"></label>
          <p class="paso-envio__ayuda paso-envio__ayuda--chica">Para el enlace usa un video de YouTube «no listado» o un archivo de Google Drive compartido con «cualquier persona con el enlace», sin tu nombre a la vista.</p></fieldset>
        <fieldset class="paso-envio"><legend><span>3</span> Ficha de autor</legend>
          <p class="paso-envio__ayuda">${ficha ? 'Descarga la plantilla, llénala con tus datos y súbela aquí <b>en Word</b>.' : 'Sube tu ficha de autor con tus datos y tu biografía, <b>en Word</b>.'}</p>
          ${desc(ficha, 'Descargar la ficha (Word)')}
          <label class="campo-envio"><span>Ficha llena, en Word *</span><input name="ficha" type="file" required accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label></fieldset>
        <fieldset class="paso-envio"><legend><span>4</span> Licencia de uso</legend>
          <p class="paso-envio__ayuda">${lic ? 'Descarga la licencia, fírmala y súbela aquí <b>en PDF</b>.' : 'Sube la licencia de uso firmada, <b>en PDF</b>.'}</p>
          ${desc(lic, 'Descargar la licencia (Word)')}
          <label class="campo-envio"><span>Licencia firmada, en PDF *</span><input name="licencia" type="file" required accept=".pdf,application/pdf"></label></fieldset>
        <fieldset class="paso-envio"><legend><span>5</span> Otros <small>(opcional)</small></legend>
          <p class="paso-envio__ayuda">¿Algo más que acompañe tu obra? Fotos, ilustraciones, audio, partituras, un PDF… Hasta 5 archivos.</p>
          <label class="campo-envio"><span>Otros archivos</span><input name="otros" type="file" multiple accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.m4a,.wav,.ogg,.mp4,.mov,.zip"></label></fieldset>
        <fieldset class="paso-envio"><legend><span>6</span> Nota de obra <small data-nota-etiqueta>(opcional en textos)</small></legend>
          <p class="paso-envio__ayuda">Hasta 150 palabras sobre la búsqueda, el proceso o el contexto de tu obra. Se publica junto a ella. <b>Es obligatoria en las obras de otros formatos</b> (visuales, sonoras, audiovisuales, digitales e híbridas).</p>
          <label class="campo-envio"><span data-nota-campo>Nota de obra (máximo 150 palabras)</span><textarea name="nota" rows="4" maxlength="1200"></textarea></label></fieldset>
        <fieldset class="paso-envio"><legend><span>7</span> Mensaje para la gaceta <small>(opcional)</small></legend>
          <p class="paso-envio__ayuda">¿Algo que quieras contarnos? Dudas, contexto, agradecimientos, lo que sea: lo lee el equipo editorial, no los evaluadores.</p>
          <label class="campo-envio"><span>Tu mensaje</span><textarea name="mensaje" rows="6" maxlength="4000"></textarea></label></fieldset>
        <label class="campo-envio campo-envio--trampa" aria-hidden="true"><span>No llenar</span><input name="sitio_web" tabindex="-1" autocomplete="off"></label>
        <label class="chequeo-envio"><input type="checkbox" name="acepto" required><span>Declaro que la obra es de mi autoría y acepto la <a href="${esc(ctx.link('/privacidad/'))}" target="_blank">política de tratamiento de datos</a>.</span></label>
        <div class="botones"><button class="boton boton--primario" type="submit">${icono('correo')} Enviar mi creación</button></div>
        <p class="meta form-envio__estado" data-estado-envio role="status" aria-live="polite"></p>
      </form>`; })() : ''}
      <div class="botones" style="margin-top:1.5rem" data-envio-correo><a class="boton boton--primario" href="${esc(ctx.mailto())}">${icono('correo')} ${esc(b.boton || 'Envía tu creación')}</a></div>
      <p class="meta" style="margin-top:1rem">${b.formulario !== false ? '<span data-envio-o hidden>¿Prefieres tu correo? </span>' : ''}Escribe a <a href="${esc(ctx.mailto())}">${esc(ctx.sitio.correo)}</a></p></div>
      <div>${(b.manuales || []).filter(m => m.archivo).length ? `<div class="fondo-ficha manuales-envio" style="padding:1.5rem;border:1px solid var(--linea);margin-bottom:1.25rem"><p class="sobretitulo">${esc(b.titulo_manuales || 'Manuales para autores')}</p>${b.texto_manuales ? `<p class="manuales-envio__texto">${enLinea(b.texto_manuales)}</p>` : ''}<ul class="manuales-envio__lista">${b.manuales.filter(m => m.archivo).map(m => `<li><a href="${esc(ctx.u(m.archivo))}" target="_blank" rel="noopener">${icono('descarga')}<span><b>${esc(m.titulo || 'Manual')}</b>${m.descripcion ? `<small>${esc(m.descripcion)}</small>` : ''}</span></a></li>`).join('')}</ul></div>` : ''}
      ${(b.requisitos || []).length ? `<div class="fondo-ficha" style="padding:1.5rem;border:1px solid var(--linea)"><p class="sobretitulo">Qué adjuntar</p><div class="texto-md"><ul>${b.requisitos.map(r => `<li>${enLinea(r.item || '')}${r.archivo ? `<br><a class="boton boton--chico requisito__descarga" href="${esc(ctx.u(r.archivo))}" download>${icono('descarga')} ${esc(r.boton || 'Descargar plantilla')}</a>` : ''}</li>`).join('')}</ul></div>${b.requisitos.some(r => r.archivo) ? (b.formulario !== false ? '<p class="meta" style="margin-top:1rem">Descarga las plantillas, llénalas y súbelas en el formulario junto con la obra.</p>' : '<p class="meta" style="margin-top:1rem">Descarga las plantillas, llénalas y adjúntalas a tu correo junto con la obra.</p>') : ''}</div>` : ''}</div></div>`;
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

// Sobretítulo rojo y texto gris para cualquier bloque (si el bloque no los dibuja por su cuenta)
const PROPIO_SOBRE = ['portada', 'encabezado', 'fichas', 'colecciones', 'separador', 'html'];
const PROPIA_BAJADA = ['portada', 'encabezado', 'separador', 'html'];
function encabezar(b, r) {
  const sobre = !PROPIO_SOBRE.includes(b.tipo) && b.sobretitulo ? `<p class="sobretitulo">${esc(b.sobretitulo)}</p>` : '';
  const baj = !PROPIA_BAJADA.includes(b.tipo) && b.bajada ? `<p class="bajada-bloque">${enLinea(b.bajada)}</p>` : '';
  if (!sobre && !baj) return r;
  const m = r.match(/<h[12][\s>]/);
  if (!m) return sobre + baj + r;
  const ini = m.index;
  const fin = r.indexOf('</h', ini);
  const cierre = fin >= 0 ? r.indexOf('>', fin) + 1 : ini;
  return r.slice(0, ini) + sobre + r.slice(ini, cierre) + baj + r.slice(cierre);
}

// Imagen o animación al lado del contenido
function alLado(b, r, ctx) {
  const l = b.lado;
  if (!l || !l.archivo || ['portada', 'separador', 'html', 'imagen', 'galeria', 'video'].includes(b.tipo)) return r;
  const src = esc(ctx.u(l.archivo));
  const esVideo = /\.(mp4|webm|mov)(\?|$)/i.test(l.archivo);
  const media = esVideo
    ? `<video src="${src}" autoplay loop muted playsinline preload="auto" aria-label="${esc(l.alt || '')}"></video>`
    : `<img src="${src}" alt="${esc(l.alt || '')}" loading="lazy">`;
  return `<div class="con-lado lado-${l.posicion === 'izquierda' ? 'izq' : 'der'} tam-${esc(l.tamano || 'm')}${l.celular === false ? ' sin-movil' : ''}" style="align-items:${({ start: 'start', end: 'end' })[l.vertical] || 'center'}">
    <div class="con-lado__contenido">${r}</div>
    <figure class="con-lado__media">${media}${l.pie ? `<figcaption>${esc(l.pie)}</figcaption>` : ''}</figure>
  </div>`;
}

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
    r = encabezar(b, r);
    r = alLado(b, r, ctx);
    const a = b.apariencia || {};
    const fondo = a.fondo && a.fondo !== 'papel' ? `fondo-${a.fondo}` : '';
    // Espacio: nuevo (arriba/abajo por separado) o el antiguo «espacio» si el bloque ya lo traía
    const viejo = { compacto: '1', amplio: '4', sin: '0', normal: '3' }[a.espacio] || '3';
    const ea = a.espacio_arriba ?? viejo, eb = a.espacio_abajo ?? viejo;
    const espacio = `ea-${ea} eb-${eb}`;
    const cont = a.ancho === 'lectura' ? 'contenedor--lectura' : a.ancho === 'ancho' ? 'contenedor--ancho' : 'contenedor';
    const completo = b.tipo === 'imagen' && b.tamano === 'completo';
    const alin = a.alineacion === 'centro' ? 'alinear-centro' : '';
    const id = a.ancla ? ` id="${esc(a.ancla.replace(/^#/, ''))}"` : '';
    if (b.tipo === 'portada') return `<section class="bloque portada ${fondo}"${id}><div class="contenedor">${r}</div></section>`;
    return `<section class="bloque bloque--${b.tipo} ${fondo} ${espacio} ${alin} ${extraClase}"${id}>${completo ? r : `<div class="${cont}">${r}</div>`}</section>`;
  }).join('\n');
}

module.exports = { bloques, botones, titulo, colorCss, video, audio, embedVideo };
