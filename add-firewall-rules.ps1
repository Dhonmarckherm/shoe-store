# Allow Node.js and Vite development ports through Windows Firewall
# Run this script as Administrator

Write-Host "Adding firewall rules for development servers..." -ForegroundColor Cyan

# Allow Node.js
netsh advfirewall firewall add rule name="Node.js Port 5000" dir=in action=allow protocol=TCP localport=5000

# Allow Vite
netsh advfirewall firewall add rule name="Vite Port 5173" dir=in action=allow protocol=TCP localport=5173

# Allow Node.js executable
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes

Write-Host ""
Write-Host "Firewall rules added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now access the app from your phone at:" -ForegroundColor Yellow
Write-Host "  http://192.168.100.203:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
