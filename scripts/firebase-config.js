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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// Enable offline persistence
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

// Telegram WebApp Integration
class VaultCoinApp {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.isInitialized = false;
    this.miningInterval = null;
    
    // Initialize Telegram WebApp
    this.initTelegramWebApp();
  }

  async initTelegramWebApp() {
    try {
      // Check if running in Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        // Get user ID from Telegram context
        const initData = window.Telegram.WebApp.initDataUnsafe;
        if (initData && initData.user) {
          this.userId = initData.user.id.toString();
          console.log('Telegram User ID:', this.userId);
          
          // Initialize user data
          await this.initializeUser();
        } else {
          // Fallback for development/testing
          this.userId = 'dev_user_' + Date.now();
          await this.initializeUser();
        }
      } else {
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
      // Show loading state
      document.getElementById('loading').style.display = 'block';
      
      // Get or create user data
      const userDoc = await db.collection('users').doc(this.userId).get();
      
      if (userDoc.exists) {
        this.userData = userDoc.data();
        console.log('Existing user data loaded:', this.userData);
      } else {
        // Create new user
        this.userData = {
          userId: this.userId,
          balance: 0,
          vaultTier: 'silver',
          miningStartTime: null,
          lastClaimTime: null,
          streak: 0,
          totalMined: 0,
          referrals: [],
          boosts: [],
          nfts: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(this.userId).set(this.userData);
        console.log('New user created:', this.userData);
      }
      
      this.isInitialized = true;
      this.updateUI();
      this.startMiningTimer();
      
      // Hide loading
      document.getElementById('loading').style.display = 'none';
      
    } catch (error) {
      console.error('Error initializing user:', error);
      document.getElementById('loading').style.display = 'none';
      alert('Failed to connect to VaultCoin Network. Please try again.');
    }
  }

  updateUI() {
    if (!this.userData) return;
    
    // Update balance
    document.getElementById('balance').textContent = this.userData.balance.toFixed(2) + ' VLTC';
    
    // Update vault tier
    document.getElementById('vault-tier').textContent = this.getVaultTierName(this.userData.vaultTier);
    
    // Update vault icon
    const vaultIcon = document.getElementById('vault-icon');
    vaultIcon.className = `vault-icon ${this.userData.vaultTier}`;
    
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
      mineBtn.disabled = false;
      btnText.textContent = 'Start Mining';
      countdown.textContent = 'Ready to mine!';
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
        mineBtn.disabled = false;
        btnText.textContent = 'Claim Rewards';
        countdown.textContent = 'Mining complete!';
        this.updateProgress(100);
      } else {
        // Still mining
        mineBtn.disabled = true;
        btnText.textContent = 'Mining...';
        const remaining = miningDuration - elapsed;
        countdown.textContent = this.formatTime(remaining);
        this.updateProgress((elapsed / miningDuration) * 100);
      }
    }
  }

  updateProgress(percentage) {
    const progressFill = document.getElementById('progress-fill');
    const circumference = 2 * Math.PI * 70; // r=70
    const offset = circumference - (percentage / 100) * circumference;
    progressFill.style.strokeDashoffset = offset;
  }

  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  async toggleMining() {
    if (!this.isInitialized) return;
    
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    
    if (btnText.textContent === 'Start Mining') {
      // Start mining
      await this.startMining();
    } else if (btnText.textContent === 'Claim Rewards') {
      // Claim rewards
      await this.claimRewards();
    }
  }

  async startMining() {
    try {
      const now = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(this.userId).update({
        miningStartTime: now,
        lastActive: now
      });
      
      this.userData.miningStartTime = now;
      this.updateMiningStatus();
      this.createMiningEffect();
      
      console.log('Mining started');
    } catch (error) {
      console.error('Error starting mining:', error);
      alert('Failed to start mining. Please try again.');
    }
  }

  async claimRewards() {
    try {
      const reward = this.calculateReward();
      const now = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(this.userId).update({
        balance: firebase.firestore.FieldValue.increment(reward),
        miningStartTime: null,
        lastClaimTime: now,
        streak: firebase.firestore.FieldValue.increment(1),
        totalMined: firebase.firestore.FieldValue.increment(reward),
        lastActive: now
      });
      
      this.userData.balance += reward;
      this.userData.miningStartTime = null;
      this.userData.lastClaimTime = now;
      this.userData.streak += 1;
      this.userData.totalMined += reward;
      
      this.updateUI();
      this.updateMiningStatus();
      this.createClaimEffect(reward);
      
      console.log('Rewards claimed:', reward);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    }
  }

  calculateReward() {
    const baseReward = 10; // Base VLTC per 24h
    const tierMultiplier = {
      'silver': 1,
      'gold': 1.5,
      'diamond': 2,
      'platinum': 3,
      'elite': 5
    };
    
    const multiplier = tierMultiplier[this.userData.vaultTier] || 1;
    return baseReward * multiplier;
  }

  createMiningEffect() {
    // Create glowing coin animation
    const card = document.querySelector('.vault-card');
    const coin = document.createElement('div');
    coin.className = 'glowing-coin';
    coin.style.left = Math.random() * 80 + 10 + '%';
    coin.style.animationDelay = Math.random() * 2 + 's';
    card.appendChild(coin);
    
    setTimeout(() => coin.remove(), 3000);
  }

  createClaimEffect(reward) {
    // Create multiple coin animations
    const card = document.querySelector('.vault-card');
    for (let i = 0; i < 5; i++) {
      const coin = document.createElement('div');
      coin.className = 'glowing-coin';
      coin.style.left = Math.random() * 80 + 10 + '%';
      coin.style.animationDelay = i * 0.2 + 's';
      card.appendChild(coin);
      
      setTimeout(() => coin.remove(), 3000);
    }
    
    // Show reward notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, var(--primary-gold), var(--secondary-gold));
      color: var(--dark-bg);
      padding: 1rem 2rem;
      border-radius: 1rem;
      font-weight: 700;
      font-size: 1.2rem;
      z-index: 1000;
      animation: fadeInOut 3s ease-in-out;
    `;
    notification.textContent = `+${reward.toFixed(2)} VLTC Claimed!`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  startMiningTimer() {
    // Update countdown every second
    this.miningInterval = setInterval(() => {
      if (this.isInitialized) {
        this.updateMiningStatus();
      }
    }, 1000);
  }

  // Navigation handling
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateToPage(page);
      });
    });
  }

  navigateToPage(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Handle page navigation (to be implemented)
    console.log('Navigate to:', page);
  }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new VaultCoinApp();
  
  // Setup navigation after initialization
  setTimeout(() => {
    app.setupNavigation();
  }, 1000);
});

// Global functions for HTML onclick handlers
function toggleMining() {
  if (app) app.toggleMining();
} 