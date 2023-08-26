import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vitest/config';
import * as path from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        sourcemap: true,
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        reporters: ['default', 'html']
    },
    define: {
        'process.env': process.env
    },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  }
});
