import Link from "next/link";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  highlighted?: boolean;
}

export interface PricingTableProps {
  paddingTop?: string;
  paddingBottom?: string;
  title?: string;
  plans: PricingPlan[];
}

export default function PricingTable({
  paddingTop,
  paddingBottom, title, plans }: PricingTableProps) {
  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-[var(--theme-h2-color,currentColor)] sm:text-4xl">
            {title}
          </h2>
        )}

        <div
          className={`grid gap-8 ${
            plans.length === 1
              ? "grid-cols-1 max-w-sm mx-auto"
              : plans.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan, idx) => (
            <PricingCard key={plan.id} plan={plan} delay={idx * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, delay }: { plan: PricingPlan; delay: number }) {
  const { highlighted } = plan;

  return (
    <div
      className={`group card-hover-effect relative flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2.5 ${
        highlighted
          ? "bg-gradient-to-b from-[var(--theme-primary,#4f46e5)] via-[var(--theme-primary,#4f46e5)] to-indigo-700 text-white shadow-2xl shadow-indigo-500/30 ring-2 ring-indigo-400/50 hover:shadow-indigo-500/50 hover:scale-[1.02]"
          : "bg-[var(--theme-card-bg,rgba(255,255,255,0.85))] dark:bg-slate-900/80 backdrop-blur-md border border-[var(--theme-card-border,rgba(226,232,240,0.8))] dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/30"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-amber-400 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-amber-950 shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-6">
        <h3
          className={`text-2xl font-extrabold ${
            highlighted ? "text-white" : "text-[var(--theme-h3-color,currentColor)] dark:text-white"
          }`}
        >
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-end gap-1">
        <span
          className={`text-5xl font-black tracking-tight ${
            highlighted ? "text-white" : "text-[var(--theme-h3-color,currentColor)] dark:text-white"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`mb-1.5 text-sm font-medium ${
            highlighted ? "text-white/80" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          /{plan.period}
        </span>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3.5 border-t border-b py-6 my-2 border-slate-200/50 dark:border-slate-800/80">
        {plan.features.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 text-sm font-medium ${
              highlighted ? "text-white/95" : "text-[var(--theme-p-color,#475569)] dark:text-slate-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                highlighted ? "text-amber-300" : "text-[var(--theme-primary,var(--primary))]"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaUrl}
        style={
          !highlighted
            ? {
                backgroundColor: "var(--theme-button-bg, var(--theme-primary, var(--primary)))",
                color: "var(--theme-button-text, #ffffff)",
                borderRadius: "var(--theme-button-radius, 9999px)",
              }
            : {
                borderRadius: "var(--theme-button-radius, 9999px)",
              }
        }
        className={`btn-hover-effect inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
          highlighted
            ? "bg-white text-indigo-900 shadow-lg hover:bg-slate-50 hover:shadow-xl"
            : "shadow-md hover:shadow-lg"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
      >
        {plan.ctaText}
      </Link>
    </div>
  );
}
