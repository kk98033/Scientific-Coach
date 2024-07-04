class CardDeck {
    constructor() {
        this.decks = {
            deck_1: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
            deck_2: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '0'],
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