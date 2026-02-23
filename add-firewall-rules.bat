@echo off
echo ========================================
echo   Adding Firewall Rules for Shoe Store
echo ========================================
echo.

echo Adding rule for Vite (Port 5173)...
netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173

echo Adding rule for Node.js Backend (Port 5000)...
netsh advfirewall firewall add rule name="Node 5000" dir=in action=allow protocol=TCP localport=5000

echo Adding rule for Node.js executable...
netsh advfirewall firewall add rule name="Node.js Dev" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes

echo.
echo ========================================
echo   Firewall Rules Added Successfully!
echo ========================================
echo.
echo You can now access the app from your phone at:
echo   http://YOUR_IP:5173
echo.
pause
