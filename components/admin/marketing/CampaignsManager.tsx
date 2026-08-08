"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campaign, SocialPost } from "@/lib/db/schema";
import { getCampaignDetailsAction, deleteCampaignAction } from "@/lib/actions/marketing";
import { CampaignGeneratorModal } from "./CampaignGeneratorModal";
import { CampaignEditorModal } from "./CampaignEditorModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, SquarePen, Trash2, Megaphone, Calendar, Sparkles, AlertTriangle } from "lucide-react";
import { sileo } from "sileo";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

interface CMSItem {
  id: string;
  title: string;
}

export interface MarketingIntegrationsStatus {
  isFacebookConfigured: boolean;
  isInstagramConfigured: boolean;
  isEmailConfigured: boolean;
}

interface CampaignsManagerProps {
  initialCampaigns: Campaign[];
  postsList: CMSItem[];
  pagesList: CMSItem[];
  servicesList: CMSItem[];
  integrationsStatus?: MarketingIntegrationsStatus;
}

export function CampaignsManager({
  initialCampaigns,
  postsList,
  pagesList,
  servicesList,
  integrationsStatus = { isFacebookConfigured: false, isInstagramConfigured: false, isEmailConfigured: true },
}: CampaignsManagerProps) {
  const router = useRouter();
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedSocialPosts, setSelectedSocialPosts] = useState<SocialPost[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleCampaignGenerated = (newCampaign?: Campaign) => {
    if (newCampaign) {
      setCampaignsList((prev) => [newCampaign, ...prev]);
    }
    router.refresh();
  };

  const handleCampaignUpdated = (updatedId: string, newStatus: Campaign["status"]) => {
    setCampaignsList((prev) =>
      prev.map((c) => (c.id === updatedId ? { ...c, status: newStatus } : c))
    );
    if (selectedCampaign && selectedCampaign.id === updatedId) {
      setSelectedCampaign({ ...selectedCampaign, status: newStatus });
    }
    router.refresh();
  };

  const handleOpenEditor = async (campaign: Campaign) => {
    const details = await getCampaignDetailsAction(campaign.id);
    if (details) {
      setSelectedCampaign(details.campaign);
      setSelectedSocialPosts(details.socialPosts);
      setEditorOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    sileo.action({
      title: "Delete Campaign?",
      description: "Are you sure you want to permanently remove this marketing campaign?",
      button: {
        title: "Confirm Delete",
        onClick: async () => {
          const res = await deleteCampaignAction(id);
          if (res.success) {
            setCampaignsList((prev) => prev.filter((c) => c.id !== id));
            sileo.success({ title: "Deleted", description: "Campaign removed successfully." });
          } else {
            sileo.error({ title: "Error", description: res.error || "Failed to delete campaign." });
          }
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* INTEGRATION WARNING BANNER IF SOCIAL APIS ARE DISABLED */}
      {(!integrationsStatus.isFacebookConfigured || !integrationsStatus.isInstagramConfigured) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Social Media Publishing Disabled (Missing Meta API Credentials)</p>
            <p className="text-muted-foreground leading-relaxed">
              {!integrationsStatus.isFacebookConfigured && !integrationsStatus.isInstagramConfigured ? (
                <>Facebook Page & Instagram Business publishing are currently disabled because <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_PAGE_ACCESS_TOKEN</code>, <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_PAGE_ID</code> and <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_INSTAGRAM_ACCOUNT_ID</code> are not configured in your enviroment.</>
              ) : !integrationsStatus.isFacebookConfigured ? (
                <>Facebook Page publishing is disabled. Please configure <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_PAGE_ID</code> and <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_PAGE_ACCESS_TOKEN</code> in your enviroment.</>
              ) : (
                <>Instagram Business publishing is disabled. Please configure <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_INSTAGRAM_ACCOUNT_ID</code> and <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded text-foreground">META_PAGE_ACCESS_TOKEN</code> in your enviroment.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-card p-4 rounded-xl border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Megaphone className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-base">Multichannel Campaigns</h2>
            <p className="text-xs text-muted-foreground">Generated AI email newsletters, Facebook & Instagram posts.</p>
          </div>
        </div>

        <CampaignGeneratorModal
          postsList={postsList}
          pagesList={pagesList}
          servicesList={servicesList}
          onGenerated={handleCampaignGenerated}
        />
      </div>

      {/* CAMPAIGNS GRID */}
      {campaignsList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground space-y-3">
            <Sparkles className="size-10 mx-auto text-primary/40" />
            <p className="font-bold text-base text-foreground">No marketing campaigns generated yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Click &quot;Generate Campaign with AI&quot; to pick content from your CMS and generate email newsletters + social posts automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaignsList.map((campaign) => (
            <Card key={campaign.id} className="pt-0 relative overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={campaign.status === "published" ? "default" : campaign.status === "failed" ? "destructive" : "outline"} className="capitalize text-[10px]">
                    {campaign.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base leading-snug line-clamp-2">{campaign.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize">Source: {campaign.sourceType}</p>
                </div>

                {campaign.emailSubject && (
                  <div className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1 border">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary" /> Subject:
                    </p>
                    <p className="font-medium line-clamp-1 italic text-foreground">&quot;{campaign.emailSubject}&quot;</p>
                  </div>
                )}

                {/* Social Channels Icons */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1"><Mail className="size-3.5 text-sky-500" /> Newsletter</span>
                  <span className={`flex items-center gap-1 ${!integrationsStatus.isFacebookConfigured ? "opacity-40" : ""}`}>
                    <FacebookIcon className="size-3.5 text-blue-600" /> Facebook
                  </span>
                  <span className={`flex items-center gap-1 ${!integrationsStatus.isInstagramConfigured ? "opacity-40" : ""}`}>
                    <InstagramIcon className="size-3.5 text-pink-600" /> Instagram
                  </span>
                </div>
              </CardContent>

              {/* CARD ACTIONS */}
              <div className="px-4 py-3 border-t mt-auto flex items-center justify-between bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditor(campaign)}
                  className="h-9 px-3 text-xs font-bold gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <SquarePen className="size-4" /> Edit & Publish
                </Button>
                <Button
                  size="icon"
                  className="size-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs border border-rose-500/30 transition-colors shrink-0"
                  onClick={() => handleDelete(campaign.id)}
                  title="Eliminar campaña"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CAMPAIGN EDITOR MODAL */}
      <CampaignEditorModal
        key={selectedCampaign?.id || "modal"}
        campaign={selectedCampaign}
        socialPosts={selectedSocialPosts}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onUpdated={handleCampaignUpdated}
        integrationsStatus={integrationsStatus}
      />
    </div>
  );
}
