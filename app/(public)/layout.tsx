import { Suspense } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getActiveTheme } from "@/lib/actions/themes";
import { ThemeCleanup } from "@/components/site/theme-cleanup";
import { PageLoader } from "@/components/site/PageLoader";

type HeadingConfig = {
  color?: string;
  padding?: string;
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeTheme = await getActiveTheme();

  const themeConfig = activeTheme?.config as {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
      link?: string;
      menuLink?: string;
      cardBg?: string;
      cardBorder?: string;
      shadowGlow?: string;
    };
    layout?: {
      buttonStyle?: "primary" | "secondary";
      contentPadding?: string;
    };
    button?: {
      background?: string;
      text?: string;
      hover?: string;
      padding?: string;
      radius?: string;
    };
    typography?: {
      fontSans?: string;
      fontHeading?: string;
      paragraphColor?: string;
      paragraphPadding?: string;
      h1?: HeadingConfig;
      h2?: HeadingConfig;
      h3?: HeadingConfig;
      h4?: HeadingConfig;
      h5?: HeadingConfig;
      h6?: HeadingConfig;
    };
    header?: {
      background?: string;
      transparency?: number;
      blur?: number;
      padding?: string;
      isFixed?: boolean;
    };
    footer?: {
      background?: string;
      textColor?: string;
      padding?: string;
      linkColor?: string;
      headingColor?: string;
      socialIconColor?: string;
      useBrandSocialColors?: boolean;
    };
  } | undefined;

  function safeCss(val: unknown, fallback = ""): string {
    if (typeof val !== "string" && typeof val !== "number") return fallback;
    const str = String(val).replace(/[<>{};"'\\]/g, "").trim();
    return str || fallback;
  }

  const btnStyle = themeConfig?.layout?.buttonStyle || "primary";
  const btnBg = safeCss(themeConfig?.button?.background || themeConfig?.colors?.[btnStyle as keyof typeof themeConfig.colors]);
  const btnText = safeCss(themeConfig?.button?.text);
  const btnHover = safeCss(themeConfig?.button?.hover);
  const btnPadding = safeCss(themeConfig?.button?.padding);
  const btnRadius = safeCss(themeConfig?.button?.radius);

  return (
    <div className="public-layout-root min-h-screen flex flex-col flex-1">
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      <ThemeCleanup />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --theme-text: ${safeCss(themeConfig?.typography?.paragraphColor || themeConfig?.colors?.text, "#0f172a")};
              --theme-primary: ${safeCss(themeConfig?.colors?.primary, "#4f46e5")};
              --theme-link: ${safeCss(themeConfig?.colors?.link || themeConfig?.colors?.primary, "#4f46e5")};
              ${themeConfig?.colors?.secondary ? `--theme-secondary: ${safeCss(themeConfig.colors.secondary)};` : ""}
              ${themeConfig?.colors?.background ? `--theme-background: ${safeCss(themeConfig.colors.background)};` : ""}
              ${themeConfig?.colors?.menuLink ? `--theme-menu-link: ${safeCss(themeConfig.colors.menuLink)};` : ""}
              ${themeConfig?.colors?.cardBg ? `--theme-card-bg: ${safeCss(themeConfig.colors.cardBg)};` : ""}
              ${themeConfig?.colors?.cardBorder ? `--theme-card-border: ${safeCss(themeConfig.colors.cardBorder)};` : ""}
              ${themeConfig?.colors?.shadowGlow ? `--theme-shadow-glow: ${safeCss(themeConfig.colors.shadowGlow)};` : ""}
              
              ${btnBg ? `--theme-button-bg: ${btnBg};` : ""}
              ${btnText ? `--theme-button-text: ${btnText};` : ""}
              ${btnHover ? `--theme-button-hover: ${btnHover};` : ""}
              ${btnPadding ? `--theme-button-padding: ${btnPadding};` : ""}
              ${btnRadius ? `--theme-button-radius: ${btnRadius};` : ""}

              ${themeConfig?.typography?.fontSans ? `--font-sans: ${safeCss(themeConfig.typography.fontSans)};` : ""}
              ${themeConfig?.typography?.fontHeading ? `--font-heading: ${safeCss(themeConfig.typography.fontHeading)};` : ""}

              --theme-p-color: ${safeCss(themeConfig?.typography?.paragraphColor || themeConfig?.colors?.text, "currentColor")};
              ${themeConfig?.typography?.paragraphPadding ? `--theme-p-padding: ${safeCss(themeConfig.typography.paragraphPadding)};` : ""}
              
              --theme-h1-color: ${safeCss(themeConfig?.typography?.h1?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h1?.padding ? `--theme-h1-padding: ${safeCss(themeConfig.typography.h1.padding)};` : ""}
              --theme-h2-color: ${safeCss(themeConfig?.typography?.h2?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h2?.padding ? `--theme-h2-padding: ${safeCss(themeConfig.typography.h2.padding)};` : ""}
              --theme-h3-color: ${safeCss(themeConfig?.typography?.h3?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h3?.padding ? `--theme-h3-padding: ${safeCss(themeConfig.typography.h3.padding)};` : ""}
              --theme-h4-color: ${safeCss(themeConfig?.typography?.h4?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h4?.padding ? `--theme-h4-padding: ${safeCss(themeConfig.typography.h4.padding)};` : ""}
              --theme-h5-color: ${safeCss(themeConfig?.typography?.h5?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h5?.padding ? `--theme-h5-padding: ${safeCss(themeConfig.typography.h5.padding)};` : ""}
              --theme-h6-color: ${safeCss(themeConfig?.typography?.h6?.color, "var(--theme-p-color)")};
              ${themeConfig?.typography?.h6?.padding ? `--theme-h6-padding: ${safeCss(themeConfig.typography.h6.padding)};` : ""}

              ${themeConfig?.header?.background ? `--theme-header-bg: ${safeCss(themeConfig.header.background)};` : ""}
              ${themeConfig?.header?.blur !== undefined ? `--theme-header-blur: ${safeCss(themeConfig.header.blur)}px;` : ""}
              ${themeConfig?.header?.padding ? `--theme-header-padding: ${safeCss(themeConfig.header.padding)};` : ""}
              
              ${themeConfig?.footer?.background ? `--theme-footer-bg: ${safeCss(themeConfig.footer.background)};` : ""}
              ${themeConfig?.footer?.textColor ? `--theme-footer-text: ${safeCss(themeConfig.footer.textColor)};` : ""}
              ${themeConfig?.footer?.padding ? `--theme-footer-padding: ${safeCss(themeConfig.footer.padding)};` : ""}
              ${themeConfig?.footer?.linkColor ? `--theme-footer-link: ${safeCss(themeConfig.footer.linkColor)};` : ""}
              ${themeConfig?.footer?.headingColor ? `--theme-footer-heading: ${safeCss(themeConfig.footer.headingColor)};` : ""}
              ${themeConfig?.footer?.socialIconColor ? `--theme-footer-social: ${safeCss(themeConfig.footer.socialIconColor)};` : ""}
              
              ${themeConfig?.layout?.contentPadding ? `--theme-content-padding: ${safeCss(themeConfig.layout.contentPadding)};` : ""}
            }

            .public-layout-root [data-slot="button"]:not(.size-icon) {
              ${btnPadding ? `padding: var(--theme-button-padding) !important;` : ""}
            }
            .public-layout-root [data-slot="button"] {
              ${btnRadius ? `border-radius: var(--theme-button-radius) !important;` : ""}
            }
          `,
        }}
      />
      <Header
        transparency={themeConfig?.header?.transparency}
        isFixed={themeConfig?.header?.isFixed !== false}
      />
      <div 
        className="flex-1"
        style={{ padding: themeConfig?.layout?.contentPadding ? "var(--theme-content-padding)" : undefined }}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
