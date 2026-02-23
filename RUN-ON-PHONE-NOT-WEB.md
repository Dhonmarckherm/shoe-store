# ⚠️ FACE RECOGNITION NOT WORKING? READ THIS! ⚠️

## The Problem

You're seeing this error:
```
unable to access camera. undefined is not an object (evaluating 'navigator.mediaDevices.getUserMedia')
```

**This happens because you're running the app in a WEB BROWSER** (Chrome, Safari, etc.)

Web browsers on mobile devices **BLOCK** camera access for face recognition due to security restrictions.

---

## ✅ THE SOLUTION: Use Expo Go App

### Step 1: Install Expo Go (If you haven't)

**Scan this QR code with your phone's regular camera app:**

- **iPhone**: [Download Expo Go from App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Download Expo Go from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 2: Open the App CORRECTLY

**❌ WRONG WAY (What you're doing now):**
- Pressing `w` in the terminal
- Clicking to open in web browser
- Opening `localhost:5173` in Chrome/Safari

**✅ CORRECT WAY:**

1. **Open the Expo Go app** on your phone (NOT your browser!)
2. **Look at your computer screen** - there should be a QR code in the Expo terminal window
3. **Use Expo Go to scan the QR code:**
   - **iPhone**: Open Camera app → point at QR code → tap notification
   - **Android**: Open Expo Go app → tap "Scan QR Code" → point at screen

### Step 3: Verify You're in Expo Go

When running correctly, you'll see:
- ✅ "ShoeStore" as the app name (not a browser URL bar)
- ✅ Full-screen app (no browser address bar)
- ✅ Camera permission prompt from Expo, not browser

---

## 🔍 How to Tell If You're Doing It Wrong

| You're in a Browser ❌ | You're in Expo Go ✅ |
|------------------------|---------------------|
| URL bar at top/bottom | No URL bar |
| Browser tabs visible | Full-screen app |
| Pressed 'w' in terminal | Scanned QR with Expo Go app |
| Error about `navigator` | Camera works normally |

---

## 🚀 Quick Start Commands

On your computer, run:

```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\mobile
npm start
```

A new window will open showing a QR code.

**DO NOT press 'w'!** Instead:
1. Pick up your phone
2. Open Expo Go app
3. Scan the QR code

---

## 📱 Still Having Issues?

### "I don't see a QR code"

Run this command:
```bash
cd C:\Users\Lenovo\Downloads\Frecognition\shoe-store\mobile
npm start -- --tunnel
```

This will show a QR code that works from anywhere.

### "Camera still doesn't work in Expo Go"

1. **Check permissions**: Go to phone Settings → Expo Go → Enable Camera
2. **Restart Expo Go**: Close the app completely and reopen
3. **Clear cache**: In Expo Go, go to Settings → Clear Cache

### "I can't connect to backend"

Make sure:
- ✅ Phone and computer are on the **same Wi-Fi network**
- ✅ Backend is running (check for PowerShell window showing "Server running")
- ✅ Firewall allows port 5000

---

## 🎯 Summary

| What | How |
|------|-----|
| **Install** | Expo Go app from App Store/Play Store |
| **Open App** | Scan QR code with Expo Go (NOT browser!) |
| **DO NOT** | Press 'w' or open in Chrome/Safari |
| **Face Recognition** | Only works in Expo Go, NOT in browser |

---

## 📞 Need Help?

1. Check if you pressed 'w' - if yes, **don't do that!**
2. Close the browser version
3. Install Expo Go
4. Scan the QR code properly

**The app is DESIGNED to run in Expo Go, not in a web browser.**
