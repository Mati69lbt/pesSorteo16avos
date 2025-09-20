// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/pesSorteo16avos/", // 👈 ruta del repo, con / al inicio y al final
  build: { outDir: "docs" },
});
