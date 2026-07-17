/**
 * Block Registry — maps block type strings to their React components.
 * Used by both:
 *  - The admin BlockEditor (preview)
 *  - The public frontend render engine (app/(public)/[[...slug]]/page.tsx)
 *
 * To add a new block:
 *  1. Create the component in this directory
 *  2. Add it to the BLOCK_REGISTRY below
 *  3. Add it to BLOCK_DEFINITIONS for the admin palette
 */

import HeroBanner from "./HeroBanner";
import TextWithImage from "./TextWithImage";
import RichTextBlock from "./RichTextBlock";
import PostsGrid from "./PostsGrid";
import ContactFormBlock from "./ContactFormBlock";
import PricingTable from "./PricingTable";
import ImageGallery from "./ImageGallery";
import CallToAction from "./CallToAction";

// Block component registry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_REGISTRY: Record<string, React.ComponentType<any>> = {
  HeroBanner,
  TextWithImage,
  RichTextBlock,
  PostsGrid,
  ContactFormBlock,
  PricingTable,
  ImageGallery,
  CallToAction,
};

export * from "./definitions";
