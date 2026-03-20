/**
 * =================================================================
 * ILLUMINATION TUNNEL - 最終完全版
 * =================================================================
 * * [概要]
 * Canvas APIを使用して、奥行きのある「なばなの里」風の光のトンネルを描画します。
 * 数千個の光の粒をアニメーションさせつつ、計算負荷を下げる最適化を行っています。
 * * [構成]
 * 1. CONFIG:     色や形状の設定を一元管理（マジックナンバー排除）
 * 2. MODEL:      座標計算やデータ生成を担当（ロジック）
 * 3. VIEW:       描画処理を担当（見た目）
 * 4. CONTROLLER: 全体の進行管理（初期化、ループ）
 */

/**
 * 1. CONFIG: 設定と定数の管理
 */
const CONFIG = {
  colors: {
    line: "rgba(255, 255, 255, 0.5)",       // 天井の放射線・ワイヤーの色
    curtainLine: "rgba(160, 160, 160, 0.3)", // 左右のカーテンの線の色
    ground: "gray",                         // 中央の道の色
    exit: "#999",                           // 一番奥の出口の色
    light: "rgba(255, 219, 153, 0.8)",      // 天井の光（黄色）
    whiteLight: "#ffffe8",                  // カーテンの光（白）
    blueLight: "rgb(0, 42, 255)",           // カーテンの光（青・強力発光用）
  },
  geometry: {
    lineCount: 8,        // 放射状の線の数（12分割）
    radius: 50,           // 中心の穴（出口）の半径
    sagFactor: 0.8,       // 天井ワイヤーのたわみ具合（1.0で直線、小さいほどたわむ）
    lightsPerSegment: 10, // ワイヤー1本あたりの光の数
    
    // ワイヤーと光の間隔（遠近感用）
    minSpacing: 5,        // 一番奥の間隔
    maxSpacing: 25,       // 一番手前の間隔

    curtainSlant: 0.18,   // カーテンの傾き（0=垂直、大きいほど斜め）
    curtainStepY: 15,     // カーテンの粒の縦の間隔
  },
  animation: {
    speed: 0.0008,      // 点滅の速さ（小さいほどゆっくり優雅に）
    baseAlpha: 0.6,     // 光の最低限の明るさ（0.0〜1.0）
    flickerRange: 0.4,  // 明るさが揺らぐ幅（baseAlpha + 0.0〜0.4）
  }
};

/**
 * 2. MODEL: データ生成と計算ロジック
 * 描画ループ内で重い計算をしないよう、ここで事前計算を行う
 */
const TunnelModel = {
  // 画像読み込み（非同期処理）
  loadImage: (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  },

  // 光のスタンプ画像を作成（キャッシュ用）
  // 毎回円を描画するより、作った画像をスタンプする方が高速
  createSprite: (size, stops, isAdditive = false) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    
    // 中心から外へ薄くなるグラデーション
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    stops.forEach(s => gradient.addColorStop(s.pos, s.color));
    
    ctx.fillStyle = gradient;
    if (isAdditive) ctx.globalCompositeOperation = "lighter"; // 加算合成（光を強くする）
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over"; 
    return canvas;
  },

  // 天井のワイヤー1本分のパス（ベジェ曲線）を生成
  createUnitPath: () => {
    const path = new Path2D();
    const { lineCount, sagFactor } = CONFIG.geometry;
    path.moveTo(Math.cos(Math.PI), Math.sin(Math.PI));
    
    // 円周上の点を繋いでいく
    for (let i = 0; i < lineCount; i++) {
      const angle1 = Math.PI + (i / lineCount) * Math.PI;
      const angle2 = Math.PI + ((i + 1) / lineCount) * Math.PI;
      const x2 = Math.cos(angle2);
      const y2 = Math.sin(angle2);
      
      // 中間点を内側に引っ張ることで「たわみ」を作る
      const midAngle = (angle1 + angle2) / 2;
      const cpX = Math.cos(midAngle) * sagFactor;
      const cpY = Math.sin(midAngle) * sagFactor;
      
      path.quadraticCurveTo(cpX, cpY, x2, y2);
    }
    return path;
  },

  // ★最重要: 全ての光の粒（パーティクル）の座標を計算して配列にする
  generateAllParticles: (width, height, cx, cy, maxDist) => {
    const ceiling = [];
    const curtain = [];
    // CONFIGから間隔設定などを取得
    const { radius, lineCount, sagFactor, lightsPerSegment, curtainSlant, curtainStepY, minSpacing, maxSpacing } = CONFIG.geometry;

    let r = radius; // 中心の穴からスタート
    
    // 画面外（手前）に来るまでループ
    while (r < maxDist) {
      const scale = radius / r; // 遠近感スケール（奥ほど小さく）

      // --- A. 天井イルミ (ベジェ曲線上に配置) ---
      for (let i = 0; i < lineCount; i++) {
        // セグメントごとの角度計算
        const angleA = Math.PI + (i / lineCount) * Math.PI;
        const angleB = Math.PI + ((i + 1) / lineCount) * Math.PI;
        
        // ベジェ曲線の計算用座標
        const p0 = { x: Math.cos(angleA), y: Math.sin(angleA) };
        const p2 = { x: Math.cos(angleB), y: Math.sin(angleB) };
        const p1 = { x: Math.cos((angleA + angleB)/2)*sagFactor, y: Math.sin((angleA+angleB)/2)*sagFactor };

        const limit = (i === lineCount - 1) ? lightsPerSegment : lightsPerSegment - 1;
        
        // 1本のワイヤー上に粒を並べる
        for (let j = 0; j <= limit; j++) {
          const t = j / lightsPerSegment;
          const invT = 1 - t;
          // 2次ベジェ曲線の数式
          const bx = invT**2 * p0.x + 2*invT*t * p1.x + t**2 * p2.x;
          const by = invT**2 * p0.y + 2*invT*t * p1.y + t**2 * p2.y;

          ceiling.push({
            x: bx * r, // 半径rを掛けて実際の距離に
            y: by * r,
            size: Math.max(4, r / 80), // 奥は小さく
            phase: Math.random() * 10  // 点滅タイミングをずらすための乱数
          });
        }
      }

      // --- B. カーテンイルミ (左右の壁) ---
      const startY = 0;
      const endY = cy; // 画面下まで
      for (let y = startY; y < endY; y += curtainStepY) {
        const slant = y * curtainSlant; // 斜めのズレ量
        const baseSize = Math.max(8, 5 * scale);
        
        // 座標を使って「固定された乱数」を作る（リサイズ時に色がチラつかないように）
        const seed = Math.sin(r * 0.1 + y * 0.5);
        const isBlue = Math.abs(seed) > 0.3; // 70%の確率で青

        const pData = {
          y: y - baseSize/2,
          // 青を強調するためにサイズを大きくする調整
          size: isBlue ? baseSize * 2.5 : baseSize * 0.7,
          type: isBlue ? 'blue' : 'white',
          phase: Math.random() * 10,
          isBlue: isBlue
        };

        // 左の壁の粒
        curtain.push({ ...pData, x: -r + slant - pData.size/2 });
        // 右の壁の粒
        curtain.push({ ...pData, x: r - slant - pData.size/2 });
      }

      // 次のリングまでの距離を計算（奥は狭く、手前は広く）
      const tDist = (r - radius) / (maxDist - radius);
      const currentSpacing = minSpacing + (maxSpacing - minSpacing) * tDist;
      r += currentSpacing;
    }

    return { ceiling, curtain };
  }
};

/**
 * 3. VIEW: 描画担当
 * 計算はせず、渡されたデータを描画するだけ
 */
const TunnelView = {
  // 背景画像（下半分）
  drawBackgroundImage: (ctx, width, height, bgImg) => {
    ctx.drawImage(bgImg, 0, height / 2, width, height / 2);
  },

  // カーテンの「線」を描画
  drawCurtainLines: (ctx, cx, cy, maxDist) => {
    ctx.globalCompositeOperation = "source-over"; // 通常描画
    ctx.strokeStyle = CONFIG.colors.curtainLine;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const { radius, curtainSlant, minSpacing, maxSpacing } = CONFIG.geometry;
    let r = radius;
    const slantTotal = cy * curtainSlant;

    while (r < maxDist) {
      // 左線
      ctx.moveTo(cx - r, 0);
      ctx.lineTo(cx - r + slantTotal, cy);
      // 右線
      ctx.moveTo(cx + r, 0);
      ctx.lineTo(cx + r - slantTotal, cy);

      const t = (r - radius) / (maxDist - radius);
      const currentSpacing = minSpacing + (maxSpacing - minSpacing) * t;
      r += currentSpacing;
    }
    ctx.stroke();
  },

  // カーテンの「光」を描画
  drawCurtainParticles: (ctx, cx, cy, particles, sprites, time) => {
    ctx.save();
    ctx.translate(cx, cy); // 原点を画面中心に
    ctx.globalCompositeOperation = "lighter"; // 加算合成（光らせる）

    const { speed, baseAlpha, flickerRange } = CONFIG.animation;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // 時間経過(time)と位相(p.phase)でサイン波を作る
      const flicker = (Math.sin(time * speed + p.phase) + 1) / 2; 
      // 透明度を変化させて「ゆらぎ」を表現
      ctx.globalAlpha = baseAlpha + flicker * flickerRange;

      const sprite = (p.type === 'blue') ? sprites.blue : sprites.white;
      
      ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
      
      // 青なら二重描画して輝度を倍増させる
      if (p.isBlue) {
        ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
      }
    }
    ctx.restore();
  },

  // 放射線を描画
  drawRadialLines: (ctx, cx, cy, maxDist) => {
    ctx.strokeStyle = CONFIG.colors.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const { lineCount } = CONFIG.geometry;
    for (let i = 0; i <= lineCount; i++) {
      const angle = Math.PI + (i / lineCount) * Math.PI;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxDist, cy + Math.sin(angle) * maxDist);
    }
    ctx.stroke();
  },

  // 天井ワイヤー（蜘蛛の巣状）を描画
  drawWeb: (ctx, cx, cy, maxDist, unitPath) => {
    ctx.strokeStyle = CONFIG.colors.line;
    const { radius, minSpacing, maxSpacing } = CONFIG.geometry;
    
    ctx.save();
    ctx.translate(cx, cy);
    let r = radius;
    while (r < maxDist) {
      const t = (r - radius) / (maxDist - radius);
      ctx.save();
      ctx.scale(r, r); // パスを拡大縮小して描画
      ctx.lineWidth = Math.max(0.001, 1.5 / r);
      ctx.stroke(unitPath); 
      ctx.restore();
      
      const currentSpacing = minSpacing + (maxSpacing - minSpacing) * t;
      r += currentSpacing;
    }
    ctx.restore();
  },

  // 天井の光を描画
  drawCeilingParticles: (ctx, cx, cy, particles, sprite, time) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";
    
    const { speed, baseAlpha, flickerRange } = CONFIG.animation;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const flicker = (Math.sin(time * speed + p.phase) + 1) / 2; 
      ctx.globalAlpha = baseAlpha + flicker * flickerRange;
      
      ctx.drawImage(sprite, p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.restore();
  },

  // 地面（道）と出口を描画
  drawGroundAndExit: (ctx, cx, cy, width, height) => {
    const { radius } = CONFIG.geometry;
    ctx.fillStyle = CONFIG.colors.exit;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 背景画像の下部を隠して「道」にする
    ctx.fillStyle = CONFIG.colors.ground;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  }
};

/**
 * 4. CONTROLLER: 進行管理
 */
const initApp = async () => {
  // canvas要素の取得
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  
  // 背景画像をロード完了まで待つ
  const bgImg = await TunnelModel.loadImage("images/R.JPG");

  // 各種リソースの準備
  const unitPath = TunnelModel.createUnitPath();
  const sprites = {
    yellow: TunnelModel.createSprite(32, [
      {pos:0, color:"white"}, {pos:0.2, color:CONFIG.colors.light}, {pos:1, color:"rgba(255,250,200,0)"}
    ]),
    white: TunnelModel.createSprite(32, [
      {pos:0, color:"white"}, {pos:0.3, color:CONFIG.colors.whiteLight}, {pos:1, color:"rgba(255,255,255,0)"}
    ]),
    blue: TunnelModel.createSprite(48, [ // 強力発光用
      {pos:0, color:"rgba(255,255,255,1)"}, {pos:0.1, color:"rgba(150,200,255,1)"}, 
      {pos:0.2, color:CONFIG.colors.blueLight}, {pos:1, color:"rgba(0,20,100,0)"}
    ], true)
  };

  let width, height, cx, cy, maxDist;
  let allParticles = { ceiling: [], curtain: [] };

  // 画面リサイズ時の処理
  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
    maxDist = Math.hypot(width, height);

    // 座標の全再計算（ここで行うことで描画ループを軽くする）
    allParticles = TunnelModel.generateAllParticles(width, height, cx, cy, maxDist);
  };

  // アニメーションループ（毎フレーム実行）
  const animate = () => {
    const time = performance.now();
    ctx.clearRect(0, 0, width, height);

    // --- 描画順序 (この順番が重要) ---

    // 1. 背景画像（一番奥）
    TunnelView.drawBackgroundImage(ctx, width, height, bgImg);

    // 2. カーテン (線を描いてから光を乗せる)
    TunnelView.drawCurtainLines(ctx, cx, cy, maxDist);
    TunnelView.drawCurtainParticles(ctx, cx, cy, allParticles.curtain, sprites, time);

    // 3. 放射線
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
    TunnelView.drawRadialLines(ctx, cx, cy, maxDist);

    // 4. 天井ワイヤー
    TunnelView.drawWeb(ctx, cx, cy, maxDist, unitPath);

    // 5. 天井イルミネーション
    TunnelView.drawCeilingParticles(ctx, cx, cy, allParticles.ceiling, sprites.yellow, time);

    // 6. 地面 (最後に描いて、はみ出した背景画像をマスクする)
    ctx.globalAlpha = 1.0;
    TunnelView.drawGroundAndExit(ctx, cx, cy, width, height);

    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", handleResize);
  handleResize();
  animate();
};

initApp();