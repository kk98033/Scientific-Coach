// src/helpers/renderCard.js

export function renderCard(scene, x, y, cardType) {
    // let cardImageKey = `${card}_${type}`;
    scene.add.image(x, y, cardType);
}
