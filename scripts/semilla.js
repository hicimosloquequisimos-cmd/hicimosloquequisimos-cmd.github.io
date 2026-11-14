// Crea el contenido inicial (solo se usó una vez para arrancar el proyecto).
const fs = require('fs'), path = require('path');
const w = (f, d) => { const p = path.join(__dirname, '..', 'content', f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n'); };

w('ajustes/sitio.json', {
  nombre: 'Hicimos lo que quisimos',
  descripcion: 'Repositorio de escritura del sur del Cesar y la Ribera del Magdalena. Gaceta de la Licenciatura en Literatura y Lengua Castellana.',
  institucion: 'Licenciatura en Literatura y Lengua Castellana · UPC Aguachica',
  url: '',
  imagen_compartir: '',
  correo: 'hicimosloquequisimos@gmail.com',
  asunto_envio: 'ENVÍO | GÉNERO | TÍTULO',
  cuerpo_envio: 'Hola, equipo de Hicimos lo que quisimos:\n\nEnvío mi creación para la gaceta. Adjunto:\n\n1. La obra, anónima (sin mi nombre dentro del archivo).\n2. Ficha de autor: datos, biografía corta, uso de IA y/o créditos.\n3. Licencia de uso no exclusivo, firmada (PDF).\n4. Nota de obra (opcional, máximo 150 palabras).\n\nGénero:\nTítulo:\n\nGracias.',
  redes: [
    { red: 'instagram', url: 'https://www.instagram.com/hicimosloquequisimos/', usuario: '@hicimosloquequisimos' },
    { red: 'x', url: 'https://x.com/hicimoloququi10', usuario: '@hicimoloququi10' },
    { red: 'tiktok', url: 'https://www.tiktok.com/@hicimosloquequisimos', usuario: '@hicimosloquequisimos' },
  ],
  aviso: { activo: true, texto: 'Convocatoria abierta: escribe lo que quieras.', enlace: '/envia-tu-texto/', texto_enlace: 'Envía tu creación', color: 'canaguate' },
  frase_pie: 'Lo que el río se lleva, la voz lo devuelve.',
  texto_pie: 'Preservando la voz literaria del sur del Cesar y las riberas del río Magdalena.',
  frases_pie: [
    { frase: 'Repositorio de escritura del sur del Cesar y la Ribera del Magdalena.' },
    { frase: 'Gaceta de la Licenciatura en Literatura y Lengua Castellana.' },
    { frase: '^^Amantes de la desobediencia.^^' },
  ],
  licencia: 'Las obras se publican bajo licencia Creative Commons BY-NC-ND 4.0, salvo que la ficha indique otra.',
  marca: { indigo: '#1E2747', papel: '#F1E9D8', rojo: '#D7372B', canaguate: '#F2B33D', animar_logo: true, modo_oscuro: true },
  codigo_cabecera: '',
});

w('ajustes/menu.json', {
  enlaces: [
    { texto: 'Archivo', enlace: '/archivo/' },
    { texto: 'Autores', enlace: '/autores/' },
    { texto: 'Agenda', enlace: '/agenda/' },
    { texto: 'Equipo editorial', enlace: '/equipo-editorial/' },
  ],
  incluir_paginas: true,
  boton_texto: 'Envía tu creación',
  boton_enlace: '',
});

w('ajustes/inicio.json', {
  bloques: [
    { tipo: 'portada', sobretitulo: 'Gaceta digital · Repositorio abierto', antes: 'Escribe lo que', tachado: 'debes', escrito: 'quieras',
      intro: 'Un espacio de estudiantes para publicar lo irreverente, lo desobediente y lo que escribiste a escondidas. Poesía, cuento, ensayo, crónica y lo que no cabe en ningún género.',
      botones: [{ texto: 'Envía tu creación', enlace: '', estilo: 'primario' }, { texto: 'Explorar el archivo', enlace: '/archivo/', estilo: 'contorno' }],
      atarraya: true, enmienda_frase: true, pregunta: '¿Qué te dijeron que debías escribir?' },
    { tipo: 'cifras', automaticas: true, extra: [], nota: '', apariencia: { espacio: 'compacto' } },
    { tipo: 'fichas', sobretitulo: 'El archivo', titulo: 'Cómete una paletita y échale ojo al archivo', cantidad: 6, orden: 'recientes', ver_todo: true },
    { tipo: 'texto', titulo: 'Lo que ~~debíamos~~^^dejamos^^', margen: true,
      cuerpo: 'Nuestra herencia es preservar y publicar las voces de estudiantes y educadores de la ribera del Magdalena y el sur del Cesar.\n\nAquí recogemos con atarraya lo que el río deja (versos, cuentos, crónicas, voces), lo corregimos con lápiz rojo y lo devolvemos a quien lo escribió.',
      apariencia: { fondo: 'ficha' } },
    { tipo: 'cita', texto: 'Nada de esto es mío.\nPor eso lo publico.', autor: 'Del archivo', nota: 'cambia esta cita por un verso de una obra publicada', tamano: 'grande' },
    { tipo: 'colecciones', sobretitulo: 'Archivo · Colecciones', titulo: 'Lo que el río nos dejó' },
    { tipo: 'agenda', titulo: 'Lo que viene', cantidad: 3 },
    { tipo: 'bitacora', titulo: 'Bitácora', cantidad: 3 },
    { tipo: 'llamado', titulo: 'Todo lo que escribimos, en un solo lugar', texto: 'Repositorio de escritura del sur del Cesar y la Ribera del Magdalena. Amantes de la desobediencia.',
      botones: [{ texto: 'Archivo', enlace: '/archivo/', estilo: 'canaguate' }], apariencia: { fondo: 'indigo' } },
  ],
});

w('ajustes/equipo.json', {
  titulo: 'Equipo editorial',
  intro: 'Quienes leen, evalúan, corrigen y publican cada texto de la gaceta.',
  miembros: [
    ['Luisa Mariana López', 'Directora General'],
    ['Luis Hernán Romero Reyes', 'Editor Jefe'],
    ['Carmen Alicia Guagua Tovar', 'Auxiliar Editor Jefe'],
    ['Juan José Árevalo Gallardo', 'Jefe de Talleres'],
    ['Liz Alexandra Vega Rivera', 'Auxiliar Jefe de Talleres'],
    ['Sebastian Montealegre Vergel', 'Jefe de Página'],
    ['Cristian Andrés Rangel Vera', 'Jefe de redes'],
    ['Mariangel Arrieta', 'Auxiliar Jefe de redes'],
    ['Sharon Michell Bandera Cárdenas', 'Auxiliar Jefe de redes'],
  ].map(([nombre, rol]) => ({ nombre, rol, foto: '', bio: '', enlace: '' })),
  bloques: [
    { tipo: 'enmiendas', titulo: '', lineas: [
      { antes: 'Nos dijeron que escribiéramos', tachado: 'como en Bogotá', escrito: 'como en Aguachica' },
      { antes: 'Que la poesía era', tachado: 'para otros', escrito: 'para la orilla' },
      { antes: 'Que lo que cantaba la abuela', tachado: 'no era literatura', escrito: 'era archivo' },
    ], cierre: '[Leer el manifiesto completo](/manifiesto/)', apariencia: { fondo: 'ficha' } },
  ],
});

w('ajustes/archivo.json', {
  sobretitulo: 'Archivo · Colecciones', titulo: 'Todo lo que', escrito: 'quisimos',
  bajada: 'Lo que el río nos dejó. Busca por título, autor, municipio o palabra.',
  placeholder: 'río, abuela, Gamarra…', bloques: [],
});

const col = (slug, nombre, lema, color, icono, orden) => w(`colecciones/${slug}.json`, { nombre, lema, descripcion: '', color, color_libre: '', icono, orden, imagen: '', bloques: [] });
col('poesia', 'Poesía', 'El verso y sus desvíos.', 'rojo', 'poesia', 1);
col('cuento', 'Cuento', 'Historias para leer de un tirón.', 'indigo', 'narrativa', 2);
col('formas-hibridas', 'Formas híbridas', 'Lo que no cabe en un solo género.', 'canaguate', 'hibrida', 3);
col('ensayo', 'Ensayo', 'Pensar en voz alta.', 'buchon', 'ensayo', 4);
col('cronica', 'Crónica', 'Lo que pasó, contado de cerca.', 'lodo', 'cronica', 5);

w('autores/autora-de-ejemplo.json', {
  nombre: 'Autora de ejemplo', foto: '', municipio: 'Aguachica', perfil: 'Perfil de ejemplo · bórralo desde el panel',
  bio: 'Este es un perfil de ejemplo para ver cómo se ve la página de un autor. Cuando publiquen la primera obra real, creen aquí el perfil de quien la escribió y borren este.',
  redes: [], color: 'rojo',
});

const base = { autores: ['autora-de-ejemplo'], autor_texto: '', codigo: '', departamento: 'Cesar', evaluacion: 'doble ciego · 2 lectores', licencia: 'CC BY-NC-ND 4.0', extracto: '', portada: '', portada_pie: '', galeria: [], audio: '', audio_url: '', transcripcion: '', video: '', pdf: '', etiquetas: [], destacada: false, ejemplo: true, bloques: [], descripcion_seo: '', estado: 'publicada', fecha_escritura: '' };
w('obras/la-orilla-que-baja.json', { ...base, titulo: 'La orilla que baja', coleccion: 'poesia', fecha_publicacion: '2026-11-10', municipio: 'Gamarra', procedencia: 'Obra de ejemplo', forma: 'verso', destacada: true,
  verso: 'Cuando el agua se retira\nla orilla aprende a hablar:\n\n        dice piedra,\n        dice garza,\n        dice lo que el río calló.\n\nMe enseñaron que esto ~~no era poesía~~^^era la orilla^^.\nYo lo anoto igual,\ncon la boca llena de barro.',
  prosa: '', notas: [{ tipo: 'Nota del editor', texto: 'la autora pidió conservar su tachadura' }, { tipo: 'Leído en', texto: 'lectura pública de ejemplo' }], etiquetas: [{ etiqueta: 'río' }, { etiqueta: 'orilla' }] });
w('obras/el-planchon-de-las-seis.json', { ...base, titulo: 'El planchón de las seis', coleccion: 'cuento', fecha_publicacion: '2026-11-05', municipio: 'La Gloria', procedencia: 'Obra de ejemplo', forma: 'prosa', verso: '',
  prosa: 'El planchón salía a las seis, aunque nadie supiera muy bien de qué reloj. Don Abel lo empujaba con la vara como quien empuja una conversación vieja, y los pasajeros se quedaban callados para no espantar al río.\n\nAquella mañana subió una muchacha con un cuaderno forrado en plástico. No miró la otra orilla: miró el agua, y escribió.\n\n—¿Qué anota? —preguntó Don Abel.\n\n—Lo que usted no dice —contestó ella.',
  notas: [{ tipo: 'Contexto', texto: 'texto de ejemplo para ver una obra en prosa' }] });
w('obras/mercado-de-los-sabados.json', { ...base, titulo: 'Mercado de los sábados', coleccion: 'cronica', fecha_publicacion: '2026-10-28', municipio: 'Aguachica', procedencia: 'Obra de ejemplo', forma: 'prosa', verso: '',
  prosa: 'A las cinco de la mañana el mercado ya tiene voz. Primero la de los camiones, después la de las vendedoras que acomodan el bocachico en hielo y, al final, la de los que regatean por costumbre más que por necesidad.\n\nEsta crónica es un ejemplo: sirve para ver cómo se ven los párrafos, la letra capitular y las notas al margen.',
  notas: [] });

w('agenda/convocatoria-abierta.json', {
  titulo: 'Convocatoria abierta 2026-II', tipo: 'convocatoria', inicio: '2026-11-01T08:00', fin: '2026-11-30T23:59', lugar: 'En línea · hicimosloquequisimos@gmail.com',
  imagen: '', resumen: 'Poesía, cuento, formas híbridas, ensayo y crónica. Sin tema obligatorio.',
  descripcion: 'Trae lo que escribiste a escondidas. Aquí se publica.\n\nSin tema obligatorio, porque ~~debíamos~~^^quisimos^^.\n\n*Evento de ejemplo: cambia las fechas y el texto desde el panel.*',
  enlace: '/envia-tu-texto/', texto_enlace: 'Envía tu creación', destacado: true, ejemplo: true, bloques: [],
});

w('bitacora/2026-11-feria-de-emprendimiento-apertura-de-la-gaceta.json', {
  titulo: 'Feria de emprendimiento · Apertura de la gaceta', fecha: '2026-11-13', autor: 'Equipo editorial', publicada: true, portada: '',
  resumen: 'Así abrimos la gaceta. (Completa esta entrada desde el panel con fotos y la crónica del día.)',
  cuerpo: 'Escribe aquí la crónica de la apertura: quiénes estuvieron, qué se leyó, qué se vendió en la feria.\n\nPuedes agregar una **galería de fotos** con el bloque «Galería» más abajo.',
  bloques: [], etiquetas: [{ etiqueta: 'eventos' }],
});

w('paginas/manifiesto.json', {
  titulo: 'Manifiesto', url: 'manifiesto', sobretitulo: 'Antes de empezar · Manifiesto', tachado: '', escrito: '', bajada: '', cabeza: false, franja: 'rojo',
  bloques: [
    { tipo: 'encabezado', sobretitulo: 'Antes de empezar · Manifiesto', titulo: 'Hicimos lo que', tachado: 'debíamos', escrito: 'quisimos', tamano: 'grande', apariencia: { ancho: 'lectura', espacio: 'amplio' } },
    { tipo: 'enmiendas', lineas: [
      { antes: 'Nos dijeron que escribiéramos', tachado: 'como en Bogotá', escrito: 'como en Aguachica', despues: '.' },
      { antes: 'Que la poesía era', tachado: 'para otros', escrito: 'para la orilla', despues: '.' },
      { antes: 'Que lo que cantaba la abuela', tachado: 'no era literatura', escrito: 'era archivo', despues: '.' },
      { antes: 'Que eso', tachado: 'no se publicaba', escrito: 'aquí se publica', despues: '.' },
    ], cierre: 'Aquí recogemos con atarraya lo que el río deja (versos, cuentos, crónicas, voces), lo corregimos con lápiz rojo y lo devolvemos a quien lo escribió.', apariencia: { ancho: 'lectura', espacio: 'compacto' } },
    { tipo: 'separador', estilo: 'atarraya' },
    { tipo: 'columnas', titulo: 'Lo que nos mueve', columnas: [
      { titulo: 'Libertad creativa', cuerpo: 'Se acoge la experimentación formal y temática sin cánones impuestos.' },
      { titulo: 'Territorio', cuerpo: 'La palabra del río, la ciénaga y el pueblo ocupa el centro del archivo.' },
      { titulo: 'Rigor editorial', cuerpo: 'Cada texto pasa por evaluación, edición y corrección antes de publicarse.' },
      { titulo: 'Memoria y apertura', cuerpo: 'Lo publicado se cataloga, se conserva y permanece consultable. Escriben estudiantes, docentes, colegios, cantadoras y comunidades.' },
    ], apariencia: { fondo: 'ficha' } },
  ],
  en_menu: true, orden_menu: 5, descripcion_seo: 'Manifiesto de la gaceta Hicimos lo que quisimos.', imagen_seo: '',
});

w('paginas/envia-tu-texto.json', {
  titulo: 'Envía tu texto', url: 'envia-tu-texto', sobretitulo: 'Convocatoria permanente', tachado: 'debes', escrito: 'quieras', bajada: 'Escribe lo que quieras. Trae lo que escribiste a escondidas: aquí se publica.', cabeza: true, franja: '',
  bloques: [
    { tipo: 'envio', titulo: 'Envía tu creación', texto: 'Recibimos poesía, cuento, formas híbridas, ensayo y crónica. Escribe al correo de la gaceta con el asunto **ENVÍO | GÉNERO | TÍTULO**.\n\nEl botón abre tu correo con la plantilla lista.',
      requisitos: [{ item: 'La obra, anónima (sin tu nombre dentro del archivo).' }, { item: 'Ficha de autor: datos, biografía, uso de IA y/o créditos.' }, { item: 'Licencia de uso no exclusivo, firmada (PDF).' }, { item: 'Nota de obra (opcional, máximo 150 palabras).' }], boton: 'Envía tu creación' },
    { tipo: 'ruta', titulo: 'Qué pasa con tu texto', pasos: [
      { titulo: 'Recibimos', texto: 'Confirmamos que llegó tu texto y lo registramos.' },
      { titulo: 'Leemos', texto: 'Dos lectores lo evalúan sin saber quién lo escribió.' },
      { titulo: 'Enmendamos', texto: 'Proponemos correcciones. Tú decides qué enmiendas aceptar.' },
      { titulo: 'Publicamos', texto: 'Tu obra entra al archivo con su ficha y tu nombre.' },
    ], nota: 'el editor propone, el autor decide qué enmiendas acepta', apariencia: { fondo: 'ficha' } },
    { tipo: 'preguntas', titulo: 'Preguntas frecuentes', items: [
      { pregunta: '¿Quién puede enviar?', respuesta: 'Estudiantes, docentes, colegios y comunidades del sur del Cesar y la ribera del Magdalena.' },
      { pregunta: '¿Hay un tema obligatorio?', respuesta: 'No. Hicimos lo que quisimos.' },
      { pregunta: '¿Con qué licencia se publica?', respuesta: 'Creative Commons BY-NC-ND 4.0: se puede compartir citando tu nombre, sin fines comerciales y sin modificar la obra.' },
    ] },
  ],
  en_menu: false, orden_menu: 10, descripcion_seo: 'Envía tu texto a la gaceta.', imagen_seo: '',
});
console.log('Contenido inicial creado.');
