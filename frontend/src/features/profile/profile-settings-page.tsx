"use client";
import Link from "next/link";
import { api, uploadMedia } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useAccount } from "@/features/auth/account-context";
import { Avatar } from "@/features/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Edit the signed-in account's public profile and uploaded avatar. */
export function ProfileSettings() {
  const { user, run, refresh } = useAccount(),
    { t } = useLanguage();
  if (!user)
    return (
      <Link href="/account">
        {t("Sign in to edit your profile", "Entra para editar tu perfil")}
      </Link>
    );
  return (
    <form
      key={user.id + user.avatar}
      className="form-panel stack"
      onSubmit={
        /** Collect public profile fields for saving. */ function save(event) {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void run(
            /** Persist profile details and refresh the account display. */ async function saveProfile() {
              await api("/profile", "PATCH", {
                display_name: form.get("display_name"),
                bio: form.get("bio"),
              });
              await refresh();
            },
          );
        }
      }
    >
      <h1>{t("Your profile", "Tu perfil")}</h1>
      <Avatar user={user} />
      <label>
        {t("Avatar image", "Imagen de perfil")}
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={
            /** Read the selected avatar file for upload. */ function avatar(
              event,
            ) {
              const file = event.target.files?.[0];
              if (file)
                void run(
                  /** Upload the avatar before assigning its protected media URL. */ async function uploadAvatar() {
                    const media = await uploadMedia(file);
                    await api("/profile", "PATCH", { avatar: media.url });
                    await refresh();
                  },
                );
            }
          }
        />
      </label>
      <label>
        {t("Display name", "Nombre visible")}
        <Input
          name="display_name"
          defaultValue={user.display_name}
          maxLength={80}
        />
      </label>
      <label>
        {t("Biography", "Biografía")}
        <Textarea name="bio" defaultValue={user.bio} maxLength={600} />
      </label>
      <fieldset className="cloud-consent-panel">
        <legend>{t("Personal AI search", "Búsqueda personal con IA")}</legend>
        <label className="cloud-consent-toggle">
          <input
            type="checkbox"
            checked={Boolean(user.personal_cloud_processing)}
            onChange={
              /** Persist explicit consent and refresh every affected personal search index. */
              function changeCloudConsent(event) {
                const enabled = event.target.checked;
                void run(
                  /** Save the setting on the account and refresh the authenticated profile. */
                  async function saveCloudConsent() {
                    await api("/profile/cloud-processing", "PATCH", { enabled });
                    await refresh();
                  },
                );
              }
            }
          />
          <span>{t("Enable cloud semantic search for personal posts", "Activar búsqueda semántica en la nube para publicaciones personales")}</span>
        </label>
        <p>{t(
          "When enabled, approved text from personal posts you create may be sent to OpenAI for embeddings. Your search question and authorized personal passages may also be sent when producing semantic results and explanations. A shared personal post uses AI only when both its author and the searcher enable this setting. OpenAI API data is not used for training unless the API account opts in; standard abuse-monitoring data may be retained for up to 30 days. Turning this off removes your personal-post vectors. Permission-safe keyword search remains available.",
          "Al activarla, el texto aprobado de las publicaciones personales que creas puede enviarse a OpenAI para crear representaciones. Tu pregunta de búsqueda y los fragmentos personales autorizados también pueden enviarse para producir resultados semánticos y explicaciones. Una publicación personal compartida usa IA solo si su autor y quien busca activan esta opción. Los datos de la API de OpenAI no se usan para entrenamiento salvo que la cuenta API lo autorice; los datos estándar de control de abuso pueden conservarse hasta 30 días. Al desactivarla se eliminan los vectores de tus publicaciones personales. La búsqueda segura por palabras sigue disponible.",
        )}</p>
      </fieldset>
      <Button type="submit">{t("Save profile", "Guardar perfil")}</Button>
      <Link href={`/profiles/${user.username}`}>
        {t("View public profile", "Ver perfil público")} ↗
      </Link>
    </form>
  );
}
