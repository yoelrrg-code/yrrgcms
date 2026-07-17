import Link from "next/link";
import { getGlobal } from "@/lib/actions/globals";

export default async function Footer() {
  const footerData = ((await getGlobal("footer")) as any) || {};
  const copyright = footerData.copyright || "© yrrgCMS. All rights reserved.";
  const socialLinks = footerData.socialLinks || [];
  const columns = footerData.columns || [];

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Socials */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-semibold text-lg">yrrgCMS</h3>
            <p className="text-sm text-muted-foreground">
              A modern Next.js 15 CMS powered by App Router and Drizzle.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((social: any, idx: number) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          {columns.map((col: any, idx: number) => (
            <div key={idx} className="space-y-4">
              <h4 className="font-medium text-foreground">{col.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links?.map((link: any, linkIdx: number) => (
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
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
