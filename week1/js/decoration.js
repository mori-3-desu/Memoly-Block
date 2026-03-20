const container = document.getElementById('decoration');
const fragment = document.createDocumentFragment();

// 指定の位置に星を落とす
for(let i = 0; i < DECORATION_CONFIG.COUNT; i++) {
    const star = document.createElement('span');
    star.classList.add('star');
    star.textContent = '✯';

    // 1. 落下位置（横軸）の計算
    // 開始位置 + (間隔 * インデックス)
    const xPosition = DECORATION_CONFIG.START_POS_X + (DECORATION_CONFIG.INTERVAL_X * i);
    star.style.left = `${xPosition}%`;

    // 2. 落下地点（高さ）の設定
    // 配列から取り出してCSS変数にセット
    const height = DECORATION_CONFIG.DROP_HEIGHTS_VH[i];
    star.style.setProperty('--drop-y', `${height}vh`);

    // 3. 落下タイミングの計算
    const randomDelay = Math.random() * DECORATION_CONFIG.MAX_RANDOM_DELAY_MS;

    // フラグメントに追加
    fragment.appendChild(star);

    // 4. 落下させる
    setTimeout(() => {
        star.classList.add('is-visible');
    }, DECORATION_CONFIG.BASE_DELAY_MS + randomDelay);
}

// 最後にまとめて画面に追加
container.appendChild(fragment);