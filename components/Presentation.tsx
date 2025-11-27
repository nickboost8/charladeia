"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Slide } from "@/lib/slides";
import SlideView from "@/components/SlideView";
import Controls from "@/components/Controls";

interface PresentationProps {
  initialSlides: Slide[];
}

function PresentationContent({ initialSlides }: PresentationProps) {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role = roleParam === "admin" ? "admin" : "viewer";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveIndex, setLiveIndex] = useState(0);
  const [mode, setMode] = useState<"live" | "desynced">("live");

  // Ref para acceder al modo actual dentro del callback de Supabase
  const modeRef = React.useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Suscripción a Supabase
  useEffect(() => {
    const channel = supabase
      .channel("slides_channel")
      .on(
        "broadcast",
        { event: "slide_change" },
        (payload) => {
          const newIndex = payload.payload.index;
          setLiveIndex(newIndex);
          
          if (modeRef.current === "live") {
            setCurrentIndex(newIndex);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Actualizar currentIndex si volvemos a live
  useEffect(() => {
    if (mode === "live" && currentIndex !== liveIndex) {
      setCurrentIndex(liveIndex);
    }
  }, [mode, liveIndex, currentIndex]);

  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= initialSlides.length) return;

    setCurrentIndex(newIndex);

    if (role === "admin") {
      setLiveIndex(newIndex);
      supabase.channel("slides_channel").send({
        type: "broadcast",
        event: "slide_change",
        payload: { index: newIndex },
      });
    } else {
      setMode("desynced");
    }
  }, [role, initialSlides.length]);

  const handlePrev = () => changeSlide(currentIndex - 1);
  const handleNext = () => changeSlide(currentIndex + 1);
  
  const handleReturnToLive = () => {
    setMode("live");
    setCurrentIndex(liveIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        changeSlide(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        changeSlide(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, changeSlide]);

  const currentSlide = initialSlides[currentIndex];

  if (!currentSlide) {
      return <div className="text-white text-center mt-20">Cargando slides o índice fuera de rango...</div>;
  }

  return (
    <>
      {/* Badge de Rol */}
      <div className="fixed top-4 right-4 z-50">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${role === 'admin' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          {role === 'admin' ? 'PRESENTADOR' : 'ESPECTADOR'}
        </span>
      </div>

      <SlideView slide={currentSlide} index={currentIndex} total={initialSlides.length} />
      
      <Controls
        role={role}
        mode={mode}
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={currentIndex > 0}
        canNext={currentIndex < initialSlides.length - 1}
        onReturnToLive={handleReturnToLive}
      />
    </>
  );
}

export default function Presentation({ initialSlides }: PresentationProps) {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando presentación...</div>}>
      <PresentationContent initialSlides={initialSlides} />
    </Suspense>
  );
}


