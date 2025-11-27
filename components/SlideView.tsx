import type { Slide } from "@/lib/slides"

interface SlideViewProps {
  slide: Slide
  index: number
  total: number
}

export default function SlideView({ slide, index, total }: SlideViewProps) {
  const renderContent = () => {
    switch (slide.type) {
      case "title":
        return (
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground">{slide.title}</h1>
            {slide.subtitle && (
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light">{slide.subtitle}</p>
            )}
            {(slide.author || slide.content) && (
              <p className="text-base md:text-lg text-muted-foreground/70 mt-8 font-light tracking-wide">
                {slide.author || slide.content}
              </p>
            )}
          </div>
        )

      case "text":
        return (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {slide.title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">{slide.title}</h2>
            )}
            {slide.content && (
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed whitespace-pre-line">
                {slide.content}
              </p>
            )}
          </div>
        )

      case "bullets":
        return (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {slide.title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">{slide.title}</h2>
            )}
            <ul className="space-y-6">
              {slide.bullets?.map((bullet, i) => (
                <li key={i} className="flex items-start gap-4 text-lg md:text-xl lg:text-2xl text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mt-3 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )

      case "quote":
        return (
          <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
            <blockquote className="relative">
              <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
              <p className="text-2xl md:text-3xl lg:text-4xl text-foreground italic leading-relaxed pl-6 md:pl-10">
                "{slide.quote}"
              </p>
              {(slide.author || slide.content) && (
                <footer className="mt-8 pl-6 md:pl-10 text-lg md:text-xl text-muted-foreground">
                  — {slide.author || slide.content}
                </footer>
              )}
            </blockquote>
          </div>
        )

      case "data":
        return (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {slide.title && (
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">{slide.title}</h2>
            )}
            <ul className="space-y-5">
              {slide.bullets?.map((bullet, i) => (
                <li key={i} className="flex items-start gap-4 text-lg md:text-xl lg:text-2xl text-muted-foreground">
                  <span className="text-indigo-500 font-mono font-bold">→</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            {slide.content && (
              <p className="text-sm md:text-base text-muted-foreground/60 mt-6 font-light">{slide.content}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Contenido principal de la slide */}
      <main className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24 py-20">{renderContent()}</main>

      {/* Footer discreto */}
      <footer className="fixed bottom-0 left-0 right-0 pb-24 md:pb-28 flex items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground/50">
        <span>
          Slide {index + 1} de {total}
        </span>
        <span className="text-muted-foreground/30">·</span>
        <span className="tracking-wide">IA · Globalización · Territorio</span>
      </footer>
    </div>
  )
}
