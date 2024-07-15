const GameRoomManager = require("./gameRoomManager");
const gameRoomManager = new GameRoomManager();

const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const GameManager = require('./gameManager');
const gameManager = new GameManager(io, gameRoomManager);

io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);
    socket.emit('your_player_id', { playerId: socket.id });

    socket.on('end_turn', (data) => {
        const { roomId, playerId } = data;
        gameManager.endTurn(roomId);
    });

    socket.on('deal_cards', (data) => {
        const { roomId, playerId, cardId, zoneIndex } = data;
        // console.log(data)
        if (gameManager.currentState === 'PlayerTurn') {
            gameManager.dealCards(roomId, playerId, cardId, zoneIndex); 
        } 
    });

    socket.on('draw_cards', (data) => {
        const { roomId, playerId } = data;
        console.log(`${playerId} drew a card`);
        gameManager.drawCards(roomId, playerId);
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

        console.log()
        console.log()
        console.log()
        console.log('GET PLAYER HAND')
        console.log(data)
        console.log()
        console.log()
        console.log()

        const hand = gameManager.getPlayerHand(roomId, playerId);
        io.to(roomId).emit('get_player_hand', { playerId: playerId, hand: hand });
    });

    socket.on('get_cards_on_table', (data) => {
        const { roomId, playerId } = data;
        const cards = gameManager.getCardsOnTable(roomId);
        io.to(roomId).emit('get_cards_on_table', { playerId: playerId, cards: cards });
    });

    socket.on('initialize_game', (data) => {
        const { roomId, settings } = data;
        gameManager.initializeGame(roomId, settings);
        console.log(`Game initialized in room ${roomId}`);
        io.to(roomId).emit('game_started');
    });
    // end game logic

    socket.on('create_room', (data) => {
        const roomId = gameRoomManager.generateUniqueRoomId();

        console.log(`Cards added to deck in room ${roomId}`);
        let rooms = gameRoomManager.getRoomIds(); // debug, TODO: delete it
        if (gameRoomManager.createRoom(roomId)) {
            // gameManager.addCardsToDeck(roomId, gameManager.debugCards);
            console.log(gameRoomManager.rooms[roomId])
            socket.join(roomId);
            io.to(roomId).emit('room_created', { roomId, rooms });

            // const rooms = gameRoomManager.getRoomIds();
            io.emit('room_list', gameRoomManager.getRoomIds());
        }
    });

    socket.on('join_room', (data) => {
        const roomId = data.roomId;
        const playerId = data.playerId;

        if (gameRoomManager.joinRoom(roomId, playerId)) {
            socket.join(roomId);
            io.to(roomId).emit('player_joined', { playerId });
    
            // 向房間內的所有玩家發送更新後的玩家列表
            const players = gameRoomManager.getPlayersInRoom(roomId);
            io.to(roomId).emit('update_player_list', { players });

            io.to(roomId).emit('player_joined_success', { userId: playerId });
        } else {
            socket.emit('room_not_found', { roomId });
        }
        console.log(gameRoomManager.rooms, "a")  
    });

    socket.on('table_join_room', (data) => {
        const roomId = data.roomId;
        const tableId = socket.id; // use socket ID as player ID
    
        if (gameRoomManager.tableJoinRoom(roomId, tableId)) {
            socket.join(roomId);
            io.to(roomId).emit('player_joined', { tableId });
    
            // 向房間內的所有玩家發送更新後的玩家列表
            const players = gameRoomManager.getPlayersInRoom(roomId);
            io.to(roomId).emit('update_player_list', { players });

            io.to(roomId).emit('player_joined_success', { userId: tableId });
        } else {
            socket.emit('room_not_found', { roomId });
        }
        console.log(gameRoomManager.rooms, "a")
    });
    
    socket.on('leave_room', (data) => {
        const roomId = data.roomId;
        const reason = data.reason;
        socket.leave(roomId); // leave room 
        const { result } = gameRoomManager.leaveRoom(socket.id)
        if (result === 'room_deleted') {
           // 向房間發送"房間已刪除"訊息 
           io.to(roomId).emit('this_room_has_been_deleted', { roomId });
        }
        console.log(`Player ${socket.id} left room ${roomId}. Reason: ${reason}`); 
    
        // 向房間內的所有玩家發送更新後的玩家列表
        const players = gameRoomManager.getPlayersInRoom(roomId);
        io.to(roomId).emit('update_player_list', { players });
    
        // tell everyone
        socket.to(roomId).emit('player_left', { playerId: socket.id });
    });

    socket.on('get_room_list', () => {
        const rooms = gameRoomManager.getRoomIds();
        console.log("rooms");
        console.log(rooms)
        socket.emit('room_list', rooms);
    });
    
    socket.on('update_player_list', (data) => {
        const roomId = data.roomId;
        // console.log("data", data)
        const players = gameRoomManager.getPlayersInRoom(roomId);
        io.to(roomId).emit('update_player_list', { players });
    });
 
    socket.on('update_hand', (data) => {
        const { roomId, playerId, hand } = data;
        // console.log("data", data)
        gameManager.updatePlayersHand(roomId, playerId, hand);
    });

    socket.on('update_selected', (data) => {
        const { roomId, card } = data;
        // console.log("-=-=-=-=-=-=-=-=-=-=-=-==--=update_selected-=-=-=-=-=-=-=-=-=-=-=-==--=", data, card)
        gameManager.appendCurrentSelectedCards(roomId, card);
    });

    socket.on('pair_cards', (data) => {
        const { roomId, playerId } = data;
        const result = gameManager.pairCards(roomId, playerId);
    
        if (result.error) {
            io.to(roomId).emit('pair_result', {
                success: false,
                message: result.error,
                playerId: result.playerId,
                selectedCards: result.selectedCards,
            });
        } else {
            io.to(roomId).emit('pair_result', {
                success: true,
                playerId: result.playerId,
                matchedHandCards: result.matchedHandCards,
                matchedHandIndexes: result.matchedHandIndexes,
                matchedTableCards: result.matchedTableCards,
                matchedTableIndexes: result.matchedTableIndexes,
                selectedCards: result.selectedCards,
                matchedCardPositions: result.matchedCardPositions,

                // 更新玩家的遊戲狀態紀錄
                resourcePoints: result.resourcePoints,
                gameLevel: result.gameLevel,
                cardPairCount: result.cardPairCount,
            });
        }
    });

    socket.on('discard_cards', (data) => {
        const { roomId, playerId } = data;

        gameManager.clearCurrentSelectedCards(roomId)
        const result = gameManager.discardCards(roomId, playerId);
    
        if (result.error) {
            io.to(roomId).emit('discard_cards', {
                success: false,
                message: result.error,
                playerId: result.playerId,
                selectedCards: result.selectedCards
            });
        } else {
            io.to(roomId).emit('discard_cards', {
                success: true,
                playerId: result.playerId,
                matchedHandCards: result.matchedHandCards,
                matchedHandIndexes: result.matchedHandIndexes,
                matchedTableCards: result.matchedTableCards,
                matchedTableIndexes: result.matchedTableIndexes,
                selectedCards: result.selectedCards
            });
        }
    });

    socket.on('player_ready', (data) => {
        const { roomId, playerId } = data;
        gameManager.onReady(roomId, playerId);

        const { readyPlayers, count, total } = gameRoomManager.getReadyPlayers(roomId);
        // return {
        //     readyPlayers: room.readyPlayers,
        //     count: room.readyPlayers.length
        // };
        console.log(readyPlayers, count)
        io.to(roomId).emit('get_ready_players', {
            readyPlayers: readyPlayers,
            count: count,
            total: total
        });
    });

    socket.on('player_not_ready', (data) => {
        const { roomId, playerId } = data;
        gameManager.onCancelReady(roomId, playerId);

        const { readyPlayers, count, total } = gameRoomManager.getReadyPlayers(roomId);
        // return {
        //     readyPlayers: room.readyPlayers,
        //     count: room.readyPlayers.length
        // };
        io.to(roomId).emit('get_ready_players', {
            readyPlayers: readyPlayers,
            count: count,
            total: total
        });
    });
    
    socket.on('get_ready_players', (data) => {
        const { roomId, playerId } = data;
        const { readyPlayers, count, total } = gameRoomManager.getReadyPlayers(roomId);
        // return {
        //     readyPlayers: room.readyPlayers,
        //     count: room.readyPlayers.length
        // };
        io.to(roomId).emit('get_ready_players', {
            readyPlayers: readyPlayers,
            count: count,
            total: total
        });
    });
    
    socket.on('update_settings', (data) => {
        const { roomId, settings } = data;
        gameManager.updateSettings(roomId, settings);
        // return {
        //     readyPlayers: room.readyPlayers,
        //     count: room.readyPlayers.length
        // };
        console.log(settings)
        io.to(roomId).emit('update_settings', {
            settings: settings,
        });
    });

    socket.on('update_card_positions', (data) => {
        const { roomId, playerId, cardPositions } = data;
        console.log('update card positions', data)
        gameManager.updateCardPositions(roomId, playerId, cardPositions);
    });

    socket.on('is_game_started_on_this_room', (data) => {
        const { roomId, playerId } = data;
        console.log([roomId, playerId])
        const { gameIsStarted, isPlayerInRoom } = gameManager.isGameStartedInRoom(roomId, playerId);

        io.emit('is_game_started_on_this_room', {
            gameIsStarted: gameIsStarted,
            isPlayerInRoom: isPlayerInRoom,
            playerId: playerId
        });
    });
    
    socket.on('is_game_started_on_this_room_for_leaving_request', (data) => {
        const { roomId, playerId } = data;
        console.log([roomId, playerId])
        const { gameIsStarted, isPlayerInRoom } = gameManager.isGameStartedInRoom(roomId, playerId);

        io.emit('is_game_started_on_this_room_for_leaving_request', {
            gameIsStarted: gameIsStarted,
            isPlayerInRoom: isPlayerInRoom,
            playerId: playerId
        });
    });
    
    socket.on('update_game_state', (data) => {
        const { roomId } = data;

        gameManager.updateGameState(roomId);
    });

    // TODO: leave game
    socket.on('leave_game', (data) => {
        const { roomId } = data;

        gameManager.updateGameState(roomId);
    });

    socket.on('get_player_scores', (data) => {
        const { roomId, playerId } = data;

        const result = gameManager.getPlayerScores(roomId, playerId);
        if (result) {
            const { resourcePoints, gameLevel, cardPairCount } = result
            io.emit('get_player_scores', {
                resourcePoints: resourcePoints,
                gameLevel: gameLevel,
                cardPairCount: cardPairCount
            });
        }
    });
});

http.listen(3000, function () {
    console.log('Server started!');
});