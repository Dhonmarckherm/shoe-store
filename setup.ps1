# Shoe Store Application - Setup Script
# This script sets up the entire application automatically

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shoe Store Application Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js is not installed. Please install Node.js v16 or higher." -ForegroundColor Red
    exit 1
}

# Check MongoDB
$mongoRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:27017" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
} catch {
    # MongoDB doesn't have a simple HTTP endpoint, check if process is running
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        $mongoRunning = $true
        Write-Host "  MongoDB: Running" -ForegroundColor Green
    }
}

if (-not $mongoRunning) {
    Write-Host "  WARNING: MongoDB doesn't appear to be running." -ForegroundColor Yellow
    Write-Host "  Please start MongoDB before running the application." -ForegroundColor Yellow
}

Write-Host ""

# Install Backend Dependencies
Write-Host "[1/6] Installing Backend Dependencies..." -ForegroundColor Green
Set-Location "$scriptDir\backend"
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "  Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Backend dependencies already installed." -ForegroundColor Gray
}

# Create Backend .env
if (-not (Test-Path ".env")) {
    Write-Host "  Creating backend .env file..." -ForegroundColor Yellow
    @"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoe-store
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
ENCRYPTION_KEY=your-32-character-encryption-key-for-face-data
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "  .env file created. Please update it with secure values." -ForegroundColor Cyan
}

# Install Web Dependencies
Write-Host "[2/6] Installing Web Dependencies..." -ForegroundColor Green
Set-Location "$scriptDir\web"
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "  Web dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Web dependencies already installed." -ForegroundColor Gray
}

# Create Web .env if needed
if (-not (Test-Path ".env")) {
    @"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Install Mobile Dependencies
Write-Host "[3/6] Installing Mobile Dependencies..." -ForegroundColor Green
Set-Location "$scriptDir\mobile"
if (-not (Test-Path "node_modules")) {
    npm install
    Write-Host "  Mobile dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Mobile dependencies already installed." -ForegroundColor Gray
}

# Seed Database
Write-Host "[4/6] Seeding Database..." -ForegroundColor Green
Set-Location "$scriptDir\backend"
node src/utils/seedProducts.js
Write-Host "  Database seeded with sample products." -ForegroundColor Green

# Create face-api models directory
Write-Host "[5/6] Setting up Face Recognition Models..." -ForegroundColor Green
$modelsDir = "$scriptDir\web\public\models"
if (-not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null
    Write-Host "  Created models directory at: $modelsDir" -ForegroundColor Green
    Write-Host "" -ForegroundColor Cyan
    Write-Host "  IMPORTANT: Download face-api.js models from:" -ForegroundColor Cyan
    Write-Host "  https://github.com/justadudewhohacks/face-api.js/tree/master/weights" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor Cyan
    Write-Host "  Required files:" -ForegroundColor Yellow
    Write-Host "    - tiny_face_detector_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "    - tiny_face_detector_model-shard1" -ForegroundColor Gray
    Write-Host "    - face_landmark_68_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "    - face_landmark_68_model-shard1" -ForegroundColor Gray
    Write-Host "    - face_recognition_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "    - face_recognition_model-shard1" -ForegroundColor Gray
    Write-Host "    - face_recognition_model-shard2" -ForegroundColor Gray
} else {
    Write-Host "  Models directory already exists." -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Green
Write-Host "  .\start-all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or start components individually:" -ForegroundColor Green
Write-Host "  .\start-backend.ps1  - Start backend only" -ForegroundColor Gray
Write-Host "  .\start-web.ps1      - Start web app only" -ForegroundColor Gray
Write-Host "  cd mobile && npx expo start  - Start mobile app" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start now
$startNow = Read-Host "Would you like to start the application now? (y/n)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    & "$scriptDir\start-all.ps1"
}
