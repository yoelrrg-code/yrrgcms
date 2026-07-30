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
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
      data-aos="fade-up"
      data-aos-delay={delay}
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? "bg-gradient-to-b from-theme-primary via-theme-primary to-theme-primary/90 text-white shadow-xl shadow-theme-primary/30 ring-2 ring-theme-primary/50 hover:shadow-2xl hover:shadow-theme-primary/40"
          : "bg-card border border-border shadow-sm hover:shadow-xl hover:border-muted-foreground/20"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-950 shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-6">
        <h3
          className={`text-xl font-bold ${
            highlighted ? "text-white" : "text-foreground"
          }`}
        >
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-end gap-1">
        <span
          className={`text-5xl font-extrabold tracking-tight ${
            highlighted ? "text-white" : "text-foreground"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`mb-1.5 text-sm ${
            highlighted ? "text-white/80" : "text-muted-foreground"
          }`}
        >
          /{plan.period}
        </span>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 text-sm ${
              highlighted ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                highlighted ? "text-white" : "text-theme-primary"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
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
        className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
          highlighted
            ? "bg-white text-theme-primary shadow-md hover:bg-slate-50 hover:shadow-lg"
            : "bg-theme-primary text-white shadow-md shadow-theme-primary/20 hover:bg-theme-primary/95 hover:shadow-lg hover:shadow-theme-primary/30"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary`}
      >
        {plan.ctaText}
      </Link>
    </div>
  );
}
