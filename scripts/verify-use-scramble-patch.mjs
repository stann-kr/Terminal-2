import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const patchedFiles = [
  "dist/use-scramble.cjs.development.js",
  "dist/use-scramble.cjs.production.min.js",
  "dist/use-scramble.esm.js",
];
const failures = [];

for (const relativePath of patchedFiles) {
  const filePath = path.join(projectRoot, "node_modules", "use-scramble", relativePath);

  try {
    await access(filePath);
    const source = await readFile(filePath, "utf8");

    if (source.includes(".innerHTML=") || source.includes(".innerHTML =")) {
      failures.push(`${relativePath} still assigns to innerHTML`);
    }

    if (!source.includes(".textContent=") && !source.includes(".textContent =")) {
      failures.push(`${relativePath} does not assign to textContent`);
    }
  } catch (error) {
    failures.push(`${relativePath} could not be verified: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error("use-scramble security patch verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("use-scramble security patch verified.");
