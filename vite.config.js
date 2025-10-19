import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  // Expose AUTH0_* environment variables to the browser (in addition to VITE_*)
  envPrefix: ['VITE_', 'AUTH0_'],
});
