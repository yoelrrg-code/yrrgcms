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
import { Sparkles, Wand2, RefreshCw, Check, Copy, FileText, Languages, Zap } from "lucide-react";

interface AIAssistantModalProps {
  currentText: string;
  selectedText?: string;
  onInsertContent: (htmlContent: string) => void;
}

type AIMode = "draft" | "improve" | "summarize" | "translate";

export default function AIAssistantModal({
  currentText,
  selectedText,
  onInsertContent,
}: AIAssistantModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AIMode>("draft");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetText = selectedText || currentText;

  const handleGenerate = async () => {
    if (!prompt && mode === "draft") {
      setError("Por favor decinos sobre qué tema querés escribir.");
      return;
    }
    if (!targetText && (mode === "improve" || mode === "summarize" || mode === "translate")) {
      setError("Escribí algo de texto en el editor para poder procesarlo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetch("/api/ai/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          prompt,
          text: targetText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al consultar la IA.");
      }

      setResult(data.result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado de comunicación.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onInsertContent(result);
    setOpen(false);
    setResult("");
    setPrompt("");
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 font-bold text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all rounded-lg shrink-0"
            title="Asistente de Inteligencia Artificial (DeepSeek V4)"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            <span>Asistente IA</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>Copiloto de Redacción (DeepSeek V4 Flash)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generá borradores, mejorá el estilo, traducí o resumí contenidos al instante con inteligencia artificial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Modos de Selección */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => { setMode("draft"); setError(null); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold gap-1.5 transition-all ${
                mode === "draft"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span>Redactar</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode("improve"); setError(null); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold gap-1.5 transition-all ${
                mode === "improve"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Mejorar estilo</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode("summarize"); setError(null); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold gap-1.5 transition-all ${
                mode === "summarize"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Resumir</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode("translate"); setError(null); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold gap-1.5 transition-all ${
                mode === "translate"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Languages className="h-4 w-4" />
              <span>Traducir</span>
            </button>
          </div>

          {/* Formulario según Modo */}
          {mode === "draft" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">¿Sobre qué querés escribir?</label>
              <Textarea
                placeholder="Ej: Escribí una guía paso a paso sobre cómo estructurar cursos online efectivos para principiantes..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[90px] text-sm resize-none"
              />
            </div>
          )}

          {mode === "improve" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Instrucciones opcionales para la mejora:</label>
              <Textarea
                placeholder="Ej: Hazlo más persuasivo y entusiasta / Corregí faltas de ortografía / Simplificá las oraciones..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[70px] text-sm resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Se procesará el texto {selectedText ? "seleccionado" : "del editor"}.
              </p>
            </div>
          )}

          {mode === "translate" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Idioma destino:</label>
              <input
                type="text"
                placeholder="Ej: inglés, portugués, francés..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
          )}

          {mode === "summarize" && (
            <p className="text-xs text-muted-foreground">
              Se generará un resumen de 2-3 oraciones a partir del texto {selectedText ? "seleccionado" : "del editor"}.
            </p>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Botón Generar */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generando con DeepSeek V4...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generar respuesta</span>
              </>
            )}
          </Button>

          {/* Resultado Generado */}
          {result && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Respuesta generada
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </Button>
              </div>

              <div
                className="p-4 rounded-xl border border-border bg-muted/30 max-h-[220px] overflow-y-auto text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: result }}
              />

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
                  Insertar en el Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
