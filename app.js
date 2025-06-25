// Brain Training PWA Application - Complete Version with 12 Games
class BrainTrainingApp {
    constructor() {
        this.currentScreen = 'loading';
        this.currentGame = null;
        this.gameSession = null;
        this.gameTimer = null;
        this.gameTimeouts = [];
        this.gameIntervals = [];
        this.userData = this.loadUserData();
        this.isInitialized = false;
        this.eventListeners = new Map(); // イベントリスナー管理用
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
                },
                {
                    id: "pattern-memory",
                    name: "パターン記憶",
                    description: "光る順番を覚えて再現しよう",
                    icon: "🔄",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["視覚記憶", "順序記憶", "注意力"]
                },
                {
                    id: "word-chain",
                    name: "単語チェーン",
                    description: "しりとりで語彙力を鍛えよう",
                    icon: "🔗",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["語彙力", "言語処理", "創造性"]
                },
                {
                    id: "reaction-time",
                    name: "反応時間テスト",
                    description: "色が変わったら素早くタップ",
                    icon: "⚡",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["反応速度", "注意力", "瞬発力"]
                },
                {
                    id: "visual-search",
                    name: "視覚探索",
                    description: "特定の文字を素早く見つけよう",
                    icon: "🔍",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["視覚的注意", "探索能力", "集中力"]
                },
                {
                    id: "dual-nback",
                    name: "デュアルNバック",
                    description: "位置と音の記憶を同時に追跡",
                    icon: "🧠",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["ワーキングメモリ", "注意分割", "認知制御"]
                },
                {
                    id: "card-memory",
                    name: "神経衰弱",
                    description: "同じカードのペアを見つけよう",
                    icon: "🃏",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["視覚記憶", "空間認知", "集中力"]
                },
                {
                    id: "sequence-copy",
                    name: "順番記憶",
                    description: "位置の順番を正確に覚えよう",
                    icon: "📍",
                    difficulty: ["初級", "中級", "上級"],
                    exercises: ["空間記憶", "順序記憶", "視覚的注意"]
                }
            ],
            levels: [
                {level: 1, name: "ビギナー", requiredPoints: 0, color: "#95a5a6"},
                {level: 2, name: "アマチュア", requiredPoints: 150, color: "#3498db"},
                {level: 3, name: "セミプロ", requiredPoints: 400, color: "#2ecc71"},
                {level: 4, name: "プロ", requiredPoints: 800, color: "#f39c12"},
                {level: 5, name: "エキスパート", requiredPoints: 1500, color: "#9b59b6"},
                {level: 6, name: "マスター", requiredPoints: 2500, color: "#e74c3c"},
                {level: 7, name: "グランドマスター", requiredPoints: 4000, color: "#1abc9c"}
            ],
            badges: [
                {id: "first-play", name: "初心者", description: "初回プレイ完了", icon: "🌟"},
                {id: "streak-3", name: "継続力", description: "3日連続プレイ", icon: "🔥"},
                {id: "streak-7", name: "習慣マスター", description: "7日連続プレイ", icon: "💎"},
                {id: "streak-30", name: "継続王", description: "30日連続プレイ", icon: "👑"},
                {id: "perfect-score", name: "パーフェクト", description: "ノーミスでセット完了", icon: "🏆"},
                {id: "speed-master", name: "スピードマスター", description: "平均回答時間1秒以下", icon: "⚡"},
                {id: "point-collector", name: "ポイントコレクター", description: "1000ポイント獲得", icon: "💰"},
                {id: "game-master", name: "ゲームマスター", description: "全ゲームをプレイ", icon: "🎮"},
                {id: "memory-king", name: "記憶王", description: "記憶系ゲームで高スコア", icon: "🧠"},
                {id: "speed-demon", name: "スピード魔", description: "反応速度ゲームで高スコア", icon: "🚀"}
            ]
        };
        this.init();
    }

    init() {
        console.log('BrainTrainingApp: Initializing...');
        try {
            this.registerServiceWorker();
            this.setupEventListeners();
            this.updateDailyStreak();
            
            setTimeout(() => {
                if (this.userData.hasSeenWelcome) {
                    this.showScreen('main-app');
                    this.showAppScreen('dashboard');
                } else {
                    this.showScreen('welcome');
                }
                this.isInitialized = true;
                console.log('BrainTrainingApp: Initialization complete');
            }, 1500);
        } catch (error) {
            console.error('BrainTrainingApp: Initialization failed:', error);
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
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
        
        if (!installPrompt) return;
        
        installPrompt.classList.remove('hidden');
        
        // 既存のリスナーを削除
        this.removeEventListener(installBtn, 'click');
        this.removeEventListener(dismissBtn, 'click');
        
        this.addEventListener(installBtn, 'click', async () => {
            try {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                installPrompt.classList.add('hidden');
                console.log('Install prompt result:', result.outcome);
            } catch (error) {
                console.error('Install prompt error:', error);
            }
        });
        
        this.addEventListener(dismissBtn, 'click', () => {
            installPrompt.classList.add('hidden');
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // ウェルカム画面
        const startBtn = document.getElementById('start-app-btn');
        if (startBtn) {
            this.addEventListener(startBtn, 'click', () => {
                this.userData.hasSeenWelcome = true;
                this.saveUserData();
                this.showScreen('main-app');
                this.showAppScreen('dashboard');
            });
        }

        // ナビゲーション
        document.querySelectorAll('.nav-item').forEach(item => {
            this.addEventListener(item, 'click', (e) => {
                const screen = e.target.closest('.nav-item').dataset.screen;
                if (screen) {
                    this.showAppScreen(screen);
                    this.updateNavigation(screen);
                }
            });
        });

        // ゲームカードのクリック（委譲イベント）
        this.addEventListener(document, 'click', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard && gameCard.dataset.gameId) {
                const gameId = gameCard.dataset.gameId;
                console.log('Starting game:', gameId);
                this.startGame(gameId);
            }
        });

        // 戻るボタン
        const backBtn = document.getElementById('back-to-games');
        if (backBtn) {
            this.addEventListener(backBtn, 'click', () => {
                console.log('Back button clicked');
                this.stopCurrentGame();
                this.showAppScreen('games');
            });
        }

        // ゲーム結果ボタン（委譲イベント）
        this.addEventListener(document, 'click', (e) => {
            if (e.target.id === 'play-again-btn') {
                if (this.currentGame) {
                    console.log('Play again:', this.currentGame.id);
                    this.startGame(this.currentGame.id);
                }
            }
            if (e.target.id === 'continue-btn') {
                this.showAppScreen('dashboard');
            }
        });

        // 統計タブ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.showStatsTab(tab);
                }
            });
        });

        // 設定
        this.setupSettingsListeners();
        
        console.log('Event listeners setup complete');
    }

    setupSettingsListeners() {
        const difficultySettings = document.getElementById('difficulty-setting');
        if (difficultySettings) {
            this.addEventListener(difficultySettings, 'change', (e) => {
                this.userData.settings.difficulty = e.target.value;
                this.saveUserData();
            });
        }

        const soundSettings = document.getElementById('sound-setting');
        if (soundSettings) {
            this.addEventListener(soundSettings, 'change', (e) => {
                this.userData.settings.sound = e.target.checked;
                this.saveUserData();
            });
        }

        const reminderSettings = document.getElementById('reminder-setting');
        if (reminderSettings) {
            this.addEventListener(reminderSettings, 'change', (e) => {
                this.userData.settings.reminders = e.target.checked;
                this.saveUserData();
            });
        }

        const reminderTime = document.getElementById('reminder-time');
        if (reminderTime) {
            this.addEventListener(reminderTime, 'change', (e) => {
                this.userData.settings.reminderTime = e.target.value;
                this.saveUserData();
            });
        }

        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            this.addEventListener(exportBtn, 'click', () => {
                this.exportUserData();
            });
        }

        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            this.addEventListener(resetBtn, 'click', () => {
                if (confirm('本当にすべてのデータをリセットしますか？この操作は取り消せません。')) {
                    this.resetUserData();
                }
            });
        }
    }

    // イベントリスナー管理用ヘルパーメソッド
    addEventListener(element, event, handler) {
        if (!element) return;
        
        const key = `${element.id || 'anonymous'}_${event}`;
        
        // 既存のリスナーを削除
        if (this.eventListeners.has(key)) {
            const oldHandler = this.eventListeners.get(key);
            element.removeEventListener(event, oldHandler);
        }
        
        // 新しいリスナーを追加
        element.addEventListener(event, handler);
        this.eventListeners.set(key, handler);
    }

    removeEventListener(element, event) {
        if (!element) return;
        
        const key = `${element.id || 'anonymous'}_${event}`;
        if (this.eventListeners.has(key)) {
            const handler = this.eventListeners.get(key);
            element.removeEventListener(event, handler);
            this.eventListeners.delete(key);
        }
    }

    stopCurrentGame() {
        console.log('Stopping current game...');
        
        // タイマーとインターバルをクリア
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.gameTimeouts.forEach(timeout => {
            clearTimeout(timeout);
        });
        this.gameTimeouts = [];
        
        this.gameIntervals.forEach(interval => {
            clearInterval(interval);
        });
        this.gameIntervals = [];
        
        // ゲームセッションをクリア
        this.gameSession = null;
        this.currentGame = null;
        
        // ゲーム画面の要素をクリア
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.innerHTML = '';
        }
        
        console.log('Game stopped successfully');
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        
        try {
            // 全ての画面を非表示
            document.querySelectorAll('.screen, #main-app').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // 指定された画面を表示
            if (screenId === 'main-app') {
                const mainApp = document.getElementById('main-app');
                if (mainApp) {
                    mainApp.classList.remove('hidden');
                }
            } else {
                const screen = document.getElementById(screenId + '-screen');
                if (screen) {
                    screen.classList.remove('hidden');
                }
            }
            
            this.currentScreen = screenId;
        } catch (error) {
            console.error('Error showing screen:', error);
        }
    }

    showAppScreen(screenId) {
        console.log('Showing app screen:', screenId);
        
        try {
            // 全てのアプリ画面を非表示
            document.querySelectorAll('.app-screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // 指定された画面を表示
            const screen = document.getElementById(screenId + '-screen');
            if (screen) {
                screen.classList.remove('hidden');
            }

            // 画面に応じて更新処理を実行
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
        } catch (error) {
            console.error('Error showing app screen:', error);
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

    updateDashboard() {
        console.log('Updating dashboard...');
        
        try {
            // 現在の日付を表示
            const now = new Date();
            const dateElement = document.getElementById('current-date');
            if (dateElement) {
                dateElement.textContent = now.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });
            }

            // 統計情報を更新
            const dailyGoalElement = document.getElementById('daily-goal-progress');
            if (dailyGoalElement) {
                dailyGoalElement.textContent = `${this.userData.dailyProgress.gamesPlayed}/5`;
            }

            const totalPointsElement = document.getElementById('total-points');
            if (totalPointsElement) {
                totalPointsElement.textContent = this.userData.totalPoints.toLocaleString();
            }

            const currentLevelElement = document.getElementById('current-level');
            if (currentLevelElement) {
                currentLevelElement.textContent = this.getCurrentLevel().level;
            }

            const streakElement = document.getElementById('streak-count');
            if (streakElement) {
                streakElement.textContent = this.userData.currentStreak;
            }

            // プログレスバーを更新
            const progress = Math.min(100, (this.userData.dailyProgress.gamesPlayed / 5) * 100);
            const progressBar = document.getElementById('daily-progress');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }

            // おすすめゲームとバッジを更新
            this.updateRecommendedGames();
            this.updateRecentBadges();
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    updateRecommendedGames() {
        const container = document.getElementById('recommended-games');
        if (!container) return;
        
        try {
            const recommendedGames = this.getRecommendedGames();
            container.innerHTML = recommendedGames.map(game => `
                <div class="game-card" data-game-id="${game.id}">
                    <div class="game-icon">${game.icon}</div>
                    <div class="game-name">${game.name}</div>
                    <div class="game-description">${game.description}</div>
                    <div class="game-exercises">
                        ${game.exercises.map(exercise => `<span class="exercise-tag">${exercise}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error updating recommended games:', error);
        }
    }

    updateRecentBadges() {
        const container = document.getElementById('recent-badges');
        if (!container) return;
        
        try {
            const recentBadges = this.userData.badges.slice(-3);
            
            if (recentBadges.length === 0) {
                container.innerHTML = '<p class="text-secondary">まだバッジがありません。ゲームをプレイして最初のバッジを獲得しましょう！</p>';
                return;
            }

            const badgeList = container.querySelector('.badge-list');
            if (badgeList) {
                badgeList.innerHTML = recentBadges.map(badgeId => {
                    const badge = this.gameData.badges.find(b => b.id === badgeId);
                    if (!badge) return '';
                    return `
                        <div class="badge-item earned">
                            <div class="badge-icon">${badge.icon}</div>
                            <div class="badge-name">${badge.name}</div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error updating recent badges:', error);
        }
    }
    // === ゲーム開始・画面管理メソッド ===
    
    startGame(gameId) {
        console.log(`Starting game: ${gameId}`);
        
        try {
            const game = this.gameData.games.find(g => g.id === gameId);
            if (!game) {
                console.error(`Game not found: ${gameId}`);
                return;
            }

            this.stopCurrentGame();
            this.currentGame = game;
            this.gameSession = this.createGameSession(game);
            
            this.showScreen('main-app');
            this.showGameScreen();
            this.runGame();
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    createGameSession(game) {
        return {
            gameId: game.id,
            startTime: Date.now(),
            score: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            responses: [],
            difficulty: this.userData.settings.difficulty
        };
    }

    showGameScreen() {
        console.log('Showing game screen');
        
        try {
            document.querySelectorAll('.app-screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.classList.remove('hidden');
            }
            
            const gameTitle = document.querySelector('.game-title');
            if (gameTitle) {
                gameTitle.textContent = this.currentGame.name;
            }
            
            this.updateGameStats();
        } catch (error) {
            console.error('Error showing game screen:', error);
        }
    }

    updateGameStats() {
        const scoreElement = document.getElementById('game-score');
        const timeElement = document.getElementById('game-time');
        
        if (scoreElement && this.gameSession) {
            scoreElement.textContent = `${this.gameSession.score}pt`;
        }
        
        if (timeElement && this.gameSession) {
            const elapsed = Math.floor((Date.now() - this.gameSession.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    runGame() {
        if (!this.gameSession) return;
        
        console.log(`Running game: ${this.currentGame.id}`);
        
        this.gameTimer = setInterval(() => {
            this.updateGameStats();
        }, 1000);
        
        switch (this.currentGame.id) {
            case 'janken':
                this.runJankenGame();
                break;
            case 'color-match':
                this.runColorMatchGame();
                break;
            case 'number-memory':
                this.runNumberMemoryGame();
                break;
            case 'calc-quick':
                this.runCalcQuickGame();
                break;
            case 'high-low':
                this.runHighLowGame();
                break;
            case 'pattern-memory':
                this.runPatternMemoryGame();
                break;
            case 'word-chain':
                this.runWordChainGame();
                break;
            case 'reaction-time':
                this.runReactionTimeGame();
                break;
            case 'visual-search':
                this.runVisualSearchGame();
                break;
            case 'dual-nback':
                this.runDualNBackGame();
                break;
            case 'card-memory':
                this.runCardMemoryGame();
                break;
            case 'sequence-copy':
                this.runSequenceCopyGame();
                break;
            default:
                console.error(`Unknown game: ${this.currentGame.id}`);
        }
    }

    // === 既存ゲーム実装 ===

    runJankenGame() {
        const container = document.querySelector('.game-container');
        const instructions = ['勝ってください', '負けてください', '引き分けにしてください'];
        const choices = ['グー', 'チョキ', 'パー'];
        const choiceIcons = ['✊', '✌️', '✋'];
        
        let currentRound = 0;
        const totalRounds = 10;
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const computerChoice = Math.floor(Math.random() * 3);
            const instruction = instructions[Math.floor(Math.random() * instructions.length)];
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">${instruction}</div>
                    <div class="computer-choice">
                        <div style="font-size: 4rem; margin: 20px 0;">${choiceIcons[computerChoice]}</div>
                        <div>コンピュータ: ${choices[computerChoice]}</div>
                    </div>
                </div>
                <div class="game-options">
                    ${choices.map((choice, index) => `
                        <button class="game-option" data-choice="${index}">
                            <div style="font-size: 2rem;">${choiceIcons[index]}</div>
                            <div>${choice}</div>
                        </button>
                    `).join('')}
                </div>
            `;
            
            container.querySelectorAll('.game-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const playerChoice = parseInt(e.currentTarget.dataset.choice);
                    this.checkJankenAnswer(playerChoice, computerChoice, instruction, nextRound);
                });
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    checkJankenAnswer(player, computer, instruction, callback) {
        const result = this.getJankenResult(player, computer);
        let correct = false;
        
        if (instruction === '勝ってください' && result === 'win') correct = true;
        if (instruction === '負けてください' && result === 'lose') correct = true;
        if (instruction === '引き分けにしてください' && result === 'draw') correct = true;
        
        this.recordAnswer(correct);
        
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.disabled = true;
            if (parseInt(option.dataset.choice) === player) {
                option.classList.add(correct ? 'correct' : 'incorrect');
            }
        });
        
        const timeout = setTimeout(() => {
            callback();
        }, 1500);
        this.gameTimeouts.push(timeout);
    }

    getJankenResult(player, computer) {
        if (player === computer) return 'draw';
        if ((player === 0 && computer === 1) || 
            (player === 1 && computer === 2) || 
            (player === 2 && computer === 0)) {
            return 'win';
        }
        return 'lose';
    }

    runColorMatchGame() {
        const container = document.querySelector('.game-container');
        const colors = ['赤', '青', '緑', '黄'];
        const colorCodes = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
        
        let currentRound = 0;
        const totalRounds = 15;
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const textColor = Math.floor(Math.random() * colors.length);
            const displayColor = Math.floor(Math.random() * colors.length);
            const isMatch = textColor === displayColor;
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">文字の色と意味が同じですか?</div>
                    <div style="font-size: 3rem; margin: 30px 0; color: ${colorCodes[displayColor]}; font-weight: bold;">
                        ${colors[textColor]}
                    </div>
                </div>
                <div class="game-options">
                    <button class="game-option" data-answer="true">同じ</button>
                    <button class="game-option" data-answer="false">違う</button>
                </div>
            `;
            
            container.querySelectorAll('.game-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const answer = e.currentTarget.dataset.answer === 'true';
                    this.checkColorMatchAnswer(answer, isMatch, nextRound);
                });
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    checkColorMatchAnswer(answer, correct, callback) {
        const isCorrect = answer === correct;
        this.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.disabled = true;
            if ((option.dataset.answer === 'true') === answer) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        const timeout = setTimeout(() => {
            callback();
        }, 1000);
        this.gameTimeouts.push(timeout);
    }

    runNumberMemoryGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 8;
        const sequence = [];
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            sequence.push(Math.floor(Math.random() * 9) + 1);
            
            this.showNumberSequence(sequence, () => {
                this.collectNumberInput(sequence, nextRound);
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    showNumberSequence(sequence, callback) {
        const container = document.querySelector('.game-container');
        container.innerHTML = `
            <div class="game-question">
                <h2>数字を覚えてください</h2>
                <div class="game-instruction">順番を覚えて、後で同じ順番で選択してください</div>
                <div class="number-display" style="font-size: 4rem; margin: 40px 0; min-height: 100px; display: flex; align-items: center; justify-content: center; color: var(--color-text); background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-base); padding: 20px;">
                    準備してください...
                </div>
            </div>
        `;
        
        let index = 0;
        const display = container.querySelector('.number-display');
        
        const showNext = () => {
            if (index < sequence.length) {
                display.textContent = sequence[index];
                index++;
                const timeout = setTimeout(showNext, 1000);
                this.gameTimeouts.push(timeout);
            } else {
                display.textContent = '入力してください';
                const timeout = setTimeout(callback, 500);
                this.gameTimeouts.push(timeout);
            }
        };
        
        const timeout = setTimeout(showNext, 1000);
        this.gameTimeouts.push(timeout);
    }

    collectNumberInput(sequence, callback) {
        const container = document.querySelector('.game-container');
        let inputSequence = [];
        
        container.innerHTML = `
            <div class="game-question">
                <h2>順番に選択してください</h2>
                <div class="input-display" style="font-size: 2rem; margin: 20px 0; min-height: 60px; color: var(--color-text); background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-base); padding: 16px;">
                    数字を選択してください
                </div>
            </div>
            <div class="number-grid">
                ${Array.from({length: 9}, (_, i) => `
                    <button class="number-cell" data-number="${i + 1}">${i + 1}</button>
                `).join('')}
            </div>
        `;
        
        const updateDisplay = () => {
            const display = container.querySelector('.input-display');
            display.textContent = inputSequence.join(' → ') || '数字を選択してください';
        };
        
        container.querySelectorAll('.number-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                inputSequence.push(number);
                updateDisplay();
                
                if (inputSequence.length === sequence.length) {
                    this.checkNumberSequence(inputSequence, sequence, callback);
                }
            });
        });
    }

    checkNumberSequence(input, correct, callback) {
        const isCorrect = JSON.stringify(input) === JSON.stringify(correct);
        this.recordAnswer(isCorrect);
        
        const timeout = setTimeout(() => {
            callback();
        }, 1500);
        this.gameTimeouts.push(timeout);
    }

    runCalcQuickGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 15;
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const operations = ['+', '-', '×'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            
            let correctAnswer;
            let question;
            
            switch (op) {
                case '+':
                    correctAnswer = a + b;
                    question = `${a} + ${b}`;
                    break;
                case '-':
                    correctAnswer = Math.abs(a - b);
                    question = `${Math.max(a, b)} - ${Math.min(a, b)}`;
                    break;
                case '×':
                    const smallA = Math.floor(Math.random() * 10) + 1;
                    const smallB = Math.floor(Math.random() * 10) + 1;
                    correctAnswer = smallA * smallB;
                    question = `${smallA} × ${smallB}`;
                    break;
            }
            
            const options = [correctAnswer];
            while (options.length < 4) {
                const wrong = correctAnswer + (Math.floor(Math.random() * 10) - 5);
                if (wrong > 0 && !options.includes(wrong)) {
                    options.push(wrong);
                }
            }
            
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">計算結果を選択してください</div>
                    <div style="font-size: 3rem; margin: 30px 0; font-weight: bold; color: var(--color-text);">
                        ${question} = ?
                    </div>
                </div>
                <div class="game-options">
                    ${options.map(option => `
                        <button class="game-option" data-answer="${option}">${option}</button>
                    `).join('')}
                </div>
            `;
            
            container.querySelectorAll('.game-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const answer = parseInt(e.currentTarget.dataset.answer);
                    this.checkCalcAnswer(answer, correctAnswer, nextRound);
                });
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    checkCalcAnswer(answer, correct, callback) {
        const isCorrect = answer === correct;
        this.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.disabled = true;
            if (parseInt(option.dataset.answer) === answer) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        const timeout = setTimeout(() => {
            callback();
        }, 1000);
        this.gameTimeouts.push(timeout);
    }

    runHighLowGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 12;
        let previousNumber = Math.floor(Math.random() * 100) + 1;
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const currentNumber = Math.floor(Math.random() * 100) + 1;
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">次の数字は前の数字より高いか低いか?</div>
                    <div style="margin: 20px 0;">
                        <div style="font-size: 2rem; color: var(--color-text-secondary);">前の数字: ${previousNumber}</div>
                        <div style="font-size: 4rem; margin: 20px 0; font-weight: bold; color: var(--color-primary);">?</div>
                    </div>
                </div>
                <div class="game-options">
                    <button class="game-option" data-answer="high">高い</button>
                    <button class="game-option" data-answer="low">低い</button>
                </div>
            `;
            
            container.querySelectorAll('.game-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const answer = e.currentTarget.dataset.answer;
                    this.checkHighLowAnswer(answer, currentNumber, previousNumber, () => {
                        previousNumber = currentNumber;
                        nextRound();
                    });
                });
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    checkHighLowAnswer(answer, current, previous, callback) {
        const isHigher = current > previous;
        const isCorrect = (answer === 'high' && isHigher) || (answer === 'low' && !isHigher);
        
        this.recordAnswer(isCorrect);
        
        const questionArea = document.querySelector('.game-question');
        questionArea.querySelector('div[style*="font-size: 4rem"]').textContent = current;
        
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.disabled = true;
            if (option.dataset.answer === answer) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        const timeout = setTimeout(() => {
            callback();
        }, 1500);
        this.gameTimeouts.push(timeout);
    }

    // === 新規ゲーム実装 ===

    runPatternMemoryGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 8;
        const sequence = [];
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            sequence.push(Math.floor(Math.random() * 9));
            this.showPatternSequence(sequence, () => {
                this.collectPatternInput(sequence, nextRound);
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    showPatternSequence(sequence, callback) {
        const container = document.querySelector('.game-container');
        container.innerHTML = `
            <div class="game-question">
                <h2>パターンを覚えてください</h2>
                <div class="game-instruction">光る順番を覚えて、後で同じ順番で選択してください</div>
            </div>
            <div class="pattern-grid">
                ${Array.from({length: 9}, (_, i) => `
                    <button class="pattern-cell" data-index="${i}" style="background-color: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-base); width: 60px; height: 60px; margin: 4px;"></button>
                `).join('')}
            </div>
        `;
        
        let index = 0;
        
        const showNext = () => {
            if (index < sequence.length) {
                const cells = container.querySelectorAll('.pattern-cell');
                const currentCell = cells[sequence[index]];
                
                currentCell.style.backgroundColor = 'var(--color-primary)';
                
                const timeout1 = setTimeout(() => {
                    currentCell.style.backgroundColor = 'var(--color-surface)';
                    index++;
                    const timeout2 = setTimeout(showNext, 200);
                    this.gameTimeouts.push(timeout2);
                }, 600);
                this.gameTimeouts.push(timeout1);
            } else {
                const timeout = setTimeout(callback, 1000);
                this.gameTimeouts.push(timeout);
            }
        };
        
        const timeout = setTimeout(showNext, 1000);
        this.gameTimeouts.push(timeout);
    }

    collectPatternInput(sequence, callback) {
        const container = document.querySelector('.game-container');
        let inputSequence = [];
        
        container.innerHTML = `
            <div class="game-question">
                <h2>順番に選択してください</h2>
                <div class="game-instruction">覚えた順番で選択してください</div>
            </div>
            <div class="pattern-grid">
                ${Array.from({length: 9}, (_, i) => `
                    <button class="pattern-cell" data-index="${i}" style="background-color: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-base); width: 60px; height: 60px; margin: 4px; cursor: pointer;"></button>
                `).join('')}
            </div>
        `;
        
        container.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                inputSequence.push(index);
                
                e.target.style.backgroundColor = 'var(--color-success)';
                e.target.disabled = true;
                
                if (inputSequence.length === sequence.length) {
                    this.checkPatternSequence(inputSequence, sequence, callback);
                }
            });
        });
    }

    checkPatternSequence(input, correct, callback) {
        const isCorrect = JSON.stringify(input) === JSON.stringify(correct);
        this.recordAnswer(isCorrect);
        
        const timeout = setTimeout(() => {
            callback();
        }, 1500);
        this.gameTimeouts.push(timeout);
    }

    runReactionTimeGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 10;
        const reactionTimes = [];
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">赤い画面が緑に変わったらすぐにタップ！</div>
                    <div class="reaction-area" style="width: 200px; height: 200px; background-color: #e74c3c; margin: 20px auto; border-radius: var(--radius-base); cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                        待機中...
                    </div>
                </div>
            `;
            
            const reactionArea = container.querySelector('.reaction-area');
            const delay = Math.random() * 3000 + 1000; // 1-4秒の間隔
            let startTime;
            let clicked = false;
            
            const timeout = setTimeout(() => {
                reactionArea.style.backgroundColor = '#2ecc71';
                reactionArea.textContent = 'タップ！';
                startTime = Date.now();
            }, delay);
            this.gameTimeouts.push(timeout);
            
            reactionArea.addEventListener('click', () => {
                if (!startTime || clicked) return;
                
                clicked = true;
                const reactionTime = Date.now() - startTime;
                reactionTimes.push(reactionTime);
                
                this.recordAnswer(reactionTime < 1000); // 1秒以内なら正解
                
                reactionArea.style.backgroundColor = '#3498db';
                reactionArea.textContent = `${reactionTime}ms`;
                
                const timeout2 = setTimeout(() => {
                    currentRound++;
                    nextRound();
                }, 1500);
                this.gameTimeouts.push(timeout2);
            });
        };
        
        nextRound();
    }

    runVisualSearchGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 12;
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const targetChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
            const gridSize = 6;
            const totalCells = gridSize * gridSize;
            const targetCount = Math.floor(Math.random() * 3) + 1; // 1-3個
            
            const grid = Array(totalCells).fill().map(() => 
                String.fromCharCode(65 + Math.floor(Math.random() * 26))
            );
            
            // ターゲット文字を配置
            for (let i = 0; i < targetCount; i++) {
                let pos;
                do {
                    pos = Math.floor(Math.random() * totalCells);
                } while (grid[pos] === targetChar);
                grid[pos] = targetChar;
            }
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">「${targetChar}」を${targetCount}個見つけてタップしてください</div>
                    <div class="found-counter" style="margin: 10px 0; color: var(--color-text);">見つけた数: <span id="found-count">0</span>/${targetCount}</div>
                </div>
                <div class="search-grid" style="display: grid; grid-template-columns: repeat(${gridSize}, 1fr); gap: 4px; max-width: 300px; margin: 0 auto;">
                    ${grid.map((char, index) => `
                        <button class="search-cell" data-char="${char}" data-index="${index}" style="aspect-ratio: 1; background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 16px; font-weight: bold; color: var(--color-text); cursor: pointer;">
                            ${char}
                        </button>
                    `).join('')}
                </div>
            `;
            
            let foundCount = 0;
            const foundCounter = container.querySelector('#found-count');
            
            container.querySelectorAll('.search-cell').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    const char = e.target.dataset.char;
                    
                    if (char === targetChar && !e.target.classList.contains('found')) {
                        e.target.classList.add('found');
                        e.target.style.backgroundColor = 'var(--color-success)';
                        e.target.style.color = 'white';
                        foundCount++;
                        foundCounter.textContent = foundCount;
                        
                        if (foundCount === targetCount) {
                            this.recordAnswer(true);
                            const timeout = setTimeout(() => {
                                currentRound++;
                                nextRound();
                            }, 1000);
                            this.gameTimeouts.push(timeout);
                        }
                    } else if (char !== targetChar) {
                        e.target.style.backgroundColor = 'var(--color-error)';
                        e.target.style.color = 'white';
                        this.recordAnswer(false);
                        
                        const timeout = setTimeout(() => {
                            currentRound++;
                            nextRound();
                        }, 1000);
                        this.gameTimeouts.push(timeout);
                    }
                });
            });
        };
        
        nextRound();
    }

    recordAnswer(correct) {
        if (!this.gameSession) return;
        
        this.gameSession.totalQuestions++;
        if (correct) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += 10;
        }
        
        this.gameSession.responses.push({
            correct,
            timestamp: Date.now()
        });
    }

    endGame() {
        if (!this.gameSession) return;
        
        console.log('Ending game...');
        this.stopCurrentGame();
        
        const duration = Date.now() - this.gameSession.startTime;
        const accuracy = this.gameSession.totalQuestions > 0 ? 
            Math.round((this.gameSession.correctAnswers / this.gameSession.totalQuestions) * 100) : 0;
        
        this.updateUserProgress(this.gameSession);
        
        this.showGameResults({
            score: this.gameSession.score,
            accuracy,
            duration,
            correctAnswers: this.gameSession.correctAnswers,
            totalQuestions: this.gameSession.totalQuestions
        });
    }

    showGameResults(results) {
        const container = document.querySelector('.game-container');
        const minutes = Math.floor(results.duration / 60000);
        const seconds = Math.floor((results.duration % 60000) / 1000);
        
        container.innerHTML = `
            <div class="result-container">
                <div class="result-icon">${results.accuracy >= 80 ? '🏆' : results.accuracy >= 60 ? '👍' : '💪'}</div>
                <h2>ゲーム完了！</h2>
                <div class="result-score">
                    <span class="score-label">獲得スコア</span>
                    <span class="score-value">${results.score}</span>
                </div>
                <div class="result-details">
                    <div class="result-detail-item">
                        <span>正解率</span>
                        <span>${results.accuracy}%</span>
                    </div>
                    <div class="result-detail-item">
                        <span>正解数</span>
                        <span>${results.correctAnswers}/${results.totalQuestions}</span>
                    </div>
                    <div class="result-detail-item">
                        <span>プレイ時間</span>
                        <span>${minutes}分${seconds}秒</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button id="play-again-btn" class="btn btn--primary">もう一度</button>
                    <button id="continue-btn" class="btn btn--secondary">続ける</button>
                </div>
            </div>
        `;
    }

    updateUserProgress(session) {
        this.userData.totalPoints += session.score;
        this.userData.dailyProgress.gamesPlayed++;
        this.userData.dailyProgress.pointsEarned += session.score;
        
        if (!this.userData.gameStats[session.gameId]) {
            this.userData.gameStats[session.gameId] = {
                timesPlayed: 0,
                totalScore: 0,
                bestScore: 0,
                totalTime: 0
            };
        }
        
        const gameStats = this.userData.gameStats[session.gameId];
        gameStats.timesPlayed++;
        gameStats.totalScore += session.score;
        gameStats.bestScore = Math.max(gameStats.bestScore, session.score);
        gameStats.totalTime += Date.now() - session.startTime;
        
        this.checkForNewBadges();
        this.saveUserData();
    }
    // === 残りの新規ゲーム実装 ===

    runWordChainGame() {
        const container = document.querySelector('.game-container');
        const words = [
            'りんご', 'ごりら', 'らっぱ', 'ぱんだ', 'だいこん', 'んじゃめな',
            'ねこ', 'こいぬ', 'ぬいぐるみ', 'みかん', 'んどう', 'うみ',
            'いるか', 'かめ', 'めだか', 'かに', 'にわとり', 'りす',
            'すいか', 'かき', 'きつね', 'ねずみ', 'みつばち', 'ちょう',
            'うさぎ', 'ぎんなん', 'んご', 'ごま', 'まつ', 'つき'
        ];
        
        let currentRound = 0;
        const totalRounds = 10;
        let lastWord = '';
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            if (currentRound === 0) {
                lastWord = words[Math.floor(Math.random() * words.length)];
            }
            
            const lastChar = lastWord.slice(-1);
            const validWords = words.filter(word => 
                word.startsWith(lastChar) && word !== lastWord
            );
            
            if (validWords.length === 0) {
                this.endGame();
                return;
            }
            
            const correctWord = validWords[Math.floor(Math.random() * validWords.length)];
            const wrongWords = words.filter(word => 
                !word.startsWith(lastChar) && word !== lastWord
            ).slice(0, 3);
            
            const options = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>第${currentRound + 1}問</h2>
                    <div class="game-instruction">「${lastWord}」に続く言葉を選んでください</div>
                    <div style="font-size: 2rem; margin: 20px 0; color: var(--color-primary); font-weight: bold;">
                        ${lastWord} → ?
                    </div>
                </div>
                <div class="game-options">
                    ${options.map(word => `
                        <button class="game-option" data-word="${word}">${word}</button>
                    `).join('')}
                </div>
            `;
            
            container.querySelectorAll('.game-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const selectedWord = e.currentTarget.dataset.word;
                    this.checkWordChainAnswer(selectedWord, correctWord, () => {
                        lastWord = correctWord;
                        currentRound++;
                        nextRound();
                    });
                });
            });
        };
        
        nextRound();
    }

    checkWordChainAnswer(selected, correct, callback) {
        const isCorrect = selected === correct;
        this.recordAnswer(isCorrect);
        
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.disabled = true;
            if (option.dataset.word === selected) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (option.dataset.word === correct) {
                option.classList.add('correct');
            }
        });
        
        const timeout = setTimeout(() => {
            callback();
        }, 2000);
        this.gameTimeouts.push(timeout);
    }

    runDualNBackGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 20;
        const nBack = 2; // 2-back task
        const sequence = [];
        const positions = [];
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            const currentPosition = Math.floor(Math.random() * 9);
            const currentLetter = String.fromCharCode(65 + Math.floor(Math.random() * 8)); // A-H
            
            sequence.push(currentLetter);
            positions.push(currentPosition);
            
            container.innerHTML = `
                <div class="game-question">
                    <h2>デュアルNバック 第${currentRound + 1}問</h2>
                    <div class="game-instruction">${nBack}つ前と同じ位置・文字なら該当ボタンを押してください</div>
                    <div class="nback-display" style="font-size: 3rem; margin: 20px 0; color: var(--color-primary); font-weight: bold;">
                        ${currentLetter}
                    </div>
                </div>
                <div class="nback-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 200px; margin: 0 auto 20px;">
                    ${Array.from({length: 9}, (_, i) => `
                        <div class="nback-cell ${i === currentPosition ? 'active' : ''}" style="aspect-ratio: 1; background-color: ${i === currentPosition ? 'var(--color-primary)' : 'var(--color-surface)'}; border: 2px solid var(--color-border); border-radius: var(--radius-base);"></div>
                    `).join('')}
                </div>
                <div class="nback-buttons" style="display: flex; gap: 16px; justify-content: center;">
                    <button class="nback-btn" data-type="position">位置一致</button>
                    <button class="nback-btn" data-type="letter">文字一致</button>
                    <button class="nback-btn" data-type="none">一致なし</button>
                </div>
            `;
            
            if (currentRound >= nBack) {
                const isPositionMatch = positions[currentRound] === positions[currentRound - nBack];
                const isLetterMatch = sequence[currentRound] === sequence[currentRound - nBack];
                
                container.querySelectorAll('.nback-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const type = e.currentTarget.dataset.type;
                        this.checkDualNBackAnswer(type, isPositionMatch, isLetterMatch, () => {
                            currentRound++;
                            const timeout = setTimeout(nextRound, 500);
                            this.gameTimeouts.push(timeout);
                        });
                    });
                });
            } else {
                const timeout = setTimeout(() => {
                    currentRound++;
                    nextRound();
                }, 2000);
                this.gameTimeouts.push(timeout);
            }
        };
        
        nextRound();
    }

    checkDualNBackAnswer(userAnswer, isPositionMatch, isLetterMatch, callback) {
        let isCorrect = false;
        
        if (userAnswer === 'position' && isPositionMatch && !isLetterMatch) isCorrect = true;
        if (userAnswer === 'letter' && isLetterMatch && !isPositionMatch) isCorrect = true;
        if (userAnswer === 'none' && !isPositionMatch && !isLetterMatch) isCorrect = true;
        
        this.recordAnswer(isCorrect);
        
        const buttons = document.querySelectorAll('.nback-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.type === userAnswer) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
        
        callback();
    }

    runCardMemoryGame() {
        const container = document.querySelector('.game-container');
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8'];
        const pairs = 8;
        
        // カードペアを生成
        const cards = [];
        for (let i = 0; i < pairs; i++) {
            const suit = suits[i % 4];
            const value = values[i % 8];
            cards.push({ id: i, suit, value, matched: false });
            cards.push({ id: i, suit, value, matched: false });
        }
        
        // シャッフル
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        let flippedCards = [];
        let matchedPairs = 0;
        
        container.innerHTML = `
            <div class="game-question">
                <h2>神経衰弱</h2>
                <div class="game-instruction">同じカードのペアを見つけてください</div>
                <div class="match-counter" style="margin: 10px 0; color: var(--color-text);">
                    ペア数: ${matchedPairs}/${pairs}
                </div>
            </div>
            <div class="card-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-width: 320px; margin: 0 auto;">
                ${cards.map((card, index) => `
                    <div class="memory-card" data-index="${index}" data-id="${card.id}" style="aspect-ratio: 0.7; background-color: var(--color-primary); border: 2px solid var(--color-border); border-radius: var(--radius-base); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: white;">
                        ?
                    </div>
                `).join('')}
            </div>
        `;
        
        const cardElements = container.querySelectorAll('.memory-card');
        
        cardElements.forEach(cardEl => {
            cardEl.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const card = cards[index];
                
                if (flippedCards.length >= 2 || card.matched || flippedCards.includes(index)) {
                    return;
                }
                
                // カードを表示
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.color = card.suit === '♥' || card.suit === '♦' ? '#e74c3c' : 'var(--color-text)';
                e.currentTarget.textContent = `${card.suit}${card.value}`;
                flippedCards.push(index);
                
                if (flippedCards.length === 2) {
                    const [first, second] = flippedCards;
                    
                    if (cards[first].id === cards[second].id) {
                        // マッチした
                        cards[first].matched = true;
                        cards[second].matched = true;
                        matchedPairs++;
                        
                        cardElements[first].style.borderColor = 'var(--color-success)';
                        cardElements[second].style.borderColor = 'var(--color-success)';
                        
                        this.recordAnswer(true);
                        
                        const matchCounter = container.querySelector('.match-counter');
                        matchCounter.textContent = `ペア数: ${matchedPairs}/${pairs}`;
                        
                        flippedCards = [];
                        
                        if (matchedPairs === pairs) {
                            const timeout = setTimeout(() => {
                                this.endGame();
                            }, 1000);
                            this.gameTimeouts.push(timeout);
                        }
                    } else {
                        // マッチしなかった
                        this.recordAnswer(false);
                        
                        const timeout = setTimeout(() => {
                            cardElements[first].style.backgroundColor = 'var(--color-primary)';
                            cardElements[first].style.color = 'white';
                            cardElements[first].textContent = '?';
                            
                            cardElements[second].style.backgroundColor = 'var(--color-primary)';
                            cardElements[second].style.color = 'white';
                            cardElements[second].textContent = '?';
                            
                            flippedCards = [];
                        }, 1000);
                        this.gameTimeouts.push(timeout);
                    }
                }
            });
        });
    }

    runSequenceCopyGame() {
        const container = document.querySelector('.game-container');
        let currentRound = 0;
        const totalRounds = 8;
        const sequence = [];
        
        const nextRound = () => {
            if (currentRound >= totalRounds) {
                this.endGame();
                return;
            }
            
            // 新しい位置を追加
            sequence.push(Math.floor(Math.random() * 9));
            
            this.showSequencePositions(sequence, () => {
                this.collectSequenceInput(sequence, nextRound);
            });
            
            currentRound++;
        };
        
        nextRound();
    }

    showSequencePositions(sequence, callback) {
        const container = document.querySelector('.game-container');
        container.innerHTML = `
            <div class="game-question">
                <h2>順番記憶 第${sequence.length}問</h2>
                <div class="game-instruction">光る順番を覚えてください</div>
            </div>
            <div class="sequence-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 240px; margin: 0 auto;">
                ${Array.from({length: 9}, (_, i) => `
                    <div class="sequence-cell" data-position="${i}" style="aspect-ratio: 1; background-color: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-base); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: var(--color-text);">
                        ${i + 1}
                    </div>
                `).join('')}
            </div>
        `;
        
        let index = 0;
        const cells = container.querySelectorAll('.sequence-cell');
        
        const showNext = () => {
            if (index < sequence.length) {
                const currentCell = cells[sequence[index]];
                
                currentCell.style.backgroundColor = 'var(--color-primary)';
                currentCell.style.color = 'white';
                
                const timeout1 = setTimeout(() => {
                    currentCell.style.backgroundColor = 'var(--color-surface)';
                    currentCell.style.color = 'var(--color-text)';
                    index++;
                    const timeout2 = setTimeout(showNext, 300);
                    this.gameTimeouts.push(timeout2);
                }, 700);
                this.gameTimeouts.push(timeout1);
            } else {
                const timeout = setTimeout(callback, 1000);
                this.gameTimeouts.push(timeout);
            }
        };
        
        const timeout = setTimeout(showNext, 1000);
        this.gameTimeouts.push(timeout);
    }

    collectSequenceInput(sequence, callback) {
        const container = document.querySelector('.game-container');
        let inputSequence = [];
        
        container.innerHTML = `
            <div class="game-question">
                <h2>順番に選択してください</h2>
                <div class="game-instruction">覚えた順番で数字をタップしてください</div>
                <div class="input-progress" style="margin: 10px 0; color: var(--color-text);">
                    進行状況: ${inputSequence.length}/${sequence.length}
                </div>
            </div>
            <div class="sequence-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 240px; margin: 0 auto;">
                ${Array.from({length: 9}, (_, i) => `
                    <button class="sequence-cell" data-position="${i}" style="aspect-ratio: 1; background-color: var(--color-surface); border: 2px solid var(--color-border); border-radius: var(--radius-base); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: var(--color-text); cursor: pointer;">
                        ${i + 1}
                    </button>
                `).join('')}
            </div>
        `;
        
        const progressEl = container.querySelector('.input-progress');
        
        container.querySelectorAll('.sequence-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const position = parseInt(e.currentTarget.dataset.position);
                inputSequence.push(position);
                
                e.currentTarget.style.backgroundColor = 'var(--color-success)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.disabled = true;
                
                progressEl.textContent = `進行状況: ${inputSequence.length}/${sequence.length}`;
                
                if (inputSequence.length === sequence.length) {
                    this.checkSequenceInput(inputSequence, sequence, callback);
                }
            });
        });
    }

    checkSequenceInput(input, correct, callback) {
        const isCorrect = JSON.stringify(input) === JSON.stringify(correct);
        this.recordAnswer(isCorrect);
        
        const timeout = setTimeout(() => {
            callback();
        }, 1500);
        this.gameTimeouts.push(timeout);
    }

    // === データ管理メソッド ===

    loadUserData() {
        const defaultData = {
            hasSeenWelcome: false,
            totalPoints: 0,
            currentLevel: 1,
            currentStreak: 0,
            lastPlayDate: null,
            dailyProgress: {
                date: new Date().toDateString(),
                gamesPlayed: 0,
                pointsEarned: 0
            },
            gameStats: {},
            badges: [],
            settings: {
                difficulty: '中級',
                sound: true,
                reminders: true,
                reminderTime: '19:00'
            }
        };

        try {
            const saved = localStorage.getItem('brainTrainingData');
            if (saved) {
                const parsedData = JSON.parse(saved);
                return { ...defaultData, ...parsedData };
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
        
        return defaultData;
    }

    saveUserData() {
        try {
            localStorage.setItem('brainTrainingData', JSON.stringify(this.userData));
            console.log('User data saved successfully');
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    // === ユーティリティメソッド ===

    getCurrentLevel() {
        const points = this.userData.totalPoints;
        for (let i = this.gameData.levels.length - 1; i >= 0; i--) {
            if (points >= this.gameData.levels[i].requiredPoints) {
                return this.gameData.levels[i];
            }
        }
        return this.gameData.levels[0];
    }

    getRecommendedGames() {
        // 最近プレイしていないゲームを優先
        const recentlyPlayed = Object.keys(this.userData.gameStats)
            .sort((a, b) => {
                const aStats = this.userData.gameStats[a];
                const bStats = this.userData.gameStats[b];
                return (bStats.timesPlayed || 0) - (aStats.timesPlayed || 0);
            });
        
        const lessPlayedGames = this.gameData.games.filter(game => 
            !recentlyPlayed.slice(0, 3).includes(game.id)
        );
        
        const shuffled = [...lessPlayedGames].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    updateDailyStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.userData.lastPlayDate;
        
        if (lastPlay !== today) {
            // Reset daily progress
            this.userData.dailyProgress = {
                date: today,
                gamesPlayed: 0,
                pointsEarned: 0
            };
            
            // Update streak
            if (lastPlay) {
                const lastDate = new Date(lastPlay);
                const todayDate = new Date(today);
                const diffTime = Math.abs(todayDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    this.userData.currentStreak++;
                } else if (diffDays > 1) {
                    this.userData.currentStreak = 0;
                }
            }
            
            this.userData.lastPlayDate = today;
            this.saveUserData();
        }
    }

    checkForNewBadges() {
        const newBadges = [];
        
        this.gameData.badges.forEach(badge => {
            if (!this.userData.badges.includes(badge.id)) {
                let earned = false;
                
                switch (badge.id) {
                    case 'first-play':
                        earned = this.userData.dailyProgress.gamesPlayed > 0;
                        break;
                    case 'streak-3':
                        earned = this.userData.currentStreak >= 3;
                        break;
                    case 'streak-7':
                        earned = this.userData.currentStreak >= 7;
                        break;
                    case 'streak-30':
                        earned = this.userData.currentStreak >= 30;
                        break;
                    case 'point-collector':
                        earned = this.userData.totalPoints >= 1000;
                        break;
                    case 'game-master':
                        earned = Object.keys(this.userData.gameStats).length >= this.gameData.games.length;
                        break;
                    case 'memory-king':
                        const memoryGames = ['number-memory', 'pattern-memory', 'card-memory', 'sequence-copy'];
                        earned = memoryGames.some(gameId => 
                            this.userData.gameStats[gameId]?.bestScore >= 80
                        );
                        break;
                    case 'speed-demon':
                        const speedGames = ['reaction-time', 'calc-quick'];
                        earned = speedGames.some(gameId => 
                            this.userData.gameStats[gameId]?.bestScore >= 90
                        );
                        break;
                }
                
                if (earned) {
                    this.userData.badges.push(badge.id);
                    newBadges.push(badge.id);
                }
            }
        });
        
        return newBadges;
    }

    // === 画面更新メソッド ===

    updateGamesScreen() {
        const container = document.getElementById('games-list');
        if (!container) return;
        
        try {
            container.innerHTML = `
                <div class="games-grid">
                    ${this.gameData.games.map(game => `
                        <div class="game-card" data-game-id="${game.id}">
                            <div class="game-icon">${game.icon}</div>
                            <div class="game-name">${game.name}</div>
                            <div class="game-description">${game.description}</div>
                            <div class="game-exercises">
                                ${game.exercises.map(exercise => `<span class="exercise-tag">${exercise}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error updating games screen:', error);
        }
    }

    updateStatsScreen() {
        this.showStatsTab('overview');
    }

    showStatsTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        
        const content = document.getElementById('stats-content');
        if (!content) return;
        
        switch (tab) {
            case 'overview':
                this.showOverviewStats(content);
                break;
            case 'games':
                this.showGameStats(content);
                break;
            case 'progress':
                this.showProgressStats(content);
                break;
        }
    }

    showOverviewStats(container) {
        const totalGames = Object.values(this.userData.gameStats)
            .reduce((sum, stats) => sum + stats.timesPlayed, 0);
        const totalTime = Object.values(this.userData.gameStats)
            .reduce((sum, stats) => sum + stats.totalTime, 0);
        const avgScore = totalGames > 0 ? 
            Math.round(this.userData.totalPoints / totalGames) : 0;
        
        container.innerHTML = `
            <div class="overview-cards">
                <div class="stat-detail-card">
                    <h4>総プレイ時間</h4>
                    <div class="stat-big">${Math.round(totalTime / 60000)}分</div>
                </div>
                <div class="stat-detail-card">
                    <h4>平均スコア</h4>
                    <div class="stat-big">${avgScore}</div>
                </div>
                <div class="stat-detail-card">
                    <h4>総ゲーム数</h4>
                    <div class="stat-big">${totalGames}</div>
                </div>
                <div class="stat-detail-card">
                    <h4>獲得バッジ</h4>
                    <div class="stat-big">${this.userData.badges.length}</div>
                </div>
            </div>
            <div class="badges-section">
                <h3>獲得バッジ</h3>
                <div class="badges-grid">
                    ${this.gameData.badges.map(badge => `
                        <div class="badge-item ${this.userData.badges.includes(badge.id) ? 'earned' : ''}">
                            <div class="badge-icon">${badge.icon}</div>
                            <div class="badge-name">${badge.name}</div>
                            <div class="badge-description">${badge.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showGameStats(container) {
        container.innerHTML = `
            <div class="game-stats-list">
                ${this.gameData.games.map(game => {
                    const stats = this.userData.gameStats[game.id] || {
                        timesPlayed: 0,
                        totalScore: 0,
                        bestScore: 0,
                        totalTime: 0
                    };
                    return `
                        <div class="game-stat-item">
                            <div class="game-stat-icon">${game.icon}</div>
                            <div class="game-stat-info">
                                <div class="game-stat-name">${game.name}</div>
                                <div class="game-stat-details">
                                    <span>プレイ回数: ${stats.timesPlayed}</span>
                                    <span>最高スコア: ${stats.bestScore}</span>
                                    <span>平均スコア: ${stats.timesPlayed > 0 ? Math.round(stats.totalScore / stats.timesPlayed) : 0}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showProgressStats(container) {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
                points: Math.floor(Math.random() * 50) // 実際はローカルストレージから取得
            });
        }
        
        container.innerHTML = `
            <div class="chart-container">
                <h3>週間ポイント推移</h3>
                <div class="simple-chart" style="display: flex; align-items: end; height: 200px; gap: 8px; padding: 20px; background-color: var(--color-surface); border-radius: var(--radius-base); border: 1px solid var(--color-border);">
                    ${last7Days.map(day => `
                        <div class="chart-bar" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <div style="height: ${day.points * 2}px; background-color: var(--color-primary); width: 100%; border-radius: var(--radius-sm) var(--radius-sm) 0 0; margin-bottom: 8px; min-height: 4px;"></div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">${day.date}</div>
                            <div style="font-size: 10px; color: var(--color-text-secondary);">${day.points}pt</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateSettingsScreen() {
        const difficultySelect = document.getElementById('difficulty-setting');
        if (difficultySelect) {
            difficultySelect.value = this.userData.settings.difficulty;
        }
        
        const soundCheck = document.getElementById('sound-setting');
        if (soundCheck) {
            soundCheck.checked = this.userData.settings.sound;
        }
        
        const reminderCheck = document.getElementById('reminder-setting');
        if (reminderCheck) {
            reminderCheck.checked = this.userData.settings.reminders;
        }
        
        const reminderTime = document.getElementById('reminder-time');
        if (reminderTime) {
            reminderTime.value = this.userData.settings.reminderTime;
        }
    }

    exportUserData() {
        try {
            const dataStr = JSON.stringify(this.userData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `brain-training-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            console.log('User data exported successfully');
        } catch (error) {
            console.error('Failed to export user data:', error);
        }
    }

    resetUserData() {
        try {
            localStorage.removeItem('brainTrainingData');
            console.log('User data reset successfully');
            location.reload();
        } catch (error) {
            console.error('Failed to reset user data:', error);
        }
    }
}

// === アプリケーション初期化 ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing Brain Training App...');
    try {
        window.brainTrainingApp = new BrainTrainingApp();
        console.log('Brain Training App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Brain Training App:', error);
    }
});

// グローバルエラーハンドリング
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
