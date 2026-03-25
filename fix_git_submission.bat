@echo off
echo Fixing nested git repositories...

REM Check and delete nested client .git
if exist "client\.git" (
    echo Found nested client repo. Removing...
    rmdir /s /q "client\.git"
    echo Removed client\.git
)

REM Check and delete nested server .git
if exist "server\.git" (
    echo Found nested server repo. Removing...
    rmdir /s /q "server\.git"
    echo Removed server\.git
)

REM Remove cached submodules if they exist (ignore errors)
echo Removing cached references...
git rm --cached client
git rm --cached server

echo Re-adding all files...
git add .

echo Committing changes...
git commit -m "fix: Consolidate nested repositories and upload full project"

echo Pushing to remote...
git push origin main

echo Repair Complete.
