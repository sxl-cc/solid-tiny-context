import path from "node:path";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidPagesPlugin from "vite-plugin-solid-pages";

export default defineConfig({
  root: "./dev",
  resolve: {
    alias: {
      "~/": `${path.resolve(import.meta.dirname, "../src")}/`,
      "~play/": `${path.resolve(import.meta.dirname, "./src")}/`,
    },
  },
  plugins: [
    UnoCSS(),
    solidPlugin(),
    solidPagesPlugin({ dir: "./dev/src/pages", extensions: ["tsx"] }),
  ],
  server: {
    port: 5011,
  },
});
