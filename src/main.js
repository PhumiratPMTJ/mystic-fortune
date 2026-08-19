import { StarBg } from './particles.js';
import MysticAudio from './audio.js';
import { ESIIMSI_DATA, TAROT_CARDS, PARTY_QUESTIONS, KING_COMMANDS } from './fortuneData.js';
import { calculateCompatibility, GameWheel, analyzeNumbers, calculateZodiacMatch, getZodiacAndElement } from './games.js';

// Dynamically import Socket.io with fallback to allow offline standalone play
let io;
import('https://cdn.socket.io/4.7.5/socket.io.esm.min.js')
  .then(socketModule => {
    io = socketModule.io;
  })
  .catch(e => {
    console.warn('Socket.io failed to load from CDN. Online multiplayer will be disabled. Error:', e);
  });


// ==========================================================================
// Application State
// ==========================================================================
const AppState = {
  currentView: 'sec-lobby',
  soloCategory: 'gag', // 'gag', 'inspiration', 'serious'
  tarotSelection: [], // Array of selected cards { cardInfo, flipped: false }
  
  // Online Multiplayer State
  socket: null,
  isHost: false,
  roomCode: '',
  playerName: '',
  playersList: [], // Array of { name, id }
  activeGame: '', // 'wheel', 'compatibility', 'likely', 'king'
  onlineVotes: {}, // { [playerId]: count }
  
  // Offline State
  offlinePlayers: [], // Array of strings (names)
  offlineWheel: null,
  hostWheel: null
};

// ==========================================================================
// UI DOM Elements
// ==========================================================================
const sections = {
  welcome: document.getElementById('sec-welcome'),
  lobby: document.getElementById('sec-lobby'),
  esiimsi: document.getElementById('sec-esiimsi'),
  tarot: document.getElementById('sec-tarot'),
  numeric: document.getElementById('sec-numeric'),
  zodiacMatch: document.getElementById('sec-zodiac-match'),
  zodiacReading: document.getElementById('sec-zodiac-reading'),
  contact: document.getElementById('sec-contact'),
  dream: document.getElementById('sec-dream'),
  outfit: document.getElementById('sec-outfit'),
  lifegraph: document.getElementById('sec-lifegraph'),
  onlineHost: document.getElementById('sec-online-host'),
  playerJoin: document.getElementById('sec-player-join'),
  offlineGame: document.getElementById('sec-offline-game')
};

// ==========================================================================
// Routing / View Swapper
// ==========================================================================
function showSection(sectionId) {
  // Hide all sections
  Object.values(sections).forEach(sec => {
    if (sec) {
      sec.classList.add('hidden');
      sec.classList.remove('active');
    }
  });

  // Handle main logo visibility: hide in welcome screen
  const headerLogo = document.getElementById('app-header-logo');
  if (headerLogo) {
    if (sectionId === 'sec-welcome') {
      headerLogo.classList.add('hidden');
    } else {
      headerLogo.classList.remove('hidden');
    }
  }

  // Show target
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    // Delay slightly to trigger opacity transitions
    setTimeout(() => {
      target.classList.add('active');
    }, 50);
    AppState.currentView = sectionId;
  }
}

// ==========================================================================
// Sound Synthesizer Initialization
// ==========================================================================
const audioToggleBtn = document.getElementById('audio-toggle-btn');
export function updateAudioButtonUI(isPlaying) {
  const textEl = audioToggleBtn.querySelector('.audio-text');
  const iconEl = audioToggleBtn.querySelector('.audio-icon');
  if (textEl) {
    textEl.textContent = isPlaying ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง';
  }
  if (iconEl) {
    iconEl.textContent = isPlaying ? '🔊' : '🔇';
  }
  if (isPlaying) {
    audioToggleBtn.classList.add('playing');
  } else {
    audioToggleBtn.classList.remove('playing');
  }
}
window.updateAudioButtonUI = updateAudioButtonUI;

audioToggleBtn.addEventListener('click', () => {
  MysticAudio.init();
  const isPlaying = MysticAudio.toggleBackgroundMusic();
  updateAudioButtonUI(isPlaying);
});

// Click sounds for buttons
document.querySelectorAll('button, .mode-card, .sub-option-card, .game-select-card').forEach(el => {
  el.addEventListener('click', () => {
    MysticAudio.playClick();
  });
});

// ==========================================================================
// NAVIGATION BINDINGS
// ==========================================================================
// Welcome screen portal enter trigger
document.getElementById('btn-enter-land').addEventListener('click', () => {
  // Play BGM automatically on this click
  MysticAudio.init();
  if (!MysticAudio.isBgPlaying) {
    const isPlaying = MysticAudio.toggleBackgroundMusic();
    updateAudioButtonUI(isPlaying);
  }
  // Transition to main lobby
  showSection('sec-lobby');
});

document.getElementById('btn-start-dream').addEventListener('click', () => {
  showSection('sec-dream');
  document.getElementById('dream-result-box').classList.add('hidden');
  document.getElementById('input-dream-keyword').value = '';
});

document.getElementById('btn-start-outfit').addEventListener('click', () => {
  showSection('sec-outfit');
  document.getElementById('outfit-result-box').classList.add('hidden');
});

document.getElementById('btn-start-lifegraph').addEventListener('click', () => {
  showSection('sec-lifegraph');
  document.getElementById('lifegraph-result-box').classList.add('hidden');
});

document.querySelectorAll('.btn-back-lobby').forEach(btn => {
  btn.addEventListener('click', () => {
    // If online socket is open, disconnect
    if (AppState.socket) {
      AppState.socket.disconnect();
      AppState.socket = null;
    }
    showSection('sec-lobby');
  });
});

document.querySelectorAll('.btn-back-solo').forEach(btn => {
  btn.addEventListener('click', () => showSection('sec-lobby'));
});

// ==========================================================================
// SOLO HOROSCOPE CATEGORIES
// ==========================================================================
const categoryButtons = document.querySelectorAll('.cat-btn');
categoryButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    AppState.soloCategory = e.target.dataset.category;
  });
});

// ==========================================================================
// ESIIMSI PLAYGROUND (เซียมซี)
// ==========================================================================
document.getElementById('btn-start-esiimsi').addEventListener('click', () => {
  showSection('sec-esiimsi');
});

const shakeEsiimsiBtn = document.getElementById('btn-shake-esiimsi');
const esiimsiCupAnim = document.getElementById('esiimsi-cup-anim');

shakeEsiimsiBtn.addEventListener('click', () => {
  shakeEsiimsiBtn.disabled = true;
  
  // Play shake sound effects
  MysticAudio.playShake();
  
  // Shake animation
  esiimsiCupAnim.classList.add('shake-animation');
  
  setTimeout(() => {
    esiimsiCupAnim.classList.remove('shake-animation');
    
    // Choose random fortune
    const randomIdx = Math.floor(Math.random() * ESIIMSI_DATA.length);
    const fortune = ESIIMSI_DATA[randomIdx];
    
    // Fill result modal
    document.getElementById('esiimsi-result-num').textContent = `ใบที่ ${fortune.number}`;
    document.getElementById('esiimsi-result-title').textContent = fortune.title;
    
    // Get text by selected category
    let text = fortune.gag;
    if (AppState.soloCategory === 'inspiration') text = fortune.inspiration;
    else if (AppState.soloCategory === 'serious') text = fortune.serious;
    
    document.getElementById('esiimsi-result-desc').textContent = text;
    
    // Open modal
    openModal('esiimsi');
    shakeEsiimsiBtn.disabled = false;
  }, 1600);
});

// ==========================================================================
// TAROT PLAYGROUND (ไพ่ยิปซี 3 ใบ)
// ==========================================================================
document.getElementById('btn-start-tarot').addEventListener('click', () => {
  showSection('sec-tarot');
  resetTarotGame();
});

function resetTarotGame() {
  AppState.tarotSelection = [];
  document.getElementById('tarot-slots-container').classList.add('hidden');
  document.getElementById('tarot-result-actions').classList.add('hidden');
  document.getElementById('tarot-deck').classList.remove('hidden');
  document.getElementById('tarot-instructions').textContent = 'ทำจิตใจให้สงบ จากนั้นคลิกเลือกไพ่ทั้งหมด 3 ใบเพื่อดูผลอดีต ปัจจุบัน และอนาคต';
  
  // Clear slots
  document.getElementById('slot-1').innerHTML = '';
  document.getElementById('slot-2').innerHTML = '';
  document.getElementById('slot-3').innerHTML = '';

  // Generate 6 random cards to select
  const shuffledCards = [...TAROT_CARDS].sort(() => 0.5 - Math.random()).slice(0, 6);
  const deckContainer = document.getElementById('tarot-deck');
  deckContainer.innerHTML = '';

  shuffledCards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card-deck';
    cardEl.dataset.idx = idx;
    
    cardEl.addEventListener('click', () => {
      if (AppState.tarotSelection.length < 3) {
        selectTarotCard(card, cardEl);
      }
    });
    deckContainer.appendChild(cardEl);
  });
}

function selectTarotCard(cardInfo, cardEl) {
  MysticAudio.playFlip();
  cardEl.classList.add('hidden');
  
  AppState.tarotSelection.push({ cardInfo, flipped: false });
  const currentSlot = AppState.tarotSelection.length;
  
  // Render card back in slot
  const slot = document.getElementById(`slot-${currentSlot}`);
  
  const flipCard = document.createElement('div');
  flipCard.className = 'flip-card';
  flipCard.innerHTML = `
    <div class="flip-card-inner">
      <div class="card-front"></div>
      <div class="card-back">
        ${cardInfo.svg}
      </div>
    </div>
  `;
  
  flipCard.addEventListener('click', () => {
    if (!flipCard.classList.contains('flipped')) {
      flipCard.classList.add('flipped');
      MysticAudio.playFlip();
      
      // Update state
      const slotIndex = currentSlot - 1;
      AppState.tarotSelection[slotIndex].flipped = true;
      
      // Check if all flipped
      checkAllTarotFlipped();
    }
  });

  slot.appendChild(flipCard);

  if (AppState.tarotSelection.length === 3) {
    document.getElementById('tarot-deck').classList.add('hidden');
    document.getElementById('tarot-slots-container').classList.remove('hidden');
    document.getElementById('tarot-instructions').textContent = 'จิ้มเปิดไพ่ทีละใบเพื่อเปิดเผยชะตากรรม!';
  }
}

function checkAllTarotFlipped() {
  const allFlipped = AppState.tarotSelection.every(card => card.flipped);
  if (allFlipped) {
    document.getElementById('tarot-result-actions').classList.remove('hidden');
    document.getElementById('tarot-instructions').textContent = 'ดวงชะตาเผยหมดสิ้นแล้ว! คลิกเปิดคำวิเคราะห์ดวงด้านล่าง';
    
    // Automatically trigger results show after 1.5s
    setTimeout(() => {
      showTarotResultModal();
    }, 1200);
  }
}

document.getElementById('btn-reset-tarot').addEventListener('click', resetTarotGame);

function showTarotResultModal() {
  const container = document.getElementById('tarot-modal-cards-container');
  container.innerHTML = '';
  
  const positions = ['1. อดีต (Past)', '2. ปัจจุบัน (Present)', '3. อนาคต (Future)'];
  
  AppState.tarotSelection.forEach((selected, idx) => {
    const card = selected.cardInfo;
    
    let text = card.gag;
    if (AppState.soloCategory === 'inspiration') text = card.inspiration;
    else if (AppState.soloCategory === 'serious') text = card.serious;

    const cardRow = document.createElement('div');
    cardRow.className = 'tarot-showcase-item';
    cardRow.innerHTML = `
      <div>${card.svg}</div>
      <div class="tarot-showcase-text">
        <span class="card-pos">${positions[idx]}</span>
        <h4>${card.thaiName} ${card.emoji}</h4>
        <p class="fortune-description">${text}</p>
      </div>
    `;
    container.appendChild(cardRow);
  });

  openModal('tarot');
}

// ==========================================================================
// MODAL CONTROLLERS
// ==========================================================================
const fortuneModal = document.getElementById('fortune-modal');
const modalEsiimsi = document.getElementById('modal-esiimsi-result');
const modalTarot = document.getElementById('modal-tarot-result');

function openModal(type) {
  fortuneModal.classList.remove('hidden');
  if (type === 'esiimsi') {
    modalEsiimsi.classList.remove('hidden');
    modalTarot.classList.add('hidden');
  } else if (type === 'tarot') {
    modalTarot.classList.remove('hidden');
    modalEsiimsi.classList.add('hidden');
  }
}

function closeModal() {
  fortuneModal.classList.add('hidden');
  modalEsiimsi.classList.add('hidden');
  modalTarot.classList.add('hidden');
}

document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-modal-done').addEventListener('click', closeModal);

// ==========================================================================
// MULTIPLAYER ONLINE (HOST & JOIN CLIENT)
// ==========================================================================
function getSocketUrl() {
  const urlVal = document.getElementById('input-backend-url').value.trim();
  if (urlVal !== '') {
    localStorage.setItem('mystic_backend_url', urlVal);
    return urlVal;
  }
  localStorage.removeItem('mystic_backend_url');
  return window.location.origin;
}

function setupJoinView() {
  // Reset fields
  document.getElementById('input-room-code').value = '';
  document.getElementById('input-player-name').value = '';
  const savedUrl = localStorage.getItem('mystic_backend_url') || '';
  document.getElementById('input-backend-url').value = savedUrl;
  document.getElementById('join-form-box').classList.remove('hidden');
  document.getElementById('player-controller-box').classList.add('hidden');
}

// ONLINE: Host Creates Room
const btnGotoOnline = document.getElementById('btn-goto-online');
if (btnGotoOnline) {
  btnGotoOnline.addEventListener('click', () => {
    // We can let them choose whether they want to host or join.
    // Let's create a trigger inside player join to either Join or Host!
    // We will add a small host button below the join form.
  });
}

// Since the UI design only has "ออนไลน์ปาร์ตี้เกม" which takes to player join form,
// we will add a button to "สร้างห้อง (สำหรับเปิดขึ้นจอใหญ่)" inside the join page.
// Let's add it dynamically to index.html join page if it's not there.
const joinFormBox = document.getElementById('join-form-box');
const createRoomLink = document.createElement('div');
createRoomLink.className = 'text-center mt-6';
createRoomLink.innerHTML = `<span style="color:#cbd5e1; font-size:0.85rem;">ต้องการจัดปาร์ตี้ดวงชะตาบนจอคอมใหญ่ใช่ไหม? </span><br>
<button class="back-btn" style="color:var(--color-gold); font-weight:bold; margin-top:5px;" id="btn-host-create-room-action">🔮 คลิกสร้างห้องเล่นเกมที่นี่ (เป็นโฮสต์)</button>`;
joinFormBox.appendChild(createRoomLink);

document.getElementById('btn-host-create-room-action').addEventListener('click', () => {
  AppState.isHost = true;
  showSection('sec-online-host');
  initHostSocket();
});

function initHostSocket() {
  const socketUrl = getSocketUrl(); // Socket.io dynamic URL
  AppState.socket = io(socketUrl);

  AppState.socket.on('connect', () => {
    console.log('Host connected to server');
    
    // Create Room
    AppState.socket.emit('create-room', (response) => {
      if (response.success) {
        AppState.roomCode = response.roomCode;
        document.getElementById('host-room-code').textContent = response.roomCode;
        
        // Render simple QR Code representing join link
        // We will make a beautiful link box to join
        const joinLink = `${window.location.origin}/?room=${response.roomCode}`;
        const qrBox = document.getElementById('qrcode-box');
        // Let's render a beautiful QR Code or instructions
        qrBox.innerHTML = `<div style="padding: 10px; color:#000; font-weight:bold; font-size:1.1rem; line-height:1.2;">
          <span style="font-size:0.8rem; color:#666;">จอยผ่านเว็บ:</span><br>
          ${response.roomCode}
        </div>`;
      }
    });
  });

  // Track players joining
  AppState.socket.on('player-update', (players) => {
    AppState.playersList = players;
    document.getElementById('player-count').textContent = players.length;
    
    const playersListEl = document.getElementById('host-players-list');
    playersListEl.innerHTML = '';
    
    if (players.length === 0) {
      playersListEl.innerHTML = '<li class="empty-list-msg">กำลังรอเพื่อนเข้าร่วมห้อง...</li>';
      document.getElementById('btn-host-start-game').disabled = true;
    } else {
      players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name;
        playersListEl.appendChild(li);
      });
      // Allow start if >= 1 player (ideal for testing, can be 5-6)
      document.getElementById('btn-host-start-game').disabled = false;
    }
  });

  // Host receives client actions (like spinning or voting)
  AppState.socket.on('room-action', ({ senderId, action, data }) => {
    const player = AppState.playersList.find(p => p.id === senderId);
    const playerName = player ? player.name : 'เพื่อน';

    if (action === 'spin-request' && AppState.activeGame === 'wheel') {
      triggerHostWheelSpin();
    }
    
    if (action === 'submit-compat' && AppState.activeGame === 'compatibility') {
      showHostCompatibilityResult(playerName, data);
    }
    
    if (action === 'submit-vote' && AppState.activeGame === 'likely') {
      handleIncomingVote(data.targetName);
    }
  });

  AppState.socket.on('room-closed', () => {
    alert('ห้องสนทนาถูกปิดตัวลง');
    showSection('sec-lobby');
  });
}

// Host Starts Game Party Loop
document.getElementById('btn-host-start-game').addEventListener('click', () => {
  document.getElementById('host-subview-lobby').classList.add('hidden');
  document.getElementById('host-subview-game-menu').classList.remove('hidden');
  document.getElementById('btn-host-start-game').classList.add('hidden'); // Hide start button once in menu

  // Notify clients that they are now in the game menu
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'state-menu',
    data: { menuState: 'active' }
  });
});

// Select specific Game
document.querySelectorAll('[data-game]').forEach(card => {
  card.addEventListener('click', (e) => {
    const game = e.currentTarget.dataset.game;
    launchHostGame(game);
  });
});

function launchHostGame(game) {
  AppState.activeGame = game;
  
  // Hide menu
  document.getElementById('host-subview-game-menu').classList.add('hidden');
  
  // Show target game screen
  document.getElementById(`host-subview-${game}`).classList.remove('hidden');
  
  if (game === 'wheel') {
    // Setup Host Wheel of Fortune Canvas
    const playerNames = AppState.playersList.map(p => p.name);
    AppState.hostWheel = new GameWheel('wheel-canvas');
    AppState.hostWheel.setOptions(playerNames);
    
    // Hide spin result box
    document.getElementById('wheel-result-box').classList.add('hidden');
    
    // Tell players to open their wheel controller
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-wheel',
      data: {}
    });
  }
  
  if (game === 'compatibility') {
    document.getElementById('compat-result-box').classList.add('hidden');
    document.getElementById('compat-waiting-text').classList.remove('hidden');
    document.getElementById('compat-waiting-text').textContent = 'กำลังรอให้มีผู้เล่นกรอกชื่อและกดสแกนดวงคู่กัน...';
    
    // BroadCast to players to open compatibility input controller
    // Send players list to select partners from
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-compatibility',
      data: { players: AppState.playersList }
    });
  }

  if (game === 'likely') {
    // Reset votes
    AppState.onlineVotes = {};
    AppState.playersList.forEach(p => {
      AppState.onlineVotes[p.name] = 0;
    });
    
    document.getElementById('vote-count-txt').textContent = '0';
    document.getElementById('btn-host-reveal-votes').disabled = true;

    // Draw random question
    const randomQ = PARTY_QUESTIONS[Math.floor(Math.random() * PARTY_QUESTIONS.length)];
    document.getElementById('likely-question-text').textContent = randomQ.question;
    document.getElementById('likely-question-text').dataset.comment = randomQ.funnyComment;
    
    // Clear chart
    document.getElementById('likely-votes-chart').innerHTML = '<div class="waiting-player-input">กำลังรอให้ผู้เล่นกดโหวตจากมือถือ...</div>';

    // Broadcast to players to open voting controller
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-likely',
      data: { 
        question: randomQ.question, 
        players: AppState.playersList 
      }
    });
  }

  if (game === 'king') {
    document.getElementById('king-command-container').classList.add('hidden');
    document.getElementById('king-card-anim').classList.remove('flipped');
    
    // Tell players to wait for king reveal
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-king',
      data: { status: 'waiting' }
    });
  }
}

// Back to game selection
const backToMenuButtons = [
  'btn-back-host-menu',
  'btn-back-host-menu2',
  'btn-back-host-menu3',
  'btn-back-host-menu4'
];

backToMenuButtons.forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', () => {
      // Hide all game screens
      const gameScreens = ['wheel', 'compatibility', 'likely', 'king'];
      gameScreens.forEach(g => {
        document.getElementById(`host-subview-${g}`).classList.add('hidden');
      });
      
      // Show menu
      document.getElementById('host-subview-game-menu').classList.remove('hidden');
      AppState.activeGame = '';

      // Sync players to wait
      AppState.socket.emit('host-update', {
        roomCode: AppState.roomCode,
        event: 'state-menu',
        data: {}
      });
    });
  }
});

// ONLINE: Spin wheel from Host
const hostSpinBtn = document.getElementById('btn-host-spin-wheel');
hostSpinBtn.addEventListener('click', triggerHostWheelSpin);

function triggerHostWheelSpin() {
  if (AppState.hostWheel && !AppState.hostWheel.isSpinning) {
    hostSpinBtn.disabled = true;
    document.getElementById('wheel-result-box').classList.add('hidden');
    
    // Send spin sound triggers / states to all clients
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'wheel-spinning',
      data: {}
    });

    AppState.hostWheel.spin((winnerName, idx) => {
      hostSpinBtn.disabled = false;
      
      // Create random funny fortune
      const randomFortunes = [
        'ดวงความรักจะพุ่งแรงแซงเพื่อนร่วมวงจนเพื่อนอิจฉาตาร้อน!',
        'ระวังเงินจะหมดไปกับการตามสปอยอาหารให้คนอื่นในกลุ่ม!',
        'ดวงมีลาภลอยใหญ่ แต่เพื่อนๆ กำลังเตรียมต่อคิวขอยืมตัวประคองดวงด่วน!',
        'จะได้แฟนสไตล์ขำๆ กวนๆ แต่คอยเทคแคร์เป็นอย่างดี!',
        'มีเกณฑ์ได้รับงานใหญ่แบบไม่รู้ตัว แต่ผลประโยชน์ล้นหลาม!'
      ];
      const winFortune = randomFortunes[idx % randomFortunes.length];

      document.getElementById('wheel-winner-display').textContent = winnerName;
      document.getElementById('wheel-winner-fortune').textContent = winFortune;
      document.getElementById('wheel-result-box').classList.remove('hidden');

      // Send winner display data to controllers
      AppState.socket.emit('host-update', {
        roomCode: AppState.roomCode,
        event: 'wheel-result',
        data: { winner: winnerName, fortune: winFortune }
      });
    });
  }
}

// ONLINE: Compatibility calculations from player controllers
function showHostCompatibilityResult(playerName, data) {
  document.getElementById('compat-waiting-text').classList.add('hidden');
  const resultBox = document.getElementById('compat-result-box');
  resultBox.classList.remove('hidden');

  const name1 = playerName;
  const name2 = data.partnerName;
  
  const scoreData = calculateCompatibility(name1, name2, data.bday1, data.bday2);
  
  document.getElementById('compat-names').textContent = `${name1} 💖 ${name2}`;
  document.getElementById('compat-score').textContent = `${scoreData.score}%`;
  document.getElementById('compat-title').textContent = scoreData.title;
  document.getElementById('compat-desc').textContent = scoreData.description;

  // Sound chimes
  MysticAudio.playSuccess();

  // Sync details to controller
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'compatibility-result',
    data: {
      names: `${name1} & ${name2}`,
      score: scoreData.score,
      title: scoreData.title,
      desc: scoreData.description
    }
  });
}

// ONLINE: Handle Votes for likely to game
function handleIncomingVote(targetName) {
  if (AppState.onlineVotes[targetName] !== undefined) {
    AppState.onlineVotes[targetName]++;
    
    // Total count
    const totalVotes = Object.values(AppState.onlineVotes).reduce((a, b) => a + b, 0);
    document.getElementById('vote-count-txt').textContent = totalVotes;
    
    // Enable reveal button once we have votes
    if (totalVotes > 0) {
      document.getElementById('btn-host-reveal-votes').disabled = false;
    }
    
    // Render live placeholder
    const chartContainer = document.getElementById('likely-votes-chart');
    chartContainer.innerHTML = '';
    
    Object.entries(AppState.onlineVotes).forEach(([name, count]) => {
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      
      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-label">${name}</div>
        <div class="chart-bar-outer">
          <div class="chart-bar-inner" style="width: ${percentage}%"></div>
        </div>
        <div class="chart-value">${count} โหวต</div>
      `;
      chartContainer.appendChild(row);
    });
  }
}

// Host reveals final votes details
const hostRevealVotesBtn = document.getElementById('btn-host-reveal-votes');
hostRevealVotesBtn.addEventListener('click', () => {
  hostRevealVotesBtn.disabled = true;
  MysticAudio.playSuccess();
  
  // Find player with maximum votes
  let maxVotes = -1;
  let winnerName = 'ไม่มีเสียงโหวต';
  
  Object.entries(AppState.onlineVotes).forEach(([name, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      winnerName = name;
    }
  });

  const questionCard = document.getElementById('likely-question-text');
  const comment = questionCard.dataset.comment;

  // Transform title card to reveal winner
  questionCard.innerHTML = `<span style="font-size:0.9rem; color:var(--color-gold);">ผลลัพธ์มติหมู่ดาว:</span><br>
  <span style="font-size:1.8rem; color:var(--color-cyan);">${winnerName}</span><br>
  <p style="font-size:0.95rem; font-weight:normal; margin-top:10px; color:#fff;">${comment}</p>`;

  // Sync to players
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'likely-result',
    data: { winner: winnerName, comment }
  });
});

// Next Likely Question
document.getElementById('btn-next-likely-question').addEventListener('click', () => {
  launchHostGame('likely');
});

// ONLINE: King Game Draw Command
document.getElementById('btn-host-draw-king').addEventListener('click', () => {
  if (AppState.playersList.length === 0) return;
  
  // Flip animation card back and forth
  const cardAnim = document.getElementById('king-card-anim');
  cardAnim.classList.remove('flipped');
  document.getElementById('king-command-container').classList.add('hidden');
  
  setTimeout(() => {
    // Choose random king and command
    const randomKing = AppState.playersList[Math.floor(Math.random() * AppState.playersList.length)];
    const commandObj = KING_COMMANDS[Math.floor(Math.random() * KING_COMMANDS.length)];
    
    document.getElementById('king-name-reveal').textContent = randomKing.name;
    document.getElementById('king-command-reveal').textContent = commandObj.command;
    
    cardAnim.classList.add('flipped');
    MysticAudio.playSuccess();
    
    setTimeout(() => {
      document.getElementById('king-command-container').classList.remove('hidden');
    }, 400);

    // BroadCast to players who is King and who is servant
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'king-reveal',
      data: { 
        kingId: randomKing.id, 
        kingName: randomKing.name, 
        command: commandObj.command 
      }
    });
  }, 300);
});


// ==========================================================================
// PLAYER CONTROLLER CLIENT SUBMIT OR ACTIONS (Online Mode Join)
// ==========================================================================
document.getElementById('btn-player-submit-join').addEventListener('click', () => {
  const codeInput = document.getElementById('input-room-code').value.trim().toUpperCase();
  const nameInput = document.getElementById('input-player-name').value.trim();

  if (!codeInput || !nameInput) {
    alert('กรุณากรอกรหัสห้องและชื่อเล่นของคุณให้ถูกต้องครับ');
    return;
  }

  // Setup Socket Client Connection
  const socketUrl = getSocketUrl();
  AppState.socket = io(socketUrl);

  AppState.socket.on('connect', () => {
    AppState.socket.emit('join-room', { roomCode: codeInput, playerName: nameInput }, (response) => {
      if (response.success) {
        AppState.isHost = false;
        AppState.roomCode = response.roomCode;
        AppState.playerName = nameInput;
        
        document.getElementById('ctl-player-name').textContent = nameInput;
        document.getElementById('ctl-room-code').textContent = response.roomCode;
        
        // Toggle view
        document.getElementById('join-form-box').classList.add('hidden');
        document.getElementById('player-controller-box').classList.remove('hidden');
        
        showControllerScreen('lobby');
      } else {
        alert(response.message);
        AppState.socket.disconnect();
        AppState.socket = null;
      }
    });
  });

  // Client receives real-time game updates from host
  AppState.socket.on('game-update', ({ event, data }) => {
    if (event === 'state-menu') {
      showControllerScreen('menu-wait');
    }
    
    if (event === 'state-wheel') {
      showControllerScreen('wheel');
    }

    if (event === 'wheel-spinning') {
      // Shaking animations
      const shakeBtn = document.getElementById('btn-player-shake-wheel');
      shakeBtn.disabled = true;
      shakeBtn.textContent = '🎰 วงล้อกำลังหมุน...';
      MysticAudio.playShake();
    }

    if (event === 'wheel-result') {
      const shakeBtn = document.getElementById('btn-player-shake-wheel');
      shakeBtn.disabled = false;
      shakeBtn.textContent = '💫 สปินวงล้อสำเร็จ!';
      
      alert(`ผู้โชคดี: ${data.winner}\n${data.fortune}`);
    }

    if (event === 'state-compatibility') {
      showControllerScreen('compatibility');
      
      // Populate partner select field, excluding current player
      const partnerSelect = document.getElementById('select-partner');
      partnerSelect.innerHTML = '<option value="">-- เลือกเพื่อน --</option>';
      
      data.players.forEach(p => {
        if (p.name !== AppState.playerName) {
          const opt = document.createElement('option');
          opt.value = p.name;
          opt.textContent = p.name;
          partnerSelect.appendChild(opt);
        }
      });
    }

    if (event === 'compatibility-result') {
      alert(`ดวงสมพงษ์ ${data.names}: ระดับความเข้ากันได้ ${data.score}%\nหมวด: ${data.title}`);
    }

    if (event === 'state-likely') {
      showControllerScreen('likely');
      
      // Renders buttons for voting
      const listContainer = document.getElementById('likely-players-vote-buttons');
      listContainer.innerHTML = '';
      
      data.players.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'vote-choice-btn';
        btn.textContent = p.name;
        
        btn.addEventListener('click', () => {
          // Send vote to host
          AppState.socket.emit('client-action', {
            roomCode: AppState.roomCode,
            action: 'submit-vote',
            data: { targetName: p.name }
          });
          
          // Disable all buttons in voting area
          document.querySelectorAll('.vote-choice-btn').forEach(b => b.disabled = true);
          btn.classList.add('voted');
        });
        
        listContainer.appendChild(btn);
      });
    }

    if (event === 'likely-result') {
      alert(`ผลโหวตสูงสุดคือ: ${data.winner}\nคำวิจารณ์ชะตาชีวิต: ${data.comment}`);
    }

    if (event === 'state-king') {
      showControllerScreen('king');
      document.getElementById('ctl-king-role-title').textContent = '👑 กำลังรันโองการราชา...';
      document.getElementById('ctl-king-role-desc').textContent = 'จ้องมองที่จอหลักว่าโองการสวรรค์จะให้ใครเป็นพระราชา';
    }

    if (event === 'king-reveal') {
      const isKing = data.kingId === AppState.socket.id;
      const roleTitle = document.getElementById('ctl-king-role-title');
      const roleDesc = document.getElementById('ctl-king-role-desc');
      
      if (isKing) {
        roleTitle.textContent = '👑 คุณคือราชาแห่งโชคชะตา!';
        roleDesc.innerHTML = `<span style="color:var(--color-gold); font-size:1.1rem; font-weight:bold;">โองการบัญชาเพื่อนของคุณ:</span><br>
        ${data.command}`;
        MysticAudio.playSuccess();
      } else {
        roleTitle.textContent = '🧙 คุณคือผู้ใต้บัญชาการ';
        roleDesc.innerHTML = `พระราชาดวงชะตารอบนี้คือ <b>${data.kingName}</b><br>
        สิทธิ์พระราชาสั่งเพื่อน: "${data.command}"`;
      }
    }
  });

  AppState.socket.on('room-closed', ({ message }) => {
    alert(message || 'ห้องนี้ถูกปิดแล้ว');
    showSection('sec-lobby');
  });
});

// Switch screens in player controller layout
function showControllerScreen(screenName) {
  const screens = ['lobby', 'menu-wait', 'wheel', 'compatibility', 'likely', 'king'];
  screens.forEach(s => {
    const el = document.getElementById(`ctl-screen-${s}`);
    if (el) el.classList.add('hidden');
  });

  const activeEl = document.getElementById(`ctl-screen-${screenName}`);
  if (activeEl) {
    activeEl.classList.remove('hidden');
    setTimeout(() => {
      activeEl.classList.add('active');
    }, 50);
  }
}

// Controller Actions: spin wheel trigger
document.getElementById('btn-player-shake-wheel').addEventListener('click', () => {
  AppState.socket.emit('client-action', {
    roomCode: AppState.roomCode,
    action: 'spin-request',
    data: {}
  });
});

// Controller Actions: submit compatibility details
document.getElementById('btn-player-submit-compat').addEventListener('click', () => {
  const partnerName = document.getElementById('select-partner').value;
  const bday1 = document.getElementById('ctl-compat-birthday').value;
  const bday2 = document.getElementById('ctl-partner-birthday').value;

  if (!partnerName || !bday1) {
    alert('กรุณาเลือกเพื่อนร่วมดวงและกรอกวันเกิดของคุณก่อนครับ');
    return;
  }

  AppState.socket.emit('client-action', {
    roomCode: AppState.roomCode,
    action: 'submit-compat',
    data: { partnerName, bday1, bday2 }
  });
  
  // Clear select
  document.getElementById('btn-player-submit-compat').disabled = true;
  document.getElementById('btn-player-submit-compat').textContent = 'ส่งประเมินผลแล้ว 💖';
});


// ==========================================================================
// OFFLINE LOCAL PARTY BOARD (PASS & PLAY MECHANICS)
// ==========================================================================
function setupOfflineSetupView() {
  const inputsContainer = document.getElementById('offline-name-inputs');
  // Reset inputs with 2 default fields
  inputsContainer.innerHTML = `
    <div class="form-row-player">
      <input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ 1" maxlength="10">
    </div>
    <div class="form-row-player">
      <input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ 2" maxlength="10">
    </div>
  `;
  
  document.getElementById('offline-entry-panel').classList.remove('hidden');
  document.getElementById('offline-board-panel').classList.add('hidden');
}

// Add another local player inputs
document.getElementById('btn-offline-add-player').addEventListener('click', () => {
  const inputsContainer = document.getElementById('offline-name-inputs');
  const count = inputsContainer.querySelectorAll('.offline-name-field').length;
  
  if (count >= 8) {
    alert('ใส่ชื่อผู้เล่นได้สูงสุด 8 คนต่อหนึ่งห้องออฟไลน์ครับ');
    return;
  }

  const row = document.createElement('div');
  row.className = 'form-row-player';
  row.innerHTML = `<input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ ${count + 1}" maxlength="10">`;
  inputsContainer.appendChild(row);
});

// Launch offline board
document.getElementById('btn-offline-start-board').addEventListener('click', () => {
  const fields = document.querySelectorAll('.offline-name-field');
  const names = [];
  
  fields.forEach(field => {
    const val = field.value.trim();
    if (val) names.push(val);
  });

  if (names.length < 2) {
    alert('กรุณากรอกชื่ออย่างน้อย 2 คนเพื่อเริ่มเล่นเกมปาร์ตี้ครับ');
    return;
  }

  AppState.offlinePlayers = names;

  // Toggle setup panel
  document.getElementById('offline-entry-panel').classList.add('hidden');
  document.getElementById('offline-board-panel').classList.remove('hidden');

  // Display sidebar player list
  const sidebarList = document.getElementById('offline-players-list-display');
  sidebarList.innerHTML = '';
  names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    sidebarList.appendChild(li);
  });

  // Switch Subview to menu Selection
  showOfflineSubView('game-menu');
});

// Quit offline play
document.getElementById('btn-quit-offline').addEventListener('click', () => {
  setupOfflineSetupView();
});

// Offline Subview Swapper
function showOfflineSubView(viewName) {
  const subViews = ['game-menu', 'wheel', 'compatibility', 'likely', 'king', 'xo', 'racing'];
  subViews.forEach(v => {
    const el = document.getElementById(`off-subview-${v}`);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`off-subview-${viewName}`);
  if (target) target.classList.remove('hidden');
}

// Select Local Game from menu cards
document.querySelectorAll('[data-offgame]').forEach(card => {
  card.addEventListener('click', (e) => {
    const game = e.currentTarget.dataset.offgame;
    launchOfflineGame(game);
  });
});

function launchOfflineGame(game) {
  showOfflineSubView(game);

  if (game === 'wheel') {
    document.getElementById('off-wheel-result-box').classList.add('hidden');
    
    // Render wheel options
    AppState.offlineWheel = new GameWheel('offline-wheel-canvas');
    AppState.offlineWheel.setOptions(AppState.offlinePlayers);
  }

  if (game === 'compatibility') {
    document.getElementById('off-compat-result-box').classList.add('hidden');
    
    // Populate select fields with local names
    const s1 = document.getElementById('off-compat-select1');
    const s2 = document.getElementById('off-compat-select2');
    s1.innerHTML = '';
    s2.innerHTML = '';

    AppState.offlinePlayers.forEach(name => {
      const o1 = document.createElement('option');
      o1.value = name;
      o1.textContent = name;
      const o2 = o1.cloneNode(true);
      
      s1.appendChild(o1);
      s2.appendChild(o2);
    });

    // Make second selector choose index 1
    if (s2.options.length > 1) {
      s2.selectedIndex = 1;
    }
  }

  if (game === 'likely') {
    drawOfflineLikelyQuestion();
  }

  if (game === 'king') {
    document.getElementById('off-king-command-container').classList.add('hidden');
    document.getElementById('off-king-card-anim').classList.remove('flipped');
  }

  if (game === 'xo') {
    // Populate select fields with local player names
    const selectX = document.getElementById('xo-select-player-x');
    const selectO = document.getElementById('xo-select-player-o');
    if (selectX && selectO) {
      selectX.innerHTML = '';
      selectO.innerHTML = '';
      
      const players = AppState.offlinePlayers && AppState.offlinePlayers.length > 0
        ? AppState.offlinePlayers
        : ['ผู้เล่น 1', 'ผู้เล่น 2'];
        
      players.forEach(name => {
        const optX = document.createElement('option');
        optX.value = name;
        optX.textContent = name;
        const optO = optX.cloneNode(true);
        
        selectX.appendChild(optX);
        selectO.appendChild(optO);
      });
      
      // Auto select the second player for O if available
      if (selectO.options.length > 1) {
        selectO.selectedIndex = 1;
      }
    }
    resetXOGame();
  }

  if (game === 'racing') {
    resetRacingGame();
  }
}

// Back to local menu buttons
const backToOffMenuButtons = [
  'btn-back-off-menu',
  'btn-back-off-menu2',
  'btn-back-off-menu3',
  'btn-back-off-menu4',
  'btn-back-off-menu5',
  'btn-back-off-menu6'
];

backToOffMenuButtons.forEach(btnId => {
  const el = document.getElementById(btnId);
  if (el) {
    el.addEventListener('click', () => {
      showOfflineSubView('game-menu');
    });
  }
});

// OFFLINE: Spin local wheel
const localSpinBtn = document.getElementById('btn-offline-spin-wheel');
localSpinBtn.addEventListener('click', () => {
  if (AppState.offlineWheel && !AppState.offlineWheel.isSpinning) {
    localSpinBtn.disabled = true;
    document.getElementById('off-wheel-result-box').classList.add('hidden');
    
    AppState.offlineWheel.spin((winnerName, idx) => {
      localSpinBtn.disabled = false;
      
      const randomLocalFortunes = [
        'เพื่อนคนนี้กำลังจะมีโชคจากการโดนทักรักแปลกๆ ในเดือนนี้!',
        'ดวงดีมากวันนี้เป็นมงคล แต่มีเกณฑ์ได้แชร์ตังค์จ่ายหมูกระทะให้เพื่อนในกลุ่ม!',
        'ดวงความรักโดดเด่นสะดุดตาสุดๆ คนโสดจะเจอคนหน้าตาดีเดินเบียดบนรถไฟฟ้า!',
        'ระวังอย่าคุยเรื่องดวงกับเพื่อนคนข้างๆ วันนี้อาจเกิดข้อพิพาทแย่งของกินกัน!',
        'การงานการเรียนดีเด่น แต่สุขภาพข้อเข่าเสื่อมกำลังจะมาเยือนในวัยก่อนวัยทอง!'
      ];
      const winFortune = randomLocalFortunes[idx % randomLocalFortunes.length];

      document.getElementById('off-wheel-winner-display').textContent = winnerName;
      document.getElementById('off-wheel-winner-fortune').textContent = winFortune;
      document.getElementById('off-wheel-result-box').classList.remove('hidden');
    });
  }
});

// OFFLINE: Run compatibility calculations local
document.getElementById('btn-offline-run-compat').addEventListener('click', () => {
  const n1 = document.getElementById('off-compat-select1').value;
  const n2 = document.getElementById('off-compat-select2').value;

  if (n1 === n2) {
    alert('กรุณาเลือกเพื่อนสองคนที่ต่างกันเพื่อเปรียบเทียบระดับความสมพงษ์ครับ');
    return;
  }

  const scoreData = calculateCompatibility(n1, n2, '1995-01-01', '1996-01-01'); // Static mock bdays for simplicity

  document.getElementById('off-compat-names').textContent = `${n1} & ${n2}`;
  document.getElementById('off-compat-score').textContent = `${scoreData.score}%`;
  document.getElementById('off-compat-title').textContent = scoreData.title;
  document.getElementById('off-compat-desc').textContent = scoreData.description;

  document.getElementById('off-compat-result-box').classList.remove('hidden');
  
  MysticAudio.playSuccess();
});

// OFFLINE: Likely to questions loop
function drawOfflineLikelyQuestion() {
  const randomQ = PARTY_QUESTIONS[Math.floor(Math.random() * PARTY_QUESTIONS.length)];
  document.getElementById('off-likely-question-text').textContent = randomQ.question;
}

document.getElementById('btn-offline-next-likely').addEventListener('click', () => {
  drawOfflineLikelyQuestion();
  MysticAudio.playClick();
});

// OFFLINE: King Draw local
document.getElementById('btn-offline-draw-king').addEventListener('click', () => {
  const cardAnim = document.getElementById('off-king-card-anim');
  cardAnim.classList.remove('flipped');
  document.getElementById('off-king-command-container').classList.add('hidden');

  setTimeout(() => {
    // Choose random local king and command
    const randomKing = AppState.offlinePlayers[Math.floor(Math.random() * AppState.offlinePlayers.length)];
    const commandObj = KING_COMMANDS[Math.floor(Math.random() * KING_COMMANDS.length)];
    
    document.getElementById('off-king-name-reveal').textContent = randomKing;
    document.getElementById('off-king-command-reveal').textContent = commandObj.command;
    
    cardAnim.classList.add('flipped');
    MysticAudio.playSuccess();
    
    setTimeout(() => {
      document.getElementById('off-king-command-container').classList.remove('hidden');
    }, 400);
  }, 300);
});

// ==========================================================================
// OFFLINE XO GAME LOGIC
// ==========================================================================
let xoBoard = Array(9).fill('');
let xoCurrentPlayer = 'X';
let xoGameActive = true;

function updateXOTurnDisplay() {
  const selectX = document.getElementById('xo-select-player-x');
  const selectO = document.getElementById('xo-select-player-o');
  const nameX = selectX && selectX.value ? selectX.value : 'ผู้เล่น X';
  const nameO = selectO && selectO.value ? selectO.value : 'ผู้เล่น O';
  const statusEl = document.getElementById('xo-status');
  if (statusEl) {
    if (xoGameActive) {
      const activeName = xoCurrentPlayer === 'X' ? nameX : nameO;
      statusEl.innerHTML = `ตาของท่าน: <span style="color: ${xoCurrentPlayer === 'X' ? 'var(--color-magenta)' : 'var(--color-cyan)'}; font-weight: bold; font-size: 1.35rem;">${activeName}</span> (${xoCurrentPlayer})`;
    }
  }
}

function resetXOGame() {
  xoBoard = Array(9).fill('');
  xoCurrentPlayer = 'X';
  xoGameActive = true;
  updateXOTurnDisplay();
  document.querySelectorAll('.xo-cell').forEach(cell => {
    cell.textContent = '';
    cell.className = 'xo-cell';
  });
}

function handleXOCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.cellIndex);

  if (xoBoard[index] !== '' || !xoGameActive) return;

  xoBoard[index] = xoCurrentPlayer;
  cell.textContent = xoCurrentPlayer;
  cell.classList.add(xoCurrentPlayer.toLowerCase());
  MysticAudio.playClick();

  const selectX = document.getElementById('xo-select-player-x');
  const selectO = document.getElementById('xo-select-player-o');
  const nameX = selectX && selectX.value ? selectX.value : 'ผู้เล่น X';
  const nameO = selectO && selectO.value ? selectO.value : 'ผู้เล่น O';

  if (checkXOWin()) {
    const statusEl = document.getElementById('xo-status');
    const winnerName = xoCurrentPlayer === 'X' ? nameX : nameO;
    if (statusEl) {
      statusEl.innerHTML = `🎉 ผู้ชนะคือผู้เล่น: <span style="color: ${xoCurrentPlayer === 'X' ? 'var(--color-magenta)' : 'var(--color-cyan)'}; font-weight: bold; font-size: 1.45rem;">${winnerName}</span> (${xoCurrentPlayer})!`;
    }
    xoGameActive = false;
    MysticAudio.playSuccess();
    return;
  }

  if (!xoBoard.includes('')) {
    const statusEl = document.getElementById('xo-status');
    if (statusEl) statusEl.textContent = 'เสมอ! เล่นใหม่อีกรอบนะจ๊ะ 🤝';
    xoGameActive = false;
    MysticAudio.playClick();
    return;
  }

  xoCurrentPlayer = xoCurrentPlayer === 'X' ? 'O' : 'X';
  updateXOTurnDisplay();
}

function checkXOWin() {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winConditions.some(condition => {
    const [a, b, c] = condition;
    return xoBoard[a] && xoBoard[a] === xoBoard[b] && xoBoard[a] === xoBoard[c];
  });
}

// Bind XO cell clicks
document.querySelectorAll('.xo-cell').forEach(cell => {
  cell.addEventListener('click', handleXOCellClick);
});

// Bind XO reset button
const resetXOBtn = document.getElementById('btn-reset-xo');
if (resetXOBtn) {
  resetXOBtn.addEventListener('click', resetXOGame);
}

// Bind XO dropdown profile changes
const selectXEl = document.getElementById('xo-select-player-x');
const selectOEl = document.getElementById('xo-select-player-o');
if (selectXEl) selectXEl.addEventListener('change', updateXOTurnDisplay);
if (selectOEl) selectOEl.addEventListener('change', updateXOTurnDisplay);


// ==========================================================================
// OFFLINE CAR RACING GAME LOGIC
// ==========================================================================
let racingInterval = null;
let raceActive = false;

function resetRacingGame() {
  raceActive = false;
  clearInterval(racingInterval);
  const winBox = document.getElementById('race-winner-box');
  const startBtn = document.getElementById('btn-start-race');
  if (winBox) winBox.classList.add('hidden');
  if (startBtn) startBtn.disabled = false;
  
  for (let i = 1; i <= 4; i++) {
    const car = document.getElementById(`car-${i}`);
    if (car) car.style.left = '30px';
  }
}

function startRacingGame() {
  if (raceActive) return;
  raceActive = true;
  
  const startBtn = document.getElementById('btn-start-race');
  const winBox = document.getElementById('race-winner-box');
  if (startBtn) startBtn.disabled = true;
  if (winBox) winBox.classList.add('hidden');
  MysticAudio.playClick();

  const carPositions = { 1: 30, 2: 30, 3: 30, 4: 30 };
  const track = document.querySelector('.racing-track-container');
  const trackWidth = track ? track.clientWidth : 300;
  const finishThreshold = trackWidth - 85;

  racingInterval = setInterval(() => {
    for (let i = 1; i <= 4; i++) {
      let speed = Math.random() * 8 + 1;
      if (Math.random() < 0.05) {
        speed += 12; // speed boost!
      }
      
      carPositions[i] += speed;
      const car = document.getElementById(`car-${i}`);
      if (car) {
        car.style.left = `${carPositions[i]}px`;
      }

      if (carPositions[i] >= finishThreshold) {
        clearInterval(racingInterval);
        raceActive = false;
        
        const carColors = {
          1: 'รถคันที่ 1 (สีแดง) 🏎️🔴',
          2: 'รถคันที่ 2 (สีน้ำเงิน) 🏎️🔵',
          3: 'รถคันที่ 3 (สีเขียว) 🏎️🟢',
          4: 'รถคันที่ 4 (สีเหลือง) 🏎️🟡'
        };
        
        const displayEl = document.getElementById('race-winner-display');
        if (displayEl) displayEl.textContent = carColors[i];
        if (winBox) winBox.classList.remove('hidden');
        
        MysticAudio.playSuccess();
        break;
      }
    }
  }, 60);
}

// Bind Racing event listeners
const startRaceBtn = document.getElementById('btn-start-race');
if (startRaceBtn) {
  startRaceBtn.addEventListener('click', startRacingGame);
}

const resetRaceBtn = document.getElementById('btn-reset-race');
if (resetRaceBtn) {
  resetRaceBtn.addEventListener('click', resetRacingGame);
}


// ==========================================================================
// MYHORA-STYLE ASTROLOGY TOOL EVENT LISTENERS
// ==========================================================================
document.getElementById('btn-start-numeric').addEventListener('click', () => {
  showSection('sec-numeric');
  document.getElementById('numeric-result-box').classList.add('hidden');
  document.getElementById('input-astronum').value = '';
});

document.getElementById('btn-start-zodmatch').addEventListener('click', () => {
  showSection('sec-zodiac-match');
  document.getElementById('zodmatch-result-box').classList.add('hidden');
});

document.getElementById('btn-start-zodread').addEventListener('click', () => {
  showSection('sec-zodiac-reading');
  document.getElementById('zodread-result-box').classList.add('hidden');
});

document.getElementById('btn-start-contact').addEventListener('click', () => {
  showSection('sec-contact');
});

// 1. Numeric Analysis trigger
document.getElementById('btn-submit-numeric').addEventListener('click', () => {
  const numVal = document.getElementById('input-astronum').value.trim();
  const numType = document.getElementById('select-num-type').value;

  if (!numVal) {
    alert('กรุณากรอกตัวเลขที่ต้องการวิเคราะห์ก่อนครับ');
    return;
  }

  const result = analyzeNumbers(numVal, numType);
  if (result.error) {
    alert(result.error);
    return;
  }

  // Render values
  document.getElementById('num-result-sum').textContent = result.sum;
  document.getElementById('num-result-grade').textContent = result.grade;
  document.getElementById('num-result-summary').textContent = result.summary;

  // Good pairs list
  const goodList = document.getElementById('num-good-pairs-list');
  goodList.innerHTML = '';
  if (result.goodPairs.length === 0) {
    goodList.innerHTML = '<li>ไม่มีคู่เลขมงคลเด่นชัดในชุดนี้</li>';
  } else {
    result.goodPairs.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${p.pair}:</b> ${p.meaning}`;
      goodList.appendChild(li);
    });
  }

  // Bad pairs list
  const badList = document.getElementById('num-bad-pairs-list');
  badList.innerHTML = '';
  if (result.badPairs.length === 0) {
    badList.innerHTML = '<li>ไม่มีคู่เลขเตือนภัย ปลอดภัยหายห่วง</li>';
  } else {
    result.badPairs.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${p.pair}:</b> ${p.meaning}`;
      badList.appendChild(li);
    });
  }

  document.getElementById('numeric-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// 2. Zodiac Matcher trigger
document.getElementById('btn-submit-zodmatch').addEventListener('click', () => {
  const z1 = document.getElementById('select-zodmatch-z1').value;
  const z2 = document.getElementById('select-zodmatch-z2').value;
  const d1 = document.getElementById('select-zodmatch-day1').value;
  const d2 = document.getElementById('select-zodmatch-day2').value;

  const result = calculateZodiacMatch(z1, z2, d1, d2);

  // Render values
  document.getElementById('zodmatch-names-title').textContent = `ราศี${z1} & ราศี${z2}`;
  document.getElementById('zodmatch-score-val').textContent = `${result.score}%`;
  document.getElementById('zodmatch-elem-text').innerHTML = `<b>ดวงความสัมพันธ์ธาตุ:</b> ${result.elemMatch}`;
  document.getElementById('zodmatch-day-text').innerHTML = `<b>ดวงวันเกิดสมพงษ์:</b> ${result.dayMatch}`;

  // Decide affinity level
  let affinityLevel = '💔 ดวงไม่สมพงษ์กันนัก';
  if (result.score >= 85) affinityLevel = '💖 สมพงษ์กันดีเลิศ (คู่แท้เกื้อกูล)';
  else if (result.score >= 70) affinityLevel = '🤝 คู่มิตรมิตรแท้ (ประคับประคองดี)';
  else if (result.score >= 50) affinityLevel = '🧘 คู่ทรงตัวพอดี (ต้องปรับความเข้าใจ)';
  else if (result.score >= 35) affinityLevel = '⚠️ คู่ลิขิตต้องระวัง (มีข้อขัดแย้งสะสม)';

  document.getElementById('zodmatch-affinity-level').textContent = affinityLevel;
  document.getElementById('zodmatch-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// 3. Zodiac Reading trigger
document.getElementById('btn-submit-zodread').addEventListener('click', () => {
  const date = document.getElementById('select-zodread-date').value;
  const month = document.getElementById('select-zodread-month').value;

  const result = getZodiacAndElement(date, month);

  // Render values
  document.getElementById('zodread-sign-title').textContent = result.name;
  document.getElementById('zodread-element').textContent = result.element;
  document.getElementById('zodread-color').textContent = result.color;
  document.getElementById('zodread-number').textContent = result.number;
  document.getElementById('zodread-trait-desc').textContent = result.trait;
  document.getElementById('zodread-forecast-desc').textContent = result.forecast;

  const ranges = {
    "เมษ": "13 เม.ย. - 13 พ.ค.", "พฤษภ": "14 พ.ค. - 13 มิ.ย.", "เมถุน": "14 มิ.ย. - 14 ก.ค.",
    "กรกฎ": "15 ก.ค. - 15 ส.ค.", "สิงห์": "16 ส.ค. - 16 ก.ย.", "กันย์": "17 ก.ย. - 16 ต.ค.",
    "ตุลย์": "17 ต.ค. - 15 พ.ย.", "พิจิก": "16 พ.ย. - 15 ธ.ค.", "ธนู": "16 ธ.ค. - 14 ม.ค.",
    "มังกร": "15 ม.ค. - 12 ก.พ.", "กุมภ์": "13 ก.พ. - 13 มี.ค.", "มีน": "14 มี.ค. - 12 เม.ย."
  };
  document.getElementById('zodread-range-title').textContent = ranges[result.sign] || '';

  document.getElementById('zodread-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// ==========================================================================
// DREAM DICTIONARY AND LOTTERY PREDICTIONS (ACCURATE MYSTIC DATA)
// ==========================================================================
const DREAM_DATABASE = {
  "งู": {
    meaning: "ฝันเห็นงูโบราณทำนายว่า: หากเป็นคนโสดจะได้พบเนื้อคู่ในเร็ววัน หรือจะมีเสน่ห์ดึงดูดเพศตรงข้ามอย่างมาก แต่หากฝันว่างูรัดหรือทำร้าย อาจเกิดจากการถูกเพศตรงข้ามเพ่งเล็งหรือปองร้าย หรือมีมิตรคิดคดทรยศนำเรื่องเดือดร้อนมาให้ ให้ระมัดระวังคำพูดและการทำสัญญา",
    num2: "56",
    num3: "569"
  },
  "ทอง": {
    meaning: "ฝันเห็นทองคำโบราณทำนายว่า: คุณกำลังจะได้รับโชคลาภก้อนใหญ่จากการทำงานหรือการเสี่ยงโชค หากเป็นสตรีมีครรภ์โบราณว่าจะได้บุตรสาวที่น่ารักและมีวาสนาสูง หากเป็นคนทำงานจะได้รับข่าวดีเรื่องการเลื่อนตำแหน่งหน้าที่การงานและการเงินคล่องตัวขึ้นอย่างมาก",
    num2: "19",
    num3: "919"
  },
  "ฟันหัก": {
    meaning: "ฝันว่าฟันหักทำนายว่า: หากฟันบนหักโบราณว่าจะต้องระมัดระวังสุขภาพของญาติผู้ใหญ่ฝั่งบิดา หากฟันล่างหักต้องระวังสุขภาพญาติผู้ใหญ่ฝั่งมารดา หรือตัวท่านเองอาจมีคดีความหรือเรื่องมีปากเสียงขัดแย้งในที่ทำงาน ให้หมั่นสวดมนต์อธิษฐานจิตแผ่เมตตาแก้เคล็ด",
    num2: "05",
    num3: "505"
  },
  "ศพ": {
    meaning: "ฝันเห็นคนเสียชีวิตหรือศพทำนายว่า: เรื่องร้ายๆ กำลังจะผ่านพ้นไป ความทุกข์โศกหรือโรคภัยไข้เจ็บของตัวท่านจะหมดสิ้น และกำลังจะมีลาภลอยหรือได้โชคลาภจากการเสี่ยงโชค เลขเด่นโดดเด่นมาก มีโอกาสได้โชคลาภจากทางไกลหรือสิ่งศักดิ์สิทธิ์ให้โชค",
    num2: "14",
    num3: "144"
  },
  "น้ำท่วม": {
    meaning: "ฝันเห็นน้ำท่วมใหญ่ทำนายว่า: จะต้องโยกย้ายหน้าที่การงานหรือถิ่นที่อยู่อาศัยในเร็วๆ นี้ หรือต้องออกเดินทางไกลกระทันหัน การทำงานมีอุปสรรคให้คอยแก้ไขบ่อยครั้ง แต่หลังจากอุปสรรคผ่านพ้นจะเกิดความรุ่งเรืองและการเปลี่ยนแปลงที่ดีขึ้น",
    num2: "22",
    num3: "255"
  },
  "ช้าง": {
    meaning: "ฝันเห็นช้างตัวใหญ่ทำนายว่า: เป็นฝันมงคลอย่างสูงยิ่ง คุณจะได้รับโชคลาภวาสนาบารมีจากผู้หลักผู้ใหญ่ในบ้านเมือง หรือได้รับข่าวดีเรื่องการงานที่ยิ่งใหญ่ การเดินทางไกลปลอดภัยและสำเร็จสมปรารถนาทุกประการ",
    num2: "95",
    num3: "955"
  },
  "เต่า": {
    meaning: "ฝันเห็นเต่าทำนายว่า: จะได้รับข่าวดีจากญาติผู้ใหญ่อายุยาวนาน หรือตัวท่านจะหมดเคราะห์หมดโรคภัย สุขภาพร่างกายแข็งแรงกระปรี้กระเปร่าขึ้น การเงินหมุนเวียนได้ดีขึ้นแบบช้าๆ แต่มั่นคง",
    num2: "43",
    num3: "433"
  },
  "แหวน": {
    meaning: "ฝันเห็นแหวนทองหรือเครื่องประดับทำนายว่า: คนโสดมีเกณฑ์จะได้พบรักที่อบอุ่นและสุขสมบูรณ์ คนมีคู่จะได้ข่าวดีเรื่องบุตรหรือทายาทที่รอคอย หรือได้รับโชคลาภมงคลจากคู่ครองของท่านเอง",
    num2: "08",
    num3: "808"
  }
};

function getDreamPrediction(keyword) {
  const cleanKeyword = keyword.trim().toLowerCase();
  
  // Try to find a matching keyword inside the database
  let foundKey = Object.keys(DREAM_DATABASE).find(k => cleanKeyword.includes(k) || k.includes(cleanKeyword));
  
  if (foundKey) {
    return DREAM_DATABASE[foundKey];
  }
  
  // Fallback for custom dreams (generates a pseudo-random but highly mystical prediction)
  const hash = cleanKeyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackMeanings = [
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: ชะตาชีวิตกำลังจะพบกับการเปลี่ยนแปลงครั้งใหญ่ในด้านความก้าวหน้าและการโยกย้าย จะมีมิตรแท้คอยเกื้อหนุนช่วยเหลือ ให้หมั่นทำบุญตักบาตรกรวดน้ำเสริมโชคลาภบารมี`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: คุณจะได้รับลาภผลเล็กๆ น้อยๆ จากการเดินทางหรือการเจรจาค้าขาย การเงินมีเกณฑ์ได้ลาภลอยแต่ต้องแบ่งทำบุญเพื่อสะสมผลบุญเสริมดวงชะตา`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: ช่วงนี้ให้ระมัดระวังเรื่องคำพูดและการมีปากเสียงในวงงาน อาจเกิดความเข้าใจผิดขัดแย้งกับผู้อื่นได้ง่าย แต่เรื่องโชคลาภและการเสี่ยงโชคยังอยู่ในเกณฑ์กลางๆ พอมีโชค`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: หมดเคราะห์หมดโศกในสิ่งที่มีปัญหาคาใจ สุขภาพร่างกายจะกลับมาสมบูรณ์แข็งแรงดีขึ้นอย่างมาก หากมีการลงทุนค้าขายจะได้รับผลกำไรเป็นที่พึงพอใจ`
  ];
  
  const num2Val = String((hash % 90) + 10); // 10-99
  const num3Val = String((hash % 900) + 100); // 100-999
  
  return {
    meaning: fallbackMeanings[hash % fallbackMeanings.length],
    num2: num2Val,
    num3: num3Val
  };
}

// Bind Dream Submit
const btnSubmitDream = document.getElementById('btn-submit-dream');
if (btnSubmitDream) {
  btnSubmitDream.addEventListener('click', () => {
    const keyword = document.getElementById('input-dream-keyword').value;
    if (!keyword || keyword.trim() === '') {
      alert('กรุณากรอกสิ่งที่คุณฝันถึงก่อนกดทำนายจ้า');
      return;
    }
    const result = getDreamPrediction(keyword);
    
    document.getElementById('dream-reveal-title').textContent = `🔮 คำทำนายฝันเกี่ยวกับ: "${keyword}"`;
    document.getElementById('dream-reveal-meaning').textContent = result.meaning;
    document.getElementById('dream-num-2').textContent = result.num2;
    document.getElementById('dream-num-3').textContent = result.num3;
    
    document.getElementById('dream-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}

// Bind suggestions click events
document.querySelectorAll('.suggestion-badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const keyword = badge.getAttribute('data-dream');
    document.getElementById('input-dream-keyword').value = keyword;
    const result = getDreamPrediction(keyword);
    
    document.getElementById('dream-reveal-title').textContent = `🔮 คำทำนายฝันเกี่ยวกับ: "${keyword}"`;
    document.getElementById('dream-reveal-meaning').textContent = result.meaning;
    document.getElementById('dream-num-2').textContent = result.num2;
    document.getElementById('dream-num-3').textContent = result.num3;
    
    document.getElementById('dream-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
});


// ==========================================================================
// DAILY AUSPICIOUS OUTFIT COLORS DATABASE (AUTHENTIC THAI ASTROLOGICAL DATA)
// ==========================================================================
const OUTFIT_COLOR_DATABASE = {
  "Sunday": {
    name: "คนเกิดวันอาทิตย์ 🔴",
    career: "สีแดง, สีชมพู 💖",
    wealth: "สีเขียวเข้ม, สีทอง 🟢🪙",
    love: "สีดำ, สีเทาเข้ม 🖤",
    health: "สีเหลือง, สีส้ม 🟡🍊",
    taboo: "สีน้ำเงิน, สีฟ้า 🔵 (กาลกิณีห้ามใส่!)"
  },
  "Monday": {
    name: "คนเกิดวันจันทร์ 🟡",
    career: "สีเขียว, สีครีม 🟢🤍",
    wealth: "สีม่วง, สีส้ม 🟣🍊",
    love: "สีน้ำเงิน, สีฟ้า 🔵",
    health: "สีชมพู, สีเขียว 💗",
    taboo: "สีแดง 🔴 (กาลกิณีห้ามใส่!)"
  },
  "Tuesday": {
    name: "คนเกิดวันอังคาร 💗",
    career: "สีม่วง, สีชมพู 🟣💗",
    wealth: "สีดำ, สีเทา 🖤",
    love: "สีแดง, สีชมพู 🔴",
    health: "สีเขียว, สีเหลือง 🟢",
    taboo: "สีขาว, สีเหลือง 🟡 (กาลกิณีห้ามใส่!)"
  },
  "Wednesday": {
    name: "คนเกิดวันพุธ 🟢",
    career: "สีเขียว, สีส้ม 🟢🍊",
    wealth: "สีเหลือง, สีทอง 🟡🪙",
    love: "สีน้ำเงิน, สีฟ้า 🔵",
    health: "สีดำ, สีเทาดำ 🖤",
    taboo: "สีชมพู 💗 (กาลกิณีห้ามใส่!)"
  },
  "Thursday": {
    name: "คนเกิดวันพฤหัสบดี 🟠",
    career: "สีส้ม, สีเหลือง 🍊🟡",
    wealth: "สีแดง, สีทอง 🔴🪙",
    love: "สีเขียว, สีส้ม 🟢",
    health: "สีน้ำเงิน, สีฟ้า 🔵",
    taboo: "สีดำ, สีม่วง 🟣 (กาลกิณีห้ามใส่!)"
  },
  "Friday": {
    name: "คนเกิดวันศุกร์ 🔵",
    career: "สีน้ำเงิน, สีฟ้า 🔵",
    wealth: "สีชมพู, สีแดง 💗🔴",
    love: "สีเหลือง, สีส้ม 🟡",
    health: "สีขาว, สีทอง 🤍🪙",
    taboo: "สีเทาเข้ม, สีม่วง 🟣 (กาลกิณีห้ามใส่!)"
  },
  "Saturday": {
    name: "คนเกิดวันเสาร์ 🟣",
    career: "สีดำ, สีเทา 🖤",
    wealth: "สีน้ำเงิน, สีฟ้า 🔵",
    love: "สีชมพู, สีม่วง 💗",
    health: "สีแดง, สีดำ 🔴",
    taboo: "สีเขียว 🟢 (กาลกิณีห้ามใส่!)"
  }
};

const btnSubmitOutfit = document.getElementById('btn-submit-outfit');
if (btnSubmitOutfit) {
  btnSubmitOutfit.addEventListener('click', () => {
    const day = document.getElementById('select-outfit-birthday').value;
    const result = OUTFIT_COLOR_DATABASE[day];
    
    document.getElementById('outfit-reveal-title').textContent = `👕 เสื้อสีมงคลเสริมชะตาของ: ${result.name}`;
    document.getElementById('outfit-career').textContent = result.career;
    document.getElementById('outfit-wealth').textContent = result.wealth;
    document.getElementById('outfit-love').textContent = result.love;
    document.getElementById('outfit-health').textContent = result.health;
    
    const tabooEl = document.getElementById('outfit-taboo');
    if (tabooEl) {
      tabooEl.textContent = result.taboo;
      tabooEl.style.color = '#ff4d4d';
    }
    
    document.getElementById('outfit-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}


// ==========================================================================
// TRADITIONAL THAI LIFE GRAPH CALCULATOR (HIGHLY ACCURATE NUMEROLOGY)
// ==========================================================================
const LIFE_GRAPH_CATEGORIES = [
  { name: "วาสนา (Destiny)", color: "var(--color-gold)", desc: "ชะตาชีวิตโดยทั่วไป ความสงบสุข วาสนาบุญบารมีสะสม" },
  { name: "ทรัพย์ (Wealth)", color: "var(--color-cyan)", desc: "โชคลาภการเงิน ความมั่นคงทางฐานะ ทรัพย์สินเงินทอง" },
  { name: "เพื่อนบ้าน (Social)", color: "var(--color-purple)", desc: "ความสัมพันธ์กับบุคคลรอบตัว เพื่อนฝูง สังคม และกัลยาณมิตร" },
  { name: "ญาติ (Family)", color: "#fff", desc: "ความเกื้อหนุนจุนเจือจากครอบครัว พ่อแม่ พี่น้อง" },
  { name: "บุตร (Children)", color: "var(--color-magenta)", desc: "บุตรธิดา บริวารรุ่นใหม่ ความหวังใหม่และผู้สืบทอด" },
  { name: "บริวาร (Followers)", color: "var(--color-cyan)", desc: "คนรับใช้ ลูกน้อง หรือผู้รับใช้อุปถัมภ์ที่คอยสนับสนุน" },
  { name: "ศัตรู (Obstacles)", color: "#ff4d4d", desc: "อุปสรรคขัดขวาง คดีความ หรือคนขัดขาปองร้าย" },
  { name: "คู่ครอง (Spouse)", color: "var(--color-magenta)", desc: "ความรัก ชีวิตแต่งงาน คู่ครอง คนรัก หรือคู่สัญญาทำงาน" },
  { name: "โรคภัย (Health)", color: "#ff4d4d", desc: "สุขภาพร่างกาย โรคประจำตัว หรืออันตรายจากอุบัติเหตุ" },
  { name: "การงาน (Career)", color: "var(--color-purple)", desc: "ตำแหน่งหน้าที่การงาน ความสำเร็จในการค้าขายหรือรับราชการ" },
  { name: "ลาภยศ (Luck & Honor)", color: "var(--color-gold)", desc: "เกียรติยศชื่อเสียง โชคลาภก้อนโตจากการเสี่ยงโชค" },
  { name: "เจริญสุข (Happiness)", color: "#00ff88", desc: "ความสุขทางจิตใจ ความสำเร็จในปลายชีวิต ความร่มเย็น" }
];

function calculateLifeGraph(weekday, date, month, year, beYear) {
  const scores = [];
  for (let i = 0; i < 12; i++) {
    // Incorporate all parameters, adding B.E. year weight for age personalization
    let baseScore = (weekday + month + date + year + (beYear % 12) + (i * 3)) % 12;
    if (baseScore === 0) baseScore = 12;
    scores.push(baseScore);
  }
  return scores;
}

// Populate B.E. Years dynamically and bind automatic Zodiac year updates
const selectBeYear = document.getElementById('select-lg-be-year');
if (selectBeYear) {
  for (let y = 2570; y >= 2500; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `พ.ศ. ${y}`;
    selectBeYear.appendChild(opt);
  }
  // Set default B.E. Year to 2540 (which corresponds to Year of Ox)
  selectBeYear.value = "2540";

  selectBeYear.addEventListener('change', () => {
    const beYearVal = parseInt(selectBeYear.value);
    let zodiacIdx = (beYearVal - 2538) % 12;
    if (zodiacIdx <= 0) zodiacIdx += 12;
    
    const selectZodiac = document.getElementById('select-lg-year');
    if (selectZodiac) {
      selectZodiac.value = String(zodiacIdx);
    }
  });
}

const btnSubmitLifeGraph = document.getElementById('btn-submit-lifegraph');
if (btnSubmitLifeGraph) {
  btnSubmitLifeGraph.addEventListener('click', () => {
    const weekday = parseInt(document.getElementById('select-lg-weekday').value);
    const date = parseInt(document.getElementById('select-lg-date').value);
    const month = parseInt(document.getElementById('select-lg-month').value);
    const year = parseInt(document.getElementById('select-lg-year').value);
    const beYear = parseInt(document.getElementById('select-lg-be-year').value) || 2540;
    
    const scores = calculateLifeGraph(weekday, date, month, year, beYear);
    const container = document.getElementById('lifegraph-bars-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    LIFE_GRAPH_CATEGORIES.forEach((cat, index) => {
      const score = scores[index];
      let scoreText = 'ดวงปานกลาง';
      if (score >= 9) scoreText = '🔥 ดวงดีเลิศ';
      else if (score <= 4) scoreText = '⚠️ ต้องระวัง';
      
      const barWrapper = document.createElement('div');
      barWrapper.style.margin = '8px 0';
      barWrapper.style.padding = '8px';
      barWrapper.style.background = 'rgba(255, 255, 255, 0.03)';
      barWrapper.style.borderRadius = '8px';
      
      barWrapper.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.9rem;">
          <span style="font-weight: 500; color: ${cat.color};">${cat.name}</span>
          <span style="font-weight: bold; color: ${score >= 9 ? 'var(--color-gold)' : (score <= 4 ? '#ff4d4d' : '#cbd5e1')};">${score} คะแนน (${scoreText})</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
          <div style="width: ${(score / 12) * 100}%; height: 100%; background: ${score >= 9 ? 'var(--color-gold)' : (score <= 4 ? '#ff4d4d' : 'var(--color-cyan)')}; border-radius: 4px; box-shadow: 0 0 8px ${score >= 9 ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,255,0.3)'};"></div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;">${cat.desc}</div>
      `;
      
      container.appendChild(barWrapper);
    });
    
    document.getElementById('lifegraph-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}

// ==========================================================================
// ON DOM LOAD INITIALIZATION
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Start star particles background
  StarBg.init('star-canvas');

  // URL parsing helper for quick joining
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam && io) {
    showSection('sec-player-join');
    setupJoinView();
    document.getElementById('input-room-code').value = roomParam;
  }

  // Angel Pam Mascot Interaction
  const mascotPam = document.getElementById('mascot-pam');
  const speechBubble = document.getElementById('pam-speech');
  const speechText = document.getElementById('pam-speech-text');
  let speechTimeout = null;

  const pamQuotes = [
    "เพี้ยง! วันนี้ดวงจะดี มีแต่เงินทองไหลมาเทมานะจ๊ะ 💸",
    "วันนี้ทำตัวน่ารักหรือยัง? นางฟ้ามองว่าดวงคุณอยู่ในเกรด A+ เลยนะ! ✨",
    "พักผ่อนบ้างนะจ๊ะ อย่ามัวแต่เคร่งเครียดจนหลังตึงล่ะ ปล.วันนี้ความรักเด่นมากนะ 🥰",
    "ชวนเพื่อนๆ ในกลุ่มแชร์เว็บ 'ดวงปังพลังแพม' มาเล่นกันเยอะๆ นะ เสริมความโชคดี! 💘",
    "วันนี้มีลาภปากนะจ๊ะ จะมีคนพาไปเลี้ยงของอร่อย อิ่มสบายท้องแน่นอน 🍕",
    "เพี้ยง! ขอปัดเป่าเคราะห์ร้ายออกจากเพื่อนๆ ทุกคนในวงปาร์ตี้จ้า 🔮"
  ];

  if (mascotPam && speechBubble && speechText) {
    mascotPam.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#pam-speech')) return;

      const randomQuote = pamQuotes[Math.floor(Math.random() * pamQuotes.length)];
      speechText.textContent = randomQuote;
      
      // Toggle speech
      if (speechBubble.classList.contains('hidden')) {
        speechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        speechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      // Auto hide after 6 seconds
      clearTimeout(speechTimeout);
      speechTimeout = setTimeout(() => {
        speechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Dabbing Pig Mascot Interaction
  const mascotPig = document.getElementById('lobby-pig');
  const pigSpeechBubble = document.getElementById('pig-speech');
  const pigSpeechText = document.getElementById('pig-speech-text');
  let pigSpeechTimeout = null;

  const pigQuotes = [
    "สวัสดีวัยรุ่น! วันนี้ขอให้ดวงแข็งดั่งเหล็กกล้า! 🐷🔥",
    "ดวงวันนี้พร้อมชนทุกโชคลาภจ้า! แด็บทีนึงเสริมสิริมงคล! 🕶️",
    "ถ้าเงินในกระเป๋ามันโล่ง มาดูดวงกู้ชีพกับหมอดูแพมด่วนๆ! 💸",
    "แด็บซ้าย แด็บขวา... วันนี้โชคลาภวิ่งมาชนแน่นอนจ้าวัยรุ่น! 🚀",
    "กินอิ่ม นอนอุ่น หุ่นดีแบบพี่หมูนะจ๊ะ 🍕😴",
    "เพี้ยง! มูเตลูกันยาวๆ ดับเบิ้ลแด็บรับเงินแสนจ้าพี่ๆ 💰"
  ];

  if (mascotPig && pigSpeechBubble && pigSpeechText) {
    mascotPig.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#pig-speech')) return;

      const randomQuote = pigQuotes[Math.floor(Math.random() * pigQuotes.length)];
      pigSpeechText.textContent = randomQuote;
      
      // Trigger funny 360 spin animation
      mascotPig.classList.add('spin-active');
      setTimeout(() => {
        mascotPig.classList.remove('spin-active');
      }, 750); // Remove class after spin animation ends (0.75s)

      // Toggle speech bubble
      if (pigSpeechBubble.classList.contains('hidden')) {
        pigSpeechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        pigSpeechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      // Auto hide after 6 seconds
      clearTimeout(pigSpeechTimeout);
      pigSpeechTimeout = setTimeout(() => {
        pigSpeechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Floating Tarot Card Particles in Lobby
  function spawnLobbyCard() {
    const container = document.getElementById('lobby-card-particles');
    const lobby = document.getElementById('sec-lobby');
    // Only spawn when lobby is active
    if (!container || !lobby || lobby.classList.contains('hidden')) return;

    const card = document.createElement('div');
    card.className = 'floating-card-particle';

    // Random horizontal position across screen
    const startX = Math.random() * window.innerWidth;
    card.style.left = `${startX}px`;

    // Random drift and rotation
    const driftX = (Math.random() * 240 - 120) + 'px';
    const rotateDeg = (Math.random() * 120 - 60) + 'deg';
    card.style.setProperty('--drift-x', driftX);
    card.style.setProperty('--rotate-deg', rotateDeg);

    // Random scale between 0.6 and 1.1 for depth effect
    const scale = Math.random() * 0.5 + 0.6;
    card.style.transform = `scale(${scale})`;

    // Randomize speed slightly by setting custom animation duration
    const duration = (Math.random() * 3 + 7.5) + 's'; // 7.5s to 10.5s
    card.style.animationDuration = duration;

    container.appendChild(card);

    // Remove element after animation ends
    setTimeout(() => {
      card.remove();
    }, 11000);
  }

  // Spawn cards every 2.4 seconds
  setInterval(spawnLobbyCard, 2400);
  // Spawn a couple initially
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnLobbyCard, i * 800);
  }

  // Autoplay Background Music
  const startBgm = () => {
    MysticAudio.init();
    if (!MysticAudio.isBgPlaying) {
      const isPlaying = MysticAudio.toggleBackgroundMusic();
      updateAudioButtonUI(isPlaying);
    }
  };

  // Try to play immediately on load (usually blocked by modern browsers)
  setTimeout(() => {
    MysticAudio.init(); // Initialize context and bgAudio
    if (MysticAudio.bgAudio) {
      MysticAudio.bgAudio.play().then(() => {
        MysticAudio.isBgPlaying = true;
        updateAudioButtonUI(true);
      }).catch(() => {
        // Autoplay blocked. Setup one-time trigger on first click or touch anywhere on page.
        const startOnInteraction = (e) => {
          if (e && e.target && e.target.closest('#audio-toggle-btn')) return;
          
          startBgm();
          // Clean up event listeners
          window.removeEventListener('click', startOnInteraction);
          window.removeEventListener('touchstart', startOnInteraction);
        };
        window.addEventListener('click', startOnInteraction, { passive: true });
        window.addEventListener('touchstart', startOnInteraction, { passive: true });
      });
    }
  }, 500);
});
