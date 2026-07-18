import { auth } from "@/lib/auth";
import { requireCan } from "@/lib/permissions";
import { getGlobal } from "@/lib/actions/globals";
import { getMenus } from "@/lib/actions/menus";
import GlobalsClient from "./client";

export const metadata = {
  title: "Global Settings | yrrgCMS",
};

export default async function GlobalsPage() {
  const session = await auth();
  requireCan(session, "manage", "globals");

  const header = (await getGlobal("header")) || {};
  const footer = (await getGlobal("footer")) || {};
  const seo = (await getGlobal("seo_defaults")) || {};
  const menus = await getMenus();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
      <GlobalsClient initialHeader={header} initialFooter={footer} initialSeo={seo} initialMenus={menus} />
    </div>
  );
}
