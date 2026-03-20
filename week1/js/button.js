// const count = document.getElementById('count-number');
// const buttons = document.querySelectorAll('.btn-menu');

// let currentCount = 0;

// // ボタンをクリックしたらカウントを増やす(クラスごとに加算値が変わる)
// buttons.forEach(button => {
//     button.addEventListener('click', () => {
//         // テキストから数字部分を取り出す
//         const addValue = parseInt(button.textContent);
//         // 点数を加算する
//         currentCount += addValue;
//         // 画面に反映
//         count.textContent = currentCount;
//     });
// });

const countDisplay = document.getElementById(COUNT_CONFIG.DISPLAY_ID);
const btnContainer = document.getElementById(COUNT_CONFIG.CONTAINER_ID); // 親要素を取得

let currentCount = 0;

// 【最適化】親要素にイベントリスナーを1つだけつける
btnContainer.addEventListener('click', (event) => {
    // 実際にクリックされた要素が「.btn-menu」かチェック
    // closestを使うと、ボタンの中のアイコンを押してもちゃんとボタン本体を探してくれる
    const clickedButton = event.target.closest(COUNT_CONFIG.BUTTON_SELECTOR);

    // ボタン以外の隙間をクリックした場合は無視して終了
    if (!clickedButton) return;

    // 【最適化】テキスト解析ではなく、data属性から直接数値を取得
    // 文字列として取れるので、Number() や parseInt() で変換
    const addValue = Number(clickedButton.dataset.value) || 0;

    // 計算と表示
    currentCount += addValue;
    countDisplay.textContent = currentCount;
    
    // アニメーション用のクラスを一度消して、付け直す（再発火させる技）
    countDisplay.classList.remove(COUNT_CONFIG.ANIMATION_CLASS);
    void countDisplay.offsetWidth; // 魔法の1行（ブラウザに再描画を強制させる）
    countDisplay.classList.add(COUNT_CONFIG.ANIMATION_CLASS);
});