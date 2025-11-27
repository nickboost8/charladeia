import { Slide, SlideType } from "./slides";

export function parseSlides(markdown: string): Slide[] {
  // Dividir por separador de slides (---)
  const rawSlides = markdown.split(/^---$/gm).map((s) => s.trim()).filter((s) => s);

  return rawSlides.map((raw, index) => {
    const slide: Slide = {
      id: `slide-${index + 1}`,
      type: "text", // Default
    };

    // Extraer Título (## Slide X – Título)
    const headerMatch = raw.match(/^##\s+(.*?)$/m);
    // if (headerMatch) {
    //   // Podríamos usar esto para algo interno, pero el "Título en pantalla" es el que manda
    // }

    // Extraer bloques clave
    const titleMatch = raw.match(/\*\*Título en pantalla\*\*\s*\n(.*?)(?=\n\n|\n\*\*|$)/s);
    if (titleMatch) slide.title = titleMatch[1].trim();

    const subtitleMatch = raw.match(/\*\*Subtítulo\*\*\s*\n(.*?)(?=\n\n|\n\*\*|$)/s);
    if (subtitleMatch) slide.subtitle = subtitleMatch[1].trim();

    // Mapeo de campos de contenido
    const bodyMatch = raw.match(/\*\*(?:Cuerpo breve|Detalle|Pie pequeño|Frase destacada|Frase breve|Pie)\*\*\s*\n(.*?)(?=\n\n|\n\*\*|$)/s);
    if (bodyMatch) {
        // Si es portada (slide 1), Detalle suele ser el autor
        if (index === 0 && raw.includes("**Detalle**")) {
             slide.author = bodyMatch[1].trim();
             // Para mantener compatibilidad con tipos viejos, también lo ponemos en content si se quiere
             slide.content = bodyMatch[1].trim();
        } else {
             slide.content = bodyMatch[1].trim();
        }
    }

    // Citas
    const quoteMatch = raw.match(/>\s+(.*?)(?=\n\n|\n\*\*|$)/s);
    // Ojo, el markdown usa blockquote `> ` para citas.
    // A veces hay blockquotes que son notas de uso previsto (slide 0 intro).
    // Ignoramos la intro del documento si no es un slide real. 
    // (Asumimos que rawSlides[0] es el intro del doc si no tiene "## Slide")
    
    // Mejor estrategia para Citas: buscar la sección **Cita grande** o blockquotes en slides tipo Quote.
    const quoteSectionMatch = raw.match(/\*\*Cita grande\*\*\s*\n((?:>.*?\n?)+)/s);
    if (quoteSectionMatch) {
        slide.quote = quoteSectionMatch[1].replace(/^>\s?/gm, "").trim();
    }
    
    // Bullets
    const bulletsMatch = raw.match(/\*\*(?:Bullets|Datos clave|Datos clave en pantalla|Datos en pantalla)\*\*\s*\n((?:- .*?\n?)+)/s);
    if (bulletsMatch) {
      slide.bullets = bulletsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^- /, "").trim());
    }

    // Notas
    const noteMatch = raw.match(/\*\*Nota orador\*\*:?\s*(.*)/);
    if (noteMatch) slide.note = noteMatch[1].trim();

    // Determinación de Tipo
    if (index === 0 || raw.toLowerCase().includes("portada")) {
        slide.type = "title";
    } else if (slide.quote) {
        slide.type = "quote";
    } else if (
        (raw.includes("Datos") || raw.includes("Pincelazo")) && 
        slide.bullets && 
        slide.bullets.length > 0
    ) {
        slide.type = "data";
    } else if (slide.bullets && slide.bullets.length > 0) {
        slide.type = "bullets";
    } else {
        slide.type = "text";
    }

    return slide;
  }).filter(slide => {
      // Filtrar slides vacíos o de metadata inicial del archivo si no tienen título ni contenido
      // El archivo empieza con un bloque de uso previsto que no es un slide.
      // El primer slide real empieza con ## Slide 1
      if (!slide.title && !slide.content && !slide.bullets && !slide.quote) return false;
      // O asegurarnos que tenga "## Slide" en el raw original, pero aquí ya perdimos el raw.
      // Vamos a filtrar si no se detectó nada útil.
      return true;
  });
}


