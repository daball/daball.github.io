#!/bin/zsh
# cd ..
echo "Removing ./resume/dist"
rm -rf resume/dist
echo "Making directory ./resume/dist"
mkdir resume/dist
echo "Copying .git repo to ./resume/dist"
cp -R .git resume/dist
echo "Entering ./resume/dist"
cd resume/dist
echo "Checking out master branch"
git checkout master
echo "Removing current files/folders"
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
echo "Entering ./resume"
cd ..
# cd resume
echo "Building JavaScript site"
gulp
echo "Entering ./hugo"
cd ..
cd hugo
echo "Building Go site"
hugo --minify
echo "Entering ./"
cd ..
echo "Merginng Go site artifacts to JavaScript site"
mv hugo/public/index.html resume/dist/
mv hugo/public/plugins resume/dist/
mv hugo/public/images resume/dist/
mv hugo/public/css/* resume/dist/css/
mv hugo/public/js resume/dist/
# mv hugo/public/assets resume/dist
