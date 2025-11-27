import fs from "fs/promises";
import path from "path";
import { parseSlides } from "@/lib/parseSlides";
import Presentation from "@/components/Presentation";

export const dynamic = "force-dynamic"; // Asegurar que no se cachee estáticamente si queremos leer cambios

export default async function Page() {
  // Leer slides.md desde la raíz del proyecto
  const slidesPath = path.join(process.cwd(), "slides.md");
  let slidesContent = "";
  
  try {
    slidesContent = await fs.readFile(slidesPath, "utf-8");
  } catch (error) {
    console.error("Error leyendo slides.md:", error);
    return <div className="text-red-500 p-10">Error: No se pudo leer el archivo slides.md</div>;
  }

  const slides = parseSlides(slidesContent);

  return <Presentation initialSlides={slides} />;
}
