import './analytics.js';
import soundManager from './soundManager.js';
import generateRoast from './roastEngine.js';
import { trackProgress, forceUnlock, getAchievementsList, getAchievementsSummary, resetAchievements, handleReferralCheck } from './achievements.js';

// DOM Elements
const body = document.body;
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const severitySlider = document.getElementById('severity-slider');
const severityLabels = document.querySelectorAll('.sev-lbl');
const personaSelect = document.getElementById('persona-select');
const languageSelect = document.getElementById('language-select');
const aiModeToggle = document.getElementById('ai-mode-toggle');
const aiKeyWrapper = document.getElementById('ai-key-wrapper');
const geminiKeyInput = document.getElementById('gemini-key');
const toggleKeyVisibilityBtn = document.getElementById('toggle-key-visibility');
const roastForm = document.getElementById('roast-form');
const igniteBtn = document.getElementById('ignite-btn');

// Terminal Elements
const terminalOutput = document.getElementById('terminal-output-text');
const terminalStatus = document.getElementById('terminal-status-indicator');
const typingIndicator = document.getElementById('typing-indicator');
const loadingPhaseText = typingIndicator.querySelector('.loading-phase');
const heatFillBar = document.getElementById('heat-fill-bar');
const tempDisplay = document.getElementById('temp-display');
const outputActions = document.getElementById('output-actions');
const copyRoastBtn = document.getElementById('copy-roast-btn');
const saveHistoryBtn = document.getElementById('save-history-btn');
const downloadCardBtn = document.getElementById('download-card-btn');

// History Drawer Elements
const historyToggleBtn = document.getElementById('history-toggle-btn');
const historyBadge = document.getElementById('history-badge');
const historyOverlay = document.getElementById('history-overlay');
const historyDrawer = document.getElementById('history-drawer');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyList = document.getElementById('history-list');

// Achievements Drawer Elements
const achievementsToggleBtn = document.getElementById('achievements-toggle-btn');
const achievementsBadge = document.getElementById('achievements-badge');
const achievementsOverlay = document.getElementById('achievements-overlay');
const achievementsDrawer = document.getElementById('achievements-drawer');
const closeAchievementsBtn = document.getElementById('close-achievements-btn');
const resetAchievementsBtn = document.getElementById('reset-achievements-btn');
const achievementsList = document.getElementById('achievements-list');
const achievementsProgressText = document.getElementById('achievements-progress-text');

// Leaderboard Drawer Elements
const leaderboardToggleBtn = document.getElementById('leaderboard-toggle-btn');
const leaderboardOverlay = document.getElementById('leaderboard-overlay');
const leaderboardDrawer = document.getElementById('leaderboard-drawer');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// Battle Fields
const battleGithubFields = document.querySelectorAll('.battle-github-fields');
const battleCustomFields = document.querySelectorAll('.battle-custom-fields');
const battleGithub1 = document.getElementById('battle-github-1');
const battleGithub2 = document.getElementById('battle-github-2');
const battleCustomName1 = document.getElementById('battle-custom-name-1');
const battleCustomDesc1 = document.getElementById('battle-custom-desc-1');
const battleCustomName2 = document.getElementById('battle-custom-name-2');
const battleCustomDesc2 = document.getElementById('battle-custom-desc-2');
const battleTypeRadios = document.getElementsByName('battle-type');

// Roast Score Panel
const roastScorePanel = document.getElementById('roast-score-panel');
const scoreCircleFill = document.getElementById('score-circle-fill');
const scoreNumberDisplay = document.getElementById('score-number-display');
const scoreRatingText = document.getElementById('score-rating-text');
const metricCringeFill = document.getElementById('metric-cringe-fill');
const metricCringeVal = document.getElementById('metric-cringe-val');
const metricBuzzwordFill = document.getElementById('metric-buzzword-fill');
const metricBuzzwordVal = document.getElementById('metric-buzzword-val');
const metricFlagsFill = document.getElementById('metric-flags-fill');
const metricFlagsVal = document.getElementById('metric-flags-val');

// Battle Score Panel
const battleScorePanel = document.getElementById('battle-score-panel');
const battlePlayer1Name = document.getElementById('battle-player1-name');
const battlePlayer1Score = document.getElementById('battle-player1-score');
const battlePlayer1Bar = document.getElementById('battle-player1-bar');
const battlePlayer2Name = document.getElementById('battle-player2-name');
const battlePlayer2Score = document.getElementById('battle-player2-score');
const battlePlayer2Bar = document.getElementById('battle-player2-bar');
const battleWinnerBadge = document.getElementById('battle-winner-badge');

// Anonymous Banner
const anonBanner = document.getElementById('anon-banner');

// Sound Toggle Header Button
const soundToggleBtn = document.getElementById('sound-toggle');
const terminalPersonaAvatar = document.getElementById('terminal-persona-avatar');

// State
let activeTab = 'github';
let activeSeverity = 2; // Spicy
let activeLanguage = localStorage.getItem('roastify_language') || 'english';
let currentRoastText = '';
let currentSubject = '';
let roastHistory = JSON.parse(localStorage.getItem('roastify_history') || '[]');

let leaderboardData = JSON.parse(localStorage.getItem('roastify_leaderboard') || '[]');
if (leaderboardData.length === 0) {
  leaderboardData = [
    { name: 'github/torvalds', score: 98, date: new Date().toISOString(), type: 'github', summary: 'Spaghetti code reviewer declared: "Your commits look like a crime scene... squash them!"' },
    { name: 'startup/ZuckMetaverse', score: 95, date: new Date().toISOString(), type: 'startup', summary: 'Silicon Valley VC said: "A pre-revenue cash incinerator with negative enterprise value."' },
    { name: 'github/elonmusk', score: 92, date: new Date().toISOString(), type: 'github', summary: 'Condescending Code Reviewer sighed: "Rejecting this branch. Go back to boot camp."' }
  ];
  localStorage.setItem('roastify_leaderboard', JSON.stringify(leaderboardData));
}

// Fun Loading Phase Messages
const LOADING_MESSAGES = [
  "Initializing thermal capacitors...",
  "Calibrating insult matrices...",
  "Scanning target vulnerabilities...",
  "Retrieving repository statistics...",
  "Parsing style sheets of shame...",
  "Generating witty analogies...",
  "Pouring hot sauce on server logic...",
  "Consulting the archives of emotional damage..."
];

// Initialize UI
function init() {
  // Restore sound preferences
  updateSoundIcon();
  
  // Set persona avatar baseline
  updatePersonaAvatar(personaSelect.value);

  // Sync language selection dropdown
  languageSelect.value = activeLanguage;
  
  // Set default AI mode checked state
  aiModeToggle.checked = true;
  
  // Pre-load key from session storage or Vite env if available
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const savedKey = sessionStorage.getItem('gemini_api_key');
  if (savedKey) {
    geminiKeyInput.value = savedKey;
    aiKeyWrapper.classList.add('visible');
  } else if (envKey) {
    geminiKeyInput.value = envKey;
    aiKeyWrapper.classList.add('visible');
  }
  
  // Set initial theme
  updateSeverityTheme(activeSeverity);

  // Sync severity slider position
  severitySlider.value = activeSeverity;

  // Setup tab event listeners
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundManager.playClick();
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Setup severity slider event listeners
  severitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (val !== activeSeverity) {
      soundManager.playClick();
      activeSeverity = val;
      updateSeverityTheme(activeSeverity);
    }
  });

  // Click on severity labels to snap slider
  severityLabels.forEach(lbl => {
    lbl.addEventListener('click', () => {
      const val = parseInt(lbl.getAttribute('data-val'));
      if (val !== activeSeverity) {
        soundManager.playClick();
        activeSeverity = val;
        severitySlider.value = val;
        updateSeverityTheme(activeSeverity);
      }
    });
  });

  // Sound toggle button
  soundToggleBtn.addEventListener('click', () => {
    const isEnabled = soundManager.toggleSound();
    if (isEnabled) {
      soundManager.initContext();
      soundManager.playClick();
    }
    updateSoundIcon();
  });

  // AI Mode Toggle
  aiModeToggle.addEventListener('change', (e) => {
    soundManager.playClick();
    if (e.target.checked) {
      aiKeyWrapper.classList.add('visible');
      // Load saved key if exists in session storage
      geminiKeyInput.value = sessionStorage.getItem('gemini_api_key') || '';
    } else {
      aiKeyWrapper.classList.remove('visible');
    }
  });

  // API Key visiblity toggle
  toggleKeyVisibilityBtn.addEventListener('click', () => {
    soundManager.playClick();
    const type = geminiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    geminiKeyInput.setAttribute('type', type);
    const icon = toggleKeyVisibilityBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });

  // History Drawer toggles
  historyToggleBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleHistoryDrawer(true);
  });
  closeHistoryBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleHistoryDrawer(false);
  });
  historyOverlay.addEventListener('click', () => {
    toggleHistoryDrawer(false);
  });
  clearHistoryBtn.addEventListener('click', () => {
    soundManager.playClick();
    if (confirm("Are you sure you want to clear your Roast Vault? This cannot be undone.")) {
      roastHistory = [];
      localStorage.setItem('roastify_history', JSON.stringify(roastHistory));
      renderHistory();
    }
  });

  // Achievements Drawer toggles
  achievementsToggleBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleAchievementsDrawer(true);
  });
  closeAchievementsBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleAchievementsDrawer(false);
  });
  achievementsOverlay.addEventListener('click', () => {
    toggleAchievementsDrawer(false);
  });
  resetAchievementsBtn.addEventListener('click', () => {
    soundManager.playClick();
    if (confirm("Are you sure you want to reset all achievements progress?")) {
      resetAchievements();
      renderAchievements();
    }
  });

  // Leaderboard Drawer toggles
  leaderboardToggleBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleLeaderboardDrawer(true);
  });
  closeLeaderboardBtn.addEventListener('click', () => {
    soundManager.playClick();
    toggleLeaderboardDrawer(false);
  });
  leaderboardOverlay.addEventListener('click', () => {
    toggleLeaderboardDrawer(false);
  });

  // Battle Type Radio toggles
  battleTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      soundManager.playClick();
      updateBattleInputsVisibility();
    });
  });

  // Check URL parameters for referral/anonymous request
  handleReferralCheck();
  
  const params = new URLSearchParams(window.location.search);
  if (params.get('anon') === 'true') {
    anonBanner.classList.remove('hidden');
    const target = params.get('target');
    if (target) {
      switchTab('custom');
      document.getElementById('custom-target').value = target;
      trackProgress('ANON_REQUESTED', 1);
    }
  }

  // Inject Anonymous Link Generator inside Custom tab
  setupAnonymousRequestLinkGenerator();

  // Listen for global achievement updates
  window.addEventListener('achievement-unlocked', () => {
    updateAchievementsBadge();
  });
  window.addEventListener('achievements-reset', () => {
    updateAchievementsBadge();
  });

  // Persona Selection Change
  personaSelect.addEventListener('change', () => {
    soundManager.playClick();
    updatePersonaAvatar(personaSelect.value);
  });

  // Language Selection Change
  languageSelect.addEventListener('change', () => {
    soundManager.playClick();
    activeLanguage = languageSelect.value;
    localStorage.setItem('roastify_language', activeLanguage);
  });

  // Form Submission
  roastForm.addEventListener('submit', handleIgniteSubmit);

  // Output Actions
  copyRoastBtn.addEventListener('click', handleCopyRoast);
  saveHistoryBtn.addEventListener('click', handleSaveRoast);
  downloadCardBtn.addEventListener('click', handleDownloadCard);

  // Initial Renderings
  renderHistory();
  updateAchievementsBadge();
  setupFaqAccordion();
}

// Sound icon updater
function updateSoundIcon() {
  const icon = soundToggleBtn.querySelector('i');
  if (soundManager.enabled) {
    icon.className = 'fas fa-volume-high';
    soundToggleBtn.style.color = '';
  } else {
    icon.className = 'fas fa-volume-xmark';
    soundToggleBtn.style.color = '#ef4444';
  }
}

// Persona avatar updater
function updatePersonaAvatar(persona) {
  if (!terminalPersonaAvatar) return;
  
  let avatar = '👨‍🍳';
  if (persona === 'gordon') avatar = '👨‍🍳';
  else if (persona === 'vc') avatar = '💼';
  else if (persona === 'reviewer') avatar = '🧐';
  else if (persona === 'shakespeare') avatar = '📜';
  else if (persona === 'genz') avatar = '💀';
  
  terminalPersonaAvatar.textContent = avatar;
  
  // Add a nice rotation effect on change
  terminalPersonaAvatar.style.transform = 'rotate(360deg) scale(1.2)';
  setTimeout(() => {
    terminalPersonaAvatar.style.transform = '';
  }, 300);
}

// Tab switcher logic
function switchTab(tabName) {
  activeTab = tabName;
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
      if (tabName !== 'battle') {
        const input = content.querySelector('input, textarea');
        if (input) input.setAttribute('required', 'required');
      }
    } else {
      content.classList.remove('active');
      const input = content.querySelector('input, textarea');
      if (input) input.removeAttribute('required');
    }
  });

  if (tabName === 'battle') {
    updateBattleInputsVisibility();
  } else {
    battleGithub1.removeAttribute('required');
    battleGithub2.removeAttribute('required');
    battleCustomName1.removeAttribute('required');
    battleCustomName2.removeAttribute('required');
  }
}

// Dynamic theme changing based on severity
function updateSeverityTheme(severity) {
  body.className = '';
  severityLabels.forEach(lbl => lbl.classList.remove('active'));

  if (severity === 1) {
    body.classList.add('theme-mild');
    document.querySelector('.sev-lbl[data-val="1"]').classList.add('active');
    tempDisplay.textContent = "38°C (WARM)";
    heatFillBar.style.width = "25%";
  } else if (severity === 2) {
    body.classList.add('theme-spicy');
    document.querySelector('.sev-lbl[data-val="1"]').classList.add('active');
    document.querySelector('.sev-lbl[data-val="2"]').classList.add('active');
    tempDisplay.textContent = "85°C (PIPING HOT)";
    heatFillBar.style.width = "60%";
  } else {
    body.classList.add('theme-nuclear');
    document.querySelector('.sev-lbl[data-val="1"]').classList.add('active');
    document.querySelector('.sev-lbl[data-val="2"]').classList.add('active');
    document.querySelector('.sev-lbl[data-val="3"]').classList.add('active');
    tempDisplay.textContent = "240°C (CRITICAL MELTDOWN)";
    heatFillBar.style.width = "95%";
  }
}

// History Panel Actions
function toggleHistoryDrawer(open) {
  if (open) {
    historyDrawer.classList.add('active');
    historyOverlay.classList.add('active');
  } else {
    historyDrawer.classList.remove('active');
    historyOverlay.classList.remove('active');
  }
}

function renderHistory() {
  historyBadge.textContent = roastHistory.length;
  if (roastHistory.length > 0) {
    historyBadge.classList.remove('hidden');
  } else {
    historyBadge.classList.add('hidden');
  }

  if (roastHistory.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <i class="fas fa-box-open empty-icon"></i>
        <p>No emotional damage logged yet.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = '';
  // Sort reverse chronological
  const sorted = [...roastHistory].reverse();
  sorted.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'history-item';
    
    const severityText = item.severity === 1 ? 'Mild' : item.severity === 2 ? 'Spicy' : 'Nuclear';
    const severityClass = severityText.toLowerCase();

    itemEl.innerHTML = `
      <div class="history-item-header">
        <span class="history-item-subject">${escapeHtml(item.subject)}</span>
        <span class="history-item-tag ${severityClass}">${severityText}</span>
      </div>
      <div class="history-item-text">${escapeHtml(item.roast)}</div>
      <div class="history-item-footer">
        <span>${new Date(item.date).toLocaleDateString()}</span>
        <div class="history-item-actions">
          <button class="history-item-btn load-btn" data-id="${item.id}" title="Load into Terminal">
            <i class="fas fa-terminal"></i>
          </button>
          <button class="history-item-btn delete-btn" data-id="${item.id}" title="Delete Roast">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    // Hook up load / delete buttons
    itemEl.querySelector('.load-btn').addEventListener('click', () => {
      soundManager.playClick();
      loadRoastToTerminal(item);
      toggleHistoryDrawer(false);
    });

    itemEl.querySelector('.delete-btn').addEventListener('click', () => {
      soundManager.playClick();
      deleteHistoryItem(item.id);
    });

    historyList.appendChild(itemEl);
  });
}

function deleteHistoryItem(id) {
  roastHistory = roastHistory.filter(item => item.id !== id);
  localStorage.setItem('roastify_history', JSON.stringify(roastHistory));
  renderHistory();
}

function loadRoastToTerminal(item) {
  // Instantly load roast without typewriter animations
  currentRoastText = item.roast;
  currentSubject = item.subject;
  activeSeverity = item.severity;
  updateSeverityTheme(activeSeverity);
  
  terminalOutput.innerHTML = `
    <div class="terminal-line system-line"><span class="prompt">></span> Restored roast from vault: [${escapeHtml(item.subject)}]</div>
    <div class="roast-output">${escapeHtml(item.roast)}</div>
  `;
  outputActions.classList.remove('disabled');

  // Scroll to output panel on mobile/tablet viewports
  if (window.innerWidth <= 1024) {
    const outputPanel = document.getElementById('output-panel');
    if (outputPanel) {
      outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// GitHub API Fetcher
async function fetchGithubProfile(username) {
  const profileUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  updateLoadingText("Accessing GitHub credentials...");
  const profileRes = await fetch(profileUrl);
  if (!profileRes.ok) {
    if (profileRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found. Did they delete their account out of fear?`);
    }
    throw new Error(`Failed to fetch GitHub profile: status ${profileRes.status}`);
  }

  const profileData = await profileRes.json();
  
  updateLoadingText("Cloning repository list...");
  const reposRes = await fetch(reposUrl);
  let languages = [];
  let reposCount = profileData.public_repos;

  if (reposRes.ok) {
    const reposData = await reposRes.json();
    // Tally up languages
    const langCounts = {};
    reposData.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });
    // Sort languages by count
    languages = Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a]);
  }

  return {
    username: username,
    name: profileData.name || username,
    bio: profileData.bio || '',
    followers: profileData.followers,
    following: profileData.following,
    reposCount: reposCount,
    languages: languages
  };
}

// Update loading text during generation
function updateLoadingText(text) {
  loadingPhaseText.textContent = text;
}

// Text animation helper that prints characters one by one
async function animateText(outputDiv, text, speed = 15) {
  const characters = Array.from(text);
  let currentOutput = '';
  for (let i = 0; i < characters.length; i++) {
    currentOutput += characters[i];
    outputDiv.innerHTML = escapeHtml(currentOutput).replace(/\n/g, '<br>');
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    if (i % 4 === 0) {
      soundManager.playTypewriter();
    }
    await new Promise(resolve => setTimeout(resolve, speed));
  }
}

// Typewriter output animation in terminal for standard roasts
async function runTypewriter(text) {
  terminalOutput.innerHTML = `<div class="terminal-line system-line"><span class="prompt">></span> Analysis complete. Dispensing burns:</div>`;
  const outputDiv = document.createElement('div');
  outputDiv.className = 'roast-output';
  terminalOutput.appendChild(outputDiv);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;

  const speed = activeSeverity === 1 ? 25 : activeSeverity === 2 ? 15 : 8;
  await animateText(outputDiv, text, speed);
}

// Typewriter animation specifically for Battle Mode results
async function runBattleTypewriter(res) {
  terminalOutput.innerHTML = `<div class="terminal-line system-line"><span class="prompt">></span> Battle analysis complete. Dispensing dual burns:</div>`;
  const speed = activeSeverity === 1 ? 20 : activeSeverity === 2 ? 12 : 6;

  // 1. Contestant 1 Roast
  const name1 = currentSubject.split(' vs ')[0].replace('battle: ', '');
  const div1 = document.createElement('div');
  div1.className = 'roast-output';
  div1.innerHTML = `<div style="font-weight: 800; color: hsl(var(--accent)); margin-bottom: 6px;">⚔️ CONTESTANT 1: ${escapeHtml(name1)} (Score: ${res.score1})</div>`;
  terminalOutput.appendChild(div1);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  await animateText(div1, res.roast1, speed);

  // 2. Contestant 2 Roast
  const name2 = currentSubject.split(' vs ')[1];
  const div2 = document.createElement('div');
  div2.className = 'roast-output';
  div2.innerHTML = `<div style="font-weight: 800; color: hsl(var(--accent)); margin-bottom: 6px;">⚔️ CONTESTANT 2: ${escapeHtml(name2)} (Score: ${res.score2})</div>`;
  terminalOutput.appendChild(div2);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  await animateText(div2, res.roast2, speed);

  // 3. Verdict & Winner
  const divVerdict = document.createElement('div');
  divVerdict.className = 'roast-output';
  divVerdict.style.borderColor = 'var(--accent-glow)';
  divVerdict.innerHTML = `<div style="font-weight: 800; color: #ffca28; margin-bottom: 6px;">🏆 BATTLE VERDICT: Winner is ${escapeHtml(res.winner)}</div>`;
  terminalOutput.appendChild(divVerdict);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  await animateText(divVerdict, res.verdict, speed);
}

// Form submit event handler
async function handleIgniteSubmit(e) {
  e.preventDefault();
  
  // Audio context initialization
  soundManager.initContext();

  // Reset actions buttons & hide score panel
  outputActions.classList.add('disabled');
  roastScorePanel.classList.add('hidden');
  battleScorePanel.classList.add('hidden');
  currentRoastText = '';

  // Scroll to output panel on mobile/tablet viewports
  if (window.innerWidth <= 1024) {
    const outputPanel = document.getElementById('output-panel');
    if (outputPanel) {
      outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Get configuration
  const persona = personaSelect.value;
  const language = languageSelect.value;
  const aiMode = aiModeToggle.checked;
  const apiKey = geminiKeyInput.value.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (aiMode && apiKey) {
    sessionStorage.setItem('gemini_api_key', apiKey);
  }

  // Visual UI Busy state
  igniteBtn.setAttribute('disabled', 'disabled');
  igniteBtn.classList.add('loading');
  terminalStatus.className = 'terminal-status busy';
  terminalStatus.innerHTML = '<span class="status-pulse"></span> PROCESSING';
  typingIndicator.classList.remove('hidden');
  
  // Set terminal lines
  terminalOutput.innerHTML = `
    <div class="terminal-line system-line"><span class="prompt">></span> Starting RaaS Core ignition sequence...</div>
    <div class="terminal-line system-line"><span class="prompt">></span> Selected category: ${activeTab.toUpperCase()}</div>
    <div class="terminal-line system-line"><span class="prompt">></span> Selected severity: ${activeSeverity === 1 ? 'MILD' : activeSeverity === 2 ? 'SPICY' : 'NUCLEAR'}</div>
    <div class="terminal-line system-line"><span class="prompt">></span> Selected persona: ${persona.toUpperCase()}</div>
    <div class="terminal-line system-line"><span class="prompt">></span> Selected language: ${language.toUpperCase()}</div>
  `;

  // Start Heat / Temperature Animation
  let startTemp = activeSeverity === 1 ? 25 : activeSeverity === 2 ? 38 : 85;
  let targetTemp = activeSeverity === 1 ? 45 : activeSeverity === 2 ? 105 : 320;
  let tempRange = targetTemp - startTemp;
  
  let tempInterval = setInterval(() => {
    let currentFill = parseFloat(heatFillBar.style.width || "0");
    if (currentFill < 100) {
      currentFill += 1.5;
      heatFillBar.style.width = `${Math.min(100, currentFill)}%`;
      
      let computedTemp = Math.round(startTemp + (tempRange * (currentFill / 100)));
      let suffix = computedTemp > 200 ? ' (MELTDOWN)' : computedTemp > 100 ? ' (SCORCHING)' : ' (WARMING)';
      tempDisplay.textContent = `${computedTemp}°C${suffix}`;
    }
  }, 30);

  // Play Sound Effects
  if (activeSeverity === 3) {
    soundManager.playNuclear();
  } else {
    soundManager.playBurn(2.5);
  }

  // Load Message rotator
  let messageIndex = 0;
  let messageInterval = setInterval(() => {
    updateLoadingText(LOADING_MESSAGES[messageIndex]);
    messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
  }, 1000);

  try {
    let payloadData = {};
    
    // Switch on input collection type
    if (activeTab === 'github') {
      const username = document.getElementById('github-username').value.trim();
      currentSubject = `github/${username}`;
      payloadData = await fetchGithubProfile(username);
    } else if (activeTab === 'resume') {
      const text = document.getElementById('resume-text').value.trim();
      currentSubject = `resume/profile`;
      payloadData = { resumeText: text };
    } else if (activeTab === 'startup') {
      const name = document.getElementById('startup-name').value.trim() || 'NoName Startup';
      const desc = document.getElementById('startup-desc').value.trim();
      currentSubject = `startup/${name}`;
      payloadData = { startupName: name, startupDesc: desc };
    } else if (activeTab === 'code') {
      const text = document.getElementById('code-editor').value.trim();
      currentSubject = `code/snippet`;
      payloadData = { codeText: text };
    } else if (activeTab === 'custom') {
      const target = document.getElementById('custom-target').value.trim() || 'My Subject';
      const text = document.getElementById('custom-text').value.trim();
      currentSubject = `custom/${target}`;
      payloadData = { target: target, text: text };
    } else if (activeTab === 'battle') {
      const battleType = document.querySelector('input[name="battle-type"]:checked').value;
      if (battleType === 'github') {
        const u1 = battleGithub1.value.trim();
        const u2 = battleGithub2.value.trim();
        currentSubject = `battle: ${u1} vs ${u2}`;
        
        updateLoadingText(`Fetching profile for ${u1}...`);
        const profile1 = await fetchGithubProfile(u1);
        
        updateLoadingText(`Fetching profile for ${u2}...`);
        const profile2 = await fetchGithubProfile(u2);
        
        payloadData = {
          type: 'github',
          target1: u1,
          target2: u2,
          profile1,
          profile2
        };
      } else {
        const n1 = battleCustomName1.value.trim();
        const n2 = battleCustomName2.value.trim();
        currentSubject = `battle: ${n1} vs ${n2}`;
        payloadData = {
          type: 'custom',
          target1: n1,
          target2: n2,
          text1: battleCustomDesc1.value.trim(),
          text2: battleCustomDesc2.value.trim()
        };
      }
    }

    updateLoadingText("Condensing heat particles...");

    // Call Engine
    const res = await generateRoast({
      category: activeTab,
      data: payloadData,
      severity: activeSeverity.toString(),
      persona: persona,
      language: language,
      aiMode: aiMode,
      apiKey: apiKey
    });

    // Clean up loading loops
    clearInterval(tempInterval);
    clearInterval(messageInterval);
    typingIndicator.classList.add('hidden');

    if (activeTab === 'battle') {
      currentRoastText = `Contestant 1 (${currentSubject.split(' vs ')[0].replace('battle: ', '')}) Roast:\n${res.roast1}\n\nContestant 2 (${currentSubject.split(' vs ')[1]}) Roast:\n${res.roast2}\n\nVERDICT:\n${res.verdict}\n\n🏆 Winner: ${res.winner}`;
      
      // Typewrite battle details
      await runBattleTypewriter(res);

      // Track battle achievements
      trackProgress('BATTLE_VETERAN', 1);

      // Show Battle Score Panel
      const contestant1 = currentSubject.split(' vs ')[0].replace('battle: ', '');
      const contestant2 = currentSubject.split(' vs ')[1];
      showBattleScore(res.score1 || 75, res.score2 || 70, contestant1, contestant2, res.winner);
    } else {
      currentRoastText = res.roast;
      
      // Typewriter effect
      await runTypewriter(res.roast);
      
      // Show Roast Score panel
      showRoastScore(res.score, res.cringe, res.buzzword, res.flags);

      // Update leaderboard
      updateLeaderboardWithRoast(currentSubject, res.score, activeTab, res.roast);

      // Track standard roast achievements
      trackProgress('FIRST_ROAST', 1);
      trackProgress('TEN_ROASTS', 1);
      if (res.score >= 90) {
        trackProgress('HALL_OF_FLAME', 1);
      }
    }

    // Play chiptune victory sound
    soundManager.playLaughter();

    // Enable Actions
    outputActions.classList.remove('disabled');

  } catch (error) {
    clearInterval(tempInterval);
    clearInterval(messageInterval);
    typingIndicator.classList.add('hidden');
    
    soundManager.playClick();
    terminalOutput.innerHTML += `
      <div class="terminal-line" style="color: #f87171; font-weight: bold;">
        <span class="prompt">></span> ERROR: ${escapeHtml(error.message)}
      </div>
    `;
    console.error(error);
  } finally {
    // Reset Busy Visual State
    igniteBtn.removeAttribute('disabled');
    igniteBtn.classList.remove('loading');
    terminalStatus.className = 'terminal-status';
    terminalStatus.innerHTML = '<span class="status-pulse"></span> READY';
    
    // Correct heat display bar position back to the baseline theme state
    updateSeverityTheme(activeSeverity);
  }
}

// Copy Roast Text
function handleCopyRoast() {
  if (!currentRoastText) return;
  soundManager.playClick();
  
  navigator.clipboard.writeText(currentRoastText).then(() => {
    const origText = copyRoastBtn.innerHTML;
    copyRoastBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyRoastBtn.innerHTML = origText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Save Roast to History
function handleSaveRoast() {
  if (!currentRoastText) return;
  soundManager.playClick();

  // Prevent double saving the exact same roast back to back
  const exists = roastHistory.some(item => item.roast === currentRoastText);
  if (exists) {
    alert("This roast is already saved in your Vault!");
    return;
  }

  const newItem = {
    id: Date.now().toString(),
    subject: currentSubject,
    roast: currentRoastText,
    severity: activeSeverity,
    date: new Date().toISOString()
  };

  roastHistory.push(newItem);
  localStorage.setItem('roastify_history', JSON.stringify(roastHistory));
  renderHistory();

  const origText = saveHistoryBtn.innerHTML;
  saveHistoryBtn.innerHTML = '<i class="fas fa-bookmark-slash"></i> Saved!';
  saveHistoryBtn.style.color = 'hsl(var(--accent))';
  setTimeout(() => {
    saveHistoryBtn.innerHTML = origText;
    saveHistoryBtn.style.color = '';
  }, 2000);
}

// Download/Share Roast Card using HTML5 Canvas drawing (No external library requirement)
function handleDownloadCard() {
  if (!currentRoastText) return;
  soundManager.playClick();

  // Track achievements
  trackProgress('SHARED_CARD', 1);

  // Create a canvas dynamically
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions
  const width = 800;
  const height = 550;
  canvas.width = width;
  canvas.height = height;

  // Background Gradient
  const gradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, width);
  let color1 = '#12131e';
  let color2 = '#07080c';
  let accentColor = '#e63900';
  let severityLabel = 'SPICY BURNS';

  if (activeSeverity === 1) {
    color1 = '#1f1a10';
    color2 = '#0c0a06';
    accentColor = '#f2a900';
    severityLabel = 'MILD MOCKERY';
  } else if (activeSeverity === 3) {
    color1 = '#28103c';
    color2 = '#0e0515';
    accentColor = '#e033ff';
    severityLabel = 'NUCLEAR CRISIS';
  }

  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Glow
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  
  // Subtle inner grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 50; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 50; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw Header Logo text
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 24px Outfit, sans-serif';
  ctx.fillText('ROASTIFY', 50, 60);

  // Draw fire emoji or draw a symbol
  ctx.fillStyle = accentColor;
  ctx.font = '800 24px Outfit, sans-serif';
  ctx.fillText('🔥', 175, 60);

  // Draw Severity Badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, width - 200, 38, 150, 28, 4, true, true);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 11px Space Grotesk, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(severityLabel, width - 125, 56);
  ctx.textAlign = 'left'; // Reset

  // Draw Target/Subject Header
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 16px Outfit, sans-serif';
  ctx.fillText(`Target: ${currentSubject}`, 50, 110);

  // Draw Separator Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 135);
  ctx.lineTo(width - 50, 135);
  ctx.stroke();

  // Draw Roast Content (Wrap Text)
  ctx.fillStyle = '#ffedd5';
  ctx.font = 'italic 400 20px Outfit, sans-serif';
  
  // Wrap lines helper
  const textX = 50;
  let textY = 180;
  const maxWidth = width - 100;
  const lineHeight = 30;
  
  wrapText(ctx, currentRoastText, textX, textY, maxWidth, lineHeight);

  // Draw Footer Details
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 13px Space Grotesk, monospace';
  const personaText = `BY ${personaSelect.options[personaSelect.selectedIndex].text.toUpperCase()}`;
  ctx.fillText(personaText, 50, height - 50);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 13px Space Grotesk, monospace';
  ctx.fillText('ROAST-AS-A-SERIVICE.VERCEL.APP', width - 295, height - 50);

  // Trigger browser download
  const image = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.download = `roastify-${currentSubject.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  link.href = image;
  link.click();
}

// Canvas Rounded Rectangle helper
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Canvas Text Wrap helper
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  // Split on manual linebreaks to preserve them
  const paragraphs = text.split('\n');
  
  for (let p = 0; p < paragraphs.length; p++) {
    const words = paragraphs[p].split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y);
    y += lineHeight * 1.3; // extra paragraph gap
  }
}

// HTML Escaper helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// Viral Features helper functions
// ==========================================================================

function updateBattleInputsVisibility() {
  const battleType = document.querySelector('input[name="battle-type"]:checked').value;
  if (battleType === 'github') {
    battleGithubFields.forEach(el => el.classList.remove('hidden'));
    battleCustomFields.forEach(el => el.classList.add('hidden'));
    battleGithub1.setAttribute('required', 'required');
    battleGithub2.setAttribute('required', 'required');
    battleCustomName1.removeAttribute('required');
    battleCustomName2.removeAttribute('required');
  } else {
    battleGithubFields.forEach(el => el.classList.add('hidden'));
    battleCustomFields.forEach(el => el.classList.remove('hidden'));
    battleGithub1.removeAttribute('required');
    battleGithub2.removeAttribute('required');
    battleCustomName1.setAttribute('required', 'required');
    battleCustomName2.setAttribute('required', 'required');
  }
}

function setupAnonymousRequestLinkGenerator() {
  const customTab = document.getElementById('tab-custom');
  if (customTab) {
    if (document.getElementById('gen-anon-link-btn')) return;
    
    const anonBtnWrapper = document.createElement('div');
    anonBtnWrapper.className = 'mt-3 mb-2';
    anonBtnWrapper.innerHTML = `
      <button type="button" id="gen-anon-link-btn" class="header-btn" style="width: 100%; font-size: 0.82rem; padding: 8px 12px; gap: 8px; justify-content: center;">
        <i class="fas fa-mask"></i> Generate Anonymous Roast Link for Friend
      </button>
      <p id="anon-link-output" class="input-desc hidden" style="color: #a855f7; word-break: break-all; margin-top: 8px;"></p>
    `;
    customTab.appendChild(anonBtnWrapper);
    
    anonBtnWrapper.querySelector('#gen-anon-link-btn').addEventListener('click', () => {
      soundManager.playClick();
      const target = document.getElementById('custom-target').value.trim();
      if (!target) {
        alert('Please enter who you want to roast first in the target field above!');
        return;
      }
      const anonLink = `${window.location.origin}${window.location.pathname}?anon=true&target=${encodeURIComponent(target)}`;
      navigator.clipboard.writeText(anonLink).then(() => {
        const out = anonBtnWrapper.querySelector('#anon-link-output');
        out.classList.remove('hidden');
        out.innerHTML = `<i class="fas fa-check"></i> Link Copied! Send it to your friend: <br><strong>${anonLink}</strong>`;
        trackProgress('ANON_REQUESTED', 1);
      });
    });
  }
}

function updateLeaderboardWithRoast(name, score, type, roastText) {
  const existingIndex = leaderboardData.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
  if (existingIndex !== -1) {
    if (score > leaderboardData[existingIndex].score) {
      leaderboardData[existingIndex].score = score;
      leaderboardData[existingIndex].date = new Date().toISOString();
      leaderboardData[existingIndex].summary = roastText.substring(0, 80) + '...';
    }
  } else {
    leaderboardData.push({
      name: name,
      score: score,
      date: new Date().toISOString(),
      type: type,
      summary: roastText.substring(0, 80) + '...'
    });
  }

  leaderboardData.sort((a, b) => b.score - a.score);
  leaderboardData = leaderboardData.slice(0, 10);
  localStorage.setItem('roastify_leaderboard', JSON.stringify(leaderboardData));
}

function showRoastScore(score, cringe, buzzword, flags) {
  roastScorePanel.classList.remove('hidden');
  
  const offset = 251.2 - (251.2 * score) / 100;
  scoreCircleFill.style.strokeDashoffset = offset;
  
  let count = 0;
  scoreNumberDisplay.textContent = 0;
  const interval = setInterval(() => {
    if (count >= score) {
      scoreNumberDisplay.textContent = score;
      clearInterval(interval);
    } else {
      count++;
      scoreNumberDisplay.textContent = count;
    }
  }, 8);
  
  let rating = 'MILD TEASING';
  if (score >= 90) rating = 'CRITICAL MELTDOWN';
  else if (score >= 70) rating = 'SCORCHING HEAT';
  else if (score >= 50) rating = 'PIPING HOT';
  
  scoreRatingText.textContent = rating;
  
  metricCringeFill.style.width = `${cringe}%`;
  metricCringeVal.textContent = `${cringe}%`;
  
  metricBuzzwordFill.style.width = `${buzzword}%`;
  metricBuzzwordVal.textContent = `${buzzword}%`;
  
  metricFlagsFill.style.width = `${flags}%`;
  metricFlagsVal.textContent = `${flags}%`;
}

function showBattleScore(score1, score2, name1, name2, winnerName) {
  battleScorePanel.classList.remove('hidden');
  
  battlePlayer1Name.textContent = name1;
  battlePlayer2Name.textContent = name2;
  
  // Animate score 1
  let count1 = 0;
  battlePlayer1Score.textContent = 0;
  battlePlayer1Bar.style.width = '0%';
  
  const interval1 = setInterval(() => {
    if (count1 >= score1) {
      battlePlayer1Score.textContent = score1;
      battlePlayer1Bar.style.width = `${score1}%`;
      clearInterval(interval1);
    } else {
      count1++;
      battlePlayer1Score.textContent = count1;
    }
  }, 10);
  
  // Animate score 2
  let count2 = 0;
  battlePlayer2Score.textContent = 0;
  battlePlayer2Bar.style.width = '0%';
  
  const interval2 = setInterval(() => {
    if (count2 >= score2) {
      battlePlayer2Score.textContent = score2;
      battlePlayer2Bar.style.width = `${score2}%`;
      clearInterval(interval2);
    } else {
      count2++;
      battlePlayer2Score.textContent = count2;
    }
  }, 10);
  
  // Winner crown badge show
  if (battleWinnerBadge) {
    battleWinnerBadge.classList.remove('hidden');
  }
  
  // Highlight winner player panel
  const p1Panel = document.querySelector('.battle-score-player.player1');
  const p2Panel = document.querySelector('.battle-score-player.player2');
  if (p1Panel && p2Panel) {
    p1Panel.style.border = '';
    p2Panel.style.border = '';
    p1Panel.style.boxShadow = '';
    p2Panel.style.boxShadow = '';
    
    setTimeout(() => {
      if (winnerName && winnerName.toLowerCase().trim() === name1.toLowerCase().trim()) {
        p1Panel.style.border = '1px solid #ffca28';
        p1Panel.style.boxShadow = '0 0 15px rgba(255, 202, 40, 0.15)';
      } else if (winnerName && winnerName.toLowerCase().trim() === name2.toLowerCase().trim()) {
        p2Panel.style.border = '1px solid #ffca28';
        p2Panel.style.boxShadow = '0 0 15px rgba(255, 202, 40, 0.15)';
      }
    }, 1000);
  }
}

function toggleAchievementsDrawer(open) {
  if (open) {
    renderAchievements();
    achievementsDrawer.classList.add('active');
    achievementsOverlay.classList.add('active');
  } else {
    achievementsDrawer.classList.remove('active');
    achievementsOverlay.classList.remove('active');
  }
}

function toggleLeaderboardDrawer(open) {
  if (open) {
    renderLeaderboard();
    leaderboardDrawer.classList.add('active');
    leaderboardOverlay.classList.add('active');
  } else {
    leaderboardDrawer.classList.remove('active');
    leaderboardOverlay.classList.remove('active');
  }
}

function updateAchievementsBadge() {
  const summary = getAchievementsSummary();
  achievementsBadge.textContent = summary.unlocked;
  if (summary.unlocked > 0) {
    achievementsBadge.classList.remove('hidden');
  } else {
    achievementsBadge.classList.add('hidden');
  }
  
  const progressText = document.getElementById('achievements-progress-text');
  if (progressText) {
    progressText.textContent = `Unlocked: ${summary.unlocked}/${summary.total}`;
  }
}

function renderAchievements() {
  const list = getAchievementsList();
  achievementsList.innerHTML = '';
  
  list.forEach(item => {
    const el = document.createElement('div');
    el.className = `achievement-item ${item.unlocked ? 'achievement-unlocked-state' : 'achievement-locked'}`;
    
    const isProgressTracked = item.maxProgress > 1;
    const progressPercent = (item.progress / item.maxProgress) * 100;
    
    el.innerHTML = `
      <div class="achievement-item-badge">${item.badge}</div>
      <div class="achievement-item-info">
        <div class="achievement-item-title">${escapeHtml(item.title)}</div>
        <div class="achievement-item-desc">${escapeHtml(item.description)}</div>
        ${isProgressTracked && !item.unlocked ? `
          <div class="achievement-item-progress">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <span class="progress-text">${item.progress}/${item.maxProgress}</span>
          </div>
        ` : ''}
        ${item.unlocked ? `<div class="achievement-item-reward">Title Unlocked: ${item.rewardTitle}</div>` : ''}
      </div>
    `;
    achievementsList.appendChild(el);
  });
}

function renderLeaderboard() {
  leaderboardList.innerHTML = '';
  
  const sorted = [...leaderboardData].sort((a, b) => b.score - a.score);
  sorted.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = `leaderboard-item rank-${index + 1}`;
    
    el.innerHTML = `
      <div class="leaderboard-rank">#${index + 1}</div>
      <div class="leaderboard-details">
        <div class="leaderboard-name">${escapeHtml(item.name)}</div>
        <div class="leaderboard-meta">${new Date(item.date).toLocaleDateString()} • ${escapeHtml(item.type.toUpperCase())}</div>
      </div>
      <div class="leaderboard-score">${item.score}</div>
    `;
    leaderboardList.appendChild(el);
  });
  
  const ctaCard = document.createElement('div');
  ctaCard.className = 'achievement-item';
  ctaCard.style.marginTop = '1rem';
  ctaCard.style.border = '1px dashed rgba(168, 85, 247, 0.4)';
  ctaCard.style.background = 'rgba(168, 85, 247, 0.05)';
  ctaCard.innerHTML = `
    <div class="achievement-item-badge">🧨</div>
    <div class="achievement-item-info">
      <div class="achievement-item-title" style="color: #c084fc;">Recruit Co-conspirators</div>
      <div class="achievement-item-desc">Copy referral link and share to unlock "Pyromaniac" title!</div>
      <button id="copy-ref-link-btn" class="ignite-btn" style="padding: 6px 12px; font-size: 0.75rem; margin-top: 8px; width: auto; background: linear-gradient(135deg, #ffffff 0%, #c084fc 100%); border-radius: 4px; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.2);">
        <i class="fas fa-copy"></i> Copy Link
      </button>
    </div>
  `;
  leaderboardList.appendChild(ctaCard);
  
  ctaCard.querySelector('#copy-ref-link-btn').addEventListener('click', () => {
    soundManager.playClick();
    const refLink = `${window.location.origin}${window.location.pathname}?ref=raas_${Math.random().toString(36).substring(2, 7)}`;
    navigator.clipboard.writeText(refLink).then(() => {
      const btn = ctaCard.querySelector('#copy-ref-link-btn');
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      trackProgress('PYROMANIAC', 1);
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
      }, 2000);
    });
  });
}

function setupFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', () => {
      soundManager.playClick();
      const item = q.parentElement;
      const isOpen = item.classList.contains('active');
      
      // Close all first
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        const btn = i.querySelector('.faq-question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      
      if (!isOpen) {
        item.classList.add('active');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', init);
