import adapter from '@sveltejs/adapter-auto';
import {vitePreprocess} from '@sveltejs/kit/vite';
import * as child_process from "child_process";

let name;

if (process.env.VERCEL === '1') {
    name = process.env.VERCEL_GIT_COMMIT_SHA
} else {
    name = child_process.execSync('git rev-parse HEAD').toString().trim()
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter(),
        version: {
            name: name
        }
    }
};

export default config;
