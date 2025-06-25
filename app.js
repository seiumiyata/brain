/* ==============================================================
   app.js  (Brain Training PWA)                  lines 1 – 650
   ============================================================== */
'use strict';

/* ---------- 0. 共通ユーティリティ ---------- */
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ---------- 1. カテゴリー付き語彙データ ---------- */
const WORD_DB = [
  { word: 'りんご', category: 'food' }, { word: 'ごはん', category: 'food' },
  { word: 'ごま',   category: 'food' }, { word: 'ごぼう', category: 'food' },
  { word: 'ねこ',   category: 'animal'},{ word: 'こいぬ', category: 'animal'},
  { word: 'さる',   category: 'animal'},{ word: 'らいおん',category: 'animal'},
  { word: 'あか',   category: 'color' },{ word: 'あお',   category: 'color' },
  { word: 'みどり', category: 'color' },{ word: 'しろ',   category: 'color' },
  /* 必要に応じて追加 */
];

/* ==============================================================
   BrainTrainingApp クラス
   ============================================================== */
class BrainTrainingApp {
  constructor() {
    /* ------ 基本状態 ------ */
    this.currentScreen  = 'loading';
    this.currentGame    = null;
    this.gameSession    = null;
    this.gameTimer      = null;
    this.gameTimeouts   = [];
    this.gameIntervals  = [];
    this.eventMap       = new Map();          // 重複防止
    this.userData       = this.loadUserData();
    this.isReady        = false;

    /* ------ ゲーム / レベル / バッジ定義 ------ */
    this.gameData = {
      games: [
        { id:'janken',  name:'後出しジャンケン', description:'指示に従って適切な手を選ぼう', icon:'✂️', exercises:['判断力','抑制制御','瞬発力'] },
        { id:'color-match',name:'カラーマッチ', description:'文字と色の一致を素早く判断', icon:'🎨',exercises:['注意力','情報処理速度','抑制制御'] },
        { id:'number-memory',name:'数字記憶', description:'数字を覚えて順番に選択', icon:'🔢',exercises:['短期記憶','集中力','視覚認知'] },
        { id:'calc-quick', name:'計算クイック', description:'素早く計算問題を解こう', icon:'➕',exercises:['計算力','処理速度','集中力'] },
        { id:'high-low',  name:'ハイ・ロー', description:'数字の大小を予想しよう', icon:'📊',exercises:['記憶力','判断力','情報処理速度'] },
        { id:'pattern-memory',name:'パターン記憶',description:'光る順番を覚えて再現', icon:'🔄',exercises:['視覚記憶','順序記憶','注意力'] },
        { id:'reaction-time',name:'反応時間テスト',description:'色が変わったら素早くタップ',icon:'⚡',exercises:['反応速度','注意力','瞬発力'] },
        { id:'visual-search',name:'視覚探索',description:'特定の文字を素早く見つけよう',icon:'🔍',exercises:['視覚的注意','探索能力','集中力'] },
        { id:'dual-nback',name:'デュアルNバック',description:'位置と音を同時追跡',icon:'🧠',exercises:['ワーキングメモリ','注意分割','認知制御'] },
        { id:'card-memory',name:'神経衰弱',description:'同じカードのペアを見つけよう',icon:'🃏',exercises:['視覚記憶','空間認知','集中力'] },
        { id:'sequence-copy',name:'順番記憶',description:'位置の順番を正確に覚えよう',icon:'📍',exercises:['空間記憶','順序記憶','注意力'] },
        { id:'shiritori-advanced',name:'しりとり∞',description:'５変化球しりとりで語彙と瞬発力UP',icon:'🌀',exercises:['語彙力','発想力','処理速度'] },
      ],
      levels:[
        {level:1,name:'ビギナー',requiredPoints:0,color:'#95a5a6'},
        {level:2,name:'アマチュア',requiredPoints:150,color:'#3498db'},
        {level:3,name:'セミプロ',requiredPoints:400,color:'#2ecc71'},
        {level:4,name:'プロ',requiredPoints:800,color:'#f39c12'},
        {level:5,name:'エキスパート',requiredPoints:1500,color:'#9b59b6'},
        {level:6,name:'マスター',requiredPoints:2500,color:'#e74c3c'},
        {level:7,name:'グランドマスター',requiredPoints:4000,color:'#1abc9c'}
      ],
      badges:[
        {id:'first-play',name:'初心者',description:'初回プレイ完了',icon:'🌟'},
        {id:'streak-3',name:'継続力',description:'3日連続プレイ',icon:'🔥'},
        {id:'streak-7',name:'習慣王',description:'7日連続プレイ',icon:'💎'},
        {id:'streak-30',name:'継続神',description:'30日連続プレイ',icon:'👑'},
        {id:'perfect-score',name:'パーフェクト',description:'ノーミス完了',icon:'🏆'},
        {id:'speed-master',name:'スピードM',description:'平均反応1秒未満',icon:'⚡'},
        {id:'point-collector',name:'ポイント王',description:'総合1000pt',icon:'💰'},
        {id:'game-master',name:'ゲームマスター',description:'全ゲーム制覇',icon:'🎮'},
        {id:'memory-king',name:'記憶王',description:'記憶系高スコア',icon:'🧠'},
        {id:'speed-demon',name:'スピード魔',description:'反応系高スコア',icon:'🚀'}
      ]
    };

    /* ------ DOM 準備完了後に init() 実行 ------ */
    (document.readyState === 'loading')
      ? document.addEventListener('DOMContentLoaded',()=>this.init())
      : this.init();
  }

  /* --------------------------------------------------------------
     2. アプリ初期化
     -------------------------------------------------------------- */
  init() {
    console.log('🟢 初期化開始');
    this.setupEvent();
    this.updateDailyStreak();
    setTimeout(()=>{
      this.showScreen(this.userData.hasSeenWelcome?'main-app':'welcome');
      if(this.userData.hasSeenWelcome) this.showAppScreen('dashboard');
      this.isReady=true;
      console.log('✅ 初期化完了');
    },1000);
  }

  /* --------------------------------------------------------------
     3. イベント一括設定
     -------------------------------------------------------------- */
  setupEvent(){
    /* Welcome */
    this.on('start-app-btn','click',()=>{
      this.userData.hasSeenWelcome=true; this.saveUserData();
      this.showScreen('main-app'); this.showAppScreen('dashboard');
    });

    /* Nav + Card + 結果ボタン（委譲） */
    this.on(document,'click',(e)=>{
      const nav=e.target.closest('.nav-item'); if(nav?.dataset.screen){
        this.showAppScreen(nav.dataset.screen); this.updateNav(nav.dataset.screen); return;
      }
      const card=e.target.closest('.game-card'); if(card?.dataset.gameId){
        this.startGame(card.dataset.gameId); return;
      }
      if(e.target.id==='play-again-btn'&&this.currentGame) this.startGame(this.currentGame.id);
      if(e.target.id==='continue-btn') this.showAppScreen('dashboard');
    });

    /* Back */
    this.on('back-to-games','click',()=>{this.stopGame();this.showAppScreen('games');});

    /* Tab */
    document.querySelectorAll('.tab-btn').forEach(btn=>{
      this.on(btn,'click',()=>this.showStatsTab(btn.dataset.tab));
    });

    this.setupSettingsInput();
  }

  /* シングルイベント登録 */
  on(elOrId, ev, fn){
    const el=(typeof elOrId==='string')?document.getElementById(elOrId):elOrId;
    if(!el) return;
    const key=`${el.id||'doc'}_${ev}`;
    if(this.eventMap.has(key)) el.removeEventListener(ev,this.eventMap.get(key));
    el.addEventListener(ev,fn,{passive:true});
    this.eventMap.set(key,fn);
  }

  /* --------------------------------------------------------------
     4. 画面表示
     -------------------------------------------------------------- */
  showScreen(id){
    document.querySelectorAll('.screen,#main-app').forEach(s=>s.classList.add('hidden'));
    (id==='main-app'?document.getElementById('main-app'):document.getElementById(`${id}-screen`))?.classList.remove('hidden');
    this.currentScreen=id;
  }

  showAppScreen(id){
    document.querySelectorAll('.app-screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById(`${id}-screen`)?.classList.remove('hidden');
    ({dashboard:()=>this.drawDashboard(),
      games:()=>this.drawGames(),
      stats:()=>this.drawStats(),
      settings:()=>this.drawSettings()})[id]?.();
  }

  updateNav(active){
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.toggle('active',i.dataset.screen===active));
  }

  /* --------------------------------------------------------------
     5. ダッシュボード描画
     -------------------------------------------------------------- */
  drawDashboard(){
    const dateEl=document.getElementById('current-date');
    dateEl.textContent=new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
    /* Stats */
    document.getElementById('total-points').textContent=this.userData.totalPoints.toLocaleString();
    document.getElementById('current-level').textContent=this.getLevel().level;
    document.getElementById('streak-count').textContent=this.userData.currentStreak;
    const played=this.userData.dailyProgress.gamesPlayed;
    document.getElementById('daily-goal-progress').textContent=`${played}/5`;
    document.getElementById('daily-progress').style.width=`${played*20}%`;
    document.getElementById('progress-text').textContent=`${played*20}%`;
    /* cards */
    this.drawRecommended(); this.drawRecentBadges();
  }

  drawRecommended(){
    const c=document.getElementById('recommended-games');
    c.innerHTML=this.pickRecommend().map(g=>`
      <div class="game-card" data-game-id="${g.id}">
        <div class="game-icon">${g.icon}</div>
        <div class="game-name">${g.name}</div>
        <div class="game-description">${g.description}</div>
        <div class="game-exercises">${g.exercises.map(e=>`<span class="exercise-tag">${e}</span>`).join('')}</div>
      </div>`).join('');
  }

  drawRecentBadges(){
    const list=document.querySelector('#recent-badges .badge-list');
    const rec=this.userData.badges.slice(-3);
    list.innerHTML=rec.length?rec.map(id=>{
      const b=this.gameData.badges.find(x=>x.id===id);
      return `<div class="badge-item earned"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div></div>`;
    }).join(''):'<p>バッジなし</p>';
  }

/* ===== Part-1 / 4 ここまで ===== */
  /* --------------------------------------------------------------
     6. ゲーム画面以外の描画
     -------------------------------------------------------------- */
  drawGames(){
    const gList=document.getElementById('games-list');
    gList.innerHTML=`
      <div class="games-grid">
        ${this.gameData.games.map(g=>`
          <div class="game-card" data-game-id="${g.id}">
            <div class="game-icon">${g.icon}</div>
            <div class="game-name">${g.name}</div>
            <div class="game-description">${g.description}</div>
          </div>`).join('')}
      </div>`;
  }

  drawStats(){ this.showStatsTab('overview'); }

  drawSettings(){
    const diff=document.getElementById('difficulty-setting');
    if(diff) diff.value=this.userData.settings.difficulty;
    const snd=document.getElementById('sound-setting');
    if(snd) snd.checked=this.userData.settings.sound;
    const rem=document.getElementById('reminder-setting');
    if(rem) rem.checked=this.userData.settings.reminders;
    const rtime=document.getElementById('reminder-time');
    if(rtime) rtime.value=this.userData.settings.reminderTime;
  }

  /* --------------------------------------------------------------
     7. ゲームループ
     -------------------------------------------------------------- */
  startGame(id){
    const game=this.gameData.games.find(x=>x.id===id);
    if(!game){alert('ゲームが見つかりません');return;}
    this.stopGame();
    this.currentGame=game;
    this.gameSession={
      gameId:id,startTime:Date.now(),score:0,
      correctAnswers:0,totalQuestions:0,responses:[]
    };
    this.showScreen('main-app');
    this.showGameScreen();
    this.runGame();
  }

  stopGame(){
    clearInterval(this.gameTimer);
    this.gameTimeouts.forEach(clearTimeout);
    this.gameIntervals.forEach(clearInterval);
    this.gameTimer=null; this.gameTimeouts=[]; this.gameIntervals=[];
    document.querySelector('.game-container')?.replaceChildren();
    this.currentGame=null; this.gameSession=null;
  }

  showGameScreen(){
    document.querySelectorAll('.app-screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('game-screen').classList.remove('hidden');
    document.querySelector('.game-title').textContent=this.currentGame.name;
    this.updateGameStats();
  }

  updateGameStats(){
    if(!this.gameSession) return;
    const t=Date.now()-this.gameSession.startTime;
    document.getElementById('game-score').textContent=`${this.gameSession.score}pt`;
    document.getElementById('game-time').textContent=
      `${Math.floor(t/60000)}:${String(Math.floor(t/1000)%60).padStart(2,'0')}`;
  }

  runGame(){
    if(!this.gameSession) return;
    this.gameTimer=setInterval(()=>this.updateGameStats(),1000);
    const fn=this[`run${this.camel(this.currentGame.id)}Game`];
    fn?fn.call(this):alert('未実装ゲーム');
  }

  camel(s){return s.split('-').map((w,i)=>i?w[0].toUpperCase()+w.slice(1):w).join('');}

  /* --------------------------------------------------------------
     8. ゲーム実装 ① 後出しジャンケン
     -------------------------------------------------------------- */
  runJankenGame(){
    const cont=document.querySelector('.game-container');
    const inst=['勝ってください','負けてください','引き分けにしてください'];
    const hands=['グー','チョキ','パー'],icons=['✊','✌️','✋'];
    let round=0,total=10;

    const next=()=>{
      if(round===total){this.finishGame();return;}
      const cHand=Math.random()*3|0;
      const instr=inst[Math.random()*3|0];
      cont.innerHTML=`
        <div class="game-question">
          <h2>第${round+1}問</h2>
          <div class="game-instruction">${instr}</div>
          <div class="computer-choice" style="font-size:4rem;margin:12px;">${icons[cHand]}</div>
        </div>
        <div class="game-options">
          ${hands.map((h,i)=>`<button class="game-option" data-i="${i}">${icons[i]}<br>${h}</button>`).join('')}
        </div>`;
      cont.querySelectorAll('.game-option').forEach(btn=>{
        btn.onclick=()=>{
          const p=+btn.dataset.i;
          const res=this.judgeJanken(p,cHand);
          const ok=(instr==='勝ってください'&&res==='win')||
                    (instr==='負けてください'&&res==='lose')||
                    (instr==='引き分けにしてください'&&res==='draw');
          this.record(ok); btn.classList.add(ok?'correct':'incorrect');
          cont.querySelectorAll('.game-option').forEach(b=>b.disabled=true);
          this.timeout(()=>{round++;next();},1200);
        };
      });
    };
    next();
  }
  judgeJanken(p,c){ if(p===c) return 'draw';
    return (p===0&&c===1)||(p===1&&c===2)||(p===2&&c===0)?'win':'lose'; }

  /* ② カラーマッチ */
  runColorMatchGame(){
    const cont=document.querySelector('.game-container');
    const words=['赤','青','緑','黄'],colors=['#e74c3c','#3498db','#2ecc71','#f1c40f'];
    let round=0,total=15;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      const textI=Math.random()*4|0, colorI=Math.random()*4|0;
      const match=textI===colorI;
      cont.innerHTML=`
        <div class="game-question">
          <h2>第${round+1}問</h2>
          <div class="game-instruction">文字と色は一致？</div>
          <div style="font-size:3rem;color:${colors[colorI]};margin:20px;">${words[textI]}</div>
        </div>
        <div class="game-options">
          <button class="game-option" data-v="true">同じ</button>
          <button class="game-option" data-v="false">違う</button>
        </div>`;
      cont.querySelectorAll('.game-option').forEach(btn=>{
        btn.onclick=()=>{
          const ok=(btn.dataset.v==='true')===match;
          this.record(ok); btn.classList.add(ok?'correct':'incorrect');
          cont.querySelectorAll('.game-option').forEach(b=>b.disabled=true);
          this.timeout(()=>{round++;next();},900);
        };
      });
    };
    next();
  }

  /* ③ 数字記憶 */
  runNumberMemoryGame(){
    const cont=document.querySelector('.game-container');
    let seq=[],round=0,total=8;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      seq.push(Math.random()*9+1|0);
      this.showSeq(seq,()=>this.inputSeq(seq,()=>{round++;next();}));
    };
    this.showSeq=(s,cb)=>{
      cont.innerHTML=`
        <div class="game-question"><h2>数字を覚えて</h2></div>
        <div class="number-display" style="font-size:3rem;margin:30px;">準備…</div>`;
      const disp=cont.querySelector('.number-display');let i=0;
      const show=()=>{
        if(i<s.length){disp.textContent=s[i++];this.timeout(show,800);}
        else {disp.textContent='入力';this.timeout(cb,500);}
      }; this.timeout(show,800);
    };
    this.inputSeq=(seq,cb)=>{
      cont.innerHTML=`
        <div class="game-question"><h2>順に選択</h2></div>
        <div class="input-display" style="margin:10px;"> </div>
        <div class="number-grid">
          ${Array.from({length:9},(_,i)=>`<button class="number-cell" data-n="${i+1}">${i+1}</button>`).join('')}
        </div>`;
      const disp=cont.querySelector('.input-display');let inp=[];
      cont.querySelectorAll('.number-cell').forEach(btn=>{
        btn.onclick=()=>{
          inp.push(+btn.dataset.n); disp.textContent=inp.join(' ');
          if(inp.length===seq.length){
            const ok=JSON.stringify(inp)===JSON.stringify(seq);
            this.record(ok);
            this.timeout(cb,1000);
          }
        };
      });
    };
    next();
  }

  /* ④ 計算クイック */
  runCalcQuickGame(){
    const cont=document.querySelector('.game-container');
    let round=0,total=15;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      let a=~~(Math.random()*20)+1,b=~~(Math.random()*20)+1,op=['+','-','×'][Math.random()*3|0],ans;
      if(op==='+') ans=a+b; else if(op==='-'){if(a<b)[a,b]=[b,a]; ans=a-b;}
      else {a=~~(Math.random()*10)+1; b=~~(Math.random()*10)+1; ans=a*b;}
      const opts=shuffleArray([ans,ans+1,ans-1,ans+2]);
      cont.innerHTML=`
        <div class="game-question"><h2>第${round+1}問</h2>
          <div class="game-instruction">結果を選べ</div>
          <div style="font-size:2.5rem;margin:15px;">${a} ${op} ${b} = ?</div></div>
        <div class="game-options">${opts.map(o=>`<button class="game-option" data-a="${o}">${o}</button>`).join('')}</div>`;
      cont.querySelectorAll('.game-option').forEach(btn=>{
        btn.onclick=()=>{
          const ok=+btn.dataset.a===ans; this.record(ok);
          btn.classList.add(ok?'correct':'incorrect');
          cont.querySelectorAll('.game-option').forEach(b=>b.disabled=true);
          this.timeout(()=>{round++;next();},800);
        };
      });
    };
    next();
  }

  /* ⑤ ハイ・ロー */
  runHighLowGame(){
    const cont=document.querySelector('.game-container');
    let round=0,total=12,prev=~~(Math.random()*100)+1;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      const current=~~(Math.random()*100)+1;
      cont.innerHTML=`
        <div class="game-question"><h2>第${round+1}問</h2>
          <div class="game-instruction">次は高い？低い？</div>
          <div style="margin:10px;">前: ${prev}</div>
          <div style="font-size:3rem;">?</div></div>
        <div class="game-options">
          <button class="game-option" data-v="high">高い</button>
          <button class="game-option" data-v="low">低い</button>
        </div>`;
      cont.querySelectorAll('.game-option').forEach(btn=>{
        btn.onclick=()=>{
          const high=current>prev, ok=(btn.dataset.v==='high')===high;
          this.record(ok);
          cont.querySelector('.game-question div[style*="font-size"]').textContent=current;
          btn.classList.add(ok?'correct':'incorrect');
          cont.querySelectorAll('.game-option').forEach(b=>b.disabled=true);
          prev=current; this.timeout(()=>{round++;next();},1200);
        };
      });
    };
    next();
  }

  /* --------------------------------------------------------------
     9. 共通レコード & 終了
     -------------------------------------------------------------- */
  record(ok){
    if(!this.gameSession) return;
    this.gameSession.totalQuestions++;
    if(ok){this.gameSession.correctAnswers++;this.gameSession.score+=10;}
    this.gameSession.responses.push({ok,time:Date.now()});
  }

  timeout(fn,ms){this.gameTimeouts.push(setTimeout(fn,ms));}

  finishGame(){ /* Part-3 で続く */ }

/* ===== Part-2 / 4 ここまで ===== */
  /* --------------------------------------------------------------
     10.  ゲーム終了 & 結果表示
     -------------------------------------------------------------- */
  finishGame(){
    if(!this.gameSession) return;
    clearInterval(this.gameTimer);
    const dur = Date.now() - this.gameSession.startTime;
    const acc = this.gameSession.totalQuestions
               ? Math.round(this.gameSession.correctAnswers/
                            this.gameSession.totalQuestions*100) : 0;
    /* ユーザーデータ更新 */
    this.updateProgress(this.gameSession.score,dur);
    /* 結果画面 */
    const c=document.querySelector('.game-container');
    const min=Math.floor(dur/60000), sec=Math.floor(dur/1000)%60;
    c.innerHTML=`
      <div class="result-container">
        <h2>ゲーム完了！</h2>
        <p class="score">スコア：${this.gameSession.score} pt</p>
        <p>正解率：${acc}% (${this.gameSession.correctAnswers}/${this.gameSession.totalQuestions})</p>
        <p>時間：${min}分${sec}秒</p>
        <div class="result-actions">
          <button id="play-again-btn" class="btn btn--primary">もう一度</button>
          <button id="continue-btn"  class="btn btn--secondary">続ける</button>
        </div>
      </div>`;
    this.gameSession=null; this.currentGame=null;
  }

  updateProgress(pt,time){
    this.userData.totalPoints+=pt;
    this.userData.dailyProgress.gamesPlayed++;
    this.userData.dailyProgress.pointsEarned+=pt;
    /* バッジチェック等は Part-4 で */
    this.saveUserData();
  }

  /* --------------------------------------------------------------
     11.  パターン記憶  pattern-memory
     -------------------------------------------------------------- */
  runPatternMemoryGame(){
    const cont=document.querySelector('.game-container');
    let seq=[],round=0,total=8;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      seq.push(Math.random()*9|0);
      this.flashPattern(seq,()=>this.inputPattern(seq,()=>{round++;next();}));
    };
    this.flashPattern=(s,cb)=>{
      cont.innerHTML=`<div class="game-question"><h2>パターンを覚えて</h2></div>
        <div class="pattern-grid">${Array.from({length:9},(_,i)=>`<div class="pat" data-i="${i}"></div>`).join('')}</div>`;
      const cells=[...cont.querySelectorAll('.pat')];
      let i=0; const show=()=>{
        if(i<s.length){
          const cell=cells[s[i++]];
          cell.classList.add('on');
          this.timeout(()=>{cell.classList.remove('on');show();},600);
        }else this.timeout(cb,800);
      }; show();
    };
    this.inputPattern=(seq,cb)=>{
      cont.innerHTML=`<div class="game-question"><h2>順番にタップ</h2></div>
        <div class="pattern-grid">${Array.from({length:9},(_,i)=>`<button class="pat" data-i="${i}"></button>`).join('')}</div>`;
      let inp=[]; cont.querySelectorAll('.pat').forEach(btn=>{
        btn.onclick=()=>{
          inp.push(+btn.dataset.i); btn.classList.add('on');
          if(inp.length===seq.length){
            this.record(JSON.stringify(inp)===JSON.stringify(seq));
            this.timeout(cb,1000);
          }
        };
      });
    };
    next();
  }

  /* --------------------------------------------------------------
     12.  反応時間テスト  reaction-time
     -------------------------------------------------------------- */
  runReactionTimeGame(){
    const cont=document.querySelector('.game-container');
    let round=0,total=10;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      cont.innerHTML=`<div class="rt-box wait">待機中…</div>`;
      const box=cont.querySelector('.rt-box'); let start;
      const delay=~~(Math.random()*3000)+1200;
      const to=this.timeout(()=>{
        box.classList.remove('wait');box.classList.add('go');box.textContent='タップ！';
        start=Date.now();
      },delay);
      box.onclick=()=>{
        if(!start) { /* 早押しミス */ this.record(false); clearTimeout(to); next(); return; }
        const t=Date.now()-start; box.textContent=`${t}ms`;
        this.record(t<1000);
        this.timeout(()=>{round++;next();},900);
      };
    };
    next();
  }

  /* --------------------------------------------------------------
     13.  視覚探索  visual-search
     -------------------------------------------------------------- */
  runVisualSearchGame(){
    const cont=document.querySelector('.game-container');
    let round=0,total=12;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      const target=String.fromCharCode(65+Math.random()*26|0);
      const size=6, cells=size*size;
      const targetCnt=1+Math.random()*3|0;
      const grid=Array.from({length:cells},()=>String.fromCharCode(65+Math.random()*26|0));
      let placed=0;
      while(placed<targetCnt){
        const p=Math.random()*cells|0;
        if(grid[p]!==target){grid[p]=target;placed++;}
      }
      cont.innerHTML=`<p>「${target}」を${targetCnt}個クリック</p>
        <div class="vs-grid">${grid.map(ch=>`<button class="vs-cell">${ch}</button>`).join('')}</div>`;
      let found=0;
      cont.querySelectorAll('.vs-cell').forEach(btn=>{
        btn.onclick=()=>{
          if(btn.textContent===target&&!btn.classList.contains('ok')){
            btn.classList.add('ok'); found++;
            if(found===targetCnt){this.record(true); this.timeout(()=>{round++;next();},800);}
          }else{this.record(false); this.timeout(()=>{round++;next();},800);}
        };
      });
    };
    next();
  }

  /* --------------------------------------------------------------
     14.  デュアル N-バック  dual-nback
     -------------------------------------------------------------- */
  runDualNbackGame(){
    const cont=document.querySelector('.game-container');
    const N=2,total=20; let seq=[],pos=[],round=0;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      const letter=String.fromCharCode(65+Math.random()*8|0);
      const p=Math.random()*9|0; seq.push(letter); pos.push(p);
      const posMatch = round>=N && pos[round]===pos[round-N];
      const letMatch = round>=N && seq[round]===seq[round-N];
      cont.innerHTML=`<div class="nb-letter">${letter}</div>
        <div class="nb-grid">${Array.from({length:9},(_,i)=>`<div class="nb-cell${i===p?' on':''}"></div>`).join('')}</div>
        <div class="nb-btns">
          <button data-t="pos">位置一致</button>
          <button data-t="let">文字一致</button>
          <button data-t="none">一致なし</button>
        </div>`;
      cont.querySelectorAll('.nb-btns button').forEach(btn=>{
        btn.onclick=()=>{
          const t=btn.dataset.t;
          const ok=(t==='pos'&&posMatch&&!letMatch)||(t==='let'&&letMatch&&!posMatch)||(t==='none'&&!posMatch&&!letMatch);
          this.record(ok); round++; this.timeout(next,600);
        };
      });
    };
    next();
  }

  /* --------------------------------------------------------------
     15.  神経衰弱  card-memory
     -------------------------------------------------------------- */
  runCardMemoryGame(){
    const cont=document.querySelector('.game-container');
    const pairs=8,deck=[];
    for(let i=0;i<pairs;i++){deck.push(i,i);} deck.sort(()=>Math.random()-0.5);
    let flip=[],matched=0;
    const draw=()=>{
      cont.innerHTML=`<div class="cm-grid">
        ${deck.map((v,i)=>`<div class="cm-card" data-i="${i}">?</div>`).join('')}</div>`;
      cont.querySelectorAll('.cm-card').forEach(card=>{
        card.onclick=()=>{
          const idx=+card.dataset.i;
          if(flip.includes(idx)||deck[idx]==='x') return;
          card.textContent=deck[idx]; flip.push(idx);
          if(flip.length===2){
            const [a,b]=flip; const ok=deck[a]===deck[b];
            this.record(ok);
            if(ok){deck[a]='x';deck[b]='x';matched++;
              if(matched===pairs){this.timeout(()=>this.finishGame(),800);}
            } else {
              this.timeout(()=>{
                cont.querySelectorAll('.cm-card').forEach((c,i)=>{
                  if(i===a||i===b) c.textContent='?';
                });
              },600);
            }
            flip=[];
          }
        };
      });
    };
    draw();
  }

  /* --------------------------------------------------------------
     16.  順番記憶  sequence-copy
     -------------------------------------------------------------- */
  runSequenceCopyGame(){
    const cont=document.querySelector('.game-container');
    let seq=[],round=0,total=8;
    const next=()=>{
      if(round===total){this.finishGame();return;}
      seq.push(Math.random()*9|0);
      this.showSeqPos(seq,()=>this.inputPos(seq,()=>{round++;next();}));
    };
    this.showSeqPos=(s,cb)=>{
      cont.innerHTML=`<div class="sc-grid">${Array.from({length:9},(_,i)=>`<div class="sc-cell" data-i="${i}">${i+1}</div>`).join('')}</div>`;
      let k=0; const cells=[...cont.querySelectorAll('.sc-cell')];
      const blink=()=>{
        if(k<s.length){
          const c=cells[s[k++]]; c.classList.add('on');
          this.timeout(()=>{c.classList.remove('on');blink();},500);
        }else this.timeout(cb,600);
      }; blink();
    };
    this.inputPos=(seq,cb)=>{
      cont.innerHTML=`<div class="sc-grid">${Array.from({length:9},(_,i)=>`<button class="sc-btn" data-i="${i}">${i+1}</button>`).join('')}</div>`;
      let inp=[];
      cont.querySelectorAll('.sc-btn').forEach(btn=>{
        btn.onclick=()=>{
          inp.push(+btn.dataset.i);
          if(inp.length===seq.length){
            this.record(JSON.stringify(inp)===JSON.stringify(seq));
            this.timeout(cb,1000);
          }
        };
      });
    };
    next();
  }

  /* --------------------------------------------------------------
     17.  しりとり∞  shiritori-advanced
     -------------------------------------------------------------- */
  runShiritoriAdvancedGame(){
    const cont=document.querySelector('.game-container');
    const modes=['theme','reverse','two','visible','bomb'];
    let round=0,total=10,last='りんご';

    const next=()=>{
      if(round===total){this.finishGame();return;}
      const m=modes[Math.random()*modes.length|0];
      ({
        theme:  ()=>this.themeRound(last,next),
        reverse:()=>this.reverseRound(last,next),
        two:    ()=>this.twoTailRound(last,next),
        visible:()=>this.visibleRound(last,next),
        bomb:   ()=>this.timeBombRound(last,next)
      })[m]();
      round++;
    };
    next();
  }

  /* -- しりとりモード実装 -- */
  themeRound(last,cb){
    const theme={food:'食べ物',animal:'動物',color:'色'};
    const catKeys=Object.keys(theme);
    const cat=catKeys[Math.random()*catKeys.length|0];
    const len=2+Math.random()*2|0;
    const list=WORD_DB.filter(w=>w.category===cat && w.word.startsWith(last.slice(-1)) && w.word.length===len);
    const correct=list[Math.random()*list.length|0];
    const opts=shuffleArray([correct?.word,...WORD_DB.filter(w=>w.category===cat&&w.word.length===len).slice(0,3).map(w=>w.word),'思いつかない']);
    cont.innerHTML=`<p>テーマ:${theme[cat]}　${len}文字</p><p>「${last}」→ ?</p>
      <div class="game-options">${opts.map(o=>`<button>${o}</button>`).join('')}</div>`;
    cont.querySelectorAll('button').forEach(btn=>{
      btn.onclick=()=>{
        const ok=btn.textContent===correct?.word||(btn.textContent==='思いつかない'&&!correct);
        this.record(ok); if(ok&&correct) last=correct.word;
        this.timeout(cb,800);
      };
    });
  }

  reverseRound(last,cb){
    cont.innerHTML=`<p>「${last}」を「ん」で終わる単語に！</p>
      <input id="rev-in" class="txt"><button id="rev-ok">決定</button>`;
    this.on('rev-ok','click',()=>{
      const v=document.getElementById('rev-in').value.trim();
      const ok=v.startsWith(last.slice(-1))&&v.endsWith('ん');
      this.record(ok); if(ok)last=v; cb();
    });
  }

  twoTailRound(last,cb){
    const tail=last.slice(-2);
    cont.innerHTML=`<p>語尾「${tail}」でスタート</p>
      <input id="two-in" class="txt"><button id="two-ok">決定</button>`;
    this.on('two-ok','click',()=>{
      const v=document.getElementById('two-in').value.trim();
      const ok=v.startsWith(tail);
      this.record(ok); if(ok)last=v; cb();
    });
  }

  visibleRound(last,cb){
    const cards=shuffleArray(WORD_DB.map(w=>w.word)).slice(0,12);
    const correct=cards.find(w=>w.startsWith(last.slice(-1)));
    cont.innerHTML=`<p>カードから選択 「${last}」→</p>
      <div class="vs-card-grid">${cards.map(w=>`<button>${w}</button>`).join('')}</div>`;
    cont.querySelectorAll('button').forEach(btn=>{
      btn.onclick=()=>{
        const ok=btn.textContent===correct;
        this.record(ok); if(ok)last=correct; cb();
      };
    });
  }

  timeBombRound(last,cb){
    const input=`<input id="bomb-in" class="txt">`;
    cont.innerHTML=`<p>3秒以内に入力 「${last}」→</p>${input}`;
    const start=Date.now();
    const t=this.timeout(()=>{this.record(false);cb();},3000);
    this.on('bomb-in','keyup',(e)=>{
      if(e.key!=='Enter') return;
      clearTimeout(t);
      const v=e.target.value.trim();
      const ok=v.startsWith(last.slice(-1));
      this.record(ok); if(ok)last=v; cb();
    });
  }

/* ===== Part-3 / 4 ここまで ===== */
  /* --------------------------------------------------------------
     18.  ユーザーデータロード / セーブ
     -------------------------------------------------------------- */
  loadUserData(){
    const def={
      hasSeenWelcome:false,totalPoints:0,currentStreak:0,lastPlayDate:null,
      dailyProgress:{date:new Date().toDateString(),gamesPlayed:0,pointsEarned:0},
      gameStats:{},badges:[],settings:{difficulty:'中級',sound:true,reminders:false,reminderTime:'20:00'}
    };
    try{
      const s=localStorage.getItem('brainTrainingData');
      return s?{...def,...JSON.parse(s)}:def;
    }catch(e){console.error(e);return def;}
  }
  saveUserData(){
    try{localStorage.setItem('brainTrainingData',JSON.stringify(this.userData));}
    catch(e){console.error('save error',e);}
  }

  /* --------------------------------------------------------------
     19.  レベル・おすすめ・ストリーク
     -------------------------------------------------------------- */
  getLevel(){
    const pts=this.userData.totalPoints;
    return [...this.gameData.levels].reverse().find(l=>pts>=l.requiredPoints)||this.gameData.levels[0];
  }
  pickRecommend(){
    const last = Object.keys(this.userData.gameStats);
    const unplayed=this.gameData.games.filter(g=>!last.includes(g.id));
    return (unplayed.length?unplayed:this.gameData.games).slice(0,3);
  }
  updateDailyStreak(){
    const today=new Date().toDateString();
    if(this.userData.lastPlayDate!==today){
      if(this.userData.lastPlayDate && (new Date(today)-new Date(this.userData.lastPlayDate)===86400000))
           this.userData.currentStreak++;
      else this.userData.currentStreak=0;
      this.userData.lastPlayDate=today;
      this.userData.dailyProgress={date:today,gamesPlayed:0,pointsEarned:0};
      this.saveUserData();
    }
  }

  /* --------------------------------------------------------------
     20.  バッジ判定
     -------------------------------------------------------------- */
  checkBadges(){
    const newB=[];
    const push=id=>{if(!this.userData.badges.includes(id)){this.userData.badges.push(id);newB.push(id);}};

    if(this.userData.dailyProgress.gamesPlayed===1) push('first-play');
    if(this.userData.currentStreak===3)  push('streak-3');
    if(this.userData.currentStreak===7)  push('streak-7');
    if(this.userData.currentStreak===30) push('streak-30');
    if(this.userData.totalPoints>=1000)  push('point-collector');
    if(Object.keys(this.userData.gameStats).length===this.gameData.games.length) push('game-master');

    /* カテゴリー別 */
    const memGames=['number-memory','pattern-memory','card-memory','sequence-copy'];
    if(memGames.some(id=>this.userData.gameStats[id]?.bestScore>=80)) push('memory-king');
    const speedGames=['reaction-time','calc-quick'];
    if(speedGames.some(id=>this.userData.gameStats[id]?.bestScore>=90)) push('speed-demon');

    if(newB.length) this.saveUserData();
  }

  /* --------------------------------------------------------------
     21.  統計タブ描画
     -------------------------------------------------------------- */
  showStatsTab(tab){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    const wrap=document.getElementById('stats-content'); if(!wrap) return;
    ({overview:()=>this.statsOverview(wrap),
      games:   ()=>this.statsGames  (wrap),
      progress:()=>this.statsProgress(wrap)}
    )[tab]();
  }

  statsOverview(w){
    const gStats=this.userData.gameStats;
    const totalGames=Object.values(gStats).reduce((s,v)=>s+v.timesPlayed,0);
    const totalTime =Object.values(gStats).reduce((s,v)=>s+v.totalTime,0);
    const avg = totalGames?Math.round(this.userData.totalPoints/totalGames):0;
    w.innerHTML=`
      <div class="overview-cards">
        <div class="stat-detail-card"><h4>総プレイ時間</h4><div class="stat-big">${Math.round(totalTime/60000)}分</div></div>
        <div class="stat-detail-card"><h4>平均スコア</h4><div class="stat-big">${avg}</div></div>
        <div class="stat-detail-card"><h4>総ゲーム</h4><div class="stat-big">${totalGames}</div></div>
        <div class="stat-detail-card"><h4>バッジ</h4><div class="stat-big">${this.userData.badges.length}</div></div>
      </div>`;
  }
  statsGames(w){
    w.innerHTML=this.gameData.games.map(g=>{
      const s=this.userData.gameStats[g.id]||{timesPlayed:0,totalScore:0,bestScore:0};
      const avg=s.timesPlayed?Math.round(s.totalScore/s.timesPlayed):0;
      return `<div class="game-stat-item">
        <div class="game-stat-icon">${g.icon}</div>
        <div class="game-stat-info">
          <div class="game-stat-name">${g.name}</div>
          <div class="game-stat-details">
            <span>回数:${s.timesPlayed}</span>
            <span>最高:${s.bestScore}</span>
            <span>平均:${avg}</span>
          </div>
        </div></div>`;
    }).join('');
  }
  statsProgress(w){
    const days=[...Array(7)].map((_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-i);
      return {d:d.toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'}),pt:Math.random()*50|0};
    }).reverse();
    w.innerHTML=`<div class="chart-container">${days.map(d=>`
       <div class="bar" style="height:${d.pt*2}px"><span>${d.pt}</span><em>${d.d}</em></div>`).join('')}
     </div>`;
  }

  /* --------------------------------------------------------------
     22.  設定入力リスナー補助
     -------------------------------------------------------------- */
  setupSettingsInput(){
    this.on('difficulty-setting','change',e=>{
      this.userData.settings.difficulty=e.target.value;this.saveUserData();});
    this.on('sound-setting','change',e=>{
      this.userData.settings.sound=e.target.checked;this.saveUserData();});
  }

  /* --------------------------------------------------------------
     23.  汎用タイムアウト登録
     -------------------------------------------------------------- */
  timeout(fn,ms){ this.gameTimeouts.push(setTimeout(fn,ms)); }

} /* ======== BrainTrainingApp class ここで終了 ======== */

/* --------------------------------------------------------------
   24.  アプリ起動 & グローバルエラー捕捉
   -------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded',()=>{
  try{ window.brainApp=new BrainTrainingApp(); }
  catch(e){ console.error('App init error',e); }
});
window.addEventListener('error',e=>console.error('GlobalErr',e.error));
window.addEventListener('unhandledrejection',e=>console.error('PromiseErr',e.reason));

/* ========================== EOF ========================== */
