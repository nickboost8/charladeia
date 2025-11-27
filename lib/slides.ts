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
  author?: string;
}

export const slides: Slide[] = [
  {
    id: "intro",
    type: "title",
    title: "IA, Globalización y Territorio",
    subtitle: "Una nueva era de conectividad",
    content: "Nicolás",
    author: "Nicolás" // provisional
  },
  // TODO: Copiar el contenido de slides.md aquí mapeado al formato Slide
];
