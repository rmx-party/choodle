import adapter from '@sveltejs/adapter-vercel';
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
    adapter: adapter({
      runtime: 'nodejs18.x',
      external: ['$app/stores']
    }),
    version: {
      name: name
    }
  },
};

export default config;


