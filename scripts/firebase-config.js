// VaultCoin Firebase Configuration
// Premium Mining Ecosystem Backend

const firebaseConfig = {
  apiKey: "AIzaSyCOOaHRd57ByZsG4KKJuqEg1PQD1rs8zt0",
  authDomain: "vaultcoin-webapp.firebaseapp.com",
  databaseURL: "https://vaultcoin-webapp-default-rtdb.firebaseio.com",
  projectId: "vaultcoin-webapp",
  storageBucket: "vaultcoin-webapp.firebasestorage.app",
  messagingSenderId: "681281999804",
  appId: "1:681281999804:web:4279e77b26f956fec1d1b9"
};

// Initialize Firebase with error handling
let auth, db, rtdb;

try {
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
  auth = firebase.auth();
  db = firebase.firestore();
  rtdb = firebase.database();

  // Enable offline persistence with error handling
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.log('The current browser does not support persistence.');
    }
  });

// Global variables for the app
window.auth = auth;
window.db = db;
window.rtdb = rtdb;

console.log('🔥 VaultCoin Firebase initialized successfully!');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Telegram WebApp Integration with improved error handling
class VaultCoinApp {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.isInitialized = false;
    this.miningInterval = null;
    this.isAdmin = false;
    
    // Initialize Telegram WebApp
    this.initTelegramWebApp();
  }

  async initTelegramWebApp() {
    try {
      console.log('Initializing Telegram WebApp...');
      
      // Check if running in Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp detected');
        
        // Initialize Telegram WebApp
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        // Get user data from Telegram context
        const initData = window.Telegram.WebApp.initDataUnsafe;
        console.log('Telegram init data:', initData);
        
        if (initData && initData.user) {
          this.userId = initData.user.id.toString();
          console.log('Telegram User ID:', this.userId);
          console.log('User info:', initData.user);
          
          // Store Telegram user info
          this.telegramUser = initData.user;
          
          // Initialize user data
          await this.initializeUser();
        } else {
          console.log('No user data in initData, checking URL parameters');
          // Try to get user ID from URL parameters (when opened from bot)
          const urlParams = new URLSearchParams(window.location.search);
          const botUserId = urlParams.get('user_id');
          
          if (botUserId) {
            this.userId = botUserId;
            console.log('User ID from URL parameters:', this.userId);
            await this.initializeUser();
          } else {
            console.log('No user ID found, using fallback');
            this.userId = 'dev_user_' + Date.now();
            await this.initializeUser();
          }
        }
      } else {
        console.log('Not in Telegram WebApp, checking URL parameters');
        // Try to get user ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const botUserId = urlParams.get('user_id');
        
        if (botUserId) {
          this.userId = botUserId;
          console.log('User ID from URL parameters:', this.userId);
          await this.initializeUser();
        } else {
          console.log('No user ID found, using web fallback');
          this.userId = 'web_user_' + Date.now();
          await this.initializeUser();
        }
      }
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
      // Fallback initialization
      this.userId = 'fallback_user_' + Date.now();
      await this.initializeUser();
    }
  }

  async initializeUser() {
    try {
      console.log('Initializing user with ID:', this.userId);
      
      // Check if Firebase is initialized
      if (!db) {
        console.log('Firebase not initialized, creating local user data');
        this.userData = this.createDefaultUserData();
        this.isInitialized = true;
        this.updateUI();
        this.startMiningTimer();
        console.log('Local user data created:', this.userData);
        return;
      }
      
      // Get or create user data
      const userDoc = await db.collection('users').doc(this.userId).get();
      
      if (userDoc.exists) {
        this.userData = userDoc.data();
        console.log('Existing user data loaded:', this.userData);
        
        // Ensure all required fields exist
        this.userData = this.ensureUserDataFields(this.userData);
      } else {
        console.log('Creating new user...');
        // Create new user with Telegram info
        this.userData = this.createDefaultUserData();
        
        await db.collection('users').doc(this.userId).set(this.userData);
        console.log('New user created:', this.userData);
      }
      
      // Check if user is admin
      await this.checkAdminStatus();
      
      this.isInitialized = true;
      this.updateUI();
      this.startMiningTimer();
      
      console.log('User initialization complete!');
      
    } catch (error) {
      console.error('Error initializing user:', error);
      // Continue anyway - don't block the app
      this.userData = this.createDefaultUserData();
      this.isInitialized = true;
      this.updateUI();
      this.startMiningTimer();
    }
  }

  createDefaultUserData() {
    return {
      userId: this.userId,
      telegramId: this.telegramUser ? this.telegramUser.id : this.userId,
      telegramName: this.telegramUser ? this.telegramUser.first_name : 'User',
      telegramUsername: this.telegramUser ? this.telegramUser.username : null,
      balance: 0,
      vaultTier: 'silver',
      miningStartTime: null,
      lastClaimTime: null,
      streak: 0,
      totalMined: 0,
      referrals: [],
      boosts: [],
      nfts: [],
      isAdmin: false,
      level: 1,
      experience: 0,
      referral_count: 0,
      referral_code: `REF${this.userId}`,
      createdAt: new Date(),
      lastActive: new Date()
    };
  }

  ensureUserDataFields(userData) {
    // Ensure all required fields exist with defaults
    const defaults = this.createDefaultUserData();
    const ensured = { ...defaults, ...userData };
    
    // Convert old format to new format if needed
    if (userData.user_id && !userData.userId) {
      ensured.userId = userData.user_id.toString();
    }
    if (userData.first_name && !userData.telegramName) {
      ensured.telegramName = userData.first_name;
    }
    if (userData.username && !userData.telegramUsername) {
      ensured.telegramUsername = userData.username;
    }
    
    return ensured;
  }

  async checkAdminStatus() {
    try {
      // Get Telegram ID for admin check
      let telegramId = null;
      
      // Check if running in Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        const initData = window.Telegram.WebApp.initDataUnsafe;
        if (initData && initData.user) {
          telegramId = initData.user.id.toString();
          console.log('Telegram ID for admin check:', telegramId);
        }
      }
      
      // If no Telegram ID, try to get from user data
      if (!telegramId && this.userData) {
        telegramId = this.userData.telegramId;
      }
      
      // Admin Telegram IDs (replace with your actual admin Telegram IDs)
      const adminTelegramIds = [
        '7087777545', // Vault Link Coordinator
        '123456789', // Add more admin IDs as needed
        // Add your Telegram ID here
      ];
      
      this.isAdmin = adminTelegramIds.includes(telegramId);
      console.log('Admin status checked with Telegram ID:', telegramId, 'Result:', this.isAdmin);
      
      // Store admin status
      if (this.userData) {
        this.userData.isAdmin = this.isAdmin;
        this.userData.telegramId = telegramId;
      }
      
      // Update user document with admin status
      if (db) {
        await db.collection('users').doc(this.userId).update({
          isAdmin: this.isAdmin,
          telegramId: telegramId
        });
      }
      
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  updateUI() {
    try {
      console.log('Updating UI with user data:', this.userData);
      
      // Update balance display
      const balanceElement = document.getElementById('balance');
      if (balanceElement && this.userData) {
        balanceElement.textContent = `${this.userData.balance.toFixed(2)} VLTC`;
      }

      // Update vault tier display
      const vaultTierElement = document.getElementById('vault-tier');
      if (vaultTierElement && this.userData) {
        vaultTierElement.textContent = this.getVaultTierName(this.userData.vaultTier);
      }

      // Update vault icon
      const vaultIconElement = document.getElementById('vault-icon');
      if (vaultIconElement && this.userData) {
        vaultIconElement.className = `vault-icon ${this.userData.vaultTier}`;
      }

      // Update mining status
      this.updateMiningStatus();
      
      // Show user verification status
      this.showUserVerificationStatus();
    } catch (error) {
      console.error('Error updating UI:', error);
    }
  }

  showUserVerificationStatus() {
    // Create or update verification status display
    let statusElement = document.getElementById('user-verification-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'user-verification-status';
      statusElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 1000;
        font-family: monospace;
      `;
      document.body.appendChild(statusElement);
    }
    
    if (this.userData) {
      const status = this.userData.telegramId ? '✅ Verified' : '❌ Not Verified';
      const userId = this.userData.userId || this.userId;
      statusElement.textContent = `${status} | ID: ${userId}`;
    } else {
      statusElement.textContent = '❌ No User Data';
    }
  }

  getVaultTierName(tier) {
    const tierNames = {
      'silver': 'Silver Vault',
      'gold': 'Gold Vault',
      'diamond': 'Diamond Vault',
      'platinum': 'Platinum Vault',
      'elite': 'Elite Vault'
    };
    return tierNames[tier] || 'Silver Vault';
  }

  updateMiningStatus() {
    try {
      const mineBtn = document.getElementById('mine-btn');
      const btnText = document.getElementById('btn-text');
      const countdownElement = document.getElementById('countdown');
      
      if (!mineBtn || !btnText) return;

      // Check if user can mine
      const canMine = this.canMine();
      
      if (canMine) {
        mineBtn.disabled = false;
        btnText.textContent = 'Start Mining';
        if (countdownElement) countdownElement.textContent = '';
      } else {
        mineBtn.disabled = true;
        btnText.textContent = 'Mining Cooldown';
        this.updateCountdown(countdownElement);
      }
    } catch (error) {
      console.error('Error updating mining status:', error);
    }
  }

  canMine() {
    if (!this.userData || !this.userData.lastClaimTime) return true;
    
    const now = Date.now();
    const lastClaim = this.userData.lastClaimTime.toDate ? 
      this.userData.lastClaimTime.toDate().getTime() : 
      new Date(this.userData.lastClaimTime).getTime();
    
    const cooldown = 12 * 60 * 60 * 1000; // 12 hours
    return (now - lastClaim) >= cooldown;
  }

  updateCountdown(element) {
    if (!element || !this.userData || !this.userData.lastClaimTime) return;
    
    const now = Date.now();
    const lastClaim = this.userData.lastClaimTime.toDate ? 
      this.userData.lastClaimTime.toDate().getTime() : 
      new Date(this.userData.lastClaimTime).getTime();
    
    const cooldown = 12 * 60 * 60 * 1000; // 12 hours
    const remaining = cooldown - (now - lastClaim);
    
    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      element.textContent = `Next mining in ${hours}h ${minutes}m`;
    } else {
      element.textContent = '';
    }
  }

  updateProgress(percentage) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      const circumference = 2 * Math.PI * 70; // r=70
      const offset = circumference - (percentage / 100) * circumference;
      progressFill.style.strokeDashoffset = offset;
    }
  }

  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async toggleMining() {
    if (!this.isInitialized) {
      console.log('App not initialized yet');
      return;
    }
    
    if (this.canMine()) {
      await this.startMining();
    } else {
      console.log('Mining cooldown active');
    }
  }

  async startMining() {
    try {
      console.log('Starting mining...');
      
      // Update UI to show mining state
      const mineBtn = document.getElementById('mine-btn');
      const btnText = document.getElementById('btn-text');
      
      if (mineBtn) mineBtn.disabled = true;
      if (btnText) btnText.textContent = 'Mining...';
      
      // Simulate mining process
      const miningDuration = 3000 + Math.random() * 2000; // 3-5 seconds
      const startTime = Date.now();
      
      // Update progress
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / miningDuration) * 100, 100);
        this.updateProgress(progress);
      }, 100);
      
      // Complete mining after duration
      setTimeout(async () => {
        clearInterval(progressInterval);
        await this.claimRewards();
      }, miningDuration);
      
    } catch (error) {
      console.error('Error starting mining:', error);
      this.updateMiningStatus();
    }
  }

  async claimRewards() {
    try {
      // Calculate reward
      const reward = this.calculateReward();
      
      // Update user data
      this.userData.balance += reward;
      this.userData.totalMined += reward;
      this.userData.lastClaimTime = firebase.firestore.FieldValue.serverTimestamp();
      
      // Save to Firebase
      if (db) {
        await db.collection('users').doc(this.userId).update({
          balance: this.userData.balance,
          totalMined: this.userData.totalMined,
          lastClaimTime: this.userData.lastClaimTime
        });
      }
      
      // Show success effect
      this.createClaimEffect(reward);
      
      // Update UI
      this.updateUI();
      
      console.log(`Mining completed! Earned ${reward} VLTC`);
      
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  }

  calculateReward() {
    const baseReward = 10;
    const tier = this.userData?.vaultTier || 'silver';
    
    const tierMultipliers = {
      'silver': 1,
      'gold': 1.5,
      'diamond': 2,
      'platinum': 2.5,
      'elite': 3
    };
    
    const multiplier = tierMultipliers[tier] || 1;
    return Math.floor(baseReward * multiplier);
  }

  createMiningEffect() {
    // Create mining animation effect
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, #f9c922, transparent);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: miningPulse 1s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
  }

  createClaimEffect(reward) {
    // Create claim success effect
    const effect = document.createElement('div');
    effect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #00aa00;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-weight: bold;
      animation: claimSuccess 2s ease-out forwards;
      z-index: 1000;
    `;
    effect.textContent = `+${reward} VLTC!`;
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 2000);
  }

  startMiningTimer() {
    // Update countdown every minute
    this.miningInterval = setInterval(() => {
      this.updateMiningStatus();
    }, 60000);
  }

  setupNavigation() {
    // Add navigation event listeners
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href && href !== window.location.pathname.split('/').pop()) {
          window.location.href = href;
        }
      });
    });
  }

  navigateToPage(page) {
    const pages = {
      'mining': 'index.html',
      'shop': 'shop.html',
      'tasks': 'tasks.html',
      'leaderboard': 'leaderboard.html',
      'profile': 'profile.html',
      'social': 'social.html',
      'admin': 'admin.html'
    };
    
    const targetPage = pages[page];
    if (targetPage) {
      window.location.href = targetPage;
    }
  }
}

// Initialize the app
window.vaultCoinApp = new VaultCoinApp();

// Global function for mining button
function toggleMining() {
  if (window.vaultCoinApp) {
    window.vaultCoinApp.toggleMining();
  }
}

// Global function to test user verification
function testUserVerification() {
  if (window.vaultCoinApp) {
    console.log('=== USER VERIFICATION TEST ===');
    console.log('User ID:', window.vaultCoinApp.userId);
    console.log('User Data:', window.vaultCoinApp.userData);
    console.log('Is Initialized:', window.vaultCoinApp.isInitialized);
    console.log('Telegram User:', window.vaultCoinApp.telegramUser);
    console.log('Is Admin:', window.vaultCoinApp.isAdmin);
    console.log('==============================');
    
    // Show alert with user info
    const userInfo = window.vaultCoinApp.userData ? 
      `User ID: ${window.vaultCoinApp.userId}\nBalance: ${window.vaultCoinApp.userData.balance} VLTC\nVault: ${window.vaultCoinApp.userData.vaultTier}\nVerified: ${window.vaultCoinApp.userData.telegramId ? 'Yes' : 'No'}` :
      'No user data available';
    
    alert('User Verification Test:\n\n' + userInfo);
  } else {
    alert('VaultCoin App not initialized!');
  }
}

// Add mining animation CSS
const miningStyle = document.createElement('style');
miningStyle.textContent = `
  @keyframes miningPulse {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  }
  
  @keyframes claimSuccess {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
  
  .mine-btn:disabled {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    cursor: not-allowed !important;
  }
`;
document.head.appendChild(miningStyle);

console.log('🚀 VaultCoin App initialized!'); 