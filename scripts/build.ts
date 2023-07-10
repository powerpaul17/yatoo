import vuePlugin from 'esbuild-plugin-vue-next';

const prod = process.env.BUILD_MODE === 'production' ? true : false;

const result = await Bun.build({
  entrypoints: [ './src/main.ts' ],
  outdir: './build',
  plugins: [
    vuePlugin()
  ],
  target: 'browser',
  sourcemap: prod ? 'none' : 'external',
  minify: prod
});

for (const log of result.logs) {
  console.log(log);
}
