// Microgestos de la gaceta: enmienda tu frase, archivo, visor, tema, compartir.
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reducir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
  var escHTML = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function aviso(txt) {
    var t = $('[data-toast]'); if (!t) return;
    t.textContent = txt; t.classList.add('visible');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('visible'); }, 2200);
  }

  // Logotipo que se escribe (primera visita de la sesión)
  var logo = $('.logo--anima');
  try {
    if (logo && !reducir && !sessionStorage.getItem('firma')) { logo.classList.add('firma'); sessionStorage.setItem('firma', '1'); }
  } catch (e) { }

  // Tema claro / oscuro
  var botonTema = $('[data-tema-boton]');
  var lunaSvg = botonTema ? botonTema.innerHTML : '';
  var solSvg = '<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function pintarTema() { if (botonTema) botonTema.innerHTML = document.documentElement.dataset.tema === 'oscuro' ? solSvg : lunaSvg; }
  if (botonTema) {
    pintarTema();
    botonTema.addEventListener('click', function () {
      var nuevo = document.documentElement.dataset.tema === 'oscuro' ? '' : 'oscuro';
      if (nuevo) document.documentElement.dataset.tema = nuevo; else delete document.documentElement.dataset.tema;
      try { nuevo ? localStorage.setItem('tema', nuevo) : localStorage.removeItem('tema'); } catch (e) { }
      pintarTema();
    });
  }

  // Menú móvil
  var bMenu = $('[data-menu]'), nav = $('#nav');
  if (bMenu && nav) bMenu.addEventListener('click', function () {
    var abierto = nav.classList.toggle('abierta');
    bMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  // Enmienda tu frase: el visitante escribe lo que le dijeron y la página lo tacha
  $$('[data-enmienda]').forEach(function (f) {
    var input = $('input', f), out = $('output', f);
    var ejemplo = input.getAttribute('placeholder') || 'algo serio';
    function pintar() {
      var v = input.value.trim() || ejemplo;
      out.innerHTML = 'Te dijeron que escribieras <span class="tacha">' + escHTML(v) + '</span><span class="enmienda">y escribiste lo que quisiste.</span>';
    }
    input.addEventListener('input', pintar);
  });

  // Archivo: buscador y filtros
  var arch = $('[data-archivo]');
  if (arch) {
    var q = $('[data-q]', arch), lista = $('[data-lista]', arch), fichas = $$('.ficha', lista);
    var selMun = $('[data-mun]', arch), selAnio = $('[data-anio]', arch), selOrden = $('[data-orden]', arch);
    var cont = $('[data-contador]', arch), vacio = $('[data-vacio]', arch);
    var col = '';
    var params = new URLSearchParams(location.search);
    if (params.get('q')) q.value = params.get('q');
    if (params.get('coleccion')) col = params.get('coleccion');
    function puntaje(f, t) {
      // Más alto = más arriba: título > autor > datos de la ficha > texto completo
      var p = 0, tit = f.dataset.titulo, aut = f.dataset.autor || '', fic = f.dataset.texto, cue = f.dataset.cuerpo || '';
      for (var i = 0; i < t.length; i++) {
        var w = t[i];
        if (tit === w) p += 100; else if (tit.indexOf(w) === 0) p += 60; else if (tit.indexOf(w) > -1) p += 40;
        else if (aut.indexOf(w) > -1) p += 25;
        else if (fic.indexOf(w) > -1) p += 15;
        else if (cue.indexOf(w) > -1) p += 5;
        else return 0;
      }
      return p;
    }
    function filtrar() {
      var t = norm(q.value).split(/\s+/).filter(Boolean), m = selMun ? selMun.value : '', a = selAnio ? selAnio.value : '';
      var n = 0;
      fichas.forEach(function (f) {
        f._p = t.length ? puntaje(f, t) : 1;
        var ok = f._p > 0 && (!col || f.dataset.col === col) && (!m || f.dataset.mun === m) && (!a || f.dataset.anio === a);
        f.hidden = !ok; if (ok) n++;
      });
      ordenar(t.length > 0);
      cont.textContent = n + (n === 1 ? ' ficha' : ' fichas');
      vacio.hidden = n > 0;
      $$('.chip[data-col]', arch).forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.col === col ? 'true' : 'false'); });
    }
    function ordenar(porRelevancia) {
      var o = selOrden.value;
      fichas.slice().sort(function (x, y) {
        if (porRelevancia && y._p !== x._p) return y._p - x._p;
        if (o === 'alfabetico') return x.dataset.titulo.localeCompare(y.dataset.titulo, 'es');
        var d = new Date(y.dataset.fecha) - new Date(x.dataset.fecha);
        return o === 'antiguas' ? -d : d;
      }).forEach(function (f) { lista.appendChild(f); });
    }
    q.addEventListener('input', filtrar);
    if (selMun) selMun.addEventListener('change', filtrar);
    if (selAnio) selAnio.addEventListener('change', filtrar);
    selOrden.addEventListener('change', filtrar);
    $$('.chip[data-col]', arch).forEach(function (c) { c.addEventListener('click', function () { col = c.dataset.col; filtrar(); }); });
    filtrar();
  }

  // Visor de imágenes en calidad original
  var visor = $('[data-visor]');
  if (visor) {
    var vImg = $('img', visor), vPie = $('p', visor);
    document.addEventListener('click', function (e) {
      var img = e.target.closest && e.target.closest('img[data-ampliar]');
      if (!img) return;
      vImg.src = img.currentSrc || img.src; vImg.alt = img.alt || '';
      vPie.textContent = img.dataset.pie || img.alt || '';
      visor.classList.add('abierto'); document.body.style.overflow = 'hidden';
      $('button', visor).focus();
    });
    var cerrar = function () { visor.classList.remove('abierto'); document.body.style.overflow = ''; };
    visor.addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
  }

  // Compartir y copiar
  $$('[data-compartir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var datos = { title: b.dataset.titulo || document.title, url: location.href };
      if (navigator.share) navigator.share(datos).catch(function () { });
      else copiar(location.href, 'Enlace copiado');
    });
  });
  function copiar(txt, msj) {
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { aviso(msj || 'Copiado'); }, function () { aviso('No se pudo copiar'); });
    else { var t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); aviso(msj || 'Copiado'); } catch (e) { } t.remove(); }
  }
  $$('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { copiar(b.dataset.copiar, 'Cita copiada'); }); });

  // Eventos que ya pasaron (aunque el sitio no se haya vuelto a generar)
  $$('.evento[data-fin]').forEach(function (e) {
    var f = e.dataset.fin && new Date(e.dataset.fin);
    if (f && f < new Date() && !e.classList.contains('pasado')) {
      e.classList.add('pasado');
      if (e.closest('[data-agenda]') || e.closest('.bloque--agenda')) e.hidden = true;
    }
  });

  // Onda del reproductor
  $$('.audio').forEach(function (a) {
    var au = $('audio', a), onda = $('.audio__onda', a);
    if (!au || !onda) return;
    au.addEventListener('play', function () { onda.classList.add('sonando'); });
    au.addEventListener('pause', function () { onda.classList.remove('sonando'); });
    au.addEventListener('ended', function () { onda.classList.remove('sonando'); });
  });
})();
