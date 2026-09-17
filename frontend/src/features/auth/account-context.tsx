"use client";
import { createContext, useContext } from "react";
import { Profile } from "@/lib/api";

export type AccountAction = () => Promise<unknown>;
export type AccountContextValue = { user: Profile | null; run: (action: AccountAction) => Promise<void>; refresh: () => Promise<void> };
/** Provide a harmless action default before the account provider mounts. */
async function defaultRun() { /* Actual actions run inside the application provider. */ }
/** Provide a harmless refresh default before the account provider mounts. */
async function defaultRefresh() { /* The application provider fetches the current session. */ }
export const AccountContext = createContext<AccountContextValue>({ user: null, run: defaultRun, refresh: defaultRefresh });
/** Access the current account and shared error/session handling. */
export function useAccount() { return useContext(AccountContext); }
