class CardDeck {
    constructor() {
        this.decks = {
            deck_1: [
                { id: 1, type: '0' },
                { id: 2, type: '1' },
                { id: 3, type: '2' },
                { id: 4, type: '3' },
                { id: 5, type: '4' },
                { id: 6, type: '5' },
                { id: 7, type: '6' },
                { id: 8, type: '7' },
                { id: 9, type: '8' },
                { id: 10, type: '9' },
                { id: 11, type: '10' },
                { id: 12, type: '11' },
                { id: 13, type: '12' },
                { id: 14, type: '13' },
            ],
            deck_2: [
                { id: 0, type: '0' },
                { id: 1, type: '1' },
                { id: 2, type: '2' },
                { id: 3, type: '3' },
                { id: 4, type: '4' },
                { id: 5, type: '5' },
                { id: 6, type: '6' },
                { id: 7, type: '7' },
                { id: 8, type: '8' },
                { id: 9, type: '9' },
                { id: 10, type: '10' },
                { id: 11, type: '11' },
                { id: 12, type: '12' },
                { id: 13, type: '13' },
                { id: 14, type: '14' },
                { id: 15, type: '15' },
                { id: 16, type: '16' },
                { id: 17, type: '17' },
                { id: 18, type: '18' },
                { id: 19, type: '19' },
                { id: 20, type: '0' },
                { id: 21, type: '1' },
                { id: 22, type: '2' },
                { id: 23, type: '3' },
                { id: 24, type: '4' },
                { id: 25, type: '5' },
                { id: 26, type: '6' },
                { id: 27, type: '7' },
                { id: 28, type: '8' },
                { id: 29, type: '9' },
                { id: 30, type: '10' },
                { id: 31, type: '11' },
                { id: 32, type: '12' },
                { id: 33, type: '13' },
                { id: 34, type: '14' },
                { id: 35, type: '15' },
                { id: 36, type: '16' },
                { id: 37, type: '17' },
                { id: 38, type: '18' },
                { id: 39, type: '19' },
                { id: 40, type: '0' },
                { id: 41, type: '1' },
                { id: 42, type: '2' },
                { id: 43, type: '3' },
                { id: 44, type: '4' },
                { id: 45, type: '5' },
                { id: 46, type: '6' },
                { id: 47, type: '7' },
                { id: 48, type: '8' },
                { id: 49, type: '9' },
                { id: 50, type: '10' },
                { id: 51, type: '11' },
                { id: 52, type: '12' },
                { id: 53, type: '13' },
                { id: 54, type: '14' },
                { id: 55, type: '15' },
                { id: 56, type: '16' },
                { id: 57, type: '17' },
                { id: 58, type: '18' },
                { id: 59, type: '19' },
                { id: 60, type: '0' }
            ],
            deck_3: [],
            deck_4: []
        };
    }

    // 添加卡片到指定的卡組
    addCardToDeck(deckNumber, card) {
        const deckKey = `deck_${deckNumber}`;
        if (this.decks[deckKey]) {
            this.decks[deckKey].push(card);
        } else {
            console.error(`卡組 ${deckNumber} 不存在`);
        }
    }

    // 從指定的卡組移除卡片
    removeCardFromDeck(deckNumber, cardId) {
        const deckKey = `deck_${deckNumber}`;
        if (this.decks[deckKey]) {
            this.decks[deckKey] = this.decks[deckKey].filter(card => card.id !== cardId);
        } else {
            console.error(`卡組 ${deckNumber} 不存在`);
        }
    }

    // 取得指定卡組的所有卡片
    getCardsInDeck(deckNumber) {
        const deckKey = `deck_${deckNumber}`;
        if (this.decks[deckKey]) {
            return this.decks[deckKey];
        } else {
            console.error(`卡組 ${deckNumber} 不存在`);
            return [];
        }
    }

    // 取得所有卡組的資訊
    getAllDecks() {
        return this.decks;
    }
}

module.exports = CardDeck;