### 💎 El Núcleo de Lumo: ¿Por qué usamos la Arquitectura de Hashtag (`#`)?

El uso del formato de hashtag no es una decisión meramente visual o de diseño para redes sociales; es la pieza maestra de ingeniería que hace viable todo nuestro ecosistema tecnológico. En el desarrollo web tradicional, cambiar de página exige pedirle datos nuevos al servidor. Nuestra arquitectura rompe esa regla bajo los siguientes propósitos:

- **Propósito 1: Mantener al usuario atrapado en una única SPA fluida.** Al usar el hashtag, le avisamos al navegador que el usuario no está cambiando de sitio web, sino moviéndose dentro de la misma página. Esto permite que toda la tienda virtual, el carrito de compras, el registro de usuarios y el panel de comisiones convivan en la misma aplicación. El usuario navega con transiciones instantáneas, animaciones fluidas y sin los molestos "pantallazos en blanco" que ocurren al cargar páginas web antiguas.
 
- **Propósito 2: Blindar los servidores contra cargas innecesarias.** Cuando un usuario navega entre productos usando rutas tradicionales, el servidor tiene que procesar código, construirlo y consumir memoria una y otra vez. Con la arquitectura de hashtag, todo el código de la aplicación se descarga **una sola vez** en el primer segundo. A partir de ahí, el usuario puede revisar 500 productos y la infraestructura de servidores no sufre ningún desgaste innecesario, ya que la aplicación se procesa por completo usando la potencia del teléfono o computadora del cliente.

- **Propósito 3: Operación masiva con Costo Fijo de $0 USD (o el mas bajo posible).** Dado que los servidores de Cloudflare Pages solo entregan archivos estáticos al inicio y no tienen que compilar código en tiempo real cada vez que un usuario hace clic en el catálogo, nuestro consumo de ancho de banda y procesamiento se reduce al mínimo absoluto. Esto nos permite soportar millones de visitas simultáneas de distribuidores y clientes manteniendo un costo operativo realmente bajo.

---
## 💻 FRONTEND: El motor de la SPA

Esta capa se encarga de la experiencia de usuario (UX) interactiva, la velocidad en el navegador y la conexión directa con los datos.

**Biblioteca Principal:** `React`
- _Interfaz de usuario declarativa basada en componentes._

**Compilador / Bundler:** `Vite`
- _Velocidad de desarrollo instantánea y compilación optimizada._

**Enrutador (Crucial):** `React Router v6`
- _Configurado estrictamente en formato de "Hashtag" (`createHashRouter`). Está diseñado para procesar de forma ultra estética rutas modernas como `lumo.com/#catalogo/producto-123`, asimilando el comportamiento visual de las redes sociales actuales. (Hashtags)_

**Estilos y UI:** `Tailwind CSS`
- _Diseño ultra rápido a base de clases utilitarias. Mantiene el peso del archivo CSS al mínimo absoluto (ideal para que la SPA cargue en microsegundos)._

**Cliente de Base de Datos:** `@supabase/supabase-js`
- _La librería oficial para conectar tu React directamente con tu base de datos y manejar el login y el RLS en tiempo real._

### 🛠️ Extensión de Enrutamiento: Interceptor del Portapapeles (_Clipboard Isomorfismo_)

**Qué hace:** 
 - Es un vigilante invisible dentro de la aplicación. Cuando un usuario copia la URL de un producto directamente desde la barra de direcciones de su navegador (la cual contiene el hashtag, por ejemplo: `lumo.com/#catalogo/producto-123`), el sistema la intercepta al vuelo en una fracción de milisegundo y limpia el enlace antes de guardarlo en el portapapeles.

**Transformación Visual:**
 - Lo que ve el usuario en el navegador: `lumo.com/#catalogo/producto-123`
 - Lo que realmente se guarda en su portapapeles al copiar: `lumo.com/catalogo/producto-123`
  
**Propósito:** 
 - **Garantizar la viralidad orgánica y la estética en redes sociales.** Asegura que cualquier enlace que tus distribuidores compartan de manera natural (copiando y pegando en chats) sea siempre la URL estática limpia y pulida los Shadows HTMLs. De este modo, cuando el enlace caiga en WhatsApp, Facebook o Telegram, los servidores de estas apps podrán leer las etiquetas visuales e indexadas, generando tarjetas con foto, título y precio real que maximizan los clics de compra. Ademas distribuye la carga y evita tener que servir el index.html de la pagina principal de manera innecesaria.

## 🔍 SEO & PRE-RENDER: Generación Estática Isomórfica (SSG) (`prerender.js`)

Estrategia híbrida para engañar positivamente a los motores de búsqueda y maximizar la conversión sin perder las ventajas de una SPA.

### 1. Estructura de URLs Físicas (Clean URLs)

**Qué hace:** 
 - El script automatizado (`prerender.js`) creará una estructura física organizada por carpetas para cada producto dentro del despliegue final (ej: `dist/catalogo/producto-123/index.html`).
  
**Propósito:** 
 - **Transmitir confianza y facilitar la lectura.** Una URL limpia como `lumo.com/catalogo/producto-123` se ve mucho más profesional y segura para un cliente que una URL con extensiones técnicas o parámetros complejos (`?id=123`). Además, los motores de búsqueda como Google premian y dan mayor prioridad a las estructuras jerárquicas claras.

### 2. Inyección Semántica Automatizada (`prerender.js`)

**Qué hace:**
 - Un script personalizado en Node.js se ejecuta justo después de compilar la aplicación. Este consulta la base de datos de Supabase (El catalogo) y escribe de forma anticipada un documento HTML fijo e independiente para cada producto (Shadows HTML).

**Propósito:**
 - **Crear el "señuelo perfecto" para los buscadores.** Googlebot y otros rastreadores web son perezosos ejecutando aplicaciones pesadas de JavaScript. Al entregarles un documento HTML pre-masticado con los textos, títulos y detalles del catálogo ya impresos, garantizas que indexen tu contenido al 100% de forma instantánea sin consumir recursos ni saturar tus servidores (Utiliza el CDN de Cloudflare pages).

### 3. Inyección de Etiquetas Open Graph (`og:`) y Datos Estructurados (`JSON-LD`)

**Qué hace:**
 - Dentro de la cabecera oculta de cada HTML generado, el script inyecta la información específica del producto en formatos especiales que las máquinas entienden (imágenes, títulos comerciales y divisas).

**Propósito:**
 - **Dominar la primera impresión digital y maximizar clics.** Las etiquetas `og:` aseguran que cuando un distribuidor envíe un link por mensaje de texto, se genere automáticamente la previsualización visual con la foto atractiva del producto. El formato `JSON-LD` se encarga de "hackear" los resultados de Google, haciendo que tu enlace muestre calificaciones, precio y disponibilidad directamente en la pantalla de búsqueda habitual (_Rich Snippets_), aplastando visualmente a los competidores tradicionales.

### 4. El Script de Redirección Inmediata (`window.location.replace`)

**Qué hace:**
 - Inserta una instrucción de salto inmediato en la parte superior del HTML estático. Cuando un humano real entra a la página limpia, el navegador procesa esta orden antes de pintar cualquier texto en pantalla.

**Transformación de Ruta:**
 - Redirige la URL de inmediato al formato estético de redes sociales: de `/catalogo/producto-123` hacia `/#catalogo/producto-123`.

**Propósito:**
 - **El puente invisible hacia la experiencia Premium.** Su función es expulsar al usuario humano del HTML plano e inmóvil en el primer milisegundo y transportarlo de inmediato al motor interactivo de la SPA de React (`/catalogo/...` → `/#catalogo/...`). Logra que el usuario disfrute de la velocidad extrema, menús rápidos y animaciones del SPA, sin jamás darse cuenta de que inicialmente entró por una "puerta trasera" de carpetas construida para los rastreadores.

### 5. Control de Rastreo Dinámico (`sitemap.xml` y `robots.txt`)

**Qué hace:**
 - Generación automática de un mapa en formato XML que apunta exclusivamente a las rutas limpias físicas y un archivo de texto con reglas estrictas que le dicen a los bots a dónde ir y dónde no.

**Propósito de Negocio:**
 - **Optimizar el tiempo de indexación y proteger la privacidad de la red.** * **El `sitemap.xml` es la guía turística:** Le entrega a Google la lista directa de las URLs limpias (ej: `lumo.com/catalogo/producto-123`). De esta manera, el buscador no tiene que adivinar ni buscar los productos uno por uno; va directo a indexar el contenido semántico listo para vender.

**El `robots.txt` es el guardia de seguridad:**
 - Su misión es evitar que Google pierda su valioso tiempo (Crawl Budget) intentando indexar las partes interactivas o privadas de la aplicación. Le da permiso abierto para revisar las carpetas físicas (`/catalogo/`), pero bloquea el acceso a las rutas que usan el hashtag para funciones privadas, como el panel de distribuidores (`#dashboard`), el carrito de compras o las pasarelas de pago. Al estructurar tus URLs con hashtags comerciales, el guardia sabe exactamente qué es público (lo que da dinero) y qué es privado (la lógica interna de la app).

## ⚙️ BACKEND & INFRAESTRUCTURA: Capa Serverless

La arquitectura en la nube que soporta el proyecto con escalabilidad media alta y costo mínimo.

| **Componente**                | **Tecnología**                                         | **Rol Estratégico**                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hosting Front y SEO**       | **Cloudflare Pages**                                   | Aloja el SPA de Vite y las miles de carpetas de productos físicos de forma 100% gratuita sobre una red CDN global de baja latencia.                                                                                                                                      |
| **Base de Datos y Seguridad** | **Supabase (PostgreSQL)**                              | Controla el inventario, los usuarios y los árboles de comisiones utilizando reglas de seguridad interna (_Row Level Security_), protegiendo los datos directamente en las tablas sin necesidad de programar servidores intermedios lentos.                               |
| **Capa de Cómputo Segura**    | **Supabase Edge Functions** _(y/o Cloudflare Workers)_ | Mini-servidores en la nube que permanecen "dormidos" y solo se encienden por segundos para proteger tus llaves secretas al procesar transacciones bancarias, conectarte con empresas de envíos (Logística), consultar la base de datos o procesos intermedios sencillos. |
| **Dominios**                  | **Dominios de Cloudflare**                             | Gestión de DNS de ultra baja latencia, mitigación de ataques DDoS de capa 7 y enrutamiento inteligente del tráfico hacia Cloudflare Pages de forma segura y optimizada.                                                                                                  |
