# Shoe Store - Live Access Script (HTTPS for Face Recognition)
# Starts servers with HTTPS for phone and laptop face recognition

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shoe Store - HTTPS Live Access" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get Wi-Fi IP address
$wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" } | Select-Object -First 1).IPAddress

if (-not $wifiIP) {
    Write-Host "Error: Could not find Wi-Fi IP address" -ForegroundColor Red
    Write-Host "Please make sure you're connected to Wi-Fi" -ForegroundColor Yellow
    exit 1
}

Write-Host "Your Wi-Fi IP: $wifiIP" -ForegroundColor Green
Write-Host ""

# Update backend .env
$backendEnv = @"
PORT=5000
HOST=0.0.0.0
HTTPS_ENABLED=true

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/shoe-store

# Security Keys
JWT_SECRET=shoe-store-super-secret-jwt-key-2026
JWT_EXPIRE=24h
ENCRYPTION_KEY=shoe-store-32-char-encryption-key

NODE_ENV=development

# Client URL (HTTPS)
CLIENT_URL=https://$wifiIP`:5173

# Qwen AI API Key
QWEN_API_KEY=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
QWEN_MODEL=qwen/qwen3.5-plus-02-15
USE_QWEN=true
"@

Set-Content -Path ".\backend\.env" -Value $backendEnv
Write-Host "Updated backend .env" -ForegroundColor Green

# Update web .env
$webEnv = "VITE_API_URL=https://$wifiIP`:5000/api`n"
Set-Content -Path ".\web\.env" -Value $webEnv
Write-Host "Updated web .env" -ForegroundColor Green

# Update vite config
$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certificates/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certificates/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://$wifiIP`:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
"@

Set-Content -Path ".\web\vite.config.js" -Value $viteConfig
Write-Host "Updated vite.config.js" -ForegroundColor Green
Write-Host ""

# Kill existing processes on ports 5000 and 5173
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
$process5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
$process5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($process5000) { Stop-Process -Id $process5000 -Force -ErrorAction SilentlyContinue }
if ($process5173) { Stop-Process -Id $process5173 -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting Backend (HTTPS) on https://$wifiIP`:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend (HTTPS): https://$wifiIP`:5000' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

# Start web frontend
Write-Host "Starting Web Frontend (HTTPS) on https://$wifiIP`:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web'; Write-Host 'Web (HTTPS): https://$wifiIP`:5173' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 5

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HTTPS Servers Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SECURITY CERTIFICATE WARNING:" -ForegroundColor Yellow
Write-Host "Your browser will show a security warning (self-signed certificate)" -ForegroundColor Gray
Write-Host ""
Write-Host "To accept the certificate:" -ForegroundColor White
Write-Host "1. Click 'Advanced' or 'Details'" -ForegroundColor Gray
Write-Host "2. Click 'Proceed to site' or 'Accept the Risk'" -ForegroundColor Gray
Write-Host ""
Write-Host "Access from LAPTOP:" -ForegroundColor White
Write-Host "  https://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access from PHONE (same WiFi):" -ForegroundColor White
Write-Host "  https://$wifiIP`:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:" -ForegroundColor White
Write-Host "  https://$wifiIP`:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Face Recognition: Works on BOTH laptop and phone!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
