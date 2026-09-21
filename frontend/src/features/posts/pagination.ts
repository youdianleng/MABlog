/** Fifteen cards fill five desktop rows without creating an unwieldy result page. */
export const PUBLIC_POST_PAGE_SIZE = 15;

/** Normalize an untrusted URL page value to a positive one-based page number. */
export function parsePublicPostPage(value: string | string[] | undefined): number {
  const requested = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(requested) && requested > 0 ? requested : 1;
}
