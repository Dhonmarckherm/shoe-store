# ✅ HTTPS Camera Access - Complete Working Solution

## The Problem
Your phone shows: `"unable to access camera. undefined is not an object (evaluating 'navigator.mediaDevices.getUserMedia')"`

**Root Cause:** You're opening the app in a **web browser** instead of **Expo Go**.

---

## ✅ SOLUTION 1: Use Expo Go (RECOMMENDED - Works Immediately)

This is the **easiest** and **most reliable** solution. No certificate installation needed!

### Step 1: Install Expo Go
- **iPhone:** https://apps.apple.com/app/expo-go/id982107779
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2: Start Expo
On your computer, run:
```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\mobile
npm start
```

### Step 3: Scan QR Code
- **Open the Expo Go app** on your phone (NOT Chrome, NOT Safari!)
- **Scan the QR code** that appears in the Expo terminal

### Step 4: Test Face Recognition
1. Create account with email/password
2. Tap "Set Up" face recognition
3. Allow camera permission
4. Position face and tap camera button

**✅ This WILL work because Expo Go has native camera access!**

---

## ⚙️ SOLUTION 2: Install SSL Certificate (For Direct HTTPS)

If you want to use HTTPS directly without Expo Go:

### On Windows (Your Computer)
1. Double-click: `backend\certificates\shoe-store-cert.cer`
2. Click "Install Certificate"
3. Choose "Local Machine"
4. Place certificate in "Trusted Root Certification Authorities"
5. Complete the wizard

### On Android Phone
1. Copy `backend\certificates\cert.pem` to your phone
2. Rename it to `cert.cer`
3. Go to: Settings → Security → Encryption & credentials
4. Tap "Install a certificate" → "CA certificate"
5. Select the file and name it "Shoe Store"
6. Accept the warning

### On iPhone
1. Email `backend\certificates\cert.pem` to yourself or use AirDrop
2. Open the file on your iPhone
3. Go to: Settings → General → About → Certificate Trust Settings
4. Enable full trust for the certificate

### After Installing Certificate
Update your mobile API to use HTTPS:
- Backend: `https://10.111.5.200:5000`
- Mobile API already configured for this URL

---

## 🌐 SOLUTION 3: Use ngrok (Public HTTPS URL)

ngrok provides a publicly trusted HTTPS URL automatically.

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Start ngrok
```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\backend
ngrok http 5000
```

### Step 3: Copy ngrok URL
You'll see something like: `https://abc123.ngrok.io`

### Step 4: Update Mobile API
Edit `mobile/src/services/api.js`:
```javascript
const API_URL = 'https://abc123.ngrok.io/api'; // Use your ngrok URL
```

### Step 5: Update Backend .env
Edit `backend/.env`:
```env
HTTPS_ENABLED=false
```

### Step 6: Restart Everything
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Start backend
cd backend
npm run dev

# Start Expo
cd mobile
npm start
```

---

## 🔍 How to Verify You're Using Expo Go (NOT Browser)

| You're in Expo Go ✅ | You're in Browser ❌ |
|---------------------|---------------------|
| No URL bar | Browser URL bar visible |
| Full-screen app | Browser tabs visible |
| Native camera prompt | Browser camera permission |
| Face recognition works | Error about `navigator` |
| Scanned QR with Expo Go | Pressed 'w' or clicked browser link |

---

## 🚀 Quick Start (Guaranteed to Work)

1. **Install Expo Go** on your phone (see links above)
2. **Run this command** on your computer:
   ```bash
   cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\mobile
   npm start
   ```
3. **Open Expo Go app** on your phone
4. **Scan the QR code** (NOT with camera app, with Expo Go!)
5. **Create account** and **test face recognition**

---

## 📋 Current Configuration

| Service | URL | Status |
|---------|-----|--------|
| Backend (HTTPS) | https://10.111.5.200:5000 | ✅ Running |
| Backend (HTTP) | http://10.111.5.200:5000 | ✅ Running |
| Mobile (Expo) | Check Expo terminal | ✅ Ready |
| ngrok | Not running | ⏸️ Stopped |

---

## ❓ Still Not Working?

### "I don't see a QR code"
- Run: `cd mobile && npm start`
- Wait 10 seconds for QR code to appear

### "Camera permission denied"
- Go to: Settings → Expo Go → Enable Camera

### "Can't connect to backend"
- Make sure phone and computer are on same Wi-Fi
- Check firewall allows port 5000

### "Still getting navigator error"
- You're definitely in a browser
- Close browser completely
- Open Expo Go app
- Rescan QR code

---

## 📞 Emergency Contact

If nothing works:
1. Close all browser windows
2. Restart your phone
3. Reinstall Expo Go
4. Run `npm start` in mobile folder
5. Scan QR code with Expo Go (not browser!)

**Remember: Face recognition ONLY works in Expo Go, NOT in web browsers!**
