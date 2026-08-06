import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getActiveTheme } from "@/lib/actions/themes";
import { ThemeCleanup } from "@/components/site/theme-cleanup";

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

  const btnStyle = themeConfig?.layout?.buttonStyle || "primary";
  const btnBg = themeConfig?.button?.background || themeConfig?.colors?.[btnStyle as keyof typeof themeConfig.colors];
  const btnText = themeConfig?.button?.text;
  const btnHover = themeConfig?.button?.hover;
  const btnPadding = themeConfig?.button?.padding;
  const btnRadius = themeConfig?.button?.radius;

  return (
    <div className="public-layout-root min-h-screen flex flex-col flex-1">
      <ThemeCleanup />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --theme-text: ${themeConfig?.typography?.paragraphColor || themeConfig?.colors?.text || "#0f172a"};
              --theme-primary: ${themeConfig?.colors?.primary || "#4f46e5"};
              --theme-link: ${themeConfig?.colors?.link || themeConfig?.colors?.primary || "#4f46e5"};
              ${themeConfig?.colors?.secondary ? `--theme-secondary: ${themeConfig.colors.secondary};` : ""}
              ${themeConfig?.colors?.background ? `--theme-background: ${themeConfig.colors.background};` : ""}
              ${themeConfig?.colors?.menuLink ? `--theme-menu-link: ${themeConfig.colors.menuLink};` : ""}
              ${themeConfig?.colors?.cardBg ? `--theme-card-bg: ${themeConfig.colors.cardBg};` : ""}
              ${themeConfig?.colors?.cardBorder ? `--theme-card-border: ${themeConfig.colors.cardBorder};` : ""}
              ${themeConfig?.colors?.shadowGlow ? `--theme-shadow-glow: ${themeConfig.colors.shadowGlow};` : ""}
              
              ${btnBg ? `--theme-button-bg: ${btnBg};` : ""}
              ${btnText ? `--theme-button-text: ${btnText};` : ""}
              ${btnHover ? `--theme-button-hover: ${btnHover};` : ""}
              ${btnPadding ? `--theme-button-padding: ${btnPadding};` : ""}
              ${btnRadius ? `--theme-button-radius: ${btnRadius};` : ""}

              ${themeConfig?.typography?.fontSans ? `--font-sans: ${themeConfig.typography.fontSans};` : ""}
              ${themeConfig?.typography?.fontHeading ? `--font-heading: ${themeConfig.typography.fontHeading};` : ""}

              --theme-p-color: ${themeConfig?.typography?.paragraphColor || themeConfig?.colors?.text || "currentColor"};
              ${themeConfig?.typography?.paragraphPadding ? `--theme-p-padding: ${themeConfig.typography.paragraphPadding};` : ""}
              
              --theme-h1-color: ${themeConfig?.typography?.h1?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h1?.padding ? `--theme-h1-padding: ${themeConfig.typography.h1.padding};` : ""}
              --theme-h2-color: ${themeConfig?.typography?.h2?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h2?.padding ? `--theme-h2-padding: ${themeConfig.typography.h2.padding};` : ""}
              --theme-h3-color: ${themeConfig?.typography?.h3?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h3?.padding ? `--theme-h3-padding: ${themeConfig.typography.h3.padding};` : ""}
              --theme-h4-color: ${themeConfig?.typography?.h4?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h4?.padding ? `--theme-h4-padding: ${themeConfig.typography.h4.padding};` : ""}
              --theme-h5-color: ${themeConfig?.typography?.h5?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h5?.padding ? `--theme-h5-padding: ${themeConfig.typography.h5.padding};` : ""}
              --theme-h6-color: ${themeConfig?.typography?.h6?.color || "var(--theme-p-color)"};
              ${themeConfig?.typography?.h6?.padding ? `--theme-h6-padding: ${themeConfig.typography.h6.padding};` : ""}

              ${themeConfig?.header?.background ? `--theme-header-bg: ${themeConfig.header.background};` : ""}
              ${themeConfig?.header?.blur !== undefined ? `--theme-header-blur: ${themeConfig.header.blur}px;` : ""}
              ${themeConfig?.header?.padding ? `--theme-header-padding: ${themeConfig.header.padding};` : ""}
              
              ${themeConfig?.footer?.background ? `--theme-footer-bg: ${themeConfig.footer.background};` : ""}
              ${themeConfig?.footer?.textColor ? `--theme-footer-text: ${themeConfig.footer.textColor};` : ""}
              ${themeConfig?.footer?.padding ? `--theme-footer-padding: ${themeConfig.footer.padding};` : ""}
              ${themeConfig?.footer?.linkColor ? `--theme-footer-link: ${themeConfig.footer.linkColor};` : ""}
              ${themeConfig?.footer?.headingColor ? `--theme-footer-heading: ${themeConfig.footer.headingColor};` : ""}
              ${themeConfig?.footer?.socialIconColor ? `--theme-footer-social: ${themeConfig.footer.socialIconColor};` : ""}
              
              ${themeConfig?.layout?.contentPadding ? `--theme-content-padding: ${themeConfig.layout.contentPadding};` : ""}
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
