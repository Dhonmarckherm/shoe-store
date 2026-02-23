# Git & Deployment Setup Script

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git & Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
$gitVersion = git --version 2>$null
if (-not $gitVersion) {
    Write-Host "Git is not installed. Please install Git from: https://git-scm.com/" -ForegroundColor Red
    pause
    exit
}

Write-Host "[1/4] Initializing Git repository..." -ForegroundColor Yellow

if (-not (Test-Path "$projectDir\.git")) {
    git init
    Write-Host "  ✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "  ✓ Git repository already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/4] Adding files to Git..." -ForegroundColor Yellow

git add .
Write-Host "  ✓ Files staged" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Creating initial commit..." -ForegroundColor Yellow

git commit -m "Initial commit - Ready for deployment" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Commit created" -ForegroundColor Green
} else {
    Write-Host "  ℹ No changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Git status..." -ForegroundColor Yellow

git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Git Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a repository on GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Connect to GitHub (replace YOUR_USERNAME and REPO_NAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy Backend to Render:" -ForegroundColor White
Write-Host "   https://render.com → New + → Web Service → Connect GitHub" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com → Add New Project → Import GitHub" -ForegroundColor Gray
Write-Host ""
Write-Host "See DEPLOYMENT-GUIDE.md for detailed instructions!" -ForegroundColor Yellow
Write-Host ""
pause
