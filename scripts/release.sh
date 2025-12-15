#!/bin/bash

# Release script for DeepSeek Obsidian Plugin

echo "Building DeepSeek Obsidian Plugin..."
npm run build

echo "Creating release directory..."
mkdir -p release

echo "Copying files to release directory..."
cp main.js release/
cp manifest.json release/
cp icon.svg release/
cp CHANGELOG.md release/
cp README.md release/
cp LICENSE release/

echo "Creating zip archive..."
cd release
zip -r ../deepseek-obsidian-plugin-release.zip .
cd ..

echo "Release package created: deepseek-obsidian-plugin-release.zip"

echo "Release process completed!"