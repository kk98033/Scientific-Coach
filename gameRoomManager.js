const crypto = require('crypto');

class GameRoomManager {
    constructor() {
        // this.rooms = {};
        this.rooms = {
            "": {
                players: [],
                cardCount: 60,
                gameType: 0,
                currentPlayer: 0,
                turnTimer: 0,
                deck: [
                    { id: 1, type: '0' },
                    { id: 2, type: '1' },
                    { id: 3, type: '2' },
                    { id: 4, type: '3' },
                    { id: 5, type: '4' }
                ],
                table: [],
                matchArea: [],
                hands: {},
                state: 0,
            }
        }; // for debug
    }

    createRoom(roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                players: [],
                cardCount: 60, // 牌組初始卡牌數
                gameType: 0,   // 遊戲類型，根據需要可以設定具體遊戲
                currentPlayer: 0,  // 目前的玩家 ID
                turnTimer: 0,  // 玩家出牌剩餘時間
                deck: [],      // 牌組中的卡牌
                table: [],     // 桌面上的卡牌
                matchArea: [], // 配對區的卡牌
                hands: {},      // 每個玩家的手牌，使用玩家 ID 為 key
                state: 0
            };
            console.log(`Room ${roomId} created.`);
            return true;
        } else {
            console.log(`Room ${roomId} already exists.`);
            return false;
        }
    }

    joinRoom(roomId, playerId) {
        if (!this.rooms[roomId]) {
            console.log(`Attempted to join non-existent room ${roomId}.`);
            return false;
        }

        if (!this.rooms[roomId].players.includes(playerId)) {
            this.rooms[roomId].players.push(playerId);
            // 確保玩家的手牌空間被初始化
            this.rooms[roomId].hands[playerId] = this.rooms[roomId].hands[playerId] || [];
            console.log(`Player ${playerId} joined room ${roomId}.`);
            return true;
        } else {
            console.log(`Player ${playerId} already in room ${roomId}.`);
            return false;
        }
    }

    leaveRoom(playerId) {
        for (let roomId in this.rooms) {
            let index = this.rooms[roomId].players.indexOf(playerId);
            if (index !== -1) {
                this.rooms[roomId].players.splice(index, 1);
                console.log(`Player ${playerId} left room ${roomId}.`);
                if (this.rooms[roomId].players.length === 0) {
                    delete this.rooms[roomId];
                    console.log(`Room ${roomId} is empty and deleted.`);
                }
                console.log(this.rooms); // DEBUG
                return;
            }
        }
    }


    generateUniqueRoomId() {
        let uniqueId;
        do {
            // use crypto generate 6 string as room number (0-9 or a-f) 
            uniqueId = crypto.randomBytes(3).toString('hex');
        } while (this.rooms[uniqueId]); // if this ID has been taken, regenerate

        return uniqueId;
    }

    getRoomIds() {
        return Object.keys(this.rooms);
    }
}

module.exports = GameRoomManager;
