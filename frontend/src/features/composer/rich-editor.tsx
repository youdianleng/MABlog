"use client";
import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { uploadMedia, Block } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useAccount } from "@/features/auth/account-context";
import { useEditorSynchronization } from "./use-editor-synchronization";

const UploadedVideo = Node.create({
  name: "uploadedVideo",
  group: "block",
  atom: true,
  /** Store only the source; playback always requires the reader's action. */
  addAttributes() {
    return { src: { default: null } };
  },
  /** Recognize uploaded video elements when restoring a saved mixed-content block. */
  parseHTML() {
    return [{ tag: "video" }];
  },
  /** Render a browser-native video player without autoplay. */
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: true })];
  },
});
const EmbeddedVideo = Node.create({
  name: "embeddedVideo",
  group: "block",
  atom: true,
  /** Retain the normalized YouTube/Vimeo embed URL. */
  addAttributes() {
    return { src: { default: null } };
  },
  /** Restore provider embeds when opening a saved block. */
  parseHTML() {
    return [{ tag: "iframe" }];
  },
  /** Render the provider player; the backend independently validates its origin. */
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        allowfullscreen: true,
        title: "Video",
      }),
    ];
  },
});

/** Normalize supported watch URLs into a restricted embed URL without fetching remote content. */
function embedSource(raw: string) {
  try {
    const url = new URL(raw);
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(url.hostname)
    ) {
      const id =
        url.hostname === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") || url.pathname.split("/").pop();
      if (id && /^[\w-]{6,30}$/.test(id))
        return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (
      ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)
    ) {
      const id = url.pathname.split("/").pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* Invalid or unsupported URLs remain ordinary links instead of embeds. */
  }
  return null;
}

/** Provide rich text and mixed image/video insertion inside one selected canvas block. */
export function RichEditor({
  block,
  postId,
  onChange,
}: {
  block: Block;
  postId: string;
  onChange: (html: string) => void;
}) {
  const { t } = useLanguage(),
    { run } = useAccount();
  const input = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [StarterKit, ImageExtension, UploadedVideo, EmbeddedVideo],
    content: block.html,
    immediatelyRender: false,
    /** Keep the working composition synchronized with visual text edits. */
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });
  useEditorSynchronization(editor, block.html);
  if (!editor) return null;
  /** Upload selected media and insert a native node at the current writing selection. */
  async function insertFile(file: File) {
    const media = await uploadMedia(file, postId);
    if (media.mime.startsWith("image/"))
      editor!.chain().focus().setImage({ src: media.url }).run();
    else
      editor!
        .chain()
        .focus()
        .insertContent({ type: "uploadedVideo", attrs: { src: media.url } })
        .run();
  }
  return (
    <>
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={
            /** Toggle bold formatting at the current selection. */ function bold() {
              editor.chain().focus().toggleBold().run();
            }
          }
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={
            /** Toggle italic formatting at the current selection. */ function italic() {
              editor.chain().focus().toggleItalic().run();
            }
          }
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={
            /** Toggle a level-two heading in the selected block. */ function heading() {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }
          }
        >
          H2
        </button>
        <button
          type="button"
          onClick={
            /** Toggle a bulleted list at the current writing selection. */ function list() {
              editor.chain().focus().toggleBulletList().run();
            }
          }
        >
          {t("List", "Lista")}
        </button>
        <button
          type="button"
          onClick={
            /** Insert a validated web or email link at the selection. */ function link() {
              const href = prompt(
                t("Link URL (https://…)", "URL del enlace (https://…)"),
              );
              if (href && /^(https?:\/\/|mailto:)/.test(href))
                editor.chain().focus().setLink({ href }).run();
            }
          }
        >
          {t("Link", "Enlace")}
        </button>
        <button
          type="button"
          onClick={
            /** Open the image or video file picker. */ function media() {
              input.current?.click();
            }
          }
        >
          {t("Image / video", "Imagen / vídeo")}
        </button>
        <button
          type="button"
          onClick={
            /** Normalize a supported video URL before inserting an embed node. */ function embed() {
              const raw = prompt(
                t("YouTube or Vimeo URL", "URL de YouTube o Vimeo"),
              );
              if (!raw) return;
              const src = embedSource(raw);
              if (src)
                editor
                  .chain()
                  .focus()
                  .insertContent({ type: "embeddedVideo", attrs: { src } })
                  .run();
              else
                alert(
                  t(
                    "Use a YouTube or Vimeo URL; other URLs can be inserted as links.",
                    "Usa una URL de YouTube o Vimeo; las demás se pueden añadir como enlaces.",
                  ),
                );
            }
          }
        >
          {t("Embed", "Insertar vídeo")}
        </button>
      </div>
      <input
        hidden
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
        onChange={
          /** Read the selected media file and reset the picker for reuse. */ function fileSelected(
            event,
          ) {
            const file = event.target.files?.[0];
            if (file)
              void run(
                /** Upload and insert the chosen media in the selected block. */ async function insertUpload() {
                  await insertFile(file);
                },
              );
            event.target.value = "";
          }
        }
      />
      <EditorContent editor={editor} className="rich-content" />
    </>
  );
}
