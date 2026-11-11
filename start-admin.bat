@echo off
cd /d "%~dp0"
title Zayn Sajju Portfolio - Local Server

where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] PHP is not installed or not in PATH!
    echo Please install PHP, or run XAMPP, or upload these files to your web hosting.
    echo.
    pause
    exit /b
)

echo ========================================================
echo   Starting Local Server for Website and Admin Panel
echo ========================================================
echo.
echo Website URL:      http://localhost:8000/
echo Admin Panel:     http://localhost:8000/admin/
echo.
echo Login Credentials:
echo   Username:       admin
echo   Password:       Admin@123
echo.
echo To stop server:   Press Ctrl + C
echo ========================================================
echo.

start "" "http://localhost:8000/admin/"
php -S localhost:8000 router.php
pause
