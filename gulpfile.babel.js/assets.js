import { src, dest } from 'gulp';

function copyAssets() {
    return src([
        './assets/**/*'
      ])
      .pipe(dest('./dist/'));
}

export { copyAssets };