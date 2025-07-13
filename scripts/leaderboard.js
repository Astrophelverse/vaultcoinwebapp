// VaultCoin Leaderboard - JavaScript
// Real-time Leaderboard System with Firebase Integration

class VaultCoinLeaderboard {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.leaderboardData = [];
    this.currentTab = 'balance';
    this.userRank = 0;
    
    this.init();
  }

  async init() {
    try {
      // Use page manager for loading state
      if (window.pageManager) {
        window.pageManager.setLoading(true);
      }
      
      // Initialize Lucide icons
      if (window.lucide) {
        lucide.createIcons();
      }
      
      // Get user ID from Telegram or fallback
      this.userId = this.getUserId();
      
      // Load user data
      await this.loadUserData();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load initial leaderboard
      await this.loadLeaderboard();
      
      // Update UI
      this.updateUserStats();
      
      // Hide loading
      if (window.pageManager) {
        window.pageManager.setLoading(false);
      }
      
    } catch (error) {
      console.error('Error initializing leaderboard:', error);
      if (window.pageManager) {
        window.pageManager.showErrorNotification('Failed to load leaderboard. Please try again.');
        window.pageManager.setLoading(false);
      } else {
      this.showError('Failed to load leaderboard. Please try again.');
      }
    }
  }

  getUserId() {
    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (initData && initData.user) {
        console.log('Telegram user found:', initData.user);
        return initData.user.id.toString();
      }
    }
    
    // Check if we have a stored user ID
    const storedId = localStorage.getItem('vaultcoin_user_id');
    if (storedId) {
      console.log('Using stored user ID:', storedId);
      return storedId;
    }
    
    // Fallback for development/testing
    const fallbackId = 'dev_user_' + Date.now();
    console.log('Using fallback user ID:', fallbackId);
    return fallbackId;
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

  setupEventListeners() {
    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab);
      });
    });
  }

  setTab(tab) {
    this.currentTab = tab;
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Reload leaderboard with new tab
    this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      this.showLoading(true);
      
      // Check if Firebase is available
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      let query = db.collection('users');
      
      // Apply sorting based on current tab
      switch (this.currentTab) {
        case 'balance':
          query = query.orderBy('balance', 'desc');
          break;
        case 'mined':
          query = query.orderBy('totalMined', 'desc');
          break;
        case 'streak':
          query = query.orderBy('streak', 'desc');
          break;
        case 'vault':
          query = query.orderBy('vaultTier', 'desc');
          break;
      }
      
      // Limit to top 50 users
      const snapshot = await query.limit(50).get();
      
      this.leaderboardData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        this.leaderboardData.push({
          id: doc.id,
          ...data
        });
      });
      
      // Find user's rank
      this.findUserRank();
      
      // Render leaderboard
      this.renderLeaderboard();
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      if (window.pageManager) {
        window.pageManager.showErrorNotification('Failed to load leaderboard data.');
      } else {
      this.showError('Failed to load leaderboard data.');
      }
    } finally {
      this.showLoading(false);
    }
  }

  findUserRank() {
    const userIndex = this.leaderboardData.findIndex(user => user.userId === this.userId);
    this.userRank = userIndex >= 0 ? userIndex + 1 : 0;
  }

  renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    
    if (this.leaderboardData.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
          <i data-lucide="users" style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;"></i>
          <p>No users found</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.leaderboardData.map((user, index) => 
      this.createLeaderboardItemHTML(user, index + 1)
    ).join('');
    
    // Re-initialize icons for new content
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  createLeaderboardItemHTML(user, rank) {
    const isCurrentUser = user.userId === this.userId;
    const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
    const score = this.getScoreForTab(user);
    
    return `
      <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
        <div class="rank-badge ${rankClass}">
          ${rank <= 3 ? this.getMedalIcon(rank) : rank}
        </div>
        
        <div class="user-info">
          <div class="user-name">
            ${this.getUserName(user)}
            ${isCurrentUser ? ' (You)' : ''}
          </div>
          <div class="user-details">
            <div class="user-vault">
              <div class="vault-icon ${user.vaultTier || 'silver'}"></div>
              <span>${this.getVaultTierName(user.vaultTier)}</span>
            </div>
            <div>${user.streak || 0} day streak</div>
          </div>
        </div>
        
        <div class="score">
          ${this.formatScore(score)}
        </div>
      </div>
    `;
  }

  getScoreForTab(user) {
    switch (this.currentTab) {
      case 'balance':
        return user.balance || 0;
      case 'mined':
        return user.totalMined || 0;
      case 'streak':
        return user.streak || 0;
      case 'vault':
        return this.getVaultTierLevel(user.vaultTier);
      default:
        return user.balance || 0;
    }
  }

  getVaultTierLevel(tier) {
    const tiers = { 'silver': 1, 'gold': 2, 'diamond': 3, 'platinum': 4, 'elite': 5 };
    return tiers[tier] || 1;
  }

  getVaultTierName(tier) {
    const tiers = {
      'silver': 'Silver',
      'gold': 'Gold', 
      'diamond': 'Diamond',
      'platinum': 'Platinum',
      'elite': 'Elite'
    };
    return tiers[tier] || 'Silver';
  }

  getUserName(user) {
    // Try to get name from Telegram data
    if (user.telegramName) {
      return user.telegramName;
    }
    
    // Try to get from Telegram username
    if (user.telegramUsername) {
      return '@' + user.telegramUsername;
    }
    
    // Try to get from display name
    if (user.displayName) {
      return user.displayName;
    }
    
    // Fallback to user ID
    return 'User ' + user.userId.substring(0, 8);
    
    // Fallback to user ID
    return `User ${user.userId.slice(-4)}`;
  }

  getMedalIcon(rank) {
    const icons = {
      1: '🥇',
      2: '🥈', 
      3: '🥉'
    };
    return icons[rank] || rank;
  }

  formatScore(score) {
    if (this.currentTab === 'balance' || this.currentTab === 'mined') {
      return score.toFixed(2) + ' VLTC';
    } else if (this.currentTab === 'streak') {
      return score + ' days';
    } else if (this.currentTab === 'vault') {
      return this.getVaultTierName(this.getVaultTierFromLevel(score));
    }
    return score;
  }

  getVaultTierFromLevel(level) {
    const tiers = ['silver', 'gold', 'diamond', 'platinum', 'elite'];
    return tiers[level - 1] || 'silver';
  }

  updateUserStats() {
    // Update user rank
    const rankElement = document.getElementById('user-rank');
    if (rankElement) {
      rankElement.textContent = this.userRank > 0 ? `#${this.userRank}` : 'Unranked';
    }
    
    // Update user balance
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement && this.userData) {
      balanceElement.textContent = (this.userData.balance || 0).toFixed(2);
    }
    
    // Update user streak
    const streakElement = document.getElementById('user-streak');
    if (streakElement && this.userData) {
      streakElement.textContent = this.userData.streak || 0;
    }
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = show ? 'block' : 'none';
    }
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

  // Real-time updates (optional)
  startRealtimeUpdates() {
    // Listen for changes in user data
    db.collection('users').doc(this.userId).onSnapshot((doc) => {
      if (doc.exists) {
        this.userData = doc.data();
        this.updateUserStats();
      }
    });
    
    // Refresh leaderboard every 30 seconds
    setInterval(() => {
      this.loadLeaderboard();
    }, 30000);
  }
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(notificationStyle);

// Initialize leaderboard when DOM is loaded
let leaderboard;
document.addEventListener('DOMContentLoaded', () => {
  leaderboard = new VaultCoinLeaderboard();
  
  // Start real-time updates after initialization
  setTimeout(() => {
    leaderboard.startRealtimeUpdates();
  }, 2000);
});

// Export for global access
window.VaultCoinLeaderboard = VaultCoinLeaderboard; 