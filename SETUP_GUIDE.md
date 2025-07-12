# 🚀 VaultCoin WebApp - Complete Setup Guide

## 📋 **What We've Built**
- ✅ Premium mining interface with 24-hour auto-mining
- ✅ Shop system with boosts, vault upgrades, NFTs
- ✅ Real-time leaderboards with multiple categories
- ✅ User profiles with achievements and referrals
- ✅ Social media page with community links
- ✅ Firebase integration ready
- ✅ Telegram WebApp integration ready

## 🔥 **Step 1: Firebase Setup**

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `vaultcoin-webapp` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### 1.2 Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location close to your users
5. Click "Done"

### 1.3 Get Your Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app with name: `VaultCoin WebApp`
5. Copy the config object

### 1.4 Update Firebase Config
Replace the placeholder config in `scripts/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🤖 **Step 2: Telegram Bot Setup**

### 2.1 Create Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose a name: `VaultCoin Bot`
4. Choose a username: `your_vaultcoin_bot` (must end in 'bot')
5. Save the bot token (you'll need this later)

### 2.2 Configure Bot for WebApp
1. Send `/setmenubutton` to BotFather
2. Select your bot
3. Set the button text: `🚀 Open VaultCoin`
4. Set the URL: `https://your-username.github.io/vaultcoin-webapp2/` (we'll update this after deployment)

### 2.3 Enable WebApp Features
1. Send `/mybots` to BotFather
2. Select your bot
3. Go to "Bot Settings" → "Inline Mode"
4. Turn on inline mode
5. Set inline placeholder: `Search VaultCoin features...`

## 🌐 **Step 3: GitHub Pages Deployment**

### 3.1 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it: `vaultcoin-webapp2`
4. Make it public
5. Don't initialize with README (we already have one)

### 3.2 Upload Your Files
```bash
# In your project folder
git init
git add .
git commit -m "Initial VaultCoin WebApp commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vaultcoin-webapp2.git
git push -u origin main
```

### 3.3 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to "Pages"
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

Your WebApp will be available at: `https://YOUR_USERNAME.github.io/vaultcoin-webapp2/`

## 🔗 **Step 4: Connect Everything**

### 4.1 Update Telegram Bot WebApp URL
1. Go back to BotFather
2. Send `/setmenubutton`
3. Select your bot
4. Update the URL to your GitHub Pages URL

### 4.2 Test the Integration
1. Open your bot in Telegram
2. Click the menu button
3. The WebApp should open with your VaultCoin interface
4. Test mining, shop, and other features

## 🔒 **Step 5: Security & Production**

### 5.1 Secure Firestore Rules
Replace the test mode rules with secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public leaderboard data (read-only)
    match /leaderboards/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 5.2 Enable Authentication (Optional)
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Anonymous" authentication
4. This provides additional security

## 🧪 **Step 6: Testing Checklist**

### ✅ Basic Functionality
- [ ] WebApp loads in Telegram
- [ ] Navigation between pages works
- [ ] Mining button responds
- [ ] Shop items display
- [ ] Leaderboard loads
- [ ] Profile shows user data
- [ ] Social links open correctly

### ✅ Firebase Integration
- [ ] User data saves to Firestore
- [ ] Balance updates in real-time
- [ ] Mining progress persists
- [ ] Shop purchases work
- [ ] Leaderboard updates

### ✅ Telegram Integration
- [ ] User ID is captured correctly
- [ ] Referral links work
- [ ] WebApp expands properly
- [ ] Back button works

## 🚨 **Troubleshooting**

### Common Issues:

**1. Firebase Connection Failed**
- Check your API key is correct
- Verify Firestore is enabled
- Check browser console for errors

**2. Telegram WebApp Not Loading**
- Ensure bot has WebApp enabled
- Check the WebApp URL is correct
- Verify HTTPS is working

**3. Navigation Not Working**
- Check all HTML files are uploaded
- Verify file paths are correct
- Clear browser cache

**4. Mining Not Working**
- Check Firebase rules allow write access
- Verify user authentication
- Check browser console for errors

## 📱 **Customization Options**

### Update Social Links
Edit `scripts/social.js` to update your social media links:

```javascript
this.socialLinks = {
  telegram: 'https://t.me/YOUR_CHANNEL',
  youtube: 'https://youtube.com/@YOUR_CHANNEL',
  twitter: 'https://twitter.com/YOUR_HANDLE',
  // ... etc
};
```

### Update Vault Tiers
Modify vault tier logic in `scripts/firebase-config.js`:

```javascript
const tierMultiplier = {
  'silver': 1,
  'gold': 1.5,
  'diamond': 2,
  'platinum': 3,
  'elite': 5
};
```

### Add New Shop Items
Add items to the `shopItems` array in `scripts/shop.js`:

```javascript
{
  id: 'new_item',
  name: 'New Item',
  description: 'Description here',
  price: 100,
  category: 'boosts',
  icon: 'zap'
}
```

## 🎯 **Next Steps**

1. **Test Everything**: Go through the testing checklist
2. **Customize**: Update social links, vault tiers, shop items
3. **Promote**: Share your bot with your community
4. **Monitor**: Check Firebase Analytics for usage
5. **Scale**: Add more features as your community grows

## 📞 **Support**

If you run into issues:
1. Check the browser console for errors
2. Verify all URLs and API keys are correct
3. Test in different browsers/devices
4. Check Firebase Console for data issues

---

**🎉 Congratulations! You now have a fully functional VaultCoin WebApp!**

Your users can:
- Mine VLTC daily with the 24-hour system
- Upgrade their vault tiers
- Shop for boosts and NFTs
- Compete on leaderboards
- Earn achievements
- Refer friends
- Connect with your community

The WebApp is now ready for your community! 🚀✨ 