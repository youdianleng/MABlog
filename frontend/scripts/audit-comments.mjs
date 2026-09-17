/** Check that project-owned TypeScript functions and callbacks carry an explanatory comment. */
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { parse } = require("next/dist/compiled/babel/parser");
const frontendDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const scanDirectories = [join(frontendDirectory, "src"), join(frontendDirectory, "tests")];
const missing = [];
const functionTypes = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ObjectMethod", "ClassMethod"]);

/** Collect TypeScript source paths without entering generated or dependency directories. */
function sourceFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...sourceFiles(path));
    else if ([".ts", ".tsx"].includes(extname(entry.name)) && !entry.name.endsWith(".d.ts")) result.push(path);
  }
  return result;
}

/** Accept documentation attached directly to a function or its closest declaration wrappers. */
function hasLeadingComment(node, ancestors, text) {
  const candidates = [node];
  for (let index = ancestors.length - 1; index >= 0 && candidates.length < 4; index -= 1) {
    candidates.push(ancestors[index]);
  }
  for (const candidate of candidates) {
    if (candidate.leadingComments?.length) return true;
  }
  const nearby = text.slice(Math.max(0, node.start - 400), node.start);
  return /\/\*\*[\s\S]*?\*\/\s*$/.test(nearby) || /\/\/[^\n]*\s*$/.test(nearby);
}

/** Report every function-like node whose closest leading text has no explanatory comment. */
function auditFile(path) {
  const text = readFileSync(path, "utf8");
  const source = parse(text, { sourceType: "module", plugins: ["typescript", "jsx"] });
  /** Recursively inspect declarations, expressions, methods, and inline callbacks. */
  function visit(node, ancestors = []) {
    if (!node || typeof node !== "object") return;
    if (functionTypes.has(node.type) && !hasLeadingComment(node, ancestors, text)) {
      missing.push(`${relative(frontendDirectory, path)}:${node.loc?.start.line ?? 0}`);
    }
    const nextAncestors = [...ancestors, node];
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) visit(child, nextAncestors);
      } else if (value && typeof value === "object" && typeof value.type === "string") {
        visit(value, nextAncestors);
      }
    }
  }
  visit(source.program);
}

for (const directory of scanDirectories) {
  for (const path of sourceFiles(directory)) auditFile(path);
}
if (missing.length) {
  console.error(`Functions without comments:\n${missing.join("\n")}`);
  process.exit(1);
}
console.log("All project TypeScript functions and callbacks have comments.");
