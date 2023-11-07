import {defineConfig} from 'vitest/config'
import {sveltekit} from '@sveltejs/kit/vite'

export default defineConfig({
  plugins: [
    sveltekit({hot: !process.env.VITEST}),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    reporters: ['default', 'html'],
  },
})
