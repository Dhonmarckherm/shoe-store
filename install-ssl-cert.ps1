# Install SSL Certificate and Setup Mobile Camera
# Run this script as Administrator

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$certFile = Join-Path $projectDir "backend\certificates\shoe-store-cert.cer"
$certPemFile = Join-Path $projectDir "backend\certificates\cert.pem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SSL Certificate Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script must be run as Administrator." -ForegroundColor Red
    Write-Host "Right-click this file and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can manually install the certificate:" -ForegroundColor Yellow
    Write-Host "  1. Double-click: backend\certificates\shoe-store-cert.cer" -ForegroundColor White
    Write-Host "  2. Click 'Install Certificate'" -ForegroundColor White
    Write-Host "  3. Choose 'Local Machine'" -ForegroundColor White
    Write-Host "  4. Place in 'Trusted Root Certification Authorities'" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

Write-Host "[1/3] Installing SSL certificate..." -ForegroundColor Yellow

try {
    # Import certificate to Trusted Root
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certFile)
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    $store.Add($cert)
    $store.Close()
    
    Write-Host "  ✓ Certificate installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to install certificate: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation steps:" -ForegroundColor Yellow
    Write-Host "  1. Press Win+R, type: certmgr.msc" -ForegroundColor White
    Write-Host "  2. Expand 'Trusted Root Certification Authorities'" -ForegroundColor White
    Write-Host "  3. Right-click 'Certificates' → All Tasks → Import" -ForegroundColor White
    Write-Host "  4. Select: backend\certificates\shoe-store-cert.cer" -ForegroundColor White
    Write-Host "  5. Complete the wizard" -ForegroundColor White
}

Write-Host ""
Write-Host "[2/3] Getting your IP address..." -ForegroundColor Yellow

# Get local IP
$ip = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -like '10.*' -and $_.InterfaceAlias -notlike '*Hyper-V*'}).IPAddress | Select-Object -First
if (-not $ip) {
    $ip = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -like '192.168.*'}).IPAddress | Select-Object -First
}

if ($ip) {
    Write-Host "  ✓ Your IP: $ip" -ForegroundColor Green
} else {
    Write-Host "  ✗ Could not detect IP automatically" -ForegroundColor Red
    $ip = Read-Host "  Enter your IP address manually"
}

Write-Host ""
Write-Host "[3/3] Updating mobile configuration..." -ForegroundColor Yellow

$mobileDir = Join-Path $projectDir "mobile"
$apiFile = Join-Path $mobileDir "src\services\api.js"

if (Test-Path $apiFile) {
    $apiContent = Get-Content $apiFile -Raw
    $apiContent = $apiContent -replace "const LOCAL_IP = '[^']+'", "const LOCAL_IP = '$ip'"
    $apiContent = $apiContent -replace "https://[^:]+:5000/api", "https://$ip`:5000/api"
    Set-Content $apiFile $apiContent -NoNewline
    Write-Host "  ✓ Mobile API updated to: https://$ip`:5000/api" -ForegroundColor Green
} else {
    Write-Host "  ✗ Mobile API file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "For Mobile Device (Phone):" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option A: Install Certificate on Phone (Recommended)" -ForegroundColor White
Write-Host "  1. Copy this file to your phone: backend\certificates\cert.pem" -ForegroundColor Gray
Write-Host "  2. Rename it to: cert.cer" -ForegroundColor Gray
Write-Host "  3. On Android:" -ForegroundColor Gray
Write-Host "     Settings → Security → Encryption & credentials → Install a certificate → CA certificate" -ForegroundColor Gray
Write-Host "  4. On iOS:" -ForegroundColor Gray
Write-Host "     Open the file → Settings → General → About → Certificate Trust Settings → Enable trust" -ForegroundColor Gray
Write-Host ""
Write-Host "Option B: Use ngrok (No Certificate Needed)" -ForegroundColor White
Write-Host "  Run this command:" -ForegroundColor Gray
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    ngrok http 5000" -ForegroundColor Gray
Write-Host "  Then update mobile/src/services/api.js with the ngrok URL" -ForegroundColor Gray
Write-Host ""
Write-Host "Current Configuration:" -ForegroundColor Cyan
Write-Host "  Backend HTTPS: https://$ip`:5000" -ForegroundColor White
Write-Host "  Mobile API:    https://$ip`:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure backend is running: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "  2. Make sure Expo is running: cd mobile; npm start" -ForegroundColor Gray
Write-Host "  3. Install certificate on your phone (see above)" -ForegroundColor Gray
Write-Host "  4. Scan QR code with Expo Go app" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
