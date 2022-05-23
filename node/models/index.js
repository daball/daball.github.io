import fs from 'fs';
import path from 'path';
import { parse } from 'yaml'

function readYamlFile(filePath) {
  const plaintext = fs.readFileSync(path.resolve(__dirname, filePath), { encoding:'utf8', flag:'r' });
  return parse(plaintext);
}

module.exports = {
  site: readYamlFile('./site.yml'),
  blog: readYamlFile('./blog.yml'),
  resume: readYamlFile('./resume.yml'),
  'resume-callcenter': require('./resume-callcenter'),
  links: readYamlFile('./links.yml'),
  ccc: readYamlFile('./ccc.yml')
}
