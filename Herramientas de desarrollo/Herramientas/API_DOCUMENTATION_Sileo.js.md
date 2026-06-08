# 🌌 Sileo.js API Documentation

Sileo.js es una librería de notificaciones (toasts) elegante y animada con soporte para estados, promesas y acciones personalizadas.

## 🚀 Uso en Entorno Global

Cuando incluyes el bundle de Sileo.js en tu proyecto (por ejemplo, mediante una etiqueta `<script>`), el objeto `sileo` queda disponible globalmente en la ventana (`window.sileo`).

### Inicialización Básica
Asegúrate de tener un contenedor para el `Toaster` o deja que la librería lo maneje automáticamente al cargar el DOM.

```html
<script src="scripts\sileo-bundle.umd.js"></script>
```

## 🛠️ Métodos de la API

Todos los métodos de disparo devuelven un `id` (string), que puede usarse para cerrar la notificación manualmente.

### 1. Notificaciones de Estado
Atajos para los estados más comunes.

| Método | Descripción |
| :--- | :--- |
| `sileo.show(options)` | Muestra una notificación genérica. |
| `sileo.success(options)` | Notificación de éxito (verde por defecto). |
| `sileo.error(options)` | Notificación de error (rojo por defecto). |
| `sileo.warning(options)` | Notificación de advertencia (naranja por defecto). |
| `sileo.info(options)` | Notificación de información (azul por defecto). |
| `sileo.action(options)` | Notificación optimizada para incluir un botón de acción. |

**Ejemplo:**
```javascript
sileo.success({
  title: '¡Guardado!',
  description: 'Los cambios se han aplicado correctamente.'
});
```

### 2. Manejo de Promesas (`sileo.promise`)
Ideal para operaciones asíncronas (como llamadas a una API).

```javascript
const miPromesa = fetch('https://api.ejemplo.com/datos');

sileo.promise(miPromesa, {
  loading: { title: 'Cargando...', description: 'Obteniendo datos del servidor.' },
  success: (data) => ({ title: 'Éxito', description: 'Datos recibidos.' }),
  error: (err) => ({ title: 'Error', description: 'No se pudo conectar.' }),
  position: 'top-right'
});
```

### 3. Control de Notificaciones
| Método | Descripción |
| :--- | :--- |
| `sileo.dismiss(id)` | Cierra una notificación específica por su ID. |
| `sileo.clear(position?)` | Cierra todas las notificaciones. Si se pasa `position`, solo cierra las de esa área. |

---

## ⚙️ Opciones de Configuración (`SileoOptions`)

Estas opciones se pueden pasar a cualquier método de notificación:

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `title` | `string` | Título principal de la notificación. |
| `description` | `string \| ReactNode` | Texto secundario o contenido detallado. |
| `duration` | `number \| null` | Tiempo en ms antes de cerrarse (Default: `6000`). `null` para manual. |
| `position` | `SileoPosition` | Ubicación (ver sección Posiciones). |
| `fill` | `string` | Color de fondo del "pill" y cuerpo (Hex/RGB). |
| `roundness` | `number` | Radio de los bordes (Default: `18`). |
| `icon` | `ReactNode` | Icono personalizado que reemplaza al de estado. |
| `button` | `object` | `{ title: string, onClick: function }` para añadir un botón de acción. |
| `autopilot` | `boolean \| object` | Controla la expansión/colapso automático. `{ expand: ms, collapse: ms }`. |

---

## 📍 Posiciones Disponibles

Puedes configurar la posición global en el componente `Toaster` o por notificación individual:

- `top-left`
- `top-center`
- `top-right` (Predeterminado)
- `bottom-left`
- `bottom-center`
- `bottom-right`

---

## 🎨 Estilos Personalizados

Sileo permite pasar clases CSS personalizadas a través de la propiedad `styles`:

```javascript
sileo.show({
  title: 'Custom Style',
  styles: {
    badge: 'mi-clase-icono',
    title: 'mi-clase-titulo',
    description: 'mi-clase-desc',
    button: 'mi-clase-boton'
  }
});
```

## 🛡️ Notas de Seguridad
La librería incluye un parche interno para evitar errores en navegadores cuando se calculan dimensiones negativas en elementos SVG (`rect` y `svg`), asegurando que los valores de `width`, `height`, `rx` y `ry` nunca sean menores a 0.

---
*Documentación generada para Sileo.js v1.0.0*