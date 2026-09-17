"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { useAccount } from "@/features/auth/account-context";
import { Loading } from "@/components/feedback/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Grant and revoke registered-email permissions on a single creator-owned post. */
export function Sharing({ id }: { id: string }) {
  const { t } = useLanguage(),
    { run } = useAccount();
  const [revision, setRevision] = useState(0),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("viewer");
  const { data, error } = useData<
    { user_id: string; email: string; role: string }[]
  >(`/posts/${id}/grants`, revision);
  return (
    <div className="stack">
      <Link href={`/posts/${id}`}>
        ← {t("Back to post", "Volver a la publicación")}
      </Link>
      <h1 className="text-4xl">
        {t("Invite a collaborator", "Invita a un colaborador")}
      </h1>
      <p>
        {t(
          "Permissions apply only to this post. Editing changes are reviewed by its creator.",
          "Los permisos se aplican solo a esta publicación. Su creador revisa los cambios.",
        )}
      </p>
      <form
        className="toolbar"
        onSubmit={
          /** Submit the registered-email access form. */ function invite(
            event,
          ) {
            event.preventDefault();
            void run(
              /** Save the post-specific grant and refresh the recipient list. */ async function grant() {
                await api(`/posts/${id}/grants`, "POST", { email, role });
                setEmail("");
                setRevision(revision + 1);
              },
            );
          }
        }
      >
        <Input
          style={{ maxWidth: 340 }}
          type="email"
          aria-label={t("Registered email", "Correo registrado")}
          placeholder={t("Registered email", "Correo registrado")}
          value={email}
          onChange={
            /** Capture the invited registered email address. */ function address(
              event,
            ) {
              setEmail(event.target.value);
            }
          }
          required
        />
        <select
          style={{ width: 170 }}
          value={role}
          onChange={
            /** Select view-only or editing permission. */ function permission(
              event,
            ) {
              setRole(event.target.value);
            }
          }
          aria-label={t("Permission", "Permiso")}
        >
          <option value="viewer">{t("View only", "Solo lectura")}</option>
          <option value="editor">{t("Can edit", "Puede editar")}</option>
        </select>
        <Button type="submit">{t("Grant access", "Dar acceso")}</Button>
      </form>
      {!data ? (
        <Loading error={error} />
      ) : (
        data.map(
          /** Render a registered recipient and their current access role. */ function recipient(
            grant,
          ) {
            return (
              <div className="notice toolbar" key={grant.user_id}>
                <span>
                  {grant.email} ·{" "}
                  {grant.role === "editor"
                    ? t("Editor", "Editor")
                    : t("Viewer", "Lector")}
                </span>
                <Button
                  variant="ghost"
                  onClick={
                    /** Run a creator-controlled access removal. */ function revoke() {
                      void run(
                        /** Revoke the recipient grant and refresh the list. */ async function removeGrant() {
                          await api(
                            `/posts/${id}/grants/${grant.user_id}`,
                            "DELETE",
                          );
                          setRevision(revision + 1);
                        },
                      );
                    }
                  }
                >
                  {t("Remove access", "Quitar acceso")}
                </Button>
              </div>
            );
          },
        )
      )}
    </div>
  );
}
