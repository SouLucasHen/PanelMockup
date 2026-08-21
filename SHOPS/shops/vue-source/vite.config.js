import { fileURLToPath, URL } from "node:url";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Pasta das imagens do inventário da resource "vrp" (vrp/config/inventory/*.png).
// No dev, o itemImage monta /inv/<Index>.png (mesmo padrão do public/inv/ de
// outros painéis); este middleware serve essas imagens direto da resource real,
// então a visualização no navegador bate com o que o jogo mostra via
// nui://vrp/config/inventory/<Index>.png. Em produção nada disso entra no build.
const inventoryDir = fileURLToPath(new URL("../../../vrp/config/inventory", import.meta.url));

// ==================== SERVE IMAGENS DO INVENTÁRIO (DEV) ====================
function serveInventoryImages() {
  return {
    name: "serve-inventory-images",
    configureServer(server) {
      server.middlewares.use("/inv/", async (req, res, next) => {
        const name = decodeURIComponent(req.url.slice(1)); // tira a "/" do /inv/
        if (!name) return next();

        try {
          const data = await readFile(join(inventoryDir, name));
          res.setHeader("Content-Type", "image/png");
          res.end(data);
        } catch {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), serveInventoryImages()],
  base: "./",
  resolve: {
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@composables": fileURLToPath(new URL("./src/composables", import.meta.url)),
      "@icons": fileURLToPath(new URL("./src/icons", import.meta.url)),
      "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    minify: "terser",
    cssMinify: false,
    terserOptions: {
      format: { comments: false },
    },
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "script.js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith(".css")
            ? "style.css"
            : "[name].[ext]",
      },
    },
  },
});
