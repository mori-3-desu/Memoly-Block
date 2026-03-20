// 星飾り用
const {
    COUNT,
    START_POS_X,
    INTERVAL_X,
    DROP_HEIGHT_VH,
    BASE_DELAY_MS,
    MAX_RANDOM_DELAY_MS
} = DECORATION_CONFIG;

// 星を作る関数
function decorationStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    star.textContent = '✯';
    return star;
}

/**
 * 役割2: 全体の指揮・実行 (Controller)
 * ループ、計算、DOM追加、アニメーション開始を管理
 */
function initStarDecoration() {
    const container = document.getElementById('decoration');
    if (!container) return;

    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    // ループはここで回すのが正解！
    for(let i = 0; i < COUNT; i++) {
        // 1. 工場から星をもらってくる
        const star = decorationStar();

        // 2. 位置（横）の計算
        const xPosition = START_POS_X + (INTERVAL_X * i);
        star.style.left = `${xPosition}%`;

        // 3. 高さの計算
        // 配列の要素数を超えないように安全策 ( % 演算子 )
        const height = DROP_HEIGHT_VH[i % DROP_HEIGHT_VH.length];
        star.style.setProperty('--drop-y', `${height}vh`);

        // 4. ランダムに輝きをつける
        const twinkleDelay = Math.random() * 2;
        star.style.setProperty('--delay', `${twinkleDelay}s`);

        // 5. フラグメントという「お盆」に乗せる
        fragment.appendChild(star);

        // 6. アニメーション（setTimeout）の予約
        // ここに書くのが正解です！
        const randomDelay = Math.random() * MAX_RANDOM_DELAY_MS;
        
        setTimeout(() => {
            // requestAnimationFrameで囲むと、より滑らかに動きます
            requestAnimationFrame(() => {
                star.classList.add('is-visible');
            });
        }, BASE_DELAY_MS + randomDelay);
    }

    // 最後にまとめて画面に追加
    container.appendChild(fragment);
}