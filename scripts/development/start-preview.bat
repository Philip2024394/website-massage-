@echo off
echo Starting Massage Booking Platform Preview...
echo.

REM Stop any existing Node processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start the preview server
echo Starting preview server...
start /B npx serve dist -s -p 3000 -n

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Open in browser
echo Opening browser...
start http://localhost:3000/

echo.
echo Preview server is running at: http://localhost:3000/
echo Press any key to stop the server...
pause >nul

REM Stop the server
taskkill /F /IM node.exe 2>nul
echo Server stopped.
pause