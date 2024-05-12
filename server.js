const GameRoomManager = require("./gameRoomManager");
const gameRoomManager = new GameRoomManager();

const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});
const GameManager = require('./gameManager');
const gameManager = new GameManager(io, gameRoomManager);
// gameManager.init();


// let players = [];

// io.on('connection', function (socket) {
//     console.log('A user connected: ' + socket.id);

//     players.push(socket.id);

//     if (players.length === 1) {
//         io.emit('isPlayerA');
//     };

//     socket.on('dealCards', function () {
//         io.emit('dealCards');
//     });

//     socket.on('cardPlayed', function (gameObject, isPlayerA) {
//         io.emit('cardPlayed', gameObject, isPlayerA);
//     });

//     socket.on('disconnect', function () {
//         console.log('A user disconnected: ' + socket.id);
//         players = players.filter(player => player !== socket.id);
//     });
// });

const debugCards = [
    { id: 1, type: '0' },
    { id: 2, type: '1' },
    { id: 3, type: '2' },
    { id: 4, type: '3' },
    { id: 5, type: '4' }
];

io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);
    socket.emit('your_player_id', { playerId: socket.id });

    socket.on('deal_cards', (roomId) => {
        gameManager.dealCards(socket, roomId);
    });

    socket.on('card_played', (roomId, gameObject, isPlayerA) => {
        gameManager.cardPlayed(socket, roomId, gameObject, isPlayerA);
    });

    socket.on('add_cards_to_deck', (data) => {
        const { roomId, cards } = data;
        gameManager.addCardsToDeck(roomId, cards);
        console.log(`Cards added to deck in room ${roomId}`);
    });

    socket.on('deal_cards_to_player', (data) => {
        const { roomId, playerId, numberOfCards } = data;
        gameManager.dealCardsToPlayer(roomId, playerId, numberOfCards);
        console.log(`Dealt ${numberOfCards} cards to player ${playerId} in room ${roomId}`);
    });

    socket.on('get_player_hand', (data) => {
        const { roomId, playerId } = data;
        const hand = gameManager.getPlayerHand(roomId, playerId);
        socket.emit('player_hand', { playerId: playerId, hand: hand });
    });

    // 初始化遊戲的事件  
    socket.on('initialize_game', (roomId) => {
        gameManager.initializeGame(roomId);
        console.log(`Game initialized in room ${roomId}`);
    });

    socket.on('create_room', (data) => {
        const roomId = gameRoomManager.generateUniqueRoomId();

        console.log(`Cards added to deck in room ${roomId}`);
        let rooms = gameRoomManager.getRoomIds(); // debug, TODO: delete it
        if (gameRoomManager.createRoom(roomId)) {
            gameManager.addCardsToDeck(roomId, debugCards);
            console.log(gameRoomManager.rooms[roomId])
            socket.join(roomId);
            io.to(roomId).emit('room_created', { roomId, rooms });
        }
    });

    socket.on('join_room', (data) => {
        const roomId = data.roomId;
        const playerId = socket.id; // use socket ID as player ID

        // try to join room
        if (gameRoomManager.joinRoom(roomId, playerId)) {
            socket.join(roomId);
            io.to(roomId).emit('player_joined', { playerId });
        } else {
            socket.emit('room_not_found', { roomId });
        }
        console.log(gameRoomManager.rooms, "a")
    });

    socket.on('leave_room', (data) => {
        const roomId = data.roomId;
        const reason = data.reason;
        socket.leave(roomId); // leave room 
        gameRoomManager.leaveRoom(socket.id)
        console.log(`Player ${socket.id} left room ${roomId}. Reason: ${reason}`);

        // tell everyone
        socket.to(roomId).emit('player_left', { playerId: socket.id });
    });
});

http.listen(3000, function () {
    console.log('Server started!');
});