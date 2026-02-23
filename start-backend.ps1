# Start Backend Only
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\backend"

Write-Host "Starting Shoe Store Backend..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoe-store
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
ENCRYPTION_KEY=your-32-character-encryption-key-for-face-data
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created. Please update it with your configuration." -ForegroundColor Cyan
}

npm run dev
