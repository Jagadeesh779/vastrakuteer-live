@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Starting Vastra Kuteer...

echo Starting Backend Server...
start "Vastra Server" cmd /k "cd server && npm run dev"

echo Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend Client...
start "Vastra Client" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo   Vastra Kuteer is Running! 
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
echo.
pause
