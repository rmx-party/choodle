import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  // plugins: [sveltekit()],
  plugins: [
    sentrySvelteKit({
      adapter: "vercel",
      autoUploadSourceMaps: true,
      sourceMapsUploadOptions: {
        org: "rmx-party",
        project: "choodle-sveltekit",
      },
      autoInstrument: {
        load: true,
        serverLoad: false,
      },
    }),
    sveltekit(),
  ],
  build: {
    sourcemap: true,
  },
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
