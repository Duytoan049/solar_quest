# 🔥 Firebase Setup Guide

## Bước 1: Tạo Firebase Project

1. Truy cập: https://console.firebase.google.com/
2. Click **"Add project"** hoặc **"Create a project"**
3. Đặt tên project: `solar-quest` (hoặc tên bạn muốn)
4. Disable Google Analytics (không cần cho demo) → Click **Continue**
5. Đợi Firebase tạo project (~30 giây)

---

## Bước 2: Thêm Web App

1. Trong Firebase Console, click biểu tượng **`</>`** (Web)
2. Đặt App nickname: `Solar Quest Web`
3. **KHÔNG** check "Also set up Firebase Hosting"
4. Click **Register app**
5. **Copy** đoạn config code (giống dưới đây):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "solar-quest-xxxxx.firebaseapp.com",
  projectId: "solar-quest-xxxxx",
  storageBucket: "solar-quest-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```
 
6. Click **Continue to console**

---

## Bước 3: Enable Authentication

1. Trong Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Chọn tab **"Sign-in method"**
4. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle **Enable** ON
   - Click **Save**
5. Enable **Google Sign-In**:
   - Click "Google"
   - Toggle **Enable** ON
   - Chọn email support (email của bạn)
   - Click **Save**

---

## Bước 4: Setup Firestore Database

1. Trong Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho development)
   - **Lưu ý**: Test mode cho phép read/write tự do, sau khi demo xong nên đổi sang production mode với rules
4. Chọn region: `asia-southeast1` (Singapore) hoặc `us-central1` (US)
5. Click **Enable**

---

## Bước 5: Add Firebase Config vào .env

1. Mở file `.env` trong project
2. Thêm các dòng sau (thay values bằng config của bạn từ Bước 2):

```env
# ===================================================================
# 🔥 FIREBASE CONFIGURATION
# ===================================================================
# Get from: https://console.firebase.google.com/
# → Project Settings → Your apps → SDK setup and configuration
# ===================================================================

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=solar-quest-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=solar-quest-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=solar-quest-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

3. **Save** file `.env`
4. **RESTART** dev server:
   ```bash
   # Stop server (Ctrl + C)
   npm run dev
   ```

---

## Bước 6: Verify Setup

1. Vào browser, mở Console (F12)
2. Không có error về Firebase
3. Kiểm tra Firebase Console → Authentication → Users (sẽ thấy users khi đăng ký)

---

## 🔒 Security Rules (Production)

Sau khi demo xong, vào **Firestore Database → Rules** và thay bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Profiles collection
    match /profiles/{profileId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Leaderboard (read-only for all authenticated users)
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
  }
}
```

---

## 📝 Notes

- **Miễn phí**: 50GB storage, 1GB network/day, 20K writes/day
- **Spark plan**: Đủ cho demo/development
- **Upgrade**: Chỉ cần khi production với traffic cao
- **Backup**: Firestore tự động backup, không lo mất data

---

## ✅ Done!

Sau khi setup xong, Firebase sẽ tự động hoạt động. Code đã được implement sẵn! 🚀
