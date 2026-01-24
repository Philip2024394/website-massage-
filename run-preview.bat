@echo off
echo Setting up stable preview server for VS Code...

REM Kill any conflicting processes
taskkill /F /IM node.exe 2>nul >nul
taskkill /F /IM python.exe 2>nul >nul

REM Start preview server in background
echo Starting preview server on port 5000...
start /B cmd /c "npx serve dist -s -p 5000 >nul 2>&1"

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Test connection
for /L %%i in (1,1,10) do (
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 goto :connected
    timeout /t 1 /nobreak >nul
)

echo Could not connect to server. Trying Python fallback...
start /B python -m http.server 5000 --directory dist >nul 2>&1
timeout /t 2 /nobreak >nul

:connected
echo Preview server is ready at http://localhost:5000/
echo Opening in your default browser...

REM Open in default browser 
start http://localhost:5000/

echo.
echo ✅ Preview server running at: http://localhost:5000/
echo 🌐 Access from VS Code: View ^> Command Palette ^> "Simple Browser: Show"
echo 💻 Enter URL: http://localhost:5000/
echo.
echo Press any key to stop the server...
pause >nul

REM Cleanup
taskkill /F /IM node.exe 2>nul >nul  
taskkill /F /IM python.exe 2>nul >nul
echo Server stopped.
pause