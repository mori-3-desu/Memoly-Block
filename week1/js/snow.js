/**
 * @typedef {Object} SnowConfig
 * @property {number} count
 * @property {number} smallSnow
 * @property {number} minSize
 * @property {number} maxSize
 * @property {number} animationDuration
 */

// @ts-check
Object.freeze(SNOW_CONFIG);

/**
 * ランダムな数値を取得するユーティリティ関数
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const getRandom = (min, max) => Math.random() * (max - min) + min;

/**
 * 雪の粒（Element）を一つ生成する
 * @returns {HTMLDivElement}
 */
function createSnowflake() {
    const snow = document.createElement('div');
    const isGlow = Math.random() > SNOW_CONFIG.SMALL_SNOW_PROBABILITY;
    const size = getRandom(SNOW_CONFIG.MIN_SIZE_PX, SNOW_CONFIG.MAX_SIZE_PX);
    
    snow.className = isGlow ? 'snow glow' : 'snow';

    const style = snow.style;
    
    // 1. まず落下時間を計算（例: 15s 〜 25s）
    const fallDuration = getRandom(0, 10) + SNOW_CONFIG.FALL_DURATION_SEC;
    
    // 2. 落下時間と同じ範囲でマイナスのディレイを作る
    // これにより、画面の「どこか途中」からスタートするようになります
    const fallDelay = getRandom(0, fallDuration); 

    style.setProperty('--size', `${size}px`);
    style.setProperty('--left', `${getRandom(0, 100)}vw`);
    style.setProperty('--opacity', getRandom(0.4, 0.9).toString());
    style.setProperty('--fall-duration', `${fallDuration}s`);
    style.setProperty('--fall-delay', `-${fallDelay}s`); // ここにマイナスをつける
    style.setProperty('--sway-delay', `-${getRandom(0, 4)}s`);
    style.setProperty('--twinkle-delay', `-${getRandom(0, 3)}s`);

    return snow;
}

/**
 * 雪を降らせるメイン処理
 */
function initSnowfall() {
    const container = document.getElementById('snow_falls');
    if (!container) return;

    // DocumentFragmentを使用してDOM操作を1回にまとめる（最適化）
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < SNOW_CONFIG.COUNT; i++) {
        fragment.appendChild(createSnowflake());
    }

    container.appendChild(fragment);
}

window.addEventListener('load', () => {
    initSnowfall();
});