import { Profile } from "@/lib/api";

/** Render an uploaded avatar or a readable initial when none has been selected. */
export function Avatar({ user }: { user: Profile }) {
  return user.avatar ? (
    <img className="avatar" src={user.avatar} alt="" />
  ) : (
    <span className="avatar">
      {(user.display_name || user.username).slice(0, 1).toUpperCase()}
    </span>
  );
}
