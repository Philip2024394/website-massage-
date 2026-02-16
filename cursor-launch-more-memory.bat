@echo off
REM Launch Cursor with higher JS heap to reduce OOM crashes.
REM Use 8192 for 16GB RAM, 4096 for 8GB RAM, 12288 for 32GB RAM.
set NODE_OPTIONS=--max-old-space-size=8192
start "" "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" %*
echo Cursor started with NODE_OPTIONS=%NODE_OPTIONS%
