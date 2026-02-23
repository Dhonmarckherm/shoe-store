# Complete Mobile Camera Setup Script
# This script sets up HTTPS for mobile camera access using ngrok

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectDir "backend"
$mobileDir = Join-Path $projectDir "mobile"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mobile Camera HTTPS Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop existing processes
Write-Host "[1/6] Stopping existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *expo*" 2>$null
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *backend*" 2>$null
Start-Sleep -Seconds 2
Write-Host "  Done!" -ForegroundColor Green
Write-Host ""

# Step 2: Start ngrok
Write-Host "[2/6] Starting ngrok tunnel..." -ForegroundColor Yellow
$ngrokProcess = Start-Process ngrok -ArgumentList "http", "5000" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 10
Write-Host "  ngrok started!" -ForegroundColor Green
Write-Host ""

# Step 3: Get ngrok URL
Write-Host "[3/6] Getting ngrok HTTPS URL..." -ForegroundColor Yellow
try {
    $ngrokResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction Stop
    $ngrokUrl = $ngrokResponse.tunnels[0].public_url
    Write-Host "  ngrok URL: $ngrokUrl" -ForegroundColor Green
} catch {
    Write-Host "  Could not get ngrok URL automatically. Please check ngrok window." -ForegroundColor Yellow
    $ngrokUrl = Read-Host "Enter the ngrok URL shown in the ngrok window (e.g., https://abc123.ngrok.io)"
}
Write-Host ""

# Step 4: Update backend .env
Write-Host "[4/6] Updating backend configuration..." -ForegroundColor Yellow
$envFile = Join-Path $backendDir ".env"
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace 'HTTPS_ENABLED=(true|false)', 'HTTPS_ENABLED=false'
Set-Content $envFile $envContent -NoNewline
Write-Host "  Backend configured for HTTP (ngrok handles HTTPS)" -ForegroundColor Green
Write-Host ""

# Step 5: Update mobile API
Write-Host "[5/6] Updating mobile API configuration..." -ForegroundColor Yellow
$apiFile = Join-Path $mobileDir "src\services\api.js"
$apiContent = Get-Content $apiFile -Raw

# Extract just the domain without protocol
$ngrokDomain = $ngrokUrl -replace 'https?://', ''

$apiContent = $apiContent -replace "const LOCAL_IP = '[^']+'", "const LOCAL_IP = '$ngrokDomain'"
$apiContent = $apiContent -replace "(Platform\.OS === 'web'.*?\n.*?)(https?://[^']+/api)", "const API_URL = '$ngrokUrl/api' // ngrok URL"
Set-Content $apiFile $apiContent -NoNewline
Write-Host "  Mobile API updated to: $ngrokUrl/api" -ForegroundColor Green
Write-Host ""

# Step 6: Start backend
Write-Host "[6/6] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "  Backend started!" -ForegroundColor Green
Write-Host ""

# Start Expo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Expo Development Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mobileDir'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  ngrok:    $ngrokUrl" -ForegroundColor White
Write-Host "  Mobile:   $ngrokUrl/api" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for Expo to show QR code" -ForegroundColor White
Write-Host "  2. Install Expo Go on your phone (if not installed)" -ForegroundColor White
Write-Host "  3. Open Expo Go app and scan QR code" -ForegroundColor White
Write-Host "  4. Create account and test face recognition!" -ForegroundColor White
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "  - Keep the ngrok window open" -ForegroundColor White
Write-Host "  - ngrok URL changes each time you restart" -ForegroundColor White
Write-Host "  - Run this script again if you restart" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
