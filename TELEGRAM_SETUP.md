# VaultCoin Telegram Bot Setup Guide

## 🚀 Quick Setup for @vaultcoinbot

### 1. Bot Configuration

Your bot is already created as `@vaultcoinbot`. Here's how to configure it:

#### Bot Commands Setup
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
```

#### Bot Description
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

#### Bot About
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

### 2. WebApp Integration

#### Set WebApp URL
```
/setmenubutton
```

Choose your bot and set the WebApp URL to:
```
https://your-username.github.io/vaultcoin-webapp2/
```

### 3. Bot Code Structure

Here's the recommended bot structure for 5000+ users:

```python
# bot.py
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize bot
bot = telebot.TeleBot('YOUR_BOT_TOKEN')

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# WebApp URL
WEBAPP_URL = "https://your-username.github.io/vaultcoin-webapp2/"

# Main menu keyboard
def get_main_menu():
    keyboard = InlineKeyboardMarkup()
    keyboard.row(
        InlineKeyboardButton("⛏️ Start Mining", web_app=WebAppInfo(url=WEBAPP_URL)),
        InlineKeyboardButton("💰 Balance", callback_data="balance")
    )
    keyboard.row(
        InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
        InlineKeyboardButton("✅ Tasks", callback_data="tasks")
    )
    keyboard.row(
        InlineKeyboardButton("🛒 Shop", callback_data="shop"),
        InlineKeyboardButton("👤 Profile", callback_data="profile")
    )
    keyboard.row(
        InlineKeyboardButton("👥 Referrals", callback_data="referrals"),
        InlineKeyboardButton("❓ Help", callback_data="help")
    )
    return keyboard

# Start command
@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    username = message.from_user.username
    
    # Check if user exists in Firebase
    user_ref = db.collection('users').document(str(user_id))
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        # Create new user
        user_data = {
            'telegram_id': user_id,
            'username': username,
            'balance': 0,
            'total_mined': 0,
            'mining_sessions': 0,
            'referrals': [],
            'referred_by': None,
            'created_at': firestore.SERVER_TIMESTAMP,
            'last_active': firestore.SERVER_TIMESTAMP
        }
        user_ref.set(user_data)
    
    welcome_text = f"""
🚀 Welcome to VaultCoin, {message.from_user.first_name}!

⛏️ Start mining VLTC coins instantly
💰 Earn real rewards every 24 hours
🏆 Compete on leaderboards
✅ Complete daily tasks for bonuses

Click "Start Mining" to begin your journey!
    """
    
    bot.reply_to(message, welcome_text, reply_markup=get_main_menu())

# Balance command
@bot.callback_query_handler(func=lambda call: call.data == "balance")
def balance(call):
    user_id = call.from_user.id
    user_ref = db.collection('users').document(str(user_id))
    user_doc = user_ref.get()
    
    if user_doc.exists:
        user_data = user_doc.to_dict()
        balance_text = f"""
💰 Your VaultCoin Balance

Balance: {user_data.get('balance', 0):.2f} VLTC
Total Mined: {user_data.get('total_mined', 0):.2f} VLTC
Mining Sessions: {user_data.get('mining_sessions', 0)}
        """
    else:
        balance_text = "❌ User not found. Please use /start first."
    
    bot.answer_callback_query(call.id)
    bot.edit_message_text(balance_text, call.message.chat.id, call.message.message_id, reply_markup=get_main_menu())

# Leaderboard command
@bot.callback_query_handler(func=lambda call: call.data == "leaderboard")
def leaderboard(call):
    # Get top 10 users
    users_ref = db.collection('users').order_by('balance', direction=firestore.Query.DESCENDING).limit(10)
    users = users_ref.stream()
    
    leaderboard_text = "🏆 Top 10 Miners\n\n"
    for i, user in enumerate(users, 1):
        user_data = user.to_dict()
        username = user_data.get('username', 'Anonymous')
        balance = user_data.get('balance', 0)
        leaderboard_text += f"{i}. @{username}: {balance:.2f} VLTC\n"
    
    bot.answer_callback_query(call.id)
    bot.edit_message_text(leaderboard_text, call.message.chat.id, call.message.message_id, reply_markup=get_main_menu())

# Tasks command
@bot.callback_query_handler(func=lambda call: call.data == "tasks")
def tasks(call):
    tasks_text = """
✅ Daily Tasks Available

1. ⛏️ Mine 10 times (50 VLTC)
2. 💰 Earn 100 VLTC (100 VLTC)
3. 🛒 Visit shop (25 VLTC)
4. 📱 Share on social (75 VLTC)
5. 👥 Invite a friend (200 VLTC)

Open the WebApp to complete tasks!
    """
    
    bot.answer_callback_query(call.id)
    bot.edit_message_text(tasks_text, call.message.chat.id, call.message.message_id, reply_markup=get_main_menu())

# Help command
@bot.callback_query_handler(func=lambda call: call.data == "help")
def help_command(call):
    help_text = """
❓ VaultCoin Help

🔹 Mining: Click "Start Mining" every 24 hours
🔹 Tasks: Complete daily tasks for bonus rewards
🔹 Referrals: Invite friends for 10% bonus
🔹 Shop: Buy boosts to increase earnings
🔹 Leaderboard: Compete with other miners

Need more help? Contact @vaultcoin_support
    """
    
    bot.answer_callback_query(call.id)
    bot.edit_message_text(help_text, call.message.chat.id, call.message.message_id, reply_markup=get_main_menu())

# Run bot
if __name__ == "__main__":
    print("🤖 VaultCoin Bot is running...")
    bot.polling(none_stop=True)
```

### 4. Hosting Options

#### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub
3. Create new project
4. Add your bot code
5. Set environment variables:
   - `BOT_TOKEN=your_bot_token`
   - `FIREBASE_CREDENTIALS=your_firebase_json`

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `python bot.py`

#### Option 3: Heroku
1. Create account on [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Deploy using:
```bash
heroku create vaultcoin-bot
git push heroku main
```

### 5. Requirements.txt
```
pyTelegramBotAPI==4.12.0
firebase-admin==6.2.0
python-dotenv==1.0.0
```

### 6. Environment Variables
Create `.env` file:
```
BOT_TOKEN=your_bot_token_here
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 7. Firebase Integration

#### Service Account Setup
1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Generate new private key
4. Save as `serviceAccountKey.json`

#### Database Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /system/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 8. Scaling for 5000+ Users

#### Performance Optimizations
1. **Caching**: Use Redis for frequently accessed data
2. **Database Indexing**: Index on balance, total_mined
3. **Rate Limiting**: Implement per-user rate limits
4. **Monitoring**: Use Firebase Analytics

#### Recommended Architecture
```
Telegram Bot → Firebase Functions → Firestore
                ↓
            Redis Cache
                ↓
            Analytics
```

### 9. Analytics Setup

#### Firebase Analytics
```javascript
// Track user actions
analytics.logEvent('mining_started', {
  user_id: userId,
  timestamp: Date.now()
});

analytics.logEvent('reward_claimed', {
  user_id: userId,
  amount: rewardAmount
});
```

### 10. Testing Checklist

- [ ] Bot responds to /start
- [ ] WebApp opens correctly
- [ ] User data saves to Firebase
- [ ] Balance updates properly
- [ ] Leaderboard shows correct data
- [ ] Tasks system works
- [ ] Referral system functions
- [ ] Error handling works
- [ ] Rate limiting active
- [ ] Analytics tracking

### 11. Deployment Commands

```bash
# Railway
railway up

# Render
git push origin main

# Heroku
heroku ps:scale worker=1
```

### 12. Monitoring Commands

```bash
# Check bot status
curl https://api.telegram.org/bot<TOKEN>/getMe

# Check webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Set webhook (if needed)
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

## 🎯 Next Steps

1. **Deploy the bot** using one of the hosting options
2. **Test thoroughly** with a small group
3. **Set up monitoring** and analytics
4. **Launch marketing campaign**
5. **Scale gradually** as user base grows

## 📞 Support

For technical support:
- Telegram: @vaultcoin_support
- Email: support@vaultcoin.com
- GitHub Issues: [vaultcoin-webapp2](https://github.com/your-username/vaultcoin-webapp2)

---

**Remember**: Start with a small user base and scale up gradually. Monitor performance and user feedback closely! 