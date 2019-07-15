import { series, parallel } from 'gulp';
import { clean } from './clean';
import { copyVendorLibraries } from './vendor';
import { copyGithubSupportFiles } from './github';
import { buildThemes } from './themes';
import { copyAssets } from './assets';
import { generateSite } from './generate-site';
import { generateResumeAssets } from './generate-resume-pdf';
import { postBuild, preBuild } from './deployment';

let defaultBuild = parallel(
    copyVendorLibraries,
    copyGithubSupportFiles,
    copyAssets,
    buildThemes,
    generateSite,
    generateResumeAssets
);
let rebuild = series(clean, defaultBuild);
let deploy = series(clean, preBuild, defaultBuild, postBuild);

export default defaultBuild;
export { clean, rebuild, deploy };