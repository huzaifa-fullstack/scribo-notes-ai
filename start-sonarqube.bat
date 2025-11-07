@echo off
echo.
echo ========================================
echo   Starting SonarQube Server
echo ========================================
echo.
echo Location: D:\SonarQube
echo.
echo Please wait 2-3 minutes for SonarQube to start...
echo Then open: http://localhost:9000
echo.
cd /d D:\SonarQube\bin\windows-x86-64
call StartSonar.bat
