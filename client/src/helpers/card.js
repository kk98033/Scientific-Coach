export default class Card {
    constructor(scene, cardId, isPlayerTurn) {
        this.scene = scene;
        this.cardId = cardId;
        this.type = ""
        this.isPlayerTurn = isPlayerTurn;
    }

    render(x, y, sprite, type) {
        let image = this.scene.add.image(x, y, sprite).setScale(0.25, 0.25).setInteractive({ draggable: this.isPlayerTurn });
        this.scene.input.setDraggable(image, this.isPlayerTurn); // 根據是否為玩家的回合設置拖動性

        image.card = this;
        this.type = type;

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

    destroy() {
        if (this.typeText) {
            this.typeText.destroy();
        }
        this.card.destroy();
    }
}
