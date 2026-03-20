// CSSの変数（--widthなど）を読み取る
const rootStyles = getComputedStyle(document.documentElement);

// 横スクロールアニメーション
const SCROLL_CONFIG = {
    currentSpeed: 1, // 横スクロールの速さ

    // CSSの --width から数値だけを取り出す
    width:  parseInt(rootStyles.getPropertyValue('--width')) || 1200,
    height: parseInt(rootStyles.getPropertyValue('--height')) || 600,

    // スクロール幅は画像の幅と同じにするなら width を流用
    get scroll() { return this.width; }
};

//画像を二枚に並べる
const scroll = document.getElementById('scroll-container');
const animation = document.getElementById('scroll-image');

function fitScreen() {
    if(!scroll) return;

    //現在の縦横の幅を取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scaleX = width  / SCROLL_CONFIG.width;
    const scaleY = height / SCROLL_CONFIG.height;

    //小さいほうに合わせて形を崩さず縮小
    const scale = Math.min(scaleX, scaleY);

    scroll.style.transform = `translate(-50%, -50%) scale(${scale})`;;
}

let current = 0;
//横スクロール関数
function scrollAnimation() {
    if(!animation) return;
    //スピード調整
    current -= SCROLL_CONFIG.currentSpeed;
    //1200(サイズによって変更)になったら戻る
    if(current <= -(SCROLL_CONFIG.scroll * 2)) {
        current = 0;
    }

    animation.style.transform = `translateX(${current}px)`;
    //-1200より大きくなるまで実行
    requestAnimationFrame(scrollAnimation);
}

scrollAnimation();

//画像サイズが変わるたび計算しなおす
window.addEventListener('load', fitScreen);
window.addEventListener('resize', fitScreen);

