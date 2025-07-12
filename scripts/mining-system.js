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
      if (!firebase.auth().currentUser) {
        this.currentUser = null;
        this.userData = null;
        return;
      }

      this.currentUser = firebase.auth().currentUser;
      const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
      
      if (userDoc.exists) {
        this.userData = userDoc.data();
        this.lastMineTime = this.userData.lastMineTime ? new Date(this.userData.lastMineTime.toDate()) : null;
        this.miningRate = this.userData.miningRate || 1;
        this.boostMultiplier = this.userData.boostMultiplier || 1;
      } else {
        // Create new user
        this.userData = {
          balance: 0,
          totalMined: 0,
          miningSessions: 0,
          lastMineTime: null,
          miningRate: 1,
          boostMultiplier: 1,
          vaultTier: 'silver',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await this.saveUserData();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async saveUserData() {
    try {
      if (!this.currentUser) return;
      
      this.userData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('users').doc(this.currentUser.uid).set(this.userData, { merge: true });
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
    if (!this.currentUser) {
      alert('Please log in to start mining');
      return;
    }

    if (this.isMining) return;

    // Check cooldown
    if (this.lastMineTime && (Date.now() - this.lastMineTime.getTime()) < this.mineCooldown) {
      const remainingTime = this.mineCooldown - (Date.now() - this.lastMineTime.getTime());
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      alert(`⏰ Mining cooldown active! Please wait ${hours}h ${minutes}m before mining again.`);
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
      
      // Mint coins from mining allocation
      if (window.vaultCoinApp && window.vaultCoinApp.supplyManager) {
        await window.vaultCoinApp.supplyManager.mintCoins(totalCoins, 'mining_reward', 'mining');
      }
      
      // Update user data
      this.userData.balance += totalCoins;
      this.userData.totalMined += totalCoins;
      this.userData.miningSessions += 1;
      this.lastMineTime = new Date();
      this.userData.lastMineTime = firebase.firestore.FieldValue.serverTimestamp();
      
      // Save to Firebase
      await this.saveUserData();
      
      // Update tasks progress
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
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, var(--primary-gold), var(--secondary-gold));
      color: var(--dark-bg);
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      font-weight: 700;
      z-index: 1000;
      animation: miningSuccess 2s ease;
    `;
    notification.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">⛏️</div>
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">Mining Complete!</div>
      <div style="font-size: 2rem;">+${coinsEarned} VLTC</div>
    `;
    
    document.body.appendChild(notification);
    
    // Play sound
    if (window.VaultCoinEffects) {
      window.VaultCoinEffects.SoundEffects.playClaimSound();
    }
    
    // Remove notification after animation
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  updateMiningButton() {
    const mineBtn = document.getElementById('mine-btn');
    const btnText = document.getElementById('btn-text');
    const countdown = document.getElementById('countdown');
    
    if (!mineBtn) return;
    
    if (this.isMining) {
      mineBtn.disabled = true;
      btnText.textContent = 'Mining...';
      countdown.textContent = '⏳ Processing...';
    } else {
      mineBtn.disabled = false;
      btnText.textContent = 'Start Mining';
      this.updateCountdown();
    }
  }

  updateCountdown() {
    const countdown = document.getElementById('countdown');
    if (!countdown || !this.lastMineTime) {
      countdown.textContent = 'Ready to mine!';
      return;
    }
    
    const timeSinceLastMine = Date.now() - this.lastMineTime.getTime();
    const timeUntilNextMine = this.mineCooldown - timeSinceLastMine;
    
    if (timeUntilNextMine <= 0) {
      countdown.textContent = 'Ready to mine!';
      return;
    }
    
    const hours = Math.floor(timeUntilNextMine / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilNextMine % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilNextMine % (1000 * 60)) / 1000);
    
    countdown.textContent = `⏰ Next mine in: ${hours}h ${minutes}m ${seconds}s`;
  }

  updateUI() {
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
    const vaultIcon = document.getElementById('vault-icon');
    if (vaultIcon && this.userData) {
      vaultIcon.className = `vault-icon ${this.userData.vaultTier}`;
    }
    
    // Update countdown
    this.updateCountdown();
  }

  getVaultTierName(tier) {
    const tierNames = {
      'silver': 'Silver Vault',
      'gold': 'Gold Vault',
      'platinum': 'Platinum Vault',
      'diamond': 'Diamond Vault',
      'elite': 'Elite Vault'
    };
    return tierNames[tier] || 'Silver Vault';
  }

  startAutoUpdate() {
    // Update countdown every second
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
    
    // Update UI every 5 seconds
    setInterval(() => {
      this.updateUI();
    }, 5000);
  }

  // Boost management
  async applyBoost(boostType, duration) {
    try {
      switch (boostType) {
        case 'mining_rate':
          this.miningRate *= 2;
          this.userData.miningRate = this.miningRate;
          break;
        case 'earnings':
          this.boostMultiplier *= 1.5;
          this.userData.boostMultiplier = this.boostMultiplier;
          break;
        case 'cooldown':
          this.mineCooldown = Math.max(this.mineCooldown * 0.5, 60 * 60 * 1000); // Minimum 1 hour
          this.userData.mineCooldown = this.mineCooldown;
          break;
      }
      
      await this.saveUserData();
      this.updateUI();
      
      // Reset boost after duration
      setTimeout(() => {
        this.resetBoost(boostType);
      }, duration);
      
    } catch (error) {
      console.error('Error applying boost:', error);
    }
  }

  async resetBoost(boostType) {
    try {
      switch (boostType) {
        case 'mining_rate':
          this.miningRate = 1;
          this.userData.miningRate = this.miningRate;
          break;
        case 'earnings':
          this.boostMultiplier = 1;
          this.userData.boostMultiplier = this.boostMultiplier;
          break;
        case 'cooldown':
          this.mineCooldown = 24 * 60 * 60 * 1000;
          this.userData.mineCooldown = this.mineCooldown;
          break;
      }
      
      await this.saveUserData();
      this.updateUI();
      
    } catch (error) {
      console.error('Error resetting boost:', error);
    }
  }
}

// Initialize mining system
const miningSystem = new VaultCoinMining();

// Global function for HTML onclick
function toggleMining() {
  miningSystem.toggleMining();
}

// Add mining success animation CSS
const miningStyle = document.createElement('style');
miningStyle.textContent = `
  @keyframes miningSuccess {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
  }
  
  @keyframes progressPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .mine-btn.mining {
    background: linear-gradient(45deg, #10b981, #059669);
    animation: pulse 1s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(miningStyle); 