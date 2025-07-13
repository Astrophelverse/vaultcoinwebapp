// VaultCoin Firebase Configuration
// Premium Mining Ecosystem Backend

const firebaseConfig = {
  apiKey: "AIzaSyAByYTxEr5f8zVO-ftTxyhKg9CqwOYmTQU",
  authDomain: "vaultcoin-webapp.firebaseapp.com",
  databaseURL: "https://vaultcoin-webapp-default-rtdb.firebaseio.com",
  projectId: "vaultcoin-webapp",
  storageBucket: "vaultcoin-webapp.firebasestorage.app",
  messagingSenderId: "1084935069487",
  appId: "1:1084935069487:web:195dd8c8fe194213320bda",
  measurementId: "G-K54EDVDNF5"
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
  // Show user-friendly error
  showFirebaseError();
}

// Show Firebase error to user
function showFirebaseError() {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff4444;
    color: white;
    padding: 1rem;
    text-align: center;
    z-index: 10000;
    font-family: 'Satoshi', sans-serif;
  `;
  errorDiv.innerHTML = '⚠️ Connection error. Please check your internet and refresh the page.';
  document.body.appendChild(errorDiv);
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
          console.log('No user data in initData, using fallback');
          // Fallback for development/testing
          this.userId = 'dev_user_' + Date.now();
          await this.initializeUser();
        }
      } else {
        console.log('Not in Telegram WebApp, using web fallback');
        // Fallback for non-Telegram environment
        this.userId = 'web_user_' + Date.now();
        await this.initializeUser();
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
      
      // Show loading state
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'block';
      }
      
      // Check if Firebase is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      // Get or create user data
      const userDoc = await db.collection('users').doc(this.userId).get();
      
      if (userDoc.exists) {
        this.userData = userDoc.data();
        console.log('Existing user data loaded:', this.userData);
      } else {
        console.log('Creating new user...');
        // Create new user with Telegram info
        this.userData = {
          userId: this.userId,
          telegramId: this.telegramUser ? this.telegramUser.id : null,
          telegramName: this.telegramUser ? this.telegramUser.first_name : null,
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
          isAdmin: false, // Will be checked against admin list
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(this.userId).set(this.userData);
        console.log('New user created:', this.userData);
      }
      
      // Check if user is admin
      await this.checkAdminStatus();
      
      this.isInitialized = true;
      this.updateUI();
      this.startMiningTimer();
      
      // Hide loading
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      
      console.log('User initialization complete!');
      
    } catch (error) {
      console.error('Error initializing user:', error);
      const loadingElement = document.getElementById('loading');
      if (loadingElement) {
        loadingElement.style.display = 'none';
      }
      
      // Show user-friendly error
      this.showError('Failed to connect to VaultCoin Network. Please try again.');
    }
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

  showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-family: 'Satoshi', sans-serif;
      box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  updateUI() {
    if (!this.userData) return;
    
    console.log('Updating UI with user data:', this.userData);
    
    // Update balance
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
      balanceElement.textContent = this.userData.balance.toFixed(2) + ' VLTC';
    }
    
    // Update vault tier
    const vaultTierElement = document.getElementById('vault-tier');
    if (vaultTierElement) {
      vaultTierElement.textContent = this.getVaultTierName(this.userData.vaultTier);
    }
    
    // Update vault icon
    const vaultIcon = document.getElementById('vault-icon');
    if (vaultIcon) {
      vaultIcon.className = `vault-icon ${this.userData.vaultTier}`;
    }
    
    // Update mining status
    this.updateMiningStatus();
  }

  getVaultTierName(tier) {
    const tiers = {
      'silver': 'Silver Vault',
      'gold': 'Gold Vault',
      'diamond': 'Diamond Vault',
      'platinum': 'Platinum Vault',
      'elite': 'Elite Vault'
    };
    return tiers[tier] || 'Silver Vault';
  }

  updateMiningStatus() {
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    const countdown = document.getElementById('countdown');
    
    if (!this.userData.miningStartTime) {
      // Not mining
      if (mineBtn) mineBtn.disabled = false;
      if (btnText) btnText.textContent = 'Start Mining';
      if (countdown) countdown.textContent = 'Ready to mine!';
      this.updateProgress(0);
    } else {
      const now = Date.now();
      const startTime = this.userData.miningStartTime.toDate ? 
        this.userData.miningStartTime.toDate().getTime() : 
        this.userData.miningStartTime;
      
      const elapsed = now - startTime;
      const miningDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (elapsed >= miningDuration) {
        // Ready to claim
        if (mineBtn) mineBtn.disabled = false;
        if (btnText) btnText.textContent = 'Claim Rewards';
        if (countdown) countdown.textContent = 'Mining complete!';
        this.updateProgress(100);
      } else {
        // Still mining
        if (mineBtn) mineBtn.disabled = true;
        if (btnText) btnText.textContent = 'Mining...';
        const remaining = miningDuration - elapsed;
        if (countdown) countdown.textContent = this.formatTime(remaining);
        this.updateProgress((elapsed / miningDuration) * 100);
      }
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
    
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    
    if (btnText && btnText.textContent === 'Start Mining') {
      // Start mining
      await this.startMining();
    } else if (btnText && btnText.textContent === 'Claim Rewards') {
      // Claim rewards
      await this.claimRewards();
    }
  }

  async startMining() {
    try {
      console.log('Starting mining for user:', this.userId);
      const now = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(this.userId).update({
        miningStartTime: now,
        lastActive: now
      });
      
      this.userData.miningStartTime = now;
      this.updateMiningStatus();
      this.createMiningEffect();
      
      console.log('Mining started successfully');
    } catch (error) {
      console.error('Error starting mining:', error);
      alert('Failed to start mining. Please try again.');
    }
  }

  async claimRewards() {
    try {
      console.log('Claiming rewards for user:', this.userId);
      const reward = this.calculateReward();
      const now = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(this.userId).update({
        balance: firebase.firestore.FieldValue.increment(reward),
        miningStartTime: null,
        lastClaimTime: now,
        totalMined: firebase.firestore.FieldValue.increment(reward),
        lastActive: now
      });
      
      this.userData.balance += reward;
      this.userData.miningStartTime = null;
      this.userData.lastClaimTime = now;
      this.userData.totalMined += reward;
      
      this.updateMiningStatus();
      this.createClaimEffect(reward);
      
      console.log('Rewards claimed successfully:', reward);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    }
  }

  calculateReward() {
    // Base reward calculation
    let baseReward = 10; // Base 10 VLTC per 24h
    
    // Apply vault tier multiplier
    const tierMultipliers = {
      'silver': 1,
      'gold': 1.5,
      'diamond': 2,
      'platinum': 3,
      'elite': 5
    };
    
    const tierMultiplier = tierMultipliers[this.userData.vaultTier] || 1;
    
    // Apply active boosts
    let boostMultiplier = 1;
    if (this.userData.boosts) {
      const activeBoosts = this.userData.boosts.filter(boost => 
        boost.expiresAt > Date.now()
      );
      
      activeBoosts.forEach(boost => {
        boostMultiplier *= boost.multiplier;
      });
    }
    
    return Math.floor(baseReward * tierMultiplier * boostMultiplier);
  }

  createMiningEffect() {
    const mineBtn = document.getElementById('mine-btn');
    if (mineBtn) {
      mineBtn.style.animation = 'pulse 2s infinite';
    }
  }

  createClaimEffect(reward) {
    // Create floating reward text
    const rewardText = document.createElement('div');
    rewardText.textContent = `+${reward} VLTC`;
    rewardText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #10b981;
      font-size: 2rem;
      font-weight: bold;
      z-index: 1000;
      animation: floatUp 2s ease-out forwards;
      pointer-events: none;
    `;
    
    document.body.appendChild(rewardText);
    
    setTimeout(() => rewardText.remove(), 2000);
  }

  startMiningTimer() {
    // Update mining status every second
    this.miningInterval = setInterval(() => {
      this.updateMiningStatus();
    }, 1000);
  }

  setupNavigation() {
    // Setup navigation between pages
    const navButtons = document.querySelectorAll('[data-page]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        this.navigateToPage(page);
      });
    });
  }

  navigateToPage(page) {
    // Simple navigation - you can enhance this
    window.location.href = `${page}.html`;
  }
}

// Initialize app when DOM is loaded
let vaultCoinApp;
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing VaultCoin app...');
  vaultCoinApp = new VaultCoinApp();
});

// Global function for mining button
function toggleMining() {
  console.log('toggleMining called');
  if (vaultCoinApp) {
    vaultCoinApp.toggleMining();
  } else {
    console.log('vaultCoinApp not initialized yet');
  }
} 