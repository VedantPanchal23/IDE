# Firebase Environment Variables Guide

## 🔑 **Required Firebase Keys**

### **VITE_FIREBASE_API_KEY**
- **Used for**: Firebase SDK initialization and API authentication
- **Where**: `src/config/firebase.js`
- **Purpose**: Authenticates your app with Firebase services
- **Example**: `AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz`

### **VITE_FIREBASE_AUTH_DOMAIN**
- **Used for**: Authentication redirects and email verification
- **Where**: `src/config/firebase.js`
- **Purpose**: Handles Firebase Auth domain for your project
- **Format**: `your-project-id.firebaseapp.com`

### **VITE_FIREBASE_PROJECT_ID**
- **Used for**: Firestore database connection
- **Where**: `src/config/firebase.js`, `src/services/FileSystemService.js`
- **Purpose**: Identifies your Firebase project for Firestore operations
- **Example**: `my-ide-project-12345`

### **VITE_FIREBASE_STORAGE_BUCKET**
- **Used for**: File uploads and storage (future feature)
- **Where**: `src/config/firebase.js`
- **Purpose**: Cloud Storage for user file uploads
- **Format**: `your-project-id.appspot.com`

### **VITE_FIREBASE_MESSAGING_SENDER_ID**
- **Used for**: Cloud messaging (if implemented)
- **Where**: `src/config/firebase.js`
- **Purpose**: Push notifications and messaging
- **Example**: `123456789012`

### **VITE_FIREBASE_APP_ID**
- **Used for**: App identification and analytics
- **Where**: `src/config/firebase.js`
- **Purpose**: Unique identifier for your Firebase app
- **Example**: `1:123456789012:web:abc123def456ghi789`

## 📊 **Optional Firebase Keys**

### **VITE_FIREBASE_MEASUREMENT_ID**
- **Used for**: Google Analytics integration
- **Where**: `src/config/firebase.js`
- **Purpose**: Track user analytics and app usage
- **Example**: `G-ABCDEFGHIJ`
- **Required**: No (only if you enable Analytics)

## 🛠️ **Application Configuration Keys**

### **VITE_APP_ENV**
- **Used for**: Environment-specific behavior
- **Where**: Throughout the app for conditional logic
- **Values**: `development`, `staging`, `production`

### **VITE_APP_VERSION**
- **Used for**: Version display and debugging
- **Where**: About page, error reporting
- **Example**: `1.0.0`

### **VITE_API_BASE_URL**
- **Used for**: Code execution backend (if using custom server)
- **Where**: `src/services/CodeExecutionService.js` (if implemented)
- **Purpose**: Switch between local and production APIs
- **Example**: `http://localhost:3001` or `https://api.yourdomain.com`

### **VITE_ENABLE_ANALYTICS**
- **Used for**: Toggle analytics features
- **Where**: Analytics initialization code
- **Values**: `true`, `false`

### **VITE_ENABLE_DEBUG**
- **Used for**: Debug logging and development features
- **Where**: `src/config/firebase.js`, console logging
- **Values**: `true`, `false`

## 🗂️ **File Usage Map**

```
📁 Project Files Using Environment Variables:

 .env
├── All environment variables defined here

 src/config/firebase.js
├── VITE_FIREBASE_API_KEY
├── VITE_FIREBASE_AUTH_DOMAIN
├── VITE_FIREBASE_PROJECT_ID
├── VITE_FIREBASE_STORAGE_BUCKET
├── VITE_FIREBASE_MESSAGING_SENDER_ID
├── VITE_FIREBASE_APP_ID
├── VITE_FIREBASE_MEASUREMENT_ID
└── VITE_ENABLE_DEBUG

 src/contexts/UserContext.jsx
└── Uses Firebase auth (configured from firebase.js)

 src/services/FileSystemService.js
└── Uses Firestore (configured from firebase.js)

 src/components/*.jsx
└── Uses Firebase services through contexts/services
```

## 🔍 **How to Get These Keys**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Click the gear icon** → Project settings
4. **Scroll down to "Your apps"**
5. **Click on your web app** or create one
6. **Copy the config object** and map values to environment variables

## ⚠️ **Security Notes**

- ✅ **Safe to expose**: All `VITE_*` variables are bundled in your app (client-side)
- ✅ **Firebase API keys**: Safe to be public (they identify your project, not authenticate it)
- ⚠️ **Firestore security**: Configure Firestore security rules to protect user data
- 🔒 **Server-side secrets**: Never put server-side secrets in `VITE_*` variables

## 🚀 **Quick Setup**

1. Copy the `.env` file template
2. Replace placeholder values with your Firebase config
3. Save the file
4. Restart your development server: `npm run dev`
5. Check console for any missing variables

Your IDE will now use Firebase with proper environment variable configuration! 🎉
