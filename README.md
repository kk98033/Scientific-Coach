# 教練也科學 (Scientific Coach)

## 簡介
《教練也科學》是為國立臺東大學競技與運動科學學系（DSSAT）特別設計的一款卡牌桌遊。這個遊戲旨在透過趣味橫生的遊戲方式輔助教育，讓學習變得更加生動有趣。

本專案將傳統的實體桌遊轉化為網頁版，允許玩家透過網絡在移動設備上與其他玩家進行互動和遊玩。

## 使用的技術
- **Phaser 3**：一個快速、免費、開源的 HTML5 遊戲框架。
- **Socket.IO**：用於實現實時、雙向、事件驅動的通信。
- **Node.js**：版本 **v20.12.1**

## 開始遊戲
本遊戲已經部署在網絡上，你可以通過以下鏈接訪問遊戲：
[遊戲連結](#)

## 本地部署
如果你想要在本地運行《教練也科學》，請按照以下步驟：

1. 克隆儲存庫到你的本地機器：

```bash
git clone https://github.com/kk98033/Phaser-Online-Multiplayer-Card-Game.git
```

2. 進入到主目錄並安裝套件：
```bash
cd Phaser-Online-Multiplayer-Card-Game
npm install
```

3. 啟動 server
```bash
npm run start
```

4. 在另一個終端窗口，進入到 client 目錄並安裝套件：
```bash
cd client
npm install
```

5. 啟動遊戲：
```bash
npm run dev
```

6. 在瀏覽器中開啟 http://localhost:8080 來開始遊戲。