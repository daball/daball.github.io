var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var clean = require('gulp-clean');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream')
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var pug = require('gulp-pug');
var _pug = require('pug');
var slugify = require('slug');
var extend = require('extend');
var runSequence = require('run-sequence');
var Git = require('nodegit');
var git = require('gulp-git');

// Get data in order
var models = require('./models');
var query = models.query = require('array-query');
var moment = models.moment = require('moment');
var basedir = __dirname;
//this injects a pug template compiler into each section of the resume model
//because pug itself does not support variable includes (for performance reasons)
for (var id in models.resume.sections) {
  models.resume.sections[id].template = _pug.compileFile('./components/resume/sections/'+id+'.pug', { basedir: basedir });
}
models.query = query;
function post_basepath(post) {
  var postMoment = moment(post.date);
  var year = postMoment.format('YYYY');
  var month = postMoment.format('MM');
  var day = postMoment.format('DD');
  var filename = (slugify(post.slug||post.title) + '.html').toLowerCase();
  return [year, month, day].join('/').toLowerCase();
}
function post_filename(post) {
  return `${slugify(post.slug||post.title)}.html`.toLowerCase();
}
function post_permalink(post) {
  var basepath = post_basepath(post);
  var filename = post_filename(post)
  return ('/'+[basepath, filename].join('/')).toLowerCase();
}
//this routine pulls all the blog post data into models.blog.posts
//from the Jekyll blog (previously used), generating needed fields
(function () {
  var fs = require('fs');
  var yamlFront = require('yaml-front-matter');
  var Liquid = require('liquidjs');
  var engine = Liquid();
  var showdown = require('showdown');
  showdown.setFlavor('github');
  var converter = new showdown.Converter({ metadata: true });
  var ls = fs.readdirSync('./posts');
  models.blog.posts = [];
  for (var f = 0; f < ls.length; f++) {
    var fileContents = fs.readFileSync('./posts/' + ls[f], 'utf8');
    var yfmContents = yamlFront.loadFront(fileContents);
    var mdContents = converter.makeHtml(fileContents);
    yfmContents.contents = mdContents;
    if (mdContents.indexOf("<div id=\"extended\"></div>") > 0)
      yfmContents.summary = mdContents.substring(0, mdContents.indexOf("<div id=\"extended\"></div>"));
    else
      yfmContents.summary = yfmContents.contents;
    yfmContents.permalink = post_permalink(yfmContents);
    models.blog.posts.push(JSON.parse(JSON.stringify(yfmContents)));
  }
})();

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2018-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/daball/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {

  // Popper
  gulp.src([
    './node_modules/popper.js/dist/*',
    '!./node_modules/popper.js/dist/esm/*',
    '!./node_modules/popper.js/dist/umd/*'
    ])
    .pipe(gulp.dest('./dist/vendor/popper.js/dist'))

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./dist/vendor/bootstrap'))

  // Devicons
  gulp.src([
      './node_modules/devicons/**/*',
      '!./node_modules/devicons/*.json',
      '!./node_modules/devicons/*.md',
      '!./node_modules/devicons/!PNG',
      '!./node_modules/devicons/!PNG/**/*',
      '!./node_modules/devicons/!SVG',
      '!./node_modules/devicons/!SVG/**/*'
    ])
    .pipe(gulp.dest('./dist/vendor/devicons'))

  // Font Awesome
  gulp.src([
      './node_modules/font-awesome/**/*',
      '!./node_modules/font-awesome/{less,less/*}',
      '!./node_modules/font-awesome/{scss,scss/*}',
      '!./node_modules/font-awesome/.*',
      '!./node_modules/font-awesome/*.{txt,json,md}'
    ])
    .pipe(gulp.dest('./dist/vendor/font-awesome'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./dist/vendor/jquery'))

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./dist/vendor/jquery-easing'))

  // Simple Line Icons
  gulp.src([
      './node_modules/simple-line-icons/fonts/**',
    ])
    .pipe(gulp.dest('./dist/vendor/simple-line-icons/fonts'))

  gulp.src([
      './node_modules/simple-line-icons/css/**',
    ])
    .pipe(gulp.dest('./dist/vendor/simple-line-icons/css'))

});

// Compile SCSS
gulp.task('css:compile:theme:resume', function() {
  return gulp.src('./layouts/resume/scss/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded',
      includePaths: [
        basedir + '/node_modules/bootstrap/scss'
      ]
    }).on('error', sass.logError))
    .pipe(gulp.dest('./dist/layouts/resume/css'));
});

gulp.task('css:compile:theme:blog', function() {
  return gulp.src('./layouts/blog/scss/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded',
      includePaths: [
        basedir + '/node_modules/bootstrap/scss'
      ]
    }).on('error', sass.logError))
    .pipe(gulp.dest('./dist/layouts/blog/css'));
});

gulp.task('css:compile:theme:exit', function() {
  return gulp.src('./layouts/exit/scss/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded',
      includePaths: [
        basedir + '/node_modules/bootstrap/scss'
      ]
    }).on('error', sass.logError))
    .pipe(gulp.dest('./dist/layouts/exit/css'));
});

// Minify CSS
gulp.task('css:minify:theme:blog', ['css:compile:theme:blog'], function() {
  return gulp.src([
      './dist/layouts/blog/css/*.css',
      '!./dist/layouts/blog/css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/layouts/blog/css'))
    .pipe(browserSync.stream());
});
gulp.task('css:minify:theme:resume', ['css:compile:theme:resume'], function() {
  return gulp.src([
      './dist/layouts/resume/css/*.css',
      '!./dist/layouts/resume/css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/layouts/resume/css'))
    .pipe(browserSync.stream());
});
gulp.task('css:minify:theme:exit', ['css:compile:theme:exit'], function() {
  return gulp.src([
      './dist/layouts/exit/css/*.css',
      '!./dist/layouts/exit/css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/layouts/exit/css'))
    .pipe(browserSync.stream());
});

// CSS
gulp.task('css:compile', ['css:compile:theme:resume', 'css:compile:theme:blog', 'css:compile:theme:exit']);
gulp.task('css:minify', ['css:minify:theme:resume', 'css:minify:theme:blog', 'css:minify:theme:exit']);
gulp.task('css', ['css:compile', 'css:minify']);

// Copy and minify JavaScript
function jsMinifyTheme(name) {
  return gulp.src([
      './layouts/' + name + '/js/*.js',
      // '!./layouts/' + name + '/js/*.min.js'
    ])
    .pipe(gulp.dest('./dist/layouts/'+name+'/js/'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/layouts/'+name+'/js'))
    .pipe(browserSync.stream());
}

gulp.task('js:minify:theme:resume', function() {
  return jsMinifyTheme('resume');
});
gulp.task('js:minify:theme:blog', function() {
  return jsMinifyTheme('blog');
});
gulp.task('js:minify:theme:exit', function() {
  return jsMinifyTheme('exit');
});
gulp.task('js:minify', ['js:minify:theme:resume', 'js:minify:theme:blog', 'js:minify:theme:exit']);

gulp.task('html:blog:index:generate', function () {
  return gulp.src(['./components/blog/list.pug'])
    .pipe(pug({
      locals: models,
      basedir: basedir
    }))
    .pipe(rename("index.html"))
    .pipe(gulp.dest('./dist/blog/'));
});

gulp.task('html:blog:posts:generate', function () {
  for (var p = 0; p < models.blog.posts.length; p++) {
    var post = models.blog.posts[p];
    var path = './dist/' + post_basepath(post);
    var filename = post_filename(post);
    {
      // var copyModels = extend({ }, models);
      // copyModels.blog = extend(copyModels.blog, { post: post });
      gulp.src(['./components/blog/post.pug'])
        .pipe(rename(filename))
        .pipe(pug({
          locals: extend(true, { }, models, { blog: { post: post } }),
          basedir: basedir,
          cache: false
        }))
        .pipe(gulp.dest(path));
    }
  }
});

gulp.task('html:pages:compile', function() {
  return gulp.src([
      './pages/**/*.pug'
    ])
    .pipe(pug({
      locals: models,
      basedir: basedir
    }))
    .pipe(gulp.dest('./dist/'));
});

// html
gulp.task('html', ['html:pages:compile', 'html:blog:index:generate', 'html:blog:posts:generate']);

gulp.task('img:copy', function() {
  return gulp.src([
      './layouts/resume/img/*'
    ])
    .pipe(gulp.dest('./dist/layouts/resume/img/'));
});

// gulp.task('pdf:resume:ttf:fetch', function () {
//
// });

gulp.task('pdf:resume:compile', /*['pdf:resume:ttf:fetch'],*/ function () {
  var generatePdf = require('./components/resume/print/generate-pdf-2');
  var stream = source('resume.pdf');
  generatePdf(stream, models);
  return stream.pipe(rename('resume.pdf')).pipe(gulp.dest('./dist/pdf/'));
});

// pdf
gulp.task('pdf', ['pdf:resume:compile']);

// pdf
gulp.task('github', function () {
  return gulp.src(['LICENSE', 'readme.md', 'CNAME'])
    .pipe(gulp.dest('./dist'));
});

// img
gulp.task('img', ['img:copy']);

// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['html', 'img', 'css', 'js', 'pdf', 'vendor', 'github'], function (done) {
  done();
});

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      basedir: basedir
    }
  });
});

// Deployment tasks
gulp.task('clean', function () {
  return gulp.src('dist', { read: false })
    .pipe(clean());
});
gulp.task('fetch-remote-src', function (done) {
  var repository;
  Git.Repository.open(".")
    .then(function(repo) {
      repository = repo;
      return repo.fetchAll("origin");
    })
    .then(function () {
       return repository.mergeBranches("src", "origin/src");
    })
    .then(function () {
      done();
    });
});
gulp.task('fetch-remote-master', function (done) {
  var repository;
  Git.Repository.open(".")
    .then(function(repo) {
      repository = repo;
      return repo.fetchAll("origin");
    })
    .then(function () {
       return repository.mergeBranches("master", "origin/master");
    })
    .then(function () {
      done();
    });
});
gulp.task('fetch-remotes', function (done) {
  runSequence('fetch-remote-master', 'fetch-remote-src', done);
});
gulp.task('clone-src-repo-to-dist', function () {
  return gulp.src(['.git/**/*'])
    .pipe(gulp.dest('./dist/.git'));
});
gulp.task('checkout-remote-master-on-dist', function (done) {
  Git.Repository.open('./dist')
    .then(function (repository) {
      repository.getBranch('refs/heads/master')
        .then(function (reference) {
          repository.checkoutRef(reference)
            .then(function () {
              done();
            });
        });
    });
});
gulp.task('clean-working-dir-on-dist', function () {
  return gulp.src(['./dist/*', '!./git'], { read: false })
    .pipe(clean({force:true}));
});
gulp.task('pre-dist-build', function (done) {
  runSequence('fetch-remotes', 'clean', 'clone-src-repo-to-dist', 'checkout-remote-master-on-dist', 'clean-working-dir-on-dist', done);
});
gulp.task('dist-build', ['default']);

var commit;
gulp.task('add-and-commit-dist-to-master', function () {
  var repo;
  var index;
  var oid;
  Git.Repository.open('./dist')
    .then(function(repoResult) {
      repo = repoResult;
      return repo.refreshIndex();
    })
    .then(function(indexResult) {
      index = indexResult;
      return index.addAll('.');
    })
    .then(function() {
      //write files to index
      return index.write();
    })
    .then(function() {
      return index.writeTree();
    })
    .then(function(oidResult) {
      oid = oidResult;
      return Git.Reference.nameToId(repo, "HEAD");
    })
    .then(function(head) {
      return repo.getCommit(head);
    })
    .then(function(parent) {
      // var author = nodegit.Signature.create("Scott Chacon",
      //   "schacon@gmail.com", 123456789, 60);
      // var committer = nodegit.Signature.create("Scott A Chacon",
      //   "scott@github.com", 987654321, 90);
      var author = Git.Signature.default(repo);
      var committer = Git.Signature.default(repo);
      message = "Source saved from automatic build " + moment().format('MMMM DD, YYYY @ hh:mm:ss.SSS a');
      return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
    })
    .done(function(commitId) {
      commit = commitId;
      console.log("Created new commit", commit, "with message:");
      console.log(message);
    });
});
gulp.task('add-and-commit-src', function () {
  var repo;
  var index;
  var oid;
  Git.Repository.open('.')
    .then(function(repoResult) {
      repo = repoResult;
      return repo.refreshIndex();
    })
    .then(function(indexResult) {
      index = indexResult;
      return index.addAll('.');
    })
    .then(function() {
      //write files to index
      return index.write();
    })
    .then(function() {
      return index.writeTree();
    })
    .then(function(oidResult) {
      oid = oidResult;
      return Git.Reference.nameToId(repo, "HEAD");
    })
    .then(function(head) {
      return repo.getCommit(head);
    })
    .then(function(parent) {
      // var author = nodegit.Signature.create("Scott Chacon",
      //   "schacon@gmail.com", 123456789, 60);
      // var committer = nodegit.Signature.create("Scott A Chacon",
      //   "scott@github.com", 987654321, 90);
      var author = Git.Signature.default(repo);
      var committer = Git.Signature.default(repo);
      message = "Automatically built " + commit + " on master branch; src branch committed automatically via build script.";
      return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
    })
    .done(function(commitId) {
      console.log("Created new commit", commitId, "with message:");
      console.log(message);
    });
});

gulp.task('push-dist-to-remote-master', function (done) {
  git.push('origin', 'master', { cwd: './dist' }, function (err) {
    if (err) throw err;
    done();
  });
});

gulp.task('push-src-to-remote-src', function (done) {
  git.push('origin', 'src', { cwd: './' }, function (err) {
    if (err) throw err;
    done();
  });
});

gulp.task('post-dist-build', function (done) {
  runSequence('add-and-commit-dist-to-master', 'add-and-commit-src', 'push-src-to-remote-src', 'push-dist-to-remote-master', done);
});
gulp.task('deploy', function(done) {
  runSequence('pre-dist-build', 'dist-build', 'post-dist-build', done);
});

// Dev task
gulp.task('dev', ['html', 'img', 'css', 'js', 'pdf', 'vendor', 'github', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./img/*', ['img']);
  gulp.watch('./**/*.pug', ['html', browserSync.reload]);
});
