// Brain Training PWA Application
class BrainTrainingApp {
  constructor() {
    this.currentScreen = 'loading';
    this.currentGame = null;
    this.gameSession = null;
    this.userData = this.loadUserData();
    this.gameData = {
      games: [
        {
          id: "janken",
          name: "後出しジャンケン",
          description: "指示に従って適切な手を選ぼう",
          icon: "✂️",
          difficulty: ["初級", "中級", "上級"],
          exercises: ["判断力", "抑制制御", "瞬発力"]
        },
        {
          id: "color-match",
          name: "カラーマッチ",
          description: "文字と色の一致を素早く判断",
          icon: "🎨",
          difficulty: ["初級", "中級", "上級"],
          exercises: ["注意力", "情報処理速度", "抑制制御"]
        },
        {
          id: "number-memory",
          name: "数字記憶",
          description: "数字を覚えて順番に選択",
          icon: "🔢",
          difficulty: ["初級", "中級", "上級"],
          exercises: ["短期記憶", "集中力", "視覚的認知"]
        },
        {
          id: "calc-quick",
          name: "計算クイック",
          description: "素早く計算問題を解こう",
          icon: "➕",
          difficulty: ["初級", "中級", "上級"],
          exercises: ["計算力", "処理速度", "集中力"]
        },
        {
          id: "high-low",
          name: "ハイ・ロー",
          description: "数字の大小を予想しよう",
          icon: "📊",
          difficulty: ["初級", "中級", "上級"],
          exercises: ["記憶力", "判断力", "情報処理速度"]
        }
      ],
      levels: [
        {level: 1, name: "ビギナー", requiredPoints: 0, color: "#95a5a6"},
        {level: 2, name: "アマチュア", requiredPoints: 100, color: "#3498db"},
        {level: 3, name: "セミプロ", requiredPoints: 300, color: "#2ecc71"},
        {level: 4, name: "プロ", requiredPoints: 600, color: "#f39c12"},
        {level: 5, name: "エキスパート", requiredPoints: 1000, color: "#9b59b6"},
        {level: 6, name: "マスター", requiredPoints: 1500, color: "#e74c3c"}
      ],
      badges: [
        {id: "first-play", name: "初心者", description: "初回プレイ完了", icon: "🌟"},
        {id: "streak-3", name: "継続力", description: "3日連続プレイ", icon: "🔥"},
        {id: "streak-7", name: "習慣マスター", description: "7日連続プレイ", icon: "💎"},
        {id: "perfect-score", name: "パーフェクト", description: "ノーミスでセット完了", icon: "🏆"},
        {id: "speed-master", name: "スピードマスター", description: "平均回答時間1秒以下", icon: "⚡"},
        {id: "point-collector", name: "ポイントコレクター", description: "1000ポイント獲得", icon: "💰"}
      ]
    };
    
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateDailyStreak();
    
    // Show loading screen briefly
    setTimeout(() => {
      if (this.userData.hasSeenWelcome) {
        this.showScreen('main-app');
        this.showAppScreen('dashboard');
      } else {
        this.showScreen('welcome');
      }
    }, 1500);
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        this.checkForInstallPrompt();
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  checkForInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt(deferredPrompt);
    });
  }

  showInstallPrompt(deferredPrompt) {
    const installPrompt = document.getElementById('install-prompt');
    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('dismiss-install');
    
    installPrompt.classList.remove('hidden');
    
    installBtn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      installPrompt.classList.add('hidden');
    });
    
    dismissBtn.addEventListener('click', () => {
      installPrompt.classList.add('hidden');
    });
  }

  // Event Listeners
  setupEventListeners() {
    // Welcome screen
    document.getElementById('start-app-btn').addEventListener('click', () => {
      this.userData.hasSeenWelcome = true;
      this.saveUserData();
      this.showScreen('main-app');
      this.showAppScreen('dashboard');
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const screen = e.target.dataset.screen;
        this.showAppScreen(screen);
        this.updateNavigation(screen);
      });
    });

    // Game selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.game-card')) {
        const gameId = e.target.closest('.game-card').dataset.gameId;
        this.startGame(gameId);
      }
    });

    // Game controls
    document.getElementById('back-to-games').addEventListener('click', () => {
      this.showAppScreen('games');
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
      if (this.currentGame) {
        this.startGame(this.currentGame.id);
      }
    });

    document.getElementById('continue-btn').addEventListener('click', () => {
      this.showAppScreen('dashboard');
    });

    // Stats tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.showStatsTab(tab);
      });
    });

    // Settings
    document.getElementById('difficulty-setting').addEventListener('change', (e) => {
      this.userData.settings.difficulty = e.target.value;
      this.saveUserData();
    });

    document.getElementById('sound-setting').addEventListener('change', (e) => {
      this.userData.settings.sound = e.target.checked;
      this.saveUserData();
    });

    document.getElementById('reminder-setting').addEventListener('change', (e) => {
      this.userData.settings.reminders = e.target.checked;
      this.saveUserData();
    });

    document.getElementById('reminder-time').addEventListener('change', (e) => {
      this.userData.settings.reminderTime = e.target.value;
      this.saveUserData();
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportUserData();
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
      if (confirm('本当にすべてのデータをリセットしますか？この操作は取り消せません。')) {
        this.resetUserData();
      }
    });
  }

  // Screen Management
  showScreen(screenId) {
    document.querySelectorAll('.screen, #main-app').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    if (screenId === 'main-app') {
      document.getElementById('main-app').classList.remove('hidden');
    } else {
      document.getElementById(screenId + '-screen').classList.remove('hidden');
    }
    
    this.currentScreen = screenId;
  }

  showAppScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    document.getElementById(screenId + '-screen').classList.remove('hidden');
    
    // Update content based on screen
    switch (screenId) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'games':
        this.updateGamesScreen();
        break;
      case 'stats':
        this.updateStatsScreen();
        break;
      case 'settings':
        this.updateSettingsScreen();
        break;
    }
  }

  updateNavigation(activeScreen) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.screen === activeScreen) {
        item.classList.add('active');
      }
    });
  }

  // Dashboard Updates
  updateDashboard() {
    // Update date
    const now = new Date();
    document.getElementById('current-date').textContent = 
      now.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });

    // Update stats
    document.getElementById('daily-goal-progress').textContent = 
      `${this.userData.dailyProgress.gamesPlayed}/3`;
    document.getElementById('total-points').textContent = this.userData.totalPoints;
    document.getElementById('current-level').textContent = this.getCurrentLevel().level;
    document.getElementById('streak-count').textContent = this.userData.currentStreak;

    // Update progress bar
    const progress = Math.min(100, (this.userData.dailyProgress.gamesPlayed / 3) * 100);
    document.getElementById('daily-progress').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;

    // Update recommended games
    this.updateRecommendedGames();
    
    // Update recent badges
    this.updateRecentBadges();
  }

  updateRecommendedGames() {
    const container = document.getElementById('recommended-games');
    const recommendedGames = this.getRecommendedGames();
    
    container.innerHTML = recommendedGames.map(game => `
      <div class="game-card" data-game-id="${game.id}">
        <div class="game-icon">${game.icon}</div>
        <div class="game-name">${game.name}</div>
        <div class="game-description">${game.description}</div>
      </div>
    `).join('');
  }

  getRecommendedGames() {
    // Simple recommendation: games not played today
    const playedToday = this.userData.dailyProgress.playedGames;
    return this.gameData.games.filter(game => !playedToday.includes(game.id)).slice(0, 3);
  }

  updateRecentBadges() {
    const container = document.getElementById('recent-badges');
    const recentBadges = this.userData.badges.slice(-3);
    
    if (recentBadges.length === 0) {
      container.innerHTML = '<p>まだバッジがありません。ゲームをプレイして最初のバッジを獲得しましょう！</p>';
      return;
    }

    const badgeList = container.querySelector('.badge-list');
    badgeList.innerHTML = recentBadges.map(badgeId => {
      const badge = this.gameData.badges.find(b => b.id === badgeId);
      return `
        <div class="badge-item earned">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
        </div>
      `;
    }).join('');
  }

  // Games Screen
  updateGamesScreen() {
    const container = document.getElementById('games-grid');
    container.innerHTML = this.gameData.games.map(game => {
      const stats = this.getUserGameStats(game.id);
      return `
        <div class="game-card" data-game-id="${game.id}">
          <div class="game-icon">${game.icon}</div>
          <div class="game-name">${game.name}</div>
          <div class="game-description">${game.description}</div>
          <div class="game-exercises">
            ${game.exercises.map(ex => `<span class="exercise-tag">${ex}</span>`).join('')}
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">
            最高スコア: ${stats.bestScore} | プレイ回数: ${stats.playCount}
          </div>
        </div>
      `;
    }).join('');
  }

  getUserGameStats(gameId) {
    const defaultStats = { bestScore: 0, playCount: 0, averageScore: 0 };
    return this.userData.gameStats[gameId] || defaultStats;
  }

  // Game Logic
  startGame(gameId) {
    this.currentGame = this.gameData.games.find(g => g.id === gameId);
    this.showAppScreen('game-play');
    
    document.getElementById('game-title').textContent = this.currentGame.name;
    document.getElementById('game-score').textContent = '0pt';
    document.getElementById('game-timer').textContent = '0:00';
    
    // Initialize game session
    this.gameSession = {
      gameId: gameId,
      startTime: Date.now(),
      score: 0,
      questions: 0,
      correctAnswers: 0,
      questionTimes: [],
      currentQuestion: 0,
      gameState: {}
    };
    
    // Start the specific game
    switch (gameId) {
      case 'janken':
        this.startJankenGame();
        break;
      case 'color-match':
        this.startColorMatchGame();
        break;
      case 'number-memory':
        this.startNumberMemoryGame();
        break;
      case 'calc-quick':
        this.startCalcQuickGame();
        break;
      case 'high-low':
        this.startHighLowGame();
        break;
    }
  }

  // Janken Game (Rock Paper Scissors Follow-up)
  startJankenGame() {
    this.gameSession.totalQuestions = 10;
    this.gameSession.currentQuestion = 0;
    this.nextJankenQuestion();
  }

  nextJankenQuestion() {
    if (this.gameSession.currentQuestion >= this.gameSession.totalQuestions) {
      this.endGame();
      return;
    }

    const choices = ['グー', 'チョキ', 'パー'];
    const instructions = ['勝って', '負けて', '引き分けて'];
    
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const instruction = instructions[Math.floor(Math.random() * 3)];
    
    this.gameSession.currentQuestion++;
    this.gameSession.questionStartTime = Date.now();
    
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-question">
        <h2>第${this.gameSession.currentQuestion}問</h2>
        <div class="game-instruction">コンピュータ: ${computerChoice}</div>
        <div class="game-instruction" style="color: var(--color-primary); font-size: 24px;">${instruction}！</div>
        <div class="game-timer-display" id="question-timer">3</div>
      </div>
      <div class="game-options">
        <button class="game-option" data-choice="グー">✊ グー</button>
        <button class="game-option" data-choice="チョキ">✌️ チョキ</button>
        <button class="game-option" data-choice="パー">✋ パー</button>
      </div>
    `;
    
    // Store correct answer
    this.gameSession.correctAnswer = this.getJankenCorrectAnswer(computerChoice, instruction);
    
    // Start countdown
    this.startQuestionTimer(3, () => {
      this.handleJankenTimeout();
    });
    
    // Add click handlers
    container.querySelectorAll('.game-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.handleJankenAnswer(e.target.dataset.choice);
      });
    });
  }

  getJankenCorrectAnswer(computerChoice, instruction) {
    const winMap = { 'グー': 'パー', 'チョキ': 'グー', 'パー': 'チョキ' };
    const loseMap = { 'グー': 'チョキ', 'チョキ': 'パー', 'パー': 'グー' };
    
    if (instruction === '勝って') return winMap[computerChoice];
    if (instruction === '負けて') return loseMap[computerChoice];
    return computerChoice; // 引き分け
  }

  handleJankenAnswer(playerChoice) {
    const responseTime = Date.now() - this.gameSession.questionStartTime;
    this.gameSession.questionTimes.push(responseTime);
    
    const isCorrect = playerChoice === this.gameSession.correctAnswer;
    
    if (isCorrect) {
      this.gameSession.correctAnswers++;
      const basePoints = 10;
      const speedBonus = Math.max(0, Math.floor((3000 - responseTime) / 100));
      const points = basePoints + speedBonus;
      this.gameSession.score += points;
      this.updateGameScore();
    }
    
    this.showAnswerFeedback(isCorrect, () => {
      setTimeout(() => this.nextJankenQuestion(), 500);
    });
  }

  handleJankenTimeout() {
    this.gameSession.questionTimes.push(3000);
    this.showAnswerFeedback(false, () => {
      setTimeout(() => this.nextJankenQuestion(), 500);
    });
  }

  // Color Match Game (Stroop Effect)
  startColorMatchGame() {
    this.gameSession.totalQuestions = 15;
    this.gameSession.currentQuestion = 0;
    this.nextColorMatchQuestion();
  }

  nextColorMatchQuestion() {
    if (this.gameSession.currentQuestion >= this.gameSession.totalQuestions) {
      this.endGame();
      return;
    }

    const colors = [
      { name: '赤', color: '#e74c3c' },
      { name: '青', color: '#3498db' },
      { name: '緑', color: '#2ecc71' },
      { name: '黄', color: '#f39c12' }
    ];
    
    const colorName = colors[Math.floor(Math.random() * colors.length)];
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    
    this.gameSession.currentQuestion++;
    this.gameSession.questionStartTime = Date.now();
    this.gameSession.correctAnswer = colorName.name === displayColor.name;
    
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-question">
        <h2>第${this.gameSession.currentQuestion}問</h2>
        <div class="game-instruction">文字と色は一致していますか？</div>
        <div class="game-timer-display" id="question-timer">2</div>
        <div style="font-size: 48px; font-weight: bold; margin: 20px 0; color: ${displayColor.color};">
          ${colorName.name}
        </div>
      </div>
      <div class="game-options">
        <button class="game-option" data-answer="true">YES<br>一致</button>
        <button class="game-option" data-answer="false">NO<br>不一致</button>
      </div>
    `;
    
    this.startQuestionTimer(2, () => {
      this.handleColorMatchTimeout();
    });
    
    container.querySelectorAll('.game-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.handleColorMatchAnswer(e.target.dataset.answer === 'true');
      });
    });
  }

  handleColorMatchAnswer(answer) {
    const responseTime = Date.now() - this.gameSession.questionStartTime;
    this.gameSession.questionTimes.push(responseTime);
    
    const isCorrect = answer === this.gameSession.correctAnswer;
    
    if (isCorrect) {
      this.gameSession.correctAnswers++;
      const basePoints = 10;
      const speedBonus = Math.max(0, Math.floor((2000 - responseTime) / 50));
      const points = basePoints + speedBonus;
      this.gameSession.score += points;
      this.updateGameScore();
    }
    
    this.showAnswerFeedback(isCorrect, () => {
      setTimeout(() => this.nextColorMatchQuestion(), 500);
    });
  }

  handleColorMatchTimeout() {
    this.gameSession.questionTimes.push(2000);
    this.showAnswerFeedback(false, () => {
      setTimeout(() => this.nextColorMatchQuestion(), 500);
    });
  }

  // Number Memory Game
  startNumberMemoryGame() {
    this.gameSession.totalQuestions = 5;
    this.gameSession.currentQuestion = 0;
    this.nextNumberMemoryQuestion();
  }

  nextNumberMemoryQuestion() {
    if (this.gameSession.currentQuestion >= this.gameSession.totalQuestions) {
      this.endGame();
      return;
    }

    this.gameSession.currentQuestion++;
    this.gameSession.questionStartTime = Date.now();
    
    // Generate random numbers 1-9
    const numbers = Array.from({length: 9}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    this.gameSession.correctSequence = [...numbers].sort((a, b) => a - b);
    this.gameSession.playerSequence = [];
    
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-question">
        <h2>第${this.gameSession.currentQuestion}問</h2>
        <div class="game-instruction">数字を覚えて、小さい順にタップしてください</div>
        <div class="game-timer-display" id="question-timer">記憶中...</div>
      </div>
      <div class="number-grid" id="number-grid">
        ${numbers.map((num, index) => `
          <div class="number-cell" data-number="${num}" data-index="${index}">
            ${num}
          </div>
        `).join('')}
      </div>
    `;
    
    // Show numbers for 2 seconds, then hide
    setTimeout(() => {
      document.querySelectorAll('.number-cell').forEach(cell => {
        cell.classList.add('hidden');
        cell.addEventListener('click', (e) => {
          this.handleNumberMemoryClick(parseInt(e.target.dataset.number));
        });
      });
      document.getElementById('question-timer').textContent = '選択中...';
    }, 2000);
  }

  handleNumberMemoryClick(number) {
    this.gameSession.playerSequence.push(number);
    
    // Find and reveal the cell
    const cell = document.querySelector(`[data-number="${number}"]`);
    cell.classList.remove('hidden');
    cell.classList.add('revealed');
    cell.style.pointerEvents = 'none';
    
    // Check if sequence is correct so far
    const currentIndex = this.gameSession.playerSequence.length - 1;
    if (this.gameSession.playerSequence[currentIndex] !== this.gameSession.correctSequence[currentIndex]) {
      // Wrong! End question
      this.showAnswerFeedback(false, () => {
        setTimeout(() => this.nextNumberMemoryQuestion(), 1000);
      });
      return;
    }
    
    // Check if complete
    if (this.gameSession.playerSequence.length === 9) {
      const responseTime = Date.now() - this.gameSession.questionStartTime;
      this.gameSession.questionTimes.push(responseTime);
      this.gameSession.correctAnswers++;
      
      const basePoints = 50; // Higher points for memory game
      const speedBonus = Math.max(0, Math.floor((10000 - responseTime) / 200));
      const points = basePoints + speedBonus;
      this.gameSession.score += points;
      this.updateGameScore();
      
      this.showAnswerFeedback(true, () => {
        setTimeout(() => this.nextNumberMemoryQuestion(), 1000);
      });
    }
  }

  // Calculation Quick Game
  startCalcQuickGame() {
    this.gameSession.totalQuestions = 20;
    this.gameSession.currentQuestion = 0;
    this.nextCalcQuickQuestion();
  }

  nextCalcQuickQuestion() {
    if (this.gameSession.currentQuestion >= this.gameSession.totalQuestions) {
      this.endGame();
      return;
    }

    this.gameSession.currentQuestion++;
    this.gameSession.questionStartTime = Date.now();
    
    // Generate simple math problem
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, correctAnswer;
    
    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        correctAnswer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * num1);
        correctAnswer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        correctAnswer = num1 * num2;
        break;
    }
    
    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
      const wrong = correctAnswer + (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 10) + 1);
      if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }
    
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    this.gameSession.correctAnswer = correctAnswer;
    
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-question">
        <h2>第${this.gameSession.currentQuestion}問</h2>
        <div class="game-instruction">計算結果を選んでください</div>
        <div class="game-timer-display" id="question-timer">5</div>
        <div style="font-size: 36px; font-weight: bold; margin: 20px 0;">
          ${num1} ${operator} ${num2} = ?
        </div>
      </div>
      <div class="game-options">
        ${options.map(option => `
          <button class="game-option" data-answer="${option}">${option}</button>
        `).join('')}
      </div>
    `;
    
    this.startQuestionTimer(5, () => {
      this.handleCalcQuickTimeout();
    });
    
    container.querySelectorAll('.game-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.handleCalcQuickAnswer(parseInt(e.target.dataset.answer));
      });
    });
  }

  handleCalcQuickAnswer(answer) {
    const responseTime = Date.now() - this.gameSession.questionStartTime;
    this.gameSession.questionTimes.push(responseTime);
    
    const isCorrect = answer === this.gameSession.correctAnswer;
    
    if (isCorrect) {
      this.gameSession.correctAnswers++;
      const basePoints = 10;
      const speedBonus = Math.max(0, Math.floor((5000 - responseTime) / 100));
      const points = basePoints + speedBonus;
      this.gameSession.score += points;
      this.updateGameScore();
    }
    
    this.showAnswerFeedback(isCorrect, () => {
      setTimeout(() => this.nextCalcQuickQuestion(), 500);
    });
  }

  handleCalcQuickTimeout() {
    this.gameSession.questionTimes.push(5000);
    this.showAnswerFeedback(false, () => {
      setTimeout(() => this.nextCalcQuickQuestion(), 500);
    });
  }

  // High-Low Game
  startHighLowGame() {
    this.gameSession.totalQuestions = 20;
    this.gameSession.currentQuestion = 0;
    this.gameSession.currentNumber = Math.floor(Math.random() * 100) + 1;
    this.nextHighLowQuestion();
  }

  nextHighLowQuestion() {
    if (this.gameSession.currentQuestion >= this.gameSession.totalQuestions) {
      this.endGame();
      return;
    }

    this.gameSession.currentQuestion++;
    this.gameSession.questionStartTime = Date.now();
    
    const nextNumber = Math.floor(Math.random() * 100) + 1;
    this.gameSession.nextNumber = nextNumber;
    this.gameSession.correctAnswer = nextNumber > this.gameSession.currentNumber ? 'HIGH' : 'LOW';
    
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-question">
        <h2>第${this.gameSession.currentQuestion}問</h2>
        <div class="game-instruction">次の数字は現在の数字より大きい？小さい？</div>
        <div style="font-size: 48px; font-weight: bold; margin: 20px 0; color: var(--color-primary);">
          ${this.gameSession.currentNumber}
        </div>
        <div class="game-timer-display" id="question-timer">3</div>
      </div>
      <div class="game-options">
        <button class="game-option" data-answer="HIGH">📈 HIGH<br>大きい</button>
        <button class="game-option" data-answer="LOW">📉 LOW<br>小さい</button>
      </div>
    `;
    
    this.startQuestionTimer(3, () => {
      this.handleHighLowTimeout();
    });
    
    container.querySelectorAll('.game-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.handleHighLowAnswer(e.target.dataset.answer);
      });
    });
  }

  handleHighLowAnswer(answer) {
    const responseTime = Date.now() - this.gameSession.questionStartTime;
    this.gameSession.questionTimes.push(responseTime);
    
    const isCorrect = answer === this.gameSession.correctAnswer;
    
    if (isCorrect) {
      this.gameSession.correctAnswers++;
      const basePoints = 10;
      const speedBonus = Math.max(0, Math.floor((3000 - responseTime) / 100));
      const points = basePoints + speedBonus;
      this.gameSession.score += points;
      this.updateGameScore();
    }
    
    // Show the next number
    const container = document.getElementById('game-container');
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'font-size: 36px; font-weight: bold; margin-top: 20px;';
    resultDiv.textContent = `次の数字: ${this.gameSession.nextNumber}`;
    container.appendChild(resultDiv);
    
    this.gameSession.currentNumber = this.gameSession.nextNumber;
    
    this.showAnswerFeedback(isCorrect, () => {
      setTimeout(() => this.nextHighLowQuestion(), 1000);
    });
  }

  handleHighLowTimeout() {
    this.gameSession.questionTimes.push(3000);
    
    // Show the next number anyway
    const container = document.getElementById('game-container');
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'font-size: 36px; font-weight: bold; margin-top: 20px;';
    resultDiv.textContent = `次の数字: ${this.gameSession.nextNumber}`;
    container.appendChild(resultDiv);
    
    this.gameSession.currentNumber = this.gameSession.nextNumber;
    
    this.showAnswerFeedback(false, () => {
      setTimeout(() => this.nextHighLowQuestion(), 1000);
    });
  }

  // Game Helper Functions
  startQuestionTimer(seconds, onTimeout) {
    const timerElement = document.getElementById('question-timer');
    let timeLeft = seconds;
    
    const timer = setInterval(() => {
      timeLeft--;
      if (timerElement) {
        timerElement.textContent = timeLeft;
      }
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, 1000);
    
    // Store timer to clear if question is answered
    this.gameSession.currentTimer = timer;
  }

  updateGameScore() {
    document.getElementById('game-score').textContent = `${this.gameSession.score}pt`;
  }

  showAnswerFeedback(isCorrect, callback) {
    // Clear any running timer
    if (this.gameSession.currentTimer) {
      clearInterval(this.gameSession.currentTimer);
    }
    
    // Disable all options
    document.querySelectorAll('.game-option').forEach(option => {
      option.style.pointerEvents = 'none';
      if (isCorrect && option.dataset.answer === this.gameSession.correctAnswer.toString() ||
          option.dataset.choice === this.gameSession.correctAnswer ||
          option.dataset.number === this.gameSession.correctAnswer.toString()) {
        option.classList.add('correct');
      } else if (!isCorrect) {
        option.classList.add('incorrect');
      }
    });
    
    // Show feedback
    const container = document.getElementById('game-container');
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
      padding: 20px;
      border-radius: 10px;
      background: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'};
      color: white;
      z-index: 1000;
    `;
    feedback.textContent = isCorrect ? '正解！' : '不正解';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      document.body.removeChild(feedback);
      callback();
    }, 1000);
  }

  endGame() {
    const endTime = Date.now();
    const totalTime = endTime - this.gameSession.startTime;
    const averageTime = this.gameSession.questionTimes.length > 0 
      ? this.gameSession.questionTimes.reduce((a, b) => a + b, 0) / this.gameSession.questionTimes.length 
      : 0;
    
    // Calculate final score with bonuses
    let finalScore = this.gameSession.score;
    
    // Perfect game bonus
    if (this.gameSession.correctAnswers === this.gameSession.totalQuestions) {
      finalScore += 50;
    }
    
    // Speed bonus
    if (averageTime < 1000) {
      finalScore += 25;
    }
    
    this.gameSession.finalScore = finalScore;
    this.gameSession.totalTime = totalTime;
    this.gameSession.averageTime = averageTime;
    
    // Update user data
    this.updateUserStats();
    
    // Show results
    this.showGameResults();
  }

  updateUserStats() {
    const gameId = this.gameSession.gameId;
    
    // Update total points
    this.userData.totalPoints += this.gameSession.finalScore;
    
    // Update game-specific stats
    if (!this.userData.gameStats[gameId]) {
      this.userData.gameStats[gameId] = {
        playCount: 0,
        bestScore: 0,
        totalScore: 0,
        totalTime: 0
      };
    }
    
    const stats = this.userData.gameStats[gameId];
    stats.playCount++;
    stats.bestScore = Math.max(stats.bestScore, this.gameSession.finalScore);
    stats.totalScore += this.gameSession.finalScore;
    stats.totalTime += this.gameSession.totalTime;
    
    // Update daily progress
    if (!this.userData.dailyProgress.playedGames.includes(gameId)) {
      this.userData.dailyProgress.playedGames.push(gameId);
      this.userData.dailyProgress.gamesPlayed++;
    }
    this.userData.dailyProgress.pointsEarned += this.gameSession.finalScore;
    
    // Check for new badges
    this.checkForNewBadges();
    
    // Update last play date
    this.userData.lastPlayDate = this.getCurrentDateString();
    
    // Save data
    this.saveUserData();
  }

  checkForNewBadges() {
    const newBadges = [];
    
    // First play badge
    if (!this.userData.badges.includes('first-play') && 
        Object.values(this.userData.gameStats).some(stat => stat.playCount > 0)) {
      newBadges.push('first-play');
    }
    
    // Perfect score badge
    if (!this.userData.badges.includes('perfect-score') && 
        this.gameSession.correctAnswers === this.gameSession.totalQuestions) {
      newBadges.push('perfect-score');
    }
    
    // Speed master badge
    if (!this.userData.badges.includes('speed-master') && 
        this.gameSession.averageTime < 1000) {
      newBadges.push('speed-master');
    }
    
    // Point collector badge
    if (!this.userData.badges.includes('point-collector') && 
        this.userData.totalPoints >= 1000) {
      newBadges.push('point-collector');
    }
    
    // Streak badges
    if (!this.userData.badges.includes('streak-3') && 
        this.userData.currentStreak >= 3) {
      newBadges.push('streak-3');
    }
    
    if (!this.userData.badges.includes('streak-7') && 
        this.userData.currentStreak >= 7) {
      newBadges.push('streak-7');
    }
    
    this.userData.badges = [...this.userData.badges, ...newBadges];
    this.gameSession.newBadges = newBadges;
  }

  showGameResults() {
    this.showAppScreen('game-result');
    
    // Update result display
    document.getElementById('final-score').textContent = this.gameSession.finalScore;
    
    // Show details
    const accuracy = Math.round((this.gameSession.correctAnswers / this.gameSession.totalQuestions) * 100);
    const avgTime = Math.round(this.gameSession.averageTime / 1000 * 10) / 10;
    
    document.getElementById('result-details').innerHTML = `
      <div class="result-detail-item">
        <span>正解率</span>
        <span>${accuracy}%</span>
      </div>
      <div class="result-detail-item">
        <span>平均回答時間</span>
        <span>${avgTime}秒</span>
      </div>
      <div class="result-detail-item">
        <span>総回答数</span>
        <span>${this.gameSession.totalQuestions}問</span>
      </div>
      <div class="result-detail-item">
        <span>正解数</span>
        <span>${this.gameSession.correctAnswers}問</span>
      </div>
    `;
    
    // Show new badges
    if (this.gameSession.newBadges && this.gameSession.newBadges.length > 0) {
      const badgesContainer = document.getElementById('new-badges');
      badgesContainer.innerHTML = `
        <h3>新しいバッジを獲得！</h3>
        <div class="badge-list">
          ${this.gameSession.newBadges.map(badgeId => {
            const badge = this.gameData.badges.find(b => b.id === badgeId);
            return `
              <div class="badge-item new">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      document.getElementById('new-badges').innerHTML = '';
    }
    
    // Update result icon based on performance
    const resultIcon = document.getElementById('result-icon');
    if (accuracy === 100) {
      resultIcon.textContent = '🏆';
    } else if (accuracy >= 80) {
      resultIcon.textContent = '🎉';
    } else if (accuracy >= 60) {
      resultIcon.textContent = '👍';
    } else {
      resultIcon.textContent = '💪';
    }
  }

  // Stats Screen
  updateStatsScreen() {
    this.updateOverviewTab();
    this.updateGamesTab();
    this.updateProgressTab();
  }

  showStatsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      }
    });
    
    // Show tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Update chart if overview tab
    if (tabName === 'overview') {
      this.updatePointsChart();
    }
  }

  updateOverviewTab() {
    // Calculate stats
    const totalPlayTime = Object.values(this.userData.gameStats)
      .reduce((total, stat) => total + (stat.totalTime || 0), 0);
    const totalGames = Object.values(this.userData.gameStats)
      .reduce((total, stat) => total + stat.playCount, 0);
    const averageScore = totalGames > 0 
      ? Math.round(this.userData.totalPoints / totalGames) 
      : 0;
    const bestScore = Math.max(...Object.values(this.userData.gameStats)
      .map(stat => stat.bestScore), 0);
    
    document.getElementById('total-play-time').textContent = `${Math.round(totalPlayTime / 60000)}分`;
    document.getElementById('average-score').textContent = averageScore;
    document.getElementById('best-score').textContent = bestScore;
  }

  updatePointsChart() {
    const canvas = document.getElementById('points-chart');
    if (!canvas) return;
    
    // Generate sample weekly data
    const ctx = canvas.getContext('2d');
    const labels = ['月', '火', '水', '木', '金', '土', '日'];
    const data = Array.from({length: 7}, () => Math.floor(Math.random() * 100));
    
    // Destroy existing chart if any
    if (this.pointsChart) {
      this.pointsChart.destroy();
    }
    
    this.pointsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'ポイント',
          data: data,
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateGamesTab() {
    const container = document.getElementById('game-stats-list');
    container.innerHTML = this.gameData.games.map(game => {
      const stats = this.getUserGameStats(game.id);
      const avgScore = stats.playCount > 0 ? Math.round(stats.totalScore / stats.playCount) : 0;
      
      return `
        <div class="game-stat-item">
          <div class="game-stat-icon">${game.icon}</div>
          <div class="game-stat-info">
            <div class="game-stat-name">${game.name}</div>
            <div class="game-stat-details">
              <span>プレイ回数: ${stats.playCount}</span>
              <span>最高スコア: ${stats.bestScore}</span>
              <span>平均スコア: ${avgScore}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateProgressTab() {
    const container = document.getElementById('all-badges');
    container.innerHTML = this.gameData.badges.map(badge => {
      const earned = this.userData.badges.includes(badge.id);
      return `
        <div class="badge-item ${earned ? 'earned' : ''}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-description">${badge.description}</div>
        </div>
      `;
    }).join('');
  }

  // Settings Screen
  updateSettingsScreen() {
    // Load current settings
    const settings = this.userData.settings;
    document.getElementById('difficulty-setting').value = settings.difficulty;
    document.getElementById('sound-setting').checked = settings.sound;
    document.getElementById('reminder-setting').checked = settings.reminders;
    document.getElementById('reminder-time').value = settings.reminderTime;
  }

  exportUserData() {
    const dataStr = JSON.stringify(this.userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brain-training-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  resetUserData() {
    localStorage.removeItem('brainTrainingUserData');
    this.userData = this.getDefaultUserData();
    this.saveUserData();
    this.showAppScreen('dashboard');
    this.updateDashboard();
  }

  // User Data Management
  loadUserData() {
    const saved = localStorage.getItem('brainTrainingUserData');
    if (saved) {
      const userData = JSON.parse(saved);
      // Merge with defaults to handle new fields
      return { ...this.getDefaultUserData(), ...userData };
    }
    return this.getDefaultUserData();
  }

  getDefaultUserData() {
    return {
      hasSeenWelcome: false,
      totalPoints: 0,
      currentStreak: 0,
      lastPlayDate: null,
      badges: [],
      gameStats: {},
      dailyProgress: {
        date: this.getCurrentDateString(),
        gamesPlayed: 0,
        playedGames: [],
        pointsEarned: 0
      },
      settings: {
        difficulty: 'medium',
        sound: true,
        reminders: true,
        reminderTime: '19:00'
      }
    };
  }

  saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(this.userData));
  }

  updateDailyStreak() {
    const today = this.getCurrentDateString();
    const yesterday = this.getYesterdayString();
    
    // Reset daily progress if new day
    if (this.userData.dailyProgress.date !== today) {
      this.userData.dailyProgress = {
        date: today,
        gamesPlayed: 0,
        playedGames: [],
        pointsEarned: 0
      };
    }
    
    // Update streak
    if (this.userData.lastPlayDate === yesterday) {
      // Continue streak
    } else if (this.userData.lastPlayDate === today) {
      // Already played today
    } else {
      // Reset streak
      this.userData.currentStreak = 0;
    }
    
    // If playing for first time today, increment streak
    if (this.userData.lastPlayDate !== today && this.userData.dailyProgress.gamesPlayed === 0) {
      this.userData.currentStreak++;
    }
  }

  getCurrentLevel() {
    const points = this.userData.totalPoints;
    for (let i = this.gameData.levels.length - 1; i >= 0; i--) {
      if (points >= this.gameData.levels[i].requiredPoints) {
        return this.gameData.levels[i];
      }
    }
    return this.gameData.levels[0];
  }

  getCurrentDateString() {
    return new Date().toISOString().split('T')[0];
  }

  getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.brainTrainingApp = new BrainTrainingApp();
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}