const crypto = require('crypto');

class GameRoomManager {
    constructor() {
        // this.rooms = {};
        // TODO: debug room, 記得刪掉!
        this.rooms = {
            "": {
                players: [],
                tableScreenId: [],
                cardCount: 60,
                gameType: 0,
                currentPlayer: 0,
                turnTimer: 0,
                deck: [
                    { id: 1, type: '0' },
                    { id: 2, type: '1' },
                    { id: 3, type: '2' },
                    { id: 4, type: '3' },
                    { id: 5, type: '4' },
                    { id: 6, type: '5' },
                    { id: 7, type: '6' },
                    { id: 8, type: '7' },
                    { id: 9, type: '8' },
                    { id: 10, type: '9' },
                    { id: 11, type: '10' },
                    { id: 12, type: '11' },
                    { id: 13, type: '12' },
                    { id: 14, type: '13' },
                ],
                table: Array.from({ length: 8 }, () => []), 
                matchArea: [],
                hands: {},
                cardPositions: {}, // { 'playerID': [ 'cardid': [x1, y1], 'cardid': [x2, y2]...], ... }
                currentSelected: [],
                state: 0,
                timer: null,
                discardTimer: null,
                usedCards: [],
                readyPlayers: [],
                settings: {
                    roundTime: 10,
                    deck_1: 1,
                    deck_2: 0,
                    deck_3: 0,
                    deck_4: 0,
                }
            }
        }; // for debug
    }

    createRoom(roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                players: [],
                tableScreenId: [],
                cardCount: 60, // 牌組初始卡牌數
                gameType: 0,   // 遊戲類型，根據需要可以設定具體遊戲
                currentPlayer: 0,  // 目前的玩家 ID
                turnTimer: 0,  // 玩家出牌剩餘時間
                deck: [],      // 牌組中的卡牌
                table: Array.from({ length: 8 }, () => []), // 牌桌上的卡牌，預設為包含八個空陣列的陣列
                matchArea: [], // 配對區的卡牌
                hands: {},      // 每個玩家的手牌，使用玩家 ID 為 key
                cardPositions: {}, // { 'playerID': { 'cardId1': [x1, y1], 'cardId2': [x2, y2]...}, ... }
                state: 0,
                currentSelected: [], // ex: [ { id: 20, type: '5' },  { id: 21, type: '6' }]
                timer: null,
                discardTimer: null,
                usedCards: [],
                readyPlayers: [],
                settings: {
                    roundTime: 30,
                    deck_1: 0,
                    deck_2: 0,
                    deck_3: 0,
                    deck_4: 0,
                },
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

    tableJoinRoom(roomId, tableID) {
        if (!this.rooms[roomId]) {
            console.log(`Attempted to join non-existent room ${roomId}.`);
            return false;
        }

        if (!this.rooms[roomId].tableScreenId.includes(tableID)) {
            this.rooms[roomId].tableScreenId.push(tableID);
            console.log(`TALBE ${tableID} joined room ${roomId}.`);
            return true;
        } else {
            console.log(`TALBE ${tableID} already in room ${roomId}.`);
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

    getPlayersInRoom(roomId) {
        if (this.rooms[roomId]) {
            return this.rooms[roomId].players;
        }
        return [];
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

    onReady(roomId, playerId) {
        const room = this.rooms[roomId];
        if (!room.readyPlayers.includes(playerId)) {
            room.readyPlayers.push(playerId);
        }
    }

    onCancelReady(roomId, playerId) {
        const room = this.rooms[roomId];
        const playerIndex = room.readyPlayers.indexOf(playerId);
        if (playerIndex !== -1) {
            room.readyPlayers.splice(playerIndex, 1);
        }
    }

    getReadyPlayers(roomId) {
        const room = this.rooms[roomId];
        if (room) {
            return {
                readyPlayers: room.readyPlayers,
                count: room.readyPlayers.length,
                total: room.players.length
            };
        } else {
            return {
                readyPlayers: [],
                count: 0,
                total: room.players.length
            };
        }
    }

}

module.exports = GameRoomManager;
