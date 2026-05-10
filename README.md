# Neon Runner

ネオンダークテーマのエンドレスランナーゲームです。障害物を避けながら走り続け、ハイスコアを目指してください。時間とともにスピードが上がります。

**[Play Now](https://yuki-0903.github.io/phaser-neon-runner/)**

---

## ゲームの遊び方

- **Space キー** または **画面タップ** でジャンプ
- ピンクの障害物を避けながら走り続ける
- スコアはスピードに応じて加算（速いほど高得点）
- ハイスコアはブラウザに自動保存

---

## 技術スタック

| 技術 | バージョン |
|------|-----------|
| [Phaser](https://phaser.io/) | 4.0.0 |
| [React](https://react.dev/) | 19 |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.2 |
| [Vite](https://vitejs.dev/) | 6.3.1 |

画像アセットは一切使用せず、すべてのグラフィックをコードで生成しています。

---

## ローカルで動かす

```bash
npm install
npm run dev-nolog
```

`http://localhost:8080` をブラウザで開いてください。

---

## ビルド

```bash
npm run build-nolog
```

`dist/` フォルダに成果物が生成されます。
