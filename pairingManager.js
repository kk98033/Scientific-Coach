class PairingManager {
    constructor() {
        this.pairingRules = {
            gymnastics: [],
            shooting: [],
            soccer: [],
            baseball: [],
            judo: [],
            tableTennis: []
        };
        this.addDefaultPairingRules();
    }

    addPairingRule(sport, rule) {
        if (this.pairingRules[sport]) {
            this.pairingRules[sport].push(rule);
        } else {
            console.error(`運動類別 ${sport} 不存在`);
        }
    }

    canPair(cards) {
        if (!cards || cards.length < 3) {
            console.error('需要至少三張卡牌才能進行配對');
            return false;
        }

        // 確認所有卡片的 sport 是否一致
        const sports = cards.map(card => card.type.split('_')[0]);
        const uniqueSports = [...new Set(sports)];
        
        if (uniqueSports.length > 1) {
            console.error('所有卡片必須屬於同一運動類別');
            return false;
        }

        const sport = uniqueSports[0];

        if (!this.pairingRules[sport]) {
            console.error(`運動類別 ${sport} 不存在`);
            return false;
        }

        return this.pairingRules[sport].some(rule => rule(...cards.filter(card => card)));
    }

    addDefaultPairingRules() {
        const sports = {
            gymnastics: [
                ['gymnastics_1', 'gymnastics_2', 'gymnastics_3'], 
                ['gymnastics_1', 'gymnastics_2', 'gymnastics_4'], 
                ['gymnastics_5', 'gymnastics_6', 'gymnastics_7'], 
                ['gymnastics_5', 'gymnastics_6', 'gymnastics_8'], 
                ['gymnastics_9', 'gymnastics_10', 'gymnastics_11'], 
                ['gymnastics_9', 'gymnastics_10', 'gymnastics_12']
            ],
            shooting: [
                ['shooting_1', 'shooting_2', 'shooting_3'], 
                ['shooting_1', 'shooting_2', 'shooting_4'], 
                ['shooting_5', 'shooting_6', 'shooting_7'], 
                ['shooting_5', 'shooting_6', 'shooting_8'], 
                ['shooting_9', 'shooting_10', 'shooting_11'], 
                ['shooting_9', 'shooting_10', 'shooting_12'],
                ['shooting_13', 'shooting_14', 'shooting_15'], 
                ['shooting_13', 'shooting_14', 'shooting_16'], 
                ['shooting_17', 'shooting_18', 'shooting_19'], 
                ['shooting_17', 'shooting_18', 'shooting_20'], 
                ['shooting_21', 'shooting_22', 'shooting_23'], 
                ['shooting_21', 'shooting_22', 'shooting_24'], 
                ['shooting_25', 'shooting_26', 'shooting_27'], 
                ['shooting_25', 'shooting_26', 'shooting_28']
            ],
            soccer: [
                ['soccer_1', 'soccer_2', 'soccer_3'], 
                ['soccer_1', 'soccer_2', 'soccer_4'], 
                ['soccer_5', 'soccer_6', 'soccer_7'], 
                ['soccer_5', 'soccer_6', 'soccer_8'], 
                ['soccer_9', 'soccer_10', 'soccer_11'], 
                ['soccer_9', 'soccer_10', 'soccer_12'], 
                ['soccer_13', 'soccer_14', 'soccer_15'], 
                ['soccer_13', 'soccer_14', 'soccer_16']
            ],
            baseball: [
                ['baseball_1', 'baseball_2', 'baseball_3'], 
                ['baseball_1', 'baseball_2', 'baseball_4'], 
                ['baseball_5', 'baseball_6', 'baseball_7'], 
                ['baseball_5', 'baseball_6', 'baseball_8'], 
                ['baseball_9', 'baseball_10', 'baseball_11'], 
                ['baseball_9', 'baseball_10', 'baseball_12'], 
                ['baseball_13', 'baseball_14', 'baseball_15'], 
                ['baseball_13', 'baseball_14', 'baseball_16'], 
                ['baseball_17', 'baseball_18', 'baseball_19'], 
                ['baseball_17', 'baseball_18', 'baseball_20'], 
                ['baseball_21', 'baseball_22', 'baseball_23'], 
                ['baseball_21', 'baseball_22', 'baseball_24'], 
                ['baseball_25', 'baseball_26', 'baseball_27'], 
                ['baseball_25', 'baseball_26', 'baseball_28']
            ],
            judo: [
                ['judo_1', 'judo_2', 'judo_3'], 
                ['judo_1', 'judo_2', 'judo_4'], 
                ['judo_5', 'judo_6', 'judo_7'], 
                ['judo_5', 'judo_6', 'judo_8'], 
                ['judo_9', 'judo_10', 'judo_11'], 
                ['judo_9', 'judo_10', 'judo_12'], 
                ['judo_13', 'judo_14', 'judo_15']
            ],
            tableTennis: [
                ['tableTennis_1', 'tableTennis_2', 'tableTennis_3'], 
                ['tableTennis_1', 'tableTennis_2', 'tableTennis_4'], 
                ['tableTennis_5', 'tableTennis_6', 'tableTennis_7'], 
                ['tableTennis_5', 'tableTennis_6', 'tableTennis_8'], 
                ['tableTennis_9', 'tableTennis_10', 'tableTennis_11'], 
                ['tableTennis_9', 'tableTennis_10', 'tableTennis_12'], 
                ['tableTennis_13', 'tableTennis_14', 'tableTennis_15'], 
                ['tableTennis_13', 'tableTennis_14', 'tableTennis_16']
            ]
        };

        Object.keys(sports).forEach(sport => {
            sports[sport].forEach(pair => {
                this.addPairingRule(sport, (card1, card2, card3) => {
                    const cardTypes = [card1.type, card2.type, card3.type];
                    return pair.every(type => cardTypes.includes(type));
                });
            });
        });
    }
}

module.exports = PairingManager;
