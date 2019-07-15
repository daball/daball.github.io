import { src, dest } from 'gulp';

function copyGithubSupportFiles() {
    return src(['LICENSE', 'readme.md', 'CNAME'])
      .pipe(dest('./dist'));
}

export { copyGithubSupportFiles };