import soundManager from './soundManager.js';
import generateRoast from './roastEngine.js';

// DOM Elements
const body = document.body;
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const severitySlider = document.getElementById('severity-slider');
const severityLabels = document.querySelectorAll('.sev-lbl');
const personaSelect = document.getElementById('persona-select');
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

// Sound Toggle Header Button
const soundToggleBtn = document.getElementById('sound-toggle');

// State
let activeTab = 'github';
let activeSeverity = 2; // Spicy
let currentRoastText = '';
let currentSubject = '';
let roastHistory = JSON.parse(localStorage.getItem('roastify_history') || '[]');

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

  // Form Submission
  roastForm.addEventListener('submit', handleIgniteSubmit);

  // Output Actions
  copyRoastBtn.addEventListener('click', handleCopyRoast);
  saveHistoryBtn.addEventListener('click', handleSaveRoast);
  downloadCardBtn.addEventListener('click', handleDownloadCard);

  // Initial History Render
  renderHistory();
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
      // Set child input required attribute
      const input = content.querySelector('input, textarea');
      if (input) input.setAttribute('required', 'required');
    } else {
      content.classList.remove('active');
      const input = content.querySelector('input, textarea');
      if (input) input.removeAttribute('required');
    }
  });
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

// Typewriter output animation in terminal
async function runTypewriter(text) {
  terminalOutput.innerHTML = `<div class="terminal-line system-line"><span class="prompt">></span> Analysis complete. Dispensing burns:</div>`;
  const outputDiv = document.createElement('div');
  outputDiv.className = 'roast-output';
  terminalOutput.appendChild(outputDiv);

  // Scroll to bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;

  const characters = Array.from(text);
  let currentOutput = '';
  
  // Custom typing speed control
  const speed = activeSeverity === 1 ? 25 : activeSeverity === 2 ? 15 : 8;

  for (let i = 0; i < characters.length; i++) {
    currentOutput += characters[i];
    outputDiv.innerHTML = escapeHtml(currentOutput);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    // Play retro typewriter frequency pop every 4th char to avoid distortion
    if (i % 4 === 0) {
      soundManager.playTypewriter();
    }

    await new Promise(resolve => setTimeout(resolve, speed));
  }
}

// Form submit event handler
async function handleIgniteSubmit(e) {
  e.preventDefault();
  
  // Audio context initialization block
  soundManager.initContext();

  // Reset actions buttons
  outputActions.classList.add('disabled');
  currentRoastText = '';

  // Get configuration
  const persona = personaSelect.value;
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
    }

    updateLoadingText("Condensing heat particles...");

    // Call Engine
    const roast = await generateRoast({
      category: activeTab,
      data: payloadData,
      severity: activeSeverity.toString(),
      persona: persona,
      aiMode: aiMode,
      apiKey: apiKey
    });

    currentRoastText = roast;

    // Clean up loading loops
    clearInterval(tempInterval);
    clearInterval(messageInterval);
    typingIndicator.classList.add('hidden');

    // Typewriter effect
    await runTypewriter(roast);

    // Play chiptune victory/laugh laugh sound
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
  ctx.fillText('ROASTIFY.SERVICE', width - 180, height - 50);

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

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', init);
