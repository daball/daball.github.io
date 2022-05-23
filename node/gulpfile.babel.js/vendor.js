import { src, dest, parallel } from 'gulp';

// Copy third party libraries from /node_modules into /vendor

function copyVendorPopper() {
    // Popper
    return src([
      './node_modules/@popperjs/core/dist/**/*',
      // '!./node_modules/@popperjs/core/dist/esm/*',
      // '!./node_modules/@popperjs/core/dist/umd/*'
      ])
      .pipe(dest('./dist/vendor/popper.js/core/dist'));
}

function copyVendorBootstrap() {  
    // Bootstrap
    return src([
        './node_modules/bootstrap/dist/**/*',
        '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
        '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
      ])
      .pipe(dest('./dist/vendor/bootstrap'));
}

function copyVendorDevicons() {
    // Devicons
    return src([
        './node_modules/devicons/**/*',
        '!./node_modules/devicons/*.json',
        '!./node_modules/devicons/*.md',
        '!./node_modules/devicons/!PNG',
        '!./node_modules/devicons/!PNG/**/*',
        '!./node_modules/devicons/!SVG',
        '!./node_modules/devicons/!SVG/**/*'
      ])
      .pipe(dest('./dist/vendor/devicons'));
}

function copyVendorDeviconIcons() {
    // Devicon
    return src([
      './node_modules/devicon/icons/**/*'
    ])
    .pipe(dest('./dist/vendor/devicon/icons'));
}

function copyVendorDeviconFonts() {
    return src([
      './node_modules/devicon/fonts/**/*'
    ])
    .pipe(dest('./dist/vendor/devicon/fonts'));
}

function copyVendorDeviconCss() {
    return src([
      './node_modules/devicon/*.css'
    ])
    .pipe(dest('./dist/vendor/devicon'));
}

function copyVendorFontAwesome() {
    // Font Awesome
    return src([
        './node_modules/font-awesome/**/*',
        '!./node_modules/font-awesome/{less,less/*}',
        '!./node_modules/font-awesome/{scss,scss/*}',
        '!./node_modules/font-awesome/.*',
        '!./node_modules/font-awesome/*.{txt,json,md}'
      ])
      .pipe(dest('./dist/vendor/font-awesome'));
}

function copyVendorjQuery() {
    // jQuery
    return src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
      ])
      .pipe(dest('./dist/vendor/jquery'));
}

function copyVendorjQueryEasing() {
    // jQuery Easing
    return src([
        './node_modules/jquery.easing/*.js'
      ])
      .pipe(dest('./dist/vendor/jquery-easing'));
}

function copyVendorSimpleLineIconsFonts() {
    // Simple Line Icons
    return src([
        './node_modules/simple-line-icons/fonts/**',
      ])
      .pipe(dest('./dist/vendor/simple-line-icons/fonts'));
}

function copyVendorSimpleLineIconsCss() {
    return src([
        './node_modules/simple-line-icons/css/**',
      ])
      .pipe(dest('./dist/vendor/simple-line-icons/css'));
}

let copyVendorLibraries = parallel(
    copyVendorPopper,
    copyVendorBootstrap,
    copyVendorDeviconCss,
    copyVendorDeviconFonts,
    copyVendorDeviconIcons,
    copyVendorDevicons,
    copyVendorFontAwesome,
    copyVendorSimpleLineIconsCss,
    copyVendorSimpleLineIconsFonts,
    copyVendorjQuery,
    copyVendorjQueryEasing
);

export { copyVendorLibraries };