class PairingManager {
    constructor() {
        this.pairingRules = [];
        this.addDefaultPairingRules();
    }

    addPairingRule(rule) {
        this.pairingRules.push(rule);
    }

    canPair(cards) {
        if (!cards || cards.length < 2) {
            console.error('需要至少兩張卡牌才能進行配對');
            return false;
        }
        
        return this.pairingRules.some(rule => rule(...cards.filter(card => card)));
    }

    addDefaultPairingRules() {
        // Two-card pairs
        const pairs = [
            [0, 1], [2, 3], [4, 5], [6, 7],
            [8, 9], [10, 11], [12, 13], [14, 15],
            [16, 17], [18, 19], [20, 0]
        ];

        pairs.forEach(pair => {
            this.addPairingRule((card1, card2) =>
                card1 && card2 &&
                ((card1.type === pair[0].toString() && card2.type === pair[1].toString()) ||
                 (card1.type === pair[1].toString() && card2.type === pair[0].toString()))
            );
        });

        // Three-card pairs
        const triples = [
            [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]
        ];

        triples.forEach(triple => {
            this.addPairingRule((card1, card2, card3) =>
                card1 && card2 && card3 &&
                ((card1.type === triple[0].toString() && 
                  card2.type === triple[1].toString() && 
                  card3.type === triple[2].toString()) ||

                 (card1.type === triple[1].toString() && 
                  card2.type === triple[2].toString() && 
                  card3.type === triple[0].toString()) ||

                 (card1.type === triple[2].toString() && 
                  card2.type === triple[0].toString() && 
                  card3.type === triple[1].toString()))
            );
        });

        // All cards of the same type
        this.addPairingRule((...cards) =>
            cards.every(card => card && card.type === cards[0].type)
        );
    }
}

module.exports = PairingManager;
