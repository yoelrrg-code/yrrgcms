"use client";

import { useState } from "react";
import { Campaign, SocialPost } from "@/lib/db/schema";
import {
  updateCampaignAction,
  updateSocialPostAction,
  sendEmailCampaignAction,
  publishSocialPostAction,
} from "@/lib/actions/marketing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Save, Globe, Eye, CheckCircle2 } from "lucide-react";
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

export interface MarketingIntegrationsStatus {
  isFacebookConfigured: boolean;
  isInstagramConfigured: boolean;
  isEmailConfigured: boolean;
}

interface CampaignEditorModalProps {
  campaign: Campaign | null;
  socialPosts: SocialPost[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updatedCampaignId: string, newStatus: Campaign["status"]) => void;
  integrationsStatus?: MarketingIntegrationsStatus;
}

export function CampaignEditorModal({
  campaign,
  socialPosts,
  open,
  onOpenChange,
  onUpdated,
  integrationsStatus = { isFacebookConfigured: false, isInstagramConfigured: false, isEmailConfigured: true },
}: CampaignEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"email" | "facebook" | "instagram">("email");

  // Email form state
  const [emailSubject, setEmailSubject] = useState(campaign?.emailSubject || "");
  const [emailHtml, setEmailHtml] = useState(campaign?.emailHtmlContent || "");
  const [previewMode, setPreviewMode] = useState(false);

  // Social posts state
  const fbPost = socialPosts.find((p) => p.platform === "facebook");
  const igPost = socialPosts.find((p) => p.platform === "instagram");

  const [fbCaption, setFbCaption] = useState(fbPost?.caption || "");
  const [igCaption, setIgCaption] = useState(igPost?.caption || "");
  const [igImageUrl, setIgImageUrl] = useState(igPost?.imageUrl || "");

  const [loading, setLoading] = useState(false);

  if (!campaign) return null;

  const handleSaveCampaign = async () => {
    setLoading(true);
    const res1 = await updateCampaignAction(campaign.id, {
      emailSubject,
      emailHtmlContent: emailHtml,
    });

    if (fbPost) {
      await updateSocialPostAction(fbPost.id, { caption: fbCaption });
    }
    if (igPost) {
      await updateSocialPostAction(igPost.id, { caption: igCaption, imageUrl: igImageUrl || null });
    }

    setLoading(false);
    if (res1.success) {
      if (onUpdated) onUpdated(campaign.id, campaign.status);
      sileo.success({ title: "Campaign Saved", description: "Changes updated successfully." });
    } else {
      sileo.error({ title: "Error", description: res1.error || "Failed to save campaign." });
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    const res = await sendEmailCampaignAction(campaign.id);
    setLoading(false);
    if (res.success) {
      if (onUpdated) onUpdated(campaign.id, "published");
      sileo.success({
        title: "Newsletter Sent!",
        description: `Successfully dispatched newsletter email to recipients.`,
      });
    } else {
      if (onUpdated) onUpdated(campaign.id, "failed");
      sileo.error({ title: "Email Error", description: res.error || "Failed to send newsletter." });
    }
  };

  const handlePublishSocial = async (postId?: string) => {
    if (!postId) return;
    setLoading(true);
    const res = await publishSocialPostAction(postId);
    setLoading(false);
    if (res.success) {
      if (onUpdated) onUpdated(campaign.id, campaign.status);
      sileo.success({ title: "Social Post Published!", description: "Post published to Meta social channel successfully." });
    } else {
      sileo.error({ title: "Social Publish Error", description: res.error || "Failed to publish post." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl lg:max-w-6xl w-full max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold">{campaign.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Source: {campaign.sourceType}</p>
            </div>
            <Badge variant={campaign.status === "published" ? "default" : "outline"} className="capitalize">
              Status: {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* MULTICHANNEL NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b pb-2 pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "email" ? "default" : "ghost"}
              onClick={() => setActiveTab("email")}
              className="gap-2 text-xs font-semibold"
            >
              <Mail className="size-4" /> Email Newsletter
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "facebook" ? "default" : "ghost"}
              onClick={() => setActiveTab("facebook")}
              className="gap-2 text-xs font-semibold"
            >
              <FacebookIcon className="size-4 text-blue-600" /> Facebook Post
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "instagram" ? "default" : "ghost"}
              onClick={() => setActiveTab("instagram")}
              className="gap-2 text-xs font-semibold"
            >
              <InstagramIcon className="size-4 text-pink-600" /> Instagram Post
            </Button>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={handleSaveCampaign} disabled={loading} className="gap-1.5 text-xs font-semibold">
            <Save className="size-3.5" /> Save Changes
          </Button>
        </div>

        {/* TAB CONTENT: EMAIL NEWSLETTER */}
        {activeTab === "email" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Subject Line</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)} className="h-7 text-xs gap-1.5">
                <Eye className="size-3.5" /> {previewMode ? "Edit HTML" : "Live Preview"}
              </Button>
            </div>
            <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." />

            {previewMode ? (
              <div className="border rounded-xl p-4 min-h-[300px] bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: emailHtml }} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email HTML Body</label>
                <Textarea value={emailHtml} onChange={(e) => setEmailHtml(e.target.value)} rows={12} className="font-mono text-xs" />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSendEmail} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Send className="size-4" /> Send Email Newsletter
              </Button>
            </div>
          </div>
        )}

        {/* TAB CONTENT: FACEBOOK POST */}
        {activeTab === "facebook" && (
          <div className="space-y-4 pt-2">
            {!integrationsStatus.isFacebookConfigured && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-bold">Facebook publishing is disabled</p>
                <p className="text-muted-foreground">Set <code className="font-mono">META_PAGE_ID</code> & <code className="font-mono">META_PAGE_ACCESS_TOKEN</code> in your <code className="font-mono">.env</code> to enable publishing.</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facebook Post Copy</label>
              {fbPost?.status === "published" && (
                <Badge variant="default" className="gap-1 bg-emerald-600 text-white text-[11px]">
                  <CheckCircle2 className="size-3" /> Published to Facebook
                </Badge>
              )}
            </div>
            <Textarea value={fbCaption} onChange={(e) => setFbCaption(e.target.value)} rows={8} />

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => handlePublishSocial(fbPost?.id)}
                disabled={loading || !integrationsStatus.isFacebookConfigured}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
              >
                <Globe className="size-4" /> Publish to Facebook Page
              </Button>
            </div>
          </div>
        )}

        {/* TAB CONTENT: INSTAGRAM POST */}
        {activeTab === "instagram" && (
          <div className="space-y-4 pt-2">
            {!integrationsStatus.isInstagramConfigured && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                <p className="font-bold">Instagram publishing is disabled</p>
                <p className="text-muted-foreground">Set <code className="font-mono">META_INSTAGRAM_ACCOUNT_ID</code> & <code className="font-mono">META_PAGE_ACCESS_TOKEN</code> in your <code className="font-mono">.env</code> to enable publishing.</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instagram Caption & Hashtags</label>
              {igPost?.status === "published" && (
                <Badge variant="default" className="gap-1 bg-emerald-600 text-white text-[11px]">
                  <CheckCircle2 className="size-3" /> Published to Instagram
                </Badge>
              )}
            </div>
            <Textarea value={igCaption} onChange={(e) => setIgCaption(e.target.value)} rows={8} />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image Media URL (Required for IG)</label>
              <Input value={igImageUrl} onChange={(e) => setIgImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => handlePublishSocial(igPost?.id)}
                disabled={loading || !integrationsStatus.isInstagramConfigured}
                className="gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold disabled:opacity-50"
              >
                <Globe className="size-4" /> Publish to Instagram Business
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
