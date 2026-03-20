// はじけるキラキラの個数を50個
const STAR_CONFIG = {
  COUNT: 50,
};

// オブジェクトにすることで共通化可能に
const PARTICLE_SETTINGS = {
  star: {
    text: "★",
    className: ["type-star", "type-star-glow"],
    sizeMin: 10,
    sizeMax: 30,
  },
  bubble: {
    text: "",
    className: ["type-bubble"],
    sizeMin: 20,
    sizeMax: 50,
  },
  heart: {
    text: "♥",
    className: ["type-heart"],
    sizeMin: 15,
    sizeMax: 35,
  },
  // 新しい種類を追加したければ、ここに足すだけ！関数はいじらなくていい！
};

const { COUNT } = STAR_CONFIG;

// 視差効果を減らす
const reduceMotionFeature = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// ランダムなサイズを生成
const randomSpec = (min, max) => Math.random() * (max - min) + min;

// キラキラを作る関数
const createparticle = (x, y, type) => {
  // キラキラの箱を作る
  const particle = document.createElement("span");
  particle.classList.add("pop-particle");

  // クリックされた要素を生成、なかったらスターに置き換え
  const settings = PARTICLE_SETTINGS[type] || PARTICLE_SETTINGS["star"];

  // 要素がとれなかったら開発者にエラーを促す(デバッグ中に設定消してる可能性を考慮)
  if (!settings) {
    console.error(
      `[Error] Settings for "${type}" (or default star) not found.`,
    );
    // null を返して、「作れませんでした」と伝える
    return null;
  }

  particle.textContent = settings.text;

  // 安全策: 配列じゃない場合や空の場合のエラー回避
  if (Array.isArray(settings.className) && settings.className.length > 0) {
    // クラスが複数あるとき用の拡張機能
    const randomClass =
      settings.className[Math.floor(Math.random() * settings.className.length)];
    particle.classList.add(randomClass);
  } else {
    // 万が一クラス設定がミスっていた場合の保険
    particle.classList.add("type-star");
  }

  // スタート位置
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  const size = randomSpec(settings.sizeMin, settings.sizeMax);
  particle.style.fontSize = `${size}px`;

  // 飛ぶ角度を決める
  // Math.PI * 2 は「360度」をラジアン（数学の言葉）で表したもの
  const angle = Math.random() * Math.PI * 2; // 360度
  // 飛ぶ勢いを決める
  const velocity = randomSpec(50, 250); // 飛距離

  // 3. 【翻訳開始】角度と距離を、X座標（横の移動量）に変換
  // Math.cos(角度) は「その角度のとき、横にどれくらい進む比率か(-1〜1)」を返します
  // それに距離(velocity)を掛ければ、実際のX座標が出ます
  const moveX = Math.cos(angle) * velocity;

  // 4. 【翻訳開始】角度と距離を、Y座標（縦の移動量）に変換
  // Math.sin(角度) は「その角度のとき、縦にどれくらい進む比率か(-1〜1)」を返します
  const moveY = Math.sin(angle) * velocity;

  // 移動量をpxにあてはめる
  particle.style.setProperty("--move-x", `${moveX}px`);
  particle.style.setProperty("--move-y", `${moveY}px`);

  // 描画関数に渡す
  return particle;
};

// 描画する関数
const clickAnimation = (x, y, type) => {
  // ブラウザの描画計算を一回に済ませるために仮の箱を用意
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const newparticle = createparticle(x, y, type);

    // 生成に失敗したら抜ける
    if (!newparticle) continue;

    // DOMを完全に消すことでブラウザが計算しなくていいと判断しメモリを開けてくれる
    newparticle.addEventListener(
      "animationend",
      () => {
        newparticle.remove();
      },
      { once: true },
    );
    // 仮の箱にぶち込む
    fragment.appendChild(newparticle);
  }
  // ループ抜けた後に一気に放出して一回ごとに計算されるリフロー減少を防ぐ
  document.body.appendChild(fragment);
};

// クリックで実行
const triggers = document.querySelectorAll(".effect-trigger");

triggers.forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    // 視差効果を減らす設定がオフなら抜ける
    if (reduceMotionFeature()) return;

    // <div data-type="star"> の star等の文字を取得する
    const type = trigger.dataset.type;

    // クリックされた要素の一サイズを精密に検査
    const rect = e.currentTarget.getBoundingClientRect();

    // 「左端の位置」 ＋ 「幅の半分」 ＝ 中心！
    const centerX = rect.left + rect.width / 2;
    // 「上端の位置」 ＋ 「高さの半分」 ＝ 中心！
    const centerY = rect.top + rect.height / 2;

    clickAnimation(centerX, centerY, type);
  });
});
