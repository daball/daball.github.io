import { parallel } from 'gulp';
import del from 'del';

function cleanDist(cb) {
    del(['dist/**/*', 'dist']).then(() => cb());
}

let clean = parallel(cleanDist);

export { clean };