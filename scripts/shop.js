// VaultCoin Shop - JavaScript
// Premium Shop System with Firebase Integration

class VaultCoinShop {
  constructor() {
    this.userId = null;
    this.userData = null;
    this.shopItems = [];
    this.currentCategory = 'all';
    
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
      
      // Load shop items
      this.loadShopItems();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Update UI
      this.updateUI();
      
    } catch (error) {
      console.error('Error initializing shop:', error);
      this.showError('Failed to load shop. Please try again.');
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
          boosts: [],
          nfts: [],
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

  loadShopItems() {
    this.shopItems = [
      // Boosts - Simple and Effective
      {
        id: 'boost_2x_1h',
        name: '2x Mining Boost',
        description: 'Double your mining speed for 1 hour',
        price: 10,
        category: 'boosts',
        icon: 'zap',
        duration: 3600000, // 1 hour in ms
        multiplier: 2
      },
      {
        id: 'boost_3x_30m',
        name: '3x Mining Boost',
        description: 'Triple your mining speed for 30 minutes',
        price: 15,
        category: 'boosts',
        icon: 'zap',
        duration: 1800000, // 30 minutes in ms
        multiplier: 3
      },
      {
        id: 'boost_5x_15m',
        name: '5x Mining Boost',
        description: '5x mining speed for 15 minutes',
        price: 25,
        category: 'boosts',
        icon: 'zap',
        duration: 900000, // 15 minutes in ms
        multiplier: 5
      },
      
      // Vault Upgrades - TON-based (Coming Soon)
      {
        id: 'vault_gold',
        name: 'Gold Vault',
        description: 'Upgrade to Gold tier for 1.5x mining rewards',
        price: 0.1,
        priceCurrency: 'TON',
        category: 'vaults',
        icon: 'shield',
        tier: 'gold',
        multiplier: 1.5,
        comingSoon: true
      },
      {
        id: 'vault_diamond',
        name: 'Diamond Vault',
        description: 'Upgrade to Diamond tier for 2x mining rewards',
        price: 0.5,
        priceCurrency: 'TON',
        category: 'vaults',
        icon: 'shield',
        tier: 'diamond',
        multiplier: 2,
        comingSoon: true
      },
      {
        id: 'vault_platinum',
        name: 'Platinum Vault',
        description: 'Upgrade to Platinum tier for 3x mining rewards',
        price: 1.0,
        priceCurrency: 'TON',
        category: 'vaults',
        icon: 'shield',
        tier: 'platinum',
        multiplier: 3,
        comingSoon: true
      },
      {
        id: 'vault_elite',
        name: 'Elite Vault',
        description: 'Upgrade to Elite tier for 5x mining rewards',
        price: 2.0,
        priceCurrency: 'TON',
        category: 'vaults',
        icon: 'shield',
        tier: 'elite',
        multiplier: 5,
        comingSoon: true
      },
      
      // Special Items - Useful Bonuses
      {
        id: 'special_daily_bonus',
        name: 'Daily Bonus Pass',
        description: 'Unlock daily bonus rewards for 7 days',
        price: 50,
        category: 'special',
        icon: 'calendar',
        duration: 604800000, // 7 days
        dailyBonus: 10
      },
      {
        id: 'special_referral_boost',
        name: 'Referral Boost',
        description: 'Get 2x referral rewards for 24 hours',
        price: 30,
        category: 'special',
        icon: 'users',
        duration: 86400000, // 24 hours
        referralMultiplier: 2
      }
    ];
  }

  setupEventListeners() {
    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setCategory(btn.dataset.category);
      });
    });
  }

  setCategory(category) {
    this.currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Render items
    this.renderItems();
  }

  renderItems() {
    const container = document.getElementById('shop-items');
    const filteredItems = this.currentCategory === 'all' 
      ? this.shopItems 
      : this.shopItems.filter(item => item.category === this.currentCategory);
    
    container.innerHTML = filteredItems.map(item => this.createItemHTML(item)).join('');
    
    // Add click listeners to buy buttons
    container.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.itemId;
        this.purchaseItem(itemId);
      });
    });
  }

  createItemHTML(item) {
    const isVaultUpgrade = item.category === 'vaults';
    const isNFT = item.category === 'nfts';
    const currentTier = this.userData.vaultTier;
    const isOwned = isVaultUpgrade && currentTier === item.tier;
    const isLowerTier = isVaultUpgrade && this.getTierLevel(currentTier) >= this.getTierLevel(item.tier);
    
    // Check if user already owns this NFT
    const ownsNFT = isNFT && this.userData.nfts && this.userData.nfts.some(nft => nft.id === item.id);
    
    // Handle TON vs VLTC pricing
    const priceDisplay = item.priceCurrency === 'TON' ? `${item.price} TON` : `${item.price.toFixed(2)} VLTC`;
    const canAfford = item.comingSoon ? false : (item.priceCurrency === 'TON' ? false : this.userData.balance >= item.price);
    
    const rarityClass = isNFT ? `rarity-${item.rarity}` : '';
    const specialClass = item.category === 'special' ? 'special-item' : '';
    const comingSoonClass = item.comingSoon ? 'coming-soon' : '';
    
    return `
      <div class="shop-item ${isVaultUpgrade ? 'vault-upgrade' : ''} ${rarityClass} ${specialClass} ${comingSoonClass}">
        <div class="item-icon">
          ${isNFT && item.image ? 
            `<img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 50%;">` :
            `<i data-lucide="${item.icon}"></i>`
          }
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
        ${isNFT ? `<div class="item-rarity">${item.rarity.toUpperCase()}</div>` : ''}
        <div class="item-price">${priceDisplay}</div>
        <button class="buy-btn" 
                data-item-id="${item.id}"
                ${item.comingSoon || !canAfford || isOwned || isLowerTier || ownsNFT ? 'disabled' : ''}>
          ${item.comingSoon ? 'Coming Soon' :
            !canAfford ? 'Insufficient Balance' : 
            isOwned ? 'Already Owned' : 
            ownsNFT ? 'NFT Owned' :
            isLowerTier ? 'Lower Tier' : 'Buy Now'}
        </button>
      </div>
    `;
  }

  getTierLevel(tier) {
    const tiers = { 'silver': 1, 'gold': 2, 'diamond': 3, 'platinum': 4, 'elite': 5 };
    return tiers[tier] || 1;
  }

  async purchaseItem(itemId) {
    try {
      const item = this.shopItems.find(i => i.id === itemId);
      if (!item) return;
      
      // Check if item is coming soon
      if (item.comingSoon) {
        this.showError('This item is coming soon!');
        return;
      }
      
      // Check if item requires TON payment
      if (item.priceCurrency === 'TON') {
        this.showError('TON payments coming soon!');
        return;
      }
      
      if (this.userData.balance < item.price) {
        this.showError('Insufficient balance');
        return;
      }
      
      // Show loading
      this.showLoading(true);
      
      // Process purchase
      await this.processPurchase(item);
      
      // Update UI
      this.updateUI();
      this.renderItems();
      
      // Show success
      this.showSuccess(`Successfully purchased ${item.name}!`);
      
    } catch (error) {
      console.error('Error purchasing item:', error);
      this.showError('Purchase failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  async processPurchase(item) {
    const updates = {
      balance: firebase.firestore.FieldValue.increment(-item.price),
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    switch (item.category) {
      case 'boosts':
        // Add boost to user's active boosts
        const boost = {
          id: item.id,
          name: item.name,
          multiplier: item.multiplier,
          expiresAt: Date.now() + item.duration,
          purchasedAt: Date.now()
        };
        updates.boosts = firebase.firestore.FieldValue.arrayUnion(boost);
        break;
        
      case 'vaults':
        // Upgrade vault tier
        updates.vaultTier = item.tier;
        break;
        
      case 'nfts':
        // Add NFT to user's collection
        const nft = {
          id: item.id,
          name: item.name,
          type: item.nftType,
          rarity: item.rarity,
          bonus: item.bonus,
          purchasedAt: Date.now()
        };
        updates.nfts = firebase.firestore.FieldValue.arrayUnion(nft);
        break;
        
      case 'special':
        // Handle special items
        if (item.dailyBonus) {
          // Daily bonus pass
          const dailyPass = {
            id: item.id,
            name: item.name,
            dailyBonus: item.dailyBonus,
            expiresAt: Date.now() + item.duration,
            purchasedAt: Date.now()
          };
          updates.dailyPasses = firebase.firestore.FieldValue.arrayUnion(dailyPass);
        } else if (item.referralMultiplier) {
          // Referral boost
          const referralBoost = {
            id: item.id,
            name: item.name,
            multiplier: item.referralMultiplier,
            expiresAt: Date.now() + item.duration,
            purchasedAt: Date.now()
          };
          updates.referralBoosts = firebase.firestore.FieldValue.arrayUnion(referralBoost);
        }
        break;
    }
    
    // Update user data in Firebase
    await db.collection('users').doc(this.userId).update(updates);
    
    // Update local user data
    this.userData.balance -= item.price;
    
    // Apply immediate effects
    this.applyPurchaseEffects(item);
  }

  applyPurchaseEffects(item) {
    switch (item.category) {
      case 'vaults':
        this.userData.vaultTier = item.tier;
        break;
      case 'boosts':
        if (!this.userData.boosts) this.userData.boosts = [];
        this.userData.boosts.push({
          id: item.id,
          name: item.name,
          multiplier: item.multiplier,
          expiresAt: Date.now() + item.duration,
          purchasedAt: Date.now()
        });
        break;
      case 'special':
        if (item.dailyBonus) {
          if (!this.userData.dailyPasses) this.userData.dailyPasses = [];
          this.userData.dailyPasses.push({
            id: item.id,
            name: item.name,
            dailyBonus: item.dailyBonus,
            expiresAt: Date.now() + item.duration,
            purchasedAt: Date.now()
          });
        } else if (item.referralMultiplier) {
          if (!this.userData.referralBoosts) this.userData.referralBoosts = [];
          this.userData.referralBoosts.push({
            id: item.id,
            name: item.name,
            multiplier: item.referralMultiplier,
            expiresAt: Date.now() + item.duration,
            purchasedAt: Date.now()
          });
        }
        break;
      case 'nfts':
        if (!this.userData.nfts) this.userData.nfts = [];
        this.userData.nfts.push({
          id: item.id,
          name: item.name,
          type: item.nftType,
          rarity: item.rarity,
          bonus: item.bonus,
          purchasedAt: Date.now()
        });
        break;
    }
  }

  updateUI() {
    // Update balance display
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
      balanceElement.textContent = this.userData.balance.toFixed(2) + ' VLTC';
    }
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = show ? 'block' : 'none';
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
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

// Initialize shop when DOM is loaded
let shop;
document.addEventListener('DOMContentLoaded', () => {
  shop = new VaultCoinShop();
});

// Export for global access
window.VaultCoinShop = VaultCoinShop; 