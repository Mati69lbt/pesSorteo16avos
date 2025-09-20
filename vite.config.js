import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "https://github.com/Mati69lbt/pesSorteo16avos",
  build: {
    outDir: "docs",
  },
});
