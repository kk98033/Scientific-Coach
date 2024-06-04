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
            [0, 1], [2, 3], [4, 5], [6, 7],
            [8, 9], [10, 11], [12, 13], [14, 15],
            [16, 17], [18, 19], [20, 0] // 確保最後一個配對覆蓋0和20
        ];
    
        pairs.forEach(pair => {
            this.addPairingRule((card1, card2) => 
                (card1.type === pair[0].toString() && card2.type === pair[1].toString()) || 
                (card1.type === pair[1].toString() && card2.type === pair[0].toString())
            );
        });
    }
    
    
}

module.exports = PairingManager;