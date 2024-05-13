export default class Card {
    constructor(scene, cardId) {
        this.scene = scene;
        this.cardId = cardId;
    }

    render(x, y, sprite, type) {
        let image = this.scene.add.image(x, y, sprite).setScale(0.3, 0.3).setInteractive();
        this.scene.input.setDraggable(image);

        // Associate this Card instance with the image for easy access
        image.card = this;

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
            this.typeText.destroy();  // 銷毀額外的文字元件
        }
        this.card.destroy();  // 銷毀 Phaser 圖像物件
    }
}
