import { getTestimonials } from "@/lib/actions/testimonials";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";

export default async function TestimonialsAdminPage() {
  const testimonialsList = await getTestimonials();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer feedback, ratings, and display options for landing page blocks.
          </p>
        </div>
      </div>

      <TestimonialsManager initialTestimonials={testimonialsList} />
    </div>
  );
}
