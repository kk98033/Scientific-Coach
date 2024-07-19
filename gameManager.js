const PairingManager = require('./pairingManager');
const CardDeck = require('./CardDeck');

class GameManager {
    constructor(io, gameRoomManager) {
        this.io = io;
        this.gameRoomManager = gameRoomManager;
        this.currentState = 'PlayerTurn';
        this.pairingManager = new PairingManager();
        this.cardDeckManager = new CardDeck();

        // DEBUG //
        // { 
        //     id: [唯一的數字ID, 從1到50], 
        //     type: '[卡片的類型，‘0’, ‘1’, ‘2’, ‘3’, ‘4’...]' 
        // }

        // this.debugCards = [];
        // for (let i = 0; i <= 60; i++) {
        //     this.debugCards.push({ 
        //         id: i, 
        //         type: (i % 20).toString() 
        //     });
        // }
        // console.log(this.debugCards); 
    }

    changeState(newState) {
        console.log(`State changed from ${this.currentState} to ${newState}`);
        this.currentState = newState;
        this.handleStateChange();
    }

    handleStateChange() {
        switch (this.currentState) {
            case 'ShufflingDeck':
                this.shuffleDeck();
                this.changeState('DealingCards');
                break;
            case 'DealingCards':
                this.dealInitialCards();
                this.changeState('PlayerTurn');
                break;
            case 'PlayerTurn':
                // 等待玩家操作
                break;
            case 'EvaluatingMove':
                this.evaluateMove();
                // Decide next state based on evaluation
                break;
            case 'EndOfGame':
                this.endGame();
                break;
        }
    }

    startTurnTimer(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room) return; // 檢查房間是否存在

        room.turnTimer = room.settings.roundTime; // TODO: 設定時間
        room.timer = setInterval(() => {
            room.turnTimer--;
            console.log(`Remaining time for player ${room.currentPlayerIndex} in room ${roomId}: ${room.turnTimer} seconds`);
            this.io.to(roomId).emit('update_timer', { turnTimer: room.turnTimer });

            if (room.turnTimer <= 0) {
                clearInterval(room.timer);
                this.io.to(roomId).emit('time_to_discard_some_cards', { turnTimer: room.turnTimer });
                
                // 新增 10 秒的計時器
                let discardTimer = 10;
                room.discardTimer = setInterval(() => {
                    discardTimer--;
                    this.io.to(roomId).emit('discard_timer', { discardTimer: discardTimer });
                    if (discardTimer <= 0) {
                        clearInterval(room.discardTimer);
                        
                        // 清空 room.currentSelected
                        room.currentSelected = [];

                        // 隨機選擇兩張卡片加入 currentSelected
                        const playerId = room.players[room.currentPlayer];
                        const playerHand = room.hands[playerId];
                        console.log("-----------")
                        console.log()
                        console.log()
                        console.log()
                        console.log("暴風雨前寧靜")
                        console.log("-----ROOM----")
                        console.log(room)
                        console.log("-----ROOM----")
                        console.log(this.gameRoomManager.rooms)
                        console.log()
                        console.log()
                        console.log()
                        console.log("-----------")
                        if (playerHand.length >= 2) {
                            let selectedCards = [];
                            while (selectedCards.length < 2) {
                                const randomIndex = Math.floor(Math.random() * playerHand.length);
                                const selectedCard = playerHand[randomIndex];
                                if (!selectedCards.includes(selectedCard)) {
                                    selectedCards.push(selectedCard);
                                }
                            }
                            room.currentSelected = selectedCards;
                        }

                        // 發送選擇卡片的資訊
                        this.io.to(roomId).emit('auto_discarded_cards', { selectedCards: room.currentSelected });

                        // 呼叫 discardCards 函數
                        this.discardCards(roomId, playerId);
                    }
                }, 1000);
            }
        }, 1000);   
    }

    // 處理回合結束 
    endTurn(roomId) { 
        const room = this.gameRoomManager.rooms[roomId];
        if (room.timer) clearInterval(room.timer);

        // 新增中斷 discardTimer 的邏輯
        if (room.discardTimer) clearInterval(room.discardTimer);

        this.checkCardPositions(roomId, room.players[room.currentPlayer]);

        room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
        this.dealCardsToDeck(roomId);

        this.updateGameState(roomId);
        // TODO: 強制出牌 
        // dealCards(XXXXXX)   
        this.startTurnTimer(roomId);
        this.clearCurrentSelectedCards(roomId);

        

        room.currentSelected = [];

        // // if (room) {
        // // console.log("fsdfasdfasfas", roomId);
        // // console.log(this.gameRoomManager.rooms);
        // // console.log(room)    
        
        console.log("endturn", room.currentPlayer)
        // console.log("endturn")
        // this.changeState('PlayerTurn'); 
        // this.io.to(roomId).emit('turn_changed', { currentPlayerId: room.players[room.currentPlayer] });

        // this.startTurnTimer(roomId);
        // // }
        // console.log(room.currentPlayer)
    }

    checkCardPositions(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
    
        if (!room) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }
    
        const cardPositions = room.cardPositions[playerId];
        const playerHand = room.hands[playerId];
    
        if (!cardPositions) {
            console.error(`Player with ID ${playerId} does not have card positions in room ${roomId}.`);
            return;
        }
    
        if (!playerHand) {
            console.error(`Player with ID ${playerId} does not have a hand in room ${roomId}.`);
            return;
        }
    
        // 建立一個包含所有 hand 中卡片 id 的集合
        const handCardIds = new Set(playerHand.map(card => card.id));
    
        // 遍歷 cardPositions 並移除不在 hand 中的卡片
        for (const cardId in cardPositions) {
            if (!handCardIds.has(parseInt(cardId))) {
                delete cardPositions[cardId];
                console.log(`Removed card with ID ${cardId} from cardPositions of player ${playerId} in room ${roomId}.`);
            }
        }
        // console.log('RESULT: ')
        // console.log('')
        // console.log('')
        // console.log('')
        // console.log(room.hands[playerId])
        // console.log('')
        // console.log('')
        // console.log('')
    }

    dealCards(roomId, playerId, cardId, zoneIndex) {
        console.log(roomId, playerId, cardId)
        const room = this.gameRoomManager.rooms[roomId];
        // console.log("--=-=-=-=-=-=-=-=")
        // console.log(room, "before")

        if (!room || !room.players.includes(playerId) || !room.hands[playerId]) {
            console.log(`Invalid room or player.`);
            return;
        }

        const cardIndex = room.hands[playerId].findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            console.log(`Card ${cardId} not found in player ${playerId}'s hand.`);
            return;
        }

        const [card] = room.hands[playerId].splice(cardIndex, 1); // 從手牌中移除該卡牌
        const zoneCards = room.table[zoneIndex];

        if (zoneCards.length === 1 && this.pairingManager.canPair(zoneCards[0], card)) {
            // 可以配對
            room.table[zoneIndex].push(card); // 將卡牌放到桌面上

            // 先更新前端成配對成功卡片放上去的畫面 
            this.updateGameState(roomId, zoneIndex);
            // console.log(room.table[zoneIndex])
            // 通知前端配對成功並淡出
            // this.io.to(roomId).emit('pair_success', { zoneIndex: zoneIndex, cards: room.table[zoneIndex], cardIds: [zoneCards[0].id, card.id] });
            // room.table[zoneIndex] = [];
            //     this.updateGameState(roomId, zoneIndex);
            // 從桌面上移除配對成功的卡牌
            room.table[zoneIndex] = [];
            this.updateGameState(roomId);
            
            setTimeout(() => {
                this.dealCardsToDeck(roomId);
                this.updateGameState(roomId);
            }, 5000); // 等待1秒鐘讓前端完成淡出效果

        } else {
            // 不能配對
            room.hands[playerId].push(card);
        }

        // console.log(`Player ${playerId} played card ${cardId} onto the table.`);
        // console.log(room, "after")
        // console.log("-=-=-=-=-=-=-=-=")  
        // this.io.to(roomId).emit('update_game_state', { roomId: roomId });
        this.updateGameState(roomId);      
    } 

    updateGameState(roomId, pairSuccessIndex = -1) {
        const room = this.gameRoomManager.rooms[roomId]; 
        // console.log(room);
        console.log('current selected');
        console.log(room.currentSelected);
        console.log('---------');
        let currentPlayer = room.currentPlayer;
        let currentPlayerId = room.players[currentPlayer]; 
        let gameState = room.state;

        const playerHand = room.hands[currentPlayerId];
    
        if (!playerHand) {
            console.error(`Player with ID ${playerId} does not have a hand in room ${roomId}.`);
            return;
        }

        this.io.to(roomId).emit('update_game_state', {
            roomId: roomId,
            currentPlayer: currentPlayerId,
            gameState: gameState,
            table: room.table,
            cards: this.getCardsOnTable(roomId), 
            selected: room.currentSelected,
            pairSuccessIndex: pairSuccessIndex,
            playerHand: playerHand,
            handPositions: room.cardPositions[currentPlayerId]
        });   
        const players = this.gameRoomManager.getPlayersInRoom(roomId);
        this.io.to(roomId).emit('update_player_list', { players }); 
    }

    drawCards(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        // if (room && room.deck.length > 0) {
        // if (room && room.deck.length > 0) {
        //     const card = room.deck.pop();  // 從牌組頂部抽一張牌
        //     room.hands[playerId] = room.hands[playerId] || [];
        //     room.hands[playerId].push(card);  // 將抽到的牌加入到玩家手牌中

        //     // socket.emit('card_drawn', { card: card, playerId: playerId });
        //     // this.io.to(roomId).emit('update_game_state', { roomId: roomId });
        //     this.updateGameState(roomId);
        //     console.log(room);
        // } else {
        //     // TODO: refresh deck
        //     this.io.to(roomId).emit('draw_error', { message: 'No cards left in the deck' });
        // }

        if (room) {
            if (this.refillDeck(roomId)) {
                const card = room.deck.pop();  // 從牌組頂部抽一張牌
                room.hands[playerId] = room.hands[playerId] || [];
                room.hands[playerId].push(card);  // 將抽到的牌加入到玩家手牌中
        
                this.updateGameState(roomId);
                // console.log(room);
            }
        }
    }

    refillDeck(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
    
        if (room.deck.length === 0 && room.usedCards.length > 0) {
            room.deck.push(...room.usedCards);
            room.usedCards = [];
            this.shuffleDeck(roomId);
            console.log(`重新補充牌組，將 ${room.deck.length} 張卡片從 usedCards 移動到 deck 並洗牌.`);
        }
    
        return room.deck.length > 0;
    }
    

    cardPlayed(socket, roomId, gameObject, isPlayerA) {
        this.io.to(roomId).emit('cardPlayed', gameObject, isPlayerA);
    }

    // 添加卡牌到房間的牌組
    addCardsToDeck(roomId, cards) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room) {
            room.deck.push(...cards);
            console.log(`Added ${cards.length} cards to deck in room ${roomId}`);
        }
    }

    // 隨機排序牌組
    shuffleDeck(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room && room.deck) {
            for (let i = room.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [room.deck[i], room.deck[j]] = [room.deck[j], room.deck[i]]; // ES6 swap
            }
        }
    }

    // 初始化遊戲
    initializeGame(roomId, settings) {
        const room = this.gameRoomManager.rooms[roomId];
        
        this.applySettings(room, settings);
        this.shuffleDeck(roomId);
        room.gameIsStarted = true;

        if (room) {
            room.players.forEach(playerId => {
                this.dealCardsToPlayer(roomId, playerId, 8); // 每人發八張卡
                room.playerScores[playerId] = { 'resourcePoints': 0, 'gameLevel': 0, 'cardPairCount': 0 } // 初始化每個玩家的數值
            });

            room.currentPlayer = 0;  // 從第一個玩家開始
            room.state = 1;  // 遊戲開始
            
            // this.io.to(roomId).emit('game_started', { currentPlayerId: room.players[room.currentPlayer] });
            this.changeState('PlayerTurn');
            this.startTurnTimer(roomId);
        }
        console.log("-----=-=-=-=-=-=-=")
        console.log(roomId)
        console.log(room)
        this.dealCardsToDeck(roomId);
        this.updateGameState(roomId);
    }

    getPlayerScores(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        
        if (!room) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return null;
        }
        
        const playerScore = room.playerScores[playerId];
        
        if (!playerScore) {
            console.error(`Player with ID ${playerId} does not exist in room ${roomId}.`);
            return null;
        }
        
        return {
            resourcePoints: playerScore['resourcePoints'],
            gameLevel: playerScore['gameLevel'],
            cardPairCount: playerScore['cardPairCount']
        };
    }

    applySettings(room, settings) {
        room.settings = settings;
    
        // 清空 room 的 deck
        room.deck = [];
        let currentId = 1; // 初始化唯一 ID 計數器
    
        // 定義運動類型對應的 keys
        const sports = ['gymnastics', 'soccer', 'tableTennis', 'shooting', 'baseball', 'judo'];
    
        // 根據 settings 將卡片加入 room 的 deck
        sports.forEach(sport => {
            const deckCount = settings[sport].count;
            const selectedType = settings[sport].type;
            if (deckCount > 0 && selectedType) {
                // 獲取對應卡組類型的卡片
                const cardTypesInDeck = this.cardDeckManager.getCardsInDeck(sport, selectedType);
                for (let j = 0; j < deckCount; j++) {
                    cardTypesInDeck.forEach(type => {
                        room.deck.push({ id: currentId++, type });
                    });
                }
            }
        });
    }
    
    

    dealCardsToDeck(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room) { 
            console.log(`Room ${roomId} does not exist.`); 
            return;
        }
    
        // room.table.forEach((zone, index) => {
        //     if (zone.length === 0 && room.deck.length > 0) {
        //         const card = room.deck.pop();  // 從牌組頂部抽一張牌
        //         room.table[index].push(card);  // 將抽到的牌放置在空的 zone 上
        //         console.log(`Placed card ${card.id} in zone ${index}`);
        //     }
        // });
        room.table.forEach((zone, index) => {
            if (zone.length === 0 && this.refillDeck(roomId)) {
                const card = room.deck.pop();  // 從牌組頂部抽一張牌
                room.table[index].push(card);  // 將抽到的牌放置在空的 zone 上
                console.log(`Placed card ${card.id} in zone ${index}`);
            }
        });
        
    }
    

    // 處理卡牌發放給玩家
    dealCardsToPlayer(roomId, playerId, numberOfCards) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room && room.players.includes(playerId)) {
            if (!room.hands[playerId]) {
                room.hands[playerId] = [];
            }
            const cards = room.deck.splice(0, numberOfCards); // 從牌組頂部取卡
            room.hands[playerId].push(...cards);
            console.log(`Dealt ${numberOfCards} cards to player ${playerId} in room ${roomId}`);
        }
    }

    // 獲得某個玩家在某個房間的手牌
    getPlayerHand(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room && room.hands[playerId]) {
            return room.hands[playerId];
        } else {
            return []; // 如果房間或玩家不存在，返回空數組
        }
    }

    getCardsOnTable(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room) {
            // console.log('===debug===')
            // console.log(room.table)
            // console.log(room.hands)
            // console.log('===debug===')
            return room.table;
        } else {
            return []; // 如果房間或玩家不存在，返回空數組
        }
    }

    updatePlayersHand(roomId, playerId, hand) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room && room.players.includes(playerId)) {
            room.hands[playerId] = hand;
            console.log(`Updated hand for player ${playerId} in room ${roomId}, HAND: ${hand}`);
        } else {
            console.log(`Room ${roomId} or player ${playerId} does not exist.`);
        }
    }

    appendCurrentSelectedCards(roomId, card) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room) {
            console.error(`Room ${roomId} does not exist`);
            return;
        }
    
        if (!room.currentSelected) {
            room.currentSelected = [];
        }
    
        const cardExists = room.currentSelected.some(existingCard => existingCard.id === card.id);
        if (!cardExists) {
            room.currentSelected.push(card);
        } else { 
            room.currentSelected = room.currentSelected.filter(existingCard => existingCard.id !== card.id);
            console.log(`Card with id ${card.id} removed from room ${roomId}`);
        }    
        console.log("-=-=-=-=-=-=-=-=-=-=-=-==--=appended!!!!!!-=-=-=-=-=-=-=-=-=-=-=-==--=");
        console.log(room.currentSelected);
    }

    clearCurrentSelectedCards(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (room) {
            console.error(`Room ${roomId} does not exist`);
            return;
        }

        room.currentSelected = [];
    }

    discardCards(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        // console.log(room.currentSelected);
        // console.log(room.table)
        if (room.currentSelected.length != 2) {
            return {
                success: false,
                error: '你沒有選擇剛好二張牌啦',
                playerId: playerId,
                selectedCards: room.currentSelected
            };
        }
        

        let result = this.removeCardFromPlayerHand(roomId, playerId, room.currentSelected);
        room.currentSelected.forEach(selectedCard => {
            console.log('debugdebugdebugdebugdebugdebugdebugdebugdebug')
            console.log(selectedCard.id, selectedCard)
            const cardId = selectedCard.id;
            this.removeCardFromCardPositions(roomId, playerId, cardId);
        });

        if (result.success) {
            console.log('Cards removed successfully');
            
        } else {
            console.error('Error:', result.message);
            return {
                success: false,
                error: '你沒有選擇剛好二張牌啦',
                playerId: playerId,
                selectedCards: room.currentSelected
            };
        }

        this.pushCardsToTable(roomId);

        this.drawCards(roomId, playerId);
        this.drawCards(roomId, playerId);

        // this.organizePlayerHand(roomId, playerId);

        this.endTurn(roomId);

        return {
            success: true,
            result: 'success',
            playerId: playerId,
        }; 
    }

    pushCardsToTable(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        // 將 currentSelected 的每個元素推入 table 的頭兩位
        room.currentSelected.forEach(item => {
            room.table.unshift([item]);
        });

        // 刪除最後兩個子陣列
        while (room.table.length > 8) {
            let temp = room.table.pop();
            room.usedCards.push(...temp)
        }
        console.log('==========PUSHED==========');
        console.log(`|          ${room.usedCards}              |`)
        console.log('==========PUSHED==========');
        // console.log(room.table);
    }

    removeCardFromPlayerHand(roomId, playerId, cards) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room || !room.hands[playerId]) {
            return { success: false, message: 'Room or player not found' };
        }

        // console.log("===A===")
        // console.log(room.usedCards)
        // room.usedCards.push(...cards)
        // console.log("===A===")
        // console.log(room.usedCards)
        // console.log("===A===")
        // console.log('==========AAAAA==========');
        // console.log(`|          ${room.usedCards}              |`)
        // console.log('==========AAAAA==========');

        const playerHand = room.hands[playerId];
        const cardIds = cards.map(card => card.id);
        const allCardsExist = cardIds.every(cardId => playerHand.some(card => card.id === cardId));

        if (!allCardsExist) {
            return { success: false, message: 'One or more cards not found in player\'s hand' };
        }

        room.hands[playerId] = playerHand.filter(card => !cardIds.includes(card.id));
        return { success: true };
    }

    updatePlayerScoreAndLevel(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        const playerScore = room.playerScores[playerId];
        const playerGameLevel = playerScore['gameLevel']; 
        // TODO: 問一下等級是怎麼判斷的
        playerScore['cardPairCount'] += 1;
    
        if (playerGameLevel === 0) {
            // C
            playerScore['resourcePoints'] = Math.min((playerScore['resourcePoints'] + 1), 4);
            playerScore['gameLevel'] = 1; // B
        } else if (playerGameLevel === 1) {
            // B
            playerScore['resourcePoints'] = Math.min((playerScore['resourcePoints'] + 2), 4);
            playerScore['gameLevel'] = 2; // A
        } else if (playerGameLevel === 2) {
            // A
            playerScore['resourcePoints'] = Math.min((playerScore['resourcePoints'] + 2), 4);
            playerScore['gameLevel'] = 2; // A
        } 
    }

    pairCards(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        console.log(room.currentSelected);
    
        if (this.pairingManager.canPair(room.currentSelected)) {
            // 可以配對呦~
            this.updatePlayerScoreAndLevel(roomId, playerId);

            const matchedTableCards = [];
            const matchedHandCards = [];
            const matchedTableIndexes = [];
            const matchedHandIndexes = [];
            const usedCards = []; // 用於儲存配對的卡牌
            const matchedCardPositions = []; // 用於儲存配對卡片的位置
    
            // 移除 table 中的配對卡牌
            room.table.forEach((zone, zoneIndex) => {
                room.currentSelected.forEach(selectedCard => {
                    const index = zone.findIndex(card => card.id === selectedCard.id);
                    if (index !== -1) {
                        matchedTableCards.push(zone[index]);
                        matchedTableIndexes.push(zoneIndex);
                        usedCards.push(zone[index]); // 將配對卡牌添加到 usedCards
                        zone.splice(index, 1);
                    }
                });
            });
    
            // 移除 hands 中該玩家的配對卡牌
            console.log('=====================debugdebugdebugdebugdebugdebug=====================')
            console.log(room.cardPositions, playerId)
            let removedCards = 0;
            room.currentSelected.forEach(selectedCard => {
                const index = room.hands[playerId].findIndex(card => card.id === selectedCard.id);
                console.log('--=-=-=-=-=-==--=-=-afteragfaterafja;fjk;asdfjkasdj;f=-=-==--=-=-=-=-=-=-=-=-=-=-==-=-')
                console.log(room.cardPositions[playerId])
                if (index !== -1) {
                    matchedCardPositions.push(room.cardPositions[playerId][selectedCard.id]); // 添加配對卡片的位置
                    this.removeCardFromCardPositions(roomId, playerId, selectedCard.id);
                    removedCards ++;
                    matchedHandCards.push(room.hands[playerId][index]);
                    matchedHandIndexes.push(index);
                    usedCards.push(room.hands[playerId][index]); // 將配對卡牌添加到 usedCards
                    room.hands[playerId].splice(index, 1);
                }
            }); 

            for (let i=0; i<removedCards; i++) {
                this.drawCards(roomId, playerId);
            }

            // this.organizePlayerHand(roomId, playerId);
    
            // 清空 currentSelected
            room.currentSelected = [];
    
            // 將配對的卡牌添加到 room.usedCards
            if (!room.usedCards) {
                room.usedCards = [];
            }
            room.usedCards.push(...usedCards);
    
            // this.endTurn(roomId);
            this.dealCardsToDeck(roomId)
            this.updateGameState(roomId);
    
            console.log("============================")
            console.log()
            console.log()
            console.log(room.hands[playerId])
            console.log(matchedCardPositions)
            console.log()
            console.log()
            console.log("============================")

            return {
                playerId: playerId, 
                matchedHandCards: matchedHandCards,
                matchedHandIndexes: matchedHandIndexes,
                matchedTableCards: matchedTableCards,
                matchedTableIndexes: matchedTableIndexes, 
                matchedCardPositions: matchedCardPositions, // 回傳配對卡片的位置

                // 玩家遊戲狀態
                resourcePoints: room.playerScores[playerId]['resourcePoints'],
                gameLevel: room.playerScores[playerId]['gameLevel'],
                cardPairCount: room.playerScores[playerId]['cardPairCount'],
            };
        } else {
            console.log('這些卡牌無法配對。');
            return {
                error: '無法配對的卡牌',
                playerId: playerId,
                selectedCards: room.currentSelected
            };
        }
    }

    removeCardFromCardPositions(roomId, playerId, cardId) {
        const room = this.gameRoomManager.rooms[roomId];
        
        if (!room) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }
        
        const playerHand = room.cardPositions[playerId];
        
        if (!playerHand) {
            console.error(`Player with ID ${playerId} does not have a hand in room ${roomId}.`);
            return;
        }
        
        // 查找並移除指定的卡片
        if (!(cardId in playerHand)) {
            console.error(`Card with ID ${cardId} does not exist in player ${playerId}'s hand.`);
            return;
        }
    
        delete playerHand[cardId];
        
        console.log(`Removed card with ID ${cardId} from player ${playerId}'s hand in room ${roomId}.`);

        console.log("AFTER REMOVED:")
        console.log("")
        console.log("")
        console.log("")
        console.log(room.cardPositions[playerId])
        console.log("")
        console.log("")
        console.log("")
    }
    
    organizePlayerHand(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
    
        console.log("--=-=-========BEFORE======-=-=-=-=-=-=");
        console.log();
        console.log();

        console.log(room.hands[playerId]);

        console.log();
        console.log();
        console.log("--=-=-==================-=-=-=-=-=-=");

        if (!room) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }
    
        const playerHand = room.hands[playerId];
    
        if (!playerHand) {
            console.error(`Player with ID ${playerId} does not have a hand in room ${roomId}.`);
            return;
        }
    
        // 將非空卡片和空卡片分開
        const nonEmptyCards = playerHand.filter(card => card !== null && card !== undefined);
        const emptyCards = playerHand.filter(card => card === null || card === undefined);
    
        // 將非空卡片排在前面，空卡片排在後面
        room.hands[playerId] = [...nonEmptyCards, ...emptyCards];

        console.log("--=-=-========ROOM HANDS======-=-=-=-=-=-=");
        console.log();
        console.log();

        console.log(room.hands[playerId]);

        console.log();
        console.log();
        console.log("--=-=-==================-=-=-=-=-=-=");
    }
    
    onReady(roomId, playerId) {
        this.gameRoomManager.onReady(roomId, playerId);
    }

    onCancelReady(roomId, playerId) {
        this.gameRoomManager.onCancelReady(roomId, playerId);
    }

    updateSettings(roomId, settings) {
        const room = this.gameRoomManager.rooms[roomId]; 
        room.settings = settings;
        this.io.to(roomId).emit('update_settings', { turnTimer: room.turnTimer });
    }
    
    updateCardPositions(roomId, playerId, cardPositions) {
        const room = this.gameRoomManager.rooms[roomId];
        
        if (!room) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }

        // const player = room.cardPositions[playerId];
        // if (!player) {
        //     console.log(room.players)
        //     console.error(`Player with ID ${playerId} does not exist in room ${roomId}.`);
        //     return;
        // }

        room.cardPositions[playerId] = cardPositions;
        console.log(`Updated card positions for player ${playerId} in room ${roomId}.`);

        console.log('+=+++++====+++=+++++====+++=+++++====+++=+++++====++')
        // console.log(room)
    }

    isGameStartedInRoom(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room) return;
        const isPlayerInRoom = room.players.includes(playerId); 
        return {
            gameIsStarted: room.gameIsStarted,
            isPlayerInRoom: isPlayerInRoom
        };
    }
    

}

module.exports = GameManager;
