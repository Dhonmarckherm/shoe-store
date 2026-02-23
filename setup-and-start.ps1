# Shoe Store - Complete Setup and Start Script
# This script sets up and starts everything for laptop and phone access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shoe Store - Full Setup & Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Get computer's IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Ethernet*" -or $_.InterfaceAlias -like "*Wi-Fi*" } | Select-Object -First 1).IPAddress
if (-not $ip) {
    $ip = "192.168.100.203"  # Fallback IP
}

Write-Host "Your computer's IP: $ip" -ForegroundColor Green
Write-Host ""

# Step 1: Seed Database
Write-Host "[1/4] Seeding database with products..." -ForegroundColor Yellow
Set-Location "$scriptDir\backend"
node src/utils/seedProducts.js
Write-Host " Database seeded!" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; Write-Host 'Backend starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host " Backend started on http://localhost:5000" -ForegroundColor Green
Write-Host ""

# Step 3: Start Web Frontend
Write-Host "[3/4] Starting Web Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\web'; Write-Host 'Web frontend starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host " Web frontend started on http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Step 4: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the app from:" -ForegroundColor White
Write-Host "  Laptop:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Phone:    http://$ip`:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://$ip`:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure your phone is on the same WiFi network!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (apps will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
