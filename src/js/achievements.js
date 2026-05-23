// achievements.js - Gamified Roastify Achievements (Milestone Hooks)
import soundManager from './soundManager.js';

export const ACHIEVEMENTS = {
  FIRST_ROAST: {
    id: 'FIRST_ROAST',
    title: 'Emotional Damage Recipient',
    description: 'You survived your first roast 🔥',
    badge: '🔥',
    rewardTitle: 'Burn Victim',
    maxProgress: 1
  },
  TEN_ROASTS: {
    id: 'TEN_ROASTS',
    title: 'Certified Roaster',
    description: 'Generated 10 roasts on the platform',
    badge: '🏆',
    rewardTitle: 'Certified Roaster',
    maxProgress: 10
  },
  SHARED_CARD: {
    id: 'SHARED_CARD',
    title: '+1 Shameless',
    description: 'Shared/Downloaded a roast card to roast yourself publicly',
    badge: '🎭',
    rewardTitle: 'Attention Seeker',
    maxProgress: 1
  },
  HALL_OF_FLAME: {
    id: 'HALL_OF_FLAME',
    title: 'Hall of Flame',
    description: 'Survived a roast with a severity score > 90',
    badge: '☢️',
    rewardTitle: 'Nuclear Waste',
    maxProgress: 1
  },
  ANON_REQUESTED: {
    id: 'ANON_REQUESTED',
    title: 'Anonymous Menace',
    description: 'Requested an anonymous roast for a friend',
    badge: '💀',
    rewardTitle: 'Silent Pyromaniac',
    maxProgress: 1
  },
  BATTLE_VETERAN: {
    id: 'BATTLE_VETERAN',
    title: 'Gladiator of Shame',
    description: 'Completed a Roast Battle between two targets',
    badge: '⚔️',
    rewardTitle: 'Battle Veteran',
    maxProgress: 1
  },
  PYROMANIAC: {
    id: 'PYROMANIAC',
    title: 'Pyromaniac',
    description: 'Referred friends to Roastify (Shared referral links 3 times)',
    badge: '🧨',
    rewardTitle: 'Pyromaniac',
    maxProgress: 3
  }
};

// Initial state load
let userProgress = JSON.parse(localStorage.getItem('roastify_user_progress') || '{}');
let unlockedAchievements = JSON.parse(localStorage.getItem('roastify_unlocked_achievements') || '[]');

// Save state to localStorage
function saveState() {
  localStorage.setItem('roastify_user_progress', JSON.stringify(userProgress));
  localStorage.setItem('roastify_unlocked_achievements', JSON.stringify(unlockedAchievements));
}

// Visual toast notification for unlocked achievements
function showToast(achievement) {
  const toastContainer = document.getElementById('achievement-toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="toast-badge">${achievement.badge}</div>
    <div class="toast-content">
      <div class="toast-unlock">ACHIEVEMENT UNLOCKED!</div>
      <div class="toast-title">${achievement.title}</div>
      <div class="toast-desc">${achievement.description}</div>
      <div class="toast-reward">Title Unlocked: <strong>${achievement.rewardTitle}</strong></div>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Custom synth arpeggio sound effect
  playAchievementChime();

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => toast.remove(), 400);
  });

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'achievement-toast-container';
  document.body.appendChild(container);
  return container;
}

// Retro achievement sound using Web Audio API
function playAchievementChime() {
  if (!soundManager.enabled) return;
  soundManager.initContext();
  const ctx = soundManager.ctx;
  if (!ctx) return;

  const now = ctx.currentTime;
  const noteFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

  noteFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.1);

    gainNode.gain.setValueAtTime(0.0, now + index * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + index * 0.1);
    osc.stop(now + index * 0.1 + 0.35);
  });
}

// Check and update progress of achievements
export function trackProgress(achievementId, amount = 1) {
  const ach = ACHIEVEMENTS[achievementId];
  if (!ach) return;

  // If already unlocked, skip
  if (unlockedAchievements.includes(achievementId)) return;

  // Initialize progress if needed
  if (userProgress[achievementId] === undefined) {
    userProgress[achievementId] = 0;
  }

  // Increment progress
  userProgress[achievementId] = Math.min(ach.maxProgress, userProgress[achievementId] + amount);
  
  // Check if milestone achieved
  if (userProgress[achievementId] >= ach.maxProgress) {
    unlockedAchievements.push(achievementId);
    showToast(ach);
    
    // Dispatch global event so UI components can update
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));
  }

  saveState();
}

// Manually unlock an achievement instantly
export function forceUnlock(achievementId) {
  const ach = ACHIEVEMENTS[achievementId];
  if (!ach) return;

  if (!unlockedAchievements.includes(achievementId)) {
    userProgress[achievementId] = ach.maxProgress;
    unlockedAchievements.push(achievementId);
    showToast(ach);
    saveState();
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));
  }
}

// Reset all achievements state
export function resetAchievements() {
  userProgress = {};
  unlockedAchievements = [];
  saveState();
  window.dispatchEvent(new CustomEvent('achievements-reset'));
}

// Get list of all achievements with their current states
export function getAchievementsList() {
  return Object.values(ACHIEVEMENTS).map(ach => {
    const progress = userProgress[ach.id] || 0;
    const unlocked = unlockedAchievements.includes(ach.id);
    return {
      ...ach,
      progress,
      unlocked
    };
  });
}

// Get locked/unlocked counts
export function getAchievementsSummary() {
  return {
    total: Object.keys(ACHIEVEMENTS).length,
    unlocked: unlockedAchievements.length
  };
}

// Check if user is referee or referrer
export function handleReferralCheck() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('ref')) {
    // User joined via a referral link! Unlock first achievement or increment referrer stats
    trackProgress('PYROMANIAC', 1);
  }
}
