const PairingManager = require('./pairingManager');

class GameManager {
    constructor(io, gameRoomManager) {
        this.io = io;
        this.gameRoomManager = gameRoomManager;
        this.currentState = 'PlayerTurn'
        this.pairingManager = new PairingManager();

        // { 
        //     id: [唯一的數字ID, 從1到50], 
        //     type: '[卡片的類型，‘0’, ‘1’, ‘2’, ‘3’, ‘4’...]' 
        // }
        this.debugCards = [];
        for (let i = 1; i <= 20; i++) {
            this.debugCards.push({ 
                id: i, 
                type: (i - 1).toString() 
            });
        }
        console.log(this.debugCards);
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
        room.turnTimer = 10 // TODO: 設定時間
        room.timer = setInterval(() => {
            room.turnTimer--;
            console.log(`Remaining time for player ${room.currentPlayerIndex} in room ${roomId}: ${room.turnTimer} seconds`);
            this.io.to(roomId).emit('update_timer', { turnTimer: room.turnTimer });
            if (room.turnTimer <= 0) {
                clearInterval(room.timer);
                this.endTurn(roomId);
            }
        }, 1000);   
    }

    // 處理回合結束 
    endTurn(roomId) { 
        
        const room = this.gameRoomManager.rooms[roomId];
        if (room.timer) clearInterval(room.timer);
        room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
        this.updateGameState(roomId);
        // TODO: 強制出牌 
        // dealCards(XXXXXX)   
        this.startTurnTimer(roomId);

        
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

    dealCards(roomId, playerId, cardId, zoneIndex) {
        console.log(roomId, playerId, cardId)
        const room = this.gameRoomManager.rooms[roomId];
        console.log("--=-=-=-=-=-=-=-=")
        console.log(room, "before")

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
            // setTimeout(() => {
            //     room.table[zoneIndex] = [];
            //     this.updateGameState(roomId);
            // }, 5000); // 等待1秒鐘讓前端完成淡出效果

        } else {
            // 不能配對
            room.hands[playerId].push(card);
        }

        console.log(`Player ${playerId} played card ${cardId} onto the table.`);
        console.log(room, "after")
        console.log("-=-=-=-=-=-=-=-=")  
        // this.io.to(roomId).emit('update_game_state', { roomId: roomId });
        this.updateGameState(roomId);      
    } 

    updateGameState(roomId, pairSuccessIndex = -1) {
        const room = this.gameRoomManager.rooms[roomId]; 
        console.log(room);
        let currentPlayer = room.currentPlayer;
        let currentPlayerId = room.players[currentPlayer]; 
        let gameState = room.state;
        this.io.to(roomId).emit('update_game_state', {
            roomId: roomId,
            currentPlayer: currentPlayerId,
            gameState: gameState,
            table: room.table,
            cards: this.getCardsOnTable(roomId), 
            pairSuccessIndex: pairSuccessIndex
        });   
        const players = this.gameRoomManager.getPlayersInRoom(roomId);
        this.io.to(roomId).emit('update_player_list', { players }); 
    }

    drawCards(roomId, playerId) {
        const room = this.gameRoomManager.rooms[roomId];
        // if (room && room.deck.length > 0) {
        if (room && room.deck.length > 0) {
            const card = room.deck.pop();  // 從牌組頂部抽一張牌
            room.hands[playerId] = room.hands[playerId] || [];
            room.hands[playerId].push(card);  // 將抽到的牌加入到玩家手牌中

            // socket.emit('card_drawn', { card: card, playerId: playerId });
            // this.io.to(roomId).emit('update_game_state', { roomId: roomId });
            this.updateGameState(roomId);
            console.log(room);
        } else {
            // TODO: refresh deck
            this.io.to(roomId).emit('draw_error', { message: 'No cards left in the deck' });
        }
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
    initializeGame(roomId) {
        this.shuffleDeck(roomId);
        const room = this.gameRoomManager.rooms[roomId];
        if (room) {
            room.players.forEach(playerId => {
                this.dealCardsToPlayer(roomId, playerId, 2); // 每人發兩張卡
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

    dealCardsToDeck(roomId) {
        const room = this.gameRoomManager.rooms[roomId];
        if (!room) { 
            console.log(`Room ${roomId} does not exist.`); 
            return;
        }
    
        room.table.forEach((zone, index) => {
            if (zone.length === 0 && room.deck.length > 0) {
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
            return room.table;
        } else {
            return []; // 如果房間或玩家不存在，返回空數組
        }
    }
}

module.exports = GameManager;
