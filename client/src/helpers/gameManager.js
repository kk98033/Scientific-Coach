import { io } from 'socket.io-client';
import Card from './card';

export default class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.socket = null;
        this.roomId = null;
        this.playerId = null;
        this.hand = [];  // Store player's hand locally

        this.connectSocket();
        this.setupEventListeners();
        this.setupBeforeUnloadListener();
    }

    connectSocket() {
        this.socket = io('http://localhost:3000');
    }

    setupEventListeners() {
        this.socket.on('room_created', (data) => {
            console.log('Room created:', data.roomId);
        });

        this.socket.on('player_joined', (data) => {
            console.log('Player joined:', data.playerId);
        });

        this.socket.on('room_created', (data) => {
            const roomId = data.roomId;
            const rooms = data.rooms;
            console.log(data)
        });

        this.socket.on('your_player_id', (data) => {
            this.playerId = data.playerId;
            console.log('My player ID is:', data.playerId);
        });

        this.socket.on('room_not_found', (data) => {
            console.log('Room not found:', data.roomId);
        });

        this.socket.on('player_left', (data) => {
            console.log(`Player ${data.playerId} has left the room.`);
        });

        this.socket.on('game_started', () => {
            console.log(`Game started!`);
            this.getPlayerHand();
        });

        this.socket.on('player_hand', (data) => {
            const { playerId, hand } = data;
            if (playerId === this.playerId) {
                this.hand = hand;  // Update local hand
                this.displayPlayerHand();
            }
            console.log(playerId);
            console.log(hand);
        });
    }

    setupBeforeUnloadListener() {
        // window is closing
        window.addEventListener("beforeunload", (event) => {
            this.leaveRoom('window closing');
            event.returnValue = '';
        });
    }

    leaveRoom(reason = '') {
        this.socket.emit('leave_room', { roomId: this.roomId, reason: reason });
        console.log(`Requested to leave room ${this.roomId}`);
        // TODO: ui
    }

    createRoom() {
        this.socket.emit('create_room');
    }

    joinRoom(roomId) {
        this.roomId = roomId;
        this.socket.emit('join_room', { roomId: roomId });
    }

    getPlayerHand() {
        this.socket.emit('get_player_hand', { roomId: this.roomId, playerId: this.playerId });
    }

    displayPlayerHand() {
        const baseX = 475;
        const baseY = 650;
        const cardOffset = 100;

        this.hand.forEach((card, index) => {
            // 使用 Card 類來創建和顯示卡牌
            let playerCard = new Card(this.scene, card.id);
            playerCard.render(baseX + (index * cardOffset), baseY, 'cyanCardFront', card.type);
        });
    }
}
