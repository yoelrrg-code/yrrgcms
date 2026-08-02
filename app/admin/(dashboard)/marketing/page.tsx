import { getCampaignsAction, getMarketingIntegrationsStatusAction } from "@/lib/actions/marketing";
import { getPosts } from "@/lib/actions/posts";
import { getPages } from "@/lib/actions/pages";
import { getServices } from "@/lib/actions/services";
import { CampaignsManager } from "@/components/admin/marketing/CampaignsManager";

export default async function MarketingAdminPage() {
  const [campaignsList, postsList, pagesList, servicesList, integrationsStatus] = await Promise.all([
    getCampaignsAction(),
    getPosts(),
    getPages(),
    getServices(),
    getMarketingIntegrationsStatusAction(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing & Multichannel Newsletters</h1>
        <p className="text-sm text-muted-foreground">
          Generate AI-powered marketing campaigns from your CMS content, preview email newsletters, and publish directly to Facebook & Instagram.
        </p>
      </div>

      <CampaignsManager
        initialCampaigns={campaignsList}
        postsList={postsList.map((p) => ({ id: p.id, title: p.title }))}
        pagesList={pagesList.map((pg) => ({ id: pg.id, title: pg.title }))}
        servicesList={servicesList.map((s) => ({ id: s.id, title: s.title }))}
        integrationsStatus={integrationsStatus}
      />
    </div>
  );
}
