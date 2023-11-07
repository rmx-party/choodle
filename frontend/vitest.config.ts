import {defineConfig} from 'vitest/config'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import {sveltekit} from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [
    svelte({hot: !process.env.VITEST}),
    sveltekit(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    reporters: ['default', 'html'],
  },
})
