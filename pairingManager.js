class PairingManager {
    constructor() {
        this.pairingRules = [];
        this.addDefaultPairingRules();
    }

    addPairingRule(rule) {
        this.pairingRules.push(rule);
    }

    canPair(card1, card2) {
        return this.pairingRules.some(rule => rule(card1, card2));
    }

    addDefaultPairingRules() {
        const pairs = [
            [1, 2], [3, 4], [5, 6], [7, 8],
            [9, 10], [11, 12], [13, 14]
        ];

        pairs.forEach(pair => {
            this.addPairingRule((card1, card2) => 
                (card1.id === pair[0] && card2.id === pair[1]) || 
                (card1.id === pair[1] && card2.id === pair[0])
            );
        });
    }
}

module.exports = PairingManager;