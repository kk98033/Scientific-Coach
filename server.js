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
let players = [];

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

io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);
    socket.emit('your_player_id', { playerId: socket.id });

    socket.on('create_room', (data) => {
        const roomId = gameRoomManager.generateUniqueRoomId();
        let rooms = gameRoomManager.getRoomIds(); // debug, TODO: delete it
        if (gameRoomManager.createRoom(roomId)) {
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
    });

    socket.on('leave_room', (data) => {
        const roomId = data.roomId;
        const reason = data.reason;
        socket.leave(roomId); // leave room
        console.log(`Player ${socket.id} left room ${roomId}. Reason: ${reason}`);

        // tell everyone
        socket.to(roomId).emit('player_left', { playerId: socket.id });
    });
});

http.listen(3000, function () {
    console.log('Server started!');
});