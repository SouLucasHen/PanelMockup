/**
 * Limpeza — Base Hensa Studio (hns/vue-source)
 *
 * Remove os arquivos não utilizados que sobraram do painel de pelúcias
 * (views, stores, componentes, ícones e utils esvaziados).
 *
 * SEGURANÇA: só apaga arquivos cujo conteúdo contenha a marca
 * "não é mais utilizado" (todos os stubs foram marcados assim) — ou que
 * estejam vazios. Arquivos que você reutilizar/editar não serão tocados.
 *
 * Uso:
 *   node cleanup.js            -> remove apenas os stubs
 *   node cleanup.js --all      -> também remove dist/ e hns-vue-source.zip
 *
 * Este arquivo é ES module (o package.json contém "type": "module").
 */
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ALL = process.argv.includes("--all");
const ROOT = dirname(fileURLToPath(import.meta.url));

// Stubs que devem ser removidos (32 arquivos)
const STUBS = [
  // views
  "src/views/Colecao.vue",
  "src/views/Historico.vue",
  "src/views/Mercado.vue",
  "src/views/Roleta.vue",
  "src/views/Troca.vue",
  // stores
  "src/stores/collection.js",
  "src/stores/history.js",
  "src/stores/marketplace.js",
  "src/stores/roulette.js",
  "src/stores/trade.js",
  // components
  "src/components/Dropdown.vue",
  "src/components/EmptyState.vue",
  "src/components/GemstoneBadge.vue",
  "src/components/PlushieImage.vue",
  "src/components/PositionSelector.vue",
  "src/components/RewardModal.vue",
  "src/components/TradeInvite.vue",
  // utils
  "src/utils/plushie.js",
  // icons (14 não usados; mantém History, Logout e User)
  "src/icons/Box.vue",
  "src/icons/Close.vue",
  "src/icons/Collection.vue",
  "src/icons/Gemstone.vue",
  "src/icons/Marketplace.vue",
  "src/icons/NoAds.vue",
  "src/icons/Plushie.vue",
  "src/icons/Roulette.vue",
  "src/icons/Search.vue",
  "src/icons/Sparkles.vue",
  "src/icons/Star.vue",
  "src/icons/Tag.vue",
  "src/icons/Trade.vue",
  "src/icons/Wrench.vue",
];

// Itens extras (somente com --all)
const EXTRAS = ["dist", "hns-vue-source.zip"];

// Marca presente em todos os stubs esvaziados
const STUB_MARKER = "não é mais utilizado";

function isStub(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    return content.includes(STUB_MARKER) || content.trim() === "";
  } catch {
    return false;
  }
}

function remove(targets, label) {
  let removed = 0;
  let skipped = 0;

  for (const rel of targets) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) continue; // já removido antes? segue o baile

    if (statSync(abs).isDirectory()) {
      rmSync(abs, { recursive: true, force: true });
      console.log("  [removido] " + rel);
      removed++;
      continue;
    }

    if (!isStub(abs)) {
      console.log(`  [PULADO  ] ${rel} (não é um stub — não toquei)`);
      skipped++;
      continue;
    }

    rmSync(abs, { force: true });
    console.log("  [removido] " + rel);
    removed++;
  }

  console.log(`\n${label}: ${removed} removido(s), ${skipped} pulado(s).`);
  return removed;
}

console.log("============================================");
console.log("  Limpeza - Base Hensa Studio");
console.log("============================================\n");

console.log("Removendo stubs nao utilizados...\n");
remove(STUBS, "Stubs");

if (ALL) {
  console.log("\nRemovendo extras (dist/ e zip)...\n");
  remove(EXTRAS, "Extras");
} else {
  console.log("\nDica: use  node cleanup.js --all  para remover tambem dist/ e hns-vue-source.zip.");
}

console.log("\nPronto! A base agora esta limpa.");
console.log("Lembre-se: rode  npm run build  para gerar o dist/ atualizado.");
