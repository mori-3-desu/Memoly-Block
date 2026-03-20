
/**
 *  環境チェック（a11y・酔い防止設定の確認）
 */
const shouldSkipAnimation = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};


function setupController() {
    let resizeTimer;

    // 指揮官への更新命令をデバウンス（間引き）して実行
    const handleUpdate = () => {
        // Page Visibility API: タブが非表示の時は処理をスキップ（CPU節約）
        if (document.hidden) return;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // requestAnimationFrame: ブラウザの描画タイミングに同期させる（カクつき防止）
            requestAnimationFrame(renderSnowflakes);
            requestAnimationFrame(initStarDecoration);
        }, RESIZE_TIMER);
    };

    // ResizeObserver: bodyのサイズ変化を監視
    const observer = new ResizeObserver(handleUpdate);
    observer.observe(document.body);
}

/**
 * 範囲内のランダムな数値を生成
 * @param {number} min 最小値
 * @param {number} max 最大値
 * @returns {number} 計算結果
 */
const getRandomSpec = (min, max) => Math.random() * (max - min) + min;
