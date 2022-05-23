#!/bin/zsh
# cd ..
echo "Removing ./build"
rm -rf build
echo "Removing ./node/dist"
rm -rf node/dist
echo "Making directory ./node/dist"
mkdir node/dist
echo "Copying .git repo to ./node/dist"
cp -R .git node/dist
echo "Entering ./node/dist"
cd node/dist
echo "Checking out master branch"
git checkout master
echo "Fetching latest changes to master branch of repo"
git pull
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
rm -rf plugins
rm -rf images
rm -rf js
rm ads.txt
rm index.html
echo "Entering ./node"
cd ..
# cd resume
echo "Building JavaScript site"
npm install
gulp
echo "Entering ./"
cd ..
echo "Moving ./node/dist to ./build"
mv ./node/dist ./build
echo "Entering ./hugo"
cd hugo
echo "Building Go site"
hugo --minify
echo "Entering ./"
cd ..
echo "Merging Go site artifacts to ./build"
mv hugo/public/index.html ./build/
mv hugo/public/plugins ./build/
mv hugo/public/images ./build/
mv hugo/public/css/* ./build/css/
mv hugo/public/js ./build/
# mv hugo/public/assets build/build
echo "Removing ./dist"
rm -rf dist
echo "Build complete, moving/renaming ./build to ./dist"
mv build dist
echo "Build and distribution complete"