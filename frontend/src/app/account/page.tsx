import type { Metadata } from "next";
import { AccountPage } from "@/features/auth/account-page";

export const metadata: Metadata = { title: "Sign in" };

/** Render login, registration, verification, and account recovery. */
export default function AccountRoute() {
  return <AccountPage />;
}
