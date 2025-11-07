@echo off
echo.
echo ========================================
echo   SonarQube Setup Validation
echo ========================================
echo.

set ERRORS=0

REM Check Java
echo [1/6] Checking Java installation...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Java NOT found in PATH
    echo     Install from: https://adoptium.net/temurin/releases/
    set /a ERRORS+=1
) else (
    java -version 2>&1 | findstr /i "version" >nul
    echo [✓] Java found
)
echo.

REM Check sonar-scanner
echo [2/6] Checking sonar-scanner installation...
where sonar-scanner >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [✗] sonar-scanner NOT found
    echo     Install: npm install -g sonar-scanner
    set /a ERRORS+=1
) else (
    echo [✓] sonar-scanner found
)
echo.

REM Check SonarQube server
echo [3/6] Checking SonarQube server...
curl -s -o nul -w "%%{http_code}" http://localhost:9000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [✗] SonarQube server NOT running
    echo     Start it: .\start-sonarqube.bat
    set /a ERRORS+=1
) else (
    echo [✓] SonarQube server is running
)
echo.

REM Check frontend coverage package
echo [4/6] Checking frontend coverage package...
cd frontend
call npm list @vitest/coverage-v8 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [✗] @vitest/coverage-v8 NOT installed
    echo     Install: cd frontend ^&^& npm install -D @vitest/coverage-v8@3.2.4
    set /a ERRORS+=1
) else (
    echo [✓] Frontend coverage package installed
)
cd ..
echo.

REM Check backend coverage config
echo [5/6] Checking backend coverage config...
if exist "backend\.nycrc" (
    echo [✓] Backend .nycrc found
) else (
    echo [✗] Backend .nycrc NOT found
    set /a ERRORS+=1
)
echo.

REM Check sonar-project.properties
echo [6/6] Checking sonar-project.properties...
if exist "sonar-project.properties" (
    findstr /C:"sonar.login=" sonar-project.properties | findstr /C:"YOUR_TOKEN_HERE" >nul
    if %ERRORLEVEL% EQU 0 (
        echo [✗] Token not configured in sonar-project.properties
        echo     Update sonar.login with your actual token
        set /a ERRORS+=1
    ) else (
        echo [✓] sonar-project.properties configured
    )
) else (
    echo [✗] sonar-project.properties NOT found
    set /a ERRORS+=1
)
echo.

echo ========================================
if %ERRORS% EQU 0 (
    echo   ✅ ALL CHECKS PASSED!
    echo ========================================
    echo.
    echo You're ready to run analysis:
    echo   .\run-sonar-analysis.bat
) else (
    echo   ❌ FOUND %ERRORS% ISSUES
    echo ========================================
    echo.
    echo Please fix the issues above, then:
    echo   1. Run this script again to verify
    echo   2. Then run: .\run-sonar-analysis.bat
)
echo.
pause
