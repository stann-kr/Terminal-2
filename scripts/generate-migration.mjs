import { createHash, randomUUID } from "node:crypto";
import {
  access,
  cp,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  checkMigrationHistory,
  createMigrationLockManifest,
  DEFAULT_LOCK_PATH,
  DEFAULT_MIGRATIONS_DIR,
  inspectMigrationHistory,
  MigrationHistoryError,
  PROJECT_ROOT,
  writeMigrationLockManifest,
} from "./check-migration-history.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const SAFE_NAME_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const JOURNAL_PATH = "meta/_journal.json";

/**
 * @typedef {object} DrizzleGenerateOptions
 * @property {string} name
 * @property {string} outDir
 * @property {string} projectRoot
 */

/**
 * @typedef {object} GenerateMigrationOptions
 * @property {string} name
 * @property {string} [lockPath]
 * @property {string} [migrationsDir]
 * @property {string} [projectRoot]
 * @property {(options: DrizzleGenerateOptions) => Promise<void>} [runGenerator]
 */

function fail(message) {
  throw new MigrationHistoryError(message);
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

export function parseMigrationName(argv) {
  let name;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    let value;

    if (argument === "--name") {
      value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        fail("--name requires a value");
      }
      index += 1;
    } else if (argument.startsWith("--name=")) {
      value = argument.slice("--name=".length);
    } else {
      fail(
        `unsupported argument: ${argument}. Use npm run db:generate -- --name <safe_name>`,
      );
    }

    if (name !== undefined) {
      fail("--name must be provided exactly once");
    }
    name = value;
  }

  if (name === undefined) {
    fail("an explicit --name is required");
  }
  if (name.length > 64 || !SAFE_NAME_PATTERN.test(name)) {
    fail(
      "--name must be 1-64 lowercase snake_case characters, start with a letter, and contain no path separators",
    );
  }

  return name;
}

export function getExpectedMigrationTag(history, name) {
  const index = history.migrations.length;
  if (index > 9999) {
    fail("migration history exceeds the supported four-digit prefix range");
  }

  return `${String(index).padStart(4, "0")}_${name}`;
}

async function captureMigrationTree(directoryPath, relativeDirectory = "") {
  const absoluteDirectory = path.join(directoryPath, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const tree = new Map();

  for (const entry of entries) {
    const relativePath = path.posix.join(
      relativeDirectory.split(path.sep).join("/"),
      entry.name,
    );
    const absolutePath = path.join(directoryPath, ...relativePath.split("/"));

    if (entry.isDirectory()) {
      const childTree = await captureMigrationTree(directoryPath, relativePath);
      for (const [childPath, childValue] of childTree) {
        tree.set(childPath, childValue);
      }
      continue;
    }

    if (!entry.isFile()) {
      fail(`migration tree contains an unsupported entry: ${relativePath}`);
    }

    const contents = await readFile(absolutePath);
    tree.set(relativePath, { contents, sha256: sha256(contents) });
  }

  return tree;
}

function treeDifferences(beforeTree, afterTree) {
  const added = [...afterTree.keys()].filter((key) => !beforeTree.has(key));
  const deleted = [...beforeTree.keys()].filter((key) => !afterTree.has(key));
  const changed = [...beforeTree.keys()].filter(
    (key) =>
      afterTree.has(key) &&
      beforeTree.get(key).sha256 !== afterTree.get(key).sha256,
  );

  added.sort();
  deleted.sort();
  changed.sort();

  return { added, changed, deleted };
}

export function validateGeneratedMigrationDelta(
  beforeTree,
  afterTree,
  expectedTag,
) {
  const prefix = expectedTag.slice(0, 4);
  const expectedAdded = [
    `${expectedTag}.sql`,
    `meta/${prefix}_snapshot.json`,
  ].sort();
  const differences = treeDifferences(beforeTree, afterTree);

  if (differences.deleted.length > 0) {
    fail(
      `migration generation deleted existing files: ${differences.deleted.join(", ")}`,
    );
  }

  const forbiddenChanges = differences.changed.filter(
    (filePath) => filePath !== JOURNAL_PATH,
  );
  if (forbiddenChanges.length > 0) {
    fail(
      `migration generation changed immutable files: ${forbiddenChanges.join(", ")}`,
    );
  }
  if (!differences.changed.includes(JOURNAL_PATH)) {
    fail("migration generation did not update meta/_journal.json");
  }

  if (
    differences.added.length !== expectedAdded.length ||
    differences.added.some(
      (filePath, index) => filePath !== expectedAdded[index],
    )
  ) {
    fail(
      `migration generation may add only ${expectedAdded.join(" and ")}; found ${differences.added.join(", ") || "no new files"}`,
    );
  }

  return differences;
}

function assertTreesMatch(beforeTree, afterTree) {
  const differences = treeDifferences(beforeTree, afterTree);

  if (
    differences.added.length ||
    differences.deleted.length ||
    differences.changed.length
  ) {
    const details = [
      differences.added.length
        ? `added: ${differences.added.join(", ")}`
        : null,
      differences.deleted.length
        ? `deleted: ${differences.deleted.join(", ")}`
        : null,
      differences.changed.length
        ? `changed: ${differences.changed.join(", ")}`
        : null,
    ].filter(Boolean);
    fail(
      `migration history changed while generation was staged (${details.join("; ")})`,
    );
  }
}

async function runDrizzleGenerate({ name, outDir, projectRoot }) {
  const drizzleBin = path.join(projectRoot, "node_modules", "drizzle-kit", "bin.cjs");
  const schemaPath = path.join(projectRoot, "lib", "db", "schema.ts");
  const generationRoot = path.dirname(outDir);
  const stagedOut = `./${path.basename(outDir)}`;

  try {
    await access(drizzleBin);
  } catch {
    fail("drizzle-kit is not installed; run npm ci before db:generate");
  }

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        drizzleBin,
        "generate",
        "--dialect",
        "sqlite",
        "--schema",
        schemaPath,
        "--out",
        stagedOut,
        "--name",
        name,
      ],
      {
        cwd: generationRoot,
        stdio: "inherit",
      },
    );

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new MigrationHistoryError(
          signal
            ? `drizzle-kit generate terminated by ${signal}`
            : `drizzle-kit generate exited with code ${String(code)}`,
        ),
      );
    });
  });
}

async function replaceFileAtomically(filePath, contents) {
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  );

  await writeFile(temporaryPath, contents, { flag: "wx", mode: 0o644 });
  try {
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function removeIfUnchanged(filePath, expectedSha) {
  try {
    const contents = await readFile(filePath);
    if (sha256(contents) !== expectedSha) return false;
    await unlink(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return true;
    throw error;
  }
}

async function commitStagedMigration({
  beforeTree,
  expectedTag,
  lockPath,
  migrationsDir,
  projectRoot,
  stagedTree,
}) {
  const prefix = expectedTag.slice(0, 4);
  const newSqlPath = `${expectedTag}.sql`;
  const newSnapshotPath = `meta/${prefix}_snapshot.json`;
  const targets = [newSqlPath, newSnapshotPath];
  let journalWritten = false;
  const writtenTargets = [];

  try {
    for (const relativePath of targets) {
      const destination = path.join(migrationsDir, ...relativePath.split("/"));
      await writeFile(destination, stagedTree.get(relativePath).contents, {
        flag: "wx",
        mode: 0o644,
      });
      writtenTargets.push(relativePath);
    }

    await replaceFileAtomically(
      path.join(migrationsDir, ...JOURNAL_PATH.split("/")),
      stagedTree.get(JOURNAL_PATH).contents,
    );
    journalWritten = true;

    const history = await inspectMigrationHistory({
      migrationsDir,
      repoRoot: projectRoot,
    });
    if (
      history.migrations.at(-1)?.tag !== expectedTag ||
      history.migrations.length !==
        [...beforeTree.keys()].filter((filePath) => filePath.endsWith(".sql"))
          .length +
          1
    ) {
      fail(`generated migration did not become the expected next tag ${expectedTag}`);
    }

    const manifest = await createMigrationLockManifest(history, {
      repoRoot: projectRoot,
    });
    await writeMigrationLockManifest(lockPath, manifest, { overwrite: true });
  } catch (error) {
    const rollbackFailures = [];

    if (journalWritten) {
      try {
        const currentJournal = await readFile(
          path.join(migrationsDir, ...JOURNAL_PATH.split("/")),
        );
        if (sha256(currentJournal) === stagedTree.get(JOURNAL_PATH).sha256) {
          await replaceFileAtomically(
            path.join(migrationsDir, ...JOURNAL_PATH.split("/")),
            beforeTree.get(JOURNAL_PATH).contents,
          );
        } else {
          rollbackFailures.push(`${JOURNAL_PATH} changed concurrently`);
        }
      } catch (rollbackError) {
        rollbackFailures.push(`${JOURNAL_PATH}: ${rollbackError.message}`);
      }
    }

    for (const relativePath of writtenTargets.reverse()) {
      try {
        const removed = await removeIfUnchanged(
          path.join(migrationsDir, ...relativePath.split("/")),
          stagedTree.get(relativePath).sha256,
        );
        if (!removed) rollbackFailures.push(`${relativePath} changed concurrently`);
      } catch (rollbackError) {
        rollbackFailures.push(`${relativePath}: ${rollbackError.message}`);
      }
    }

    if (rollbackFailures.length > 0) {
      error.message = `${error.message}; automatic rollback was incomplete (${rollbackFailures.join("; ")})`;
    }
    throw error;
  }
}

/**
 * @param {GenerateMigrationOptions} [options]
 */
export async function generateMigration({
  name,
  lockPath = DEFAULT_LOCK_PATH,
  migrationsDir = DEFAULT_MIGRATIONS_DIR,
  projectRoot = PROJECT_ROOT,
  runGenerator = runDrizzleGenerate,
} = {}) {
  if (typeof name !== "string" || name.length > 64 || !SAFE_NAME_PATTERN.test(name)) {
    fail("generateMigration requires a safe lowercase snake_case name");
  }

  const { history } = await checkMigrationHistory({
    lockPath,
    migrationsDir,
    repoRoot: projectRoot,
  });
  const expectedTag = getExpectedMigrationTag(history, name);
  const beforeTree = await captureMigrationTree(migrationsDir);
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "terminal-2-migration-"),
  );
  const stagedMigrationsDir = path.join(temporaryRoot, "migrations");

  try {
    await cp(migrationsDir, stagedMigrationsDir, {
      errorOnExist: true,
      recursive: true,
    });
    const stagedBeforeTree = await captureMigrationTree(stagedMigrationsDir);
    assertTreesMatch(beforeTree, stagedBeforeTree);

    await runGenerator({
      name,
      outDir: stagedMigrationsDir,
      projectRoot,
    });

    const stagedAfterTree = await captureMigrationTree(stagedMigrationsDir);
    validateGeneratedMigrationDelta(
      stagedBeforeTree,
      stagedAfterTree,
      expectedTag,
    );
    const stagedHistory = await inspectMigrationHistory({
      migrationsDir: stagedMigrationsDir,
      repoRoot: temporaryRoot,
    });
    if (
      stagedHistory.migrations.length !== history.migrations.length + 1 ||
      stagedHistory.migrations.at(-1)?.tag !== expectedTag
    ) {
      fail(`drizzle-kit did not generate the expected next tag ${expectedTag}`);
    }

    await checkMigrationHistory({
      lockPath,
      migrationsDir,
      repoRoot: projectRoot,
    });
    const currentTree = await captureMigrationTree(migrationsDir);
    assertTreesMatch(beforeTree, currentTree);

    await commitStagedMigration({
      beforeTree,
      expectedTag,
      lockPath,
      migrationsDir,
      projectRoot,
      stagedTree: stagedAfterTree,
    });

    return expectedTag;
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

async function main() {
  const name = parseMigrationName(process.argv.slice(2));
  const tag = await generateMigration({ name });
  console.log(`Migration generated and history lock updated: ${tag}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(`Migration generation failed: ${error.message}`);
    console.error(
      "Do not run drizzle-kit generate directly; fix the reported history issue and retry npm run db:generate -- --name <safe_name>.",
    );
    process.exitCode = 1;
  });
}
