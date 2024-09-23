export default class Card {
    constructor(scene, cardId, isPlayerTurn) {
        this.scene = scene;
        this.cardId = cardId;
        this.type = ""
        this.isPlayerTurn = isPlayerTurn;
        this.typeText = null;
    }

    render(x, y, sprite, type, depth = 1) {
        // 創建卡片 image，並設置縮放和拖動屬性
        let image = this.scene.add.image(x, y, sprite).setScale(0.25, 0.25).setInteractive({ draggable: this.isPlayerTurn });
        this.scene.input.setDraggable(image, this.isPlayerTurn); // 根據是否為玩家的回合設置拖動性

        // 將 card 物件附加到 image 上
        image.card = this;
        this.type = type;

        // 設置卡片的 depth 層級，如果提供了 depth 參數則使用，否則使用預設值
        image.setDepth(depth);

        // TODO: DEBUG專用
        // 當滑鼠懸停在卡片上時，顯示卡片類型文字
        image.on('pointerover', () => {
            if (!this.typeText) {
                this.typeText = this.scene.add.text(image.x, image.y - 170, type, {
                    font: '18px Arial',
                    fill: '#ffffff'
                }).setOrigin(0.5, 0.5);
                image.typeText = this.typeText;
            }
            this.typeText.setVisible(true);
        });

        // 當滑鼠移出卡片時，隱藏卡片類型文字
        image.on('pointerout', () => {
            if (this.typeText) {
                this.typeText.setVisible(false);
            }
        });

        this.card = image;
        return this;
    }

    updatePosition(x, y) {
        if (this.card) {
            this.card.x = x;
            this.card.y = y;
        }
        if (this.typeText) {
            this.typeText.x = x;
            this.typeText.y = y - 170;
        }
    }

    destroyCard() {
        console.log('debug-b', this.typeText)
        if (this.typeText) {
            this.typeText.destroy();
        }
        if (this.card) {
            this.card.destroy();
        }
    }
}
