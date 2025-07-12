// VaultCoin Tasks System
// Task Management and Rewards

class VaultCoinTasks {
  constructor() {
    this.currentUser = null;
    this.currentCategory = 'daily';
    this.tasks = {
      daily: [],
      weekly: [],
      achievements: [],
      social: []
    };
    this.userProgress = {};
    
    this.init();
  }

  async init() {
    try {
      await this.loadTasks();
      await this.loadUserProgress();
      this.renderTasks();
      this.updateProgress();
      console.log('✅ Tasks system initialized');
    } catch (error) {
      console.error('Error initializing tasks:', error);
    }
  }

  async loadTasks() {
    // Daily Tasks - Clean and Simple
    this.tasks.daily = [
      {
        id: 'daily_login',
        title: 'Daily Login',
        description: 'Log in to VaultCoin today',
        icon: 'calendar',
        reward: 2,
        target: 1,
        type: 'login',
        category: 'daily'
      },
      {
        id: 'daily_mine',
        title: 'Complete Mining',
        description: 'Complete your daily mining session',
        icon: 'zap',
        reward: 3,
        target: 1,
        type: 'mining',
        category: 'daily'
      },
      {
        id: 'daily_social',
        title: 'Social Engagement',
        description: 'Like or watch our latest content',
        icon: 'heart',
        reward: 5,
        target: 1,
        type: 'social_engagement',
        category: 'daily'
      },
      {
        id: 'daily_referral',
        title: 'Invite a Friend',
        description: 'Successfully invite one new user',
        icon: 'users',
        reward: 15,
        target: 1,
        type: 'referral',
        category: 'daily'
      }
    ];

    // Weekly Tasks - Focused on Engagement
    this.tasks.weekly = [
      {
        id: 'weekly_login_streak',
        title: 'Login Streak',
        description: 'Log in for 7 consecutive days',
        icon: 'calendar',
        reward: 15,
        target: 7,
        type: 'login_streak',
        category: 'weekly'
      },
      {
        id: 'weekly_referrals',
        title: 'Invite 3 Friends',
        description: 'Successfully invite 3 new users this week',
        icon: 'users',
        reward: 30,
        target: 3,
        type: 'referral',
        category: 'weekly'
      },
      {
        id: 'weekly_social',
        title: 'Social Activity',
        description: 'Engage with our content 5 times this week',
        icon: 'heart',
        reward: 20,
        target: 5,
        type: 'social_engagement',
        category: 'weekly'
      }
    ];

    // Monthly Tasks - Long-term Goals
    this.tasks.monthly = [
      {
        id: 'monthly_login_streak',
        title: 'Monthly Streak',
        description: 'Log in for 30 consecutive days',
        icon: 'calendar',
        reward: 100,
        target: 30,
        type: 'login_streak',
        category: 'monthly'
      },
      {
        id: 'monthly_referrals',
        title: 'Invite 10 Friends',
        description: 'Successfully invite 10 new users this month',
        icon: 'users',
        reward: 75,
        target: 10,
        type: 'referral',
        category: 'monthly'
      }
    ];

    // Achievement Tasks - One-time Rewards
    this.tasks.achievements = [
      {
        id: 'ach_first_referral',
        title: 'First Networker',
        description: 'Successfully invite your first friend',
        icon: 'users',
        reward: 25,
        target: 1,
        type: 'referral_total',
        category: 'achievements',
        oneTime: true
      },
      {
        id: 'ach_10_referrals',
        title: 'Community Builder',
        description: 'Successfully invite 10 friends',
        icon: 'users',
        reward: 100,
        target: 10,
        type: 'referral_total',
        category: 'achievements',
        oneTime: true
      },
      {
        id: 'ach_50_referrals',
        title: 'Referral Master',
        description: 'Successfully invite 50 friends',
        icon: 'users',
        reward: 500,
        target: 50,
        type: 'referral_total',
        category: 'achievements',
        oneTime: true
      },
      {
        id: 'ach_max_level',
        title: 'Elite Status',
        description: 'Reach the maximum level (Elite)',
        icon: 'crown',
        reward: 1000,
        target: 1,
        type: 'max_level',
        category: 'achievements',
        oneTime: true
      }
    ];

    // Social Follow Tasks - One-time per platform
    this.tasks.social = [
      {
        id: 'social_telegram',
        title: 'Join Telegram',
        description: 'Join our official Telegram channel',
        icon: 'message-circle',
        reward: 10,
        target: 1,
        type: 'telegram_join',
        category: 'social',
        oneTime: true
      },
      {
        id: 'social_twitter',
        title: 'Follow on Twitter',
        description: 'Follow @VaultCoin on Twitter',
        icon: 'twitter',
        reward: 10,
        target: 1,
        type: 'twitter_follow',
        category: 'social',
        oneTime: true
      },
      {
        id: 'social_instagram',
        title: 'Follow on Instagram',
        description: 'Follow @VaultCoin on Instagram',
        icon: 'instagram',
        reward: 10,
        target: 1,
        type: 'instagram_follow',
        category: 'social',
        oneTime: true
      },
      {
        id: 'social_youtube',
        title: 'Subscribe on YouTube',
        description: 'Subscribe to VaultCoin on YouTube',
        icon: 'youtube',
        reward: 10,
        target: 1,
        type: 'youtube_subscribe',
        category: 'social',
        oneTime: true
      },
      {
        id: 'social_discord',
        title: 'Join Discord (Optional)',
        description: 'Join our Discord community',
        icon: 'message-square',
        reward: 10,
        target: 1,
        type: 'discord_join',
        category: 'social',
        oneTime: true,
        optional: true
      }
    ];
  }

  async loadUserProgress() {
    try {
      if (!firebase.auth().currentUser) {
        this.userProgress = {};
        return;
      }

      const userId = firebase.auth().currentUser.uid;
      const progressDoc = await db.collection('users').doc(userId).collection('tasks').doc('progress').get();
      
      if (progressDoc.exists) {
        this.userProgress = progressDoc.data();
      } else {
        this.userProgress = {
          daily: {},
          weekly: {},
          achievements: {},
          social: {},
          lastDailyReset: null,
          lastWeeklyReset: null
        };
        await this.saveUserProgress();
      }

      // Check for daily/weekly resets
      await this.checkResets();
    } catch (error) {
      console.error('Error loading user progress:', error);
      this.userProgress = {};
    }
  }

  async checkResets() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // Daily reset
    if (!this.userProgress.lastDailyReset || new Date(this.userProgress.lastDailyReset.toDate()) < today) {
      this.userProgress.daily = {};
      this.userProgress.lastDailyReset = firebase.firestore.FieldValue.serverTimestamp();
    }

    // Weekly reset
    if (!this.userProgress.lastWeeklyReset || new Date(this.userProgress.lastWeeklyReset.toDate()) < weekStart) {
      this.userProgress.weekly = {};
      this.userProgress.lastWeeklyReset = firebase.firestore.FieldValue.serverTimestamp();
    }

    await this.saveUserProgress();
  }

  async saveUserProgress() {
    try {
      if (!firebase.auth().currentUser) return;
      
      const userId = firebase.auth().currentUser.uid;
      await db.collection('users').doc(userId).collection('tasks').doc('progress').set(this.userProgress);
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  showCategory(category) {
    this.currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    this.renderTasks();
    this.updateProgress();
  }

  renderTasks() {
    const taskList = document.getElementById('task-list');
    const tasks = this.tasks[this.currentCategory];
    
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
      const progress = this.getTaskProgress(task.id);
      const isCompleted = progress >= task.target;
      const isClaimed = this.isTaskClaimed(task.id);
      
      const taskCard = document.createElement('div');
      taskCard.className = 'task-card';
      taskCard.innerHTML = `
        <div class="task-status ${isCompleted ? 'completed' : progress > 0 ? 'in-progress' : 'locked'}"></div>
        <div class="task-header">
          <div class="task-title">
            <i data-lucide="${task.icon}" class="task-icon"></i>
            ${task.title}
          </div>
          <div class="task-reward">+${task.reward} VLTC</div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-progress">
          <div class="task-progress-bar">
            <div class="task-progress-fill" style="width: ${Math.min((progress / task.target) * 100, 100)}%"></div>
          </div>
          <div class="task-progress-text">${progress}/${task.target}</div>
        </div>
        <div class="task-actions">
          ${isCompleted && !isClaimed ? 
            `<button class="task-btn primary" onclick="tasks.claimReward('${task.id}')">Claim Reward</button>` :
            isClaimed ?
            `<button class="task-btn secondary" disabled>Claimed</button>` :
            `<button class="task-btn secondary" onclick="tasks.viewTask('${task.id}')">View Details</button>`
          }
        </div>
      `;
      
      taskList.appendChild(taskCard);
    });

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  getTaskProgress(taskId) {
    const category = this.currentCategory;
    return this.userProgress[category]?.[taskId] || 0;
  }

  isTaskClaimed(taskId) {
    const category = this.currentCategory;
    return this.userProgress[category]?.[`${taskId}_claimed`] || false;
  }

  updateProgress() {
    if (this.currentCategory === 'daily') {
      const completedTasks = this.tasks.daily.filter(task => 
        this.getTaskProgress(task.id) >= task.target
      ).length;
      
      const progressPercent = (completedTasks / this.tasks.daily.length) * 100;
      document.getElementById('daily-progress').style.width = `${progressPercent}%`;
      document.getElementById('progress-text').textContent = `${completedTasks}/${this.tasks.daily.length} Daily Tasks Completed`;
    }
  }

  async claimReward(taskId) {
    try {
      const task = this.findTask(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const progress = this.getTaskProgress(taskId);
      const isClaimed = this.isTaskClaimed(taskId);

      if (isClaimed) {
        alert('Reward already claimed for this task!');
        return;
      }

      if (progress < task.target) {
        alert(`Task not completed yet! Progress: ${progress}/${task.target}`);
        return;
      }

      // Mark as claimed
      this.userProgress[taskId] = {
        ...this.userProgress[taskId],
        claimed: true,
        claimedAt: Date.now()
      };

      // Mint coins from tasks allocation
      if (window.vaultCoinApp && window.vaultCoinApp.supplyManager) {
        await window.vaultCoinApp.supplyManager.mintCoins(task.reward, `task_${taskId}`, 'tasks');
      }

      // Add to user balance
      if (window.vaultCoinApp && window.vaultCoinApp.userData) {
        window.vaultCoinApp.userData.balance += task.reward;
        await db.collection('users').doc(window.vaultCoinApp.userId).update({
          balance: firebase.firestore.FieldValue.increment(task.reward),
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      await this.saveUserProgress();
      this.showRewardNotification(task.reward);
      this.showTaskCompletedNotification(task);
      this.updateProgress();

      console.log(`✅ Task reward claimed: ${task.reward} VLTC for ${task.title}`);
    } catch (error) {
      console.error('Error claiming task reward:', error);
      alert('Failed to claim reward. Please try again.');
    }
  }

  findTask(taskId) {
    for (const category of Object.values(this.tasks)) {
      const task = category.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  showRewardNotification(amount) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, var(--primary-gold), var(--secondary-gold));
      color: var(--dark-bg);
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 700;
      z-index: 1000;
      animation: slideIn 0.5s ease;
    `;
    notification.textContent = `🎉 +${amount} VLTC Claimed!`;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  viewTask(taskId) {
    const task = this.findTask(taskId);
    if (!task) return;
    
    alert(`${task.title}\n\n${task.description}\n\nReward: ${task.reward} VLTC\nProgress: ${this.getTaskProgress(taskId)}/${task.target}`);
  }

  // Task progress update methods (called from other parts of the app)
  async updateTaskProgress(taskType, amount = 1) {
    try {
      if (!firebase.auth().currentUser) return;

      const userId = firebase.auth().currentUser.uid;
      
      // Update relevant tasks based on type
      for (const category of Object.values(this.tasks)) {
        for (const task of category) {
          if (task.type === taskType) {
            const currentProgress = this.getTaskProgress(task.id);
            const newProgress = currentProgress + amount;
            
            this.userProgress[task.category][task.id] = newProgress;
            
            // Check if task was just completed
            if (currentProgress < task.target && newProgress >= task.target) {
              this.showTaskCompletedNotification(task);
            }
          }
        }
      }
      
      await this.saveUserProgress();
      this.renderTasks();
      this.updateProgress();
      
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  }

  showTaskCompletedNotification(task) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--primary-gold);
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      z-index: 1000;
      animation: fadeIn 0.5s ease;
    `;
    notification.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
      <div style="font-weight: 700; margin-bottom: 0.5rem;">Task Completed!</div>
      <div style="margin-bottom: 1rem;">${task.title}</div>
      <div style="color: var(--primary-gold); font-weight: 700;">+${task.reward} VLTC</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
}

// Initialize tasks system
const tasks = new VaultCoinTasks();

// Global function for category switching
function showCategory(category) {
  tasks.showCategory(category);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
`;
document.head.appendChild(style); 