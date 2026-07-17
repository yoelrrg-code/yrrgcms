export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface BlockDefinition {
  type: string;
  label: string;
  description: string;
  defaultProps: Record<string, any>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "HeroBanner",
    label: "Hero Banner",
    description: "Full-width hero section with image and text",
    defaultProps: {
      title: "Welcome to yrrgCMS",
      subtitle: "The powerful Headless CMS",
      ctaText: "Get Started",
      ctaUrl: "/",
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
    },
  },
  {
    type: "RichTextBlock",
    label: "Rich Text",
    description: "Standard text content block",
    defaultProps: {
      content: null,
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
    },
  },
  {
    type: "ContactFormBlock",
    label: "Contact Form",
    description: "Render a form from the database",
    defaultProps: {
      title: "Contact Us",
      formId: "",
    },
  },
  {
    type: "PricingTable",
    label: "Pricing Table",
    description: "Display pricing plans",
    defaultProps: {
      title: "Our Plans",
      plans: [],
    },
  },
  {
    type: "ImageGallery",
    label: "Image Gallery",
    description: "A masonry or grid gallery of images",
    defaultProps: {
      images: [],
      columns: 3,
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
    },
  },
];
