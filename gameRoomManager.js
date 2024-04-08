const crypto = require('crypto');

class GameRoomManager {
    constructor() {
        this.rooms = {};
    }

    createRoom(roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = { players: [] };
            console.log(`Room ${roomId} created.`);
            return true;
        } else {
            console.log(`Room ${roomId} already exists.`);
            return false;
        }
    }

    joinRoom(roomId, playerId) {
        if (this.rooms[roomId] && !this.rooms[roomId].players.includes(playerId)) {
            this.rooms[roomId].players.push(playerId);
            console.log(`Player ${playerId} joined room ${roomId}.`);
            return true;
        } else {
            console.log(`Could not join room ${roomId}.`);
            return false;
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
