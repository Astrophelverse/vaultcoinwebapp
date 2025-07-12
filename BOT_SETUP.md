# 🤖 VaultCoin Bot Setup Guide

## 📋 **What We've Built**
- ✅ Complete Telegram bot with all commands
- ✅ Firebase integration for user management
- ✅ Referral system with automatic tracking
- ✅ Admin panel integration
- ✅ Error handling and logging
- ✅ Real-time user activity tracking

## 🚀 **Step 1: Bot Configuration**

### 1.1 Set Bot Commands
Send these commands to @BotFather:

```
/setcommands
```

Then paste:
```
start - 🚀 Start VaultCoin mining
mine - ⛏️ Mine VLTC coins
balance - 💰 Check your balance
shop - 🛒 Open the shop
tasks - ✅ View daily tasks
leaderboard - 🏆 View top miners
profile - 👤 Your profile
referral - 👥 Referral system
help - ❓ Get help
admin - 🔧 Admin panel (admin only)
```

### 1.2 Set Bot Description
```
/setdescription
```

```
VaultCoin - Premium Mining Ecosystem

🚀 Start mining VLTC coins instantly
⛏️ 24-hour auto-mining system
💰 Earn real rewards
🏆 Compete on leaderboards
🛒 Shop for boosts and upgrades
✅ Complete daily tasks
👥 Invite friends for bonuses

Join the future of mining! 🌟
```

### 1.3 Set Bot About
```
/setabouttext
```

```
VaultCoin - The Ultimate Mining Experience

• Instant mining rewards
• Real-time leaderboards
• Daily tasks & achievements
• Referral bonuses
• Premium boosts & upgrades
• 24/7 auto-mining system

Start your mining journey today! 💎
```

## 🔥 **Step 2: Firebase Setup**

### 2.1 Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Save the JSON file as `firebase-credentials.json` in your bot folder

### 2.2 Update Bot Configuration
In `bot.py`, update the WebApp URL when you deploy:

```python
WEBAPP_URL = "https://your-username.github.io/vaultcoin-webapp2/"
```

## 🐍 **Step 3: Python Environment Setup**

### 3.1 Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3.2 Test Bot Connection
```bash
python bot.py
```

You should see:
```
Starting VaultCoin Bot...
Bot connected: @vault_coin_bot
Bot commands set successfully
Bot is running... Press Ctrl+C to stop
```

## 🌐 **Step 4: WebApp Integration**

### 4.1 Set WebApp URL (After GitHub Deployment)
Once you deploy to GitHub Pages, update the bot:

```python
WEBAPP_URL = "https://your-actual-username.github.io/vaultcoin-webapp2/"
```

### 4.2 Test WebApp Integration
1. Send `/start` to your bot
2. Click "⛏️ Start Mining"
3. Should open your WebApp

## 📊 **Step 5: Bot Features Testing**

### 5.1 Test Commands
- `/start` - Welcome message and menu
- `/balance` - Check user balance
- `/leaderboard` - View top miners
- `/tasks` - Daily tasks
- `/help` - Help information
- `/admin` - Admin panel (admin only)

### 5.2 Test Referral System
1. Send `/start` to get your referral link
2. Share the link with a friend
3. When they join, you should get 100 VLTC bonus

### 5.3 Test Admin Panel
1. Send `/admin` to your bot
2. Click "Admin Panel"
3. Enter your Telegram ID: `7087777545`
4. Access all admin features

## 🚀 **Step 6: Hosting Options**

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub
3. Create new project
4. Add your bot files
5. Set environment variables:
   - `BOT_TOKEN=8022426994:AAEyqW-PnwKlssmV29rNV7kFIPY-GRkvA9c`

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python bot.py`

### Option 3: Heroku
1. Create account on [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Deploy using:
```bash
heroku create vaultcoin-bot
git push heroku main
```

## 🔧 **Step 7: Bot Configuration Commands**

### Set Menu Button (After WebApp Deployment)
```
/setmenubutton
```

Choose your bot and set the WebApp URL to:
```
https://your-username.github.io/vaultcoin-webapp2/
```

## 📱 **Step 8: Testing Checklist**

### ✅ Basic Functionality
- [ ] Bot responds to /start
- [ ] Menu buttons work
- [ ] WebApp opens correctly
- [ ] User data saves to Firebase
- [ ] Balance updates properly

### ✅ Advanced Features
- [ ] Referral system works
- [ ] Leaderboard shows data
- [ ] Admin panel accessible
- [ ] Error handling works
- [ ] Logging functions

### ✅ Integration
- [ ] Firebase connection
- [ ] WebApp integration
- [ ] Real-time updates
- [ ] User activity tracking

## 🐛 **Troubleshooting**

### Common Issues:

**1. Bot Not Responding**
- Check bot token is correct
- Verify bot is running
- Check internet connection

**2. Firebase Connection Failed**
- Verify firebase-credentials.json exists
- Check Firebase project settings
- Ensure Firestore is enabled

**3. WebApp Not Opening**
- Update WEBAPP_URL in bot.py
- Verify GitHub Pages is deployed
- Check HTTPS is working

**4. Referrals Not Working**
- Check referral parameter parsing
- Verify Firebase write permissions
- Check bot logs for errors

## 📊 **Monitoring**

### Check Bot Status
```bash
curl https://api.telegram.org/bot8022426994:AAEyqW-PnwKlssmV29rNV7kFIPY-GRkvA9c/getMe
```

### View Bot Logs
```bash
tail -f vaultcoin_bot.log
```

## 🎯 **Next Steps**

1. **Deploy to GitHub Pages** - Host your WebApp
2. **Update WebApp URL** - In bot.py
3. **Set Menu Button** - Connect bot to WebApp
4. **Test Everything** - Run through testing checklist
5. **Launch** - Share your bot with users!

## 🔐 **Security Notes**

- Keep your bot token secure
- Don't share firebase-credentials.json
- Monitor admin actions
- Regular backups of user data

---

**Your VaultCoin bot is now ready to launch! 🚀** 