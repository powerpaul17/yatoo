import { spawnSync } from 'bun';

import vuePlugin from 'esbuild-plugin-vue-next';

const prod = process.env.BUILD_MODE === 'production' ? true : false;

const lastCommitHash = spawnSync([ 'git', 'rev-parse', '--short', 'HEAD' ]).stdout.toString().trim();

const result = await Bun.build({
  entrypoints: [ './src/main.ts' ],
  outdir: './build',
  plugins: [
    vuePlugin()
  ],
  target: 'browser',
  minify: prod,
  define: {
    'COMMIT_HASH': JSON.stringify(lastCommitHash)
  }
});

for (const log of result.logs) {
  console.log(log);
}
