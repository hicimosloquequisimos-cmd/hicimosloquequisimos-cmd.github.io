/* =========================================================
   Lectores · Hicimos lo que quisimos
   Cuentas con Google, likes, obras guardadas, seguir autores y
   verificación de autores. Configuración en lectores-config.js
   ========================================================= */
(function () {
  'use strict';
  var C = window.LECTORES || {};
  if (!C.servidor && !C.demo) return; // sin servidor: nada de esto aparece
  document.documentElement.classList.add('con-lectores');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var BASE = (document.querySelector('link[rel=icon]') || { getAttribute: function () { return '/favicon.svg'; } }).getAttribute('href').replace(/\/favicon\.svg$/, '');
  var MARCA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1z" fill="currentColor"/></svg>';
  var CORAZON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" fill="currentColor"/></svg>';
  var VERIF = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2l2.4 2.1 3.2-.4.9 3.1 2.8 1.6-1 3.1 1 3.1-2.8 1.6-.9 3.1-3.2-.4L12 22l-2.4-2.1-3.2.4-.9-3.1-2.8-1.6 1-3.1-1-3.1 2.8-1.6.9-3.1 3.2.4z" fill="currentColor"/><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- Sesión ----------
  var S = { token: null, lector: null };
  try { var g = JSON.parse(localStorage.getItem('lectores-sesion') || 'null'); if (g) S = g; } catch (e) { }
  function guardar() { try { localStorage.setItem('lectores-sesion', JSON.stringify(S)); } catch (e) { } pintarCuenta(); }
  function salirLocal() { S = { token: null, lector: null }; guardar(); }

  function api(accion, datos) {
    var cuerpo = Object.assign({ accion: accion, token: S.token }, datos || {});
    if (C.demo) return Demo.llamar(cuerpo);
    return fetch(C.servidor, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(cuerpo) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r.ok) { if (r.sesion === false) salirLocal(); var e = new Error(r.error || 'Algo salió mal'); e.sesion = r.sesion; throw e; }
        return r;
      });
  }
  function aviso(t) {
    var el = $('[data-toast]'); if (!el) return alert(t);
    el.textContent = t; el.classList.add('visible'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('visible'); }, 2800);
  }

  // ---------- Ventanas ----------
  function modal(html, alAbrir) {
    cerrarModal();
    var f = document.createElement('div'); f.className = 'lec-fondo'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true');
    f.innerHTML = '<div class="lec-modal"><button class="lec-x" type="button" aria-label="Cerrar">✕</button>' + html + '</div>';
    document.body.appendChild(f); document.body.style.overflow = 'hidden';
    f.addEventListener('click', function (e) { if (e.target === f || e.target.closest('.lec-x') || e.target.closest('[data-cerrar]')) cerrarModal(); });
    if (alAbrir) alAbrir($('.lec-modal', f));
    var p = $('input, textarea, button:not(.lec-x)', f); if (p) p.focus();
  }
  function cerrarModal() { $$('.lec-fondo').forEach(function (x) { x.remove(); }); document.body.style.overflow = ''; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarModal(); });

  // ---------- Entrar con Google ----------
  var pendiente = null; // acción que se repite al terminar de entrar
  var gsiCargado = null;
  function cargarGoogle() {
    if (C.demo) return Promise.resolve();
    if (gsiCargado) return gsiCargado;
    gsiCargado = new Promise(function (ok, mal) {
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { window.google.accounts.id.initialize({ client_id: C.clienteGoogle, callback: function (r) { conCredencial(r.credential); }, ux_mode: 'popup', use_fedcm_for_prompt: true }); ok(); };
      s.onerror = function () { mal(new Error('No se pudo cargar el inicio de sesión de Google.')); };
      document.head.appendChild(s);
    });
    return gsiCargado;
  }
  function pedirEntrar(motivo, luego) {
    pendiente = luego || null;
    modal('<p class="sobretitulo">Tu cuenta en la gaceta</p><h2 class="lec-titulo">' + esc(motivo || 'Entra para guardar lo que te gusta') + '</h2>' +
      '<p class="lec-suave">Con tu cuenta puedes dar like a las obras, guardar las que quieras releer y seguir a tus autores para enterarte cuando publiquen. Solo necesitas tu cuenta de Google: no hay contraseñas nuevas.</p>' +
      '<div class="lec-google" data-google></div><p class="lec-legal">Al entrar aceptas nuestra <a href="' + BASE + '/privacidad/" target="_blank">política de privacidad</a>.</p>', function (m) {
        var caja = $('[data-google]', m);
        if (C.demo) { caja.innerHTML = '<button class="boton boton--indigo" type="button">Continuar con Google (demo)</button>'; $('button', caja).onclick = function () { conCredencial(Demo.credencial()); }; return; }
        caja.innerHTML = '<p class="lec-suave">Cargando…</p>';
        cargarGoogle().then(function () {
          caja.innerHTML = '';
          window.google.accounts.id.renderButton(caja, { theme: document.documentElement.dataset.tema === 'oscuro' ? 'filled_black' : 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: 280 });
        }, function (e) { caja.innerHTML = '<p class="lec-suave">' + esc(e.message) + '</p>'; });
      });
  }
  function conCredencial(cred, acepto) {
    api('entrar', { credencial: cred, acepto: !!acepto }).then(function (r) {
      if (r.necesitaAceptar) return pedirConsentimiento(cred, r);
      S.token = r.token; S.lector = r.lector; guardar(); cerrarModal();
      aviso('¡Hola, ' + (r.lector.nombre || '').split(' ')[0] + '!');
      paginas();
      refrescar().then(function () { if (pendiente) { var f = pendiente; pendiente = null; f(); } });
    }, function (e) { aviso(e.message); });
  }
  function pedirConsentimiento(cred, r) {
    modal('<p class="sobretitulo">Antes de crear tu cuenta</p><h2 class="lec-titulo">Hola, ' + esc((r.nombre || '').split(' ')[0]) + '</h2>' +
      '<p class="lec-suave">Para tu cuenta guardamos tu <b>nombre</b>, tu <b>correo</b> y tu <b>foto de Google</b>, junto con tus likes, las obras que guardas y los autores que sigues. Los usamos solo para el funcionamiento de la gaceta y para avisarte de obras nuevas de quienes sigues. No los compartimos con nadie y puedes borrar tu cuenta cuando quieras desde tu perfil.</p>' +
      '<label class="lec-chequeo"><input type="checkbox" data-acepto> Leí y acepto la <a href="' + BASE + '/privacidad/" target="_blank">política de tratamiento de datos</a> de la gaceta.</label>' +
      '<div class="botones" style="margin-top:1.2rem"><button class="boton boton--primario" type="button" data-crear disabled>Crear mi cuenta</button><button class="boton" type="button" data-cerrar>Ahora no</button></div>', function (m) {
        var c = $('[data-acepto]', m), b = $('[data-crear]', m);
        c.onchange = function () { b.disabled = !c.checked; };
        b.onclick = function () { b.disabled = true; conCredencial(cred, true); };
      });
  }
  function conCuenta(motivo, fn) { if (S.token) fn(); else pedirEntrar(motivo, fn); }

  // ---------- Cabecera: botón de cuenta ----------
  function pintarCuenta() {
    $$('[data-cuenta]').forEach(function (c) {
      c.hidden = false;
      if (!S.token) { c.innerHTML = '<button class="boton boton--chico lec-entrar" type="button" data-entrar aria-label="Entrar a tu cuenta"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.6 4.4-5.5 8-5.5s6.5 1.9 8 5.5"/></svg><span>Entrar</span></button>'; return; }
      var l = S.lector || {};
      c.innerHTML = '<button class="lec-avatar-btn" type="button" aria-haspopup="true" aria-label="Mi cuenta">' + avatar(l) + '</button>';
    });
  }
  function avatar(l, grande) {
    var ini = esc((l.nombre || '?').trim()[0] || '?');
    return '<span class="lec-avatar' + (grande ? ' lec-avatar--g' : '') + '">' + (l.foto ? '<img src="' + esc(l.foto) + '" alt="" referrerpolicy="no-referrer">' : ini) + '</span>';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-entrar]')) { pedirEntrar(); return; }
    var av = e.target.closest('.lec-avatar-btn');
    var menu = $('.lec-menu');
    if (menu && !e.target.closest('.lec-menu')) menu.remove();
    if (av && !menu) {
      var l = S.lector || {};
      var m = document.createElement('div'); m.className = 'lec-menu';
      m.innerHTML = '<div class="lec-menu__yo">' + avatar(l) + '<div><b>' + esc(l.nombre) + '</b><small>' + esc(l.correo || '') + '</small></div></div>' +
        '<a href="' + BASE + '/perfil/">Mi perfil y obras guardadas</a>' + (l.autor ? '<a href="' + BASE + '/autor/' + esc(l.autor) + '/">Mi página de autor</a>' : '') +
        '<button type="button" data-salir>Salir</button>';
      var r = av.getBoundingClientRect(); m.style.top = (r.bottom + window.scrollY + 8) + 'px'; m.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
      document.body.appendChild(m);
    }
    if (e.target.closest('[data-salir]')) { api('salir').catch(function () { }); salirLocal(); $$('.lec-menu').forEach(function (x) { x.remove(); }); aviso('Saliste de tu cuenta'); refrescar(); paginas(); }
  });

  // ---------- Likes y seguir ----------
  var ESTADO = { likes: {}, seguidores: {}, verificados: {}, mios: [], guardadas: [], sigo: [], solicitudesPendientes: [] };
  function refrescar() {
    var obras = $$('[data-like]').map(function (b) { return b.dataset.like; });
    var autores = $$('[data-autor-acciones]').map(function (b) { return b.dataset.autorAcciones; });
    if (!obras.length && !autores.length) return Promise.resolve();
    return api('estado', { obras: obras, autores: autores }).then(function (r) {
      ESTADO = r; if (r.lector && S.token) { S.lector = r.lector; guardar(); }
      pintarLikes(); pintarAutores();
    }, function () { pintarLikes(); pintarAutores(); });
  }
  function pintarLikes() {
    $$('[data-like]').forEach(function (b) {
      var o = b.dataset.like, n = ESTADO.likes[o] || 0, mio = (ESTADO.mios || []).indexOf(o) > -1;
      b.hidden = false; b.setAttribute('aria-pressed', mio ? 'true' : 'false');
      b.setAttribute('aria-label', (mio ? 'Quitar me gusta' : 'Me gusta') + ' · ' + n);
      b.innerHTML = CORAZON + '<span>' + n + '</span>';
      b.title = mio ? 'Te gusta' : 'Me gusta';
    });
    $$('[data-guardar]').forEach(function (b) {
      var g = (ESTADO.guardadas || []).indexOf(b.dataset.guardar) > -1;
      b.hidden = false; b.setAttribute('aria-pressed', g ? 'true' : 'false');
      b.innerHTML = MARCA + '<span>' + (g ? 'Guardada' : 'Guardar') + '</span>';
      b.title = g ? 'Está en tus obras guardadas · quitar' : 'Guardar para leer después';
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-guardar]'); if (!b) return;
    conCuenta('Entra para guardar obras', function () {
      var o = b.dataset.guardar, si = (ESTADO.guardadas || []).indexOf(o) < 0;
      ESTADO.guardadas = si ? (ESTADO.guardadas || []).concat(o) : ESTADO.guardadas.filter(function (x) { return x !== o; });
      pintarLikes();
      api('guardar', { obra: o, si: si }).then(function () { aviso(si ? 'Guardada en tu perfil' : 'Quitada de tus obras guardadas'); }, function (er) { aviso(er.message); refrescar(); });
    });
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-like]'); if (!b) return;
    conCuenta('Entra para dar like', function () {
      var o = b.dataset.like, si = (ESTADO.mios || []).indexOf(o) < 0;
      // respuesta inmediata
      ESTADO.likes[o] = (ESTADO.likes[o] || 0) + (si ? 1 : -1);
      ESTADO.mios = si ? (ESTADO.mios || []).concat(o) : ESTADO.mios.filter(function (x) { return x !== o; });
      pintarLikes(); if (si) { b.classList.remove('lec-late'); void b.offsetWidth; b.classList.add('lec-late'); }
      api('like', { obra: o, si: si }).then(function (r) { ESTADO.likes[o] = r.total; pintarLikes(); if (si) aviso('Te gusta ♥'); }, function (er) { aviso(er.message); refrescar(); });
    });
  });
  function pintarAutores() {
    $$('[data-autor-acciones]').forEach(function (c) {
      var a = c.dataset.autorAcciones, n = ESTADO.seguidores[a] || 0, sigo = (ESTADO.sigo || []).indexOf(a) > -1;
      var verif = !!(ESTADO.verificados || {})[a], esMio = S.lector && S.lector.autor === a;
      var pend = (ESTADO.solicitudesPendientes || []).indexOf(a) > -1;
      c.hidden = false;
      var cv = (ESTADO.verificados || {})[a];
      c.innerHTML = (verif && typeof cv === 'object' && cv.nombre ? '<div class="lec-cuenta-autor">' + avatar(cv) + '<span><b>' + esc(cv.nombre) + '</b><small>Cuenta de lector verificada en la gaceta</small></span></div>' : '') + '<div class="lec-autor">' +
        (verif ? '<span class="lec-verif">' + VERIF + 'Perfil verificado</span>' : '') +
        '<button class="boton boton--chico ' + (sigo ? '' : 'boton--indigo') + '" type="button" data-seguir aria-pressed="' + sigo + '">' + (sigo ? '✓ Siguiendo' : '+ Seguir') + '</button>' +
        '<span class="lec-cuenta"><b>' + n + '</b> ' + (n === 1 ? 'seguidor' : 'seguidores') + '</span>' +
        (esMio ? '<a class="boton boton--chico" href="' + BASE + '/perfil/">Mi panel de autor</a>' : '') +
        '</div>' +
        (!verif && !(S.lector && S.lector.autor) ? (pend ? '<p class="lec-reclamar">Tu solicitud para vincular este perfil está en revisión.</p>' : '<p class="lec-reclamar">¿Eres tú? Crea tu cuenta de lector y, desde <a href="' + BASE + '/perfil/">tu perfil</a>, vincúlala a esta página de autor.</p>') : '');
      var nombre = c.dataset.nombre || 'este autor';
      $('[data-seguir]', c).onclick = function () {
        conCuenta('Entra para seguir a ' + nombre, function () {
          var si = (ESTADO.sigo || []).indexOf(a) < 0;
          ESTADO.sigo = si ? (ESTADO.sigo || []).concat(a) : ESTADO.sigo.filter(function (x) { return x !== a; });
          ESTADO.seguidores[a] = (ESTADO.seguidores[a] || 0) + (si ? 1 : -1); pintarAutores();
          api('seguir', { autor: a, si: si }).then(function (r) { ESTADO.seguidores[a] = r.total; pintarAutores(); aviso(si ? 'Te avisaremos cuando ' + nombre + ' publique algo nuevo' : 'Dejaste de seguir a ' + nombre); }, function (er) { aviso(er.message); refrescar(); });
        });
      };
    });
  }
  var CORREO_GACETA = (window.LECTORES && window.LECTORES.correoGaceta) || 'hicimosloquequisimos@gmail.com';
  function correoVinculo(nombre, id) {
    var asunto = 'Vinculación de perfil de autor · ' + nombre;
    var cuerpo = 'Hola, equipo de Hicimos lo que quisimos:\n\nPido vincular mi cuenta de lector de la gaceta a mi perfil de autor «' + nombre + '».\n\nCuenta de Google con la que entré a la gaceta: ' + (S.lector.correo || '') + '\nCódigo de la solicitud: ' + id + '\n\nLes escribo desde el mismo correo con el que envié mi texto a la gaceta.\n\nGracias.';
    return 'mailto:' + CORREO_GACETA + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  }
  function reclamar(a, nombre, listo) {
    if (S.lector && S.lector.autor) return aviso('Tu cuenta ya está vinculada a un perfil de autor.');
    modal('<p class="sobretitulo">Vincular con perfil de autor</p><h2 class="lec-titulo">¿Eres ' + esc(nombre) + '?</h2>' +
      '<p class="lec-suave">Para que nadie se haga pasar por otra persona, te pedimos una prueba sencilla: <b>escribirnos desde el mismo correo con el que enviaste tu texto a la gaceta.</b></p>' +
      '<ol class="lec-suave" style="padding-left:1.2rem"><li>Pulsa <b>Enviar solicitud</b>.</li><li>Se abrirá tu correo con un mensaje listo para <b>' + esc(CORREO_GACETA) + '</b>.</li><li>Envíalo <b>desde el correo con el que mandaste tu texto</b> (si es otro, cópialo y envíalo desde ese).</li></ol>' +
      '<p class="lec-suave">Cuando lo confirmemos, tu cuenta (<b>' + esc(S.lector.correo || '') + '</b>) quedará vinculada y tu página de autor mostrará el sello de verificado.</p>' +
      '<div class="botones" style="margin-top:1rem"><button class="boton boton--primario" type="button" data-enviar>Enviar solicitud</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) {
        $('[data-enviar]', m).onclick = function () {
          var b = this; b.disabled = true;
          api('solicitar', { autor: a, mensaje: 'Solicitud por correo' }).then(function (res) {
            var id = (res.solicitud && res.solicitud.id) || '';
            var enlace = correoVinculo(nombre, id);
            cerrarModal(); ESTADO.solicitudesPendientes = (ESTADO.solicitudesPendientes || []).concat(a);
            try { location.href = enlace; } catch (e) { }
            modal('<p class="sobretitulo">Falta un paso</p><h2 class="lec-titulo">Envía el correo</h2><p class="lec-suave">Tu solicitud quedó registrada, pero solo la podemos aprobar cuando nos llegue tu correo <b>desde la dirección con la que enviaste tu texto</b>.</p><p class="lec-suave">Si no se abrió tu correo, escribe a <b>' + esc(CORREO_GACETA) + '</b> con el asunto «Vinculación de perfil de autor · ' + esc(nombre) + '» y el código <b>' + esc(id) + '</b>.</p><div class="botones"><a class="boton boton--primario" href="' + esc(enlace) + '">Abrir el correo otra vez</a><button class="boton boton--indigo" type="button" data-cerrar>Listo</button></div>');
            if (listo) listo();
          }, function (er) { aviso(er.message); b.disabled = false; });
        };
      });
  }


  // ---------- Datos públicos del sitio ----------
  var _obras = null, _autores = null;
  function obrasSitio() { return _obras || (_obras = fetch(BASE + '/obras.json').then(function (r) { return r.json(); }).catch(function () { return []; })); }
  function autoresSitio() { return _autores || (_autores = fetch(BASE + '/autores.json').then(function (r) { return r.json(); }).catch(function () { return []; })); }
  var rutaObra = function (o) { return o.url.replace(/^https?:\/\/[^/]+/, ''); };

  // ---------- Página: Mi perfil ----------
  function paginaPerfil(c) {
    if (!S.token) {
      c.innerHTML = '<div class="vacio"><span class="mano">Tu rincón en la gaceta</span><p>Entra con tu cuenta de Google para ver tus obras guardadas y los autores que sigues.</p><button class="boton boton--primario" type="button" data-entrar>Entrar</button></div>';
      return;
    }
    c.innerHTML = '<p class="lec-suave">Cargando tu perfil…</p>';
    Promise.all([api('perfil'), obrasSitio(), autoresSitio()]).then(function (res) {
      var r = res[0], obras = res[1], autores = res[2], l = r.lector;
      S.lector = l; guardar();
      var porCodigo = {}; obras.forEach(function (o) { porCodigo[o.codigo] = o; });
      var porSlug = {}; autores.forEach(function (a) { porSlug[a.slug] = a; });
      var favs = (r.guardadas || []).map(function (k) { return porCodigo[k]; }).filter(Boolean);
      var sig = r.siguiendo.map(function (s) { return porSlug[s]; }).filter(Boolean);
      var html = '<div class="lec-perfil-cab">' + avatar(l, true) + '<div><h1>' + esc(l.nombre) + '</h1><p class="lec-suave">' + esc(l.correo) + (l.autor && porSlug[l.autor] ? ' · <span class="lec-verif">' + VERIF + 'Autor verificado</span>' : '') + '</p>' +
        (l.equipo ? '<p class="lec-equipo">Equipo de la gaceta · ' + esc(l.equipo.miembro) + (l.equipo.rol ? ' · ' + esc(l.equipo.rol) : '') + '</p><div class="botones" style="margin-top:.6rem"><a class="boton boton--chico" href="' + BASE + '/equipo-editorial/">Mi ficha en el equipo</a>' + (l.autor ? '<a class="boton boton--chico" href="' + BASE + '/autor/' + esc(l.autor) + '/">Mi página de autor</a>' : '') + '</div>' : '') +
        '</div></div>';
      if (r.panelAutor) html += '<section class="lec-seccion"><h2>Mi panel de autor</h2><div class="lec-panel" data-panel-autor><p class="lec-suave">Cargando tus cifras…</p></div></section>';
      html += '<section class="lec-seccion"><h2>Obras guardadas <span class="lec-num">' + favs.length + '</span></h2>' + (favs.length ? '<ul class="lec-lista">' + favs.map(function (o) { return '<li><a href="' + esc(rutaObra(o)) + '"><b>' + esc(o.titulo) + '</b><small>' + esc((o.autores || []).join(', ')) + ' · ' + esc(o.coleccion) + '</small></a><button class="lec-quitar" type="button" data-quitar-guardada="' + esc(o.codigo) + '" aria-label="Quitar de guardadas" title="Quitar de guardadas">' + MARCA + '</button></li>'; }).join('') + '</ul>' : '<div class="vacio"><p>Toca <b>Guardar</b> en las obras que quieras releer y aparecerán aquí.</p><a class="boton boton--chico" href="' + BASE + '/archivo/">Explorar el archivo</a></div>') + '</section>';
      html += '<section class="lec-seccion"><h2>Autores que sigo <span class="lec-num">' + sig.length + '</span></h2>' + (sig.length ? '<ul class="lec-lista">' + sig.map(function (a) { return '<li><a href="' + BASE + '/autor/' + esc(a.slug) + '/"><b>' + esc(a.nombre) + '</b><small>' + a.obras + (a.obras === 1 ? ' obra' : ' obras') + '</small></a><button class="boton boton--chico" type="button" data-dejar="' + esc(a.slug) + '">Dejar de seguir</button></li>'; }).join('') + '</ul>' : '<div class="vacio"><p>Sigue a tus autores desde su página y te avisaremos cuando publiquen.</p><a class="boton boton--chico" href="' + BASE + '/autores/">Ver autores</a></div>') + '</section>';
      var pendiente = r.solicitudes.filter(function (x) { return x.estado === 'pendiente'; })[0];
      if (!l.autor) html += '<section class="lec-seccion"><h2>Vincular con perfil de autor</h2>' + (pendiente
        ? '<p class="lec-suave">Tu solicitud para <b>' + esc(pendiente.autorNombre) + '</b> está en revisión. Recuerda enviarnos el correo desde la dirección con la que enviaste tu texto.</p><div class="botones"><a class="boton boton--chico" href="' + esc(correoVinculo(pendiente.autorNombre, pendiente.id || '')) + '">Abrir el correo otra vez</a></div>'
        : '<p class="lec-suave">¿Publicaste en la gaceta? Busca tu perfil de autor y pide que lo vinculemos a tu cuenta.</p><input class="lec-area" type="search" data-buscar-autor placeholder="Escribe tu nombre o seudónimo" autocomplete="off" style="min-height:0;padding:.6rem .8rem"><ul class="lec-lista" data-resultados-autor></ul>') + '</section>';
      if (r.solicitudes.length) html += '<section class="lec-seccion"><h2>Mis solicitudes de autor</h2><ul class="lec-lista">' + r.solicitudes.map(function (s) { return '<li><span><b>' + esc(s.autorNombre) + '</b><small>' + ({ pendiente: 'En revisión', aprobada: 'Aprobada ✓', rechazada: 'No aprobada' }[s.estado] || s.estado) + (s.nota ? ' · ' + esc(s.nota) : '') + '</small></span></li>'; }).join('') + '</ul></section>';
      html += '<section class="lec-seccion"><h2>Mi cuenta</h2><label class="lec-chequeo"><input type="checkbox" data-avisos ' + (l.avisos ? 'checked' : '') + '> Avisarme por correo cuando publiquen los autores que sigo</label>' +
        '<div class="botones" style="margin-top:1rem"><button class="boton boton--chico" type="button" data-salir>Salir</button><button class="boton boton--chico lec-peligro" type="button" data-borrar-cuenta>Borrar mi cuenta</button></div>' +
        '<p class="lec-legal">Consulta nuestra <a href="' + BASE + '/privacidad/">política de privacidad</a>.</p></section>';
      c.innerHTML = html;
      $$('[data-quitar-guardada]', c).forEach(function (b) { b.onclick = function () { api('guardar', { obra: b.dataset.quitarGuardada, si: false }).then(function () { b.closest('li').remove(); aviso('Quitada de tus obras guardadas'); }); }; });
      $$('[data-dejar]', c).forEach(function (b) { b.onclick = function () { api('seguir', { autor: b.dataset.dejar, si: false }).then(function () { b.closest('li').remove(); aviso('Dejaste de seguirlo'); }); }; });
      $('[data-avisos]', c).onchange = function () { var x = this.checked; api('avisos', { si: x }).then(function () { aviso(x ? 'Avisos por correo activados' : 'Avisos por correo apagados'); }); };
      $('[data-borrar-cuenta]', c).onclick = function () {
        modal('<h2 class="lec-titulo">¿Borrar tu cuenta?</h2><p class="lec-suave">Se borran tus likes, tus obras guardadas, los autores que sigues y tus datos. Si eres autor verificado, tu página pierde el sello. <b>No se puede deshacer.</b></p><div class="botones"><button class="boton boton--primario" type="button" data-si>Sí, borrar mi cuenta</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) {
          $('[data-si]', m).onclick = function () { api('borrarCuenta').then(function () { salirLocal(); cerrarModal(); c.innerHTML = '<div class="vacio"><span class="mano">Tu cuenta fue borrada</span><p>Gracias por leer la gaceta. Puedes volver cuando quieras.</p></div>'; }, function (e) { aviso(e.message); }); };
        });
      };
      var ba = $('[data-buscar-autor]', c);
      if (ba) {
        var sinTilde = function (t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
        var lista = $('[data-resultados-autor]', c);
        ba.oninput = function () {
          var q = sinTilde(ba.value.trim());
          var res = q.length < 2 ? [] : autores.filter(function (a) { return sinTilde(a.nombre).indexOf(q) > -1; }).slice(0, 8);
          lista.innerHTML = q.length < 2 ? '' : res.length ? res.map(function (a) { return '<li><a href="' + BASE + '/autor/' + esc(a.slug) + '/" target="_blank"><b>' + esc(a.nombre) + '</b><small>' + a.obras + (a.obras === 1 ? ' obra' : ' obras') + '</small></a><button class="boton boton--chico boton--primario" type="button" data-vincular="' + esc(a.slug) + '" data-nombre="' + esc(a.nombre) + '">Soy yo</button></li>'; }).join('') : '<li><span class="lec-suave">No encontramos ese nombre. Prueba con tu seudónimo.</span></li>';
          $$('[data-vincular]', lista).forEach(function (b) { b.onclick = function () { reclamar(b.dataset.vincular, b.dataset.nombre, function () { paginaPerfil(c); }); }; });
        };
      }
      if (r.panelAutor) panelAutor($('[data-panel-autor]', c), r.panelAutor, obras, porSlug);
    }, function (e) { c.innerHTML = '<div class="vacio"><p>' + esc(e.message) + '</p></div>'; });
  }
  function panelAutor(caja, pa, obras, porSlug) {
    var mias = obras.filter(function (o) { return (o.autoresSlugs || []).indexOf(pa.autor) > -1; });
    api('estado', { obras: mias.map(function (o) { return o.codigo; }) }).then(function (r) {
      var total = mias.reduce(function (s, o) { return s + (r.likes[o.codigo] || 0); }, 0);
      caja.innerHTML = '<div class="cifras"><div class="cifra"><b>' + pa.seguidores + '</b><span>' + (pa.seguidores === 1 ? 'seguidor' : 'seguidores') + '</span></div><div class="cifra"><b>' + total + '</b><span>likes en total</span></div><div class="cifra"><b>' + mias.length + '</b><span>' + (mias.length === 1 ? 'obra' : 'obras') + '</span></div></div>' +
        (mias.length ? '<ul class="lec-lista" style="margin-top:1.2rem">' + mias.sort(function (x, y) { return (r.likes[y.codigo] || 0) - (r.likes[x.codigo] || 0); }).map(function (o) { return '<li><a href="' + esc(rutaObra(o)) + '"><b>' + esc(o.titulo) + '</b><small>' + esc(o.coleccion) + '</small></a><span class="lec-likes">' + CORAZON + ' ' + (r.likes[o.codigo] || 0) + '</span></li>'; }).join('') + '</ul>' : '') +
        '<p class="lec-legal">Página pública: <a href="' + BASE + '/autor/' + esc(pa.autor) + '/">' + esc((porSlug[pa.autor] || {}).nombre || pa.autor) + '</a>. Para cambiar tu biografía o foto, escríbele al equipo de la gaceta.</p>';
    });
  }

  // ---------- Equipo de la gaceta: correos privados ----------
  function equipoSitio() { return fetch(BASE + '/equipo.json').then(function (r) { return r.json(); }).catch(function () { return []; }); }
  function cajaEquipo(caja) {
    if (!caja) return;
    Promise.all([api('equipo'), equipoSitio(), autoresSitio()]).then(function (res) {
      var guardados = res[0].equipo || [], miembros = res[1], nomA = {}; res[2].forEach(function (a) { nomA[a.slug] = a.nombre; });
      if (!miembros.length) { caja.innerHTML = '<p class="lec-suave">No encontramos la lista del equipo. Revisa «Ajustes › Equipo editorial» en el panel.</p>'; return; }
      var de = function (n) { return guardados.filter(function (g) { return g.miembro === n; })[0] || {}; };
      caja.innerHTML = '<ul class="lec-lista">' + miembros.map(function (m, i) {
        return '<li style="flex-wrap:wrap;gap:.6rem"><span style="flex:1 1 14rem"><b>' + esc(m.nombre) + '</b><small>' + esc(m.rol || '') + (m.autor ? ' · también publica: <a href="' + BASE + '/autor/' + esc(m.autor) + '/">' + esc(nomA[m.autor] || m.autor) + '</a>' : '') + '</small></span>' +
          '<input class="lec-area" type="email" data-correo-equipo="' + i + '" value="' + esc(de(m.nombre).correo || '') + '" placeholder="correo@gmail.com" autocomplete="off" style="flex:1 1 14rem;min-height:0;padding:.5rem .7rem"></li>';
      }).join('') + '</ul><div class="botones" style="margin-top:.8rem"><button class="boton boton--chico boton--indigo" type="button" data-guardar-equipo>Guardar correos del equipo</button></div>';
      $('[data-guardar-equipo]', caja).onclick = function () {
        var b = this; b.disabled = true;
        var filas = miembros.map(function (m, i) { return { miembro: m.nombre, rol: m.rol, autor: m.autor, correo: $('[data-correo-equipo="' + i + '"]', caja).value.trim() }; }).filter(function (f) { return f.correo; });
        api('guardarEquipo', { filas: filas }).then(function () { aviso('Correos del equipo guardados'); b.disabled = false; }, function (e) { aviso(e.message); b.disabled = false; });
      };
    }, function (e) { caja.innerHTML = '<p class="lec-suave">' + esc(e.message) + '</p>'; });
  }

  // ---------- Página: Solicitudes de autores (equipo) ----------
  function paginaSolicitudes(c) {
    if (!S.token) { c.innerHTML = '<div class="vacio"><span class="mano">Cuentas y autores</span><p>Entra con una cuenta de Google autorizada para administrar las cuentas, las solicitudes de autores y el equipo.</p><button class="boton boton--primario" type="button" data-entrar>Entrar con Google</button></div>'; $('[data-entrar]', c).onclick = function () { pedirEntrar('Entra con tu cuenta autorizada', function () { paginaSolicitudes(c); }); }; return; }
    c.innerHTML = '<p class="lec-suave">Cargando…</p>';
    Promise.all([api('consola'), autoresSitio(), obrasSitio()]).then(function (res) {
      var r = res[0], nomA = {}, nomO = {}; res[1].forEach(function (a) { nomA[a.slug] = a.nombre; }); res[2].forEach(function (o) { nomO[o.codigo] = o.titulo; });
      var pend = r.solicitudes.filter(function (s) { return s.estado === 'pendiente'; }), hechas = r.solicitudes.filter(function (s) { return s.estado !== 'pendiente'; });
      var tarjeta = function (s) {
        var co = String(s.coincide || '');
        var tc = co && co !== 'no' && co !== 'sin datos';
        return '<article class="lec-sol"><div class="lec-sol__cab"><div><p class="sobretitulo">' + esc(s.id) + ' · ' + new Date(s.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) + '</p>' +
          '<h3>' + esc(s.nombre) + ' <small>' + esc(s.correo) + '</small></h3><p>quiere vincularse a <a href="' + BASE + '/autor/' + esc(s.autor) + '/" target="_blank"><b>' + esc(s.autorNombre) + '</b></a></p></div></div>' +
          (s.estado === 'pendiente' ? '<p class="lec-coincide">📧 Antes de aprobar, busca en el Gmail de la gaceta el correo «Vinculación de perfil de autor · ' + esc(s.autorNombre) + '» (código ' + esc(s.id) + ') y comprueba que llegó <b>desde el mismo correo con el que este autor envió su texto</b>.</p>' : '') +
          (s.mensaje ? '<blockquote>' + esc(s.mensaje) + '</blockquote>' : '') +
          '<p class="lec-coincide ' + (tc ? 'si' : 'no') + '">' + (tc ? '✓ Su correo coincide con envíos en Redacción: ' + esc(co) : co === 'sin datos' ? '? No se pudo revisar Redacción. Confirma su identidad antes de aprobar.' : '✗ Su correo no aparece en los envíos de Redacción. Confirma su identidad antes de aprobar (escríbele o pídele una prueba).') + '</p>' +
          (s.estado === 'pendiente' ? '<div class="botones"><button class="boton boton--primario boton--chico" type="button" data-aprobar="' + esc(s.id) + '">Aprobar y verificar</button><button class="boton boton--chico" type="button" data-rechazar="' + esc(s.id) + '">Rechazar</button><a class="boton boton--chico" href="mailto:' + esc(s.correo) + '?subject=' + encodeURIComponent('Tu solicitud de perfil de autor · Hicimos lo que quisimos') + '">Escribirle</a></div>'
            : '<p class="lec-suave">' + (s.estado === 'aprobada' ? 'Aprobada' : 'Rechazada') + ' por ' + esc(s.revisadoPor) + (s.nota ? ' · ' + esc(s.nota) : '') + '</p>') + '</article>';
      };
      var fecha = function (f, hora) { if (!f) return '—'; var d = new Date(f); return isNaN(d) ? esc(f) : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) + (hora ? ' · ' + d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : ''); };
      var norm = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
      var suma = function (o) { return Object.keys(o || {}).reduce(function (n, k) { return n + o[k]; }, 0); };
      var cu = r.cuentas || [], hace30 = Date.now() - 30 * 864e5;
      var activas = cu.filter(function (x) { return x.ultimaVisita && Date.parse(x.ultimaVisita) > hace30 && x.estado !== 'suspendida'; }).length;
      var susp = cu.filter(function (x) { return x.estado === 'suspendida'; }).length;
      var top = function (obj, nombres, ruta) { var ks = Object.keys(obj || {}).sort(function (a, b) { return obj[b] - obj[a]; }).slice(0, 10); return ks.length ? '<ol class="cp-top">' + ks.map(function (k) { return '<li><a href="' + BASE + ruta(k) + '" target="_blank">' + esc(nombres[k] || k) + '</a><b>' + obj[k] + '</b></li>'; }).join('') + '</ol>' : '<p class="lec-suave">Todavía nada.</p>'; };
      var obraRuta = function (k) { var o = res[2].filter(function (x) { return x.codigo === k; })[0]; return o ? o.url.replace(/^https?:\/\/[^/]+/, '').replace(BASE, '') : '/archivo/'; };
      var TABS = [['resumen', 'Resumen'], ['solicitudes', 'Solicitudes' + (pend.length ? ' · ' + pend.length : '')], ['cuentas', 'Cuentas · ' + cu.length], ['verificados', 'Autores verificados'], ['equipo', 'Equipo de la gaceta'], ['revisores', 'Revisores'], ['actividad', 'Actividad']];
      var tab = 'resumen'; try { tab = sessionStorage.getItem('cp-pestana') || 'resumen'; } catch (e) { }
      if (!TABS.some(function (t) { return t[0] === tab; })) tab = 'resumen';
      var filaCuenta = function (x) {
        var yo = (S.lector || {}).correo === x.correo;
        return '<tr data-buscar="' + esc(norm(x.nombre + ' ' + x.correo)) + '"' + (x.estado === 'suspendida' ? ' class="cp-suspendida"' : '') + '><td><div class="cp-persona">' + avatar(x) + '<span><b>' + esc(x.nombre) + '</b><small>' + esc(x.correo) + '</small>' +
          '<span class="cp-etiquetas">' + (x.estado === 'suspendida' ? '<span class="cp-etq cp-etq--rojo" title="' + esc(x.motivo) + '">Suspendida</span>' : '') + (x.autor ? '<span class="cp-etq">Autor: ' + esc(nomA[x.autor] || x.autor) + '</span>' : '') + (x.equipo ? '<span class="cp-etq">Equipo</span>' : '') + (x.admin ? '<span class="cp-etq">Revisor</span>' : '') + '</span></span></div></td>' +
          '<td>' + fecha(x.creado) + '</td><td>' + fecha(x.ultimaVisita) + '</td><td class="cp-cifras-fila">' + x.likes + ' ♥<br>' + x.guardadas + ' guardadas<br>sigue ' + x.sigue + '</td>' +
          '<td class="cp-acciones">' + (yo ? '<small class="lec-suave">Tu cuenta</small>' : (x.estado === 'suspendida' ? '<button class="boton boton--chico" type="button" data-reactivar="' + esc(x.id) + '">Reactivar</button>' : '<button class="boton boton--chico" type="button" data-suspender="' + esc(x.id) + '">Suspender</button>') + '<button class="boton boton--chico cp-peligro" type="button" data-eliminar="' + esc(x.id) + '">Eliminar</button>') + '</td></tr>';
      };
      var SEC = {
        resumen: function () {
          return '<div class="cifras"><div class="cifra"><b>' + cu.length + '</b><span>cuentas creadas</span></div><div class="cifra"><b>' + activas + '</b><span>activas en 30 días</span></div><div class="cifra"><b>' + susp + '</b><span>suspendidas</span></div><div class="cifra"><b>' + r.verificados.length + '</b><span>autores verificados</span></div><div class="cifra"><b>' + pend.length + '</b><span>solicitudes por revisar</span></div><div class="cifra"><b>' + suma(r.likesPorObra) + '</b><span>me gusta</span></div><div class="cifra"><b>' + suma(r.guardadasPorObra) + '</b><span>obras guardadas</span></div><div class="cifra"><b>' + suma(r.seguidoresPorAutor) + '</b><span>seguimientos</span></div></div>' +
            '<div class="cp-columnas"><section class="cp-caja"><h2>Obras con más ♥</h2>' + top(r.likesPorObra, nomO, obraRuta) + '</section><section class="cp-caja"><h2>Obras más guardadas</h2>' + top(r.guardadasPorObra, nomO, obraRuta) + '</section><section class="cp-caja"><h2>Autores más seguidos</h2>' + top(r.seguidoresPorAutor, nomA, function (k) { return '/autor/' + k + '/'; }) + '</section></div>';
        },
        solicitudes: function () { return '<h2>Por revisar</h2>' + (pend.length ? pend.map(tarjeta).join('') : '<div class="vacio"><span class="mano">Todo al día</span><p>No hay solicitudes pendientes.</p></div>') + (hechas.length ? '<h2>Historial</h2>' + hechas.slice(0, 50).map(tarjeta).join('') : ''); },
        cuentas: function () { return '<div class="cp-barra"><input class="lec-area cp-buscar" type="search" data-buscar-cuenta placeholder="Buscar por nombre o correo" autocomplete="off"><span class="lec-suave" data-cuenta-n>' + cu.length + (cu.length === 1 ? ' cuenta' : ' cuentas') + '</span></div>' + (cu.length ? '<div class="cp-tabla-caja"><table class="cp-tabla"><thead><tr><th>Cuenta</th><th>Creada</th><th>Última visita</th><th>Actividad</th><th></th></tr></thead><tbody>' + cu.map(filaCuenta).join('') + '</tbody></table></div>' : '<p class="lec-suave">Todavía no hay cuentas.</p>') + '<p class="lec-legal">Suspender: la persona no puede entrar y sus ♥ y seguimientos dejan de contar, pero se conservan; puedes reactivarla. Eliminar: se borran su cuenta y todos sus datos (no se puede deshacer); si vuelve a entrar con Google, empieza de cero.</p>'; },
        verificados: function () { return r.verificados.length ? '<ul class="lec-lista">' + r.verificados.map(function (v) { return '<li><a href="' + BASE + '/autor/' + esc(v.autor) + '/" target="_blank"><b>' + esc(nomA[v.autor] || v.autor) + '</b><small>Cuenta: ' + esc(v.nombre) + ' · ' + esc(v.correo) + ' · ' + fecha(v.fecha) + (v.aprobadoPor ? ' · ' + esc(v.aprobadoPor) : '') + '</small></a><button class="boton boton--chico" type="button" data-desvincular="' + esc(v.autor) + '">Desvincular</button></li>'; }).join('') + '</ul>' : '<p class="lec-suave">Todavía no hay autores verificados.</p>'; },
        equipo: function () { return '<p class="lec-suave">Escribe el correo de Google de cada integrante. Cuando entre a la gaceta con ese correo, su cuenta queda ligada sola a su ficha del equipo y, si publica («Es del equipo editorial» en su perfil de autor), también a su página de autor. Los correos se guardan en privado.</p><div data-equipo><p class="lec-suave">Cargando…</p></div>'; },
        revisores: function () { return '<p class="lec-suave">Correos de Google (separados por coma) que pueden abrir esta sección del panel. Les llega un correo con cada solicitud nueva de autor.</p><textarea class="lec-area" data-admins rows="3">' + esc(r.administradores) + '</textarea><div class="botones"><button class="boton boton--primario boton--chico" type="button" data-guardar-admins>Guardar</button></div>'; },
        actividad: function () { var g = r.registro || []; return g.length ? '<div class="cp-tabla-caja"><table class="cp-tabla"><thead><tr><th>Fecha</th><th>Quién</th><th>Qué pasó</th><th>Detalle</th></tr></thead><tbody>' + g.map(function (x) { return '<tr><td>' + fecha(x.fecha, true) + '</td><td>' + esc(x.quien) + '</td><td>' + esc(x.accion) + '</td><td>' + esc(x.detalle) + '</td></tr>'; }).join('') + '</tbody></table></div><p class="lec-legal">Las últimas 200 acciones.</p>' : '<p class="lec-suave">Todavía no hay actividad.</p>'; },
      };
      var recargar = function (msj) { if (msj) aviso(msj); paginaSolicitudes(c); };
      var pintar = function () {
        c.innerHTML = '<div class="cp-cabeza"><div><h1>Cuentas y autores</h1><p class="lec-suave">Entraste como ' + esc((S.lector || {}).correo || '') + '</p></div><button class="boton boton--chico" type="button" data-recargar>Actualizar</button></div>' +
          '<nav class="cp-tabs" role="tablist">' + TABS.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + esc(t[1]) + '</button>'; }).join('') + '</nav><div class="cp-cuerpo">' + SEC[tab]() + '</div>';
        $$('[data-tab]', c).forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; try { sessionStorage.setItem('cp-pestana', tab); } catch (e) { } pintar(); }; });
        $('[data-recargar]', c).onclick = function () { recargar(); };
        $$('[data-aprobar]', c).forEach(function (b) { b.onclick = function () { decidir(b.dataset.aprobar, 'aprobar', c); }; });
        $$('[data-rechazar]', c).forEach(function (b) { b.onclick = function () { decidir(b.dataset.rechazar, 'rechazar', c); }; });
        if (tab === 'equipo') cajaEquipo($('[data-equipo]', c));
        $$('[data-desvincular]', c).forEach(function (b) { b.onclick = function () { modal('<h2 class="lec-titulo">¿Desvincular este perfil?</h2><p class="lec-suave">La página de autor pierde el sello de verificado. La persona conserva su cuenta de lector.</p><div class="botones"><button class="boton boton--primario" type="button" data-si>Desvincular</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) { $('[data-si]', m).onclick = function () { api('desvincular', { autor: b.dataset.desvincular }).then(function () { cerrarModal(); recargar('Perfil desvinculado'); }, function (e) { aviso(e.message); }); }; }); }; });
        var ga = $('[data-guardar-admins]', c); if (ga) ga.onclick = function () { api('guardarAdmins', { lista: $('[data-admins]', c).value }).then(function () { aviso('Lista guardada'); }, function (e) { aviso(e.message); }); };
        var bc = $('[data-buscar-cuenta]', c);
        if (bc) bc.oninput = function () { var q = norm(bc.value.trim()), n = 0; $$('tr[data-buscar]', c).forEach(function (f) { var si = !q || f.dataset.buscar.indexOf(q) > -1; f.hidden = !si; if (si) n++; }); $('[data-cuenta-n]', c).textContent = n + (n === 1 ? ' cuenta' : ' cuentas'); };
        var deCuenta = function (id) { return cu.filter(function (x) { return x.id === id; })[0] || {}; };
        $$('[data-suspender]', c).forEach(function (b) { b.onclick = function () { var x = deCuenta(b.dataset.suspender); modal('<h2 class="lec-titulo">Suspender a ' + esc(x.nombre) + '</h2><p class="lec-suave">No podrá entrar a la gaceta y sus ♥ y seguimientos dejarán de contar. Nada se borra: puedes reactivarla cuando quieras.</p><label class="lec-campo"><span>Motivo (lo verá si intenta entrar)</span><textarea data-motivo rows="3"></textarea></label><div class="botones"><button class="boton boton--primario" type="button" data-si>Suspender</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) { $('[data-si]', m).onclick = function () { api('suspenderCuenta', { id: x.id, si: true, motivo: $('[data-motivo]', m).value }).then(function () { cerrarModal(); recargar('Cuenta suspendida'); }, function (e) { aviso(e.message); }); }; }); }; });
        $$('[data-reactivar]', c).forEach(function (b) { b.onclick = function () { api('suspenderCuenta', { id: b.dataset.reactivar, si: false }).then(function () { recargar('Cuenta reactivada'); }, function (e) { aviso(e.message); }); }; });
        $$('[data-eliminar]', c).forEach(function (b) { b.onclick = function () { var x = deCuenta(b.dataset.eliminar); modal('<h2 class="lec-titulo">Eliminar la cuenta de ' + esc(x.nombre) + '</h2><p class="lec-suave">Se borran su cuenta, sus ♥, sus obras guardadas, los autores que sigue y, si es autor verificado, su vinculación. <b>No se puede deshacer.</b></p><label class="lec-campo"><span>Escribe <b>ELIMINAR</b> para confirmar</span><input class="lec-area" data-confirmar autocomplete="off"></label><div class="botones"><button class="boton boton--primario cp-peligro" type="button" data-si>Eliminar para siempre</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) { $('[data-si]', m).onclick = function () { if ($('[data-confirmar]', m).value.trim().toUpperCase() !== 'ELIMINAR') return aviso('Escribe ELIMINAR para confirmar.'); api('eliminarCuenta', { id: x.id }).then(function () { cerrarModal(); recargar('Cuenta eliminada'); }, function (e) { aviso(e.message); }); }; }); }; });
      };
      pintar();
    }, function (e) { c.innerHTML = '<div class="vacio"><span class="mano">Sin acceso</span><p>' + esc(e.message) + '</p><p class="lec-suave">Entraste como ' + esc((S.lector || {}).correo || '') + '.</p><div class="botones"><button class="boton boton--chico" type="button" data-otra>Entrar con otra cuenta</button></div></div>'; var o = $('[data-otra]', c); if (o) o.onclick = function () { api('salir').catch(function () { }); salirLocal(); paginaSolicitudes(c); }; });
  }
  function decidir(id, decision, c) {
    var ap = decision === 'aprobar';
    modal('<h2 class="lec-titulo">' + (ap ? 'Aprobar y verificar' : 'Rechazar la solicitud') + '</h2><p class="lec-suave">' + (ap ? 'La cuenta queda vinculada al perfil de autor, que mostrará el sello de verificado. Le llegará un correo.' : 'Escribe el motivo: se lo enviaremos por correo.') + '</p><label class="lec-campo"><span>' + (ap ? 'Nota para la persona (opcional)' : 'Motivo') + '</span><textarea data-nota rows="3"></textarea></label><div class="botones" style="margin-top:1rem"><button class="boton boton--primario" type="button" data-si>' + (ap ? 'Aprobar' : 'Rechazar') + '</button><button class="boton" type="button" data-cerrar>Cancelar</button></div>', function (m) {
      $('[data-si]', m).onclick = function () {
        var nota = $('[data-nota]', m).value; if (!ap && !nota.trim()) return aviso('Escribe el motivo.');
        api('decidir', { id: id, decision: decision, nota: nota }).then(function () { cerrarModal(); aviso(ap ? 'Autor verificado ✓' : 'Solicitud rechazada'); paginaSolicitudes(c); }, function (e) { aviso(e.message); });
      };
    });
  }

  // ---------- Modo demostración (solo para probar sin servidor) ----------
  var Demo = {
    db: function () { try { return JSON.parse(localStorage.getItem('lectores-demo') || 'null') || { lectores: {}, likes: [], seg: [], sol: [], ver: [], admins: 'demo@gaceta.co' }; } catch (e) { return {}; } },
    guardar: function (d) { localStorage.setItem('lectores-demo', JSON.stringify(d)); },
    credencial: function () { return 'demo:' + (prompt('Correo de Google (demo)', 'lectora@gmail.com') || 'lectora@gmail.com'); },
    llamar: function (p) {
      var d = Demo.db(), yo = p.token && d.lectores[d.sesiones && d.sesiones[p.token]]; if (yo && yo.estado === 'suspendida') yo = null;
      var r = { ok: true };
      d.equipo = d.equipo || [];
      var eqDe = function (c) { return d.equipo.filter(function (x) { return x.correo === String(c).toLowerCase(); })[0] || null; };
      var ligar = function (l) { var e = eqDe(l.correo); if (e && e.autor && !d.ver.some(function (v) { return v.lectorId === l.id || v.autor === e.autor; })) d.ver.push({ autor: e.autor, lectorId: l.id, correo: l.correo, nombre: l.nombre, fecha: new Date().toISOString(), aprobadoPor: 'Equipo de la gaceta' }); };
      var pub = function (l) { ligar(l); var v = d.ver.find(function (x) { return x.lectorId === l.id; }); var e = eqDe(l.correo); return { nombre: l.nombre, foto: '', correo: l.correo, autor: v ? v.autor : null, admin: d.admins.indexOf(l.correo) > -1, avisos: l.avisos !== false, equipo: e ? { miembro: e.miembro, rol: e.rol } : null }; };
      var exige = function () { if (!yo) throw new Error('Tu sesión terminó.'); };
      try {
        switch (p.accion) {
          case 'entrar': { var c = p.credencial.slice(5), id = 'g' + c; if (!d.lectores[id] && !p.acepto) return Promise.resolve({ ok: true, necesitaAceptar: true, nombre: c.split('@')[0] }); d.lectores[id] = d.lectores[id] || { id: id, correo: c, nombre: c.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, function (x) { return x.toUpperCase(); }), avisos: true }; if (d.lectores[id].estado === 'suspendida') throw new Error('Tu cuenta está suspendida' + (d.lectores[id].motivo ? ': ' + d.lectores[id].motivo : '.')); d.lectores[id].creado = d.lectores[id].creado || new Date().toISOString(); d.lectores[id].ultima = new Date().toISOString(); var t = 't' + Date.now(); d.sesiones = d.sesiones || {}; d.sesiones[t] = id; r.token = t; r.lector = pub(d.lectores[id]); break; }
          case 'salir': break;
          case 'enviarObra': if (!p.archivos || p.archivos.filter(function (a) { return a.tipo !== 'otro'; }).length < (p.enlace ? 2 : 3)) throw new Error('Faltan archivos.'); (d.envios = d.envios || []).push({ titulo: p.titulo, correo: p.correo, fecha: new Date().toISOString() }); break;
          case 'equipo': exige(); r.equipo = d.equipo; break;
          case 'consola': exige(); if (d.admins.indexOf(yo.correo) < 0) throw new Error('Tu cuenta no tiene permiso para revisar solicitudes.'); r.solicitudes = d.sol.slice().reverse(); r.verificados = d.ver; r.administradores = d.admins; r.equipo = d.equipo;
            r.cuentas = Object.keys(d.lectores).map(function (k) { var l = d.lectores[k]; var v = d.ver.find(function (x) { return x.lectorId === l.id; }); var e = (d.equipo || []).find(function (x) { return x.correo === l.correo; }); return { id: l.id, nombre: l.nombre, correo: l.correo, foto: '', creado: l.creado || '', ultimaVisita: l.ultima || '', estado: l.estado || 'activa', motivo: l.motivo || '', likes: d.likes.filter(function (x) { return x.l === l.id; }).length, guardadas: (d.guard || []).filter(function (x) { return x.l === l.id; }).length, sigue: d.seg.filter(function (x) { return x.l === l.id; }).length, autor: v ? v.autor : '', equipo: e ? e.miembro : '', admin: d.admins.indexOf(l.correo) > -1 }; });
            var cnt = function (arr, k) { var o = {}; arr.forEach(function (x) { o[x[k]] = (o[x[k]] || 0) + 1; }); return o; }; r.likesPorObra = cnt(d.likes, 'o'); r.guardadasPorObra = cnt(d.guard || [], 'o'); r.seguidoresPorAutor = cnt(d.seg, 'a'); r.registro = d.registro || []; break;
          case 'suspenderCuenta': exige(); var ls = d.lectores[p.id]; if (!ls) throw new Error('No existe esa cuenta.'); ls.estado = p.si ? 'suspendida' : ''; ls.motivo = p.si ? (p.motivo || '') : ''; (d.registro = d.registro || []).unshift({ fecha: new Date().toISOString(), quien: yo.correo, accion: p.si ? 'Cuenta suspendida' : 'Cuenta reactivada', detalle: ls.correo }); break;
          case 'eliminarCuenta': exige(); var le = d.lectores[p.id]; if (!le) throw new Error('No existe esa cuenta.'); delete d.lectores[p.id]; d.likes = d.likes.filter(function (x) { return x.l !== p.id; }); d.guard = (d.guard || []).filter(function (x) { return x.l !== p.id; }); d.seg = d.seg.filter(function (x) { return x.l !== p.id; }); d.ver = d.ver.filter(function (x) { return x.lectorId !== p.id; }); (d.registro = d.registro || []).unshift({ fecha: new Date().toISOString(), quien: yo.correo, accion: 'Cuenta eliminada', detalle: le.correo }); break;
          case 'guardarEquipo': exige(); d.equipo = (p.filas || []).map(function (f) { return { correo: f.correo.toLowerCase(), miembro: f.miembro, rol: f.rol, autor: f.autor }; }); r.equipo = d.equipo; break;
          case 'estado': r.likes = {}; r.seguidores = {}; r.verificados = {}; r.mios = []; r.sigo = []; d.guard = d.guard || []; r.guardadas = yo ? d.guard.filter(function (x) { return x.l === yo.id; }).map(function (x) { return x.o; }) : [];
            (p.obras || []).forEach(function (o) { r.likes[o] = d.likes.filter(function (x) { return x.o === o; }).length; if (yo && d.likes.some(function (x) { return x.o === o && x.l === yo.id; })) r.mios.push(o); });
            (p.autores || []).forEach(function (a) { r.seguidores[a] = d.seg.filter(function (x) { return x.a === a; }).length; if (yo && d.seg.some(function (x) { return x.a === a && x.l === yo.id; })) r.sigo.push(a); if (d.ver.some(function (v) { return v.autor === a; })) r.verificados[a] = (function () { var v = d.ver.find(function (x) { return x.autor === a; }); var l = v && d.lectores[v.lectorId]; return { nombre: (l && l.nombre) || (v && v.nombre) || '', foto: '' }; })(); });
            if (yo) { r.lector = pub(yo); r.solicitudesPendientes = d.sol.filter(function (s) { return s.lectorId === yo.id && s.estado === 'pendiente'; }).map(function (s) { return s.autor; }); } break;
          case 'guardar': exige(); d.guard = (d.guard || []).filter(function (x) { return !(x.o === p.obra && x.l === yo.id); }); if (p.si) d.guard.push({ o: p.obra, l: yo.id, f: Date.now() }); break;
          case 'like': exige(); d.likes = d.likes.filter(function (x) { return !(x.o === p.obra && x.l === yo.id); }); if (p.si) d.likes.push({ o: p.obra, l: yo.id, f: Date.now() }); r.total = d.likes.filter(function (x) { return x.o === p.obra; }).length; break;
          case 'seguir': exige(); d.seg = d.seg.filter(function (x) { return !(x.a === p.autor && x.l === yo.id); }); if (p.si) d.seg.push({ a: p.autor, l: yo.id }); r.total = d.seg.filter(function (x) { return x.a === p.autor; }).length; break;
          case 'perfil': exige(); r.lector = pub(yo); r.guardadas = (d.guard || []).filter(function (x) { return x.l === yo.id; }).sort(function (a, b) { return b.f - a.f; }).map(function (x) { return x.o; }); r.favoritos = d.likes.filter(function (x) { return x.l === yo.id; }).map(function (x) { return x.o; }); r.siguiendo = d.seg.filter(function (x) { return x.l === yo.id; }).map(function (x) { return x.a; }); r.solicitudes = d.sol.filter(function (s) { return s.lectorId === yo.id; }); var v = d.ver.find(function (x) { return x.lectorId === yo.id; }); if (v) r.panelAutor = { autor: v.autor, seguidores: d.seg.filter(function (x) { return x.a === v.autor; }).length }; break;
          case 'avisos': exige(); yo.avisos = p.si; break;
          case 'borrarCuenta': exige(); delete d.lectores[yo.id]; d.likes = d.likes.filter(function (x) { return x.l !== yo.id; }); d.seg = d.seg.filter(function (x) { return x.l !== yo.id; }); d.ver = d.ver.filter(function (x) { return x.lectorId !== yo.id; }); break;
          case 'solicitar': exige(); var nid = 'SOL-' + Date.now().toString(36).toUpperCase(); if (d.sol.some(function (s) { return s.lectorId === yo.id && s.estado === 'pendiente'; })) throw new Error('Ya tienes una solicitud en revisión.'); d.sol.push({ id: nid, lectorId: yo.id, correo: yo.correo, nombre: yo.nombre, autor: p.autor, autorNombre: (document.querySelector('[data-autor-acciones]') || {}).dataset ? document.querySelector('[data-autor-acciones]').dataset.nombre : p.autor, mensaje: p.mensaje, coincide: /isabel/.test(yo.correo) ? 'ENV-004 · «Ceniza de mayo» (Isabel Sofía Quintero Vargas)' : 'no', estado: 'pendiente', fecha: new Date().toISOString() });  r.solicitud = { id: nid, autor: p.autor, estado: 'pendiente' }; break;
          case 'solicitudes': exige(); if (d.admins.indexOf(yo.correo) < 0) throw new Error('Tu cuenta no tiene permiso para revisar solicitudes.'); r.solicitudes = d.sol.slice().reverse(); r.verificados = d.ver; r.administradores = d.admins; r.lectores = Object.keys(d.lectores).length; break;
          case 'decidir': exige(); var s = d.sol.find(function (x) { return x.id === p.id; }); s.estado = p.decision === 'aprobar' ? 'aprobada' : 'rechazada'; s.nota = p.nota; s.revisadoPor = yo.correo; if (s.estado === 'aprobada') d.ver.push({ autor: s.autor, lectorId: s.lectorId, correo: s.correo, nombre: s.nombre }); break;
          case 'desvincular': exige(); d.ver = d.ver.filter(function (x) { return x.autor !== p.autor; }); break;
          case 'guardarAdmins': exige(); d.admins = p.lista; break;
        }
      } catch (e) { return Promise.reject(e); }
      Demo.guardar(d); return Promise.resolve(r);
    },
  };
  // ---------- Formulario de envío de obras ----------
  function formularioEnvio(f) {
    var alt = $('[data-envio-correo]'); if (alt) alt.hidden = true; var o = $('[data-envio-o]'); if (o) o.hidden = false;
    var caja = $('[data-abrir-envio-caja]'), abrir = function () { f.hidden = false; if (caja) caja.hidden = true; f.scrollIntoView({ behavior: 'smooth', block: 'start' }); var p = $('input[name=nombre]', f); if (p) setTimeout(function () { p.focus({ preventScroll: true }); }, 400); };
    if (caja) { caja.hidden = false; $('[data-abrir-envio]', caja).onclick = abrir; } else f.hidden = false;
    if (location.hash === '#formulario') abrir();
    window.addEventListener('hashchange', function () { if (location.hash === '#formulario') abrir(); });
    var est = $('[data-estado-envio]', f), MAX = 20 * 1024 * 1024;
    var leer = function (file) { return new Promise(function (ok, mal) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(',')[1] || ''); }; r.onerror = function () { mal(new Error('No se pudo leer ' + file.name + '.')); }; r.readAsDataURL(file); }); };
    var selG = f.elements.genero, etq = $('[data-nota-etiqueta]', f), campo = $('[data-nota-campo]', f);
    var pideNota = function () { var o = selG && selG.options[selG.selectedIndex]; return !!(o && o.dataset.nota); };
    var marcarNota = function () { var si = pideNota(); f.elements.nota.required = si; if (etq) etq.textContent = si ? '(obligatoria para este formato)' : '(opcional en textos)'; if (campo) campo.textContent = 'Nota de obra (máximo 150 palabras)' + (si ? ' *' : ''); };
    if (selG) { selG.addEventListener('change', marcarNota); marcarNota(); }
    f.addEventListener('input', function () { if (est.classList.contains('error')) { est.textContent = ''; est.className = 'meta form-envio__estado'; } });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); est.className = 'meta form-envio__estado';
      var d = new FormData(f), err = '', val = function (k) { return String(d.get(k) || '').trim(); };
      if (!val('nombre') || !val('correo') || !val('genero') || !val('titulo')) err = 'Completa todos los campos marcados con *.';
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('correo'))) err = 'Revisa tu correo: parece que le falta algo.';
      var enlace = val('enlace');
      var archivos = ['obra', 'ficha', 'licencia'].map(function (k) { return { tipo: k, file: f.elements[k].files[0] }; }).filter(function (a) { return a.file || a.tipo !== 'obra' || !enlace; });
      if (!err && enlace && !/^https?:\/\/\S+\.\S+/.test(enlace)) err = 'Revisa el enlace de la obra: debe empezar por https://';
      if (!err && !f.elements.obra.files[0] && !enlace) err = 'Sube el archivo de la obra o pega su enlace.';
      if (!err && archivos.some(function (a) { return !a.file; })) err = 'Adjunta la ficha y la licencia.';
      var fiF = f.elements.ficha.files[0];
      if (!err && fiF && !/\.docx?$/i.test(fiF.name)) err = 'La ficha de autor debe estar en Word (.docx o .doc).';
      var licF = f.elements.licencia.files[0];
      if (!err && licF && !/\.pdf$/i.test(licF.name)) err = 'La licencia firmada debe estar en PDF.';
      var otros = f.elements.otros ? Array.prototype.slice.call(f.elements.otros.files || []) : [];
      if (!err && otros.length > 5) err = 'En «Otros» puedes subir hasta 5 archivos.';
      var total = archivos.concat(otros.map(function (x) { return { file: x }; })).reduce(function (n, a) { return n + (a.file ? a.file.size : 0); }, 0);
      if (!err && total > MAX) err = 'Los archivos pesan más de 20 MB en total.';
      var nota = String(d.get('nota') || '');
      if (!err && pideNota() && !nota.trim()) err = 'Las obras de otros formatos llevan nota de obra: escríbela en el paso 6.';
      if (!err && nota.trim().split(/\s+/).filter(Boolean).length > 150) err = 'La nota de obra tiene más de 150 palabras.';
      if (!err && !f.elements.acepto.checked) err = 'Marca la casilla de autoría y tratamiento de datos.';
      if (err) { est.textContent = err; est.classList.add('error'); return; }
      var btn = $('button[type=submit]', f); btn.disabled = true; est.textContent = 'Enviando tus archivos… no cierres esta página.';
      Promise.all(archivos.concat(otros.map(function (x) { return { tipo: 'otro', file: x }; })).map(function (a) { return leer(a.file).then(function (b64) { return { tipo: a.tipo, nombre: a.file.name, mime: a.file.type || '', b64: b64 }; }); }))
        .then(function (adj) { return api('enviarObra', { nombre: val('nombre'), correo: val('correo'), genero: val('genero'), titulo: val('titulo'), enlace: enlace, nota: nota, mensaje: String(d.get('mensaje') || ''), acepto: true, sitio_web: val('sitio_web'), archivos: adj }); })
        .then(function () {
          f.outerHTML = '<div class="envio-listo" role="status"><p class="sobretitulo">Envío recibido</p><h3>¡Gracias! Recibimos «' + esc(val('titulo')) + '»</h3><p>Llegó al correo de la gaceta con tus tres archivos. Cuando lo registremos te escribiremos a <b>' + esc(val('correo')) + '</b> (revisa también la carpeta de spam).</p></div>';
        }, function (e2) { btn.disabled = false; est.textContent = e2.message + ' Si sigue fallando, escríbenos al correo.'; est.classList.add('error'); });
    });
  }

  // ---------- Arranque ----------
  pintarCuenta();
  refrescar();
  var fe = $('[data-form-envio]'); if (fe) formularioEnvio(fe);
  function paginas() {
    var pp = $('[data-perfil-lector]'); if (pp) paginaPerfil(pp);
    var ps = $('[data-solicitudes-autores]');
    if (ps) {
      // Solo se usa dentro del panel (/admin/): abierta suelta, manda al panel
      var enPanel = false; try { enPanel = window.top !== window.self && window.top.location.pathname.indexOf(BASE + '/admin') === 0; } catch (e) { enPanel = false; }
      if (enPanel) paginaSolicitudes(ps);
      else { document.documentElement.classList.add('fuera-del-panel'); ps.innerHTML = '<div class="vacio"><span class="mano">Esto vive en el panel</span><p>Las cuentas, las solicitudes de autores y los correos del equipo se manejan solo desde el panel de la gaceta, en la sección «Cuentas y autores».</p><a class="boton boton--primario" href="' + BASE + '/admin/">Ir al panel</a></div>'; }
    }
  }
  paginas();
})();
