const IG_GRAPH_BASE = "https://graph.instagram.com/v21.0";
const IG_GRAPH_ROOT = "https://graph.instagram.com";

function token(): string {
  const t = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!t) throw new Error("INSTAGRAM_ACCESS_TOKEN not set");
  return t;
}

function userId(): string {
  const u = process.env.INSTAGRAM_USER_ID;
  if (!u) throw new Error("INSTAGRAM_USER_ID not set");
  return u;
}

async function igGet<T = unknown>(path: string, params: Record<string, string>, root = IG_GRAPH_BASE): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${root}${path}?${qs}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram GET ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

async function igPost<T = unknown>(path: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`${IG_GRAPH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram POST ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

async function waitForContainerReady(containerId: string, maxWaitSeconds = 180): Promise<void> {
  const intervalMs = 3000;
  const maxAttempts = Math.ceil((maxWaitSeconds * 1000) / intervalMs);
  for (let i = 0; i < maxAttempts; i++) {
    const status = await igGet<{ status_code?: string; status?: string }>(`/${containerId}`, {
      fields: "status_code,status",
      access_token: token(),
    });
    const code = status.status_code ?? "UNKNOWN";
    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`Instagram container ${containerId} failed: ${JSON.stringify(status)}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Instagram container ${containerId} did not reach FINISHED within ${maxWaitSeconds}s`);
}

export interface IgWhoami {
  id: string;
  username: string;
  account_type: string;
  user_id: string;
}

export async function whoami(): Promise<IgWhoami> {
  return igGet<IgWhoami>("/me", {
    fields: "id,username,account_type,user_id",
    access_token: token(),
  });
}

export interface IgRefreshResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  permissions?: string;
}

export async function refreshAccessToken(): Promise<IgRefreshResult> {
  return igGet<IgRefreshResult>(
    "/refresh_access_token",
    { grant_type: "ig_refresh_token", access_token: token() },
    IG_GRAPH_ROOT,
  );
}

export interface IgPublishResult {
  mediaId: string;
  containerId: string;
}

export async function postSingleImage(imageUrl: string, caption: string): Promise<IgPublishResult> {
  const container = await igPost<{ id: string }>(`/${userId()}/media`, {
    image_url: imageUrl,
    caption,
    access_token: token(),
  });
  await waitForContainerReady(container.id);
  const published = await igPost<{ id: string }>(`/${userId()}/media_publish`, {
    creation_id: container.id,
    access_token: token(),
  });
  return { mediaId: published.id, containerId: container.id };
}

export async function postCarousel(imageUrls: string[], caption: string): Promise<IgPublishResult> {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error(`Instagram carousels require 2-10 images, got ${imageUrls.length}`);
  }
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const item = await igPost<{ id: string }>(`/${userId()}/media`, {
      image_url: url,
      is_carousel_item: "true",
      access_token: token(),
    });
    await waitForContainerReady(item.id);
    childIds.push(item.id);
  }
  const container = await igPost<{ id: string }>(`/${userId()}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
    access_token: token(),
  });
  await waitForContainerReady(container.id);
  const published = await igPost<{ id: string }>(`/${userId()}/media_publish`, {
    creation_id: container.id,
    access_token: token(),
  });
  return { mediaId: published.id, containerId: container.id };
}

export async function postReel(videoUrl: string, caption: string): Promise<IgPublishResult> {
  const container = await igPost<{ id: string }>(`/${userId()}/media`, {
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: token(),
  });
  await waitForContainerReady(container.id, 300);
  const published = await igPost<{ id: string }>(`/${userId()}/media_publish`, {
    creation_id: container.id,
    access_token: token(),
  });
  return { mediaId: published.id, containerId: container.id };
}

export interface FbPagePostResult {
  postId: string;
}

export async function postToFacebookPage(
  imageUrl: string,
  caption: string,
): Promise<FbPagePostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !pageToken) {
    throw new Error("FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be set for FB cross-post");
  }
  const body = new URLSearchParams({
    url: imageUrl,
    caption,
    access_token: pageToken,
  }).toString();
  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook page post failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { post_id?: string; id: string };
  return { postId: json.post_id ?? json.id };
}
