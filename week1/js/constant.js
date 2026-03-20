// =================================================================
// 定数定義ファイル (constants.js)
// ※ 値を変更しない設定値は「大文字_スネークケース」で書くのが鉄則！
// =================================================================

// 星空（背景）の設定
const STAR_CONFIG = {
    COUNT: 350,                     // 星の総数
    SPAWN_AREA_PERCENT: 100,        // 配置エリアの広さ（%）
    SMALL_STAR_PROBABILITY: 0.8,    // 小さい星が出る確率（0.8 = 80%）
    
    // サイズ設定 (単位: px)
    MIN_SIZE_PX: 1,                 // 最小サイズ
    MAX_SIZE_BASE_PX: 2,            // 基準となる最大サイズ
    SIZE_VARIATION_PX: 2.5,         // ランダムで足される大きさの振れ幅
    
    // アニメーション設定 (単位: 秒)
    ANIMATION_DURATION_VARIATION_SEC: 5, // アニメーション時間のばらつき
    TWINKLE_DELAY_RANGE_SEC: 3           // 星の瞬き（点滅）開始タイミングのばらつき
};

// 流れ星の設定
const SHOOTING_STAR_CONFIG = {
    // 見た目 (単位: px)
    MIN_THICKNESS_PX: 2,            // 太さの最小値
    MAX_THICKNESS_PX: 5,            // 太さの最大値
    SPAWN_AREA_MAX_Y_PERCENT: 30,   // 出現する高さの範囲（上部30%以内）

    // 速度 (単位: 秒)
    MIN_DURATION_SEC: 0.5,          // アニメーション速度の最速値
    MAX_DURATION_SEC: 0.9,          // アニメーション速度の最遅値

    // 出現間隔 (単位: ミリ秒)
    MIN_INTERVAL_MS: 400,           // 次の星が出るまでの最短待ち時間
    MAX_INTERVAL_MS: 1200           // 次の星が出るまでの最長待ち時間
};

// 雪のアニメーション設定
const SNOW_CONFIG = {
    COUNT: 300,                     // 雪の数
    SMALL_SNOW_PROBABILITY: 0.8,    // 小さい雪の確率（0.8 = 80%）
    
    // サイズ (単位: px)
    MIN_SIZE_PX: 4,                 // 雪の最小サイズ
    MAX_SIZE_PX: 8,                 // 雪の最大サイズ
    
    // 落下速度 (単位: 秒)
    FALL_DURATION_SEC: 15           // 雪が上から下まで落ちるのにかかる時間
};

// カウント機能の設定
const COUNT_CONFIG = {
    DISPLAY_ID: 'count-number',      // 数字を表示する要素のID
    CONTAINER_ID: 'count-button',    // ボタンを囲む親要素のID
    BUTTON_SELECTOR: '.btn-menu',    // クリック対象のボタンのクラス
    ANIMATION_CLASS: 'bump'          // アニメーション用のクラス名
};

// 飾り（オーナメント・星）の設定
const DECORATION_CONFIG = {
    COUNT: 6,                       // 飾りの数
    START_POS_X: 10,                // 最初の星の配置位置 (単位: %)
    INTERVAL_X: 16,                 // 星同士の間隔 (単位: %)
    
    // 落下地点の高さ設定 (単位: vh) ※V字になるように設定
    DROP_HEIGHTS_VH: [15, 8, 5, 5, 8, 15],

    // アニメーションのタイミング (単位: ミリ秒)
    BASE_DELAY_MS: 100,             // 共通で必ず待つ初期待機時間
    MAX_RANDOM_DELAY_MS: 1000       // ランダムに遅らせる最大時間
};