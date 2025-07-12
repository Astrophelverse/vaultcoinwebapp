// VaultCoin Supply Management System
// Total Supply Control and Economic Management

class VaultCoinSupplyManager {
  constructor() {
    this.totalSupply = 0;
    this.circulatingSupply = 0;
    this.burnedSupply = 0;
    this.mintedSupply = 0;
    this.maxSupply = 100000000; // 100 Million VLTC max supply (updated)
    
    // Tokenomics Allocation
    this.tokenomics = {
      totalSupply: 100000000,
      tasksAndShop: 5000000,    // 5M for tasks and shop
      mining: 10000000,         // 10M for mining rewards
      partnerships: 20000000,   // 20M for partnerships
      reserved: 65000000        // 65M reserved for future
    };
    
    this.inflationRate = 0.02; // 2% annual inflation (reduced for sustainability)
    this.lastInflationUpdate = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadSupplyData();
      this.startSupplyMonitoring();
      console.log('💰 VaultCoin Supply Manager initialized');
      console.log('📊 Tokenomics:', this.tokenomics);
    } catch (error) {
      console.error('Error initializing supply manager:', error);
    }
  }

  async loadSupplyData() {
    try {
      const supplyDoc = await db.collection('system').doc('supply').get();
      
      if (supplyDoc.exists) {
        const data = supplyDoc.data();
        this.totalSupply = data.totalSupply || 0;
        this.circulatingSupply = data.circulatingSupply || 0;
        this.burnedSupply = data.burnedSupply || 0;
        this.mintedSupply = data.mintedSupply || 0;
        this.lastInflationUpdate = data.lastInflationUpdate || null;
      } else {
        // Initialize with new tokenomics
        await this.initializeSupply();
      }
    } catch (error) {
      console.error('Error loading supply data:', error);
      throw error;
    }
  }

  async initializeSupply() {
    const initialSupply = 100000000; // 100 Million VLTC starting supply
    
    const supplyData = {
      totalSupply: initialSupply,
      circulatingSupply: 0, // Start with 0 circulating (will be minted as needed)
      burnedSupply: 0,
      mintedSupply: 0,
      tokenomics: this.tokenomics,
      lastInflationUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('system').doc('supply').set(supplyData);
    
    // Update local values
    this.totalSupply = initialSupply;
    this.circulatingSupply = 0;
    this.mintedSupply = 0;
    this.lastInflationUpdate = new Date();
    
    console.log('💰 Initialized VaultCoin supply:', initialSupply.toLocaleString(), 'VLTC');
    console.log('📊 Tokenomics allocation saved');
  }

  async mintCoins(amount, reason = 'mining', source = 'mining') {
    try {
      // Check if we have enough allocation for this source
      if (!this.checkAllocation(source, amount)) {
        throw new Error(`Insufficient allocation for ${source}`);
      }

      if (this.circulatingSupply + amount > this.maxSupply) {
        throw new Error('Minting would exceed maximum supply');
      }

      const batch = db.batch();
      
      // Update supply document
      const supplyRef = db.collection('system').doc('supply');
      batch.update(supplyRef, {
        circulatingSupply: firebase.firestore.FieldValue.increment(amount),
        mintedSupply: firebase.firestore.FieldValue.increment(amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Log minting transaction
      const mintLogRef = db.collection('transactions').doc();
      batch.set(mintLogRef, {
        type: 'mint',
        amount: amount,
        reason: reason,
        source: source,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        circulatingSupplyAfter: this.circulatingSupply + amount
      });

      await batch.commit();

      // Update local values
      this.circulatingSupply += amount;
      this.mintedSupply += amount;

      console.log(`💰 Minted ${amount.toLocaleString()} VLTC (${reason} - ${source})`);
      return true;
    } catch (error) {
      console.error('Error minting coins:', error);
      throw error;
    }
  }

  checkAllocation(source, amount) {
    // Check if we have enough allocation for the requested amount
    const currentMinted = this.mintedSupply;
    
    switch (source) {
      case 'mining':
        return currentMinted + amount <= this.tokenomics.mining;
      case 'tasks':
      case 'shop':
        return currentMinted + amount <= this.tokenomics.tasksAndShop;
      case 'partnerships':
        return currentMinted + amount <= this.tokenomics.partnerships;
      default:
        return true; // Allow other sources
    }
  }

  async burnCoins(amount, reason = 'burn') {
    try {
      if (amount > this.circulatingSupply) {
        throw new Error('Cannot burn more than circulating supply');
      }

      const batch = db.batch();
      
      // Update supply document
      const supplyRef = db.collection('system').doc('supply');
      batch.update(supplyRef, {
        totalSupply: firebase.firestore.FieldValue.increment(-amount),
        circulatingSupply: firebase.firestore.FieldValue.increment(-amount),
        burnedSupply: firebase.firestore.FieldValue.increment(amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Log burning transaction
      const burnLogRef = db.collection('transactions').doc();
      batch.set(burnLogRef, {
        type: 'burn',
        amount: amount,
        reason: reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        totalSupplyAfter: this.totalSupply - amount
      });

      await batch.commit();

      // Update local values
      this.totalSupply -= amount;
      this.circulatingSupply -= amount;
      this.burnedSupply += amount;

      console.log(`🔥 Burned ${amount.toLocaleString()} VLTC (${reason})`);
      return true;
    } catch (error) {
      console.error('Error burning coins:', error);
      throw error;
    }
  }

  async transferCoins(fromUserId, toUserId, amount, reason = 'transfer') {
    try {
      const batch = db.batch();
      
      // Deduct from sender
      const fromUserRef = db.collection('users').doc(fromUserId);
      batch.update(fromUserRef, {
        balance: firebase.firestore.FieldValue.increment(-amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Add to receiver
      const toUserRef = db.collection('users').doc(toUserId);
      batch.update(toUserRef, {
        balance: firebase.firestore.FieldValue.increment(amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Log transfer transaction
      const transferLogRef = db.collection('transactions').doc();
      batch.set(transferLogRef, {
        type: 'transfer',
        fromUserId: fromUserId,
        toUserId: toUserId,
        amount: amount,
        reason: reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();
      console.log(`💸 Transfer: ${amount.toLocaleString()} VLTC from ${fromUserId} to ${toUserId}`);
      return true;
    } catch (error) {
      console.error('Error transferring coins:', error);
      throw error;
    }
  }

  async applyInflation() {
    try {
      const now = new Date();
      const lastUpdate = this.lastInflationUpdate ? new Date(this.lastInflationUpdate) : null;
      
      // Check if it's time for inflation (daily)
      if (lastUpdate && (now - lastUpdate) < 24 * 60 * 60 * 1000) {
        return; // Not time for inflation yet
      }

      const dailyInflation = this.circulatingSupply * (this.inflationRate / 365);
      await this.mintCoins(dailyInflation, 'daily_inflation');

      // Update last inflation timestamp
      await db.collection('system').doc('supply').update({
        lastInflationUpdate: firebase.firestore.FieldValue.serverTimestamp()
      });

      this.lastInflationUpdate = now;
      console.log(`📈 Applied daily inflation: ${dailyInflation.toLocaleString()} VLTC`);
    } catch (error) {
      console.error('Error applying inflation:', error);
    }
  }

  async getSupplyStats() {
    return {
      totalSupply: this.totalSupply,
      circulatingSupply: this.circulatingSupply,
      burnedSupply: this.burnedSupply,
      mintedSupply: this.mintedSupply,
      maxSupply: this.maxSupply,
      inflationRate: this.inflationRate,
      lastInflationUpdate: this.lastInflationUpdate,
      tokenomics: this.tokenomics
    };
  }

  async updateInflationRate(newRate) {
    try {
      await db.collection('system').doc('supply').update({
        inflationRate: newRate,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      this.inflationRate = newRate;
      console.log(`📊 Updated inflation rate to ${newRate * 100}%`);
    } catch (error) {
      console.error('Error updating inflation rate:', error);
      throw error;
    }
  }

  startSupplyMonitoring() {
    // Monitor supply every 5 minutes
    setInterval(() => {
      this.applyInflation();
    }, 5 * 60 * 1000);

    // Update supply stats every minute
    setInterval(() => {
      this.updateSupplyStats();
    }, 60 * 1000);
  }

  async updateSupplyStats() {
    try {
      const stats = await this.getSupplyStats();
      
      // Update real-time database for live stats
      await rtdb.ref('supply/stats').set({
        totalSupply: stats.totalSupply,
        circulatingSupply: stats.circulatingSupply,
        burnedSupply: stats.burnedSupply,
        mintedSupply: stats.mintedSupply,
        maxSupply: stats.maxSupply,
        inflationRate: stats.inflationRate,
        lastUpdated: Date.now(),
        tokenomics: stats.tokenomics
      });
    } catch (error) {
      console.error('Error updating supply stats:', error);
    }
  }

  // Economic controls
  async setMaxSupply(newMaxSupply) {
    try {
      await db.collection('system').doc('supply').update({
        maxSupply: newMaxSupply,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      this.maxSupply = newMaxSupply;
      console.log(`🎯 Updated max supply to ${newMaxSupply.toLocaleString()} VLTC`);
    } catch (error) {
      console.error('Error updating max supply:', error);
      throw error;
    }
  }

  async emergencyBurn(amount, reason = 'emergency_burn') {
    console.warn(`🚨 Emergency burn initiated: ${amount.toLocaleString()} VLTC`);
    return await this.burnCoins(amount, reason);
  }

  async getTransactionHistory(limit = 100) {
    try {
      const snapshot = await db.collection('transactions')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}

// Initialize supply manager globally
window.supplyManager = new VaultCoinSupplyManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VaultCoinSupplyManager;
} 