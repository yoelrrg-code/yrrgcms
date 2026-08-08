"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, RefreshCw, Bot, User, HelpCircle, BarChart3, Rocket } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AdminAICopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Sos bienvenido al **Copiloto Inteligente de YRRG CMS** con DeepSeek V4. ¿En qué te puedo ayudar hoy? Podés pedirme analizar métricas, sugerir estrategias de contenido o redactar campañas.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/admin-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un problema con el copiloto.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Hubo un error de conexión con la IA. Por favor reintentá en unos momentos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center border-2 border-white/20 transition-all hover:scale-105"
            title="Abrir Copiloto de IA Admin"
          >
            <Sparkles className="h-6 w-6 animate-pulse" />
          </Button>
        }
      />

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l border-border shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border bg-muted/40">
          <SheetTitle className="flex items-center gap-2.5 text-base font-black">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span>Copiloto Admin YRRG CMS</span>
              <span className="block text-[10px] font-normal text-muted-foreground">
                Potenciado con DeepSeek V4 Cloud
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Quick Suggestions Chips */}
        <div className="p-3 border-b border-border bg-muted/20 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleSend("¿Cómo puedo aumentar las conversiones de mis cursos?")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap hover:bg-indigo-500/20 transition"
          >
            🚀 Aumentar ventas
          </button>
          <button
            type="button"
            onClick={() => handleSend("Dame un resumen del estado actual de mi plataforma")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap hover:bg-indigo-500/20 transition"
          >
            📊 Resumen de plataforma
          </button>
          <button
            type="button"
            onClick={() => handleSend("Sugerime 3 temas para nuevos artículos de blog")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap hover:bg-indigo-500/20 transition"
          >
            💡 Ideas de blog
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-sm ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-sm font-medium"
                    : "bg-muted border border-border text-foreground rounded-bl-none prose prose-sm dark:prose-invert"
                }`}
              >
                {m.content}
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-sm items-center text-muted-foreground pt-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted border border-border">
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                <span className="text-xs font-semibold">Procesando consulta...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Preguntá lo que quieras a tu copiloto..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-sm h-11 rounded-xl"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
