import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const { PORT = 5174 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/app",
  },
});
