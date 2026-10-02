import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isModelFileName,
  type ModelFile,
  ModelFileError,
  parseModelFile,
  parseRankings,
} from "./ai-model-files";
import { type AiModelsData, buildAiModelsData } from "./ai-models-data";

/**
 * Server-only loader for `frontend/content/ai-models/` (copied next to the standalone server in
 * the Docker image). Import it only from route files, never from client components.
 */

// The content folder sits at the app root both in development and in the standalone image.
const CONTENT_DIRECTORY = join(process.cwd(), "content", "ai-models");

/**
 * Read every model file and `rankings.yaml`, then build the page data.
 *
 * A malformed model file is logged and skipped so one bad draft cannot take the page down; drafts
 * are ignored by the merge anyway. A malformed `rankings.yaml` throws, because the page cannot
 * choose an order without it. The files are small (about 45), so they are read per request; this
 * also lets approvals from the admin review page (Compose bind-mounts this folder) show without a
 * rebuild.
 */
export function loadAiModelsData(): AiModelsData {
  const files: ModelFile[] = [];
  for (const name of readdirSync(CONTENT_DIRECTORY)) {
    if (!isModelFileName(name)) continue;
    try {
      files.push(parseModelFile(readFileSync(join(CONTENT_DIRECTORY, name), "utf8"), name));
    } catch (error) {
      if (!(error instanceof ModelFileError)) throw error;
      console.error(`Skipping invalid AI model file: ${error.message}`);
    }
  }
  const rankings = parseRankings(readFileSync(join(CONTENT_DIRECTORY, "rankings.yaml"), "utf8"));
  return buildAiModelsData(files, rankings);
}
