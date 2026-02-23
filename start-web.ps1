# Start Web Frontend Only
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\web"

Write-Host "Starting Shoe Store Web App..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if face-api models exist
if (-not (Test-Path "public\models")) {
    Write-Host "Creating models directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "public\models" -Force | Out-Null
    Write-Host "Please download face-api.js models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights" -ForegroundColor Cyan
    Write-Host "Place these files in public/models:" -ForegroundColor Cyan
    Write-Host "  - tiny_face_detector_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "  - tiny_face_detector_model-shard1" -ForegroundColor Gray
    Write-Host "  - face_landmark_68_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "  - face_landmark_68_model-shard1" -ForegroundColor Gray
    Write-Host "  - face_recognition_model-weights_manifest.json" -ForegroundColor Gray
    Write-Host "  - face_recognition_model-shard1 (and shard2)" -ForegroundColor Gray
}

npm run dev
