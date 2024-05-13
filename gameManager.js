class GameManager {
    constructor(io, gameRoomManager) {
        this.io = io;
        this.gameRoomManager = gameRoomManager;
    }

    dealCards(socket, roomId) {
        this.io.to(roomId).emit('dealCards');
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

            room.state = 1; // start the game
        }
        console.log("-----=-=-=-=-=-=-=")
        console.log(roomId)
        console.log(room)
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
}

module.exports = GameManager;
