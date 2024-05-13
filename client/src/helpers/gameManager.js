import { io } from 'socket.io-client';
import Card from './card';
import Zone from '../helpers/zone';

export default class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.dropZone = null;
        this.socket = null;

        this.roomId = null;
        this.playerId = null;
        this.hand = [];  // Store player's hand locally
        this.handObj = [];  // Card object to store cards on hands
        this.tableCards = []; // Array to store cards on the table
        this.tableCardsObj = []; // Array to store cards on the table

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

        this.socket.on('update_game_state', (data) => {
            console.log(`update game state!`);
            const { roomId } = data;
            this.updateGameState();
        });

        this.socket.on('game_started', () => {
            console.log(`Game started!`);
            this.getPlayerHand();
        });

        this.socket.on('get_player_hand', (data) => {
            const { playerId, hand } = data;
            if (playerId === this.playerId) {
                this.hand = hand;  // Update local hand
                console.log(playerId, 'aa');
                console.log(hand);

                this.displayPlayerHand();
            }
        });

        this.socket.on('get_cards_on_table', (data) => {
            const { playerId, cards } = data;
            if (playerId === this.playerId) {
                this.tableCards = cards;  // Update local hand
                console.log(this.tableCards);

                this.displayCardsOnTable();
            }
        });

        // this.socket.on('player_hand', (data) => {
        //     const { playerId, hand } = data;
        //     if (playerId === this.playerId) {
        //         this.hand = hand;  // Update local hand
        //         this.displayPlayerHand();
        //     }
        //     console.log(playerId);
        //     console.log(hand);
        // });
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

    updateGameState() {
        console.log("update game state");
        this.getCardsOnTable();
        this.displayCardsOnTable();

        this.getPlayerHand();
        this.displayPlayerHand();
    }

    drawCards() {
        this.socket.emit('draw_cards', { roomId: this.roomId, playerId: this.playerId });
    }

    getCardsOnTable() {
        this.socket.emit('get_cards_on_table', { roomId: this.roomId, playerId: this.playerId });
    }

    clearCardsOnTable() {
        console.log('this.tableCardsObj')
        console.log(this.tableCardsObj);
        this.tableCardsObj.forEach(card => {
            card.destroy();
        });
        this.tableCardsObj = [];
    }

    displayCardsOnTable() {
        // 清除舊有的桌面卡片顯示
        this.clearCardsOnTable()

        // this.tableCards = [];
        console.log("display cards on table")
        this.dropZone.data.values.cards = 0;
        this.tableCardsObj = this.tableCards.map((card, index) => {
            this.dropZone.data.values.cards++;
            let tableCard = new Card(this.scene, card.id);
            tableCard.render(((this.dropZone.x - 350) + (this.dropZone.data.values.cards * 50)), (this.dropZone.y), 'cyanCardFront', card.type);
            // this.tableCards.push(card);
            return tableCard;
        });
        console.log('table', this.tableCardsObj);

        // this.handObj = this.hand.map((card, index) => {
        //     let playerCard = new Card(this.scene, card.id);
        //     playerCard.render(baseX + (index * cardOffset), baseY, 'cyanCardFront', card.type);
        //     return playerCard;
        // });

        // let sprite = gameObject.textureKey;
        // this.opponentCards.shift().destroy();
        // this.dropZone.data.values.cards++;
        // let card = new Card(self);
        // card.render(((self.dropZone.x - 350) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), sprite).disableInteractive();
    }

    getPlayerHand() {
        this.socket.emit('get_player_hand', { roomId: this.roomId, playerId: this.playerId });
    }

    playCard(cardId) {
        // this.socket.emit('play_card', { roomId, playerId, cardId });
        // Find the index of the card with the given ID in the tableCards array
        // const cardIndex = this.tableCards.findIndex(card => card.cardId === cardId);

        // if (cardIndex !== -1) {
        //     // Remove the card from the table
        //     const [card] = this.tableCards.splice(cardIndex, 1);
        //     card.destroy();  // Assuming each card has a destroy method to remove it from the scene
        //     console.log(`Card with ID ${cardId} was played and removed from the table.`);
        // } else {
        //     console.log(`Card with ID ${cardId} not found on the table.`);
        // }
    }

    clearPlayerHandDisplay() {
        console.log('this.handObj')
        console.log(this.handObj);
        this.handObj.forEach(card => {
            card.destroy();
        });
        this.handObj = [];
    }

    displayPlayerHand() {
        const baseX = 475;
        const baseY = 650;
        const cardOffset = 100;

        // rerender all cards
        this.clearPlayerHandDisplay();

        this.handObj = this.hand.map((card, index) => {
            let playerCard = new Card(this.scene, card.id);
            playerCard.render(baseX + (index * cardOffset), baseY, 'cyanCardFront', card.type);
            return playerCard;
        });
        console.log(this.handObj)
    }
}
