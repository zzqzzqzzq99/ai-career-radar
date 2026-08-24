import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./static", import.meta.url)),
  base: "/legal-ai-job-tracker/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./pages-dist", import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [projectRoot],
    },
  },
});
