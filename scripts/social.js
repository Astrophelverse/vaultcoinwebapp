// VaultCoin Social System
// Community Stats and Social Task Management

class VaultCoinSocial {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.socialTasks = [];
    this.communityStats = {};
    
    this.init();
  }

  async init() {
    try {
      // Get user ID
      this.userId = this.getUserId();
      
      // Load user data
      await this.loadUserData();
      
      // Load social tasks
      this.loadSocialTasks();
      
      // Load community stats
      await this.loadCommunityStats();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Render social tasks
      this.renderSocialTasks();
      
      // Update community stats
      this.updateCommunityStats();
      
      console.log('📱 Social system initialized');
    } catch (error) {
      console.error('Error initializing social system:', error);
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
          socialTasks: {},
          socialEngagements: 0,
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

  loadSocialTasks() {
    this.socialTasks = [
      {
        id: 'social_telegram',
        title: 'Join Telegram',
        description: 'Join our official Telegram channel',
        icon: 'message-circle',
        reward: 10,
        type: 'telegram_join',
        completed: false
      },
      {
        id: 'social_twitter',
        title: 'Follow on Twitter',
        description: 'Follow @VaultCoin on Twitter',
        icon: 'twitter',
        reward: 10,
        type: 'twitter_follow',
        completed: false
      },
      {
        id: 'social_instagram',
        title: 'Follow on Instagram',
        description: 'Follow @VaultCoin on Instagram',
        icon: 'instagram',
        reward: 10,
        type: 'instagram_follow',
        completed: false
      },
      {
        id: 'social_youtube',
        title: 'Subscribe on YouTube',
        description: 'Subscribe to VaultCoin on YouTube',
        icon: 'youtube',
        reward: 10,
        type: 'youtube_subscribe',
        completed: false
      },
      {
        id: 'social_discord',
        title: 'Join Discord (Optional)',
        description: 'Join our Discord community',
        icon: 'message-square',
        reward: 10,
        type: 'discord_join',
        completed: false,
        optional: true
      }
    ];
  }

  async loadCommunityStats() {
    // Simulate real community stats (in production, these would come from APIs)
    this.communityStats = {
      telegram: {
        members: 15432,
        growth: 156,
        url: 'https://t.me/vaultcoin_official'
      },
      twitter: {
        followers: 8923,
        growth: 89,
        url: 'https://twitter.com/VaultCoin'
      },
      instagram: {
        followers: 6789,
        growth: 67,
        url: 'https://instagram.com/vaultcoin'
      },
      youtube: {
        subscribers: 3456,
        growth: 34,
        url: 'https://youtube.com/@VaultCoin'
      },
      discord: {
        members: 4567,
        growth: 45,
        url: 'https://discord.gg/vaultcoin'
      }
    };
  }

  setupEventListeners() {
    // Add click handlers for social buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('join-btn')) {
        const platform = e.target.closest('.stat-card').querySelector('.stat-label').textContent.toLowerCase();
        this.handleSocialClick(platform);
      }
    });
  }

  renderSocialTasks() {
    const container = document.getElementById('social-tasks');
    if (!container) return;

    container.innerHTML = '';

    this.socialTasks.forEach(task => {
      const taskCard = this.createTaskCard(task);
      container.appendChild(taskCard);
    });
  }

  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    
    card.innerHTML = `
      <div class="task-icon">
        <i data-lucide="${task.icon}"></i>
      </div>
      <div class="task-title">${task.title}</div>
      <div class="task-description">${task.description}</div>
      <div class="task-reward">+${task.reward} VLTC</div>
      ${task.optional ? '<div class="task-optional">Optional</div>' : ''}
    `;

    // Add click handler
    card.addEventListener('click', () => {
      this.handleTaskClick(task);
    });

    return card;
  }

  updateCommunityStats() {
    // Community stats are now static descriptions, no need to update numbers
    console.log('Community stats updated with descriptions');
  }

  handleSocialClick(platform) {
    const stats = this.communityStats[platform];
    if (stats && stats.url) {
      // Open social platform
      window.open(stats.url, '_blank');
      
      // Mark task as completed if not already
      const task = this.socialTasks.find(t => t.type === `${platform}_${platform === 'telegram' ? 'join' : platform === 'youtube' ? 'subscribe' : 'follow'}`);
      if (task && !task.completed) {
        this.completeSocialTask(task);
      }
    }
  }

  handleTaskClick(task) {
    if (task.completed) {
      this.showNotification('Task already completed!', 'info');
      return;
    }

    // Handle different task types
    switch (task.type) {
      case 'telegram_join':
        window.open(this.communityStats.telegram.url, '_blank');
        break;
      case 'twitter_follow':
        window.open(this.communityStats.twitter.url, '_blank');
        break;
      case 'instagram_follow':
        window.open(this.communityStats.instagram.url, '_blank');
        break;
      case 'youtube_subscribe':
        window.open(this.communityStats.youtube.url, '_blank');
        break;
      case 'discord_join':
        window.open(this.communityStats.discord.url, '_blank');
        break;
    }

    // Mark as completed after a delay (simulating verification)
    setTimeout(() => {
      this.completeSocialTask(task);
    }, 2000);
  }

  async completeSocialTask(task) {
    try {
      // Mark task as completed
      task.completed = true;
      
      // Update user data
      if (!this.userData.socialTasks) this.userData.socialTasks = {};
      this.userData.socialTasks[task.id] = {
        completed: true,
        completedAt: Date.now()
      };

      // Add reward to user balance
      if (window.vaultCoinApp && window.vaultCoinApp.userData) {
        window.vaultCoinApp.userData.balance += task.reward;
        await db.collection('users').doc(this.userId).update({
          balance: firebase.firestore.FieldValue.increment(task.reward),
          [`socialTasks.${task.id}`]: {
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
          },
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // Update tasks progress
      if (window.tasks) {
        await window.tasks.updateTaskProgress(task.type, 1);
      }

      // Show success notification
      this.showNotification(`+${task.reward} VLTC earned!`, 'success');
      
      // Re-render tasks
      this.renderSocialTasks();
      
      console.log(`✅ Social task completed: ${task.title}`);
    } catch (error) {
      console.error('Error completing social task:', error);
      this.showNotification('Failed to complete task. Please try again.', 'error');
    }
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
      animation: slideIn 0.5s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}

// Global functions for social buttons
function joinTelegram() {
  if (window.vaultCoinSocial) {
    window.vaultCoinSocial.handleSocialClick('telegram');
  }
}

function followTwitter() {
  if (window.vaultCoinSocial) {
    window.vaultCoinSocial.handleSocialClick('twitter');
  }
}

function followInstagram() {
  if (window.vaultCoinSocial) {
    window.vaultCoinSocial.handleSocialClick('instagram');
  }
}

function subscribeYouTube() {
  if (window.vaultCoinSocial) {
    window.vaultCoinSocial.handleSocialClick('youtube');
  }
}

function joinDiscord() {
  if (window.vaultCoinSocial) {
    window.vaultCoinSocial.handleSocialClick('discord');
  }
}

// Initialize social system
const socialSystem = new VaultCoinSocial();
window.vaultCoinSocial = socialSystem; 