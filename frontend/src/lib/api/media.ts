import { api } from "./client";

/** Upload media within a post permission boundary or the current user's profile. */
export async function uploadMedia(file: File, postId?: string): Promise<{ url: string; mime: string }> {
  const form = new FormData();
  form.append("file", file);
  return api(`/uploads${postId ? `?post_id=${encodeURIComponent(postId)}` : ""}`, "POST", form);
}
