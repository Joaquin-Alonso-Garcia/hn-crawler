import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export default function setup(project: TestProject) {
  const databasePath = join(tmpdir(), `hn-crawler-test-${process.pid}.db`);
  const databaseUrl = `file:${databasePath}`;

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });
  project.provide("databaseUrl", databaseUrl);

  return () => rmSync(databasePath, { force: true });
}
