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
import { Sparkles, RefreshCw, GraduationCap, Check } from "lucide-react";

interface CourseAIModalProps {
  onApplyCourseData: (data: {
    title: string;
    shortDescription: string;
    description: string;
    level: string;
    price: number;
  }) => void;
}

export default function CourseAIModal({ onApplyCourseData }: CourseAIModalProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor escribí el tema del curso que querés crear.");
      return;
    }

    setLoading(true);
    setError(null);
    setCourseData(null);

    try {
      const response = await fetch("/api/ai/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "course_outline",
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el temario del curso.");
      }

      setCourseData(data.result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado al comunicarse con la IA.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!courseData) return;
    onApplyCourseData({
      title: courseData.title || prompt,
      shortDescription: courseData.shortDescription || "",
      description: courseData.description || "",
      level: courseData.level || "Principiante",
      price: courseData.price || 99,
    });
    setOpen(false);
    setCourseData(null);
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
            <span>Generar Ficha de Curso con IA</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            <span>Generador Pedagógico de Cursos (DeepSeek V4)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresá el tema principal del curso y la IA creará el título comercial, descripción corta, fundamentación y temario por módulos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">¿De qué trata el curso?</label>
            <Textarea
              placeholder="Ej: Curso intensivo de arquitectura limpia y patrones de diseño en React y TypeScript para desarrolladores SSR/SR..."
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
                <span>Diseñando temario pedagógico...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generar Datos de Curso</span>
              </>
            )}
          </Button>

          {courseData && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Curso estructurado con éxito
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Título:</span>
                  <span className="font-bold text-foreground text-sm">{courseData.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Descripción Corta:</span>
                  <p className="text-muted-foreground">{courseData.shortDescription}</p>
                </div>
                {courseData.modules && courseData.modules.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] mb-1">Módulos sugeridos:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {courseData.modules.map((m: any, idx: number) => (
                        <li key={idx} className="font-medium">
                          {m.title} ({m.lessons?.length || 0} lecciones)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                  Aplicar Ficha al Curso
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
