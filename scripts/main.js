// VaultCoin WebApp - Main JavaScript
// Premium Mining Ecosystem with Firebase Integration

// Initialize Lucide icons
window.addEventListener("DOMContentLoaded", () => {
  // Wait for Lucide to load and initialize icons
  const initIcons = () => {
    if (window.lucide) {
      lucide.createIcons();
    } else {
      // Retry after a short delay if Lucide hasn't loaded yet
      setTimeout(initIcons, 100);
    }
  };
  
  initIcons();
  
  // Create background particles
  createParticles();
  
  // Add CSS animations
  addCustomStyles();
});

// Create floating particles effect
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 15;
  const colors = ['#f9c922', '#c0c0c0', '#b9f2ff', '#e5e4e2'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (6 + Math.random() * 4) + 's';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    particlesContainer.appendChild(particle);
  }
}

// Add custom CSS animations
function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }
    
    .vault-card {
      animation: cardFloat 6s ease-in-out infinite;
    }
    
    @keyframes cardFloat {
      0%, 100% { transform: translateY(0px) rotateX(0deg); }
      50% { transform: translateY(-10px) rotateX(2deg); }
    }
    
    .mine-btn:active {
      transform: scale(0.95);
    }
    
    .progress-fill {
      transition: stroke-dashoffset 0.3s ease;
    }
    
    .vault-icon {
      transition: all 0.3s ease;
    }
    
    .vault-icon:hover {
      transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    }
  `;
  document.head.appendChild(style);
}

// Supply Management Integration
let supplyManager = null;

// Enhanced mining effects
class MiningEffects {
  static createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: #f9c922;
      border-radius: 50%;
      pointer-events: none;
      animation: sparkleAnim 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
  }
  
  static createRipple(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border: 2px solid #f9c922;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    `;
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
  @keyframes sparkleAnim {
    0% { transform: scale(0) rotate(0deg); opacity: 1; }
    100% { transform: scale(1) rotate(180deg); opacity: 0; }
  }
  
  @keyframes rippleAnim {
    0% { width: 0; height: 0; opacity: 1; }
    100% { width: 100px; height: 100px; opacity: 0; }
  }
`;
document.head.appendChild(sparkleStyle);

// Sound effects (optional)
class SoundEffects {
  static playMiningSound() {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Sound effects disabled');
    }
  }
  
  static playClaimSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play a success chord
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Sound effects disabled');
    }
  }
}

// Enhanced UI interactions
document.addEventListener('DOMContentLoaded', () => {
  // Add click effects to mining button
  const mineBtn = document.getElementById('mine-btn');
  if (mineBtn) {
    mineBtn.addEventListener('click', (e) => {
      // Create ripple effect
      MiningEffects.createRipple(mineBtn);
      
      // Create sparkles around the button
      const rect = mineBtn.getBoundingClientRect();
      for (let i = 0; i < 5; i++) {
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        MiningEffects.createSparkle(x, y);
      }
      
      // Play sound
      SoundEffects.playMiningSound();
    });
  }
  
  // Add hover effects to vault icon
  const vaultIcon = document.getElementById('vault-icon');
  if (vaultIcon) {
    vaultIcon.addEventListener('mouseenter', () => {
      vaultIcon.style.filter = 'drop-shadow(0 0 20px rgba(249, 201, 34, 0.8))';
    });
    
    vaultIcon.addEventListener('mouseleave', () => {
      vaultIcon.style.filter = 'drop-shadow(0 0 10px rgba(249, 201, 34, 0.5))';
    });
  }
  
  // Add smooth scrolling for navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Add click animation
      item.style.transform = 'scale(0.95)';
      setTimeout(() => {
        item.style.transform = 'scale(1)';
      }, 150);
    });
  });
});

// Performance optimization
let animationFrameId;
function optimizeAnimations() {
  // Throttle animations for better performance
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  animationFrameId = requestAnimationFrame(() => {
    // Update any heavy animations here
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// Export for global access
window.VaultCoinEffects = {
  MiningEffects,
  SoundEffects,
  createParticles,
  optimizeAnimations
};
