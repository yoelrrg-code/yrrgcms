"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, RefreshCw, Layers, Check } from "lucide-react";
import type { Block } from "@/components/blocks/definitions";

interface PageAIAssistantModalProps {
  onInsertBlocks: (blocks: Block[]) => void;
  onSetSeo?: (seoTitle: string, seoDescription: string) => void;
}

export default function PageAIAssistantModal({
  onInsertBlocks,
  onSetSeo,
}: PageAIAssistantModalProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<Block[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor escribí una descripción de la página que querés crear.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedBlocks(null);

    try {
      const response = await fetch("/api/ai/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page_blocks",
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar los bloques de página.");
      }

      const rawBlocks = data.result;
      if (!Array.isArray(rawBlocks)) {
        throw new Error("Formato de bloques devuelto no válido.");
      }

      // Asignar IDs únicos a cada bloque
      const processedBlocks: Block[] = rawBlocks.map((b: any, index: number) => ({
        id: `ai-block-${Date.now()}-${index}`,
        type: b.type,
        props: b.props || {},
      }));

      setGeneratedBlocks(processedBlocks);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado al comunicarse con IA.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedBlocks) return;
    onInsertBlocks(generatedBlocks);

    if (onSetSeo && prompt) {
      onSetSeo(
        prompt.slice(0, 60),
        `Página creada con asistencia de IA para: ${prompt.slice(0, 140)}`
      );
    }

    setOpen(false);
    setGeneratedBlocks(null);
    setPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 font-bold shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Generar Página Completa con IA</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>Arquitecto de Páginas (DeepSeek V4 Flash)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Describí el propósito de tu página y la IA estructurará automáticamente los bloques visuales (Hero, Precios, Testimonios, CTA, Formularios).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">¿Qué tipo de página querés construir?</label>
            <Textarea
              placeholder="Ej: Una landing page de venta para un máster en desarrollo de aplicaciones web con Next.js y Supabase. Incluí oferta de valor, precios destacados y formulario de contacto..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Diseñando estructura de bloques...</span>
              </>
            ) : (
              <>
                <Layers className="h-4 w-4" />
                <span>Generar Bloques de Página</span>
              </>
            )}
          </Button>

          {generatedBlocks && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Se generaron {generatedBlocks.length} bloques visuales
                </span>
              </div>

              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {generatedBlocks.map((b, i) => (
                  <div key={b.id} className="p-2.5 rounded-lg border border-border bg-muted/40 text-xs flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {i + 1}. {b.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {(b.props as any)?.title || (b.props as any)?.badgeText || "Bloque configurado"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Insertar Bloques en la Página
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
