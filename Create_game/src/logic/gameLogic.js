import { board } from "../ui/dom.js";
import { delay, PLAYING } from "../utils/constants.js";

const SHINE = "is-shine";
const IDLE = 100;

// ── メイン処理 ──────────────────────────────────────────

// 順番に光らせる関数
export const flashAnimation = async (config, signal) => {
  const blocks = board.children; // まずボードを取得(定数フォルダにある board)
  const { flashCount, flashSpeed } = config; // configのlevelSettingsを受け取る

  const lastIndex = Math.floor(Math.random() * blocks.length); // 初回もランダムな値を渡す
  const sequence = generateSequence(flashCount, blocks.length, lastIndex);

  // 正解の配列を見て光らせる
  for (const index of sequence) {
    const target = blocks[index]; // sequence配列順に光らせる

    target.classList.add(SHINE);
    await delay(flashSpeed);
    target.classList.remove(SHINE);

    if (signal?.aborted) return null; // 中断されたら配列は返さず抜ける。

    await delay(IDLE); // 光ってる最中に次のblockが光るのでタメを作る
  }

  // アニメーション終了直後にアボートされてたらPLAYINGにつなげない
  if (signal?.aborted) return null;

  // 全部光らせたらプレイフラグを付けてボードをクリック可能にする
  board.classList.add(PLAYING);
  return sequence; // 正解の配列でconfigを上書き
};

// ── 部品 ────────────────────────────────────────────────

// 正解の配列を生成
export const generateSequence = (count, length, lastIndex) => {
  const sequence = []; // 正解の配列を入れる
  let current = lastIndex;

  // 正解の配列に代入
  for (let i = 0; i < count; i++) {
    // ランダムに光らせ、連続で同じ場所に配置されないbeautifulな計算式
    const cellIndices = Math.floor(Math.random() * (length - 1)) + 1;
    current = (current + cellIndices) % length;
    sequence.push(current); // 正解の数字を配列に入れる
  }
  return sequence;
};
