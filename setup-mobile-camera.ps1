# Mobile Face Recognition - Quick Setup Script
# This script helps you configure the backend for mobile camera access

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('https', 'ngrok')]
    [string]$Mode,
    
    [string]$NgrokUrl
)

$ErrorActionPreference = "Stop"
$backendDir = Join-Path $PSScriptRoot "backend"
$mobileDir = Join-Path $PSScriptRoot "mobile"
$envFile = Join-Path $backendDir ".env"
$apiFile = Join-Path $mobileDir "src\services\api.js"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mobile Face Recognition Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current IP
$ip = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -like '10.*'}).IPAddress | Select-Object -First
if (-not $ip) {
    $ip = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -like '192.168.*'}).IPAddress | Select-Object -First
}

if (-not $ip) {
    Write-Host "Warning: Could not automatically detect IP address" -ForegroundColor Yellow
    $ip = Read-Host "Enter your computer's IP address"
}

Write-Host "Detected IP: $ip" -ForegroundColor Green
Write-Host ""

if ($Mode -eq 'https') {
    Write-Host "Configuring HTTPS mode..." -ForegroundColor Green
    
    # Update backend .env
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'HTTPS_ENABLED=(true|false)', 'HTTPS_ENABLED=true'
    Set-Content $envFile $envContent -NoNewline
    
    Write-Host "  ✓ Backend configured for HTTPS" -ForegroundColor Green
    
    # Update mobile API
    $apiContent = Get-Content $apiFile -Raw
    $apiContent = $apiContent -replace "const LOCAL_IP = '[^']+'", "const LOCAL_IP = '$ip'"
    $apiContent = $apiContent -replace "https://[^:]+:5000/api", "https://$ip`:5000/api"
    Set-Content $apiFile $apiContent -NoNewline
    
    Write-Host "  ✓ Mobile API updated to: https://$ip`:5000/api" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart the backend: cd backend; npm run dev" -ForegroundColor White
    Write-Host "  2. Restart Expo: cd mobile; npm start" -ForegroundColor White
    Write-Host "  3. On your phone, you may need to install the SSL certificate:" -ForegroundColor White
    Write-Host "     Certificate location: backend\certificates\cert.pem" -ForegroundColor Yellow
    
} elseif ($Mode -eq 'ngrok') {
    if (-not $NgrokUrl) {
        Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
        
        # Check if ngrok is installed
        $ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
        if (-not $ngrokPath) {
            Write-Host "ngrok not found. Installing..." -ForegroundColor Yellow
            npm install -g ngrok
        }
        
        # Start ngrok in background
        Start-Process ngrok -ArgumentList "http", "5000" -WindowStyle Normal
        
        Write-Host "Waiting for ngrok to start (10 seconds)..." -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Write-Host " Done!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Check the ngrok window for your HTTPS URL" -ForegroundColor Cyan
        Write-Host "Then run this script again with the URL:" -ForegroundColor White
        Write-Host "  .\setup-mobile-camera.ps1 -Mode ngrok -NgrokUrl 'https://abc123.ngrok.io'" -ForegroundColor Yellow
        return
    }
    
    # Update backend .env
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'HTTPS_ENABLED=(true|false)', 'HTTPS_ENABLED=false'
    Set-Content $envFile $envContent -NoNewline
    
    Write-Host "  ✓ Backend configured for HTTP (ngrok handles HTTPS)" -ForegroundColor Green
    
    # Update mobile API
    $ngrokDomain = $NgrokUrl -replace 'https?://', ''
    $apiContent = Get-Content $apiFile -Raw
    $apiContent = $apiContent -replace "const LOCAL_IP = '[^']+'", "const LOCAL_IP = '$ip'"
    $apiContent = $apiContent -replace "(Platform\.OS === 'web'.*?\n.*?)(https?://[^']+/api)", "`$1`"$NgrokUrl/api`" // ngrok URL"
    Set-Content $apiFile $apiContent -NoNewline
    
    Write-Host "  ✓ Mobile API updated to: $NgrokUrl/api" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Make sure ngrok is running (check separate window)" -ForegroundColor White
    Write-Host "  2. Restart the backend: cd backend; npm run dev" -ForegroundColor White
    Write-Host "  3. Restart Expo: cd mobile; npm start" -ForegroundColor White
    Write-Host "  4. Scan QR code with Expo Go (NOT web browser!)" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
