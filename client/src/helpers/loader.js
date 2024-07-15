// src/helpers/loader.js

export function loadImages(scene) {
    // Load shooting cards
    for (let i = 1; i <= 28; i++) {
        let imageKey = `shooting_${i}`;
        let imagePath = `assets/cards/基本卡牌射擊28_7/基本卡牌射擊28_7_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }

    // Load judo cards
    for (let i = 1; i <= 20; i++) {
        let imageKey = `judo_${i}`;
        let imagePath = `assets/cards/基本卡牌柔道20_5/基本卡牌柔道20_5_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }

    // Load table tennis cards
    for (let i = 1; i <= 16; i++) {
        let imageKey = `tableTennis_${i}`;
        let imagePath = `assets/cards/基本卡牌桌球16_4/基本卡牌桌球16_4_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }

    // Load baseball cards
    for (let i = 1; i <= 28; i++) {
        let imageKey = `baseball_${i}`;
        let imagePath = `assets/cards/基本卡牌棒球28_7/基本卡牌棒球28_7_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }

    // Load soccer cards
    for (let i = 1; i <= 16; i++) {
        let imageKey = `soccer_${i}`;
        let imagePath = `assets/cards/基本卡牌足球16_4/基本卡牌足球16_4_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }

    // Load gymnastics cards
    for (let i = 1; i <= 12; i++) {
        let imageKey = `gymnastics_${i}`;
        let imagePath = `assets/cards/基本卡牌體操12_3/基本卡牌體操12_3_page-${i.toString().padStart(4, '0')}.jpg`;
        scene.load.image(imageKey, imagePath);
    }
}
