# Prompt para configurar el proyecto de presentación web en Cursor

```text
Quiero que configures COMPLETAMENTE un proyecto de presentación web para una charla tipo TED, usando Next.js y TypeScript, con sincronización en tiempo real entre presentador y audiencia.

Contexto clave:
- Ya tengo un archivo `slides.md`, que contiene el contenido de todas las diapositivas (cada pantalla de la charla), luego de iniciar el proyecto me avisas e incluyo el archivo en el proyecto manualmente.
- El objetivo es desplegar el sitio en Vercel.
- El sitio debe funcionar como un "deck" de slides sincronizado:
  - Un rol **admin/presentador** que controla el avance global.
  - Un rol **viewer/audiencia** que sigue al presentador por defecto, pero puede navegar por su cuenta y luego volver al estado del presentador con un botón.

### Tareas generales

1. **El repo está clonado y vacio, listo para iniciar**  
   - Si el repo está vacío o no tiene Next.js configurado, crea la estructura completa de un proyecto con **Next.js 14+ (App Router)** y **TypeScript**

2. **Stack y dependencias**  
   Configura el proyecto con:
   - Next.js (App Router).
   - React 18.
   - TypeScript estricto.
   - `@supabase/supabase-js` para sincronización en tiempo real.
   - ESLint y configuración básica recomendada por Next.js.

   Asegúrate de dejar un `package.json` consistente. Si ya existe, edítalo sin romper scripts básicos (`dev`, `build`, `start`).

3. **Arquitectura de carpetas**  
   Crea/ajusta la siguiente estructura mínima:

   - `app/`
     - `layout.tsx`
     - `page.tsx`
   - `app/globals.css`
   - `lib/`
     - `slides.ts`
     - `supabaseClient.ts`
   - `components/`
     - `SlideView.tsx`
     - `Controls.tsx`

   Puedes añadir más archivos si lo ves necesario, pero esta es la base mínima.

---

### Lógica funcional del sitio

#### Roles

- El rol se define por **query param**:
  - `/?role=admin` → modo presentador (controla el slide global).
  - `/?role=viewer` → modo audiencia (sigue al presentador por defecto).
- Si no se pasa `role`, asumir `viewer` por defecto.

#### Comportamiento de sincronización

- Debe existir un **índice de slide global** compartido por todos: `currentSlideIndex`.
- Sincronización vía Supabase Realtime (broadcast en un canal simple).
- Canal sugerido: `"slides_channel"`.

**Para el admin:**
- Navega con:
  - Botones “Anterior” / “Siguiente”.
  - Atajos de teclado: flechas izquierda/derecha.
- Cada cambio de slide:
  - Actualiza el estado local.
  - Envía un broadcast al canal de Supabase con el índice nuevo.

**Para la audiencia (viewer):**
- Por defecto está en **modo "live"**:
  - Siempre muestra el índice que reciba del admin vía Realtime.
- Si el viewer:
  - Usa botones “Anterior” / “Siguiente”, o
  - Usa teclado ← / →,
  
  entonces:
  - Cambia a modo `"desynced"` (des-sincronizado).
  - El índice local se mueve, pero ya no sigue al presentador.
  - Debe aparecer un botón visible: **“Volver al presentador”**.
- Al hacer clic en **“Volver al presentador”**:
  - El viewer vuelve a modo `"live"`.
  - El índice local se sincroniza con el índice global del admin.

---

### Implementación técnica concreta

#### 1) `lib/slides.ts`

- Crea un tipo:

  ```ts
  export type SlideType = "title" | "text" | "bullets" | "quote" | "data";

  export interface Slide {
    id: string;
    type: SlideType;
    title?: string;
    subtitle?: string;
    content?: string;
    bullets?: string[];
    quote?: string;
    note?: string; // opcional, para notas internas, no se muestra
  }
  ```

- Crea y exporta un array:

  ```ts
  export const slides: Slide[] = [ ... ];
  ```

- Usa el archivo `slides.md` como fuente de verdad:
  - Léelo tú (como agente) y mapea cada sección en una entrada del array.
  - Usa la estructura del guion:  
    - Portada → `type: "title"`, con `title`, `subtitle` y una línea de autor en `content`.  
    - Slides de texto → `type: "text"` con `content`.  
    - Slides de bullets → `type: "bullets"` con `bullets`.  
    - Slides tipo cita → `type: "quote"` con `quote`.  
    - Slides con datos → `type: "data"` con `bullets` + `content` (pie o frase de cierre).
  - Genera un `id` único por slide, por ejemplo `"slide-1"`, `"slide-2"`, etc.

#### 2) `lib/supabaseClient.ts`

- Configura el cliente de Supabase así:

  ```ts
  import { createClient } from "@supabase/supabase-js";

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  ```

- No hardcodees claves, todo va por variables de entorno.

#### 3) `components/SlideView.tsx`

- Componente que recibe `{ slide, index, total }` y muestra una slide a pantalla completa.
- Estilo base:
  - Fondo oscuro (`#050816` o similar).
  - Contenido centrado, ancho máx ~`max-w-4xl`.
  - Tipografía limpia (system UI).
- Soporta todos los tipos:
  - `"title"`: muestra `title`, `subtitle`, `content` (autor).
  - `"text"`: párrafo grande, líneas con `white-space: pre-line`.
  - `"bullets"`: lista con bullets bien espaciados.
  - `"quote"`: bloque con borde lateral y texto grande/itálico.
  - `"data"`: combinación de lista + texto corto como pie.
- Debe incluir un pequeño footer con:
  - `Slide X de Y`
  - Un texto corto tipo “IA · Globalización · Territorio”.

#### 4) `components/Controls.tsx`

- Recibe props:

  ```ts
  interface ControlsProps {
    onPrev: () => void;
    onNext: () => void;
    canPrev: boolean;
    canNext: boolean;
    mode: "live" | "desynced";
    onReturnToLive: () => void;
    role: "admin" | "viewer";
  }
  ```

- Renderiza:
  - Botón “← Anterior” y “Siguiente →”.
  - Si `role === "viewer"` y `mode === "desynced"` → botón “Volver al presentador”.
  - Si `role === "viewer"` y `mode === "live"` → etiqueta “Modo en vivo”.
  - Si `role === "admin"` → etiqueta “Modo presentador”.
- Ubicación:
  - Barra flotante fija en la parte baja, centrada, con fondo semitransparente.

#### 5) `app/layout.tsx`

- Layout simple con:
  - `<html lang="es">`
  - `<body>` con clases para fondo oscuro y tipografía.
- Metadata básica:

  ```ts
  export const metadata = {
    title: "IA, Globalización y Territorio – Slides",
    description: "Charla sobre IA, globalización y territorio – Nicolás"
  }
  ```

#### 6) `app/globals.css`

- Define al menos:
  - Reset básico.
  - Fuente base (system UI).
  - Fondo oscuro y texto claro.
- Usa estilos utilitarios simples; NO es necesario Tailwind por ahora (si ya está, puedes aprovecharlo).

#### 7) `app/page.tsx`

Este es el corazón de la app.

- Debe:
  - Leer `role` desde `useSearchParams()` (`"admin"` o `"viewer"`).
  - Gestionar `currentIndex`, `liveIndex` y `mode` (`"live"` | `"desynced"`).
  - Suscribirse al canal de Supabase:

    - Canal: `"slides_channel"`.
    - Evento broadcast: `"slide_change"`.
    - Payload: `{ index: number }`.

  - Lógica:
    - Cuando llega un broadcast:
      - Actualiza `liveIndex`.
      - Si `mode === "live"` → también actualizar `currentIndex`.
    - Si el usuario (admin o viewer) navega manualmente:
      - Admin:
        - Cambia `currentIndex`, `liveIndex` y hace broadcast.
      - Viewer:
        - Cambia solo `currentIndex`.
        - Pone `mode = "desynced"` si la acción vino del usuario.
    - Botón “Volver al presentador”:
      - `mode = "live"`.
      - `currentIndex = liveIndex`.

- Implementa atajos de teclado:
  - `ArrowRight` → siguiente.
  - `ArrowLeft` → anterior.

- Usa `<SlideView />` y `<Controls />`:

  ```tsx
  <SlideView slide={slideActual} index={currentIndex} total={totalSlides} />
  <Controls
    role={role}
    mode={mode}
    onPrev={handlePrev}
    onNext={handleNext}
    canPrev={currentIndex > 0}
    canNext={currentIndex < totalSlides - 1}
    onReturnToLive={handleReturnToLive}
  />
  ```

- Añade también un pequeño “badge” fijo arriba a la derecha indicando el rol actual.

---

### UX deseada

- El sitio debe verse bien en:
  - Desktop (pantalla de proyección).
  - Portátiles.
  - Móvil (por si alguien se conecta desde el celular).
- Diseño:
  - Minimal, moderno, legible.
  - Texto grande, pocos elementos en cada slide.
  - Colores: fondo oscuro, texto claro, detalles en un solo color de acento (indigo, emerald, etc.).

---

### Variables de entorno y README

- Agrega un archivo `README.md` que explique:

  - Cómo correr el proyecto localmente:
    - `npm install`
    - `npm run dev`
  - Variables de entorno necesarias:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    ```

  - Explica brevemente cómo se usan los roles:
    - `/?role=admin`
    - `/?role=viewer`

---

### Importante

- Asegúrate de que el proyecto **compila y corre** en local (`npm run dev`) sin errores de TypeScript.
- Usa buenas prácticas de React/Next.js (componentes funcionales, hooks bien usados, etc.).
- Comenta brevemente las partes clave del código, sobre todo la sincronización en tiempo real y la lógica de modos `live/desynced`.

Por favor, implementa TODO lo anterior de forma incremental, explicando en tus mensajes qué vas creando/modificando en cada paso.
```