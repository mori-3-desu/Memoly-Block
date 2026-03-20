/**
 * 雪のアニメーション設定
 * @type {Readonly<{
 * MOBILE_BREAKPOINT: number,
 * MOBILE_COUNT: number,
 * DESKTOP_COUNT: number,
 * SMALL_SNOW_PROBABILITY: number,
 * MOBILE_MIN_SIZE: number,
 * MOBILE_MAX_SIZE: number,
 * MIN_SIZE: number,
 * MAX_SIZE: number,
 * APPEARANCE_SPREAD: number,
 * FALL_DURATION: number,
 * RESIZE_TIMER: number
 * }>}
 */
const SNOW_CONFIG = Object.freeze({
    MOBILE_BREAKPOINT: 650,
    MOBILE_COUNT: 50,
    DESKTOP_COUNT: 200,
    SNOW_SHAPES: ['❄', '❅', '❆'],
    SMALL_SNOW_PROBABILITY: 0.7,
    MOBILE_MIN_SIZE_PX: 2,
    MOBILE_MAX_SIZE_PX: 4,
    MIN_SIZE_PX: 6,
    MAX_SIZE_PX: 10,
    APPEARANCE_SPREAD: 2,
    FALL_DURATION: 10,
    RESIZE_TIMER: 200
});

// 星飾りでデコレーションする
const DECORATION_CONFIG = Object.freeze({
    COUNT: 6,
    START_POS_X: 5,
    INTERVAL_X:  18,
    DROP_HEIGHT_VH: [22, 10, 8, 8, 10, 22],
    BASE_DELAY_MS: 100,
    MAX_RANDOM_DELAY_MS: 1000
});