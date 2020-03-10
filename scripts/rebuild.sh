#!/bin/bash
# cd ..
rm -rf resume/dist
mkdir resume/dist
cp -R .git resume/dist
cd resume/dist
git checkout master
rm -rf 2010
rm -rf 2011
rm -rf 2012
rm -rf 2013
rm -rf blog
rm -rf cash-count-calculator
rm -rf css
rm -rf fontello*
rm -rf go
rm -rf img
rm -rf layouts
rm -rf pdf
rm -rf print
rm -rf svg
rm -rf vendor
rm ads.txt
rm index.html
cd ..
# cd resume
gulp
cd ..
cd hugo
hugo --minify
cd ..
mv hugo/public/index.html resume/dist/
mv hugo/public/plugins resume/dist/
mv hugo/public/images resume/dist/
mv hugo/public/css/* resume/dist/css/
mv hugo/public/js resume/dist/
mv hugo/public/assets resume/dist
