/**
 * Copia o build (dist/) para web-side/ da resource — a pasta que o fxmanifest
 * usa (ui_page "web-side/index.html"). Rode via: npm run build:resource
 *
 * Estrutura esperada:
 *   <resource>/vue-source/            (este projeto — onde o script vive)
 *   <resource>/web-side/             (destino do build)
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VUE_SOURCE = dirname(dirname(fileURLToPath(import.meta.url))); // <resource>/vue-source
const RESOURCE = dirname(VUE_SOURCE);                                // <resource>/
const DIST = join(VUE_SOURCE, "dist");
const TARGET = join(RESOURCE, "web-side");

if (!existsSync(DIST)) {
  console.error("Pasta dist/ não encontrada. Rode 'npm run build' primeiro.");
  process.exit(1);
}

rmSync(TARGET, { recursive: true, force: true });
mkdirSync(TARGET, { recursive: true });
cpSync(DIST, TARGET, { recursive: true });

console.log(`Build copiado para ${TARGET}`);
