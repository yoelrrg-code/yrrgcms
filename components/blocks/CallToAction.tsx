import Link from "next/link";

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
      ? "bg-gradient-to-r from-theme-primary via-purple-600 to-indigo-600"
      : style === "dark"
      ? "bg-slate-950 dark:bg-black"
      : "bg-slate-50 dark:bg-slate-900 border-y border-border";

  const titleClass =
    style === "primary" || style === "dark"
      ? "text-white"
      : "text-foreground";

  const descClass =
    style === "primary"
      ? "text-white/80"
      : style === "dark"
      ? "text-slate-400"
      : "text-muted-foreground";

  const btnClass =
    style === "primary"
      ? "bg-white text-theme-primary hover:bg-slate-50 shadow-lg hover:shadow-xl"
      : style === "dark"
      ? "bg-theme-primary text-white hover:bg-theme-primary/90 shadow-lg shadow-theme-primary/50 hover:shadow-theme-primary/50"
      : "bg-theme-primary text-white hover:bg-theme-primary/90 shadow-md shadow-theme-primary/50 hover:shadow-theme-primary/50";

  return (
    <section className={`py-24 px-6 ${wrapperClass}`}>
      {/* Subtle grid pattern for primary/dark */}
      {(style === "primary" || style === "dark") && (
        <div
          aria-hidden
          className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} pointer-events-none absolute inset-0 opacity-[0.06]`}
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      <div className="relative mx-auto max-w-3xl text-center">
        <h2
          className={`mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${titleClass}`}
        >
          {title}
        </h2>

        {description && (
          <p className={`mb-10 text-lg ${descClass}`}>{description}</p>
        )}

        <Link
          href={buttonUrl}
          className={`inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-theme-primary ${btnClass}`}
        >
          {buttonText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
