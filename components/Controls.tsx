"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Radio, Eye } from "lucide-react"

// Tipos para el rol y modo de sincronización
export type Role = "admin" | "viewer"
export type SyncMode = "live" | "desynced"

interface ControlsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  mode: "live" | "desynced";
  onReturnToLive: () => void;
  role: "admin" | "viewer";
}

export default function Controls({ role, mode, canPrev, canNext, onPrev, onNext, onReturnToLive }: ControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
        {/* Botón anterior */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Indicador de modo */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-muted/50">
          {role === "admin" ? (
            <>
              <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="text-xs font-medium text-indigo-500">Modo presentador</span>
            </>
          ) : mode === "live" ? (
            <>
              <Eye className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">En vivo</span>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReturnToLive}
              className="text-xs h-auto py-1 px-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            >
              ← Volver al presentador
            </Button>
          )}
        </div>

        {/* Botón siguiente */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
