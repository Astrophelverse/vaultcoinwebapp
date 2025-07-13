// VaultCoin Mining System
// Integrated with Tasks and Firebase

class VaultCoinMining {
  constructor() {
    this.isMining = false;
    this.miningInterval = null;
    this.lastMineTime = null;
    this.mineCooldown = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    this.currentUser = null;
    this.userData = null;
    this.miningRate = 1; // Base mining rate
    this.boostMultiplier = 1; // Boost multiplier
    
    this.init();
  }

  async init() {
    try {
      await this.loadUserData();
      this.updateUI();
      this.startAutoUpdate();
      console.log('⛏️ Mining system initialized');
    } catch (error) {
      console.error('Error initializing mining system:', error);
    }
  }

  async loadUserData() {
    try {
      // Get user ID from the main app
      if (window.vaultCoinApp && window.vaultCoinApp.userId) {
        this.currentUser = window.vaultCoinApp.userId;
        this.userData = window.vaultCoinApp.userData;
        console.log('Mining system loaded user data from main app:', this.userData);
      } else {
        // Fallback: create a temporary user
        this.currentUser = 'temp_user_' + Date.now();
        this.userData = {
          userId: this.currentUser,
          balance: 0,
          totalMined: 0,
          miningSessions: 0,
          lastMineTime: null,
          lastClaimTime: null,
          miningRate: 1,
          boostMultiplier: 1,
          vaultTier: 'silver',
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log('Mining system created fallback user data:', this.userData);
      }
      
      if (this.userData) {
        // Handle both lastMineTime and lastClaimTime
        this.lastMineTime = this.userData.lastMineTime ? 
          new Date(this.userData.lastMineTime.toDate ? this.userData.lastMineTime.toDate() : this.userData.lastMineTime) : 
          this.userData.lastClaimTime ? 
            new Date(this.userData.lastClaimTime.toDate ? this.userData.lastClaimTime.toDate() : this.userData.lastClaimTime) : 
            null;
        this.miningRate = this.userData.miningRate || 1;
        this.boostMultiplier = this.userData.boostMultiplier || 1;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Create fallback user data
      this.userData = {
        userId: 'fallback_user_' + Date.now(),
        balance: 0,
        totalMined: 0,
        miningSessions: 0,
        lastMineTime: null,
        lastClaimTime: null,
        miningRate: 1,
        boostMultiplier: 1,
        vaultTier: 'silver',
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async saveUserData() {
    try {
      if (!this.currentUser || !db) return;
      
      this.userData.updatedAt = new Date();
      await db.collection('users').doc(this.currentUser).set(this.userData, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  toggleMining() {
    if (this.isMining) {
      this.stopMining();
    } else {
      this.startMining();
    }
  }

  async startMining() {
    if (this.isMining) return;

    // Check cooldown
    if (this.lastMineTime && (Date.now() - this.lastMineTime.getTime()) < this.mineCooldown) {
      const remainingTime = this.mineCooldown - (Date.now() - this.lastMineTime.getTime());
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`⏰ Mining cooldown active! Please wait ${hours}h ${minutes}m before mining again.`);
      return;
    }

    this.isMining = true;
    this.updateMiningButton();
    
    // Start mining animation
    this.startMiningAnimation();
    
    // Calculate mining duration (random between 3-8 seconds)
    const miningDuration = 3000 + Math.random() * 5000;
    
    // Simulate mining process
    setTimeout(async () => {
      await this.completeMining();
    }, miningDuration);
  }

  stopMining() {
    this.isMining = false;
    this.updateMiningButton();
    this.stopMiningAnimation();
  }

  async completeMining() {
    try {
      // Calculate coins earned based on user tier
      const baseCoins = this.getTierReward();
      const totalCoins = Math.floor(baseCoins * this.miningRate * this.boostMultiplier);
      
      // Update user data
      this.userData.balance += totalCoins;
      this.userData.totalMined += totalCoins;
      this.userData.miningSessions += 1;
      this.lastMineTime = new Date();
      this.userData.lastMineTime = new Date();
      
      // Save to Firebase if available
      await this.saveUserData();
      
      // Update main app data if available
      if (window.vaultCoinApp && window.vaultCoinApp.userData) {
        window.vaultCoinApp.userData.balance = this.userData.balance;
        window.vaultCoinApp.userData.totalMined = this.userData.totalMined;
        window.vaultCoinApp.userData.lastClaimTime = this.userData.lastMineTime;
      }
      
      // Update tasks progress if available
      if (window.tasks) {
        await window.tasks.updateTaskProgress('mining', 1);
        await window.tasks.updateTaskProgress('earnings', totalCoins);
      }
      
      // Show success animation
      this.showMiningSuccess(totalCoins);
      
      // Update UI
      this.updateUI();
      
      // Stop mining
      this.stopMining();
      
    } catch (error) {
      console.error('Error completing mining:', error);
      this.stopMining();
    }
  }

  getTierReward() {
    const tier = this.userData?.vaultTier || 'silver';
    const tierRewards = {
      'silver': 8,
      'gold': 12,
      'diamond': 18,
      'platinum': 25,
      'elite': 35
    };
    return tierRewards[tier] || 8;
  }

  startMiningAnimation() {
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    const progressFill = document.getElementById('progress-fill');
    
    if (mineBtn) {
      mineBtn.classList.add('mining');
      btnText.textContent = 'Mining...';
    }
    
    if (progressFill) {
      progressFill.style.animation = 'progressPulse 1s ease-in-out infinite';
    }
  }

  stopMiningAnimation() {
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    const progressFill = document.getElementById('progress-fill');
    
    if (mineBtn) {
      mineBtn.classList.remove('mining');
      btnText.textContent = 'Start Mining';
    }
    
    if (progressFill) {
      progressFill.style.animation = '';
    }
  }

  showMiningSuccess(coinsEarned) {
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #00aa00, #00cc00);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      font-weight: bold;
      font-size: 1.2rem;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0, 170, 0, 0.3);
      animation: miningSuccess 2s ease-out forwards;
    `;
    successDiv.textContent = `+${coinsEarned} VLTC Mined!`;
    
    document.body.appendChild(successDiv);
    
    // Remove after animation
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 2000);
  }

  updateMiningButton() {
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    
    if (mineBtn && btnText) {
      if (this.isMining) {
        mineBtn.disabled = true;
        btnText.textContent = 'Mining...';
      } else {
        mineBtn.disabled = false;
        btnText.textContent = 'Start Mining';
      }
    }
  }

  updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement || !this.lastMineTime) return;
    
    const now = Date.now();
    const timeSinceLastMine = now - this.lastMineTime.getTime();
    const remainingTime = this.mineCooldown - timeSinceLastMine;
    
    if (remainingTime > 0) {
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      countdownElement.textContent = `Next mining in ${hours}h ${minutes}m`;
    } else {
      countdownElement.textContent = '';
    }
  }

  updateUI() {
    try {
      // Update balance
      const balanceElement = document.getElementById('balance');
      if (balanceElement && this.userData) {
        balanceElement.textContent = `${this.userData.balance.toFixed(2)} VLTC`;
      }
      
      // Update vault tier
      const vaultTierElement = document.getElementById('vault-tier');
      if (vaultTierElement && this.userData) {
        vaultTierElement.textContent = this.getVaultTierName(this.userData.vaultTier);
      }
      
      // Update vault icon
      const vaultIconElement = document.getElementById('vault-icon');
      if (vaultIconElement && this.userData) {
        vaultIconElement.className = `vault-icon ${this.userData.vaultTier}`;
      }
      
      // Update mining button
      this.updateMiningButton();
      
      // Update countdown
      this.updateCountdown();
    } catch (error) {
      console.error('Error updating UI:', error);
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

  startAutoUpdate() {
    // Update countdown every minute
    this.miningInterval = setInterval(() => {
      this.updateCountdown();
    }, 60000);
  }

  async applyBoost(boostType, duration) {
    try {
      const boostMultipliers = {
        'mining': 2,
        'earnings': 1.5,
        'speed': 0.5
      };
      
      const multiplier = boostMultipliers[boostType] || 1;
      this.boostMultiplier *= multiplier;
      
      // Save boost to user data
      if (this.userData) {
        if (!this.userData.boosts) this.userData.boosts = [];
        this.userData.boosts.push({
          type: boostType,
          multiplier: multiplier,
          expiresAt: Date.now() + (duration * 60 * 1000)
        });
        await this.saveUserData();
      }
      
      console.log(`Boost applied: ${boostType} x${multiplier} for ${duration} minutes`);
    } catch (error) {
      console.error('Error applying boost:', error);
    }
  }

  async resetBoost(boostType) {
    try {
      this.boostMultiplier = 1;
      
      // Remove boost from user data
      if (this.userData && this.userData.boosts) {
        this.userData.boosts = this.userData.boosts.filter(boost => boost.type !== boostType);
        await this.saveUserData();
      }
      
      console.log(`Boost reset: ${boostType}`);
    } catch (error) {
      console.error('Error resetting boost:', error);
    }
  }
}

// Initialize mining system
window.vaultCoinMining = new VaultCoinMining();

// Global function for mining button
function toggleMining() {
  if (window.vaultCoinMining) {
    window.vaultCoinMining.toggleMining();
  }
}

// Add mining animation CSS
const miningAnimationStyle = document.createElement('style');
miningAnimationStyle.textContent = `
  @keyframes progressPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes miningSuccess {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }
  
  .mine-btn.mining {
    background: linear-gradient(45deg, #fbbf24, #f59e0b) !important;
    animation: miningPulse 1s ease-in-out infinite;
  }
  
  @keyframes miningPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(miningAnimationStyle);

console.log('⛏️ VaultCoin Mining System loaded!'); 