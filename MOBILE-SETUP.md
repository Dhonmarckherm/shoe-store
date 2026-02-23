# Mobile App Setup Instructions

## Important: Face Recognition Requires Physical Device

The face recognition feature **only works on physical devices or emulators**, NOT in web browsers. The error you encountered (`navigator.mediaDevices.getUserMedia`) indicates the app is running in a web browser context.

## Why HTTPS is Required

Modern mobile browsers require **HTTPS** for camera access due to security restrictions:

| Platform | HTTP | HTTPS |
|----------|------|-------|
| Desktop Chrome (localhost) | ✅ Works | ✅ Works |
| Mobile Chrome/Safari | ❌ Blocked | ✅ Works |
| Expo Go App | ✅ Works | ✅ Works |

**Solution**: The backend now runs on HTTPS with a self-signed certificate.

## How to Run on Your Phone (Recommended)

### Step 1: Install Expo Go

**On your phone:**
- **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store
- **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from the Play Store

### Step 2: Connect to Same Network

Make sure your **computer and phone are on the same Wi-Fi network**.

### Step 3: Trust the SSL Certificate (Important!)

Since we use a self-signed certificate, you need to trust it on your phone:

**For Android:**
1. Copy `backend\certificates\cert.pem` to your phone
2. Rename it to `cert.cer`
3. Go to Settings → Security → Encryption & credentials → Install a certificate → CA certificate
4. Select the file and name it "Shoe Store"
5. Accept the warning

**For iOS:**
1. Email `backend\certificates\cert.pem` to yourself or use AirDrop
2. Open the file on your iPhone
3. Go to Settings → General → About → Certificate Trust Settings
4. Enable full trust for the certificate

**Alternative: Skip Certificate Trust (Expo Go handles it)**
Expo Go may handle the certificate automatically. Try without installing first.

### Step 4: Start the Mobile App

```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\mobile
npm start
```

Or use the main start script which starts everything:
```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store
npm start
```

### Step 5: Scan QR Code

- **iOS**: Open the Camera app and scan the QR code shown in the Expo terminal
- **Android**: Open the Expo Go app and scan the QR code

**DO NOT press 'w' for web** - this will open the app in a browser where face recognition doesn't work!

## Alternative: Use ngrok (Easiest - No Certificate Needed!)

If you have trouble with the self-signed certificate, use ngrok to create a secure tunnel:

### Step 1: Install ngrok

```bash
npm install -g ngrok
```

### Step 2: Update .env

Edit `backend\.env`:
```env
HTTPS_ENABLED=false
```

### Step 3: Start ngrok

```bash
cd backend
ngrok http 5000
```

You'll see a URL like: `https://abc123.ngrok.io`

### Step 4: Update Mobile API URL

Edit `mobile/src/services/api.js`:
```javascript
const API_URL = 'https://abc123.ngrok.io/api'; // Use your ngrok URL
```

### Step 5: Restart Everything

```bash
# Stop all services
npm run stop

# Start all services
npm start
```

**Benefits of ngrok:**
- ✅ No certificate installation needed
- ✅ Works from anywhere (not just local network)
- ✅ Automatically trusted by mobile devices

**Drawbacks:**
- ⚠️ URL changes each time (unless you pay for ngrok)
- ⚠️ Slightly slower than direct connection

## Running on Emulator

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## Troubleshooting

### "Unable to access camera" Error

**Cause**: Running in web browser instead of Expo Go

**Solution**: 
1. Close the web browser version
2. Install Expo Go on your phone
3. Scan the QR code with Expo Go (not with regular camera)

### "Cannot connect to backend" Error

**Cause**: Backend not running or wrong IP address

**Solution**:
1. Make sure backend is running on port 5000
2. Check your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update `LOCAL_IP` in `mobile/src/services/api.js`

### Camera Permission Denied

**Solution**:
1. Go to your phone's Settings
2. Find Expo Go app
3. Enable Camera permission
4. Restart the app

## Quick Reference

| Action | Command |
|--------|---------|
| Start mobile app | `cd mobile && npm start` |
| Start on Android | `npm run android` |
| Start on iOS | `npm run ios` |
| Start on Web (no face rec) | `npm run web` |
| Clear cache | `npm start -- --clear` |

## Backend Must Be Running

Before using face recognition, ensure the backend is running:

```bash
cd backend
npm run dev
```

The backend should be accessible at `http://localhost:5000`
