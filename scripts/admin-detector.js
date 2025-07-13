// VaultCoin Admin Detector
// Handles admin status checking and admin-specific features

class AdminDetector {
  constructor() {
    this.isAdmin = false;
    this.adminFeatures = [];
    this.init();
  }

  async init() {
    try {
      // Wait for Firebase to be ready
      await this.waitForFirebase();
      
      // Get user ID
      const userId = this.getUserId();
      if (!userId) {
        console.log('No user ID found for admin check');
        return;
      }
      
      // Check admin status
      await this.checkAdminStatus(userId);
      
      // Setup admin features if admin
      if (this.isAdmin) {
        this.setupAdminFeatures();
      }
      
    } catch (error) {
      console.error('Error initializing admin detector:', error);
    }
  }

  async waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (window.db) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  getUserId() {
    // Check if running in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const initData = window.Telegram.WebApp.initDataUnsafe;
      if (initData && initData.user) {
        return initData.user.id.toString();
      }
    }
    
    // Check if we have a stored user ID
    const storedId = localStorage.getItem('vaultcoin_user_id');
    if (storedId) {
      return storedId;
    }
    
    return null;
  }

  async checkAdminStatus(userId) {
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
      if (!telegramId) {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
          telegramId = userDoc.data().telegramId;
        }
      }
      
      // Admin Telegram IDs (replace with your actual admin Telegram IDs)
      const adminTelegramIds = [
        '7087777545', // Vault Link Coordinator
        '123456789', // Add more admin IDs as needed
        // Add your Telegram ID here
      ];
      
      this.isAdmin = adminTelegramIds.includes(telegramId);
      console.log('Admin status checked with Telegram ID:', telegramId, 'Result:', this.isAdmin);
      
      // Store admin status in localStorage for quick access
      localStorage.setItem('vaultcoin_is_admin', this.isAdmin.toString());
      localStorage.setItem('vaultcoin_telegram_id', telegramId);
      
      // Update user document with admin status
      if (db) {
        await db.collection('users').doc(userId).update({
          isAdmin: this.isAdmin,
          telegramId: telegramId,
          lastAdminCheck: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  setupAdminFeatures() {
    console.log('Setting up admin features...');
    
    // Add admin badge to UI
    this.addAdminBadge();
    
    // Add admin navigation link
    this.addAdminNavLink();
    
    // Enable admin-specific functionality
    this.enableAdminFunctions();
  }

  addAdminBadge() {
    // Add admin badge to header
    const header = document.querySelector('.header');
    if (header) {
      const adminBadge = document.createElement('div');
      adminBadge.style.cssText = `
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: linear-gradient(45deg, #ff4444, #ff6666);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
        box-shadow: 0 2px 10px rgba(255, 68, 68, 0.3);
      `;
      adminBadge.textContent = 'ADMIN';
      header.appendChild(adminBadge);
    }
  }

  addAdminNavLink() {
    // Add admin link to navigation
    const navBar = document.querySelector('.nav-bar');
    if (navBar) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.className = 'nav-item';
      adminLink.innerHTML = `
        <i data-lucide="shield"></i>
        <span>Admin</span>
      `;
      navBar.appendChild(adminLink);
      
      // Reinitialize icons
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  }

  enableAdminFunctions() {
    // Enable admin-specific functions
    this.adminFeatures = [
      'view_all_users',
      'modify_balances',
      'manage_supply',
      'view_analytics',
      'send_notifications'
    ];
    
    console.log('Admin features enabled:', this.adminFeatures);
  }

  // Utility methods for admin functions
  async getAllUsers() {
    if (!this.isAdmin) {
      throw new Error('Admin access required');
    }
    
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async modifyUserBalance(userId, newBalance) {
    if (!this.isAdmin) {
      throw new Error('Admin access required');
    }
    
    await db.collection('users').doc(userId).update({
      balance: newBalance,
      modifiedBy: this.getUserId(),
      modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async sendNotification(message, targetUsers = 'all') {
    if (!this.isAdmin) {
      throw new Error('Admin access required');
    }
    
    const notification = {
      message,
      targetUsers,
      sentBy: this.getUserId(),
      sentAt: firebase.firestore.FieldValue.serverTimestamp(),
      read: false
    };
    
    await db.collection('notifications').add(notification);
  }

  // Check if current user is admin (quick check)
  static isUserAdmin() {
    return localStorage.getItem('vaultcoin_is_admin') === 'true';
  }

  // Get admin status for display
  getAdminStatus() {
    return {
      isAdmin: this.isAdmin,
      features: this.adminFeatures,
      userId: this.getUserId()
    };
  }
}

// Initialize admin detector
window.adminDetector = new AdminDetector();

// Global admin check function
window.isAdmin = () => {
  return AdminDetector.isUserAdmin();
};

console.log('🛡️ Admin Detector loaded successfully!'); 