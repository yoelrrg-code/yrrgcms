export interface Block {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface BlockDefinition {
  type: string;
  label: string;
  description: string;
  defaultProps: Record<string, unknown>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "HeroBanner",
    label: "Hero Banner",
    description: "Full-width hero section with image and text",
    defaultProps: {
      title: "Welcome to YRRG CMS",
      subtitle: "The powerful Headless CMS",
      ctaText: "Get Started",
      ctaUrl: "/",
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "TextWithImage",
    label: "Text with Image",
    description: "Two-column layout with rich text and image",
    defaultProps: {
      content: null,
      imageUrl: "",
      imageAlt: "",
      imagePosition: "left",
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "RichTextBlock",
    label: "Rich Text",
    description: "Standard text content block",
    defaultProps: {
      content: null,
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "PostsGrid",
    label: "Posts Grid",
    description: "Display recent posts in a grid",
    defaultProps: {
      title: "Recent News",
      count: 6,
      layout: "grid",
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "ContactFormBlock",
    label: "Contact Form",
    description: "Render a form from the database",
    defaultProps: {
      title: "Contact Us",
      formId: "",
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "PricingTable",
    label: "Pricing Table",
    description: "Display pricing plans",
    defaultProps: {
      title: "Our Plans",
      plans: [],
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "ImageGallery",
    label: "Image Gallery",
    description: "A masonry or grid gallery of images",
    defaultProps: {
      images: [],
      columns: 3,
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "CallToAction",
    label: "Call to Action",
    description: "Full-width CTA section",
    defaultProps: {
      title: "Ready to get started?",
      buttonText: "Sign Up",
      buttonUrl: "/",
      style: "primary",
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
  {
    type: "ServicesBlock",
    label: "Services and Booking",
    description: "Display service listings with booking modal and calendar",
    defaultProps: {
      title: "Our Services and Plans",
      subtitle: "Select a service and book your sessions quickly and easily.",
      layout: "rows",
    },
  },
  {
    type: "TestimonialsBlock",
    label: "Testimonials",
    description: "Display client feedback in a slider or grid format",
    defaultProps: {
      title: "What Our Clients Say",
      subtitle: "Real feedback from our satisfied customers and partners.",
      layout: "slider",
      onlyFeatured: false,
      limit: 6,
      paddingTop: "pt-12",
      paddingBottom: "pb-12",
    },
  },
];
