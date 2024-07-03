import { io } from 'socket.io-client';
import Card from './card';
import Zone from '../helpers/zone';
import { NONE } from 'phaser';

export default class GameManager {
    constructor(scene) {
        this.serverIP = '192.168.31.202';
        this.socketIP = '192.168.31.202'; 

        this.scene = scene;
        this.dropZones = null;
        this.zone = null;
        this.socket = null;
        this.turnTimer = 10; // TODO: 10

        this.roomId = null;
        this.playerId = null;
        this.currentPlayer = null;
        this.gameState = null;

        this.isGameTable = false;

        this.hand = [];  // Store player's hand locally
        this.handObj = [];  // Card object to store cards on hands
        this.tableCards = Array.from({ length: 8 }, () => []); // Array to store cards on the table
        this.tableCardsObj = Array.from({ length: 8 }, () => []); // Array to store cards on the table

        this.selectedCards = [];

        this.currentDraggedCard = null;
        

        this.connectSocket();
        this.setupEventListeners();
        this.setupBeforeUnloadListener();
   
        // this.setupDragEvents();
        // this.setupPointerEvents();

        
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
        
            // 格式化並設置定時器文字
            const playerText = `Player: ${this.currentPlayer}`;
            const roomText = `Room ID: ${this.roomId}`;
            const timerText = `Remaining time: ${this.turnTimer} seconds`;
        
            // 設置顯示文字
            this.scene.timerText.setText(`${playerText}\n${roomText}\n${timerText}`);
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

                if (!this.isGameTable) {
                    this.displayPlayerHand();
                }
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

                if (this.isGameTable) {
                    this.displayCardsOnTable();
                }
            }
        });

        this.socket.on('pair_result', (data) => {
            const {
                success,
                playerId,
                matchedHandCards,
                matchedHandIndexes,
                matchedTableCards,
                matchedTableIndexes,
                message,
                selectedCards
            } = data;
        
            if (success) {
                console.log('配對成功');
                this.handlePairSuccess(playerId, matchedHandCards, matchedHandIndexes, matchedTableCards, matchedTableIndexes);
            } else {
                console.log('配對失敗：', message);
                this.handlePairFailure(playerId, selectedCards);
            }
        });

        this.socket.on('time_to_discard_some_cards', (data) => {
            this.showText('選擇兩張卡片丟棄', 10, 500);
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

    handlePairSuccess(playerId, matchedHandCards, matchedHandIndexes, matchedTableCards, matchedTableIndexes) {
        console.log(`玩家 ${playerId} 配對成功`); 
        console.log('配對成功的手牌：', matchedHandCards);
        console.log('配對成功的桌牌：', matchedTableCards);
        console.log("========")
        console.log(matchedTableIndexes)
        if (!this.zone) return;
        
        matchedTableIndexes.forEach(zoneIndex => {
            this.zone.highlightZone(zoneIndex);
            setTimeout(() => { 
                this.zone.clearHighlightZone(zoneIndex);
            }, 2000); // 框框顯示2秒
        });
    
        // 根據需要，更新手牌和其他遊戲狀態
    }
    
    handlePairFailure(playerId, selectedCards) {
        // 處理失敗的邏輯
        console.log(`玩家 ${playerId} 配對失敗`);
        console.log('選擇的卡牌：', selectedCards);
        // 可以在這裡給玩家提示或進行其他操作
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

    joinRoom(roomId, isTable) {
        this.roomId = roomId;
 
        if (isTable) {
            this.socket.emit('table_join_room', { roomId: roomId });
        } else {
            this.socket.emit('join_room', { roomId: roomId });
        }
    }

    updateGameState(data) {
        console.log("debug: 更新遊戲狀態!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        const { roomId, currentPlayer, gameState, table, pairSuccessIndex, cards, selected } = data;
        console.log("接收到的資料:", data);
        this.currentPlayer = currentPlayer;
        this.gameState = gameState;
        // this.selectedCards = selected;
        this.selectedCards = []

        console.log('HIGLLIGHTHIGLLIGHTHIGLLIGHTHIGLLIGHTHIGLLIGHT')
        console.log("SELECTED CARDS", this.selectedCards)
        console.log('HIGLLIGHTHIGLLIGHTHIGLLIGHTHIGLLIGHTHIGLLIGHT')

        this.highlightSelectedCards();
    
        const getCardsOnTablePromise = new Promise((resolve) => {
            this.getCardsOnTable(currentPlayer, cards);
            resolve();
            console.log("A0");
        });
    
        getCardsOnTablePromise
            .then(() => { 
                return new Promise((resolve) => {
                    // this.displayCardsOnTable();
                    if (this.isGameTable) {
                        this.displayCardsOnTable();
                    }
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
                    if (!this.isGameTable) {
                        this.displayPlayerHand();
                    }
                    // this.displayPlayerHand();
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
                // if (pairSuccessIndex !== -1) {
                //     this.handlePairSuccess(this.tableCardsObj[pairSuccessIndex]);
                // }
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
        console.log('===table cards===')
        console.log(this.tableCards);
        console.log('===table cards===')

        if (this.isGameTable) {
            this.displayCardsOnTable();
        }
        // this.displayCardsOnTable();
        // }

        // this.socket.emit('get_cards_on_table', { roomId: this.roomId, playerId: this.playerId });
    }

    clearCardsOnTable() {
        console.log('this.tableCardsObj')
        console.log(this.tableCardsObj);

        this.tableCardsObj.forEach(cardGroup => {
            cardGroup.forEach(card => {
                card.card.destroy(); 
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

    // clearPlayerHandDisplay() {
    //     console.log('this.handObj')
    //     console.log(this.handObj);
    //     this.handObj.forEach(card => {
    //         card.destroy();
    //     });
    //     this.handObj = [];
    // }

    setupDragEvents() {
        this.scene.input.on('dragstart', (pointer, gameObject) => {
            this.isDragging = true;
            gameObject.setTint(0xff69b4);
            this.currentDraggedCard = gameObject;
        });
    
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    
        this.scene.input.on('dragend', (pointer, gameObject, dropped) => {
            this.isDragging = false; // 重置拖動狀態
            gameObject.clearTint();

            // 更新卡片 objcet 位置
            const finalX = gameObject.x;
            const finalY = gameObject.y;
    
            if (gameObject.card) {
                gameObject.card.updatePosition(finalX, finalY);
            }            
            this.currentDraggedCard = null;
            // if (!dropped) {
            //     console.log('debug-a this.insertCardInHand(gameObject);')
            //     this.insertCardInHand(gameObject);
            // } else {
            //     console.log('debug-a this.checkForCardSwap(gameObject);')
            //     this.checkForCardSwap(gameObject);
            // }
            // this.displayPlayerHand(); // 更新手牌顯示
        });
    }
    
    setupPointerEvents() {
        this.scene.input.on('pointerdown', (pointer, gameObject) => {
            this.isDragging = false; // 每次點擊時重置拖動狀態
            this.pointerDownTime = this.scene.time.now; // 記錄點擊時間
        });
    
        this.scene.input.on('pointerup', (pointer, gameObject) => {
            const clickDelay = 200; // 設置點擊延遲時間 (毫秒)
            const timeSincePointerDown = this.scene.time.now - this.pointerDownTime;
    
            if (!this.isDragging && timeSincePointerDown < clickDelay) {
                this.handlePointerDown(pointer);
            }
        });
    }
    
    
    
    
    
    checkForCardSwap(draggedCard) {
        const swapMargin = 100; // 定義更大的判定範圍
    
        this.handObj.forEach(card => {
            if (card !== draggedCard) {
                const distance = Phaser.Math.Distance.Between(draggedCard.x, draggedCard.y, card.x, card.y);
                if (distance < swapMargin) {
                    // 交換兩張卡片的位置
                    let tempX = card.x;
                    let tempY = card.y;
                    card.x = draggedCard.x;
                    card.y = draggedCard.y;
                    draggedCard.x = tempX;
                    draggedCard.y = tempY;
    
                    // 更新卡片數組中的位置
                    const draggedIndex = this.handObj.indexOf(draggedCard);
                    const targetIndex = this.handObj.indexOf(card);
                    if (draggedIndex !== -1 && targetIndex !== -1) {
                        [this.handObj[draggedIndex], this.handObj[targetIndex]] = [this.handObj[targetIndex], this.handObj[draggedIndex]];
                    }
                }
            }
        });
    }
    
    

    // TODO: 重新寫一個
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
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        const cardWidth = 100; // 卡片的寬度（假設為 100）
        const cardOffset = 200; // 卡片之間的間距
        const cardsPerRow = 4; // 每 row 的卡片數量
        const rowHeight = cardWidth * 2 - 20; // 每 row 的高度，假設為卡片高度加上一點間距
        const baseY = screenHeight / 2; // 將卡片顯示在螢幕的正中央下方
    
        // 重新渲染所有卡片
        console.log('debug debug debug debug debug debug debug debug debug debug debug debug debug ')

        this.clearPlayerHandDisplay();
    
        this.handObj = this.hand.map((card, index) => {
            const row = Math.floor(index / cardsPerRow); // 計算卡片所在的 row
            const col = index % cardsPerRow; // 計算卡片所在的 column 
            const totalCardWidth = cardOffset * (Math.min(cardsPerRow, this.hand.length) - 1) + cardWidth;
            const baseX = (screenWidth - totalCardWidth) / 2; // 計算每 row 的起始X座標，讓卡片在螢幕中央
    
            // let playerCard = new Card(this.scene, card.id, this.isPlayerTurn());
            let playerCard = new Card(this.scene, card.id, true); // 可以隨意移動卡牌，無論使否是自己的回合
            playerCard.render(baseX + (col * cardOffset), baseY + (row * rowHeight), 'cyanCardFront', card.type);
            return playerCard.card;  
        });
    }
    
    

    clearPlayerHandDisplay() {
        this.handObj.forEach(card => {
            console.log('debug-b', card)
            card.card.destroyCard();
        });
        this.handObj = [];
    }

    endTurn() {
        this.socket.emit('end_turn', { roomId: this.roomId, playerId: this.playerId });
    }

    highlightCard(cardId) {
        console.log("highlightCard處理配對成功的卡片:", cardId);

        // 找到匹配的卡片
        const card = this.findCardById(cardId);
        if (card) {
            console.log('highlightCard', card)
            // 記住卡片的位置和類型資訊
            const cardInfo = {
                x: card.x,
                y: card.y,
                type: card.card.type,
                cardId: card.card.cardId,
            };
    
            // 清除舊卡片
            card.destroy(); // 銷毀卡片對象的圖像
            console.log('highlightCard info:', cardInfo);
            console.log('highlightCard銷毀卡片圖像:', card.card);
     
            // 渲染新的高亮卡片
            // const newCard = new Card(this.scene, cardInfo.cardId, cardInfo.isPlayerTurn);
            // newCard.render(cardInfo.x, cardInfo.y, cardInfo.type, 'cyanCardFront'); // 重新渲染卡片
            // newCard.card.setTint(0xff0000); // 設置為紅色高亮
            // console.log('highlightCard設置卡片為紅色高亮:', newCard.card);
    
            // 使用計時器在一秒後移除高亮卡片
            // this.scene.time.delayedCall(1000, () => {
            //     console.log('highlightCard移除高亮顯示的卡片');
            //     newCard.card.destroy(); // 銷毀卡片對象的圖像
            //     console.log('highlightCard銷毀卡片圖像:', newCard.card);
            // });
        } else {
            console.log('highlightCard未找到卡片:', cardId);
        }
    }

    findCardById(cardId) {
        return this.scene.children.list.find(child => child.card && child.card.cardId === cardId);
    }

    // handlePairSuccess(cards) {
    //     console.log("處理配對成功的卡片:", cards);
    
    //     // 確保有卡片需要高亮和移除
    //     if (cards.length > 0) {
    //         // 記住每張卡片的位置和類型資訊
    //         const cardInfo = cards.map(card => ({
    //             x: card.card.x,
    //             y: card.card.y,
    //             type: card.card.texture.key,
    //             cardId: card.cardId,
    //             isPlayerTurn: card.isPlayerTurn
    //         }));
    
    //         // 先清除舊卡片
    //         cards.forEach(card => {
    //             card.card.destroy(); // 銷毀每個卡片對象的圖像
    //             console.log('銷毀卡片圖像:', card.card);
    //         });
    
    //         // 渲染新的高亮卡片
    //         const newCards = cardInfo.map(info => {
    //             const newCard = new Card(this.scene, info.cardId, info.isPlayerTurn);
    //             newCard.render(info.x, info.y, info.type, 'cyanCardFront'); // 重新渲染卡片
    //             newCard.card.setTint(0xff0000); // 設置為紅色高亮
    //             console.log('設置卡片為紅色高亮:', newCard.card); 
    //             return newCard; 
    //         });
    
    //         // 使用計時器在一秒後移除高亮卡片
    //         this.scene.time.delayedCall(1000, () => {
    //             console.log('移除高亮顯示的卡片');
    //             newCards.forEach(card => {
    //                 card.card.destroy(); // 銷毀每個卡片對象的圖像
    //                 console.log('銷毀卡片圖像:', card.card);
    //             });
    //         });
    //     }
    // }
    
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

    handlePointerDown(pointer) {
        if (!this.isPlayerTurn() && !this.isGameTable) return;
        
        const { x, y } = pointer;
        let clickedOnCard = false;
        let selectedCard = null;
        let selectedCardObj = null;
    
        this.scene.children.list.forEach(child => {
            if (child.texture && child.texture.key.includes('Card') && child.getBounds().contains(x, y)) {
                selectedCardObj = this.toggleCardSelection(child);
                clickedOnCard = true;
    
                console.log('------------');
                console.log('hand', this.hand);
                console.log('ahdnobj', this.handObj);
                console.log('table cards', this.tableCards);
                console.log('table cards obj', this.tableCardsObj);
                console.log('selected', this.getFormattedSelectedCards());
                console.log('------------'); 
            }
        });
    
        // if (!clickedOnCard) {
        //     this.clearAllSelections();  
        // } else {
        //     // 發送卡片資訊給 socket server
        //     if (this.selectedCards.length === 0) return;
        //     const selectedCard = this.selectedCards[this.selectedCards.length - 1].card;
        //     console.log('selectedddd', selectedCard);   
            
        //     if (selectedCard) {
        //         this.socket.emit('update_selected', { roomId: this.roomId, card: { id: selectedCard.cardId, type: selectedCard.type } });
        //     }
        // }
        console.log('"debug-3 SELECTED CARDS",  clicked 0', this.selectedCards)
        // 發送卡片資訊給 socket server
        
        if (!selectedCardObj) {
            return;
        }
        // selectedCard = this.selectedCards[this.selectedCards.length - 1].card;
        selectedCard = selectedCardObj.card;
        console.log('debug-3 selectedddd', selectedCard);
         
        console.log('debug-3 clicked 1') 
        this.socket.emit('update_selected', { roomId: this.roomId, card: { id: selectedCard.cardId, type: selectedCard.type } });
    
    }

    highlightSelectedCards() { 
        // 遍歷選中的卡片
        this.selectedCards.forEach(selectedCard => {
            this.highlightCard(selectedCard.id)
            console.log('highlight', selectedCard)
            // 在場景中找到匹配的卡片
            this.scene.children.list.forEach(child => {
                console.log('highlight-1', child, child.cardId, selectedCard.id)
                if (child.card){
                    console.log('highlight-023223', child.card, child.card.cardId)
                    if (child.card.cardId === selectedCard.id && child.card.type === selectedCard.type) {
                        console.log('highlight-11110101010')
                        // 高亮匹配的卡片
                        child.setTint(0xff69b4);
                    }
                }
            });
        });
    }
    
    
    getFormattedSelectedCards() {
        return this.selectedCards.map(card => ({
            id: card.cardId,  
            type: card.type     
        }));
    }
    
    clearAllSelections() {
        if (this.selectedCards && this.selectedCards.length > 0) {  
            this.selectedCards.forEach(card => { 
                if (card)
                card.clearTint(); 
            });
            this.selectedCards = [];
        }
    }  
    
    
    // clearAllSelections() {
    //     if (this.selectedCards && this.selectedCards.length > 0) { 
    //         this.selectedCards.forEach(card => {
    //             card.clearTint();
    //         });
    //         this.selectedCards = [];
    //     }
    // }

    
    toggleCardSelection(card) {
        if (this.isDragging) return; // 如果正在拖動，不進行點擊處理
        
        if (this.selectedCards[0]) {
            console.log('debug: -=-=-=-=-=-==--=-=-=-=-=-=-=-=-=')
            console.log('debug: | ', this.selectedCards[0])
            console.log('debug: | ', this.selectedCards[0].card)
            console.log('debug: | ', this.selectedCards[0].card.cardId)
            console.log('debug: | ', card.card.cardId)
            console.log('debug: | ', card.x, card.y)
            console.log('debug: -=-=-=-=-=-==--=-=-=-=-=-=-=-=-=') 
        }

        const index = this.selectedCards.findIndex(selectedCard => selectedCard.card && selectedCard.card.cardId === card.card.cardId);
        const moveUpDistance = 50; // 卡片向上移動的距離
        console.log('debug: ', this.selectedCards, card)
        console.log('debug: ', index)
        if (index === -1) {
            console.log('debug-3: selected!!+++==++=++++=+===+==++=++++++=+')
            // 如果卡片未被選中，將其設置為高亮並向上移動
            card.setTint(0xff69b4);
            this.selectedCards.push(card);
    
            this.scene.tweens.add({
                targets: card, 
                y: card.y - moveUpDistance,
                duration: 300,
                ease: 'Power2'
            });
        } else {
            console.log('debug-3: clear+++==++=++++=+===+==++=++++++=+')
            // 如果卡片已被選中，將其取消高亮並歸位
            card.clearTint();
            this.selectedCards.splice(index, 1); // 從選中列表中移除卡片
    
            // 清除所有針對該卡片的動畫
            this.scene.tweens.killTweensOf(card);
    
            this.scene.tweens.add({
                targets: card,
                y: card.y + moveUpDistance,
                duration: 300,
                ease: 'Power2'
            });
        }
        console.log('debug(after): ', this.selectedCards)
        console.log('debug(after): ', index)

        return card;
    }
    

    handleDropZoneClick() {
        console.log('debug: drop zone click!!!!')
        this.selectedCards.forEach(card => {
            card.clearTint(); 
            card.setInteractive(false);
            this.dealCards(card, this.dropZones.indexOf(card.zone)); 
        });
        this.selectedCards = []; 
    }
 
    pairCards() {
        this.socket.emit('pair_cards', { roomId: this.roomId, playerId: this.playerId });
    }

    discardCards() {
        this.socket.emit('discard_cards', { roomId: this.roomId, playerId: this.playerId });
    }
    
    showText(text, x = 10, y = 10, style = { font: '16px Arial', fill: '#ffffff' }) {
        console.log("a")
        if (!this.scene.displayedTexts) {
            this.scene.displayedTexts = [];
        }
        let newText = this.scene.add.text(x, y + this.scene.displayedTexts.length * 20, text, style);
        this.scene.displayedTexts.push(newText);
        return newText; 
    }

    clearTexts() { 
        if (this.scene.displayedTexts) {
            this.scene.displayedTexts.forEach(text => {
                text.destroy(); 
            });
            this.scene.displayedTexts = [];
        }
    }  
}
        