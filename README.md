# IA, Globalización y Territorio – Slides

Proyecto de presentación interactiva con sincronización en tiempo real usando Next.js y Supabase.

## Configuración Local

1.  **Instalar dependencias:**

    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**

    Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Supabase:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

3.  **Ejecutar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

El sitio tiene dos roles definidos por parámetros en la URL:

*   **Presentador (Admin):** Controla el avance de las diapositivas para todos los espectadores conectados.
    *   URL: `http://localhost:3000/?role=admin`
    *   Controles: Flechas de teclado o botones en pantalla.

*   **Espectador (Viewer):** Sigue al presentador por defecto (Modo "En vivo"). Puede navegar libremente (Modo "Desincronizado") y volver a sincronizarse.
    *   URL: `http://localhost:3000/?role=viewer` (o simplemente la raíz `http://localhost:3000/`)

## Estructura del Proyecto

*   `lib/slides.ts`: Contiene el contenido de las diapositivas.
*   `components/SlideView.tsx`: Componente para renderizar cada tipo de slide.
*   `app/page.tsx`: Lógica principal de sincronización y manejo de estado.


