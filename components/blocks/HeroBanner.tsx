import Image from "next/image";
import Link from "next/link";

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  overlayColor?: string;
}

export default function HeroBanner({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  backgroundImage,
  overlayColor,
}: HeroBannerProps) {
  const overlay = overlayColor ?? "rgba(0,0,0,0.55)";

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      ) : (
        /* Gradient fallback */
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900"
        />
      )}

      {/* Overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: overlay }}
      />

      {/* Noise texture for depth */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <h1
          className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #fff 20%, #a78bfa 60%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
            {subtitle}
          </p>
        )}

        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/20 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/50 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {ctaText}
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
        )}
      </div>

      {/* Decorative bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}
