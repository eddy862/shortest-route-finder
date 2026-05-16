import path from "node:path";
import { beforeEach } from "vitest";
import fs from "node:fs";

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, "delivery.backup.initial.db");
const TEST_DB = path.join(ROOT, "delivery.test.db");

beforeEach(() => {
  fs.copyFileSync(BASELINE, TEST_DB);
});