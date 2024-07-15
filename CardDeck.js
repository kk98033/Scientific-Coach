class CardDeck {
    constructor() {
        this.decks = {
            gymnastics: [
                'gymnastics_1', 'gymnastics_2', 'gymnastics_5', 'gymnastics_6', 
                'gymnastics_9', 'gymnastics_10'
            ],
            soccer: [
                'soccer_1', 'soccer_2', 'soccer_5', 'soccer_14', 'soccer_6', 
                'soccer_9', 'soccer_10', 'soccer_13'
            ],
            tableTennis: [
                'tableTennis_1', 'tableTennis_2', 'tableTennis_5', 'tableTennis_6', 
                'tableTennis_9', 'tableTennis_10', 'tableTennis_13', 'tableTennis_14'
            ],
            shooting: [
                'shooting_1', 'shooting_2', 'shooting_5', 'shooting_6', 
                'shooting_9', 'shooting_10', 'shooting_13', 'shooting_14', 
                'shooting_17', 'shooting_18', 'shooting_21', 'shooting_22', 
                'shooting_25', 'shooting_26'
            ],
            baseball: [
                'baseball_1', 'baseball_2', 'baseball_5', 'baseball_6', 
                'baseball_9', 'baseball_10', 'baseball_13', 'baseball_14', 
                'baseball_17', 'baseball_18', 'baseball_21', 'baseball_22', 
                'baseball_25', 'baseball_26'
            ],
            judo: [
                'judo_1', 'judo_2', 'judo_5', 'judo_6', 'judo_9', 
                'judo_10', 'judo_13', 'judo_14', 'judo_17', 'judo_18'
            ]
        };

        this.C1Cards = {
            gymnastics: ['gymnastics_3', 'gymnastics_7', 'gymnastics_11'],
            soccer: ['soccer_3', 'soccer_7', 'soccer_11', 'soccer_15'],
            tableTennis: ['tableTennis_3', 'tableTennis_7', 'tableTennis_11', 'tableTennis_15'],
            shooting: ['shooting_3', 'shooting_7', 'shooting_11', 'shooting_15', 'shooting_19', 'shooting_23', 'shooting_27'],
            baseball: ['baseball_3', 'baseball_7', 'baseball_11', 'baseball_15', 'baseball_19', 'baseball_23', 'baseball_27'],
            judo: ['judo_3', 'judo_7', 'judo_11', 'judo_15', 'judo_19']
        };

        this.C2Cards = {
            gymnastics: ['gymnastics_4', 'gymnastics_8', 'gymnastics_12'],
            soccer: ['soccer_4', 'soccer_8', 'soccer_12', 'soccer_16'],
            tableTennis: ['tableTennis_4', 'tableTennis_8', 'tableTennis_12', 'tableTennis_16'],
            shooting: ['shooting_4', 'shooting_8', 'shooting_12', 'shooting_16', 'shooting_20', 'shooting_24', 'shooting_28'],
            baseball: ['baseball_4', 'baseball_8', 'baseball_12', 'baseball_16', 'baseball_20', 'baseball_24', 'baseball_28'],
            judo: ['judo_4', 'judo_8', 'judo_12', 'judo_16', 'judo_20']
        };
    }

    // 添加卡片到指定的卡組
    addCardToDeck(deckName, card, type) {
        if (this.decks[deckName]) {
            if (type === 'C1') {
                this.decks[deckName].push(...this.C1Cards[deckName]);
            } else if (type === 'C2') {
                this.decks[deckName].push(...this.C2Cards[deckName]);
            } else {
                this.decks[deckName].push(card);
            }
        } else {
            console.error(`卡組 ${deckName} 不存在`);
        }
    }

    // 從指定的卡組移除卡片
    removeCardFromDeck(deckName, cardId) {
        if (this.decks[deckName]) {
            this.decks[deckName] = this.decks[deckName].filter(card => card !== cardId);
        } else {
            console.error(`卡組 ${deckName} 不存在`);
        }
    }

    // 取得指定卡組的所有卡片，根據type來篩選
    getCardsInDeck(deckName, type) {
        if (this.decks[deckName]) {
            let deck = this.decks[deckName];
            if (type === 'C1') {
                return deck.concat(this.C1Cards[deckName]);
            } else if (type === 'C2') {
                return deck.concat(this.C2Cards[deckName]);
            } else {
                return deck;
            }
        } else {
            console.error(`卡組 ${deckName} 不存在`);
            return [];
        }
    }

    // 取得所有卡組的資訊
    getAllDecks() {
        return this.decks;
    }
}

module.exports = CardDeck;
