import Link from "next/link";
import { getGlobal } from "@/lib/actions/globals";
import { getMenuById } from "@/lib/actions/menus";
import { tiptapToHtml } from "@/lib/tiptap-render";
import { Globe } from "lucide-react";

export interface HeaderConfig {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  type?: "links" | "menu" | "richText";
  links: FooterLink[];
  menuId?: string;
  richText?: unknown;
}

async function FooterColumnRenderer({ col }: { col: FooterColumn }) {
  if (col.type === "richText") {
    const html = tiptapToHtml(col.richText);
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">{col.title}</h3>
        <div 
          className="prose prose-sm dark:prose-invert text-muted-foreground"
          style={{ color: "var(--theme-footer-text)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  if (col.type === "menu" && col.menuId) {
    const menu = await getMenuById(col.menuId);
    const items = menu?.items || [];
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">{col.title}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.url || "/"}
                target={item.target || "_self"}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Default to links
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">{col.title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {col.links?.map((link: FooterLink, linkIdx: number) => (
          <li key={linkIdx}>
            <Link
              href={link.url}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ url, label }: { url: string; label: string }) {
  const t = (url + " " + label).toLowerCase();
  
  if (t.includes("twitter") || t.includes("x.com")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (t.includes("facebook")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    );
  }
  if (t.includes("instagram") || t.includes("ig")) {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    );
  }
  if (t.includes("linkedin")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (t.includes("youtube")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (t.includes("github")) {
    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  }
  
  return <Globe className="h-5 w-5" />;
}

export interface FooterConfig {
  copyright?: string;
  socialLinks?: SocialLink[];
  columns?: FooterColumn[];
}

export default async function Footer() {
  const headerData = ((await getGlobal("header")) as HeaderConfig) || {};
  const footerData = ((await getGlobal("footer")) as FooterConfig) || {};
  const siteName = headerData.siteName || "yrrgCMS";
  const siteDescription = headerData.siteDescription || "A modern Next.js 15 CMS powered by App Router and Drizzle.";
  const copyright = footerData.copyright || "© yrrgCMS. All rights reserved.";
  const socialLinks = footerData.socialLinks || [];
  const columns = footerData.columns || [];

  return (
    <footer 
      className="border-t"
      style={{
        backgroundColor: "var(--theme-footer-bg, var(--muted))",
        padding: "var(--theme-footer-padding, 3rem 0)"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Socials */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-semibold text-lg">{siteName}</h3>
            <p className="text-sm text-muted-foreground" style={{ color: "var(--theme-footer-text)" }}>
              {siteDescription}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((social: SocialLink, idx: number) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title={social.label}
                  >
                    <SocialIcon url={social.url} label={social.label} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {columns.map((col: FooterColumn, idx: number) => (
            <FooterColumnRenderer key={idx} col={col} />
          ))}
        </div>

        <p className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground" style={{ color: "var(--theme-footer-text)" }}>
          {copyright}
        </p>
      </div>
    </footer>
  );
}
