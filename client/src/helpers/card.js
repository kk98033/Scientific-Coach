export default class Card {
    constructor(scene) {
        this.scene = scene;
    }

    render(x, y, sprite, type) {
        let card = this.scene.add.image(x, y, sprite).setScale(0.3, 0.3).setInteractive();
        this.scene.input.setDraggable(card);

        // Adding type display on hover
        let typeText;
        card.on('pointerover', () => {
            typeText = this.scene.add.text(x, y - 50, type, {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5, 0.5);
        });

        card.on('pointerout', () => {
            if (typeText) {
                typeText.destroy();
            }
        });

        return card;
    }
}
