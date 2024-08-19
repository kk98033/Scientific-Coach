const fs = require('fs');
const https = require('https');
const GameRoomManager = require("./gameRoomManager");
const gameRoomManager = new GameRoomManager();

const server = require('express')();
const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};
const httpsServer = https.createServer(options, server);
const io = require('socket.io')(httpsServer, {
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
        const playerId = data.playerId;
        socket.leave(roomId); // leave room 
        const { result } = gameRoomManager.leaveRoom(playerId)
        if (result === 'room_deleted') {
           // 向房間發送"房間已刪除"訊息 
           io.to(roomId).emit('this_room_has_been_deleted', { roomId });
        }
        console.log(`Player ${playerId} left room ${roomId}. Reason: ${reason}`); 
    
        // 向房間內的所有玩家發送更新後的玩家列表
        const players = gameRoomManager.getPlayersInRoom(roomId);
        io.to(roomId).emit('update_player_list', { players });
    
        // tell everyone
        socket.to(roomId).emit('player_left', { playerId: playerId });
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

    // 處理卡片的選取
    socket.on('update_selected', (data) => {
        const { roomId, card } = data;
        // console.log("-=-=-=-=-=-=-=-=-=-=-=-==--=update_selected-=-=-=-=-=-=-=-=-=-=-=-==--=", data, card)
        gameManager.appendCurrentSelectedCards(roomId, card);
    });

    // 專門處理技能使用期間的選取
    socket.on('update_selected_on_skills', (data) => {
        const { roomId, card, playerId } = data;
        console.log()
        console.log("playerID: ", playerId)
        console.log()
        // console.log("-=-=-=-=-=-=-=-=-=-=-=-==--=update_selected-=-=-=-=-=-=-=-=-=-=-=-==--=", data, card)
        gameManager.appendCurrentSelectedCardsForSkills(roomId, card, playerId);
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

            const gameOverResult = gameManager.isGameOver(roomId, playerId);
            if (gameOverResult.gameOver) {
                // 遊戲結束
                const { gameOver, winnerId } = gameOverResult;
                console.log(`遊戲結束！獲勝者是玩家 ${winnerId}`);

                gameManager.handleGameOver(roomId, winnerId);

            } else {
                console.log('遊戲尚未結束');
            }
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

    socket.on('get_and_update_settings', (data) => {
        const { roomId } = data;
        const settings = gameManager.getSettings(roomId);
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

        io.to(roomId).emit('is_game_started_on_this_room', {
            gameIsStarted: gameIsStarted,
            isPlayerInRoom: isPlayerInRoom,
            playerId: playerId
        });
    });
    
    socket.on('is_game_started_on_this_room_for_leaving_request', (data) => {
        const { roomId, playerId } = data;
        console.log([roomId, playerId])
        const { gameIsStarted, isPlayerInRoom } = gameManager.isGameStartedInRoom(roomId, playerId);

        io.to(roomId).emit('is_game_started_on_this_room_for_leaving_request', {
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
            io.to(roomId).emit('get_player_scores', {
                resourcePoints: resourcePoints,
                gameLevel: gameLevel,
                cardPairCount: cardPairCount
            });
        }
    });

    // skill logics
    socket.on('use_skill_1', (data) => {
        /* 友誼賽(-1點) */
        const { roomId, playerId, targetPlayerId } = data;

        if (gameManager.hasSufficientResourcePoints(roomId, playerId, 1)) {
            gameManager.usingSills(roomId, playerId);
            gameManager.deductResourcePoints(roomId, playerId, 1);

            console.log('skill 1 | target: ', targetPlayerId);
    
            // TODO: check points before use skill
            io.to(roomId).emit('use_skill_1', {
                roomId: roomId,
                playerId: playerId,
                targetPlayerId: targetPlayerId,
            });

            const result = gameManager.getPlayerScores(roomId, playerId);
            if (result) {
                const { resourcePoints, gameLevel, cardPairCount } = result
                // 更新點數 UI
                io.to(roomId).emit('update_resource_points_ui', {
                    roomId: roomId,
                    playerId: playerId,
                    resourcePoints: resourcePoints,
                    gameLevel: gameLevel,
                    cardPairCount: cardPairCount
                });
            }

        } else {
            errorNotification(roomId, `你沒有足夠的點數! 需要"1點"!`);
        }

    });

    socket.on('use_skill_2', (data) => {
        /* 情蒐(-1點) */
        const { roomId, playerId } = data;

        if (gameManager.hasSufficientResourcePoints(roomId, playerId, 1)) {
            gameManager.usingSills(roomId, playerId);
            gameManager.deductResourcePoints(roomId, playerId, 1);
    
            console.log('skill 2 ');
    
            // TODO: check points before use skill
            io.to(roomId).emit('use_skill_2', {
                roomId: roomId,
                playerId: playerId,
            });

            const result = gameManager.getPlayerScores(roomId, playerId);
            if (result) {
                const { resourcePoints, gameLevel, cardPairCount } = result
                // 更新點數 UI
                io.to(roomId).emit('update_resource_points_ui', {
                    roomId: roomId,
                    playerId: playerId,
                    resourcePoints: resourcePoints,
                    gameLevel: gameLevel,
                    cardPairCount: cardPairCount
                });
            }

        } else {
            errorNotification(roomId, `你沒有足夠的點數! 需要"1點"!`);
        }
    });

    socket.on('use_skill_3', (data) => {
        /* 挖角(-2點) */
        const { roomId, playerId, targetPlayerId } = data;

        if (gameManager.hasSufficientResourcePoints(roomId, playerId, 2)) {
            gameManager.usingSills(roomId, playerId);
            gameManager.deductResourcePoints(roomId, playerId, 2);
    
            console.log('skill 3 | target: ', targetPlayerId);
    
            // TODO: check points before use skill
            io.to(roomId).emit('use_skill_3', {
                roomId: roomId,
                playerId: playerId,
                targetPlayerId: targetPlayerId,
            });

            const result = gameManager.getPlayerScores(roomId, playerId);
            if (result) {
                const { resourcePoints, gameLevel, cardPairCount } = result
                // 更新點數 UI
                io.to(roomId).emit('update_resource_points_ui', {
                    roomId: roomId,
                    playerId: playerId,
                    resourcePoints: resourcePoints,
                    gameLevel: gameLevel,
                    cardPairCount: cardPairCount
                });
            }

        } else {
            errorNotification(roomId, `你沒有足夠的點數! 需要"2點"!`);
        }
    });

    socket.on('end_the_skill', (data) => {
        /* 結束技能 */
        const { roomId, playerId, skillType } = data;
        gameManager.endTheSkill(roomId, playerId);

        io.to(roomId).emit('end_the_skill', {
            roomId: roomId,
            playerId: playerId,
            skillType: skillType,
        });
    });

    socket.on('confirm_swap', (data) => {
        /* 確認交換 */
        const { roomId, playerId } = data;
        gameManager.confirmSwap(roomId, playerId);

        io.to(roomId).emit('confirm_swap', {
            roomId: roomId,
            playerId: playerId,
        });
    });
    socket.on('cancel_swap', (data) => {
        /* 確認交換 */
        const { roomId, playerId } = data;
        gameManager.cancelSwap(roomId, playerId);

        io.to(roomId).emit('cancel_swap', {
            roomId: roomId,
            playerId: playerId,
        });
    });

    socket.on('swap_cards', (data) => {
        /* 確認交換 */
        const { roomId, playerId } = data;
        const result = gameManager.swapCards(roomId, playerId);   
      
        io.to(roomId).emit('swap_cards', result);
    });
    
    // End skill logics
});

function errorNotification(roomId, errorMessage) {
    io.to(roomId).emit('error_occurred', { errorMessage: errorMessage });
}

httpsServer.listen(3000, function () {
    console.log('Server started on port 3000 with HTTPS!');
});