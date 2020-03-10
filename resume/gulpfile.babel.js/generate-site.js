import { src, dest, parallel } from 'gulp';
import { models, post_basepath, post_filename } from './prepared-models';
import rename from 'gulp-rename';
import pug from 'gulp-pug';
import path from 'path';
import extend from 'extend';
const basedir = path.join(__dirname, '..');

function generateBlogIndex() {
    return src(['./components/blog/list.pug'])
      .pipe(pug({
        locals: models,
        basedir: basedir
      }))
      .pipe(rename('index.html'))
      .pipe(dest('./dist/blog/'));
}

function createSingleBlogPostGenerator(post) {
    let path = './dist/' + post_basepath(post);
    let filename = post_filename(post);
    // var copyModels = extend({ }, models);
    // copyModels.blog = extend(copyModels.blog, { post: post });
    let lambdaGenerator = function generateBlogPost() {
        return src(['./components/blog/post.pug'])
            .pipe(rename(filename))
            .pipe(pug({
                locals: extend(true, { }, models, { blog: { post: post } }),
                basedir: basedir,
                cache: false
            }))
            .pipe(dest(path));
    }
    return lambdaGenerator;
}

function createGenerateBlogPostsTask() {
    let builders = [];
    for (let p = 0; p < models.blog.posts.length; p++) {
      let post = models.blog.posts[p];
      builders.push(createSingleBlogPostGenerator(post));
    }
    return parallel.apply(null, builders);
}

function compileBlogPages() {
    return src([
        './pages/**/*.pug'
        ])
        .pipe(pug({
        locals: models,
        basedir: basedir
        }))
        .pipe(dest('./dist/'));
}

let generatePosts = createGenerateBlogPostsTask();
let generateSite = parallel(generateBlogIndex, generatePosts, compileBlogPages);

export { generateSite };