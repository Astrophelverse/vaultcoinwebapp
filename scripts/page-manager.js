// VaultCoin Page Manager
// Handles page transitions, error handling, and loading states

class PageManager {
  constructor() {
    this.currentPage = null;
    this.isLoading = false;
    this.init();
  }

  init() {
    // Prevent default error handling
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    
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

  handleError(event) {
    console.error('Page error:', event.error);
    
    // Don't show error for common non-critical errors
    if (this.isNonCriticalError(event.error)) {
      return;
    }
    
    this.showErrorNotification('An error occurred. Please refresh the page.');
  }

  handlePromiseError(event) {
    console.error('Promise error:', event.reason);
    
    // Don't show error for common non-critical errors
    if (this.isNonCriticalError(event.reason)) {
      return;
    }
    
    this.showErrorNotification('Connection error. Please check your internet.');
  }

  isNonCriticalError(error) {
    // List of errors that shouldn't show user notifications
    const nonCriticalErrors = [
      'NetworkError',
      'QuotaExceededError',
      'NotSupportedError',
      'AbortError'
    ];
    
    return nonCriticalErrors.some(type => 
      error && (error.name === type || error.message?.includes(type))
    );
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

  showErrorNotification(message) {
    // Remove existing error notifications
    const existingErrors = document.querySelectorAll('.page-error-notification');
    existingErrors.forEach(error => error.remove());

    const errorDiv = document.createElement('div');
    errorDiv.className = 'page-error-notification';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-family: 'Satoshi', sans-serif;
      box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
      max-width: 90%;
      text-align: center;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  showSuccessNotification(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'page-success-notification';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #00aa00;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-family: 'Satoshi', sans-serif;
      box-shadow: 0 4px 20px rgba(0, 170, 0, 0.3);
      max-width: 90%;
      text-align: center;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
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

// Override console.error to prevent spam
const originalConsoleError = console.error;
console.error = function(...args) {
  // Only log errors that aren't common Firebase/network errors
  const message = args.join(' ');
  if (!message.includes('Failed to fetch') && 
      !message.includes('NetworkError') &&
      !message.includes('QuotaExceededError')) {
    originalConsoleError.apply(console, args);
  }
};

// Add global error handler for better UX
window.addEventListener('load', () => {
  // Hide any loading states after page load
  setTimeout(() => {
    const loadingElements = document.querySelectorAll('#loading');
    loadingElements.forEach(el => {
      if (el.style.display === 'block') {
        el.style.display = 'none';
      }
    });
  }, 3000);
});

console.log('📄 Page Manager loaded successfully!'); 