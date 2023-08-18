import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        sourcemap: true
    },
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        reporters: ['default', 'html']
    },
    define: {
        'process.env': process.env
    }
});
