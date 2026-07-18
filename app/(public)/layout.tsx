import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getActiveTheme } from "@/lib/actions/themes";

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
    };
    footer?: {
      background?: string;
      textColor?: string;
      padding?: string;
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
      {activeTheme && themeConfig && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                ${themeConfig.colors?.primary ? `--theme-primary: ${themeConfig.colors.primary};` : ""}
                ${themeConfig.colors?.secondary ? `--theme-secondary: ${themeConfig.colors.secondary};` : ""}
                ${themeConfig.colors?.background ? `--theme-background: ${themeConfig.colors.background};` : ""}
                ${themeConfig.colors?.text ? `--theme-text: ${themeConfig.colors.text};` : ""}
                ${themeConfig.colors?.link ? `--theme-link: ${themeConfig.colors.link};` : ""}
                ${themeConfig.colors?.menuLink ? `--theme-menu-link: ${themeConfig.colors.menuLink};` : ""}
                
                ${btnBg ? `--theme-button-bg: ${btnBg};` : ""}
                ${btnText ? `--theme-button-text: ${btnText};` : ""}
                ${btnHover ? `--theme-button-hover: ${btnHover};` : ""}
                ${btnPadding ? `--theme-button-padding: ${btnPadding};` : ""}
                ${btnRadius ? `--theme-button-radius: ${btnRadius};` : ""}

                ${themeConfig.typography?.paragraphColor ? `--theme-p-color: ${themeConfig.typography.paragraphColor};` : ""}
                ${themeConfig.typography?.paragraphPadding ? `--theme-p-padding: ${themeConfig.typography.paragraphPadding};` : ""}
                
                ${themeConfig.typography?.h1?.color ? `--theme-h1-color: ${themeConfig.typography.h1.color};` : ""}
                ${themeConfig.typography?.h1?.padding ? `--theme-h1-padding: ${themeConfig.typography.h1.padding};` : ""}
                ${themeConfig.typography?.h2?.color ? `--theme-h2-color: ${themeConfig.typography.h2.color};` : ""}
                ${themeConfig.typography?.h2?.padding ? `--theme-h2-padding: ${themeConfig.typography.h2.padding};` : ""}
                ${themeConfig.typography?.h3?.color ? `--theme-h3-color: ${themeConfig.typography.h3.color};` : ""}
                ${themeConfig.typography?.h3?.padding ? `--theme-h3-padding: ${themeConfig.typography.h3.padding};` : ""}
                ${themeConfig.typography?.h4?.color ? `--theme-h4-color: ${themeConfig.typography.h4.color};` : ""}
                ${themeConfig.typography?.h4?.padding ? `--theme-h4-padding: ${themeConfig.typography.h4.padding};` : ""}
                ${themeConfig.typography?.h5?.color ? `--theme-h5-color: ${themeConfig.typography.h5.color};` : ""}
                ${themeConfig.typography?.h5?.padding ? `--theme-h5-padding: ${themeConfig.typography.h5.padding};` : ""}
                ${themeConfig.typography?.h6?.color ? `--theme-h6-color: ${themeConfig.typography.h6.color};` : ""}
                ${themeConfig.typography?.h6?.padding ? `--theme-h6-padding: ${themeConfig.typography.h6.padding};` : ""}

                ${themeConfig.header?.background ? `--theme-header-bg: ${themeConfig.header.background};` : ""}
                ${themeConfig.header?.blur !== undefined ? `--theme-header-blur: ${themeConfig.header.blur}px;` : ""}
                ${themeConfig.header?.padding ? `--theme-header-padding: ${themeConfig.header.padding};` : ""}
                
                ${themeConfig.footer?.background ? `--theme-footer-bg: ${themeConfig.footer.background};` : ""}
                ${themeConfig.footer?.textColor ? `--theme-footer-text: ${themeConfig.footer.textColor};` : ""}
                ${themeConfig.footer?.padding ? `--theme-footer-padding: ${themeConfig.footer.padding};` : ""}
                
                ${themeConfig.layout?.contentPadding ? `--theme-content-padding: ${themeConfig.layout.contentPadding};` : ""}
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
      )}
      <Header transparency={themeConfig?.header?.transparency} />
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
