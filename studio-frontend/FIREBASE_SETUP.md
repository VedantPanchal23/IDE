# Firebase Authentication Setup Guide

## Prerequisites

1. **Firebase Project**: Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Web App**: Add a Web app to your Firebase project
3. **Authentication**: Enable Authentication in your Firebase project

## Enable Authentication Providers

### 1. Email/Password Authentication
- Go to Firebase Console → Authentication → Sign-in method
- Enable "Email/Password" provider

### 2. Google Authentication
- Enable "Google" provider in Firebase Console
- No additional configuration needed for web apps

### 3. GitHub Authentication
- Enable "GitHub" provider in Firebase Console
- You'll need to:
  1. Create a GitHub OAuth App at [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
  2. Set Authorization callback URL to: `https://your-project-id.firebaseapp.com/__/auth/handler`
  3. Copy Client ID and Client Secret to Firebase Console

## Environment Variables

Create or update your `.env` file with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional
VITE_ENABLE_DEBUG=true
```

## Firebase Console Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name and follow the setup steps

### 2. Add Web App
1. In your Firebase project, click the web icon (`</>`)
2. Register your app with a nickname
3. Copy the configuration object

### 3. Enable Authentication
1. Go to Authentication → Get started
2. Go to Sign-in method tab
3. Enable the providers you need:
   - Email/Password
   - Google
   - GitHub

### 4. Configure GitHub OAuth (if using GitHub auth)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:5174` (for development)
   - Authorization callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`
4. Copy the Client ID and Client Secret
5. In Firebase Console → Authentication → Sign-in method → GitHub
6. Paste the Client ID and Client Secret

## Authorized Domains

For production, add your domain to the authorized domains list:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your production domain

## Security Rules (Optional)

If using Firestore, you might want to update security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Test each authentication method:
   - Email/Password registration and login
   - Google sign-in
   - GitHub sign-in

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

2. **"GitHub OAuth App not found"**
   - Verify GitHub OAuth App configuration
   - Check Client ID and Secret in Firebase Console

3. **"Popup blocked"**
   - Allow popups for your domain
   - Inform users about popup requirements

4. **Environment variables not loading**
   - Ensure `.env` file is in the project root
   - Restart the development server after adding variables
   - Check that variables start with `VITE_`

### Debug Mode

Enable debug mode by setting `VITE_ENABLE_DEBUG=true` in your `.env` file to see Firebase initialization logs.
