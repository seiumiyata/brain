// Brain Training PWA Application
class BrainTrainingApp {
    constructor() {
        this.currentScreen = 'loading';
        this.currentGame = null;
        this.gameSession = null;
        this.gameTimer = null;
        this.gameTimeouts = [];
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
        
        setTimeout(() => {
            if (this.userData.hasSeenWelcome) {
                this.showScreen('main-app');
                this.showAppScreen('dashboard');
            } else {
                this.showScreen('welcome');
            }
        }, 1500);
    }

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
        
        if (!installPrompt) return;
        
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

    setupEventListeners() {
        const startBtn = document.getElementById('start-app-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.userData.hasSeenWelcome = true;
                this.saveUserData();
                this.showScreen('main-app');
                this.showAppScreen('dashboard');
            });
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.target.closest('.nav-item').dataset.screen;
                this.showAppScreen(screen);
                this.updateNavigation(screen);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.game-card')) {
                const gameId = e.target.closest('.game-card').dataset.gameId;
                this.startGame(gameId);
            }
        });

        const backBtn = document.getElementById('back-to-games');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.stopCurrentGame();
                this.showAppScreen('games');
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.id === 'play-again-btn') {
                if (this.currentGame) {
                    this.startGame(this.currentGame.id);
                }
            }
            if (e.target.id === 'continue-btn') {
                this.showAppScreen('dashboard');
            }
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showStatsTab(tab);
            });
        });

        const difficultySettings = document.getElementById('difficulty-setting');
        if (difficultySettings) {
            difficultySettings.addEventListener('change', (e) => {
                this.userData.settings.difficulty = e.target.value;
                this.saveUserData();
            });
        }

        const soundSettings = document.getElementById('sound-setting');
        if (soundSettings) {
            soundSettings.addEventListener('change', (e) => {
                this.userData.settings.sound = e.target.checked;
                this.saveUserData();
            });
        }

        const reminderSettings = document.getElementById('reminder-setting');
        if (reminderSettings) {
            reminderSettings.addEventListener('change', (e) => {
                this.userData.settings.reminders = e.target.checked;
                this.saveUserData();
            });
        }

        const reminderTime = document.getElementById('reminder-time');
        if (reminderTime) {
            reminderTime.addEventListener('change', (e) => {
                this.userData.settings.reminderTime = e.target.value;
                this.saveUserData();
            });
        }

        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportUserData();
            });
        }

        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('本当にすべてのデータをリセットしますか？この操作は取り消せません。')) {
                    this.resetUserData();
                }
            });
        }
    }

    stopCurrentGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.gameTimeouts.forEach(timeout => clearTimeout(timeout));
        this.gameTimeouts = [];
        
        this.gameSession = null;
        this.currentGame = null;
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.innerHTML = '';
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen, #main-app').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        if (screenId === 'main-app') {
            document.getElementById('main-app').classList.remove('hidden');
        } else {
            const screen = document.getElementById(screenId + '-screen');
            if (screen) {
                screen.classList.remove('hidden');
            }
        }
        this.currentScreen = screenId;
    }

    showAppScreen(screenId) {
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const screen = document.getElementById(screenId + '-screen');
        if (screen) {
            screen.classList.remove('hidden');
        }

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

    updateDashboard() {
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

        const dailyGoalElement = document.getElementById('daily-goal-progress');
        if (dailyGoalElement) {
            dailyGoalElement.textContent = `${this.userData.dailyProgress.gamesPlayed}/3`;
        }

        const totalPointsElement = document.getElementById('total-points');
        if (totalPointsElement) {
            totalPointsElement.textContent = this.userData.totalPoints;
        }

        const currentLevelElement = document.getElementById('current-level');
        if (currentLevelElement) {
            currentLevelElement.textContent = this.getCurrentLevel().level;
        }

        const streakElement = document.getElementById('streak-count');
        if (streakElement) {
            streakElement.textContent = this.userData.currentStreak;
        }

        const progress = Math.min(100, (this.userData.dailyProgress.gamesPlayed / 3) * 100);
        const progressBar = document.getElementById('daily-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }

        this.updateRecommendedGames();
        this.updateRecentBadges();
    }

    updateRecommendedGames() {
        const container = document.getElementById('recommended-games');
        if (!container) return;
        
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
    }

    updateRecentBadges() {
        const container = document.getElementById('recent-badges');
        if (!container) return;
        
        const recentBadges = this.userData.badges.slice(-3);
        
        if (recentBadges.length === 0) {
            container.innerHTML = '<p class="text-secondary">まだバッジがありません。ゲームをプレイして最初のバッジを獲得しましょう！</p>';
            return;
        }

        const badgeList = container.querySelector('.badge-list');
        if (badgeList) {
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
    }

    startGame(gameId) {
        const game = this.gameData.games.find(g => g.id === gameId);
        if (!game) return;

        this.stopCurrentGame();
        this.currentGame = game;
        this.gameSession = this.createGameSession(game);
        
        this.showScreen('main-app');
        this.showGameScreen();
        this.runGame();
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
        }
    }

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
                    <div class="game-instruction">文字の色と意味が同じですか？</div>
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
                <div class="number-display" style="font-size: 4rem; margin: 40px 0; min-height: 100px; display: flex; align-items: center; justify-content: center;">
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
                <div class="input-display" style="font-size: 2rem; margin: 20px 0; min-height: 60px;">
                    ${inputSequence.join(' → ') || '数字を選択してください'}
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
                    <div style="font-size: 3rem; margin: 30px 0; font-weight: bold;">
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
                    <div class="game-instruction">次の数字は前の数字より高いか低いか？</div>
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
                return { ...defaultData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
        
        return defaultData;
    }

    saveUserData() {
        try {
            localStorage.setItem('brainTrainingData', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Failed to save user data:', error);
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

    getRecommendedGames() {
        const shuffled = [...this.gameData.games].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    updateDailyStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.userData.lastPlayDate;
        
        if (lastPlay !== today) {
            this.userData.dailyProgress = {
                date: today,
                gamesPlayed: 0,
                pointsEarned: 0
            };
            
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
                    case 'point-collector':
                        earned = this.userData.totalPoints >= 1000;
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

    updateGamesScreen() {
        const container = document.getElementById('games-list');
        if (!container) return;
        
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
        container.innerHTML = `
            <div class="chart-container">
                <h3>週間ポイント推移</h3>
                <div id="points-chart">
                    <p>グラフ機能は今後追加予定です</p>
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
        const dataStr = JSON.stringify(this.userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'brain-training-data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    resetUserData() {
        localStorage.removeItem('brainTrainingData');
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BrainTrainingApp();
});
