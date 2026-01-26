@echo off
REM Launch VS Code with increased memory limits
REM Increases Node.js heap size and other memory-related settings

echo Starting VS Code with increased memory allocation...

REM Set Node.js memory limits
set NODE_OPTIONS=--max-old-space-size=8192 --max-semi-space-size=1024

REM Launch VS Code with the current directory
code . --max-memory=8192

echo VS Code launched with high memory configuration
pause