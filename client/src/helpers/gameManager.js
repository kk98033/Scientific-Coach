import { io } from 'socket.io-client';
import Card from './card';
import Zone from '../helpers/zone';
import { NONE } from 'phaser';
import { showNotification } from '../helpers/notification';
import { showLoading, hideLoading } from '../helpers/loading';
import { removeCanvasBlur, updateGameRecord } from '../helpers/game_ui';
import { addWaveGradientBorder, toggleGradientBorder, changeGradientColor } from '../helpers/waveGradient';
import { showAlert } from './alert';
import { showModal } from './modal';
import { renderCard } from './renderCard';


export default class GameManager {
    constructor(scene) {
        this.serverIP = 'localhost';
        // this.socketIP = '192.168.31.202'; 
        this.socketIP = 'localhost'; 

        this.scene = scene;
        this.dropZones = null;
        this.zone = null;
        this.socket = null;   
        this.turnTimer = 10; 
 
        this.roomId = null;
        this.playerId = null;
        this.currentPlayer = null;
        this.gameState = null;

        this.isGameTable = false;
        this.canPairCards = false;
 
        this.hand = [];  // Store player's hand locally
        this.handObj = [];  // Card object to store cards on hands
        this.handPositions = {}; // [[x1, y1], [x2, y2]...],
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
        // test on lan
        this.socket = io(this.socketIP + ':3000');
    }

    setupEventListeners() {
        this.socket.on('room_created', (data) => {
            console.log('Room created:', data.roomId);
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
            hideLoading();
            
            console.log('Room not found:', data.roomId);
            showNotification(`房間 ${data.roomId} 不存在!`, 'danger');
        });

        this.socket.on('player_joined', (data) => {
            console.log('Player joined:', data.playerId);
            if (data.playerId)
                showNotification(`Player joined: ${data.playerId}`, 'info');
        });

        this.socket.on('player_left', (data) => {
            console.log(`Player ${data.playerId} has left the room.`);
            if (data.playerId)
                showNotification(`Player ${data.playerId} has left the room.`, 'danger');
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
            removeCanvasBlur();
            this.socket.emit('get_player_scores', { roomId: this.roomId, playerId: this.playerId });
            showNotification(`遊戲正式開始!`, 'info');
        });

        this.socket.on('get_player_hand', (data) => { 
            const { playerId, hand } = data;

            console.log('debug-get_player_hand: ', data)

            if (playerId === this.playerId) {
                this.hand = hand;  // Update local hand
                console.log('debug-get_player_hand: ', "update local hand")
                console.log(playerId, 'aa');
                console.log(hand);

                if (!this.isGameTable) {
                    console.log('debug-get_player_hand: ', "not game table")
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

        this.socket.on('get_player_scores', (data) => {
            const { resourcePoints, gameLevel, cardPairCount } = data;
            updateGameRecord(gameLevel, resourcePoints, cardPairCount)
        });

        this.socket.on('this_room_has_been_deleted', (data) => {
            const { roomId } = data;
            if (this.isGameTable) {
                showModal(
                    '房間已關閉', // 標題
                    '此房間內所有玩家皆退出了，因此已經關閉', // 消息
                    () => { // 確認回調
                        console.log('確認按鈕被點擊');
                        this.leaveRoomAndClearUI();
                        showAlert("已自動離開已被刪除的房間");
                    },
                    () => { // 取消回調
                        console.log('取消按鈕被點擊');
                        this.leaveRoomAndClearUI();
                        showAlert("已自動離開已被刪除的房間");
                    }
                );
            }
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
                selectedCards,
                matchedCardPositions, 

                // 更新玩家的遊戲狀態紀錄
                resourcePoints,
                gameLevel,
                cardPairCount,
            } = data;
         
            if (success) {
                console.log('debug-pair 配對成功');
                this.handlePairSuccess(playerId, matchedHandCards, matchedHandIndexes, matchedTableCards, matchedTableIndexes, resourcePoints, gameLevel, cardPairCount, matchedCardPositions);
            } else {
                console.log('debug-pair 配對失敗：', message);
                this.handlePairFailure(playerId, selectedCards); 
            }
        });

        this.socket.on('time_to_discard_some_cards', (data) => {
            this.showText('選擇兩張卡片丟棄', 10, 500);
            this.canPairCards = false;

            if (!this.isGameTable && this.isPlayerTurn()) {
                this.triggerRedGradient();
            }

        });

        this.socket.on('auto_discarded_cards', (data) => {
            const { selectedCards } = data;
            this.showText('選擇兩張卡片丟棄', 10, 10, { font: '16px Arial', fill: '#ffffff' });
            this.canPairCards = false;
        
            if (!this.isGameTable && this.isPlayerTurn()) {
                this.triggerRedGradient();
            }
        
            // 顯示自動丟棄的卡片資訊
            selectedCards.forEach((card, index) => {
                this.showText(`自動丟棄的卡片: ${card.type}`, 10, 30 + index * 20, { font: '16px Arial', fill: '#ffffff' });
            });
        
            // 10秒後移除所有文本
            setTimeout(() => {
                this.clearTexts();
            }, 10000);
        });
        
        

        this.socket.on('get_ready_players', (data) => {
            const { readyPlayers, count, total } = data;
            console.log('debug-4', readyPlayers)
            console.log('debug-4', count)
            console.log('debug-4', total)
            this.updatePlayerReadyCountUI(count, total)

            if (count === total) {
                this.enableStartGameButton()
            } else {
                this.disableStartGameButton()
            }
            // this.showText('選擇兩張卡片丟棄', 10, 500);
            // this.canPairCards = false;
        });
        
        this.socket.on('update_settings', (data) => {
            const { settings } = data;
            console.log('debug-4', settings, data)

            this.updateSettingsUI(settings)

        }); 

        this.socket.on('discard_timer', (data) => {
            const { discardTimer } = data;
            console.log('debug-discard', discardTimer)

            // 格式化並設置定時器文字
            const playerText = `Player: ${this.currentPlayer}`;
            const roomText = `Room ID: ${this.roomId}`;
            const timerText = `在 ${discardTimer} 內選擇兩張卡片丟棄`;
        
            // 設置顯示文字
            this.scene.timerText.setText(`${playerText}\n${roomText}\n${timerText}`);
        });
        
        this.socket.on('is_game_started_on_this_room_for_leaving_request', (data) => {
            const { gameIsStarted, isPlayerInRoom, playerId } = data; 
            if (this.playerId != playerId) return;
             
            console.log(gameIsStarted, isPlayerInRoom);
            this.leaveRoom();
            
            this.leaveRoomAndClearUI();
            showAlert(`你已離開房間: ${this.roomId}`, 'success');
            if (!gameIsStarted) {
            }
         
        });        
    }

    setPlayerID(playerID) {
        this.playerId = playerID;
    }

    leaveRoomAndClearUI() {
        this.scene.clearInGameHTMLUI();
        this.scene.clearHTMLUI();
        this.scene.scene.stop(this.isGameTable ? 'GameTable' : 'Game', { gameManager: this.gameManager });
        this.scene.scene.start('MainMenu');
    }
   
    handlePairSuccess(playerId, matchedHandCards, matchedHandIndexes, matchedTableCards, matchedTableIndexes, resourcePoints, gameLevel, cardPairCount, matchedCardPositions) {
        showAlert("配對成功", "success");
        console.log(`玩家 ${playerId} 配對成功`); 
        console.log('配對成功的手牌：', matchedHandCards);
        console.log('配對成功的桌牌：', matchedTableCards); 
        console.log("========");
        console.log(matchedTableIndexes);
        if (this.zone) {
            matchedTableIndexes.forEach(zoneIndex => {
                this.zone.highlightZone(zoneIndex);
                setTimeout(() => {  
                    this.zone.clearHighlightZone(zoneIndex);
                }, 2000); // 框框顯示2秒
            }); 
        } else {
            console.log("DEBUG-PAIR-SUCCESS");
            updateGameRecord(gameLevel, resourcePoints, cardPairCount);
    
            // 在配對成功的卡牌位置上面畫出特效
            this.drawHighlightEffect(matchedCardPositions);
        }
    } 
     
    drawHighlightEffect(matchedCardPositions) {
        console.log('debug-j: ', matchedCardPositions);
        matchedCardPositions.forEach(position => {
            if (Array.isArray(position) && position.length === 2) {
                const [x, y] = position;
    
                // 創建一個卡片圖示，並設置大小
                const cardIcon = this.scene.add.image(x, y, 'cyanCardBack'); // 'cyanCardBack' 是預先載入的卡片圖像資源
                cardIcon.setDisplaySize(50, 70); // 設置卡片圖示的大小
                cardIcon.setAlpha(0.5); // 設置初始透明度
                cardIcon.setDepth(10); // 確保圖示在最上層
    
                // 創建移動和透明度變化的動畫
                this.scene.tweens.add({
                    targets: cardIcon, 
                    y: y - 100, // 向上移動100像素
                    alpha: 0, // 透明度變為0
                    duration: 2000, // 持續時間2秒
                    ease: 'Power1', // 使用平滑效果
                    onComplete: () => {
                        cardIcon.destroy(); // 動畫完成後銷毀圖示
                    }
                });
    
                // 創建螢幕震動效果
                this.scene.cameras.main.shake(300, 0.001); // 震動500毫秒，強度為0.005
            } else {
                console.error('無效的座標格式:', position);
            }
        });
    }

    handlePairFailure(playerId, selectedCards) {
        // 處理失敗的邏輯
        console.log(`玩家 ${playerId} 配對失敗`);
        console.log('選擇的卡牌：', selectedCards);
        showAlert("配對失敗", "danger");
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

    handleLeaveRequest() {
        console.log(this.roomId, this.playerId)
        if (this.playerId) {
            this.socket.emit('is_game_started_on_this_room_for_leaving_request', { roomId: this.roomId, playerId: this.playerId });
        } else {
            showNotification("錯誤", 'danger')
        }
        // if (this) {
        //     // game is not started
        //     this.leaveRoom();
        // }
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
        showLoading();
        if (isTable) {
            console.log('table join room')
            this.socket.emit('table_join_room', { roomId: roomId });
        } else {
            this.socket.emit('join_room', { roomId: roomId, playerId: this.playerId });
        }
    }

    updateGameState(data) {
        this.clearTexts();
        console.log("debug: 更新遊戲狀態!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        const { roomId, currentPlayer, gameState, table, pairSuccessIndex, cards, selected, handPositions } = data;
        console.log("接收到的資料:", data);
        this.currentPlayer = currentPlayer;
        this.gameState = gameState;
        // this.selectedCards = selected;
        this.selectedCards = []

        if (this.isGameTable) {
            this.canPairCards = true;
        } else if (this.isPlayerTurn()) {
            this.canPairCards = true;
            this.handPositions = handPositions;
            if (this.scene) {
                console.log('DEBUG GRADIENTG: on')
                toggleGradientBorder(this.scene, true); // 開啟漸層效果
            }
        } else {
            this.canPairCards = false;
            if (this.scene) {
                console.log('DEBUG GRADIENTG: off')
                toggleGradientBorder(this.scene, false); // 關閉漸層效果
            }
        }
  

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
                tableCard.render(x, y, card.type, card.type); // 牌桌卡面主要渲染位置
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
        console.log('debug-get_player_hand: START')
        this.socket.emit('get_player_hand', { roomId: this.roomId, playerId: this.playerId });
    }

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
        
            // 更新卡片 object 位置
            const finalX = gameObject.x;
            const finalY = gameObject.y;
        
            if (gameObject.card) {
                gameObject.card.updatePosition(finalX, finalY);
            }            
            this.currentDraggedCard = null;
        
            // 更新 handPositions 中對應卡片的位置
            if (this.handPositions && gameObject.card) {
                this.handPositions[gameObject.card.cardId] = [finalX, finalY];
            } 

            console.log('debug', [finalX, finalY], gameObject.card.cardId) 
        
            this.socket.emit('update_card_positions', { roomId: this.roomId, playerId: this.playerId, cardPositions: this.handPositions });
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
            console.log("debug-click pointup")
            if (!this.isDragging && timeSincePointerDown < clickDelay) {
                console.log("debug-click go to funciton")
                this.handlePointerDown(pointer);
            }
        });
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
        console.log('debug debug debug debug debug debug debug debug debug debug debug debug debug ');
     
        this.clearPlayerHandDisplay(); 
    
        this.handPositions = this.handPositions || {}; // 確保 handPositions 被初始化
    
        
        console.log(" ======debug-17 START====== ")
        console.log('debug-17', this.handPositions);
        console.log('debug-17 hand', this.hand);
        this.handObj = this.hand.map((card, index) => {
            const row = Math.floor(index / cardsPerRow); // 計算卡片所在的 row
            const col = index % cardsPerRow; // 計算卡片所在的 column 
            const totalCardWidth = cardOffset * (Math.min(cardsPerRow, this.hand.length) - 1) + cardWidth;
            const baseX = (screenWidth - totalCardWidth) / 2; // 計算每 row 的起始X座標，讓卡片在螢幕中央
    
            let x, y;
    
            
            if (this.handPositions[card.id]) {
                // 如果 handPositions 中存在該卡片的位置信息，則使用該位置
                [x, y] = this.handPositions[card.id];
                console.log(`debug-17: using existing position for card ${card.id}: [${x}, ${y}]`);

            } else {
                console.log(`debug-17: calculating new position for card ${card.id}`);
                console.log("debug-17: hand position before update: ", this.handPositions, card.id, this.handPositions[card.id]);
                console.log("debug-17 card:", card);
                console.log("debug-17 index:", index);

                // 如果 handPositions 中不存在該卡片的位置信息，則使用預設位置
                x = baseX + (col * cardOffset);
                y = baseY + (row * rowHeight);
                // 並將該位置信息加入 handPositions 中 
                this.handPositions[card.id] = [x, y];
    
                // 新增卡片的醒目特效 
                const cardHighlight = this.scene.add.graphics({ x: x, y: y });
                cardHighlight.fillStyle(0xffff00, 0.5);
                cardHighlight.fillRect(-cardWidth / 2, -rowHeight / 2, cardWidth, rowHeight);
    
                this.scene.tweens.add({
                    targets: cardHighlight,
                    alpha: { from: 0.5, to: 0 },
                    scale: { from: 1, to: 2 },
                    duration: 1000,
                    onComplete: () => {
                        cardHighlight.destroy();
                    }
                }); 
            }
            
    
            let playerCard = new Card(this.scene, card.id, true); // 可以隨意移動卡牌，無論是否是自己的回合
            let imageKey = card.type;
            playerCard.render(x, y, imageKey, card.type); // 這裡是主要渲染卡片圖片的地方
            return playerCard.card;  
        });
        console.log(" ======debug-17 END====== ")
    
        console.log('debug-11', this.handPositions);
    }
    
    
    resetHandPositions() {
        this.handPositions = {}; // 清空 handPositions
        console.log('Hand positions have been reset.');
        this.socket.emit('update_card_positions', { roomId: this.roomId, playerId: this.playerId, cardPositions: this.handPositions });
        this.displayPlayerHand();
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
     
        } else {
            console.log('highlightCard未找到卡片:', cardId);
        }
    }

    findCardById(cardId) {
        return this.scene.children.list.find(child => child.card && child.card.cardId === cardId);
    }

    updatePlayerList(players) {
        const playerListContainer = document.getElementById('playerListContainer');
    
        // 保存原來的收起/展開按鈕
        const toggleButton = playerListContainer.querySelector('.toggle-button');
        const hiddenText = playerListContainer.querySelector('.hidden-text');
        
        // 清空列表，但保留收起/展開按鈕
        playerListContainer.innerHTML = '';
    
        // 如果有收起/展開按鈕，重新附加到容器
        if (toggleButton) {
            playerListContainer.appendChild(toggleButton);
        }
        
        if (hiddenText) {
            playerListContainer.appendChild(hiddenText);
        }
    
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
    
        // 反轉 children 列表
        const reversedChildren = [...this.scene.children.list].reverse();

        reversedChildren.some(child => {
            if (child.texture && child.texture.key.includes('_') && child.getBounds().contains(x, y)) {
                selectedCardObj = this.toggleCardSelection(child);
                clickedOnCard = true;

                console.log('------------');
                console.log('hand', this.hand);
                console.log('ahdnobj', this.handObj);
                console.log('table cards', this.tableCards);
                console.log('table cards obj', this.tableCardsObj);
                console.log('selected', this.getFormattedSelectedCards());
                console.log('------------'); 
                console.log('debug-click');

                // 使用 `some` 方法並在這裡返回 `true`，以結束迴圈
                return true;
            }
            // 繼續迴圈
            return false;
        });

    
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
        // TODO: 棄用???

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
            console.log('debug-test: -=-=-=-=-=-==--=-=-=-=-=-=-=-=-=')
            console.log('debug-test: | ', this.selectedCards[0])
            console.log('debug-test: | ', this.selectedCards[0].card)
            console.log('debug-test: | ', this.selectedCards[0].card.cardId)
            console.log('debug-test: | ', card.card.cardId)
            console.log('debug-test: | ', card.x, card.y)
            console.log('debug-test: -=-=-=-=-=-==--=-=-=-=-=-=-=-=-=') 
        }

        const index = this.selectedCards.findIndex(selectedCard => selectedCard.card && selectedCard.card.cardId === card.card.cardId);
        const moveUpDistance = 50; // 卡片向上移動的距離
        console.log('debug-test: ', this.selectedCards, card)
        console.log('debug-test: ', index)
        if (index === -1) {
            console.log('debug-test-3: selected!!+++==++=++++=+===+==++=++++++=+')
            // 如果目前卡片未被選中，將其設置為高亮並向上移動
            card.setTint(0xff69b4);
            this.selectedCards.push(card);
    
            this.scene.tweens.add({
                targets: card, 
                y: card.y - moveUpDistance,
                duration: 300,
                ease: 'Power2'
            });
        } else {
            console.log('debug-test-3: clear+++==++=++++=+===+==++=++++++=+')
            // 如果目前卡片已被選中，將其取消高亮並歸位
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
        console.log('debug-test(after): ', this.selectedCards)
        console.log('debug-test(after): ', index)

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

    playerReady() {
        this.socket.emit('player_ready', { roomId: this.roomId, playerId: this.playerId });
    }

    playerNotReady() {
        this.socket.emit('player_not_ready', { roomId: this.roomId, playerId: this.playerId });
    }

    updateReadyPlayers() {
        this.socket.emit('get_ready_players', { roomId: this.roomId, playerId: this.playerId });
    }

    updatePlayerReadyCountUI(readyPlayers, totalPlayers) {
        const playerReadyCount = document.getElementById('playerReadyCount');
        if (playerReadyCount) {
            playerReadyCount.textContent = `${readyPlayers}/${totalPlayers} 玩家已準備好`;
        }
    }

    updateSettingsUI(settings) {
        if (!settings) return;
    
        // 更新時間設定
        let timeSettingInput = document.querySelector('#timeSettingContainer input');
        if (timeSettingInput) {
            timeSettingInput.value = settings.roundTime;
        }
    
        // 更新各個牌組的數量和選擇類型
        let sports = ['gymnastics', 'soccer', 'tableTennis', 'shooting', 'baseball', 'judo'];
        sports.forEach((sport, index) => {
            let deckCountElement = document.getElementById(`deckCountSpan_${index + 1}`);
            if (deckCountElement) {
                deckCountElement.textContent = `已加入 ${settings[sport].count} 組`;
            }
    
            let selectC1 = document.querySelector(`#deckContainer_${index + 1} [data-type='C1']`);
            let selectC2 = document.querySelector(`#deckContainer_${index + 1} [data-type='C2']`);
    
            if (selectC1 && selectC2) {
                if (settings[sport].type === 'C1') {
                    selectC1.classList.add('selected');
                    selectC1.style.backgroundColor = '#28a745'; // 綠色
                    selectC2.classList.remove('selected');
                    selectC2.style.backgroundColor = '#f48b71'; // 恢復原色
                } else if (settings[sport].type === 'C2') {
                    selectC2.classList.add('selected');
                    selectC2.style.backgroundColor = '#28a745'; // 綠色
                    selectC1.classList.remove('selected');
                    selectC1.style.backgroundColor = '#f8b0a2'; // 恢復原色
                } else {
                    selectC1.classList.remove('selected');
                    selectC1.style.backgroundColor = '#f8b0a2'; // 恢復原色
                    selectC2.classList.remove('selected');
                    selectC2.style.backgroundColor = '#f48b71'; // 恢復原色
                }
            }
        });
    }
    
    
    

    enableStartGameButton() {
        let createRoomBtn = document.getElementById('start-game');
        if (createRoomBtn) {
            createRoomBtn.disabled = false; // 允許點及
            createRoomBtn.style.backgroundColor = 'green'; // 顯示為綠色
        }
    }

    disableStartGameButton() {
        let createRoomBtn = document.getElementById('start-game');
        if (createRoomBtn) {
            createRoomBtn.disabled = true; // 禁用按鈕
            createRoomBtn.style.backgroundColor = 'gray'; // 顯示為灰色
        }
    }

    getGameSettings() {
        // 取得時間設定
        let roundTimeInput = document.getElementById('roundTimeInput');
        let roundTime = roundTimeInput ? parseInt(roundTimeInput.value, 10) : 30;
    
        // 取得排組數量和選擇類型
        let deckCounts = [];
        let selectedCTypes = [];
        let sports = ['體操', '足球', '桌球', '射擊', '棒球', '柔道'];
        sports.forEach((sport, index) => {
            let deckCountElement = document.getElementById(`deckCountSpan_${index + 1}`);
            let deckCount = deckCountElement ? parseInt(deckCountElement.textContent.split(' ')[1], 10) : 0;
            deckCounts.push(deckCount);
    
            let selectedC1 = document.querySelector(`#deckContainer_${index + 1} [data-type='C1'].selected`);
            let selectedC2 = document.querySelector(`#deckContainer_${index + 1} [data-type='C2'].selected`);
            selectedCTypes.push(selectedC1 ? 'C1' : (selectedC2 ? 'C2' : null));
        });
    
        // 組成設定物件  
        let settings = {
            roundTime: roundTime,
            gymnastics: { count: deckCounts[0], type: selectedCTypes[0] },
            soccer: { count: deckCounts[1], type: selectedCTypes[1] },
            tableTennis: { count: deckCounts[2], type: selectedCTypes[2] },
            shooting: { count: deckCounts[3], type: selectedCTypes[3] },
            baseball: { count: deckCounts[4], type: selectedCTypes[4] },
            judo: { count: deckCounts[5], type: selectedCTypes[5] }
        };
    
        console.log('Debug Settings: ', settings);
        return settings;
    }

    updateSettings() {
        let settings = this.getGameSettings();
        console.log('debug-6', settings)
        this.socket.emit('update_settings', { roomId: this.roomId, settings: settings }); 

    }

    triggerRedGradient() {
        if (this.scene) {
            console.log('trigger red gradient')
            changeGradientColor(this.scene, 0xff0000); // 將顏色改為紅色
        }
    }

    initializeAndStartGame() { 
        const settings = this.getGameSettings();  
        console.log(settings);
    
        const timeSettingContainer = document.getElementById('timeSettingContainer');
        const cardDeckContainer = document.getElementById('cardDeckContainer');
        const startGameContainer = document.getElementById('startGameContainer');
    
        if (timeSettingContainer && timeSettingContainer.parentNode) {
            timeSettingContainer.parentNode.removeChild(timeSettingContainer);
        }
        if (cardDeckContainer && cardDeckContainer.parentNode) {
            cardDeckContainer.parentNode.removeChild(cardDeckContainer);
        }
        if (startGameContainer && startGameContainer.parentNode) {
            startGameContainer.parentNode.removeChild(startGameContainer);
        }
    
        const roomId = this.roomId;
        this.socket.emit('initialize_game', { roomId, settings });
    }
    
    useSkill1() {
        console.log('使用技能 1');
        // 實現技能 1 的效果
    }

    useSkill2() {
        console.log('使用技能 2');
        // 實現技能 2 的效果
    }

    useSkill3() {
        console.log('使用技能 3');
        // 實現技能 3 的效果
    }

    useSkill4() {
        console.log('使用技能 4');
        // 實現技能 4 的效果
    }
 
} 
          