"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchModelReviewFolder, type ModelReviewFile } from "@/lib/api";
import {
  LEADERBOARDS,
  type ModelFile,
  parseModelFile,
  parseRankings,
} from "@/features/site-info/ai-model-files";
import type { RankingCategory } from "@/features/site-info/ai-model-rankings";

/** One file on the review page: its stored record, the parsed result, and its ranking places. */
export type ReviewEntry = {
  record: ModelReviewFile;
  /** Null when the file breaks the format; `error` then says why (it cannot be approved). */
  parsed: ModelFile | null;
  error: string;
  /** Leaderboards in `rankings.yaml` that list this slug, with the 1-based position. */
  placements: { leaderboard: RankingCategory; position: number }[];
};

/** Parse one stored file with the same validator the public page uses. */
function toEntry(
  record: ModelReviewFile,
  places: Map<string, ReviewEntry["placements"]>,
): ReviewEntry {
  try {
    const parsed = parseModelFile(record.text, record.name);
    return { record, parsed, error: "", placements: places.get(parsed.slug) ?? [] };
  } catch (error) {
    return { record, parsed: null, error: (error as Error).message, placements: [] };
  }
}

/** Index `rankings.yaml` by slug; an unreadable rankings file simply yields no placements. */
function placementsBySlug(text: string): Map<string, ReviewEntry["placements"]> {
  const places = new Map<string, ReviewEntry["placements"]>();
  try {
    const rankings = parseRankings(text);
    for (const leaderboard of LEADERBOARDS)
      rankings.leaderboards[leaderboard].forEach(
        /** Record one ranked slug and its position. */ (entry, index) => {
          places.set(entry.slug, [
            ...(places.get(entry.slug) ?? []),
            { leaderboard, position: index + 1 },
          ]);
        },
      );
  } catch {
    // The public page reports a broken rankings file; review still works without placements.
  }
  return places;
}

/**
 * Load every model file for the admin review page and keep it current after approvals.
 *
 * @returns the parsed entries (sorted drafts first, newest release first), a load error, a
 * `reload` function, and `replace` to swap in the record the server returned after an action.
 */
export function useModelReviewFolder() {
  const [records, setRecords] = useState<ModelReviewFile[] | null>(null);
  const [rankings, setRankings] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(
    /** Fetch the folder whenever the page asks for a reload; ignore obsolete responses. */
    function load() {
      let live = true;
      setError("");
      fetchModelReviewFolder()
        .then(
          /** Keep the stored records and rankings for parsing. */ function loaded(folder) {
            if (!live) return;
            setRecords(folder.files);
            setRankings(folder.rankings);
          },
        )
        .catch(
          /** Show why the folder could not be read (for example 403 or 503). */ function failed(
            reason,
          ) {
            if (live) setError(reason instanceof Error ? reason.message : String(reason));
          },
        );
      return /** Prevent a late response from overwriting newer state. */ function cleanup() {
        live = false;
      };
    },
    [revision],
  );

  const entries = useMemo(
    /** Parse records once per change, drafts first, then by release date (newest first). */ () => {
      if (!records) return null;
      const places = placementsBySlug(rankings);
      return records
        .map(/** Parse one record. */ (record) => toEntry(record, places))
        .sort(
          /** Drafts before reviewed files; within each, newest dated release first. */ (a, b) => {
            const draftOrder =
              Number(a.parsed?.reviewed ?? false) - Number(b.parsed?.reviewed ?? false);
            if (draftOrder !== 0) return draftOrder;
            return (b.parsed?.releaseDate ?? "").localeCompare(a.parsed?.releaseDate ?? "");
          },
        );
    },
    [records, rankings],
  );

  const reload = useCallback(
    /** Fetch the folder again. */ () => setRevision((value) => value + 1),
    [],
  );
  const replace = useCallback(
    /** Swap one record for the version the server returned after approving or returning it. */
    (updated: ModelReviewFile) =>
      setRecords(
        /** Replace by file name, keeping the order stable. */ (current) =>
          current?.map(
            /** Keep other records unchanged. */ (record) =>
              record.name === updated.name ? updated : record,
          ) ?? current,
      ),
    [],
  );

  return { entries, error, reload, replace };
}
