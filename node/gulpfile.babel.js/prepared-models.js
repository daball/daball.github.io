import query from 'array-query';
import moment from 'moment';
import { loadFront } from 'yaml-front-matter';
import { Liquid } from 'liquidjs';
import showdown from 'showdown';
import fs from 'fs';
import path from 'path';
import pug from 'pug';
import slugify from 'slug';
const basedir = path.join(__dirname, '..');

//this injects a pug template compiler into each section of the resume model
//because pug itself does not support variable includes (for performance reasons)
let models = require('../models');
models.query = query;
models.moment = moment;
for (var id in models.resume.sections) {
  models.resume.sections[id].template = pug.compileFile('./components/resume/sections/'+id+'.pug', { basedir: basedir });
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
  var engine = new Liquid();
  showdown.setFlavor('github');
  var converter = new showdown.Converter({ metadata: true });
  var ls = fs.readdirSync('./posts');
  models.blog.posts = [];
  for (var f = 0; f < ls.length; f++) {
    var fileContents = fs.readFileSync('./posts/' + ls[f], 'utf8');
    var yfmContents = loadFront(fileContents);
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

export { post_basepath, post_filename, post_permalink, models };