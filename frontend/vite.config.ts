import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import * as path from "path";

console.log("vite.config.ts initializing");
console.log(`process.env.SENTRY_AUTH_TOKEN: ${process.env.SENTRY_AUTH_TOKEN}`);
export default defineConfig({
  // plugins: [sveltekit()],
  plugins: [
    sentrySvelteKit({
      adapter: "vercel",
      autoUploadSourceMaps: false,
      sourceMapsUploadOptions: {
        org: "rmx-party",
        project: "choodle-sveltekit",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
      autoInstrument: {
        load: true,
        serverLoad: true,
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
