# Project Setup and Navigation Guide

This guide explains how to set up both the landing page and the IDE frontend with Firebase authentication.

## Project Structure

```
AICodeStudio/
├── landing-frontend/     # Landing page (React + TypeScript)
├── studio-frontend/      # IDE frontend (React + JavaScript) 
└── studio-backend/       # API backend
```

## Setup Instructions

### 1. Landing Frontend Setup

Navigate to the landing frontend directory:
```cmd
cd landing-frontend
```

Install dependencies:
```cmd
npm install
```

Start the development server (client-only for development):
```cmd
npm run dev:client
```

The landing page will be available at `http://localhost:5173`

> **Note**: Use `npm run dev:client` for development. The `npm run dev` command starts the full Express server on port 5000.

### 2. Studio Frontend Setup

Navigate to the studio frontend directory:
```bash
cd studio-frontend
```

Dependencies are already installed, but if needed:
```bash
npm install
```

**Configure Firebase** (Required):
1. Follow the Firebase setup guide in `FIREBASE_SETUP.md`
2. Create a `.env` file with your Firebase configuration
3. Enable Google and GitHub authentication in Firebase Console

Start the development server:
```bash
npm run dev
```

The IDE will be available at `http://localhost:5174`

### 3. Studio Backend Setup (Optional)

Navigate to the studio backend directory:
```bash
cd studio-backend
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm start
```

## Navigation Flow

### From Landing Page to IDE

The landing page now has two buttons that will open the IDE in a new tab:

1. **"Sign In" button** in the navigation bar
2. **"Launch IDE" button** in the hero section

Both buttons will open `http://localhost:5174` in a new tab, taking users directly to the IDE's login page.

### IDE Authentication

The IDE now supports three authentication methods:

1. **Email/Password** - Traditional registration and login
2. **Google Sign-In** - OAuth with Google account
3. **GitHub Sign-In** - OAuth with GitHub account

## Environment Configuration

### Landing Frontend
No special environment configuration required for basic functionality.

### Studio Frontend
Create a `.env` file in the `studio-frontend` directory:

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

## Development Workflow

1. **Start Landing Page**: `cd landing-frontend && npm run dev`
2. **Start IDE Frontend**: `cd studio-frontend && npm run dev`
3. **Start Backend** (if needed): `cd studio-backend && npm start`

### Recommended Development Setup

Open three terminal windows:

**Terminal 1 - Landing Page:**
```cmd
cd landing-frontend
npm run dev:client
```

**Terminal 2 - IDE Frontend:**
```cmd
cd studio-frontend
npm run dev
```

**Terminal 3 - Backend (optional):**
```cmd
cd studio-backend
npm start
```

## URLs

- **Landing Page**: http://localhost:5173
- **IDE Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000 (if running)

## Navigation Flow

### From Landing Page to IDE

The landing page has two buttons that will redirect to the IDE in the same tab:

1. **"Sign In" button** in the navigation bar
2. **"Launch IDE" button** in the hero section

Both buttons redirect to `http://localhost:5174` in the same tab, providing a seamless transition from the landing page to the IDE.

### IDE Frontend
- ✅ Enhanced login page with social authentication
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration
- ✅ Email/password authentication
- ✅ Improved UI with social login buttons
- ✅ Firebase authentication backend

## Next Steps

1. **Configure Firebase**: Follow `FIREBASE_SETUP.md` to set up authentication providers
2. **Test Authentication**: Try all three login methods in the IDE
3. **Customize Styling**: Adjust the social login buttons to match your design
4. **Add Error Handling**: Implement additional error states and loading indicators
5. **Production Setup**: Configure authorized domains for production deployment

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure both servers use different ports (5173 for landing, 5174 for IDE)
2. **Firebase errors**: Ensure all environment variables are set correctly
3. **Popup blocking**: Some browsers block OAuth popups - inform users to allow popups
4. **CORS issues**: Make sure your domains are added to Firebase authorized domains

### Debug Mode

Enable debug mode in the IDE by setting `VITE_ENABLE_DEBUG=true` in your `.env` file to see detailed Firebase logs.

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase configuration in the console
3. Ensure all environment variables are set correctly
4. Check that authentication providers are enabled in Firebase Console

https://gamma.app/docs/CodeSpace-52lormxh96x7hv2

cd landing-frontend
npm run dev

cd studio-frontend
npm run dev

cd studio-backend
npm run dev