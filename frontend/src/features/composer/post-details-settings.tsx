import type { MutableRefObject } from "react";
import type { Composition, WorkingCopy } from "@/lib/api";
import { uploadMedia } from "@/lib/api";
import { categories, type PostCategory } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import type { Translator } from "./composer-settings-types";

interface PostDetailsSettingsProps {
  postId: string;
  t: Translator;
  current: Composition;
  change: (document: Composition) => void;
  run: (action: () => Promise<unknown>) => Promise<void>;
  workingRef: MutableRefObject<WorkingCopy | null>;
}

/** Render editable category, title, summary, and cover metadata. */
export function PostDetailsSettings({
  postId,
  t,
  current,
  change,
  run,
  workingRef,
}: PostDetailsSettingsProps) {
  return (
    <>
      <h3>{t("Post details", "Detalles de publicación")}</h3>
      <label>
        {t("Category", "Categoría")}
        <select
          aria-label={t("Category", "Categoría")}
          value={current.details.category || "general"}
          onChange={/** Store category in the private details draft. */ function selectCategory(event) {
            change({ ...current, details: { ...current.details, category: event.target.value as PostCategory } });
          }}
        >
          {categories.map(
            /** Localize each supported stored category. */
            function categoryOption(item) {
              return <option key={item.value} value={item.value}>{t(item.en, item.es)}</option>;
            },
          )}
        </select>
      </label>
      <label>
        {t("Title", "Título")}
        <Input
          value={current.details.title}
          maxLength={160}
          onChange={/** Update the working post title. */ function title(event) {
            change({ ...current, details: { ...current.details, title: event.target.value } });
          }}
        />
      </label>
      <label>
        {t("Summary", "Resumen")}
        <textarea
          value={current.details.summary}
          maxLength={600}
          onChange={/** Update the working post summary. */ function summary(event) {
            change({ ...current, details: { ...current.details, summary: event.target.value } });
          }}
        />
      </label>
      <label>
        {t("Cover image", "Imagen de portada")}
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={/** Read the selected cover image for upload. */ function cover(event) {
            const file = event.target.files?.[0];
            if (file) {
              void run(
                /** Upload the image before storing its post-owned media URL. */
                async function uploadCover() {
                  const media = await uploadMedia(file, postId);
                  const latest = workingRef.current!.document;
                  change({ ...latest, details: { ...latest.details, cover: media.url } });
                },
              );
            }
          }}
        />
      </label>
      {current.details.cover ? <img src={current.details.cover} alt={t("Cover preview", "Vista previa de portada")} /> : null}
    </>
  );
}
