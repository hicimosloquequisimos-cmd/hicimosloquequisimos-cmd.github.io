// Configuración del panel de edición (Sveltia CMS, compatible con Decap).
// Se genera como admin/config.yml (JSON es YAML válido).

const S = (name, label, x = {}) => ({ name, label, widget: 'string', required: false, ...x });
const TX = (name, label, x = {}) => ({ name, label, widget: 'text', required: false, ...x });
const MD = (name, label, x = {}) => ({ name, label, widget: 'markdown', required: false, buttons: ['bold', 'italic', 'link', 'heading-two', 'heading-three', 'quote', 'bulleted-list', 'numbered-list', 'code'], editor_components: ['image'], ...x });
const IMG = (name, label, x = {}) => ({ name, label, widget: 'image', required: false, choose_url: true, ...x });
const FILE = (name, label, x = {}) => ({ name, label, widget: 'file', required: false, choose_url: true, ...x });
const B = (name, label, def = false, x = {}) => ({ name, label, widget: 'boolean', required: false, default: def, ...x });
const N = (name, label, def, x = {}) => ({ name, label, widget: 'number', required: false, value_type: 'int', ...(def !== undefined ? { default: def } : {}), ...x });
const SEL = (name, label, options, def, x = {}) => ({ name, label, widget: 'select', required: false, options, ...(def !== undefined ? { default: def } : {}), ...x });
const L = (name, label, fields, x = {}) => ({ name, label, widget: 'list', required: false, fields, ...x });
const O = (name, label, fields, x = {}) => ({ name, label, widget: 'object', required: false, fields, ...x });
const FECHA = (name, label, x = {}) => ({ name, label, widget: 'datetime', required: false, time_format: false, date_format: 'DD/MM/YYYY', format: 'YYYY-MM-DD', ...x });
const FECHAHORA = (name, label, x = {}) => ({ name, label, widget: 'datetime', required: false, date_format: 'DD/MM/YYYY', time_format: 'h:mm A', format: 'YYYY-MM-DDTHH:mm', ...x });
const REL = (name, label, collection, campo, x = {}) => ({ name, label, widget: 'relation', required: false, collection, value_field: '{{slug}}', search_fields: [campo], display_fields: [campo], ...x });
const CODE = (name, label, x = {}) => ({ name, label, widget: 'code', required: false, default_language: 'html', output_code_only: true, allow_language_selection: false, ...x });

const COLORES = [
  { label: 'Lápiz rojo', value: 'rojo' }, { label: 'Índigo de río', value: 'indigo' },
  { label: 'Cañaguate (amarillo)', value: 'canaguate' }, { label: 'Buchón (verde)', value: 'buchon' },
  { label: 'Lodo (café)', value: 'lodo' }, { label: 'Grafito', value: 'grafito' },
];
const FONDOS = [
  { label: 'Papel (normal)', value: 'papel' }, { label: 'Ficha (papel claro)', value: 'ficha' },
  { label: 'Índigo', value: 'indigo' }, { label: 'Cañaguate', value: 'canaguate' },
  { label: 'Buchón', value: 'buchon' }, { label: 'Lodo', value: 'lodo' },
];
const ESTILO_BOTON = [
  { label: 'Rojo (principal)', value: 'primario' }, { label: 'Contorno', value: 'contorno' },
  { label: 'Índigo', value: 'indigo' }, { label: 'Cañaguate', value: 'canaguate' },
];
const BOTONES = L('botones', 'Botones', [S('texto', 'Texto del botón'), S('enlace', 'Enlace', { hint: 'Ej.: /archivo/ · https://… · mailto:correo@…' }), SEL('estilo', 'Estilo', ESTILO_BOTON, 'primario')], { summary: '{{fields.texto}}' });

// Opciones comunes a todos los bloques
const COMUNES = O('apariencia', 'Apariencia del bloque', [
  SEL('fondo', 'Fondo', FONDOS, 'papel'),
  SEL('espacio_arriba', 'Espacio arriba', [{ label: 'Ninguno', value: '0' }, { label: 'Poquito', value: '1' }, { label: 'Poco', value: '2' }, { label: 'Normal', value: '3' }, { label: 'Mucho', value: '4' }], '3'),
  SEL('espacio_abajo', 'Espacio abajo', [{ label: 'Ninguno', value: '0' }, { label: 'Poquito', value: '1' }, { label: 'Poco', value: '2' }, { label: 'Normal', value: '3' }, { label: 'Mucho', value: '4' }], '3'),
  SEL('ancho', 'Ancho', [{ label: 'Normal', value: 'normal' }, { label: 'Lectura (angosto)', value: 'lectura' }, { label: 'Ancho', value: 'ancho' }], 'normal'),
  SEL('alineacion', 'Alineación', [{ label: 'Izquierda', value: 'izquierda' }, { label: 'Centro', value: 'centro' }], 'izquierda'),
  S('ancla', 'Ancla (#)', { hint: 'Nombre corto para enlazar directo a este bloque. Ej.: convocatoria → /pagina/#convocatoria' }),
  B('oculto', 'Ocultar este bloque (sin borrarlo)', false),
], { collapsed: true });

// Sobretítulo (rojo, arriba) y texto de abajo (gris) para todos los bloques que no los traen ya
const SIN_ENCABEZADO = ['portada', 'encabezado', 'separador', 'html'];
// Imagen o animación al lado del contenido del bloque
const SIN_LADO = ['portada', 'separador', 'html', 'imagen', 'galeria', 'video'];
const LADO = O('lado', 'Imagen o animación al lado', [
  FILE('archivo', 'Archivo (GIF, PNG, JPG, SVG, WebP o video MP4)', { hint: 'Los GIF y los videos MP4 se reproducen solos, en bucle y sin sonido, como un GIF.' }),
  SEL('posicion', 'Lado', [{ label: 'Derecha', value: 'derecha' }, { label: 'Izquierda', value: 'izquierda' }], 'derecha'),
  SEL('tamano', 'Tamaño', [{ label: 'Pequeña', value: 'p' }, { label: 'Mediana', value: 'm' }, { label: 'Grande', value: 'g' }, { label: 'Mitad y mitad', value: 'mitad' }], 'm'),
  SEL('vertical', 'Alineación vertical', [{ label: 'Centrada', value: 'center' }, { label: 'Arriba', value: 'start' }, { label: 'Abajo', value: 'end' }], 'center'),
  S('alt', 'Descripción (para lectores de pantalla)'),
  S('pie', 'Pie (opcional)'),
  B('celular', 'Mostrarla también en celular', true),
], { collapsed: true });
const tipo = (name, label, fields, summary) => {
  const extra = [];
  if (!SIN_ENCABEZADO.includes(name)) {
    if (!fields.some(f => f.name === 'sobretitulo')) extra.push(S('sobretitulo', 'Sobretítulo (rojo, arriba del título)'));
    if (!fields.some(f => f.name === 'bajada')) extra.push(TX('bajada', 'Texto de abajo (gris, debajo del título)'));
  }
  // El sobretítulo va de primero; el texto de abajo, justo después del título si lo hay
  const conSobre = extra.filter(f => f.name === 'sobretitulo');
  const conBajada = extra.filter(f => f.name === 'bajada');
  const lista = [...conSobre, ...fields];
  const iTit = lista.findIndex(f => f.name === 'titulo');
  if (conBajada.length) lista.splice(iTit >= 0 ? iTit + 1 : conSobre.length, 0, ...conBajada);
  if (!SIN_LADO.includes(name)) lista.push(LADO);
  return { name, label, widget: 'object', fields: [...lista, COMUNES], ...(summary ? { summary } : {}) };
};

const TIPOS_BLOQUE = [
  tipo('portada', '★ Portada con enmienda', [
    S('sobretitulo', 'Sobretítulo', { default: 'Gaceta literaria · UPC Aguachica · Repositorio abierto' }),
    S('antes', 'Titular (parte impresa)', { default: 'Escribe lo que' }),
    S('tachado', 'Palabra tachada', { default: 'debes' }),
    S('escrito', 'Palabra escrita a mano', { default: 'quieras' }),
    TX('intro', 'Texto de introducción'),
    BOTONES,
    B('atarraya', 'Mostrar la atarraya animada', true),
    B('enmienda_frase', 'Mostrar «Enmienda tu frase»', true),
    S('pregunta', 'Pregunta de «Enmienda tu frase»', { default: '¿Qué te dijeron que debías escribir?' }),
  ], '{{fields.antes}} {{fields.escrito}}'),
  tipo('encabezado', 'Título enmendado', [
    S('sobretitulo', 'Sobretítulo'), S('titulo', 'Título'),
    S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra escrita a mano (opcional)'),
    TX('bajada', 'Bajada / subtítulo'),
    SEL('tamano', 'Tamaño', [{ label: 'Grande', value: 'grande' }, { label: 'Mediano', value: 'mediano' }], 'grande'),
  ], '{{fields.titulo}}'),
  tipo('texto', 'Texto', [
    S('titulo', 'Título (opcional)'),
    MD('cuerpo', 'Texto', { hint: 'Tachar: ~~palabra~~ · Escribir a mano: ^^palabra^^ · Las dos: ~~debes~~^^quieras^^' }),
    B('margen', 'Con margen rojo de cuaderno', false),
  ], '{{fields.titulo}}'),
  tipo('verso', 'Poema / verso', [
    S('titulo', 'Título'), S('autor', 'Autor/a'),
    TX('texto', 'Versos', { hint: 'Se respetan los espacios, sangrías y líneas en blanco tal como los escribas.' }),
    TX('nota', 'Nota al margen (opcional)'),
  ], '{{fields.titulo}}'),
  tipo('cita', 'Cita destacada', [
    TX('texto', 'Cita'), S('autor', 'Autor/a u origen'), S('enlace', 'Enlace a la obra (opcional)'),
    TX('nota', 'Nota al margen (opcional)'),
    SEL('tamano', 'Tamaño', [{ label: 'Normal', value: 'normal' }, { label: 'Grande', value: 'grande' }], 'normal'),
  ], '{{fields.texto}}'),
  tipo('imagen', 'Imagen', [
    IMG('imagen', 'Imagen', { hint: 'Se publica en su calidad original. Puedes hacer clic en ella para verla en grande.' }),
    S('alt', 'Descripción para lectores de pantalla'), S('pie', 'Pie de foto'), S('enlace', 'Enlace al hacer clic (opcional)'),
    SEL('tamano', 'Tamaño', [{ label: 'Normal', value: 'normal' }, { label: 'Ancho', value: 'ancho' }, { label: 'Pantalla completa', value: 'completo' }], 'ancho'),
  ], '{{fields.pie}}'),
  tipo('galeria', 'Galería de fotos', [
    S('titulo', 'Título (opcional)'),
    L('imagenes', 'Fotos', [IMG('imagen', 'Foto'), S('pie', 'Pie de foto'), S('alt', 'Descripción')], { summary: '{{fields.pie}}' }),
    SEL('columnas', 'Columnas', ['2', '3', '4'], '3'),
    B('recortar', 'Recortar en cuadrado', true),
  ], '{{fields.titulo}}'),
  tipo('video', 'Video', [
    S('titulo', 'Título (opcional)'),
    S('url', 'Enlace de YouTube, Vimeo, TikTok o Facebook'),
    FILE('archivo', 'O sube un video (mp4)'),
    S('pie', 'Pie / descripción'),
  ], '{{fields.titulo}}'),
  tipo('audio', 'Audio / registro sonoro', [
    S('titulo', 'Título'), S('interprete', 'Intérprete'),
    FILE('archivo', 'Archivo de audio (mp3, m4a, ogg)'),
    S('url', 'O enlace (SoundCloud, Spotify, Drive…)'),
    MD('transcripcion', 'Transcripción'),
    TX('contexto', 'Contexto / consentimiento'),
  ], '{{fields.titulo}}'),
  tipo('botones', 'Botones', [BOTONES]),
  tipo('tarjetas', 'Tarjetas', [
    S('titulo', 'Título (opcional)'),
    L('items', 'Tarjetas', [IMG('imagen', 'Imagen'), S('titulo', 'Título'), TX('texto', 'Texto'), S('enlace', 'Enlace'), S('etiqueta', 'Etiqueta pequeña')], { summary: '{{fields.titulo}}' }),
    SEL('columnas', 'Columnas', ['2', '3', '4'], '3'),
  ], '{{fields.titulo}}'),
  tipo('columnas', 'Columnas de texto', [
    S('titulo', 'Título (opcional)'),
    L('columnas', 'Columnas', [S('titulo', 'Título'), MD('cuerpo', 'Texto')], { summary: '{{fields.titulo}}' }),
  ], '{{fields.titulo}}'),
  tipo('fichas', 'Fichas de obras', [
    S('sobretitulo', 'Sobretítulo', { default: 'Recién llegados al archivo' }),
    S('titulo', 'Título', { default: 'Nuevas fichas' }),
    REL('coleccion', 'Solo de esta colección (opcional)', 'colecciones', 'nombre'),
    REL('autor', 'Solo de este autor/a (opcional)', 'autores', 'nombre'),
    S('etiqueta', 'Solo con esta etiqueta (opcional)'),
    N('cantidad', 'Cuántas mostrar', 6),
    B('destacadas', 'Solo obras destacadas', false),
    SEL('orden', 'Orden', [{ label: 'Más recientes', value: 'recientes' }, { label: 'Más antiguas', value: 'antiguas' }, { label: 'Por código (HLQQ-001, 002, 003…)', value: 'codigo' }, { label: 'Por código, del último al primero', value: 'codigo_desc' }, { label: 'Alfabético', value: 'alfabetico' }, { label: 'Al azar (cambia en cada publicación)', value: 'azar' }], 'recientes'),
    B('imagenes', 'Mostrar imagen de portada en la ficha', false),
    B('ver_todo', 'Botón «Ver todo el archivo»', true),
  ], '{{fields.titulo}}'),
  tipo('colecciones', 'Colecciones', [
    S('sobretitulo', 'Sobretítulo', { default: 'Archivo · Colecciones' }),
    S('titulo', 'Título', { default: 'Lo que el río nos dejó' }),
  ], '{{fields.titulo}}'),
  tipo('cifras', 'Cifras del archivo', [
    B('automaticas', 'Contar obras, autores y municipios automáticamente', true),
    L('extra', 'Cifras adicionales', [S('numero', 'Número'), S('etiqueta', 'Etiqueta')], { summary: '{{fields.numero}} {{fields.etiqueta}}' }),
    S('nota', 'Nota a la derecha (opcional)'),
  ]),
  tipo('agenda', 'Agenda (próximos eventos)', [
    S('titulo', 'Título', { default: 'Lo que viene' }),
    N('cantidad', 'Cuántos mostrar', 3),
    SEL('tipo', 'Solo de este tipo (opcional)', ['convocatoria', 'taller', 'lectura', 'lanzamiento', 'feria', 'otro']),
    B('pasados', 'Incluir eventos pasados', false),
  ], '{{fields.titulo}}'),
  tipo('bitacora', 'Entradas de la bitácora', [
    S('titulo', 'Título', { default: 'Bitácora' }),
    N('cantidad', 'Cuántas mostrar', 3),
    S('etiqueta', 'Solo con esta etiqueta (opcional)'),
  ], '{{fields.titulo}}'),
  tipo('equipo', 'Equipo editorial', [S('titulo', 'Título', { default: 'Equipo Gaceta' }), TX('intro', 'Introducción')], '{{fields.titulo}}'),
  tipo('autores', 'Autores', [S('titulo', 'Título', { default: 'Quienes escriben' }), N('cantidad', 'Cuántos mostrar (0 = todos)', 0)], '{{fields.titulo}}'),
  tipo('enmiendas', 'Frases enmendadas (manifiesto)', [
    S('titulo', 'Título (opcional)'),
    L('lineas', 'Frases', [S('antes', 'Texto impreso'), S('tachado', 'Lo que se tacha'), S('escrito', 'Lo que se escribe a mano'), S('despues', 'Texto después (opcional)')], { summary: '{{fields.antes}} {{fields.escrito}}' }),
    MD('cierre', 'Párrafo final'),
  ], '{{fields.titulo}}'),
  tipo('enmienda_frase', '«Enmienda tu frase» (interactivo)', [
    S('titulo', 'Título (opcional)'),
    S('pregunta', 'Pregunta', { default: '¿Qué te dijeron que debías escribir?' }),
    S('ejemplo', 'Texto de ejemplo', { default: 'algo serio' }),
  ], '{{fields.pregunta}}'),
  tipo('ruta', 'Pasos / ruta editorial', [
    S('titulo', 'Título', { default: 'Qué pasa con tu texto' }),
    L('pasos', 'Pasos', [S('titulo', 'Título'), TX('texto', 'Texto')], { summary: '{{fields.titulo}}' }),
    TX('nota', 'Nota al margen (opcional)'),
  ], '{{fields.titulo}}'),
  tipo('envio', 'Botón y requisitos de envío', [
    S('titulo', 'Título', { default: 'Envía tu creación' }),
    MD('texto', 'Texto'),
    L('requisitos', 'Qué adjuntar', [S('item', 'Requisito'), FILE('archivo', 'Plantilla para descargar (opcional)', { hint: 'Ej.: la ficha de autor o la licencia en Word. Aparece un botón para descargarla junto al requisito.' }), S('boton', 'Texto del botón de descarga', { default: 'Descargar plantilla' })], { summary: '{{fields.item}}' }),
    S('boton', 'Texto del botón', { default: 'Envía tu creación' }),
  ], '{{fields.titulo}}'),
  tipo('preguntas', 'Preguntas frecuentes', [
    S('titulo', 'Título', { default: 'Preguntas frecuentes' }),
    L('items', 'Preguntas', [S('pregunta', 'Pregunta'), MD('respuesta', 'Respuesta')], { summary: '{{fields.pregunta}}' }),
  ], '{{fields.titulo}}'),
  tipo('linea_tiempo', 'Línea del tiempo', [
    S('titulo', 'Título'),
    L('items', 'Momentos', [S('fecha', 'Fecha o año'), S('titulo', 'Título'), MD('texto', 'Texto')], { summary: '{{fields.fecha}} {{fields.titulo}}' }),
  ], '{{fields.titulo}}'),
  tipo('llamado', 'Llamado a la acción', [
    S('titulo', 'Título'), S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra a mano (opcional)'),
    TX('texto', 'Texto'), BOTONES,
  ], '{{fields.titulo}}'),
  tipo('descarga', 'Archivo para descargar', [
    S('titulo', 'Título'), TX('descripcion', 'Descripción'), FILE('archivo', 'Archivo (PDF, Word, etc.)'), S('boton', 'Texto del botón', { default: 'Descargar' }),
  ], '{{fields.titulo}}'),
  tipo('pdf', 'Visor de PDF', [S('titulo', 'Título'), FILE('archivo', 'Archivo PDF'), N('alto', 'Alto en píxeles', 800)], '{{fields.titulo}}'),
  tipo('mapa', 'Mapa', [
    S('titulo', 'Título'), S('lugar', 'Lugar o dirección', { hint: 'Ej.: Malecón de Gamarra, Cesar' }), S('url', 'O enlace «insertar mapa» de Google Maps'),
  ], '{{fields.titulo}}'),
  tipo('redes', 'Redes sociales', [S('titulo', 'Título', { default: 'Síguenos' }), TX('texto', 'Texto')], '{{fields.titulo}}'),
  tipo('separador', 'Separador', [
    SEL('estilo', 'Estilo', [{ label: 'Atarraya', value: 'atarraya' }, { label: 'Signo de párrafo ¶', value: 'parrafo' }, { label: 'Línea', value: 'linea' }, { label: 'Solo espacio', value: 'espacio' }], 'atarraya'),
  ], '{{fields.estilo}}'),
  tipo('html', 'Código libre (HTML)', [
    S('titulo', 'Nombre interno (no se muestra)'),
    CODE('codigo', 'Código HTML', { hint: 'Para insertar formularios de Google, widgets, iframes, etc.' }),
  ], '{{fields.titulo}}'),
];

const BLOQUES = (name = 'bloques', label = 'Bloques') => ({
  name, label, widget: 'list', required: false, types: TIPOS_BLOQUE, typeKey: 'tipo',
  hint: 'Agrega, ordena (arrastrando) y quita bloques. Cada bloque tiene «Apariencia» para cambiar fondo, espacio y ancho.',
});

const LICENCIAS = ['CC BY-NC-ND 4.0', 'CC BY-NC-SA 4.0', 'CC BY-NC 4.0', 'CC BY 4.0', 'Todos los derechos reservados'];

function config(repo = 'USUARIO/REPOSITORIO', rama = 'main') {
  return {
    backend: { name: 'github', repo, branch: rama, commit_messages: { create: 'Nuevo: {{collection}} «{{slug}}»', update: 'Edición: {{collection}} «{{slug}}»', delete: 'Borrado: {{collection}} «{{slug}}»', uploadMedia: 'Archivo subido: {{path}}', deleteMedia: 'Archivo borrado: {{path}}' } },
    locale: 'es',
    logo_url: '/admin/logo.svg',
    media_folder: 'media/subidas',
    public_folder: '/media/subidas',
    slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
    collections: [
      {
        name: 'obras', label: '✎ Obras', label_singular: 'obra', folder: 'content/obras', extension: 'json', format: 'json', create: true,
        identifier_field: 'titulo', slug: '{{slug}}',
        summary: '{{titulo}} · {{fecha_publicacion}} · {{estado}}',
        sortable_fields: ['fecha_publicacion', 'titulo', 'codigo', 'coleccion'],
        view_filters: [{ label: 'Publicadas', field: 'estado', pattern: 'publicada' }, { label: 'Borradores', field: 'estado', pattern: 'borrador' }, { label: 'En evaluación', field: 'estado', pattern: 'evaluacion' }, { label: 'Destacadas', field: 'destacada', pattern: true }],
        view_groups: [{ label: 'Colección', field: 'coleccion' }, { label: 'Estado', field: 'estado' }],
        description: 'Cada obra es una ficha del archivo. Al marcarla como «Publicada», aparece sola en el inicio, en el archivo, en su colección y en el perfil del autor.',
        fields: [
          S('titulo', 'Título', { required: true }),
          SEL('estado', 'Estado', [{ label: 'Borrador (no se ve)', value: 'borrador' }, { label: 'En evaluación (no se ve)', value: 'evaluacion' }, { label: 'Publicada', value: 'publicada' }], 'borrador'),
          REL('coleccion', 'Colección', 'colecciones', 'nombre', { required: true }),
          REL('autores', 'Perfil del autor/a', 'autores', 'nombre', { search_fields: ['nombre', 'seudonimo'], display_fields: ['nombre', 'seudonimo'], multiple: true, hint: 'Elige uno o varios perfiles. Su nombre saldrá en la obra y en la ficha, enlazado a su perfil. Si no existe, créalo primero en «☺ Autores».' }),
          S('autor_texto', 'O nombre del autor/a como texto', { hint: 'Ej.: Cantadoras de Regidor (colectivo)' }),
          S('codigo', 'Código de ficha', { hint: 'Ej.: HLQQ-014. Si lo dejas vacío se asigna solo.', pattern: ['^$|^HLQQ-\\d{3,}$', 'Formato: HLQQ-001'] }),
          FECHA('fecha_publicacion', 'Fecha de publicación'),
          FECHA('fecha_escritura', 'Fecha de escritura (opcional)'),
          S('municipio', 'Municipio'), S('departamento', 'Departamento', { default: 'Cesar' }),
          S('procedencia', 'Procedencia', { hint: 'Taller, convocatoria o registro de campo' }),
          S('evaluacion', 'Evaluación', { default: 'doble ciego · 2 lectores' }),
          SEL('licencia', 'Licencia', LICENCIAS, 'CC BY-NC-ND 4.0'),
          SEL('forma', 'Forma del texto', [{ label: 'Verso (respeta líneas y sangrías)', value: 'verso' }, { label: 'Prosa (párrafos con formato)', value: 'prosa' }], 'verso'),
          TX('verso', 'Texto en verso', { hint: 'Pega el poema tal cual: se respetan espacios, sangrías y líneas en blanco. Tachar: ~~palabra~~' }),
          MD('prosa', 'Texto en prosa'),
          TX('extracto', 'Extracto para la ficha (opcional)', { hint: 'Si lo dejas vacío, se toman las primeras líneas.' }),
          IMG('portada', 'Imagen de portada (opcional)'), S('portada_pie', 'Pie de la imagen'),
          L('galeria', 'Galería de imágenes', [IMG('imagen', 'Imagen'), S('pie', 'Pie')], { summary: '{{fields.pie}}' }),
          FILE('audio', 'Lectura en voz (audio)'), S('audio_url', 'O enlace de audio externo'),
          MD('transcripcion', 'Transcripción del audio'),
          S('video', 'Video (YouTube, Vimeo, TikTok…)'),
          FILE('pdf', 'PDF de la obra'),
          L('notas', 'Notas al margen del editor', [SEL('tipo', 'Tipo', ['Nota del editor', 'Contexto', 'Leído en', 'Versión', 'Otro'], 'Nota del editor'), TX('texto', 'Nota')], { summary: '{{fields.tipo}}: {{fields.texto}}' }),
          L('etiquetas', 'Etiquetas', [S('etiqueta', 'Etiqueta')], { summary: '{{fields.etiqueta}}' }),
          B('destacada', 'Destacada (sale primero y con sello)', false),
          B('ejemplo', 'Es una obra de ejemplo', false),
          BLOQUES('bloques', 'Bloques adicionales debajo de la obra'),
          S('descripcion_seo', 'Descripción para Google y redes (opcional)'),
        ],
      },
      {
        name: 'colecciones', label: '◉ Colecciones', label_singular: 'colección', folder: 'content/colecciones', extension: 'json', format: 'json', create: true,
        identifier_field: 'nombre', slug: '{{slug}}', summary: '{{nombre}} · {{lema}}', sortable_fields: ['orden', 'nombre'],
        description: 'Las orillas del archivo. Cada una tiene su color de lápiz.',
        fields: [
          S('nombre', 'Nombre', { required: true }), S('lema', 'Lema corto'), MD('descripcion', 'Descripción'),
          SEL('color', 'Color de lápiz', COLORES, 'rojo'),
          { name: 'color_libre', label: 'O un color personalizado', widget: 'color', required: false, allowInput: true },
          SEL('icono', 'Icono', ['poesia', 'narrativa', 'cronica', 'oralitura', 'taller', 'hibrida', 'ensayo', 'audio', 'video', 'archivo'], 'poesia'),
          N('orden', 'Orden en el menú de colecciones', 1),
          IMG('imagen', 'Imagen (opcional)'),
          BLOQUES('bloques', 'Bloques adicionales en la página de la colección'),
        ],
      },
      {
        name: 'autores', label: '☺ Autores', label_singular: 'autor/a', description: 'Perfiles de quienes escriben. Cada perfil muestra solo sus obras: basta con elegir el perfil dentro de cada obra.', folder: 'content/autores', extension: 'json', format: 'json', create: true,
        identifier_field: 'nombre', slug: '{{slug}}', summary: '{{nombre}} · {{seudonimo}} · {{municipio}}', sortable_fields: ['nombre', 'seudonimo'],
        fields: [
          S('nombre', 'Nombre (o seudónimo)', { required: true, hint: 'Nombre y apellido. Si la persona firma solo con seudónimo y no quiere que aparezca su nombre, escribe aquí el seudónimo y deja vacío el campo de abajo.' }),
          S('seudonimo', 'Seudónimo (opcional)', { hint: 'Solo si la persona tiene nombre Y seudónimo: en las obras y fichas sale el seudónimo, y en el perfil el nombre completo con el seudónimo debajo.' }),
          IMG('foto', 'Foto (opcional)'),
          S('municipio', 'Municipio'), S('perfil', 'Perfil corto', { hint: 'Ej.: Estudiante de VI semestre · Docente · Cantadora' }),
          MD('bio', 'Biografía'),
          L('redes', 'Redes o enlaces', [S('nombre', 'Nombre (Instagram, blog…)'), S('url', 'Enlace')], { summary: '{{fields.nombre}}' }),
          SEL('color', 'Color de su perfil', COLORES, 'indigo'),
          S('correo_publico', 'Correo público (opcional)'),
          { name: 'equipo', label: 'Es del equipo editorial (opcional)', widget: 'relation', collection: 'ajustes', file: 'equipo', value_field: 'miembros.*.nombre', search_fields: ['miembros.*.nombre'], display_fields: ['miembros.*.nombre'], required: false, hint: 'Si quien escribe es parte del equipo de la gaceta, elígelo aquí: su página de autor y su ficha en «Equipo editorial» quedan enlazadas, y su cuenta de lector se liga sola a las dos.' },
          BLOQUES('bloques', 'Bloques adicionales en su perfil (galería, video, entrevista…)'),
        ],
      },
      {
        name: 'paginas', label: '▤ Páginas', label_singular: 'página', folder: 'content/paginas', extension: 'json', format: 'json', create: true,
        identifier_field: 'titulo', slug: '{{slug}}', summary: '{{titulo}} → /{{slug}}/',
        description: 'Crea páginas nuevas con bloques: textos, fotos, galerías, videos, audios, botones, tarjetas, fichas y mucho más.',
        fields: [
          S('titulo', 'Título de la página', { required: true }),
          S('url', 'Dirección (opcional)', { hint: 'Ej.: talleres → quedará en /talleres/. Si la dejas vacía se usa el nombre del archivo.' }),
          S('sobretitulo', 'Sobretítulo'), S('tachado', 'Palabra tachada en el título (opcional)'), S('escrito', 'Palabra a mano en el título (opcional)'),
          TX('bajada', 'Bajada'),
          B('cabeza', 'Mostrar encabezado de página', true),
          SEL('franja', 'Franja de color arriba (opcional)', COLORES),
          BLOQUES(),
          B('en_menu', 'Mostrar en el menú principal', false),
          N('orden_menu', 'Posición en el menú', 10),
          S('descripcion_seo', 'Descripción para Google y redes'), IMG('imagen_seo', 'Imagen al compartir en redes'),
        ],
      },
      {
        name: 'bitacora', label: '✐ Bitácora', label_singular: 'entrada', folder: 'content/bitacora', extension: 'json', format: 'json', create: true,
        identifier_field: 'titulo', slug: '{{year}}-{{month}}-{{slug}}', summary: '{{fecha}} · {{titulo}}', sortable_fields: ['fecha', 'titulo'],
        description: 'Noticias, crónicas del equipo, resultados de convocatorias, fotos de eventos.',
        fields: [
          S('titulo', 'Título', { required: true }), FECHA('fecha', 'Fecha'), S('autor', 'Escrito por'),
          B('publicada', 'Publicada', true),
          IMG('portada', 'Imagen de portada'), TX('resumen', 'Resumen'), MD('cuerpo', 'Texto'),
          BLOQUES('bloques', 'Bloques adicionales'),
          L('etiquetas', 'Etiquetas', [S('etiqueta', 'Etiqueta')], { summary: '{{fields.etiqueta}}' }),
        ],
      },
      {
        name: 'agenda', label: '◷ Agenda', label_singular: 'evento', folder: 'content/agenda', extension: 'json', format: 'json', create: true,
        identifier_field: 'titulo', slug: '{{slug}}', summary: '{{inicio}} · {{titulo}}', sortable_fields: ['inicio', 'titulo'],
        description: 'Convocatorias, talleres, lecturas, ferias. Cuando la fecha pasa, el evento se mueve solo a «pasados».',
        fields: [
          S('titulo', 'Título', { required: true }),
          SEL('tipo', 'Tipo', [{ label: 'Convocatoria', value: 'convocatoria' }, { label: 'Taller', value: 'taller' }, { label: 'Lectura pública', value: 'lectura' }, { label: 'Lanzamiento', value: 'lanzamiento' }, { label: 'Feria', value: 'feria' }, { label: 'Otro', value: 'otro' }], 'lectura'),
          FECHAHORA('inicio', 'Fecha y hora de inicio', { required: true }),
          FECHAHORA('fin', 'Fecha y hora de cierre (opcional)', { hint: 'Para convocatorias: fecha límite de recepción.' }),
          S('lugar', 'Lugar'), IMG('imagen', 'Imagen o afiche'),
          TX('resumen', 'Resumen corto'), MD('descripcion', 'Descripción completa'),
          S('enlace', 'Enlace de inscripción o más información'), S('texto_enlace', 'Texto del botón', { default: 'Inscríbete' }),
          B('destacado', 'Destacar en la agenda', false),
          B('ejemplo', 'Es un evento de ejemplo', false),
          BLOQUES('bloques', 'Bloques adicionales'),
        ],
      },
      {
        name: 'ajustes', label: '⚙ Ajustes', label_singular: 'ajuste', editor: { preview: false },
        files: [
          {
            name: 'inicio', label: 'Página de inicio', file: 'content/ajustes/inicio.json', format: 'json',
            description: 'El inicio se arma con bloques: reordena, agrega o quita secciones.',
            fields: [BLOQUES('bloques', 'Secciones del inicio')],
          },
          {
            name: 'sitio', label: 'Datos generales, redes y pie', file: 'content/ajustes/sitio.json', format: 'json',
            fields: [
              S('nombre', 'Nombre de la gaceta'), S('descripcion', 'Descripción corta (Google y redes)'),
              S('institucion', 'Programa e institución'), S('url', 'Dirección del sitio', { hint: 'Ej.: https://hicimosloquequisimos.github.io' }),
              IMG('imagen_compartir', 'Imagen al compartir en redes (1200×630)'),
              S('correo', 'Correo de la gaceta'),
              S('asunto_envio', 'Asunto del correo de envío', { default: 'ENVÍO | GÉNERO | TÍTULO' }),
              TX('cuerpo_envio', 'Plantilla del correo de envío'),
              L('redes', 'Redes sociales', [SEL('red', 'Red', ['instagram', 'x', 'tiktok', 'facebook', 'youtube', 'whatsapp', 'spotify', 'web']), S('url', 'Enlace'), S('usuario', 'Usuario (@…)')], { summary: '{{fields.red}} {{fields.usuario}}' }),
              O('aviso', 'Aviso en la parte superior', [B('activo', 'Mostrar aviso', false), S('texto', 'Texto'), S('enlace', 'Enlace'), S('texto_enlace', 'Texto del enlace'), SEL('color', 'Color', ['indigo', 'canaguate', 'rojo', 'buchon'], 'canaguate')]),
              S('frase_pie', 'Frase del pie', { default: 'Lo que el río se lleva, la voz lo devuelve.' }),
              TX('texto_pie', 'Texto del pie'),
              L('frases_pie', 'Frases cortas del pie', [S('frase', 'Frase')], { summary: '{{fields.frase}}' }),
              S('licencia', 'Licencia general', { default: 'Las obras se publican bajo licencia Creative Commons BY-NC-ND 4.0, salvo que la ficha indique otra.' }),
              O('marca', 'Colores y comportamiento', [
                { name: 'indigo', label: 'Índigo', widget: 'color', required: false, default: '#1E2747' },
                { name: 'papel', label: 'Papel', widget: 'color', required: false, default: '#F1E9D8' },
                { name: 'rojo', label: 'Lápiz rojo', widget: 'color', required: false, default: '#D7372B' },
                { name: 'canaguate', label: 'Cañaguate', widget: 'color', required: false, default: '#F2B33D' },
                B('animar_logo', 'Animar el logotipo en la primera visita', true),
                B('modo_oscuro', 'Ofrecer botón de modo oscuro', true),
              ], { collapsed: true }),
              CODE('codigo_cabecera', 'Código extra en la cabecera (analítica, verificación…)'),
            ],
          },
          {
            name: 'menu', label: 'Menú principal', file: 'content/ajustes/menu.json', format: 'json',
            fields: [
              L('enlaces', 'Enlaces del menú', [S('texto', 'Texto'), S('enlace', 'Enlace', { hint: 'Ej.: /archivo/ · /equipo-editorial/ · /talleres/ · https://…' })], { summary: '{{fields.texto}} → {{fields.enlace}}' }),
              B('incluir_paginas', 'Agregar también las páginas marcadas «en el menú»', true),
              S('boton_texto', 'Texto del botón rojo', { default: 'Envía tu creación' }),
              S('boton_enlace', 'Enlace del botón rojo', { hint: 'Vacío = abre el correo con la plantilla de envío' }),
            ],
          },
          {
            name: 'equipo', label: 'Equipo editorial', file: 'content/ajustes/equipo.json', format: 'json',
            fields: [
              S('titulo', 'Título de la página'), TX('intro', 'Introducción'),
              L('miembros', 'Integrantes', [S('nombre', 'Nombre'), S('rol', 'Rol'), IMG('foto', 'Foto (opcional)'), TX('bio', 'Bio corta (opcional)'), S('enlace', 'Enlace (opcional)')], { summary: '{{fields.nombre}} · {{fields.rol}}' }),
              BLOQUES('bloques', 'Bloques en la página del equipo'),
            ],
          },
          {
            name: 'secciones', label: 'Encabezados de Autores, Agenda y Bitácora', file: 'content/ajustes/secciones.json', format: 'json',
            description: 'El título, la palabra a mano y el texto de abajo de esas páginas, y bloques extra para cada una.',
            fields: [
              O('autores', 'Página de Autores', [S('sobretitulo', 'Sobretítulo'), S('titulo', 'Título (parte impresa)'), S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra escrita a mano (opcional)'), TX('bajada', 'Texto de abajo (bajada)'), BLOQUES('bloques', 'Bloques debajo')], { collapsed: true }),
              O('agenda', 'Página de Agenda', [S('sobretitulo', 'Sobretítulo'), S('titulo', 'Título (parte impresa)'), S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra escrita a mano (opcional)'), TX('bajada', 'Texto de abajo (bajada)'), BLOQUES('bloques', 'Bloques debajo')], { collapsed: true }),
              O('bitacora', 'Página de Bitácora', [S('sobretitulo', 'Sobretítulo'), S('titulo', 'Título (parte impresa)'), S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra escrita a mano (opcional)'), TX('bajada', 'Texto de abajo (bajada)'), BLOQUES('bloques', 'Bloques debajo')], { collapsed: true }),
            ],
          },
          {
            name: 'archivo', label: 'Página del archivo', file: 'content/ajustes/archivo.json', format: 'json',
            fields: [
              S('sobretitulo', 'Sobretítulo'), S('titulo', 'Título'), S('tachado', 'Palabra tachada (opcional)'), S('escrito', 'Palabra a mano'), TX('bajada', 'Texto de abajo (bajada)'),
              S('placeholder', 'Texto de ejemplo en el buscador'),
              SEL('orden', 'Orden inicial de las fichas', [{ label: 'Más recientes', value: 'recientes' }, { label: 'Más antiguas', value: 'antiguas' }, { label: 'Por código (HLQQ-001, 002…)', value: 'codigo' }, { label: 'Por código, del último al primero', value: 'codigo_desc' }, { label: 'De la A a la Z', value: 'alfabetico' }], 'recientes'),
              BLOQUES('bloques', 'Bloques debajo del archivo'),
            ],
          },
        ],
      },
    ],
  };
}

module.exports = { config, TIPOS_BLOQUE };
