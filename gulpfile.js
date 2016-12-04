'use strict';
const {task, src, series} = require('gulp');
const {rollup} = require('rollup');
const babel = require('rollup-plugin-babel');
// used to track the cache for subsequent bundles
let cache;
let cjsCache;

task('rollup:shake', () => {
  return rollup({
    entry: 'src/index.js',
    // Use the previous bundle as starting point.
    cache: cache
  }).then(bundle => {
    // Cache our bundle for later use (optional)
    cache = bundle;

    bundle.write({
      dest: 'dist/index.es6.js'
    });
  });
});

task('rollup:cjs', () => {
  return rollup({
    entry: 'src/index.js',
    // Use the previous bundle as starting point.
    cache: cjsCache
  }).then(bundle => {
    // Cache our bundle for later use (optional)
    cjsCache = bundle;

    bundle.write({
      format: 'cjs',
      plugins: [babel()],
      dest: 'dist/index.js'
    });
  });
});

task('rollup', series('rollup:shake', 'rollup:cjs'));

task('build', series('rollup'));
