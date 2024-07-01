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
