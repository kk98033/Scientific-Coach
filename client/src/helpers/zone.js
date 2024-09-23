export default class Zone {
    constructor(scene) {
        this.scene = scene;
        this.gridZones = []; // 儲存所有的格子區域
        this.zoneOutlines = []; // 儲存所有格子的外框
    }

    renderZone() {
        const rows = 2;
        const cols = 4;
        const colGap = 20; // 列間距
        const rowGap = 50; // 行間距
        const width = 200; // 每個格子的寬度
        const height = 250; // 每個格子的高度
        const startX = 400; // 第一個格子的 X 座標
        const startY = 200; // 第一個格子的 Y 座標

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x = startX + col * (width + colGap);
                let y = startY + row * (height + rowGap);
                let dropZone = this.scene.add.zone(x, y, width, height).setRectangleDropZone(width, height);
                dropZone.setData({ cards: 0 });
                this.gridZones.push(dropZone);
                let outline = this.renderOutline(dropZone);
                this.zoneOutlines.push(outline);
            }
        }

        return this.gridZones;
    }

    // 繪製新增卡片區域的外框
    renderNewCardZone() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const cardWidth = 200; // 卡片的寬度
        const rowHeight = 300; // 每 row 的高度
        const baseY = screenHeight / 2 + 50; // 將卡片顯示在螢幕的正中央下方
    
        const newCardX = screenWidth - 150; // 新卡片的 X 座標
        const newCardY = baseY - 30; // Y 座標固定為中央下方
    
        const newCardZone = this.scene.add.zone(newCardX, newCardY, cardWidth, rowHeight).setRectangleDropZone(cardWidth, rowHeight);
        this.gridZones.push(newCardZone);
    
        // 顯示新增卡片區塊的外框
        const outline = this.renderOutline(newCardZone);
        this.zoneOutlines.push(outline);

        // 在卡片區域內側上方顯示文字
        const textX = newCardX; // 將文字的 X 座標設置為區域的中心
        const textY = newCardY - rowHeight / 2 + 10; // 將文字放置在區域內部的上方，向下偏移一點
        const label = this.scene.add.text(textX, textY, "新卡牌區域", {
            font: "24px Arial", // 設置粗體字
            fill: "#808080" // 設置灰色字體
        }).setOrigin(0.5, 0); // 設置文字居中水平對齊，且從上邊開始對齊
    
        return newCardZone;
    }

    renderOutline(dropZone) {
        let dropZoneOutline = this.scene.add.graphics();
        dropZoneOutline.lineStyle(2, 0xff69b4);
        dropZoneOutline.strokeRect(
            dropZone.x - dropZone.input.hitArea.width / 2,
            dropZone.y - dropZone.input.hitArea.height / 2,
            dropZone.input.hitArea.width,
            dropZone.input.hitArea.height
        );
        return dropZoneOutline;
    }

    highlightZone(index) {
        this.zoneOutlines[index].clear();
        this.zoneOutlines[index].lineStyle(6, 0xff0000); // 高亮顯示的顏色 (紅色)，線條加粗
        this.zoneOutlines[index].strokeRect( 
            this.gridZones[index].x - this.gridZones[index].input.hitArea.width / 2,
            this.gridZones[index].y - this.gridZones[index].input.hitArea.height / 2,
            this.gridZones[index].input.hitArea.width,
            this.gridZones[index].input.hitArea.height
        );
    }
    

    clearHighlightZone(index) {
        this.zoneOutlines[index].clear();
        this.zoneOutlines[index].lineStyle(2, 0xff69b4); // 恢復原來的顏色
        this.zoneOutlines[index].strokeRect(
            this.gridZones[index].x - this.gridZones[index].input.hitArea.width / 2,
            this.gridZones[index].y - this.gridZones[index].input.hitArea.height / 2,
            this.gridZones[index].input.hitArea.width,
            this.gridZones[index].input.hitArea.height
        );
    }
}
