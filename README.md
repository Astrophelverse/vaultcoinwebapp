# 🪙 VaultCoin WebApp

A premium, futuristic Telegram WebApp for mining VaultCoin (VLTC) with a 24-hour auto-mining system, featuring metallic aesthetics, real-time leaderboards, and a comprehensive shop system.

## ✨ Features

### 🎯 Core Features
- **24-Hour Auto-Mining System** - Start mining once daily, claim rewards after 24 hours
- **Premium Metallic UI** - Futuristic design with silver, gold, and diamond accents
- **Vault Tiers** - Silver, Gold, Diamond, Platinum, Elite with unique rewards
- **Real-time Leaderboards** - Multiple ranking categories (balance, mined, streak, vault)
- **Comprehensive Shop** - Boosts, vault upgrades, NFTs, and task packs
- **Achievement System** - 12+ achievements with unlock notifications
- **Referral Program** - Earn rewards by referring friends
- **Firebase Backend** - Real-time data synchronization
- **Telegram Integration** - Seamless WebApp experience

### 🎨 Design Highlights
- **Glassmorphism Effects** - Modern backdrop blur and transparency
- **Animated Backgrounds** - Subtle particle effects and gradient animations
- **Smooth Animations** - CSS transitions and micro-interactions
- **Responsive Design** - Optimized for all mobile devices
- **Premium Icons** - Lucide icon library for crisp, scalable graphics
- **Sound Effects** - Optional audio feedback for interactions

### 🔧 Technical Features
- **Firebase Firestore** - Real-time database with user data persistence
- **Telegram WebApp API** - Native integration with Telegram bot
- **Progressive Web App** - Installable and offline-capable
- **Performance Optimized** - Efficient animations and data loading
- **Cross-Platform** - Works on iOS, Android, and desktop browsers

## 🚀 Quick Start

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Authentication (optional, for additional security)
4. Get your Firebase config and update `scripts/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2. Telegram Bot Setup

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Enable WebApp support for your bot
3. Set the WebApp URL to your deployed application
4. Configure the bot to handle `/start` commands with referral parameters

### 3. Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd vaultcoin-webapp2

# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### 4. Deployment

#### Option A: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

#### Option B: GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to main branch

#### Option C: Netlify/Vercel
1. Connect your GitHub repository
2. Deploy automatically on push

## 📱 Pages Overview

### 🏠 Main Mining Page (`index.html`)
- Circular progress bar showing 24-hour mining progress
- Vault tier display with dynamic icons
- Start Mining / Claim buttons
- Real-time balance updates
- Animated coin effects

### 🛒 Shop Page (`shop.html`)
- Categories: Boosts, Vault Upgrades, NFTs, Tasks
- Dynamic item loading with Firebase
- Purchase confirmation and effects
- Balance integration

### 🏆 Leaderboard Page (`leaderboard.html`)
- Multiple ranking tabs (Balance, Mined, Streak, Vault)
- Real-time user rankings
- Current user highlighting
- Animated rank badges

### 👤 Profile Page (`profile.html`)
- User stats and achievements
- Referral system with copyable links
- Achievement unlock notifications
- Vault tier progression

## 🎮 Game Mechanics

### Mining System
- **24-Hour Cycle**: Start mining once per day
- **Vault Multipliers**: Higher tiers = more rewards
- **Streak Bonuses**: Consecutive days increase rewards
- **Boost Effects**: Temporary mining speed increases

### Vault Tiers
- **Silver**: 1x multiplier (default)
- **Gold**: 1.5x multiplier (50 VLTC)
- **Diamond**: 2x multiplier (200 VLTC)
- **Platinum**: 3x multiplier (500 VLTC)
- **Elite**: 5x multiplier (1000 VLTC)

### Shop Items
- **Boosts**: 2x, 3x, 5x mining speed for limited time
- **Vault Upgrades**: Permanent tier improvements
- **NFTs**: Collectible items with mining bonuses
- **Task Packs**: Daily/weekly challenges for rewards

## 🔧 Customization

### Colors and Themes
Edit CSS variables in any page's `<style>` section:

```css
:root {
  --primary-gold: #f9c922;
  --secondary-gold: #fbbf24;
  --silver: #c0c0c0;
  --platinum: #e5e4e2;
  --diamond: #b9f2ff;
  --elite: #ffd700;
  --dark-bg: #0a0a0a;
}
```

### Adding New Features
1. **New Shop Items**: Add to `shopItems` array in `scripts/shop.js`
2. **New Achievements**: Add to `achievements` array in `scripts/profile.js`
3. **New Vault Tiers**: Update tier logic in `scripts/firebase-config.js`

## 📊 Database Schema

### Users Collection
```javascript
{
  userId: "string",
  balance: number,
  vaultTier: "silver|gold|diamond|platinum|elite",
  miningStartTime: timestamp,
  lastClaimTime: timestamp,
  streak: number,
  totalMined: number,
  referrals: ["userId1", "userId2"],
  referralEarnings: number,
  boosts: [{
    id: "string",
    name: "string",
    multiplier: number,
    expiresAt: timestamp
  }],
  nfts: [{
    id: "string",
    name: "string",
    type: "string",
    rarity: "string",
    bonus: number
  }],
  achievements: ["achievementId1", "achievementId2"],
  createdAt: timestamp,
  lastActive: timestamp
}
```

## 🎯 Telegram Bot Integration

### WebApp Initialization
```javascript
// The WebApp automatically initializes when opened in Telegram
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  
  // Get user data
  const user = window.Telegram.WebApp.initDataUnsafe.user;
  const userId = user.id.toString();
}
```

### Referral System
```javascript
// Handle referral links
const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
if (startParam && startParam.startsWith('ref')) {
  const referrerId = startParam.substring(3);
  // Process referral
}
```

## 🚀 Performance Tips

1. **Optimize Images**: Use WebP format for coin images
2. **Minimize Requests**: Combine CSS and JS files
3. **Enable Caching**: Set appropriate cache headers
4. **Lazy Loading**: Load non-critical content on demand
5. **Compression**: Enable gzip compression on server

## 🔒 Security Considerations

1. **Firebase Rules**: Set up proper Firestore security rules
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Implement API rate limiting
4. **Data Encryption**: Encrypt sensitive user data
5. **HTTPS Only**: Use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Check Firebase config in `firebase-config.js`
   - Verify Firestore rules allow read/write
   - Check network connectivity

2. **Telegram WebApp Not Loading**
   - Ensure bot has WebApp enabled
   - Check WebApp URL in bot settings
   - Verify HTTPS is enabled

3. **Animations Not Working**
   - Check browser compatibility
   - Disable hardware acceleration if needed
   - Verify CSS is loading properly

### Debug Mode
Enable debug logging by adding to any script:
```javascript
window.DEBUG = true;
```

## 📈 Analytics & Monitoring

### Firebase Analytics
```javascript
// Track user actions
firebase.analytics().logEvent('mining_started', {
  user_id: userId,
  vault_tier: vaultTier
});
```

### Performance Monitoring
```javascript
// Monitor app performance
firebase.performance().trace('mining_operation').start();
// ... operation ...
firebase.performance().trace('mining_operation').stop();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Telegram**: Join our community channel
- **Email**: Contact support@vaultcoin.com

---

**Built with ❤️ for the VaultCoin community**

*This WebApp is designed to be the core engine of the VaultCoin ecosystem, providing a premium mining experience through Telegram's WebApp platform.* 