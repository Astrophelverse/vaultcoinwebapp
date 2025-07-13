// VaultCoin Standardized Navbar
// Ensures consistent navigation across all pages

class VaultCoinNavbar {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename === 'index.html' || filename === '' || path === '/') return 'mining';
    if (filename === 'shop.html') return 'shop';
    if (filename === 'tasks.html') return 'tasks';
    if (filename === 'leaderboard.html') return 'leaderboard';
    if (filename === 'profile.html') return 'profile';
    if (filename === 'social.html') return 'social';
    if (filename === 'admin.html') return 'admin';
    return 'mining';
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupNavbar());
    } else {
      this.setupNavbar();
    }
  }

  setupNavbar() {
    // Find existing navbar
    const existingNavbar = document.querySelector('.nav-bar');
    if (existingNavbar) {
      // Update active state
      this.updateActiveState(existingNavbar);
    } else {
      // Create navbar if it doesn't exist
      this.createNavbar();
    }
  }

  updateActiveState(navbar) {
    // Remove all active classes
    const navItems = navbar.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Add active class to current page
    const currentNavItem = navbar.querySelector(`[href*="${this.currentPage}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
    }
  }

  createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'nav-bar';
    navbar.innerHTML = `
      <a href="index.html" class="nav-item ${this.currentPage === 'mining' ? 'active' : ''}">
        <i data-lucide="zap"></i>
        <span>Mine</span>
      </a>
      <a href="shop.html" class="nav-item ${this.currentPage === 'shop' ? 'active' : ''}">
        <i data-lucide="shopping-cart"></i>
        <span>Shop</span>
      </a>
      <a href="tasks.html" class="nav-item ${this.currentPage === 'tasks' ? 'active' : ''}">
        <i data-lucide="check-square"></i>
        <span>Tasks</span>
      </a>
      <a href="leaderboard.html" class="nav-item ${this.currentPage === 'leaderboard' ? 'active' : ''}">
        <i data-lucide="trophy"></i>
        <span>Top</span>
      </a>
      <a href="profile.html" class="nav-item ${this.currentPage === 'profile' ? 'active' : ''}">
        <i data-lucide="user"></i>
        <span>Profile</span>
      </a>
      <a href="social.html" class="nav-item ${this.currentPage === 'social' ? 'active' : ''}">
        <i data-lucide="share-2"></i>
        <span>Social</span>
      </a>
    `;

    // Add to body
    document.body.appendChild(navbar);
  }

  // Add navbar CSS if not already present
  addNavbarCSS() {
    if (!document.getElementById('navbar-styles')) {
      const style = document.createElement('style');
      style.id = 'navbar-styles';
      style.textContent = `
        .nav-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.8rem 1rem;
          display: flex;
          justify-content: space-around;
          z-index: 100;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.7rem;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.4rem 0.3rem;
          border-radius: 0.5rem;
          min-width: 50px;
          text-align: center;
        }

        .nav-item:hover,
        .nav-item.active {
          color: #f9c922;
          background: rgba(249, 201, 34, 0.1);
        }

        .nav-item svg {
          width: 1.3rem;
          height: 1.3rem;
        }

        @media (max-width: 480px) {
          .nav-item { 
            font-size: 0.65rem; 
            padding: 0.3rem 0.2rem; 
          }
          .nav-item svg { 
            width: 1.2rem; 
            height: 1.2rem; 
          }
        }
        
        @media (max-width: 360px) {
          .nav-item { 
            font-size: 0.6rem; 
            min-width: 45px; 
          }
          .nav-item svg { 
            width: 1.1rem; 
            height: 1.1rem; 
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Initialize navbar
window.vaultCoinNavbar = new VaultCoinNavbar();

// Add CSS
window.vaultCoinNavbar.addNavbarCSS();

console.log('🧭 VaultCoin Navbar initialized!'); 