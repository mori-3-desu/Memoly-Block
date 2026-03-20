// JSで「書き換え禁止」にしたい場合は Object.freeze を使います（なくても動きます）
Object.freeze(STAR_CONFIG);

function starSky() {
    const sky = document.getElementById('star-sky');

    // ▼▼▼ 【高速化テクニック：準備】 ▼▼▼
    // ※ 使う時は下の「//」を消してください
    // const fragment = document.createDocumentFragment(); 

    for(let i = 0; i < STAR_CONFIG.COUNT; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // 座標決定
        const x = Math.random() * STAR_CONFIG.SPAWN_AREA_PERCENT;
        const y = Math.random() * STAR_CONFIG.SPAWN_AREA_PERCENT;

        // サイズと影の決定
        // 「小さい星」か「大きい星」か判定
        const isSmall = Math.random() < STAR_CONFIG.SMALL_STAR_PROBABILITY;
        
        let size;
        if (isSmall) {
            // 小さい星
            size = STAR_CONFIG.MIN_SIZE_PX + Math.random();
        } else {
            // 大きい星
            size = STAR_CONFIG.MAX_SIZE_BASE_PX + Math.random() * STAR_CONFIG.SIZE_VARIATION_PX;
            // 大きい時だけクラス追加（論理積 && を使用）
            star.classList.add('glow'); 
        }

        // スタイル適用
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${Math.random() * STAR_CONFIG.ANIMATION_DURATION_VARIATION_SEC}s`;


        // ▼▼▼ 【高速化テクニック：配置】 ▼▼▼
        // 使う時はこっちのコメントを外して、下の「sky.appendChild」をコメントアウトしてください
        
        // fragment.appendChild(star); 
        
        // ↓ 今はこちら（通常モード）で動かします
        sky.appendChild(star);
    }

    // ▼▼▼ 【高速化テクニック：反映】 ▼▼▼
    // ※ 使う時は下の「//」を消してください
    // sky.appendChild(fragment);
}

starSky();