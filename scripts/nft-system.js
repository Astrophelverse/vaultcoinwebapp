// VaultCoin NFT System
// NFT Management and Trading

class VaultCoinNFTs {
  constructor() {
    this.userNFTs = [];
    this.availableNFTs = [];
    this.currentUser = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadAvailableNFTs();
      await this.loadUserNFTs();
      console.log('🎨 NFT system initialized');
    } catch (error) {
      console.error('Error initializing NFT system:', error);
    }
  }

  async loadAvailableNFTs() {
    // Define available NFTs - Achievement Based Only
    this.availableNFTs = [
      // Mining Progression NFTs - Unlock with level
      {
        id: 'bronze_miner',
        name: 'Bronze Miner',
        description: 'Begin your mining journey',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#cd7f32" stroke="#8c5a1e" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">⛏️</text></svg>',
        rarity: 'common',
        type: 'mining_progression',
        price: 0, // Free for achievement
        boost: 0.05, // 5% mining boost
        unlockCondition: 'level_1',
        visualEffect: 'bronze_glow'
      },
      {
        id: 'silver_miner',
        name: 'Silver Miner',
        description: 'Proven mining skills',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#c0c0c0" stroke="#888" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">⚒️</text></svg>',
        rarity: 'uncommon',
        type: 'mining_progression',
        price: 0,
        boost: 0.1, // 10% mining boost
        unlockCondition: 'level_5',
        visualEffect: 'silver_sparkle'
      },
      {
        id: 'gold_miner',
        name: 'Gold Miner',
        description: 'Elite mining expertise',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">🏆</text></svg>',
        rarity: 'rare',
        type: 'mining_progression',
        price: 0,
        boost: 0.15, // 15% mining boost
        unlockCondition: 'level_10',
        visualEffect: 'gold_aura'
      },
      {
        id: 'diamond_miner',
        name: 'Diamond Miner',
        description: 'Master of the vault',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#b9f2ff" stroke="#5bc0eb" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">💎</text></svg>',
        rarity: 'epic',
        type: 'mining_progression',
        price: 0,
        boost: 0.2, // 20% mining boost
        unlockCondition: 'level_15',
        visualEffect: 'diamond_shimmer'
      },
      {
        id: 'elite_miner',
        name: 'Elite Miner',
        description: 'Legendary vault master',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#ff8c00" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">👑</text></svg>',
        rarity: 'legendary',
        type: 'mining_progression',
        price: 0,
        boost: 0.25, // 25% mining boost
        unlockCondition: 'level_20',
        visualEffect: 'elite_crown'
      },
      
      // Achievement NFTs - Special accomplishments
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first mining session',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">✨</text></svg>',
        rarity: 'common',
        type: 'achievement',
        price: 0,
        boost: 0.1, // 10% mining boost
        unlockCondition: 'first_mine',
        visualEffect: 'sparkle_trail'
      },
      {
        id: 'mining_master',
        name: 'Mining Master',
        description: 'Complete 1000 mining sessions',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">⚡</text></svg>',
        rarity: 'epic',
        type: 'achievement',
        price: 0,
        boost: 0.25, // 25% mining boost
        unlockCondition: '1000_mines',
        visualEffect: 'master_glow'
      },
      {
        id: 'referral_king',
        name: 'Referral King',
        description: 'Successfully invite 50 friends',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">👑</text></svg>',
        rarity: 'legendary',
        type: 'achievement',
        price: 0,
        boost: 0.2, // 20% referral bonus
        unlockCondition: '50_referrals',
        visualEffect: 'crown_aura'
      },
      {
        id: 'guild_leader',
        name: 'Guild Leader',
        description: 'Create and lead a successful guild',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">🔥</text></svg>',
        rarity: 'mythic',
        type: 'achievement',
        price: 0,
        boost: 0.3, // 30% guild bonus
        unlockCondition: 'create_guild',
        visualEffect: 'leader_flame'
      },
      {
        id: 'vault_legend',
        name: 'Vault Legend',
        description: 'Reach the maximum level (Elite)',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">🌟</text></svg>',
        rarity: 'mythic',
        type: 'achievement',
        price: 0,
        boost: 0.5, // 50% overall bonus
        unlockCondition: 'max_level',
        visualEffect: 'legendary_halo'
      },
      
      // Special Event NFTs - Limited edition
      {
        id: 'founder_badge',
        name: 'Founder Badge',
        description: 'One of the first 1000 VaultCoin users',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">⭐</text></svg>',
        rarity: 'legendary',
        type: 'limited',
        price: 0,
        boost: 0.1,
        unlockCondition: 'founder',
        maxSupply: 1000,
        visualEffect: 'founder_star'
      },
      {
        id: 'guild_champion',
        name: 'Guild Champion',
        description: 'Win a guild war tournament',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">🏆</text></svg>',
        rarity: 'mythic',
        type: 'limited',
        price: 0,
        boost: 0.2,
        unlockCondition: 'guild_war_winner',
        visualEffect: 'champion_trophy'
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Engage with 100 social posts',
        image: '<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#ffd700" stroke="#bfa100" stroke-width="4"/><text x="24" y="30" font-size="18" text-anchor="middle" fill="#fff">🦋</text></svg>',
        rarity: 'epic',
        type: 'limited',
        price: 0,
        boost: 0.15,
        unlockCondition: '100_social_engagements',
        visualEffect: 'butterfly_wings'
      }
    ];
  }

  async loadUserNFTs() {
    try {
      if (!window.vaultCoinApp || !window.vaultCoinApp.userId) {
        this.userNFTs = [];
        return;
      }

      const userDoc = await db.collection('users').doc(window.vaultCoinApp.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        this.userNFTs = userData.nfts || [];
      }
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      this.userNFTs = [];
    }
  }

  async awardNFT(nftId, reason = 'achievement') {
    try {
      const nft = this.availableNFTs.find(n => n.id === nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Check if user already owns this NFT
      if (this.userNFTs.some(userNft => userNft.id === nftId)) {
        console.log(`User already owns NFT: ${nftId}`);
        return false;
      }

      // Create NFT instance
      const nftInstance = {
        id: nftId,
        name: nft.name,
        description: nft.description,
        image: nft.image,
        rarity: nft.rarity,
        type: nft.type,
        boost: nft.boost,
        acquiredAt: firebase.firestore.FieldValue.serverTimestamp(),
        acquiredReason: reason,
        tokenId: `${window.vaultCoinApp.userId}_${nftId}_${Date.now()}`
      };

      // Add to user's NFTs
      this.userNFTs.push(nftInstance);

      // Save to Firebase
      await db.collection('users').doc(window.vaultCoinApp.userId).update({
        nfts: this.userNFTs,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Show notification
      this.showNFTNotification(nftInstance);

      console.log(`🎉 NFT awarded: ${nft.name}`);
      return true;
    } catch (error) {
      console.error('Error awarding NFT:', error);
      return false;
    }
  }

  async purchaseNFT(nftId) {
    try {
      const nft = this.availableNFTs.find(n => n.id === nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      if (nft.unlockCondition !== 'purchase') {
        throw new Error('This NFT cannot be purchased');
      }

      // Check if user has enough balance
      if (window.vaultCoinApp.userData.balance < nft.price) {
        alert(`Insufficient balance! You need ${nft.price} VLTC to purchase this NFT.`);
        return false;
      }

      // Check if user already owns this NFT
      if (this.userNFTs.some(userNft => userNft.id === nftId)) {
        alert('You already own this NFT!');
        return false;
      }

      // Deduct balance
      window.vaultCoinApp.userData.balance -= nft.price;
      await db.collection('users').doc(window.vaultCoinApp.userId).update({
        balance: firebase.firestore.FieldValue.increment(-nft.price),
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Award NFT
      await this.awardNFT(nftId, 'purchase');

      console.log(`💰 NFT purchased: ${nft.name} for ${nft.price} VLTC`);
      return true;
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Failed to purchase NFT. Please try again.');
      return false;
    }
  }

  getTotalBoost() {
    let totalBoost = 0;
    this.userNFTs.forEach(nft => {
      totalBoost += nft.boost || 0;
    });
    return totalBoost;
  }

  getNFTsByType(type) {
    return this.userNFTs.filter(nft => nft.type === type);
  }

  getNFTsByRarity(rarity) {
    return this.userNFTs.filter(nft => nft.rarity === rarity);
  }

  showNFTNotification(nft) {
    // Create cool notification with visual effects
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 2px solid var(--primary-gold);
      padding: 2rem;
      border-radius: 1.5rem;
      text-align: center;
      z-index: 1000;
      animation: nftReveal 1s ease;
      box-shadow: 0 0 30px rgba(249, 201, 34, 0.5);
    `;
    
    // Add visual effect based on NFT rarity
    const visualEffect = this.getVisualEffect(nft.visualEffect);

    notification.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem;">${visualEffect.icon}</div>
      <div style="font-weight: 700; margin-bottom: 0.5rem; color: var(--primary-gold);">NFT Unlocked!</div>
      <div style="margin-bottom: 1rem; font-size: 1.2rem;">${nft.name}</div>
      <div style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem;">${nft.description}</div>
      <div style="background: linear-gradient(45deg, var(--primary-gold), var(--secondary-gold)); color: var(--dark-bg); padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; display: inline-block;">
        +${(nft.boost * 100).toFixed(0)}% ${this.getBoostType(nft.type)} Boost
        </div>
      <div style="margin-top: 1rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">
        Check your profile to see the effects!
      </div>
    `;

    document.body.appendChild(notification);

    // Add sparkle effects
    this.createSparkleEffects();
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'nftHide 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }

  getVisualEffect(effectType) {
    const effects = {
      'bronze_glow': { icon: '🥉', class: 'bronze-effect' },
      'silver_sparkle': { icon: '🥈', class: 'silver-effect' },
      'gold_aura': { icon: '🥇', class: 'gold-effect' },
      'diamond_shimmer': { icon: '💎', class: 'diamond-effect' },
      'elite_crown': { icon: '👑', class: 'elite-effect' },
      'sparkle_trail': { icon: '✨', class: 'sparkle-effect' },
      'master_glow': { icon: '⚡', class: 'master-effect' },
      'crown_aura': { icon: '👑', class: 'crown-effect' },
      'leader_flame': { icon: '🔥', class: 'flame-effect' },
      'legendary_halo': { icon: '🌟', class: 'halo-effect' },
      'founder_star': { icon: '⭐', class: 'founder-effect' },
      'champion_trophy': { icon: '🏆', class: 'trophy-effect' },
      'butterfly_wings': { icon: '🦋', class: 'butterfly-effect' }
    };
    return effects[effectType] || { icon: '🎉', class: 'default-effect' };
  }

  getBoostType(nftType) {
    const boostTypes = {
      'mining_progression': 'Mining',
      'achievement': 'Overall',
      'limited': 'Special'
    };
    return boostTypes[nftType] || 'Overall';
  }

  createSparkleEffects() {
    // Create sparkle particles around the notification
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--primary-gold);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkleFloat 2s ease-out forwards;
        z-index: 999;
      `;
      
      // Random position around center
      const angle = (i / 10) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const x = window.innerWidth / 2 + Math.cos(angle) * distance;
      const y = window.innerHeight / 2 + Math.sin(angle) * distance;
      
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      sparkle.style.animationDelay = Math.random() * 0.5 + 's';
      
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 2000);
    }
  }

  renderNFTGallery() {
    const container = document.getElementById('nft-gallery');
    if (!container) return;

    container.innerHTML = '';

    this.userNFTs.forEach(nft => {
      const nftCard = this.renderNFTCard(nft);
      container.appendChild(nftCard);
    });
    
    // Add CSS animations
    this.addNFTAnimations();
  }

  renderNFTCard(nft) {
    const card = document.createElement('div');
    card.className = `nft-card rarity-${nft.rarity}`;
    card.style.cssText = `
        background: var(--card-bg);
      backdrop-filter: blur(20px);
      border: 2px solid ${this.getRarityColor(nft.rarity)};
        border-radius: 1rem;
      padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;
    
    const visualEffect = this.getVisualEffect(nft.visualEffect);
    
    card.innerHTML = `
      <div class="nft-icon" style="font-size: 3rem; margin-bottom: 1rem;">${visualEffect.icon}</div>
      <div class="nft-name" style="font-weight: 700; margin-bottom: 0.5rem; color: var(--primary-gold);">${nft.name}</div>
      <div class="nft-description" style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem; font-size: 0.9rem;">${nft.description}</div>
      <div class="nft-boost" style="background: linear-gradient(45deg, var(--primary-gold), var(--secondary-gold)); color: var(--dark-bg); padding: 0.3rem 0.8rem; border-radius: 999px; font-weight: 700; font-size: 0.8rem; display: inline-block;">
        +${(nft.boost * 100).toFixed(0)}% Boost
      </div>
      <div class="nft-rarity" style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${this.getRarityColor(nft.rarity)}; color: var(--dark-bg); padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700;">
        ${nft.rarity.toUpperCase()}
      </div>
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px) scale(1.02)';
      card.style.boxShadow = `0 10px 30px ${this.getRarityColor(nft.rarity)}40`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = 'none';
    });
    
    return card;
  }

  getRarityColor(rarity) {
    const colors = {
      'common': '#c0c0c0',
      'uncommon': '#32cd32',
      'rare': '#f9c922',
      'epic': '#9932cc',
      'legendary': '#ffd700',
      'mythic': '#ff4500'
    };
    return colors[rarity] || '#c0c0c0';
  }

  addNFTAnimations() {
    // Add CSS animations for NFT effects
    const style = document.createElement('style');
    style.textContent = `
      @keyframes nftReveal {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      
      @keyframes nftHide {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      }
      
      @keyframes sparkleFloat {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0) translateY(-50px); }
      }
      
      .nft-card {
        animation: cardFloat 6s ease-in-out infinite;
      }
      
      @keyframes cardFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize NFT system
window.nftSystem = new VaultCoinNFTs(); 