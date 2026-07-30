import Image from "next/image";
import { tiptapToHtml } from "@/lib/tiptap-render";

export interface TextWithImageProps {
  paddingTop?: string;
  paddingBottom?: string;
  /** Tiptap JSON document or null */
  content: unknown;
  imageUrl: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

export default function TextWithImage({
  paddingTop,
  paddingBottom,
  content,
  imageUrl,
  imageAlt,
  imagePosition,
}: TextWithImageProps) {
  const html = tiptapToHtml(content);

  const imageCol = (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ring-1 ring-black/5 dark:ring-white/10">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );

  const textCol = (
    <div
      className="prose prose-lg prose-slate dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  return (
    <section className={`${paddingTop || "pt-12"} ${paddingBottom || "pb-12"} py-20 px-6`}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`flex flex-col gap-12 lg:flex-row lg:items-center ${
            imagePosition === "right" ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="w-full lg:w-1/2" data-aos={imagePosition === "right" ? "fade-left" : "fade-right"}>{imageCol}</div>
          <div className="w-full lg:w-1/2" data-aos={imagePosition === "right" ? "fade-right" : "fade-left"}>{textCol}</div>
        </div>
      </div>
    </section>
  );
}
