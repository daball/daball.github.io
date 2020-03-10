import { dest, parallel } from 'gulp';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import generatePdf from '../components/resume/print/generate-pdf-2';
import { models } from './prepared-models';

function generateGenericResumePdf(name) {
    let stream = source(`${name}.pdf`);
    generatePdf(stream, models[`${name}`]);
    return stream
        .pipe(rename(`${name}.pdf`))
        .pipe(dest('./dist/pdf/'));
}

function generateResumePdf() {
    return generateGenericResumePdf('resume');
}

function generateCallCenterResumePdf() {
    return generateGenericResumePdf('resume-callcenter');
}

let generateResumeAssets = parallel(generateResumePdf, generateCallCenterResumePdf);

export { generateResumeAssets };