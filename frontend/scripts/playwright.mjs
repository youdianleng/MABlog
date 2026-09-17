/** Keep large browser binaries and downloads on the project drive instead of the constrained system drive. */
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..", "..");
const browserDirectory = resolve(projectDirectory, ".playwright-browsers");
const temporaryDirectory = resolve(projectDirectory, ".playwright-temp");
mkdirSync(browserDirectory, { recursive: true });
mkdirSync(temporaryDirectory, { recursive: true });

const environment = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: browserDirectory,
  TEMP: temporaryDirectory,
  TMP: temporaryDirectory,
};
const require = createRequire(import.meta.url);
const playwrightCli = resolve(dirname(require.resolve("playwright")), "cli.js");
const result = spawnSync(process.execPath, [playwrightCli, ...process.argv.slice(2)], {
  cwd: resolve(projectDirectory, "frontend"),
  env: environment,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
