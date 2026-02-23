# Shoe Store Application - Auto Start Script
# This script starts the backend, web frontend, and mobile app automatically

param(
    [switch]$SkipBackend,
    [switch]$SkipWeb,
    [switch]$SkipMobile,
    [switch]$SeedDatabase
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shoe Store Application Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-PortInUse {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to wait for a service to be ready
function Wait-ForService {
    param($Url, $MaxAttempts = 30)
    $attempt = 0
    while ($attempt -lt $MaxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {}
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
    return $false
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Start Backend
if (-not $SkipBackend) {
    Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Green
    
    if (Test-PortInUse -Port 5000) {
        Write-Host "  Warning: Port 5000 is already in use. Backend may already be running." -ForegroundColor Yellow
    } else {
        Set-Location "$scriptDir\backend"
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing backend dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Seed database if requested
        if ($SeedDatabase) {
            Write-Host "  Seeding database..." -ForegroundColor Yellow
            node src/utils/seedProducts.js
        }
        
        # Start backend in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; npm run dev" -WindowStyle Normal
        
        Write-Host "  Waiting for backend to be ready..." -NoNewline -ForegroundColor Yellow
        $ready = Wait-ForService -Url "http://localhost:5000/health"
        if ($ready) {
            Write-Host " Ready!" -ForegroundColor Green
        } else {
            Write-Host " Timeout!" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Start Web Frontend
if (-not $SkipWeb) {
    Write-Host "[2/3] Starting Web Frontend..." -ForegroundColor Green
    
    if (Test-PortInUse -Port 5173) {
        Write-Host "  Warning: Port 5173 is already in use. Web app may already be running." -ForegroundColor Yellow
    } else {
        Set-Location "$scriptDir\web"
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing web dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start web in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\web'; npm run dev" -WindowStyle Normal
        
        Write-Host "  Waiting for web app to be ready..." -NoNewline -ForegroundColor Yellow
        $ready = Wait-ForService -Url "http://localhost:5173"
        if ($ready) {
            Write-Host " Ready!" -ForegroundColor Green
        } else {
            Write-Host " Timeout!" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Start Mobile App
if (-not $SkipMobile) {
    Write-Host "[3/3] Starting Mobile App..." -ForegroundColor Green
    
    Set-Location "$scriptDir\mobile"
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installing mobile dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start Expo in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\mobile'; npx expo start" -WindowStyle Normal
    
    Write-Host "  Mobile app starting in new window..." -ForegroundColor Green
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Application Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not $SkipBackend) {
    Write-Host "  Backend:   http://localhost:5000" -ForegroundColor Green
}
if (-not $SkipWeb) {
    Write-Host "  Web App:   http://localhost:5173" -ForegroundColor Green
}
if (-not $SkipMobile) {
    Write-Host "  Mobile:    Expo Dev Tools (check new window)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit this launcher (apps will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
