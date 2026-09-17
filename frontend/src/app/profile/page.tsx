import type { Metadata } from "next";
import { ProfileSettings } from "@/features/profile/profile-settings-page";
export const metadata: Metadata = { title: "Profile settings" };
/** Render settings for the currently signed-in profile. */
export default function ProfileSettingsRoute() { return <ProfileSettings />; }
