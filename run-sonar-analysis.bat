@echo off
echo.
echo ========================================
echo   SonarQube Analysis Script
echo ========================================
echo.

REM Check if sonar-scanner is installed
where sonar-scanner >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] sonar-scanner is not installed or not in PATH
    echo.
    echo Please install it with: npm install -g sonar-scanner
    echo Or download from: https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/
    echo.
    pause
    exit /b 1
)

echo [INFO] sonar-scanner found
echo.

REM Check if SonarQube is running
echo [INFO] Checking if SonarQube server is running...
curl -s -o nul -w "%%{http_code}" http://localhost:9000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cannot connect to SonarQube at http://localhost:9000
    echo.
    echo Please start SonarQube first:
    echo   1. Run: start-sonarqube.bat
    echo   2. Wait 2-3 minutes
    echo   3. Open: http://localhost:9000
    echo   4. Login and create project
    echo   5. Then run this script again
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] SonarQube server is running
echo.

REM Step 1: Generate Frontend Coverage
echo ========================================
echo Step 1: Generating Frontend Coverage
echo ========================================
cd frontend
if exist coverage (
    echo [INFO] Removing old coverage...
    rmdir /s /q coverage
)
echo [INFO] Running frontend tests with coverage...
call npm run test:coverage
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Frontend tests had issues, but continuing...
)
cd ..
echo.

REM Step 2: Generate Backend Coverage
echo ========================================
echo Step 2: Generating Backend Coverage
echo ========================================
cd backend
if exist coverage (
    echo [INFO] Removing old coverage...
    rmdir /s /q coverage
)
echo [INFO] Running backend tests with coverage...
call npm run test:coverage
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backend tests had issues, but continuing...
)
cd ..
echo.

REM Step 3: Verify coverage files
echo ========================================
echo Step 3: Verifying Coverage Files
echo ========================================
if exist "backend\coverage\lcov.info" (
    echo [SUCCESS] Backend coverage file found
) else (
    echo [WARNING] Backend coverage file not found at backend\coverage\lcov.info
)
if exist "frontend\coverage\lcov.info" (
    echo [SUCCESS] Frontend coverage file found
) else (
    echo [WARNING] Frontend coverage file not found at frontend\coverage\lcov.info
)
echo.

REM Step 4: Run SonarQube Analysis
echo ========================================
echo Step 4: Running SonarQube Analysis
echo ========================================
echo [INFO] This may take 1-2 minutes...
echo.
sonar-scanner
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] SonarQube analysis failed
    echo.
    echo Common issues:
    echo   1. Token not configured in sonar-project.properties
    echo   2. Project not created in SonarQube
    echo   3. SonarQube server not running
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ANALYSIS COMPLETE!
echo ========================================
echo.
echo View your results at:
echo http://localhost:9000/dashboard?id=huzaifakarim-mern-10pshine
echo.
pause
