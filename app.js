// アプリケーションクラス
class BrainTrainingApp {
    constructor() {
        this.currentScreen = 'loading';
        this.currentGame = null;
        this.gameSession = null;
        this.userData = this.loadUserData();
        this.gameData = {
            games: [
                {id: "janken", name: "後出しジャンケン", description: "指示に従って適切な手を選ぼう", icon: "✂️"},
                {id: "color-match", name: "カラーマッチ", description: "文字と色の一致を素早く判断", icon: "🎨"},
                {id: "number-memory", name: "数字記憶", description: "数字を覚えて順番に選択", icon: "🔢"},
                {id: "calc-quick", name: "計算クイック", description: "素早く計算問題を解こう", icon: "➕"},
                {id: "high-low", name: "ハイ・ロー", description: "数字の大小を予想しよう", icon: "📊"},
                {id: "pattern-memory", name: "パターン記憶", description: "光る順番を覚えて再現", icon: "🔄"},
                {id: "reaction-time", name: "反応時間テスト", description: "色が変わったら素早くタップ", icon: "⚡"},
                {id: "visual-search", name: "視覚探索", description: "特定の文字を素早く見つけよう", icon: "🔍"},
                {id: "dual-nback", name: "デュアルNバック", description: "位置と音を同時に記憶", icon: "🧠"},
                {id: "memory-card", name: "神経衰弱", description: "カードの位置を覚えてペアを見つけよう", icon: "🃏"},
                {id: "sequence-memory", name: "順番記憶", description: "光る順番を正確に覚えよう", icon: "💡"},
                {id: "word-chain", name: "しりとり∞", description: "単語をつなげて続けよう", icon: "🔤"}
            ],
            levels: [
                {level: 1, name: "ビギナー", requiredPoints: 0, color: "#95a5a6"},
                {level: 2, name: "アマチュア", requiredPoints: 150, color: "#3498db"},
                {level: 3, name: "セミプロ", requiredPoints: 400, color: "#2ecc71"},
                {level: 4, name: "プロ", requiredPoints: 800, color: "#f39c12"},
                {level: 5, name: "エキスパート", requiredPoints: 1500, color: "#e74c3c"},
                {level: 6, name: "マスター", requiredPoints: 3000, color: "#9b59b6"}
            ],
            badges: [
                {id: "first-play", name: "初心者", description: "初回プレイ完了", icon: "🌟"},
                {id: "streak-3", name: "継続力", description: "3日連続プレイ", icon: "🔥"},
                {id: "streak-7", name: "習慣化", description: "7日連続プレイ", icon: "💪"},
                {id: "perfect-score", name: "パーフェクト", description: "ノーミス完了", icon: "🏆"},
                {id: "speed-master", name: "スピードM", description: "平均反応1秒未満", icon: "⚡"},
                {id: "brain-athlete", name: "脳アスリート", description: "全ゲームクリア", icon: "🥇"},
                {id: "level-up", name: "レベルアップ", description: "レベル2到達", icon: "📈"},
                {id: "dedicated", name: "献身的", description: "100回プレイ", icon: "🎯"}
            ]
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkFirstVisit();
        this.updateUI();
        
        // ローディング完了後の処理
        setTimeout(() => {
            this.hideLoading();
        }, 1500);
    }

    loadUserData() {
        const defaultData = {
            points: 0,
            level: 1,
            streakDays: 0,
            lastPlayDate: null,
            gamesPlayed: 0,
            totalPlayTime: 0,
            badges: [],
            settings: {
                difficulty: 'normal',
                sound: true,
                theme: 'auto'
            },
            gameStats: {},
            dailyStats: {}
        };

        try {
            const saved = localStorage.getItem('brainTrainingData');
            return saved ? {...defaultData, ...JSON.parse(saved)} : defaultData;
        } catch {
            return defaultData;
        }
    }

    saveUserData() {
        try {
            localStorage.setItem('brainTrainingData', JSON.stringify(this.userData));
        } catch (error) {
            console.error('データ保存エラー:', error);
        }
    }

    checkFirstVisit() {
        if (!this.userData.lastPlayDate) {
            this.currentScreen = 'welcome';
        } else {
            this.currentScreen = 'dashboard';
        }
    }

    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
        
        if (this.currentScreen === 'welcome') {
            document.getElementById('welcome-screen').classList.remove('hidden');
        } else {
            document.getElementById('main-app').classList.remove('hidden');
            this.showScreen('dashboard');
        }
    }

    setupEventListeners() {
        // スタートボタン
        document.getElementById('start-btn').addEventListener('click', () => {
            this.userData.lastPlayDate = new Date().toDateString();
            this.saveUserData();
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            this.showScreen('dashboard');
        });

        // ナビゲーション
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                this.showScreen(screen);
                this.updateNavigation(screen);
            });
        });

        // ゲーム戻るボタン
        document.getElementById('back-to-games').addEventListener('click', () => {
            this.showScreen('games');
        });

        // 結果画面ボタン
        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame(this.currentGame);
        });

        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            this.showScreen('dashboard');
        });

        // 統計タブ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.showTab(tab);
            });
        });

        // テーマ切り替え
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 設定
        document.getElementById('difficulty-setting').addEventListener('change', (e) => {
            this.userData.settings.difficulty = e.target.value;
            this.saveUserData();
        });

        document.getElementById('sound-setting').addEventListener('change', (e) => {
            this.userData.settings.sound = e.target.checked;
            this.saveUserData();
        });

        document.getElementById('theme-setting').addEventListener('change', (e) => {
            this.userData.settings.theme = e.target.value;
            this.applyTheme();
            this.saveUserData();
        });

        document.getElementById('reset-data').addEventListener('click', () => {
            if (confirm('すべてのデータが削除されます。よろしいですか？')) {
                localStorage.removeItem('brainTrainingData');
                location.reload();
            }
        });
    }

    showScreen(screenName) {
        // 全画面を非表示
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // 指定画面を表示
        document.getElementById(`${screenName}-screen`).classList.remove('hidden');
        this.currentScreen = screenName;

        // 画面固有の処理
        switch (screenName) {
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
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-screen="${activeScreen}"]`).classList.add('active');
    }

    updateUI() {
        // ユーザー情報更新
        document.getElementById('user-level').textContent = this.userData.level;
        document.getElementById('user-points').textContent = this.userData.points;

        // ストリーク更新
        this.updateStreak();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastPlay = this.userData.lastPlayDate;
        
        if (lastPlay) {
            const lastDate = new Date(lastPlay);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // 連続記録継続
            } else if (diffDays > 1) {
                this.userData.streakDays = 0;
            }
        }
    }

    updateDashboard() {
        // 今日の統計
        const today = new Date().toDateString();
        const todayStats = this.userData.dailyStats[today] || { gamesPlayed: 0, totalReactionTime: 0, gameCount: 0 };
        
        document.getElementById('streak-days').textContent = this.userData.streakDays;
        document.getElementById('today-games').textContent = todayStats.gamesPlayed;
        
        const avgReaction = todayStats.gameCount > 0 ? 
            Math.round(todayStats.totalReactionTime / todayStats.gameCount) : 0;
        document.getElementById('avg-reaction').textContent = avgReaction + 'ms';
        document.getElementById('total-badges').textContent = this.userData.badges.length;

        // おすすめゲーム
        this.renderRecommendedGames();
        this.renderRecentBadges();
    }

    renderRecommendedGames() {
        const container = document.getElementById('recommended-games');
        const recommendedGames = this.gameData.games.slice(0, 4);
        
        container.innerHTML = recommendedGames.map(game => `
            <div class="game-card" onclick="app.startGame('${game.id}')">
                <div class="game-header">
                    <div class="game-icon">${game.icon}</div>
                    <div>
                        <h3 class="game-title">${game.name}</h3>
                        <p class="game-description">${game.description}</p>
                    </div>
                </div>
                <div class="game-stats">
                    <span>プレイ回数: ${this.getGamePlayCount(game.id)}</span>
                    <span>最高スコア: ${this.getGameBestScore(game.id)}</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentBadges() {
        const container = document.getElementById('badge-list');
        const recentBadges = this.userData.badges.slice(-3);
        
        if (recentBadges.length === 0) {
            container.innerHTML = '<p class="text-secondary">まだバッジがありません</p>';
            return;
        }

        container.innerHTML = recentBadges.map(badgeId => {
            const badge = this.gameData.badges.find(b => b.id === badgeId);
            return `
                <div class="badge-item">
                    <span class="badge-icon">${badge.icon}</span>
                    <span>${badge.name}</span>
                </div>
            `;
        }).join('');
    }

    updateGamesScreen() {
        const container = document.getElementById('all-games');
        container.innerHTML = this.gameData.games.map(game => `
            <div class="game-card" onclick="app.startGame('${game.id}')">
                <div class="game-header">
                    <div class="game-icon">${game.icon}</div>
                    <div>
                        <h3 class="game-title">${game.name}</h3>
                        <p class="game-description">${game.description}</p>
                    </div>
                </div>
                <div class="game-stats">
                    <span>プレイ回数: ${this.getGamePlayCount(game.id)}</span>
                    <span>最高スコア: ${this.getGameBestScore(game.id)}</span>
                    <span>平均スコア: ${this.getGameAvgScore(game.id)}</span>
                </div>
            </div>
        `).join('');
    }

    startGame(gameId) {
        this.currentGame = gameId;
        const game = this.gameData.games.find(g => g.id === gameId);
        
        document.getElementById('current-game-title').textContent = game.name;
        this.showScreen('game-play');
        
        // ゲーム開始
        this.gameSession = {
            gameId,
            startTime: Date.now(),
            score: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            reactionTimes: []
        };

        this.initGame(gameId);
    }

    initGame(gameId) {
        const gameContent = document.getElementById('game-content');
        
        switch (gameId) {
            case 'janken':
                this.initJankenGame(gameContent);
                break;
            case 'color-match':
                this.initColorMatchGame(gameContent);
                break;
            case 'number-memory':
                this.initNumberMemoryGame(gameContent);
                break;
            case 'calc-quick':
                this.initCalcQuickGame(gameContent);
                break;
            case 'high-low':
                this.initHighLowGame(gameContent);
                break;
            case 'pattern-memory':
                this.initPatternMemoryGame(gameContent);
                break;
            case 'reaction-time':
                this.initReactionTimeGame(gameContent);
                break;
            case 'visual-search':
                this.initVisualSearchGame(gameContent);
                break;
            case 'dual-nback':
                this.initDualNBackGame(gameContent);
                break;
            case 'memory-card':
                this.initMemoryCardGame(gameContent);
                break;
            case 'sequence-memory':
                this.initSequenceMemoryGame(gameContent);
                break;
            case 'word-chain':
                this.initWordChainGame(gameContent);
                break;
        }

        this.startGameTimer();
    }

    // 後出しジャンケンゲーム
    initJankenGame(container) {
        this.jankenRound = 0;
        this.jankenMaxRounds = 10;
        this.jankenInstructions = ['勝つ手を出してください', '負ける手を出してください', '同じ手を出してください'];
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.jankenMaxRounds}</span>
            </div>
            <div class="game-question" id="janken-instruction">準備中...</div>
            <div class="game-question" id="janken-opponent">?</div>
            <div class="game-options">
                <button class="game-option" onclick="app.jankenAnswer('rock')">✊ グー</button>
                <button class="game-option" onclick="app.jankenAnswer('paper')">✋ パー</button>
                <button class="game-option" onclick="app.jankenAnswer('scissors')">✌️ チョキ</button>
            </div>
        `;

        this.nextJankenRound();
    }

    nextJankenRound() {
        if (this.jankenRound >= this.jankenMaxRounds) {
            this.endGame();
            return;
        }

        this.jankenRound++;
        const progress = (this.jankenRound / this.jankenMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.jankenRound}/${this.jankenMaxRounds}`;

        const hands = ['rock', 'paper', 'scissors'];
        const handEmojis = { rock: '✊', paper: '✋', scissors: '✌️' };
        const instructions = ['勝つ手を出してください', '負ける手を出してください', '同じ手を出してください'];

        this.currentJankenOpponent = hands[Math.floor(Math.random() * hands.length)];
        this.currentJankenInstruction = instructions[Math.floor(Math.random() * instructions.length)];
        this.jankenStartTime = Date.now();

        document.getElementById('janken-instruction').textContent = this.currentJankenInstruction;
        document.getElementById('janken-opponent').textContent = handEmojis[this.currentJankenOpponent];
    }

    jankenAnswer(playerHand) {
        const reactionTime = Date.now() - this.jankenStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;

        let correct = false;
        const opponent = this.currentJankenOpponent;

        if (this.currentJankenInstruction === '勝つ手を出してください') {
            correct = (opponent === 'rock' && playerHand === 'paper') ||
                     (opponent === 'paper' && playerHand === 'scissors') ||
                     (opponent === 'scissors' && playerHand === 'rock');
        } else if (this.currentJankenInstruction === '負ける手を出してください') {
            correct = (opponent === 'rock' && playerHand === 'scissors') ||
                     (opponent === 'paper' && playerHand === 'rock') ||
                     (opponent === 'scissors' && playerHand === 'paper');
        } else {
            correct = opponent === playerHand;
        }

        if (correct) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += 10;
        }

        setTimeout(() => this.nextJankenRound(), 500);
    }

    // カラーマッチゲーム
    initColorMatchGame(container) {
        this.colorMatchRound = 0;
        this.colorMatchMaxRounds = 15;
        this.colors = ['赤', '青', '緑', '黄'];
        this.colorValues = { '赤': 'red', '青': 'blue', '緑': 'green', '黄': 'yellow' };
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.colorMatchMaxRounds}</span>
            </div>
            <div class="color-word" id="color-word">準備中...</div>
            <div class="game-options">
                <button class="game-option" onclick="app.colorMatchAnswer(true)">一致</button>
                <button class="game-option" onclick="app.colorMatchAnswer(false)">不一致</button>
            </div>
        `;

        this.nextColorMatchRound();
    }

    nextColorMatchRound() {
        if (this.colorMatchRound >= this.colorMatchMaxRounds) {
            this.endGame();
            return;
        }

        this.colorMatchRound++;
        const progress = (this.colorMatchRound / this.colorMatchMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.colorMatchRound}/${this.colorMatchMaxRounds}`;

        const wordColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const displayColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        this.currentColorMatch = wordColor === displayColor;
        this.colorMatchStartTime = Date.now();

        const wordElement = document.getElementById('color-word');
        wordElement.textContent = wordColor;
        wordElement.style.color = this.colorValues[displayColor];
    }

    colorMatchAnswer(answer) {
        const reactionTime = Date.now() - this.colorMatchStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;

        if (answer === this.currentColorMatch) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += 10;
        }

        setTimeout(() => this.nextColorMatchRound(), 300);
    }

    // 数字記憶ゲーム
    initNumberMemoryGame(container) {
        this.numberMemoryLevel = 3;
        this.numberMemorySequence = [];
        this.numberMemoryPlayerSequence = [];
        this.numberMemoryShowingSequence = false;
        
        container.innerHTML = `
            <div class="game-question">数字を覚えて順番にタップしてください</div>
            <div class="game-question">レベル: <span id="memory-level">${this.numberMemoryLevel}</span></div>
            <div class="number-grid" id="number-grid">
                ${Array.from({length: 9}, (_, i) => 
                    `<div class="number-cell" onclick="app.numberMemoryClick(${i + 1})">${i + 1}</div>`
                ).join('')}
            </div>
            <button class="btn btn--primary" onclick="app.startNumberMemoryRound()" id="start-memory">開始</button>
        `;
    }

    startNumberMemoryRound() {
        this.numberMemorySequence = [];
        this.numberMemoryPlayerSequence = [];
        
        // ランダムな数字列を生成
        for (let i = 0; i < this.numberMemoryLevel; i++) {
            this.numberMemorySequence.push(Math.floor(Math.random() * 9) + 1);
        }

        document.getElementById('start-memory').style.display = 'none';
        this.showNumberSequence();
    }

    showNumberSequence() {
        this.numberMemoryShowingSequence = true;
        let index = 0;

        const showNext = () => {
            if (index >= this.numberMemorySequence.length) {
                this.numberMemoryShowingSequence = false;
                this.numberMemoryStartTime = Date.now();
                return;
            }

            const number = this.numberMemorySequence[index];
            const cells = document.querySelectorAll('.number-cell');
            
            // 該当セルをハイライト
            cells[number - 1].classList.add('highlighted');
            
            setTimeout(() => {
                cells[number - 1].classList.remove('highlighted');
                index++;
                setTimeout(showNext, 200);
            }, 600);
        };

        showNext();
    }

    numberMemoryClick(number) {
        if (this.numberMemoryShowingSequence) return;

        this.numberMemoryPlayerSequence.push(number);
        
        // 正答チェック
        const currentIndex = this.numberMemoryPlayerSequence.length - 1;
        if (this.numberMemorySequence[currentIndex] !== number) {
            // 間違い
            this.endGame();
            return;
        }

        // 全て正解した場合
        if (this.numberMemoryPlayerSequence.length === this.numberMemorySequence.length) {
            const reactionTime = Date.now() - this.numberMemoryStartTime;
            this.gameSession.reactionTimes.push(reactionTime);
            this.gameSession.correctAnswers++;
            this.gameSession.score += this.numberMemoryLevel * 10;
            this.gameSession.totalAnswers++;

            this.numberMemoryLevel++;
            document.getElementById('memory-level').textContent = this.numberMemoryLevel;
            
            if (this.numberMemoryLevel > 8) {
                this.endGame();
                return;
            }

            document.getElementById('start-memory').style.display = 'block';
        }
    }

    // 計算クイックゲーム
    initCalcQuickGame(container) {
        this.calcRound = 0;
        this.calcMaxRounds = 20;
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.calcMaxRounds}</span>
            </div>
            <div class="game-question" id="calc-question">準備中...</div>
            <div class="game-options" id="calc-options">
                <!-- 動的に生成 -->
            </div>
        `;

        this.nextCalcRound();
    }

    nextCalcRound() {
        if (this.calcRound >= this.calcMaxRounds) {
            this.endGame();
            return;
        }

        this.calcRound++;
        const progress = (this.calcRound / this.calcMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.calcRound}/${this.calcMaxRounds}`;

        // 問題生成
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const operations = ['+', '-', '*'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        let answer;
        switch (op) {
            case '+': answer = a + b; break;
            case '-': answer = a - b; break;
            case '*': answer = a * b; break;
        }

        this.currentCalcAnswer = answer;
        this.calcStartTime = Date.now();

        document.getElementById('calc-question').textContent = `${a} ${op} ${b} = ?`;

        // 選択肢生成
        const options = [answer];
        while (options.length < 4) {
            const wrong = answer + (Math.floor(Math.random() * 10) - 5);
            if (wrong !== answer && !options.includes(wrong)) {
                options.push(wrong);
            }
        }

        // シャッフル
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        document.getElementById('calc-options').innerHTML = options.map(opt => 
            `<button class="game-option" onclick="app.calcAnswer(${opt})">${opt}</button>`
        ).join('');
    }

    calcAnswer(answer) {
        const reactionTime = Date.now() - this.calcStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;

        if (answer === this.currentCalcAnswer) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += 10;
        }

        setTimeout(() => this.nextCalcRound(), 300);
    }

    // ハイ・ローゲーム
    initHighLowGame(container) {
        this.highLowRound = 0;
        this.highLowMaxRounds = 15;
        this.currentNumber = Math.floor(Math.random() * 100) + 1;
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.highLowMaxRounds}</span>
            </div>
            <div class="game-question">現在の数字: <span id="current-number">${this.currentNumber}</span></div>
            <div class="game-question">次の数字は？</div>
            <div class="game-options">
                <button class="game-option" onclick="app.highLowAnswer('high')">HIGH (大きい)</button>
                <button class="game-option" onclick="app.highLowAnswer('low')">LOW (小さい)</button>
            </div>
        `;

        this.highLowStartTime = Date.now();
    }

    highLowAnswer(guess) {
        const reactionTime = Date.now() - this.highLowStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;

        const nextNumber = Math.floor(Math.random() * 100) + 1;
        const correct = (guess === 'high' && nextNumber > this.currentNumber) ||
                       (guess === 'low' && nextNumber < this.currentNumber);

        if (correct) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += 10;
        }

        this.currentNumber = nextNumber;
        document.getElementById('current-number').textContent = this.currentNumber;

        this.highLowRound++;
        if (this.highLowRound >= this.highLowMaxRounds) {
            setTimeout(() => this.endGame(), 500);
            return;
        }

        const progress = (this.highLowRound / this.highLowMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.highLowRound}/${this.highLowMaxRounds}`;

        this.highLowStartTime = Date.now();
    }

    // パターン記憶ゲーム
    initPatternMemoryGame(container) {
        this.patternLevel = 1;
        this.patternSequence = [];
        this.patternPlayerSequence = [];
        this.patternShowingSequence = false;
        
        container.innerHTML = `
            <div class="game-question">光る順番を覚えて再現してください</div>
            <div class="game-question">レベル: <span id="pattern-level">${this.patternLevel}</span></div>
            <div class="pattern-grid" id="pattern-grid">
                ${Array.from({length: 9}, (_, i) => 
                    `<div class="pattern-cell" onclick="app.patternClick(${i})"></div>`
                ).join('')}
            </div>
            <button class="btn btn--primary" onclick="app.startPatternRound()" id="start-pattern">開始</button>
        `;
    }

    startPatternRound() {
        this.patternSequence = [];
        this.patternPlayerSequence = [];
        
        // ランダムなパターンを生成
        for (let i = 0; i < this.patternLevel + 2; i++) {
            this.patternSequence.push(Math.floor(Math.random() * 9));
        }

        document.getElementById('start-pattern').style.display = 'none';
        this.showPatternSequence();
    }

    showPatternSequence() {
        this.patternShowingSequence = true;
        let index = 0;

        const showNext = () => {
            if (index >= this.patternSequence.length) {
                this.patternShowingSequence = false;
                this.patternStartTime = Date.now();
                return;
            }

            const cellIndex = this.patternSequence[index];
            const cells = document.querySelectorAll('.pattern-cell');
            
            cells[cellIndex].classList.add('active');
            
            setTimeout(() => {
                cells[cellIndex].classList.remove('active');
                index++;
                setTimeout(showNext, 200);
            }, 400);
        };

        showNext();
    }

    patternClick(index) {
        if (this.patternShowingSequence) return;

        this.patternPlayerSequence.push(index);
        
        // 正答チェック
        const currentIndex = this.patternPlayerSequence.length - 1;
        if (this.patternSequence[currentIndex] !== index) {
            this.endGame();
            return;
        }

        // 全て正解した場合
        if (this.patternPlayerSequence.length === this.patternSequence.length) {
            const reactionTime = Date.now() - this.patternStartTime;
            this.gameSession.reactionTimes.push(reactionTime);
            this.gameSession.correctAnswers++;
            this.gameSession.score += this.patternLevel * 15;
            this.gameSession.totalAnswers++;

            this.patternLevel++;
            document.getElementById('pattern-level').textContent = this.patternLevel;
            
            if (this.patternLevel > 6) {
                this.endGame();
                return;
            }

            document.getElementById('start-pattern').style.display = 'block';
        }
    }

    // 反応時間テストゲーム
    initReactionTimeGame(container) {
        this.reactionRound = 0;
        this.reactionMaxRounds = 5;
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.reactionMaxRounds}</span>
            </div>
            <div class="game-question" id="reaction-instruction">赤い円が緑になったらタップしてください</div>
            <div class="reaction-target" id="reaction-target" onclick="app.reactionClick()" 
                 style="background-color: red;">待機中...</div>
        `;

        setTimeout(() => this.startReactionRound(), 2000);
    }

    startReactionRound() {
        if (this.reactionRound >= this.reactionMaxRounds) {
            this.endGame();
            return;
        }

        this.reactionRound++;
        const progress = (this.reactionRound / this.reactionMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.reactionRound}/${this.reactionMaxRounds}`;

        const target = document.getElementById('reaction-target');
        const instruction = document.getElementById('reaction-instruction');
        
        target.style.backgroundColor = 'red';
        target.textContent = '待機中...';
        instruction.textContent = '赤い円が緑になったらタップしてください';
        
        this.reactionClickable = false;
        
        // ランダムな時間後に緑に変更
        setTimeout(() => {
            target.style.backgroundColor = 'green';
            target.textContent = 'タップ！';
            instruction.textContent = '今すぐタップ！';
            this.reactionStartTime = Date.now();
            this.reactionClickable = true;
        }, Math.random() * 3000 + 1000);
    }

    reactionClick() {
        if (!this.reactionClickable) {
            // フライング
            document.getElementById('reaction-instruction').textContent = 'フライング！次のラウンドを待ってください';
            setTimeout(() => this.startReactionRound(), 1500);
            return;
        }

        const reactionTime = Date.now() - this.reactionStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;
        this.gameSession.correctAnswers++;
        this.gameSession.score += Math.max(100 - Math.floor(reactionTime / 10), 10);

        const target = document.getElementById('reaction-target');
        target.style.backgroundColor = 'blue';
        target.textContent = `${reactionTime}ms`;
        
        setTimeout(() => this.startReactionRound(), 1500);
    }

    // 視覚探索ゲーム
    initVisualSearchGame(container) {
        this.searchRound = 0;
        this.searchMaxRounds = 10;
        
        container.innerHTML = `
            <div class="game-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0/${this.searchMaxRounds}</span>
            </div>
            <div class="game-question">ターゲット: <span id="search-target" style="font-weight: bold; color: red;">?</span></div>
            <div class="search-grid" id="search-grid">
                <!-- 動的に生成 -->
            </div>
        `;

        this.nextSearchRound();
    }

    nextSearchRound() {
        if (this.searchRound >= this.searchMaxRounds) {
            this.endGame();
            return;
        }

        this.searchRound++;
        const progress = (this.searchRound / this.searchMaxRounds) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.progress-text').textContent = `${this.searchRound}/${this.searchMaxRounds}`;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const targetLetter = letters[Math.floor(Math.random() * letters.length)];
        const gridSize = 64;
        
        this.currentSearchTarget = targetLetter;
        this.searchStartTime = Date.now();

        document.getElementById('search-target').textContent = targetLetter;

        // グリッド生成
        const grid = [];
        // ターゲット文字を3-5個配置
        const targetCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < targetCount; i++) {
            grid.push(targetLetter);
        }
        
        // 残りをランダムな文字で埋める
        while (grid.length < gridSize) {
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            if (randomLetter !== targetLetter) {
                grid.push(randomLetter);
            }
        }

        // シャッフル
        for (let i = grid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [grid[i], grid[j]] = [grid[j], grid[i]];
        }

        document.getElementById('search-grid').innerHTML = grid.map((letter, index) => 
            `<div class="search-char" onclick="app.searchClick('${letter}')">${letter}</div>`
        ).join('');
    }

    searchClick(letter) {
        const reactionTime = Date.now() - this.searchStartTime;
        this.gameSession.reactionTimes.push(reactionTime);
        this.gameSession.totalAnswers++;

        if (letter === this.currentSearchTarget) {
            this.gameSession.correctAnswers++;
            this.gameSession.score += Math.max(50 - Math.floor(reactionTime / 100), 10);
            
            // 正解したセルをハイライト
            event.target.classList.add('target');
            
            setTimeout(() => this.nextSearchRound(), 800);
        } else {
            // 不正解
            event.target.style.background = 'red';
            event.target.style.color = 'white';
        }
    }

    // 簡略版ゲーム実装
    initDualNBackGame(container) {
        container.innerHTML = `
            <div class="game-question">デュアルNバック (簡略版)</div>
            <p>位置と色を同時に記憶するゲームです。</p>
            <button class="btn btn--primary" onclick="app.endGame()">完了</button>
        `;
        this.gameSession.score = 50;
        this.gameSession.correctAnswers = 5;
        this.gameSession.totalAnswers = 5;
    }

    initMemoryCardGame(container) {
        container.innerHTML = `
            <div class="game-question">神経衰弱 (簡略版)</div>
            <p>カードの位置を覚えてペアを見つけるゲームです。</p>
            <button class="btn btn--primary" onclick="app.endGame()">完了</button>
        `;
        this.gameSession.score = 60;
        this.gameSession.correctAnswers = 6;
        this.gameSession.totalAnswers = 6;
    }

    initSequenceMemoryGame(container) {
        container.innerHTML = `
            <div class="game-question">順番記憶 (簡略版)</div>
            <p>光る順番を正確に覚えるゲームです。</p>
            <button class="btn btn--primary" onclick="app.endGame()">完了</button>
        `;
        this.gameSession.score = 55;
        this.gameSession.correctAnswers = 5;
        this.gameSession.totalAnswers = 5;
    }

    initWordChainGame(container) {
        container.innerHTML = `
            <div class="game-question">しりとり∞ (簡略版)</div>
            <p>単語をつなげて続けるゲームです。</p>
            <button class="btn btn--primary" onclick="app.endGame()">完了</button>
        `;
        this.gameSession.score = 40;
        this.gameSession.correctAnswers = 4;
        this.gameSession.totalAnswers = 4;
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.gameSession.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('game-timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    endGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }

        const session = this.gameSession;
        const playTime = Math.floor((Date.now() - session.startTime) / 1000);
        const accuracy = session.totalAnswers > 0 ? 
            Math.round((session.correctAnswers / session.totalAnswers) * 100) : 0;
        const avgReactionTime = session.reactionTimes.length > 0 ? 
            Math.round(session.reactionTimes.reduce((a, b) => a + b, 0) / session.reactionTimes.length) : 0;

        // 統計更新
        this.updateGameStats(session.gameId, session.score, accuracy, avgReactionTime, playTime);
        
        // ユーザーデータ更新
        this.userData.points += session.score;
        this.userData.gamesPlayed++;
        this.userData.totalPlayTime += playTime;
        
        // 今日の統計更新
        const today = new Date().toDateString();
        if (!this.userData.dailyStats[today]) {
            this.userData.dailyStats[today] = { gamesPlayed: 0, totalReactionTime: 0, gameCount: 0 };
        }
        this.userData.dailyStats[today].gamesPlayed++;
        this.userData.dailyStats[today].totalReactionTime += avgReactionTime;
        this.userData.dailyStats[today].gameCount++;

        // ストリーク更新
        if (this.userData.lastPlayDate !== today) {
            this.userData.streakDays++;
            this.userData.lastPlayDate = today;
        }

        // レベルアップチェック
        this.checkLevelUp();
        
        // バッジチェック
        const newBadges = this.checkBadges(session);

        this.saveUserData();

        // 結果画面表示
        this.showResults(session.score, accuracy, avgReactionTime, newBadges);
    }

    updateGameStats(gameId, score, accuracy, avgReactionTime, playTime) {
        if (!this.userData.gameStats[gameId]) {
            this.userData.gameStats[gameId] = {
                playCount: 0,
                bestScore: 0,
                totalScore: 0,
                totalAccuracy: 0,
                totalReactionTime: 0,
                totalPlayTime: 0
            };
        }

        const stats = this.userData.gameStats[gameId];
        stats.playCount++;
        stats.bestScore = Math.max(stats.bestScore, score);
        stats.totalScore += score;
        stats.totalAccuracy += accuracy;
        stats.totalReactionTime += avgReactionTime;
        stats.totalPlayTime += playTime;
    }

    checkLevelUp() {
        const currentLevel = this.getCurrentLevel();
        if (currentLevel.level > this.userData.level) {
            this.userData.level = currentLevel.level;
            return true;
        }
        return false;
    }

    getCurrentLevel() {
        const levels = this.gameData.levels;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (this.userData.points >= levels[i].requiredPoints) {
                return levels[i];
            }
        }
        return levels[0];
    }

    checkBadges(session) {
        const newBadges = [];
        
        // 初回プレイバッジ
        if (this.userData.gamesPlayed === 1 && !this.userData.badges.includes('first-play')) {
            this.userData.badges.push('first-play');
            newBadges.push('first-play');
        }

        // 連続プレイバッジ
        if (this.userData.streakDays >= 3 && !this.userData.badges.includes('streak-3')) {
            this.userData.badges.push('streak-3');
            newBadges.push('streak-3');
        }

        if (this.userData.streakDays >= 7 && !this.userData.badges.includes('streak-7')) {
            this.userData.badges.push('streak-7');
            newBadges.push('streak-7');
        }

        // パーフェクトスコアバッジ
        if (session.correctAnswers === session.totalAnswers && session.totalAnswers > 0 && 
            !this.userData.badges.includes('perfect-score')) {
            this.userData.badges.push('perfect-score');
            newBadges.push('perfect-score');
        }

        // スピードマスターバッジ
        const avgReaction = session.reactionTimes.reduce((a, b) => a + b, 0) / session.reactionTimes.length;
        if (avgReaction < 1000 && !this.userData.badges.includes('speed-master')) {
            this.userData.badges.push('speed-master');
            newBadges.push('speed-master');
        }

        // レベルアップバッジ
        if (this.userData.level >= 2 && !this.userData.badges.includes('level-up')) {
            this.userData.badges.push('level-up');
            newBadges.push('level-up');
        }

        // 献身的バッジ
        if (this.userData.gamesPlayed >= 100 && !this.userData.badges.includes('dedicated')) {
            this.userData.badges.push('dedicated');
            newBadges.push('dedicated');
        }

        return newBadges;
    }

    showResults(score, accuracy, avgReactionTime, newBadges) {
        document.getElementById('result-score').textContent = score;
        document.getElementById('result-accuracy').textContent = accuracy + '%';
        document.getElementById('result-reaction').textContent = avgReactionTime + 'ms';

        const badgesContainer = document.getElementById('result-badges');
        if (newBadges.length > 0) {
            badgesContainer.innerHTML = '<h3>新しいバッジ獲得！</h3>' + 
                newBadges.map(badgeId => {
                    const badge = this.gameData.badges.find(b => b.id === badgeId);
                    return `<div class="new-badge">${badge.icon} ${badge.name}</div>`;
                }).join('');
        } else {
            badgesContainer.innerHTML = '';
        }

        this.updateUI();
        this.showScreen('result');
    }

    getGamePlayCount(gameId) {
        return this.userData.gameStats[gameId] ? this.userData.gameStats[gameId].playCount : 0;
    }

    getGameBestScore(gameId) {
        return this.userData.gameStats[gameId] ? this.userData.gameStats[gameId].bestScore : 0;
    }

    getGameAvgScore(gameId) {
        const stats = this.userData.gameStats[gameId];
        return stats && stats.playCount > 0 ? 
            Math.round(stats.totalScore / stats.playCount) : 0;
    }

    updateStatsScreen() {
        this.updateOverviewTab();
        this.updateGamesTab();
        this.updateProgressTab();
    }

    updateOverviewTab() {
        document.getElementById('total-play-time').textContent = 
            Math.round(this.userData.totalPlayTime / 60) + '分';
        document.getElementById('total-games').textContent = this.userData.gamesPlayed;
        
        let bestScore = 0;
        Object.values(this.userData.gameStats).forEach(stats => {
            if (stats.bestScore > bestScore) bestScore = stats.bestScore;
        });
        document.getElementById('best-score').textContent = bestScore;
    }

    updateGamesTab() {
        const container = document.getElementById('game-stats');
        container.innerHTML = this.gameData.games.map(game => {
            const stats = this.userData.gameStats[game.id];
            if (!stats) return '';

            const avgScore = Math.round(stats.totalScore / stats.playCount);
            const avgAccuracy = Math.round(stats.totalAccuracy / stats.playCount);
            const avgReaction = Math.round(stats.totalReactionTime / stats.playCount);

            return `
                <div class="game-stat-item">
                    <div class="game-stat-header">
                        <span class="game-stat-icon">${game.icon}</span>
                        <span class="game-stat-name">${game.name}</span>
                    </div>
                    <div class="game-stat-details">
                        <div class="stat-detail">
                            <div class="stat-detail-value">${stats.playCount}</div>
                            <div class="stat-detail-label">プレイ回数</div>
                        </div>
                        <div class="stat-detail">
                            <div class="stat-detail-value">${stats.bestScore}</div>
                            <div class="stat-detail-label">最高スコア</div>
                        </div>
                        <div class="stat-detail">
                            <div class="stat-detail-value">${avgScore}</div>
                            <div class="stat-detail-label">平均スコア</div>
                        </div>
                        <div class="stat-detail">
                            <div class="stat-detail-value">${avgAccuracy}%</div>
                            <div class="stat-detail-label">平均正答率</div>
                        </div>
                    </div>
                </div>
            `;
        }).filter(html => html).join('');
    }

    updateProgressTab() {
        const container = document.getElementById('progress-chart');
        const days = ['月', '火', '水', '木', '金', '土', '日'];
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayStats = this.userData.dailyStats[dateStr];
            weekData.push({
                day: days[date.getDay()],
                games: dayStats ? dayStats.gamesPlayed : 0
            });
        }

        const maxGames = Math.max(...weekData.map(d => d.games), 1);

        container.innerHTML = `
            <div class="chart-bar">
                ${weekData.map(data => `
                    <div class="bar" style="height: ${(data.games / maxGames) * 100}%"></div>
                `).join('')}
            </div>
            <div class="chart-labels">
                ${weekData.map(data => `
                    <div class="chart-label">${data.day}<br>${data.games}</div>
                `).join('')}
            </div>
        `;
    }

    updateSettingsScreen() {
        document.getElementById('difficulty-setting').value = this.userData.settings.difficulty;
        document.getElementById('sound-setting').checked = this.userData.settings.sound;
        document.getElementById('theme-setting').value = this.userData.settings.theme;
    }

    showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        
        const themeIcon = document.getElementById('theme-toggle');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    applyTheme() {
        const theme = this.userData.settings.theme;
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
        
        const themeIcon = document.getElementById('theme-toggle');
        const isDark = theme === 'dark' || 
            (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
}

// アプリケーション初期化
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BrainTrainingApp();
});

// PWA関連
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