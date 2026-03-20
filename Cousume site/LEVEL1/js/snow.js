// 雪を降らす処理用
const {
    MOBILE_BREAKPOINT,
    MOBILE_COUNT,
    DESKTOP_COUNT,
    SNOW_SHAPES,
    SMALL_SNOW_PROBABILITY,
    MOBILE_MIN_SIZE_PX,
    MOBILE_MAX_SIZE_PX,
    MIN_SIZE_PX,
    MAX_SIZE_PX,
    FALL_DURATION,
    APPEARANCE_SPREAD,
    RESIZE_TIMER
} = SNOW_CONFIG;

/**
 *  雪のDOM要素生成
 * @param {boolean} isMobile - モバイル判定を外部から注入
 */
function createSnow(isMobile) { // 引数を受け取るよう変更
    const snow = document.createElement('div');
    const isGlow = Math.random() > SMALL_SNOW_PROBABILITY;
    snow.textContent = SNOW_SHAPES[Math.floor(Math.random() * SNOW_SHAPES.length)];
    
    const size = isMobile 
        ? getRandomSpec(MOBILE_MIN_SIZE_PX, MOBILE_MAX_SIZE_PX) 
        : getRandomSpec(MIN_SIZE_PX, MAX_SIZE_PX);

    snow.className = isGlow ? 'snow glow' : 'snow';
    
    const style = snow.style;
    const fallDuration = getRandomSpec(0, 10) + FALL_DURATION;
    const fallDelay = getRandomSpec(0, fallDuration / APPEARANCE_SPREAD);
    
    style.setProperty('--size', size);
    style.setProperty('--left', getRandomSpec(0, 100));
    style.setProperty('--opacity', getRandomSpec(0.4, 0.9));
    style.setProperty('--fall-duration', `${fallDuration}s`);
    style.setProperty('--fall-delay', `${fallDelay}s`);
    style.setProperty('--sway-delay', `${getRandomSpec(0, 4)}s`);
    style.setProperty('--twinkle-delay', `${getRandomSpec(0, 3)}s`);

    return snow;
}

/**
 *  描画実行
 */
function renderSnowflakes() {
    const fallsContainer = document.getElementById('snow-falls'); // ここで取得
    if (!fallsContainer) return;

    // まず、フラグメントという箱を用意する
    const fragment = document.createDocumentFragment();
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // デバイスのサイズで雪を降らす個数を決める
    const COUNT = isMobile ? MOBILE_COUNT : DESKTOP_COUNT;

    for (let i = 0; i < COUNT; i++) {
        // 要素をCOUNT分箱に詰め込む
        fragment.appendChild(createSnow(isMobile)); // 引数を渡す
    }
    // ここで箱の中身を一気に放出
    // replaceChildren は中身を空にしてから追加してくれる便利なメソッド
    fallsContainer.replaceChildren(fragment);
}
