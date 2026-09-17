"use client";
import { AccountForm } from "./account-form";
import { useAccount } from "./account-context";

/** Connect the account form to the application-wide session refresh action. */
export function AccountPage() {
  const { refresh } = useAccount();
  return <AccountForm onSuccess={refresh} />;
}
