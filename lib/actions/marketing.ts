"use server";

import { db } from "@/lib/db";
import { campaigns, socialPosts, posts, pages, services, NewCampaign, NewSocialPost } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateMarketingCampaign } from "@/lib/services/ai-marketing";
import {
  publishToFacebookPage,
  publishToInstagramBusiness,
  isFacebookMetaConfigured,
  isInstagramMetaConfigured,
} from "@/lib/services/meta-api";
import { sendNewsletterEmail } from "@/lib/services/email-sender";

// ==========================================
// MARKETING ACTIONS
// ==========================================

export async function getCampaignsAction() {
  try {
    const list = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
    return list;
  } catch (error: unknown) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
}

export async function getCampaignDetailsAction(id: string) {
  try {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    if (!campaign) return null;

    const postsList = await db.select().from(socialPosts).where(eq(socialPosts.campaignId, id));
    return { campaign, socialPosts: postsList };
  } catch (error: unknown) {
    console.error("Error fetching campaign details:", error);
    return null;
  }
}

export async function generateCampaignContentAction(params: {
  sourceType: "post" | "page" | "service" | "custom";
  sourceId?: string;
  customPrompt?: string;
}) {
  try {
    let sourceTitle = "Custom Marketing Campaign";
    let sourceContent = params.customPrompt || "Marketing content update for our CMS website.";
    let sourceUrl = "";
    let imageUrl = "";

    // Extract context from CMS database based on sourceType
    if (params.sourceType === "custom" && params.customPrompt) {
      sourceTitle = params.customPrompt.length > 50 ? params.customPrompt.slice(0, 50) + "..." : params.customPrompt;
      sourceContent = params.customPrompt;
    } else if (params.sourceType === "post" && params.sourceId) {
      const [item] = await db.select().from(posts).where(eq(posts.id, params.sourceId)).limit(1);
      if (item) {
        sourceTitle = item.title;
        sourceContent = item.excerpt || JSON.stringify(item.content).slice(0, 500);
        sourceUrl = `/blog/${item.slug}`;
        imageUrl = item.featuredImageUrl || "";
      }
    } else if (params.sourceType === "page" && params.sourceId) {
      const [item] = await db.select().from(pages).where(eq(pages.id, params.sourceId)).limit(1);
      if (item) {
        sourceTitle = item.title;
        sourceContent = `Page title: ${item.title}. Template: ${item.template}`;
        sourceUrl = `/${item.slug}`;
      }
    } else if (params.sourceType === "service" && params.sourceId) {
      const [item] = await db.select().from(services).where(eq(services.id, params.sourceId)).limit(1);
      if (item) {
        sourceTitle = item.title;
        sourceContent = item.shortDescription || item.title;
        sourceUrl = `/services#${item.slug}`;
      }
    }

    const aiResult = await generateMarketingCampaign({
      sourceTitle,
      sourceContent,
      sourceUrl,
      imageUrl,
      customInstructions: params.customPrompt,
    });

    // Create draft campaign in database
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        title: `Campaign: ${sourceTitle}`,
        sourceType: params.sourceType,
        sourceId: params.sourceId || null,
        status: "draft",
        emailSubject: aiResult.emailSubject,
        emailHtmlContent: aiResult.emailHtmlContent,
      })
      .returning();

    // Create social posts drafts
    const [fbPost] = await db
      .insert(socialPosts)
      .values({
        campaignId: newCampaign.id,
        platform: "facebook",
        caption: aiResult.facebookCaption,
        imageUrl: imageUrl || null,
        status: "draft",
      })
      .returning();

    const [igPost] = await db
      .insert(socialPosts)
      .values({
        campaignId: newCampaign.id,
        platform: "instagram",
        caption: aiResult.instagramCaption,
        imageUrl: imageUrl || null,
        status: "draft",
      })
      .returning();

    revalidatePath("/admin/marketing");
    return {
      success: true,
      campaign: newCampaign,
      socialPosts: [fbPost, igPost],
    };
  } catch (error: unknown) {
    console.error("Error generating campaign content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate AI campaign content",
    };
  }
}

export async function updateCampaignAction(id: string, data: Partial<NewCampaign>) {
  try {
    const [updated] = await db
      .update(campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();

    revalidatePath("/admin/marketing");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error updating campaign:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update campaign" };
  }
}

export async function updateSocialPostAction(id: string, data: Partial<NewSocialPost>) {
  try {
    const [updated] = await db
      .update(socialPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(socialPosts.id, id))
      .returning();

    revalidatePath("/admin/marketing");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error updating social post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update social post" };
  }
}

export async function deleteCampaignAction(id: string) {
  try {
    await db.delete(campaigns).where(eq(campaigns.id, id));
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting campaign:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete campaign" };
  }
}

export async function sendEmailCampaignAction(campaignId: string, recipients?: string[]) {
  try {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign || !campaign.emailSubject || !campaign.emailHtmlContent) {
      return { success: false, error: "Campaign email content is incomplete" };
    }

    const res = await sendNewsletterEmail({
      subject: campaign.emailSubject,
      htmlContent: campaign.emailHtmlContent,
      recipients,
    });

    if (res.success) {
      await db
        .update(campaigns)
        .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      revalidatePath("/admin/marketing");
      return { success: true, sentCount: res.sentCount };
    } else {
      await db
        .update(campaigns)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      return { success: false, error: res.error || "Email dispatch failed" };
    }
  } catch (error: unknown) {
    console.error("Error dispatching campaign email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Email dispatch exception" };
  }
}

export async function publishSocialPostAction(socialPostId: string) {
  try {
    const [postItem] = await db.select().from(socialPosts).where(eq(socialPosts.id, socialPostId)).limit(1);
    if (!postItem) {
      return { success: false, error: "Social post not found" };
    }

    let metaRes;
    if (postItem.platform === "facebook") {
      metaRes = await publishToFacebookPage({
        message: postItem.caption,
        imageUrl: postItem.imageUrl || undefined,
      });
    } else {
      if (!postItem.imageUrl) {
        return { success: false, error: "Instagram requires an image URL for publishing" };
      }
      metaRes = await publishToInstagramBusiness({
        caption: postItem.caption,
        imageUrl: postItem.imageUrl,
      });
    }

    if (metaRes.success) {
      const [updated] = await db
        .update(socialPosts)
        .set({
          status: "published",
          metaPostId: metaRes.metaPostId,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(socialPosts.id, socialPostId))
        .returning();

      revalidatePath("/admin/marketing");
      return { success: true, data: updated };
    } else {
      await db
        .update(socialPosts)
        .set({
          status: "failed",
          errorMessage: metaRes.error,
          updatedAt: new Date(),
        })
        .where(eq(socialPosts.id, socialPostId));

      return { success: false, error: metaRes.error };
    }
  } catch (error: unknown) {
    console.error("Error publishing social post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Social post error" };
  }
}

export async function getMarketingIntegrationsStatusAction() {
  const isFacebookConfigured = isFacebookMetaConfigured();
  const isInstagramConfigured = isInstagramMetaConfigured();
  const isEmailConfigured = Boolean(
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || process.env.RESEND_API_KEY
  );

  return {
    isFacebookConfigured,
    isInstagramConfigured,
    isEmailConfigured,
  };
}
