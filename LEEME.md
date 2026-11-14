# Hicimos lo que quisimos · Manual del sitio

Gaceta literaria de la Licenciatura en Literatura y Lengua Castellana (UPC Aguachica).
Este proyecto es **de ustedes**: el código, el contenido y las imágenes viven en su cuenta de GitHub, y el sitio se publica gratis en GitHub Pages.

---

## 1. Cómo funciona (en una frase)

Alguien del equipo entra al **panel** (`/admin`), escribe o cambia algo y le da **Guardar**. GitHub guarda el cambio, vuelve a armar el sitio solo y en **1 o 2 minutos** ya está publicado.

---

## 2. Publicar el sitio por primera vez (una sola vez)

1. **Crea una cuenta gratis** en [github.com](https://github.com) (si no tienes).
2. **Crea un repositorio nuevo**: botón verde *New*.
   - Nombre recomendado: `hicimosloquequisimos.github.io` si la cuenta se llama `hicimosloquequisimos`. Así la dirección queda limpia: `https://hicimosloquequisimos.github.io`.
   - Si usas otro nombre (por ejemplo `gaceta`), la dirección será `https://TU-USUARIO.github.io/gaceta/`. También funciona.
   - Márcalo como **Public**.
3. **Sube los archivos**: en el repositorio vacío, *uploading an existing file* → arrastra **todo el contenido** de la carpeta del proyecto (no la carpeta `_site`).
   - ⚠ La carpeta `.github` está oculta en algunos computadores. Si no se subió, créala a mano: *Add file → Create new file*, escribe como nombre `.github/workflows/publicar.yml` y pega el contenido de ese archivo.
4. **Activa GitHub Pages**: *Settings → Pages → Build and deployment → Source:* **GitHub Actions**.
5. Ve a la pestaña **Actions**: verás «Publicar la gaceta» trabajando. Cuando salga el ✓ verde, el sitio está en línea.
6. En el panel, ve a **⚙ Ajustes → Datos generales** y pon la dirección del sitio en «Dirección del sitio» (sirve para que los enlaces al compartir en redes salgan con imagen y título).

---

## 3. Entrar al panel

1. Abre `https://TU-SITIO/admin/`.
2. Elige **Sign in with Token** (Iniciar sesión con token).
3. El panel te explica cómo crear el token en GitHub. En resumen: GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token* → elige solo este repositorio → en *Permissions* pon **Contents: Read and write** → *Generate*. Copia el token y pégalo en el panel.
4. El navegador lo recuerda. Cada integrante del equipo que vaya a editar necesita su propia cuenta de GitHub, invitada al repositorio (*Settings → Collaborators → Add people*), y su propio token.

> No compartan el token por chat ni lo publiquen: es como una contraseña.

---

## 4. Qué se puede hacer desde el panel

| Sección | Para qué sirve |
|---|---|
| **✎ Obras** | Crear y editar obras. Estados: *Borrador* y *En evaluación* (no se ven) y *Publicada* (sale sola en el inicio, el archivo, su colección y el perfil del autor). Verso que respeta sangrías, prosa con formato, foto, galería, audio con transcripción, video, PDF, notas al margen, etiquetas, obra destacada, código HLQQ automático. |
| **◉ Colecciones** | Crear colecciones nuevas con su color de lápiz e icono. Hoy: Poesía, Cuento, Formas híbridas, Ensayo y Crónica. |
| **☺ Autores** | Perfiles con foto, municipio, biografía y redes. Dentro de cada obra eliges el perfil, y su nombre sale enlazado en la ficha y en un recuadro debajo de la obra. |
| **▤ Páginas** | **Crear páginas nuevas** con el constructor de bloques. Pueden ir al menú. |
| **✐ Bitácora** | Noticias, crónicas del equipo, fotos de eventos. |
| **◷ Agenda** | Convocatorias, talleres, lecturas y ferias. Cuando la fecha pasa, el evento se va solo a «Ya pasó». |
| **⚙ Ajustes** | Inicio (armado con bloques), menú, equipo editorial, página del archivo, redes, correo y plantilla de envío, aviso superior, pie, colores y código extra (analítica). |

### Los bloques del constructor

Portada con enmienda · Título enmendado · Texto · Poema/verso · Cita destacada · Imagen · Galería · Video (YouTube, Vimeo, TikTok, Facebook, Drive o archivo) · Audio (archivo, Spotify, SoundCloud) · Botones · Tarjetas · Columnas · Fichas de obras (filtradas por colección, autor, etiqueta o destacadas) · Colecciones · Cifras · Agenda · Bitácora · Equipo · Autores · Frases enmendadas · «Enmienda tu frase» · Pasos/ruta editorial · Envío con requisitos · Preguntas frecuentes · Línea del tiempo · Llamado a la acción · Descarga · Visor de PDF · Mapa · Redes · Separador · Código HTML libre.

Cada bloque tiene **Apariencia**: fondo (papel, índigo, cañaguate, buchón, lodo), espacio, ancho, alineación, ancla para enlazar directo (`/pagina/#ancla`) y la opción de **ocultarlo sin borrarlo**.

### La gramática de la enmienda (en cualquier texto)

| Escribes | Se ve |
|---|---|
| `~~debes~~` | ~~debes~~ tachado con lápiz rojo |
| `^^quieras^^` | ‸ *quieras* escrito a mano en rojo |
| `~~debes~~^^quieras^^` | las dos cosas juntas |
| `**negrita**`, `*cursiva*`, `[texto](enlace)` | lo de siempre |

Regla del manual de identidad: **una enmienda principal por pieza**.

---

## 5. Imágenes

- Se publican **en su calidad original** (no se recortan ni se comprimen). Un clic las abre en grande.
- Recomendado: fotos de 1600 a 2400 px de ancho, en JPG; logos y dibujos en PNG o SVG.
- Imagen para compartir en redes: 1200 × 630 px.

---

## 6. Para quien quiera tocar el código

Todo es HTML, CSS y JavaScript sin herramientas raras. Para probar en tu computador necesitas [Node.js](https://nodejs.org) 18 o superior:

```
node build.js          # genera el sitio en la carpeta _site/
```

| Archivo | Qué es |
|---|---|
| `content/` | Todo el contenido (lo que edita el panel), en archivos JSON. |
| `media/subidas/` | Imágenes, audios y PDF subidos desde el panel. |
| `assets/css/gaceta.css` | Estilos: colores, tipografías y diseño. Los colores del manual están arriba, en `:root`. |
| `assets/js/gaceta.js` | Interacciones: enmienda tu frase, buscador, visor de imágenes, modo oscuro. |
| `build.js` | Arma todas las páginas a partir del contenido. |
| `lib/bloques.js` | Cómo se dibuja cada bloque. Para crear un bloque nuevo, agrégalo aquí y en `lib/panel.js`. |
| `lib/panel.js` | Todo lo que aparece en el panel (campos, colecciones, bloques). |
| `lib/graficos.js` | Atarraya, sello, favicon e iconos de trazo de lápiz, dibujados en SVG. |
| `.github/workflows/publicar.yml` | La publicación automática (en cada cambio y cada madrugada). |

Extras que se generan solos: `feed.xml` (para suscribirse), `sitemap.xml` (para Google), `obras.json` (datos abiertos del archivo) y una página 404 con enmienda.

### Dominio propio

Si algún día tienen `hicimosloquequisimos.unicesar.edu.co` u otro dominio: *Settings → Pages → Custom domain*, y la persona de sistemas de la universidad crea un registro CNAME hacia `TU-USUARIO.github.io`.

---

*Tipografías: Instrument Serif, Newsreader, IBM Plex Mono y Caveat (Google Fonts, licencia libre). Panel: Sveltia CMS (gratuito, código abierto).*
