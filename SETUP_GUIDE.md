# VaultCoin WebApp Setup Guide

## 🔒 Security Setup (IMPORTANT!)

Your webapp is now secure for public hosting on GitHub. Here's what you need to do:

### 1. Configure Firebase
1. Go to your Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the Firebase config values

### 2. Update Firebase Configuration
Edit `scripts/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "your-actual-project-id.firebaseapp.com",
  databaseURL: "https://your-actual-project-id-default-rtdb.firebaseio.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project-id.firebasestorage.app",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID",
  measurementId: "YOUR_ACTUAL_MEASUREMENT_ID"
};
```

### 3. Firebase Security Rules
Make sure your Firebase Firestore and Realtime Database have proper security rules:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Realtime Database Rules:**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🚀 Deployment

### Option 1: GitHub Pages
1. Push your code to GitHub
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at: `https://yourusername.github.io/your-repo-name`

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Deploy automatically on push
3. Get a custom domain

### Option 3: Vercel
1. Import your GitHub repo to Vercel
2. Automatic deployments
3. Great performance

## 🔧 Customization

### Update WebApp URL in Bot
In your Telegram bot, update the webapp URL to point to your deployed site:

```python
InlineKeyboardButton("🎮 Play Game", web_app=types.WebAppInfo(url="https://your-deployed-url.com"))
```

### Custom Domain
If you want a custom domain:
1. Buy a domain
2. Configure DNS to point to your hosting provider
3. Update the webapp URL in your bot

## 📱 Telegram WebApp Integration

The webapp automatically detects when it's running inside Telegram and:
- Gets user ID from Telegram context
- Expands to full screen
- Integrates with Telegram's UI

## 🛡️ Security Features

✅ Firebase config uses placeholder values  
✅ No hardcoded API keys  
✅ Proper .gitignore excludes sensitive files  
✅ Ready for public GitHub hosting  

## 🚨 Important Notes

- **Never commit real Firebase credentials to Git**
- **Keep your bot token secure** (in your bot folder)
- **Test thoroughly** before deploying to production
- **Monitor Firebase usage** to avoid unexpected costs

## 📞 Support

If you need help:
1. Check Firebase Console for errors
2. Verify your configuration values
3. Test in development first
4. Check browser console for JavaScript errors

---

**Your webapp is now ready for safe public hosting! 🎉** 