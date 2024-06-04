import { io } from 'socket.io-client';
import Card from './card';
import Zone from '../helpers/zone';

export default class GameManager {
    constructor(scene) {
        this.serverIP = '192.168.31.202';
        this.socketIP = '192.168.31.202';

        this.scene = scene;
        this.dropZones = null;
        this.socket = null;
        this.turnTimer = 10; // TODO: 10

        this.roomId = null;
        this.playerId = null;
        this.currentPlayer = null;
        this.gameState = null;

        this.hand = [];  // Store player's hand locally
        this.handObj = [];  // Card object to store cards on hands
        this.tableCards = Array.from({ length: 8 }, () => []); // Array to store cards on the table
        this.tableCardsObj = Array.from({ length: 8 }, () => []); // Array to store cards on the table

        this.connectSocket();
        this.setupEventListeners();
        this.setupBeforeUnloadListener();
    }

    setIP(serverIP, socketIP) {
        this.serverIP = serverIP;
        this.socketIP = socketIP;

        // reconnect
        this.connectSocket();
    }

    connectSocket() {
        // this.socket = io('http://localhost:3000');

        // test on lan
        this.socket = io(this.socketIP + ':3000');
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

        this.socket.on('update_timer', (data) => {
            const { turnTimer } = data;
            this.turnTimer = turnTimer;
            // console.log(`Remaining time for player ${this.currentPlayer} in room ${this.roomId}: ${this.turnTimer} seconds`);
            this.scene.timerText.setText(`Remaining time for player ${this.currentPlayer} in room ${this.roomId}: ${this.turnTimer} seconds`);
        });

        this.socket.on('update_game_state', (data) => {
            console.log(`update game state!`);
            const { roomId, currentPlayer, gameState, pairSuccessIndex } = data;

            this.updateGameState(data);
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

        this.socket.on('pair_success', (data) => {
            const { zoneIndex, cards, cardIds } = data;
            console.log("asdj;f;asdkjfsdjl;fjk;asdlfj;klsfjkl;dsafjkl;")
            this.handlePairSuccess(zoneIndex, cards);
            // this.endTurn();
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

    isPlayerTurn() {
        if (this.playerId === this.currentPlayer)
            return true;
        return false;
    }

    dealCards(gameObject, zoneIndex) {
        console.log(this.playerId, this.currentPlayer, "sadj;f;asdjfsjlafjkl;ads");
        if (this.playerId === this.currentPlayer) {
            console.log("deal card");
            this.socket.emit('deal_cards', { roomId: this.roomId, playerId: this.playerId, cardId: gameObject.card.cardId, zoneIndex });
        } else {
            console.log('not your turn!');
        }
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

    updateGameState(data) {
        console.log("更新遊戲狀態");
        const { roomId, currentPlayer, gameState, table, pairSuccessIndex, cards } = data;
        console.log("接收到的資料:", data);
        this.currentPlayer = currentPlayer;
        this.gameState = gameState;
    
        const getCardsOnTablePromise = new Promise((resolve) => {
            this.getCardsOnTable(currentPlayer, cards);
            resolve();
            console.log("A0");
        });
    
        getCardsOnTablePromise
            .then(() => {
                return new Promise((resolve) => {
                    this.displayCardsOnTable();
                    resolve();
                    console.log("A0000");
                });
            })
            .then(() => {
                return new Promise((resolve) => {
                    this.getPlayerHand();
                    console.log("A1");
                    resolve();
                });
            })
            .then(() => {
                return new Promise((resolve) => {
                    this.displayPlayerHand();
                    console.log("A2");
                    resolve();
                });
            })
            .then(() => {
                return new Promise((resolve) => {
                    this.updateUI(data);
                    console.log("A3");
                    resolve();
                });
            })
            .then(() => {
                if (pairSuccessIndex !== -1) {
                    this.handlePairSuccess(this.tableCardsObj[pairSuccessIndex]);
                }
            })
            .catch((error) => {
                console.error("更新遊戲狀態時發生錯誤:", error); 
            });
    }
    
    
    updateUI(data) {
        const { roomId, currentPlayer, gameState } = data;

        this.updateCurrentPlayerText(currentPlayer); 
    }

    updateCurrentPlayerText(currentPlayer) {
        if (this.scene && this.scene.currentPlayerText) {
            if (currentPlayer === this.playerId) { 
                this.scene.currentPlayerText.setText(`Current Player: ${currentPlayer}(你的回合)`);
                this.scene.currentPlayerText.setColor('#00ff00'); // Green
            } else {
                this.scene.currentPlayerText.setText(`Current Player: ${currentPlayer}`);
                this.scene.currentPlayerText.setColor('#ffffff'); // white 
            }
        }
    } 

    drawCards() {
        this.socket.emit('draw_cards', { roomId: this.roomId, playerId: this.playerId });
    }

    getCardsOnTable(playerId, cards) {
        // const { playerId, cards } = data;
        // if (playerId === this.playerId) {
        this.tableCards = cards;  // Update local hand
        console.log(this.tableCards);

        this.displayCardsOnTable();
        // }

        // this.socket.emit('get_cards_on_table', { roomId: this.roomId, playerId: this.playerId });
    }

    clearCardsOnTable() {
        console.log('this.tableCardsObj')
        console.log(this.tableCardsObj);

        this.tableCardsObj.forEach(cardGroup => {
            cardGroup.forEach(card => {
                card.destroy();
            });
        });
    
        this.tableCardsObj = Array.from({ length: 8 }, () => []);
    }

    displayCardsOnTable() {
        // 清除舊有的桌面卡片顯示
        this.clearCardsOnTable()

        // this.tableCards = [];
        console.log("display cards on table")
        // TODO: 不知道會有甚麼影響
        // this.dropZone.data.values.cards = 0;

        this.tableCardsObj = this.tableCards.map((cardGroup, groupIndex) => {
            return cardGroup.map((card, index) => {
                const dropZone = this.dropZones[groupIndex]; // 根據索引找到對應的 dropZone
                const x = dropZone.x + (index * 50);
                const y = dropZone.y;
                let tableCard = new Card(this.scene, card.id, false);
                tableCard.render(x, y, 'cyanCardFront', card.type);
                return tableCard;
            });
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

    setupDragEvents() {
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.scene.input.on('dragend', (pointer, gameObject, dropped) => {
            gameObject.clearTint();
            if (!dropped) {
                this.insertCardInHand(gameObject);
                this.displayPlayerHand();
            }
        });
    }

    insertCardInHand(card) {
        const baseX = 475;
        const baseY = 650;
        const cardOffset = 100;
    
        // 獲取卡片基本信息
        const cardData = { id: card.card.cardId, type: card.card.type };
    
        // 移除已經存在於手牌中的相同卡片
        const existingIndex = this.handObj.findIndex(c => c.card.cardId === card.card.cardId);
        if (existingIndex !== -1) {
            this.handObj.splice(existingIndex, 1);
            this.hand.splice(existingIndex, 1); // 同步移除 this.hand 中的相應卡片
        }
    
        let insertIndex = this.handObj.length;
        for (let i = 0; i < this.handObj.length; i++) {
            console.log("FFF", card.x, this.handObj[i].x);
            if (card.x < this.handObj[i].x) {
                insertIndex = i;
                break;
            }
        }
        console.log("FFF FINAL", insertIndex);
    
        this.handObj.splice(insertIndex, 0, card);
        this.hand.splice(insertIndex, 0, cardData); // 同步插入 this.hand 中的相應卡片基本信息
    
        // 更新所有手牌的位置
        this.handObj.forEach((card, index) => {
            if (card.card) {
                card.card.x = baseX + index * cardOffset;
                card.card.y = baseY;
            } else {
                card.x = baseX + index * cardOffset;
                card.y = baseY;
            }
        });
    
        this.handObj.forEach(card => {
            console.log(card)
            card.card.destroy(); 
        });
        console.log("update", this.hand)
        this.socket.emit('update_hand', { roomId: this.roomId, playerId: this.playerId, hand: this.hand });
    }
    
    
    
    
    displayPlayerHand() {
        const baseX = 475; 
        const baseY = 650;
        const cardOffset = 100;
    
        // rerender all cards
        this.clearPlayerHandDisplay();
    
        this.handObj = this.hand.map((card, index) => {
            let playerCard = new Card(this.scene, card.id, this.isPlayerTurn());
            playerCard.render(baseX + (index * cardOffset), baseY, 'cyanCardFront', card.type);
            return playerCard.card; 
        });
    }
    

    clearPlayerHandDisplay() {
        this.handObj.forEach(card => {
            card.destroy();
        });
        this.handObj = [];
    }

    endTurn() {
        this.socket.emit('end_turn', { roomId: this.roomId, playerId: this.playerId });
    }

    handlePairSuccess(cards) {
        console.log("處理配對成功的卡片:", cards);
    
        // 確保有卡片需要高亮和移除
        if (cards.length > 0) {
            // 記住每張卡片的位置和類型資訊
            const cardInfo = cards.map(card => ({
                x: card.card.x,
                y: card.card.y,
                type: card.card.texture.key,
                cardId: card.cardId,
                isPlayerTurn: card.isPlayerTurn
            }));
    
            // 先清除舊卡片
            cards.forEach(card => {
                card.card.destroy(); // 銷毀每個卡片對象的圖像
                console.log('銷毀卡片圖像:', card.card);
            });
    
            // 渲染新的高亮卡片
            const newCards = cardInfo.map(info => {
                const newCard = new Card(this.scene, info.cardId, info.isPlayerTurn);
                newCard.render(info.x, info.y, info.type, 'cyanCardFront'); // 重新渲染卡片
                newCard.card.setTint(0xff0000); // 設置為紅色高亮
                console.log('設置卡片為紅色高亮:', newCard.card); 
                return newCard; 
            });
    
            // 使用計時器在一秒後移除高亮卡片
            this.scene.time.delayedCall(1000, () => {
                console.log('移除高亮顯示的卡片');
                newCards.forEach(card => {
                    card.card.destroy(); // 銷毀每個卡片對象的圖像
                    console.log('銷毀卡片圖像:', card.card);
                });
            });
        }
    }
    
    updatePlayerList(players) {
        const playerListContainer = document.getElementById('playerListContainer');
        playerListContainer.innerHTML = ''; // 清空列表

        players.forEach(playerId => {
            const playerItem = document.createElement('div');
            playerItem.textContent = `Player ID: ${playerId}`;
            playerItem.style.marginBottom = '10px';
            
            // 高亮當前玩家
            if (playerId === this.gameManager.currentPlayer) {
                playerItem.style.color = 'green'; // 將當前玩家 ID 設置為綠色
                playerItem.style.fontWeight = 'bold'; // 讓文字加粗
            }
    
            playerListContainer.appendChild(playerItem);
        });
    }

}
