/**
 * Copia o build (dist/) para hns/web-side — a pasta que a resource usa
 * (ui_page "web-side/index.html"). Rode via: npm run build:resource
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url))); // hns/vue-source
const DIST = join(ROOT, "dist");
const TARGET = join(ROOT, "..", "web-side");

if (!existsSync(DIST)) {
  console.error("Pasta dist/ não encontrada. Rode 'npm run build' primeiro.");
  process.exit(1);
}

rmSync(TARGET, { recursive: true, force: true });
mkdirSync(TARGET, { recursive: true });
cpSync(DIST, TARGET, { recursive: true });

console.log("Build copiado para hns/web-side.");
