# MEMORY BLOCK

![demo](https://github.com/user-attachments/assets/dd292e8c-28be-4306-8bfa-a5c1aee1a0d6)

勉強目的で作成した Vanilla JS の記憶力ゲームです。
今回は学習がメインなのでデプロイはしていません。
詳細は [Challenge2](./Challenge2.md) へ

---

## 使用技術

**Frontend**  
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

**Tool**  
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

**Testing**  
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)

---

## 難易度選択画面

看板ボード風 TODO リストを用いた難易度選択画面です。

| カラム | 役割 |
|--------|------|
| TODO   | レベルカードの初期位置 |
| DOING  | ここにセットした難易度でプレイ開始 |
| CLEAR  | クリアした難易度を置く（達成済み管理） |

- 初回はレベル1のみ挑戦可能。他のレベルはロックされドラッグ不可
- 現在の最大レベルをクリアすると次のレベルがアンロック
- 各カラムに難易度順のソート機能あり

---

## ドラッグ処理

### 位置ずれ計算

カードの座標はデフォルトで左上基準のため、補正しないと掴んだ瞬間にカーソルがカードの左上に吸い付いてしまいます。
掴んだ瞬間にカーソルとカードの左上との差分（shift）を記録し、移動中に引くことでズレを補正しています。

```
カード左上: rect.left=100, rect.top=200
カーソル位置: clientX=130, clientY=220

shiftX = 130 - 100 = 30px（左端から30pxの位置を掴んだ）
shiftY = 220 - 200 = 20px（上端から20pxの位置を掴んだ）

移動中:
x = clientX(150) - shiftX(30) = 120px
y = clientY(250) - shiftY(20) = 230px
→ カードの左上をこの座標に移動させることでカーソルと掴んだ位置がずれない
```

### ヌルヌル動作の実現（translate3d × requestAnimationFrame）

`top` / `left` でカードを動かすとブラウザがレイアウトの再計算（リフロー）を毎フレーム行うため、カクつきが発生します。

```
top/left で移動
→ ブラウザがレイアウト再計算（リフロー）
→ 毎フレーム重い処理が走る
→ カクつく
```

`translate3d` を使うことでGPUが描画を担当し、リフローを回避できます。
Z軸を `0` にすることでGPUレイヤーに強制的に乗せています。

```js
card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
```

さらに `requestAnimationFrame` でブラウザの描画タイミング（60fps）に合わせて実行することで、無駄な計算を排除しています。

```
requestAnimationFrame
→ 描画タイミングをブラウザに委ねる
→ 無駄な中間フレームの計算が走らない
→ ヌルヌル動く
```

---

## 工夫した点

### ソート時の描画最適化

`forEach` でカードを一枚ずつ追加するとカード枚数分リフローが発生しパフォーマンスが悪化するため、スプレッド構文で一括描画しています。

```js
cards.sort((a, b) => Number(a.dataset.level) - Number(b.dataset.level));
listElement.append(...cards);
```

レベル数が増えた場合は `Map` による管理に切り替えることで対応可能です。

```js
const levelMap = {};
cards.forEach((card) => {
  levelMap[card.dataset.level] = card;
});
```
