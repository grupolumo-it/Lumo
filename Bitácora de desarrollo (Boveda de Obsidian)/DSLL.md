# 📐 Especificación Oficial: DSL para Reporte de Estructuras HTML

Este lenguaje de dominio específico (DSL) unifica la comunicación entre Diseño, QA, Desarrollo e Inteligencia Artificial para la localización y edición quirúrgica de componentes en el DOM.

### 🏷️ El Concepto Clave: El Atributo `element-is`

A diferencia de los selectores tradicionales que dependen de clases dinámicas o utilitarias (como las de Tailwind CSS, que cambian constantemente durante el diseño), este DSL se apoya en el atributo personalizado **`element-is`**.

- **¿Qué es?** Es un identificador semántico e inmutable que se le asigna a los componentes clave en el código HTML (ej: `<div element-is="product-card">`).

- **¿Por qué se usa?** Garantiza que las rutas del DSL sean **blindadas y duraderas**. Aunque el diseño visual cambie por completo, la identidad del componente permanece intacta, permitiendo que la IA y los scripts localicen el elemento sin falsos positivos.


## 🧱 Estructura y Flexibilidad del DSL

Por defecto, la estructura ideal se compone de cinco bloques correlativos separados por espacios:

```
[EtiquetaPadre] [#IDPadre] [Operador de Relación] (Operador de Índice) [element-is o EtiquetaHijo]
```

🎯 **Resolución Formal del Quinto Bloque [element-is o EtiquetaHijo]**

1. Si el quinto bloque coincide con una etiqueta HTML válida, se interpreta como etiqueta HTML.

2. Si comienza con '$', se interpreta obligatoriamente como `element-is`.

3. Si no coincide con una etiqueta HTML conocida, se interpreta como `element-is`.

Ejemplo:
```
div #product-grid >> (1) $product-card
```

La traducción literal sería:

> Dentro del elemento `<div>` cuyo ID es `product-grid`, busca de forma profunda en todos sus descendientes y selecciona el primer elemento cuyo atributo `element-is` sea `product-card`.

O de forma más natural:

> Busca la primera tarjeta de producto dentro de la cuadrícula de productos, sin importar cuántos contenedores intermedios existan entre la cuadrícula y la tarjeta.

Sin embargo, el lenguaje es dinámico y se adapta de forma inteligente a la arquitectura del HTML mediante **tres excepciones estrictas**:

### Excepción 1: El contenedor ya tiene ID propio (Operación Macro)

Si el elemento objetivo al que se quiere apuntar es un contenedor principal que ya posee su propio `id`, la ruta se simplifica a solo **dos bloques**. No requiere operadores de relación ni de índice porque el ID ya lo hace único en toda la página.

- **Estructura:** `[Etiqueta] [#ID]`
- **Ejemplo:** `header #header-container` o `div #product-grid`

### Excepción 2: Elemento Huérfano de ID (Estructura Plana)

Si se inspecciona un elemento y, al escalar hacia arriba en el DOM, no se encuentra ningún ancestro con ID, el sistema recurre a un fallback seguro de tres bloques usando el cuerpo (`body`) como raíz implícita y fijando el índice inicial por defecto.

- **Estructura:**
```
[EtiquetaHijo] (1) [element-is o EtiquetaHijo]
```

El primer bloque siempre conserva la etiqueta HTML nativa del elemento inspeccionado. El tercer bloque sigue las mismas reglas generales del DSL:

- Si existe un atributo `element-is`, se utiliza dicho identificador.
- Si no existe, se utiliza nuevamente la etiqueta HTML nativa.

#### Ejemplos:

Elemento HTML estándar:
```
main (1) main
```

Elemento con atributo semántico element-is:
```
div (1) $product-card
```

Elemento generado por componentes:
```
button (1) $buy-button
```

### Excepción 3: Omisión de Atributo Personalizado

Si el elemento hijo objetivo no cuenta con un atributo `element-is`, el quinto bloque adoptará de forma automática la etiqueta nativa de HTML (`tagName` en minúsculas). La estructura se mantiene, pero cambia el identificador final.

- **Ejemplo:** `nav #category-nav-list > (4) div`

### 🔏 El Carácter de Escape `$` (Desambiguación Avanzada)

Por norma general, el motor del DSL detecta automáticamente si el quinto bloque es una etiqueta nativa o un componente semántico. Sin embargo, para entornos automatizados, compiladores que generen hashes dinámicos (ej: `a1b2`) o casos donde un componente se llame igual que una etiqueta HTML, se introduce el uso del símbolo **`$`**.

> 💡 **Regla de escape:** Colocar un `$` inmediatamente antes del quinto bloque fuerza al motor y a la IA a interpretar ese texto estrictamente como un atributo `element-is`, desactivando cualquier validación de etiquetas nativas.

#### Escenarios de Aplicación Real:

1. **Evitar falsos positivos en hashes dinámicos (Compiladores):**
    
    Si tu sistema genera un element-is alfanumérico aleatorio para una tarjeta:
    
    - _Sintaxis Regular (Ambigua):_ `div #grid >> (1) x92f` _(La IA o sistema podría confundirse y buscar la etiqueta inexistente `<x92f>`)_.
    
    - _Sintaxis con Escape (Segura):_ `div #grid >> (1) $x92f` _(Fuerza la búsqueda exacta de `[element-is="x92f"]`)_.
    
1. **Colisión de nombres (Homónimos):**
    
    Si creas un componente personalizado para reproducir audio y su identidad semántica es exactamente `audio` (igual que la etiqueta nativa `<audio>`):
    
    - _Buscar el tag nativo:_ `div #player >> (1) audio` $\rightarrow$ Targetea `<audio>`.
    
    - _Buscar tu componente:_ `div #player >> (1) $audio` $\rightarrow$ Targetea `[element-is="audio"]`.
    

## 🛠️ 1. Operadores de Relación (Ámbito de Búsqueda)

Determinan qué tan profundo debe buscar dentro del contenedor padre.

- **`>` (Hijo Directo):** Restringe la búsqueda **únicamente** al primer nivel de elementos hijos. Ignora cualquier elemento que esté metido dentro de sub-contenedores o wrappers intermedios.

- **`>>` (Descendencia Profunda):** Activa una búsqueda global dentro de todo el árbol interno del padre (mediante un `querySelectorAll` o `TreeWalker`). Ideal para layouts complejos o cuando hay divs intermedios de frameworks utilitarios (como Tailwind).


## 🔢 2. Operadores de Índice (Cantidad, Rangos y Combinaciones)

Determinan la posición exacta o el grupo de elementos que se van a capturar.

> 💡 **Regla de Oro (Anclaje CSS):** Al utilizar **paréntesis `()`** en lugar de corchetes, el DSL le indica a la IA en frío que debe operar bajo la **indexación basada en 1 (1-indexed)**, emulando de forma natural el comportamiento de las pseudo-clases de CSS como `:nth-of-type()`. El primer elemento físico detectado en el DOM siempre responderá al índice **`1`**.

El bloque `(Operador de Índice)` puede contener un solo criterio o una **lista de instrucciones combinadas separadas por punto y coma (`;`)**. El motor procesa la secuencia de izquierda a derecha sumando los elementos seleccionados y eliminando duplicados automáticamente.

### 🔢 Tabla de Micro-Operadores Disponibles (1-Indexed)

|**Operador**|**Significado**|**Ejemplo de Uso**|
|---|---|---|
|**`(X)`**|**Elemento exacto** en esa posición posicional humana.|`(3)` (El tercer elemento real en el DOM)|
|**`(FIRST)`**|**Alias de inicio:** Atajo directo para seleccionar el primer elemento.|`(FIRST)` (Equivale exactamente a `(1)`)|
|**`(LAST)`**|**Alias de cierre:** Atajo dinámico para capturar el último elemento del grupo.|`(LAST)` (El extremo final de la lista)|
|**`(ALL)`**|**Universal:** Selecciona absolutamente todos los elementos del ámbito.|`(ALL)` (Todos los elementos)|
|**`(ODD)`**|**Alternancia impar:** Selecciona elementos en posiciones impares del DOM.|`(ODD)` (Posiciones físicas 1, 3, 5, 7, etc.)|
|**`(EVEN)`**|**Alternancia par:** Selecciona elementos en posiciones pares del DOM.|`(EVEN)` (Posiciones físicas 2, 4, 6, 8, etc.)|
|**`(UPTO..X)`**|**Rango inicial:** Desde el primer elemento (`1`) hasta el índice $X$ inclusive.|`(UPTO..3)` (Elementos en posiciones 1, 2 y 3)|
|**`(X..END)`**|**Rango final:** Desde el índice $X$ hasta el último elemento que exista.|`(3..END)` (Desde el tercer elemento en adelante)|
|**`(X..Y)`**|**Rango cerrado:** Todos los elementos entre la posición $X$ y la posición $Y$ inclusive.|`(5..8)` (Elementos en posiciones 5, 6, 7 y 8)|

### 🛡️ Regla de Deduplicación y Unificación de Conjuntos

Cuando se utilizan operadores combinados separados por punto y coma (`;`), es muy común que se generen solapamientos naturales entre alias y rangos (por ejemplo, combinar `(FIRST)` con `(ODD)`, o el índice `(3)` con el operador `(ODD)`).

Para resolver esto, el motor del DSL aplica de forma estricta las siguientes dos reglas lógicas antes de ejecutar cualquier acción en el DOM:

1. **Evaluación de Izquierda a Derecha:** Cada instrucción dentro de los paréntesis se resuelve por separado, convirtiendo los alias, rangos y alternancias en una lista plana de números de posición puros basados en 1.
   
2. **Filtro de Conjunto Único (Deduplicación):** Una vez generada la lista total de posiciones, el motor aplica una operación de tipo **`Set`** (Conjunto Matemático Único). Esto significa que **cualquier índice duplicado se elimina de inmediato**, garantizando que cada elemento del DOM sea seleccionado y modificado **una sola vez**, sin importar cuántas veces haya sido invocado dentro del mismo paréntesis.

### 🎛️ Operadores Combinados (Sintaxis Avanzada)

Para selecciones complejas o salteadas, se pueden unir varios micro-operadores dentro de los mismos paréntesis utilizando el punto y coma (`;`) como separador.

> ⚠️ **Regla de Ámbito Estricto:** Las instrucciones combinadas afectarán **única y exclusivamente** a los elementos que compartan la misma etiqueta HTML o el mismo atributo `element-is` especificado al final del DSL. El conteo posicional se calcula de forma aislada para ese grupo homogéneo.

## 📖 Libro de Ejemplos Reales (De Código a DSL)

### Caso A: Modificación Quirúrgica Directa

Quieres cambiar el primer párrafo que es hijo directo del Hero, ignorando párrafos que estén dentro de tarjetas internas.

- **DSL:** `section #hero-section > (1) p`

- **Traducción nativa (CSS):** `section#hero-section > p:nth-of-type(1)`

### Caso B: Modificación Profunda Colectiva

Quieres ponerle un efecto hover a **todos** los enlaces `<a>` del menú de categorías, sin importar cuántos sub-contenedores estructurales tengan en medio.

- **DSL:** `nav #category-nav-list >> (ALL) a`

- **Traducción nativa (CSS):** `nav#category-nav-list a`

### Caso C: Rangos Acotados

Quieres alterar visualmente solo los primeros 3 botones de compra de una cuadrícula de productos.

- **DSL:** `div #product-card >> (1..3) buy-btn`

- **Traducción nativa (CSS):** `div#product-card [element-is="buy-btn"]:nth-of-type(-n+3)`

### Caso D: Fallback de Estructura (Sin atributo element-is)

El diseñador hace clic en el cuarto `div` genérico dentro de una barra de navegación que no tiene el atributo `element-is`.

- **DSL:** `nav #category-nav-list > (4) div`

- **Traducción nativa (CSS):** `nav#category-nav-list > div:nth-of-type(4)`

### Caso E: Modificación Colectiva Avanzada (Índices Combinados)

Quieres aplicar un rediseño o cambiar las sombras de una lista de productos afectando de golpe al primer y segundo elemento (destacados), a un rango medio, y a todos los que queden al final de manera masiva.

- **DSL:** `div #product-grid >> (1;2;5..8;12..END) product-card`

- **Traducción nativa:** Afecta simultáneamente a las posiciones físicas exactas: `1, 2, 5, 6, 7, 8` y desde la `12` hasta la última que exista en el contenedor. Los elementos intermedios (posiciones humanas 3, 4, 9, 10 y 11) se mantienen intactos.