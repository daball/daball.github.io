import { src, dest, series, parallel } from 'gulp';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import path from 'path';
// let browserSync = require('browser-sync').create();
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
const basedir = path.join(__dirname, '..');

function compileGenericThemeSass(theme, cb) {
    return src(`./layouts/${theme}/scss/*.scss`)
        .pipe(sass().on('error', sass.logError))
        .pipe(dest(`./dist/layouts/${theme}/css`));
    //   .pipe(sass.sync({
    //     outputStyle: 'expanded',
    //     includePaths: [
    //         path.join(basedir, 'node_modules', 'bootstrap', 'scss')
    //     ]
    //   }).on('error', sass.logError))
    //   .pipe(dest(`./dist/layouts/${theme}/css`));
}

function compileBlogThemeSass() {
    return compileGenericThemeSass('blog');
}

function compileResumeThemeSass() {
    return compileGenericThemeSass('resume');
}

function compileExitThemeSass() {
    return  compileGenericThemeSass('exit');
}

function minifyGenericThemeCss(theme) {
    return src([
        `./dist/layouts/${theme}/css/*.css`,
        `!./dist/layouts/${theme}/css/*.min.css`
      ])
      .pipe(cleanCSS())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(dest(`./dist/layouts/${theme}/css`));
    //   .pipe(browserSync.stream());
}

function minifyBlogThemeCss() {
    return minifyGenericThemeCss('blog');
}

function minifyResumeThemeCss() {
    return minifyGenericThemeCss('resume');
}

function minifyExitThemeCss() {
    return minifyGenericThemeCss('exit');
}

function minifyGenericThemeJs(theme) {
    return src([
        `./layouts/${theme}/js/*.js`,
        // `!./layouts/${theme}/js/*.min.js`
      ])
      .pipe(dest(`./dist/layouts/${theme}/js/`))
      .pipe(uglify())
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(dest(`./dist/layouts/${theme}/js`))
    //   .pipe(browserSync.stream());
}
  
function minifyBlogThemeJs() {
    return minifyGenericThemeJs('blog');
}
function minifyResumeThemeJs() {
    return minifyGenericThemeJs('resume');
}
function minifyExitThemeJs() {
    return minifyGenericThemeJs('exit');
}

// build each theme
let buildBlogTheme = parallel(
    series(compileBlogThemeSass, minifyBlogThemeCss),
    minifyBlogThemeJs
);
let buildResumeTheme = parallel(
    series(compileResumeThemeSass, minifyResumeThemeCss),
    minifyResumeThemeJs
);
let buildExitTheme = parallel(
    series(compileExitThemeSass, minifyExitThemeCss),
    minifyExitThemeJs
);

// build all themes
let buildThemes = parallel(
    buildBlogTheme, buildResumeTheme, buildExitTheme
);

export { buildBlogTheme, buildExitTheme, buildResumeTheme, buildThemes };