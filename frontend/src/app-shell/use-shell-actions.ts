"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAccount } from "@/features/auth/account-context";

/**
 * Account actions shared by the header bar and the side menu.
 *
 * Both run through the account context's `run`, which shows request errors (for example the
 * sign-in prompt when an anonymous visitor presses Write) in the shared feedback UI.
 */
export function useShellActions() {
  const router = useRouter();
  const { run, refresh } = useAccount();

  /** Create a personal post and open its freeform composer; requires a signed-in account. */
  function writePost(): void {
    void run(
      /** Create the post, then navigate to the composer. */ async function createPost() {
        const post = await api<{ id: string }>("/posts", "POST");
        router.push("/compose/" + post.id);
      },
    );
  }

  /** Revoke the current session, refresh account state, and return home. */
  function signOut(): void {
    void run(
      /** End the session and refresh account state. */ async function endSession() {
        await api("/auth/logout", "POST");
        await refresh();
        router.push("/");
      },
    );
  }

  return { writePost, signOut };
}
