// VaultCoin Profile - JavaScript
// User Profile System with Achievements and Referrals

class VaultCoinProfile {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.achievements = [];
    
    this.init();
  }

  async init() {
    try {
      // Initialize Lucide icons
      if (window.lucide) {
        lucide.createIcons();
      }
      
      // Get user ID from Telegram or fallback
      this.userId = this.getUserId();
      
      // Load user data
      await this.loadUserData();
      
      // Load achievements
      this.loadAchievements();
      
      // Update UI
      this.updateProfile();
      this.updateStats();
      this.updateReferrals();
      this.renderAchievements();
      
    } catch (error) {
      console.error('Error initializing profile:', error);
      this.showError('Failed to load profile. Please try again.');
    }
  }

  getUserId() {
    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (initData && initData.user) {
        return initData.user.id.toString();
      }
    }
    
    // Fallback for development/testing
    return localStorage.getItem('vaultcoin_user_id') || 'dev_user_' + Date.now();
  }

  async loadUserData() {
    try {
      const userDoc = await db.collection('users').doc(this.userId).get();
      
      if (userDoc.exists) {
        this.userData = userDoc.data();
      } else {
        // Create new user if doesn't exist
        this.userData = {
          userId: this.userId,
          balance: 0,
          vaultTier: 'silver',
          streak: 0,
          totalMined: 0,
          referrals: [],
          referralEarnings: 0,
          achievements: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(this.userId).set(this.userData);
      }
      
      localStorage.setItem('vaultcoin_user_id', this.userId);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  loadAchievements() {
    this.achievements = [
      {
        id: 'first_mine',
        name: 'First Mine',
        description: 'Complete your first mining session',
        icon: 'zap',
        condition: () => this.userData.totalMined > 0,
        unlocked: false
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day mining streak',
        icon: 'flame',
        condition: () => this.userData.streak >= 7,
        unlocked: false
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day mining streak',
        icon: 'calendar',
        condition: () => this.userData.streak >= 30,
        unlocked: false
      },
      {
        id: 'balance_100',
        name: 'Century Club',
        description: 'Accumulate 100 VLTC',
        icon: 'coins',
        condition: () => this.userData.balance >= 100,
        unlocked: false
      },
      {
        id: 'balance_1000',
        name: 'Thousandaire',
        description: 'Accumulate 1,000 VLTC',
        icon: 'trending-up',
        condition: () => this.userData.balance >= 1000,
        unlocked: false
      },
      {
        id: 'vault_gold',
        name: 'Golden Touch',
        description: 'Upgrade to Gold Vault',
        icon: 'shield',
        condition: () => this.userData.vaultTier === 'gold',
        unlocked: false
      },
      {
        id: 'vault_diamond',
        name: 'Diamond Hands',
        description: 'Upgrade to Diamond Vault',
        icon: 'gem',
        condition: () => this.userData.vaultTier === 'diamond',
        unlocked: false
      },
      {
        id: 'vault_elite',
        name: 'Elite Status',
        description: 'Reach Elite Vault tier',
        icon: 'crown',
        condition: () => this.userData.vaultTier === 'elite',
        unlocked: false
      },
      {
        id: 'referral_5',
        name: 'Networker',
        description: 'Refer 5 users',
        icon: 'users',
        condition: () => (this.userData.referrals || []).length >= 5,
        unlocked: false
      },
      {
        id: 'referral_10',
        name: 'Influencer',
        description: 'Refer 10 users',
        icon: 'star',
        condition: () => (this.userData.referrals || []).length >= 10,
        unlocked: false
      },
      {
        id: 'total_mined_500',
        name: 'Mining Veteran',
        description: 'Mine 500 VLTC total',
        icon: 'pickaxe',
        condition: () => this.userData.totalMined >= 500,
        unlocked: false
      },
      {
        id: 'total_mined_1000',
        name: 'Mining Legend',
        description: 'Mine 1,000 VLTC total',
        icon: 'trophy',
        condition: () => this.userData.totalMined >= 1000,
        unlocked: false
      }
    ];
    
    // Check which achievements are unlocked
    this.checkAchievements();
  }

  checkAchievements() {
    let newAchievements = [];
    
    this.achievements.forEach(achievement => {
      const isUnlocked = achievement.condition();
      const wasUnlocked = this.userData.achievements?.includes(achievement.id);
      
      achievement.unlocked = isUnlocked;
      
      if (isUnlocked && !wasUnlocked) {
        newAchievements.push(achievement);
      }
    });
    
    // Save new achievements to database
    if (newAchievements.length > 0) {
      this.saveNewAchievements(newAchievements);
    }
  }

  async saveNewAchievements(newAchievements) {
    try {
      const achievementIds = newAchievements.map(a => a.id);
      
      await db.collection('users').doc(this.userId).update({
        achievements: firebase.firestore.FieldValue.arrayUnion(...achievementIds)
      });
      
      // Update local data
      if (!this.userData.achievements) this.userData.achievements = [];
      this.userData.achievements.push(...achievementIds);
      
      // Show achievement notifications
      newAchievements.forEach(achievement => {
        this.showAchievementUnlocked(achievement);
      });
      
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  updateProfile() {
    // Update profile avatar
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
      const name = this.getUserName();
      avatar.textContent = name.charAt(0).toUpperCase();
    }
    
    // Update profile name
    const nameElement = document.getElementById('profile-name');
    if (nameElement) {
      nameElement.textContent = this.getUserName();
    }
    
    // Update vault tier
    const vaultTier = document.getElementById('vault-tier');
    const vaultIcon = document.getElementById('vault-icon');
    
    if (vaultTier) {
      vaultTier.textContent = this.getVaultTierName(this.userData.vaultTier);
    }
    
    if (vaultIcon) {
      vaultIcon.className = `vault-icon ${this.userData.vaultTier}`;
    }
  }

  updateStats() {
    // Update balance
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
      balanceElement.textContent = (this.userData.balance || 0).toFixed(2);
    }
    
    // Update total mined
    const totalMinedElement = document.getElementById('total-mined');
    if (totalMinedElement) {
      totalMinedElement.textContent = (this.userData.totalMined || 0).toFixed(2);
    }
    
    // Update streak
    const streakElement = document.getElementById('streak');
    if (streakElement) {
      streakElement.textContent = this.userData.streak || 0;
    }
    
    // Update referrals
    const referralsElement = document.getElementById('referrals');
    if (referralsElement) {
      referralsElement.textContent = (this.userData.referrals || []).length;
    }
  }

  updateReferrals() {
    // Update referral link
    const referralLink = document.getElementById('referral-link');
    if (referralLink) {
      referralLink.textContent = `https://t.me/vaultcoin_bot?start=ref${this.userId}`;
    }
    
    // Update referral stats
    const referralCount = document.getElementById('referral-count');
    if (referralCount) {
      referralCount.textContent = (this.userData.referrals || []).length;
    }
    
    const referralEarnings = document.getElementById('referral-earnings');
    if (referralEarnings) {
      referralEarnings.textContent = (this.userData.referralEarnings || 0).toFixed(2);
    }
  }

  renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    
    container.innerHTML = this.achievements.map(achievement => 
      this.createAchievementHTML(achievement)
    ).join('');
    
    // Re-initialize icons for new content
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  createAchievementHTML(achievement) {
    return `
      <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">
          <i data-lucide="${achievement.icon}"></i>
        </div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      </div>
    `;
  }

  getUserName() {
    // Try to get name from Telegram data
    if (window.Telegram && window.Telegram.WebApp) {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (initData && initData.user) {
        return initData.user.first_name || `User ${this.userId.slice(-4)}`;
      }
    }
    
    // Fallback to user ID
    return `User ${this.userId.slice(-4)}`;
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

  showAchievementUnlocked(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, var(--primary-gold), var(--secondary-gold));
      color: var(--dark-bg);
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      font-weight: 700;
      z-index: 1000;
      animation: achievementUnlock 3s ease-in-out;
      box-shadow: 0 10px 40px rgba(249, 201, 34, 0.5);
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
      <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Achievement Unlocked!</div>
      <div style="font-size: 1rem; margin-bottom: 0.5rem;">${achievement.name}</div>
      <div style="font-size: 0.9rem; opacity: 0.8;">${achievement.description}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(45deg, #10b981, #059669)' : 
                   type === 'error' ? 'linear-gradient(45deg, #ef4444, #dc2626)' : 
                   'linear-gradient(45deg, var(--primary-gold), var(--secondary-gold))'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Add notification and achievement animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes achievementUnlock {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
`;
document.head.appendChild(animationStyle);

// Global function for copying referral link
function copyReferralLink() {
  const linkElement = document.getElementById('referral-link');
  if (linkElement) {
    const link = linkElement.textContent;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
      // Show success notification
      if (window.profile) {
        profile.showSuccess('Referral link copied!');
      }
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (window.profile) {
        profile.showSuccess('Referral link copied!');
      }
    });
  }
}

// Initialize profile when DOM is loaded
let profile;
document.addEventListener('DOMContentLoaded', () => {
  profile = new VaultCoinProfile();
});

// Export for global access
window.VaultCoinProfile = VaultCoinProfile; 