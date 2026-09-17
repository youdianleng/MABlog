"use client";
import Link from "next/link";
import { useState } from "react";
import { api, Post, Proposal } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { useAccount } from "@/features/auth/account-context";
import { Loading } from "@/components/feedback/loading";
import { Button } from "@/components/ui/button";

/** Compare current approved targets with proposed alternatives before a creator chooses a winner. */
export function Review({ id }: { id: string }) {
  const { t } = useLanguage(),
    { run } = useAccount();
  const [revision, setRevision] = useState(0),
    proposals = useData<Proposal[]>(`/posts/${id}/proposals`, revision),
    post = useData<Post>(`/posts/${id}`, revision);
  if (!proposals.data || !post.data)
    return <Loading error={proposals.error || post.error} />;
  const current = post.data,
    groups = Array.from(
      new Set(
        proposals.data.map(
          /** Extract the independently reviewable proposal target. */ function target(
            p,
          ) {
            return p.target;
          },
        ),
      ),
    );
  /** Show rich content visually and geometry as readable fields for layout comparisons. */
  function preview(value: Proposal["value"]) {
    if (!value) return <p>{t("Remove this block", "Eliminar este bloque")}</p>;
    if ("html" in value)
      return (
        <>
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: value.html }}
          />
          <small>
            {value.width} × {value.height} · x {value.x}, y {value.y} ·{" "}
            {value.rotation}° · {t("Layer", "Capa")} {value.z}
          </small>
        </>
      );
    return (
      <dl>
        {Object.entries(value).map(
          /** Render a metadata or geometry field for comparison. */ function field([
            key,
            val,
          ]) {
            return (
              <div key={key}>
                <strong>{({category: t("Category", "Categoría"), title: t("Title", "Título"), summary: t("Summary", "Resumen"), cover: t("Cover", "Portada"), width: t("Width", "Ancho"), height: t("Height", "Alto")} as Record<string, string>)[key] || key}</strong>:{" "}
                {key === "cover" && val ? (
                  <img src={String(val)} alt="" style={{ maxWidth: 220 }} />
                ) : (
                  String(val)
                )}
              </div>
            );
          },
        )}
      </dl>
    );
  }
  return (
    <div className="stack">
      <Link href={`/posts/${id}`}>
        ← {t("Back to post", "Volver a la publicación")}
      </Link>
      <h1 className="text-4xl">
        {t("A conversation in revisions", "Una conversación entre versiones")}
      </h1>
      <p>
        {t(
          "Approve one alternative to reject competing changes to the same target. Other targets remain pending.",
          "Aprueba una alternativa para rechazar los cambios que compiten por el mismo elemento. Los demás siguen pendientes.",
        )}
      </p>
      {!groups.length && (
        <div className="empty">
          {t("No submitted changes yet", "Todavía no hay cambios enviados")}
        </div>
      )}
      {groups.map(
        /** Render the current version alongside proposals for one target. */ function group(
          target,
        ) {
          const approved =
            target === "details"
              ? current.document.details
              : target === "canvas"
                ? current.document.canvas
                : current.document.blocks.find(
                    /** Find the approved block with the same stable target identity. */ function match(
                      block,
                    ) {
                      return `block:${block.id}` === target;
                    },
                  ) || null;
          return (
            <section key={target}>
              <h2 className="text-2xl my-4">
                {target === "canvas"
                  ? t("Canvas layout", "Diseño del lienzo")
                  : target === "details"
                    ? t("Post details", "Detalles de publicación")
                    : `${t("Block", "Bloque")} ${target.slice(6, 14)}`}
              </h2>
              <div className="review-grid">
                <div className="review-card">
                  <strong>{t("Currently approved", "Versión aprobada")}</strong>
                  <div className="review-preview">{preview(approved)}</div>
                </div>
                {proposals
                  .data!.filter(
                    /** Select only proposals competing for this target. */ function sameTarget(
                      p,
                    ) {
                      return p.target === target;
                    },
                  )
                  .map(
                    /** Render one submitted alternative and its review status. */ function proposal(
                      p,
                    ) {
                      return (
                        <div className="review-card" key={p.id}>
                          <strong>{p.editor.display_name}</strong>
                          <small className="block">
                            {p.status === "pending"
                              ? t("Pending", "Pendiente")
                              : p.status === "approved"
                                ? t("Approved", "Aprobada")
                                : t("Rejected", "Rechazada")}
                          </small>
                          <div className="review-preview">
                            {preview(p.value)}
                          </div>
                          {p.status === "pending" &&
                            current.role === "author" && (
                              <div className="toolbar">
                                {["approve", "reject"].map(
                                  /** Render the approve or reject control. */ function action(
                                    action,
                                  ) {
                                    return (
                                      <Button
                                        key={action}
                                        variant={
                                          action === "approve"
                                            ? "default"
                                            : "outline"
                                        }
                                        onClick={
                                          /** Submit an explicit creator review decision. */ function decide() {
                                            void run(
                                              /** Apply the decision against the displayed revision and reload proposals. */ async function submitDecision() {
                                                await api(
                                                  `/posts/${id}/proposals/${p.id}`,
                                                  "POST",
                                                  {
                                                    action,
                                                    current_version:
                                                      p.current_version,
                                                  },
                                                );
                                                setRevision(revision + 1);
                                              },
                                            );
                                          }
                                        }
                                      >
                                        {action === "approve"
                                          ? t("Approve", "Aprobar")
                                          : t("Reject", "Rechazar")}
                                      </Button>
                                    );
                                  },
                                )}
                              </div>
                            )}
                        </div>
                      );
                    },
                  )}
              </div>
            </section>
          );
        },
      )}
    </div>
  );
}
