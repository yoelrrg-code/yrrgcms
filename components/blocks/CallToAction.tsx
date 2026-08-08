import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";

export interface CallToActionProps {
  paddingTop?: string;
  paddingBottom?: string;
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  style?: "primary" | "secondary" | "dark";
}

export default function CallToAction({
  paddingTop,
  paddingBottom,
  title,
  description,
  buttonText,
  buttonUrl,
  style = "primary",
}: CallToActionProps) {
  const wrapperClass =
    style === "primary"
      ? "bg-gradient-to-r from-[var(--theme-primary,#4f46e5)] via-indigo-600 to-purple-600"
      : style === "dark"
      ? "bg-slate-950 dark:bg-black border-y border-slate-800"
      : "bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md border-y border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800";

  const titleClass =
    style === "primary" || style === "dark"
      ? "text-white"
      : "text-[var(--theme-h2-color,currentColor)] dark:text-white";

  const descClass =
    style === "primary"
      ? "text-white/90"
      : style === "dark"
      ? "text-slate-300"
      : "text-[var(--theme-p-color,#475569)] dark:text-slate-400";

  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-24 px-6 ${wrapperClass} relative overflow-hidden`}>
      {/* Subtle radial ambient glow for primary/dark */}
      {(style === "primary" || style === "dark") && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-purple-500/20 blur-3xl"
          />
        </>
      )}

      <Reveal animation="fade-up" className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
          <span>✦ Special Offer</span>
        </div>

        <h2
          className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${titleClass}`}
        >
          {title}
        </h2>

        {description && (
          <p className={`text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto ${descClass}`}>{description}</p>
        )}

        <div className="pt-4">
          <Link
            href={buttonUrl}
            style={
              style !== "primary"
                ? {
                    backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                    color: "var(--theme-button-text, #ffffff)",
                    borderRadius: "var(--theme-button-radius, 9999px)",
                  }
                : {
                    borderRadius: "var(--theme-button-radius, 9999px)",
                  }
            }
            className={`group/cta btn-hover-effect inline-flex items-center gap-2.5 px-9 py-4 text-base font-bold transition-all duration-300 ${
              style === "primary"
                ? "bg-white text-indigo-900 shadow-2xl hover:bg-slate-50 hover:shadow-white/20"
                : "shadow-xl hover:shadow-2xl"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
          >
            <span>{buttonText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
