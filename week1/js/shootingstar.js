// DOM要素の取得
const sky = document.getElementById('star-sky');

/**
 * 汎用ユーティリティ：指定した範囲のランダムな数値を返す
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number}
 */
const random = (min, max) => Math.random() * (max - min) + min;

/**
 * 背景の星のエレメントを生成する
 */
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    // 確率に基づいて星のサイズを決定
    // 定数: SMALL_STAR_PROBABILITY
    const isSmall = Math.random() < STAR_CONFIG.SMALL_STAR_PROBABILITY;
    let size;

    if (isSmall) {
        // 定数: MIN_SIZE_PX
        size = Math.random() + STAR_CONFIG.MIN_SIZE_PX;
    } else {
        // 大きい星には glow（発光）クラスを付与
        // 定数: MAX_SIZE_BASE_PX, SIZE_VARIATION_PX
        size = Math.random() + STAR_CONFIG.MAX_SIZE_BASE_PX + STAR_CONFIG.SIZE_VARIATION_PX;
        star.classList.add('glow');
    }

    // スタイルの適用
    // 定数: SPAWN_AREA_PERCENT
    star.style.left = `${Math.random() * STAR_CONFIG.SPAWN_AREA_PERCENT}%`;
    star.style.top = `${Math.random() * STAR_CONFIG.SPAWN_AREA_PERCENT}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // 瞬きのタイミングをバラバラにする
    // 定数: TWINKLE_DELAY_RANGE_SEC
    star.style.animationDelay = `${Math.random() * STAR_CONFIG.TWINKLE_DELAY_RANGE_SEC}s`;

    return star;
}

/**
 * 背景に星を敷き詰める（一括追加でパフォーマンス最適化）
 */
function displayStar() {
    const fragment = document.createDocumentFragment();
    
    // 定数: COUNT
    for (let i = 0; i < STAR_CONFIG.COUNT; i++) {
        fragment.appendChild(createStar());
    }
    sky.appendChild(fragment);
}

/**
 * 流れ星のエレメントを生成する
 */
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';

    // 定数からランダムにサイズ（太さ）を決定
    // 定数: MIN_THICKNESS_PX, MAX_THICKNESS_PX
    const size = random(SHOOTING_STAR_CONFIG.MIN_THICKNESS_PX, SHOOTING_STAR_CONFIG.MAX_THICKNESS_PX);
    star.style.height = `${size}px`;
    
    // 横位置はランダム、縦位置は設定した上限(Y)の範囲内
    // 定数: SPAWN_AREA_MAX_Y_PERCENT
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * SHOOTING_STAR_CONFIG.SPAWN_AREA_MAX_Y_PERCENT}%`;

    return star;
}

/**
 * 流れ星を画面に放ち、アニメーション終了後に削除する
 */
function launchStar() {
    const shootingStar = createShootingStar();
    
    // アニメーションの速度をランダムに設定
    // 定数: MIN_DURATION_SEC, MAX_DURATION_SEC
    const duration = random(SHOOTING_STAR_CONFIG.MIN_DURATION_SEC, SHOOTING_STAR_CONFIG.MAX_DURATION_SEC);
    shootingStar.style.animationDuration = `${duration}s`;

    sky.appendChild(shootingStar);

    // メモリリーク防止のため、アニメーション終了時にDOMから削除
    shootingStar.addEventListener('animationend', () => {
        shootingStar.remove();
    }, { once: true });
}

/**
 * 流れ星の出現タイミングを再帰的にコントロールする
 */
function scheduler() {
    launchStar();
    
    // 次の星が降るまでの待ち時間をランダムに決定
    // 定数: MIN_INTERVAL_MS, MAX_INTERVAL_MS
    const nextInterval = random(SHOOTING_STAR_CONFIG.MIN_INTERVAL_MS, SHOOTING_STAR_CONFIG.MAX_INTERVAL_MS);
    setTimeout(scheduler, nextInterval);
}

// 初期化実行
displayStar();
scheduler();