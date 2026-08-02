/**
 * Meta Graph API Service for publishing to Facebook Pages and Instagram Business accounts.
 * Requires META_PAGE_ACCESS_TOKEN, META_PAGE_ID, META_INSTAGRAM_ACCOUNT_ID in environment variables.
 */

export interface MetaPublishResponse {
  success: boolean;
  metaPostId?: string;
  error?: string;
}

export function isFacebookMetaConfigured(): boolean {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  return Boolean(pageId && token && !token.includes("tu_") && !pageId.includes("tu_"));
}

export function isInstagramMetaConfigured(): boolean {
  const igUserId = process.env.META_INSTAGRAM_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  return Boolean(igUserId && token && !token.includes("tu_") && !igUserId.includes("tu_"));
}

export async function publishToFacebookPage(params: {
  message: string;
  linkUrl?: string;
  imageUrl?: string;
}): Promise<MetaPublishResponse> {
  const pageId = process.env.META_PAGE_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!isFacebookMetaConfigured()) {
    return {
      success: false,
      error: "Facebook publishing is disabled. Please configure META_PAGE_ID and META_PAGE_ACCESS_TOKEN in .env",
    };
  }

  try {
    const endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const payload: Record<string, string> = {
      message: params.message,
      access_token: accessToken!,
    };

    if (params.linkUrl) {
      payload.link = params.linkUrl;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Failed to publish to Facebook Page");
    }

    return {
      success: true,
      metaPostId: data.id,
    };
  } catch (err: unknown) {
    console.error("Error publishing to Facebook:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Facebook publish error",
    };
  }
}

export async function publishToInstagramBusiness(params: {
  caption: string;
  imageUrl: string;
}): Promise<MetaPublishResponse> {
  const igUserId = process.env.META_INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

  if (!isInstagramMetaConfigured()) {
    return {
      success: false,
      error: "Instagram publishing is disabled. Please configure META_INSTAGRAM_ACCOUNT_ID and META_PAGE_ACCESS_TOKEN in .env",
    };
  }

  try {
    // Step 1: Create Media Container
    const containerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: params.imageUrl,
        caption: params.caption,
        access_token: accessToken!,
      }),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || containerData.error) {
      throw new Error(containerData.error?.message || "Failed to create Instagram media container");
    }

    const creationId = containerData.id;

    // Step 2: Publish Media Container
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken!,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) {
      throw new Error(publishData.error?.message || "Failed to publish Instagram media container");
    }

    return {
      success: true,
      metaPostId: publishData.id,
    };
  } catch (err: unknown) {
    console.error("Error publishing to Instagram:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Instagram publish error",
    };
  }
}
