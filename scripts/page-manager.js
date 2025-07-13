// VaultCoin Page Manager
// Handles page transitions and loading states (simplified)

class PageManager {
  constructor() {
    this.currentPage = null;
    this.isLoading = false;
    this.init();
  }

  init() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle beforeunload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Initialize current page
    this.currentPage = this.getCurrentPage();
    console.log('Page Manager initialized for:', this.currentPage);
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') return 'mining';
    if (path.includes('shop.html')) return 'shop';
    if (path.includes('tasks.html')) return 'tasks';
    if (path.includes('leaderboard.html')) return 'leaderboard';
    if (path.includes('profile.html')) return 'profile';
    if (path.includes('social.html')) return 'social';
    if (path.includes('admin.html')) return 'admin';
    return 'unknown';
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Page became visible, refresh data if needed
      this.refreshPageData();
    }
  }

  handleBeforeUnload(event) {
    // Clean up any ongoing operations
    this.cleanup();
  }

  async refreshPageData() {
    // Refresh data based on current page
    switch (this.currentPage) {
      case 'leaderboard':
        if (window.vaultCoinLeaderboard) {
          await window.vaultCoinLeaderboard.loadLeaderboard();
        }
        break;
      case 'mining':
        if (window.vaultCoinApp) {
          window.vaultCoinApp.updateUI();
        }
        break;
    }
  }

  cleanup() {
    // Clean up any intervals or listeners
    if (window.vaultCoinApp && window.vaultCoinApp.miningInterval) {
      clearInterval(window.vaultCoinApp.miningInterval);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = loading ? 'block' : 'none';
    }
  }

  // Navigation helper
  navigateToPage(page) {
    if (this.isLoading) return; // Prevent navigation while loading
    
    const pages = {
      'mining': 'index.html',
      'shop': 'shop.html',
      'tasks': 'tasks.html',
      'leaderboard': 'leaderboard.html',
      'profile': 'profile.html',
      'social': 'social.html',
      'admin': 'admin.html'
    };
    
    const targetPage = pages[page];
    if (targetPage && targetPage !== window.location.pathname.split('/').pop()) {
      this.setLoading(true);
      window.location.href = targetPage;
    }
  }
}

// Initialize page manager
window.pageManager = new PageManager();

// Hide any loading states after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingElements = document.querySelectorAll('#loading');
    loadingElements.forEach(el => {
      if (el.style.display === 'block') {
        el.style.display = 'none';
      }
    });
  }, 2000);
});

console.log('📄 Page Manager loaded successfully!'); 