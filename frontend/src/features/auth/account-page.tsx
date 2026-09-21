"use client";
import { AccountForm } from "./account-form";
import { useAccount } from "./account-context";
import { AuthenticatedAccountCard } from "./authenticated-account-card";

/** Show the account form to visitors and the atelier shortcut to signed-in members. */
export function AccountPage() {
  const { user, refresh } = useAccount();
  return user ? <AuthenticatedAccountCard /> : <AccountForm onSuccess={refresh} />;
}
