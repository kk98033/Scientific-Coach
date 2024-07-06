import { Scene } from 'phaser';
// import Card from '../helpers/card';
import Zone from '../helpers/zone';
import io from 'socket.io-client';
import Dealer from '../helpers/dealer';
import GameRoomManager from '../../../gameRoomManager';

export class Game extends Scene {
    constructor() {
        super({
            key: 'Game'
        });
        // this.selectedCards = [];
    }

    init(data) {
        this.gameManager = data.gameManager;
        this.gameManager.scene = this;
        console.log(this.gameManager.socket)
    }

    preload() {
        this.load.image('cyanCardFront', 'assets/c1.png');
        this.load.image('cyanCardBack', 'assets/CardBack.png');
        this.load.image('magentaCardFront', 'assets/b1.png');
        this.load.image('magentaCardBack', 'assets/CardBack.png');
        console.log('All assets loaded');
    }

    create() {
        // let self = this;

        this.waveIsVisable = true;

        // 加入紅色漸層效果
        this.addWaveGradientBorder();
        this.toggleGradientBorder(false);

        // this.dealText = this.add.text(75, 350, ['DEAL CARDS']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#00ffff').setInteractive();
        // this.zone = new Zone(this);
        // this.dropZones = this.zone.renderZone();
        // this.outline = this.dropZones.forEach(zone => this.zone.renderOutline(zone));
        // this.gameManager.dropZones = this.dropZones;

        this.gameManager.setupDragEvents();
        this.gameManager.setupPointerEvents();

        this.createHTMLUI();

        // 更新準備玩家 UI
        this.gameManager.updateReadyPlayers();

        // this.setupDragEvents();

        this.currentPlayerText = this.add.text(10, 5, 'Current Player: ', { fontSize: '36px', fill: '#fff' });
        this.timerText = this.add.text(10, 30, '', { fontSize: '36px', fill: '#fff' });

        

        // this.input.on('pointerdown', (pointer) => {
        //     this.handlePointerDown(pointer);
        // });

        // this.gameManager.socket.on('update_player_list', function (data) {
        //     self.updatePlayerList(data.players);
        // });

        // this.gameManager.socket.on('game_started', function (data) {
        //     document.getElementById('start-game').remove();
        //     document.getElementById('get-card').remove();
        // });

        // this.gameManager.socket.emit('update_player_list', { roomId: this.gameManager.roomId });

        // this.dealCards = () => {
        //     for (let i = 0; i < 5; i++) {
        //         let playerCard = new Card(this);
        //         playerCard.render(475 + (i * 100), 650, 'cyanCardFront');
        //         console.log('c')
        //     }
        // }
        // for (let i = 0; i < 5; i++) {
        //     let playerCard = new Card(this);
        //     playerCard.render(475 + (i * 100), 650, 'cyanCardFront');
        // }
        // this.dealer = new Dealer(this);

        // this.dealText.on('pointerdown', function () {
        //     self.dealCards();
        // })                                                                                                           

        // this.dealText.on('pointerover', function () {
        //     self.dealText.setColor('#ff69b4');
        // })

        // this.dealText.on('pointerout', function () {
        //     self.dealText.setColor('#00ffff');
        // })

        // this.gameManager.socket.on('update_game_state', (data) => {
        //     console.log(`update game state!`);
        //     const { roomId, currentPlayer, gameState, pairSuccessIndex } = data;

        //     self.updatePlayerList(data.players);
        // });

        // this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        //     gameObject.x = dragX;
        //     gameObject.y = dragY;

        // })

        // this.input.on('dragstart', function (pointer, gameObject) {
        //     gameObject.setTint(0xff69b4);
        //     self.children.bringToTop(gameObject);
        // })

        // this.input.on('dragend', function (pointer, gameObject, dropped) {
        //     gameObject.setTint();
        //     if (!dropped) {
        //         gameObject.x = gameObject.input.dragStartX;
        //         gameObject.y = gameObject.input.dragStartY;
        //     }
        // })

        // this.input.on('drop', function (pointer, gameObject, dropZone) {
        //     dropZone.data.values.cards++;
        //     gameObject.x = (dropZone.x - 350) + (dropZone.data.values.cards * 50);
        //     gameObject.y = dropZone.y;
        //     gameObject.disableInteractive();
        //     self.socket.emit('cardPlayed', gameObject, self.isPlayerA);
        // })

        // this.socket = io('http://localhost:3000');
        // this.socket = io('http://192.168.31.202:3000');

        // this.socket.on('connect', function () {
        //     console.log('Connected!');
        // });

        // DEBUG for start game
        // document.getElementById('start-game').addEventListener('click', () => {
        //     this.gameManager.socket.emit('initialize_game', this.gameManager.roomId);
        //     // this.gameManager.getPlayerHand();  
        // });
        // DEBUG for get card
        // document.getElementById('get-card').addEventListener('click', () => { 
        //     this.gameManager.getPlayerHand(); 
        // }); 

        document.getElementById('pair-button').addEventListener('click', () => {
            console.log('配對按鈕被按下');
            // this.gameManager.clearTexts()
            if (!this.gameManager.isPlayerTurn()) return;
            if (!this.gameManager.canPairCards) return;
            this.gameManager.pairCards(); 
        });
        
        document.getElementById('discard-button').addEventListener('click', () => {
            console.log('丟棄按鈕被按下'); 
            // this.gameManager.showText('hello')
            if (!this.gameManager.isPlayerTurn()) return;  
            this.gameManager.discardCards(); 
        });

        // document.getElementById('draw-card').addEventListener('click', () => {
        //     if (!this.gameManager.isPlayerTurn()) return; 

        //     this.gameManager.drawCards();
        //     this.gameManager.drawCards();
        //     // 丟棄兩張牌
        //     this.gameManager.endTurn() 
        // });
 
        this.isPlayerA = false; 
        this.opponentCards = [];

        // this.socket.on('isPlayerA', function () {
        //     self.isPlayerA = true;
        // })

        // this.socket.on('dealCards', function () {
        //     self.dealer.dealCards();
        //     self.dealText.disableInteractive(); 
        // })
 
        this.gameManager.socket.on('update_player_list',  (data) => {
            console.log("AAAAA") 
            console.log(data)
            this.updatePlayerList(data.players);
        }); 

        this.gameManager.socket.on('game_started',  (data) => {
            // document.getElementById('start-game').remove();
            // document.getElementById('get-card').remove();
            // document.getElementById('draw-card').remove();
            this.clearHTMLUI();
            this.showActionButtons(); 
        });

        this.gameManager.socket.on('is_game_started_on_this_room', (data) => {
            const { gameIsStarted, isPlayerInRoom, playerId } = data; 
            if (!this.gameManager || this.gameManager.playerId != playerId) return;

            console.log(gameIsStarted, isPlayerInRoom);
        
            if (gameIsStarted && isPlayerInRoom) {
                // 可以重新連線加入
                this.gameManager.getPlayerHand();
                const message = '成功重新加入'; 
                this.showNotification(message, 'success'); 
                this.clearHTMLUI();
                this.showActionButtons(); 

                this.gameManager.socket.emit('update_game_state', { roomId: this.gameManager.roomId });

            } else {
                // 不可以重新連線加入
                const message = !gameIsStarted ? '遊戲尚未開始。' : '你不在房間內。';
                this.showNotification(message, 'warning');
            }
        });
        
 
        this.gameManager.socket.emit('update_player_list', { roomId: this.gameManager.roomId });

        
    }

    update() {
    }

    setupDragEvents() {
        this.input.on('pointermove', (pointer) => {
            // 檢測滑鼠在哪個 drop zone 中
            let highlightedZoneIndex = -1;
            this.dropZones.forEach((zone, index) => {
                if (this.isPointerInZone(pointer, zone)) {
                    highlightedZoneIndex = index;
                } else {
                    this.zone.clearHighlightZone(index);
                }
            });
    
            if (highlightedZoneIndex !== -1) {
                this.zone.highlightZone(highlightedZoneIndex);
            }
        });
    
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    
        this.input.on('dragstart', (pointer, gameObject) => {
            console.log(this.gameManager.isPlayerTurn());
            console.log(gameObject)
            console.log('drag start ----------')
            if (!this.gameManager.isPlayerTurn()) {
                console.log("It's not your turn!");
            } else {
                gameObject.setTint(0xff69b4);
                this.children.bringToTop(gameObject);
            }
        });
    
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (gameObject.scene) {
                console.log(gameObject)
                console.log('dragend ----------')
                gameObject.clearTint();
                gameObject.input.enabled = true;
                if (!dropped) {
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                }
            }
        });
    
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // 檢測在哪個 drop zone 中
            const zoneIndex = this.dropZones.findIndex(zone => this.isPointerInZone(pointer, zone));
    
            if (zoneIndex !== -1) {
                console.log(`Card dropped in zone ${zoneIndex}`);
                this.gameManager.dealCards(gameObject, zoneIndex);
                this.zone.clearHighlightZone(zoneIndex); // 清除高亮顯示
            } else {
                console.log('Card not dropped in any zone');
            }
    
            // this.socket.emit('end_turn', { roomId: this.gameManager.roomId, playerId: this.gameManager.playerId, card: gameObject.card.cardId, zoneIndex });
        });
    }

    isPointerInZone(pointer, zone) {
        const bounds = zone.getBounds();
        return Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y);
    }

    isCardInZone(card, zone) {
        const bounds = zone.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(card.getBounds(), bounds);
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

    showNotification(message, alertType = 'warning') {
        // 創建通知元素
        let notification = document.createElement('div');
        notification.className = `alert alert-${alertType} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.right = '10px';
        notification.style.zIndex = '1050';
        notification.style.transition = 'transform 0.5s ease-in-out';
        notification.style.transform = 'translateX(100%)'; // 初始位置在右邊外面
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(notification);
    
        // 強制重繪以觸發CSS過渡效果
        setTimeout(() => {
            notification.style.transform = 'translateX(0)'; // 彈入效果
        }, 10);
    
        // 設置自動消失
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)'; // 彈出效果
            setTimeout(() => {
                notification.remove(); // 完全消失後移除元素
            }, 500);
        }, 3000); // 3秒後自動消失
    }
    

    createHTMLUI() {
        let playerListContainer = document.createElement('div');
        playerListContainer.id = 'playerListContainer';
        playerListContainer.style.position = 'absolute';
        playerListContainer.style.bottom = '10px';
        playerListContainer.style.left = '10px';
        playerListContainer.style.width = '200px';
        playerListContainer.style.height = '150px';
        playerListContainer.style.overflowY = 'scroll';
        playerListContainer.style.backgroundColor = '#333';
        playerListContainer.style.color = '#fff';
        playerListContainer.style.padding = '10px';
        playerListContainer.style.borderRadius = '10px';
    
        document.body.appendChild(playerListContainer);
    
        // Time setting display
        let timeSettingContainer = document.createElement('div');
        timeSettingContainer.id = 'timeSettingContainer';
        timeSettingContainer.style.position = 'absolute';
        timeSettingContainer.style.top = '30%';
        timeSettingContainer.style.left = '10px';
        timeSettingContainer.style.backgroundColor = '#333';
        timeSettingContainer.style.color = '#fff';
        timeSettingContainer.style.padding = '10px';
        timeSettingContainer.style.borderRadius = '10px';
    
        let timeSettingLabel = document.createElement('label');
        timeSettingLabel.textContent = '時間設定 (秒):';
        timeSettingLabel.style.marginRight = '10px';
    
        let timeSettingInput = document.createElement('input');
        timeSettingInput.type = 'number';
        timeSettingInput.value = '30';
        timeSettingInput.min = '1';
        timeSettingInput.readOnly = true;
    
        timeSettingContainer.appendChild(timeSettingLabel);
        timeSettingContainer.appendChild(timeSettingInput);
        document.body.appendChild(timeSettingContainer);
    
        // Card deck selection display
        let cardDeckContainer = document.createElement('div');
        cardDeckContainer.id = 'cardDeckContainer'; 
        cardDeckContainer.style.position = 'absolute';
        cardDeckContainer.style.top = '40%';
        cardDeckContainer.style.left = '10px';
        cardDeckContainer.style.backgroundColor = '#333';
        cardDeckContainer.style.color = '#fff';
        cardDeckContainer.style.padding = '10px';
        cardDeckContainer.style.borderRadius = '10px';
    
        for (let i = 1; i <= 4; i++) {
            let deckContainer = document.createElement('div');
            deckContainer.style.marginBottom = '10px';
    
            let deckLabel = document.createElement('span');
            deckLabel.textContent = `排組 ${i}: `;
            deckLabel.style.marginRight = '10px'; 
     
            let addButton = document.createElement('button');
            addButton.textContent = '+';
            addButton.style.marginRight = '5px';
            addButton.disabled = true; 
     
            let deckCount = document.createElement('span');
            deckCount.id = `deckCount_${i}`;
            deckCount.textContent = i === 1 ? '1' : '0';
            deckCount.style.marginRight = '5px'; 
    
            let subtractButton = document.createElement('button');
            subtractButton.textContent = '-';
            subtractButton.disabled = true;
    
            deckContainer.appendChild(deckLabel);
            deckContainer.appendChild(addButton);
            deckContainer.appendChild(deckCount);
            deckContainer.appendChild(subtractButton);
            cardDeckContainer.appendChild(deckContainer);
        } 
    
        document.body.appendChild(cardDeckContainer);
    
        // Game start button with player ready count
        let startGameContainer = document.createElement('div');
        startGameContainer.id = 'startGameContainer';
        startGameContainer.style.position = 'absolute';
        startGameContainer.style.top = '60%';
        startGameContainer.style.left = '10px';
        startGameContainer.style.backgroundColor = '#333';
        startGameContainer.style.color = '#fff';
        startGameContainer.style.padding = '10px';
        startGameContainer.style.borderRadius = '10px';
    
        let playerReadyCount = document.createElement('div');
        playerReadyCount.id = 'playerReadyCount';
        playerReadyCount.textContent = '0/4 玩家已準備好';
        playerReadyCount.style.marginBottom = '10px';
        startGameContainer.appendChild(playerReadyCount);
    
        let readyBtn = document.createElement('button');
        readyBtn.id = 'ready-btn';
        readyBtn.textContent = '準備開始';
        readyBtn.onclick = () => {
            if (readyBtn.textContent === '準備開始') {
                this.gameManager.playerReady();
                readyBtn.textContent = '取消準備';
            } else {
                this.gameManager.playerNotReady();
                readyBtn.textContent = '準備開始';
            }
        };
        startGameContainer.appendChild(readyBtn);
    
        document.body.appendChild(startGameContainer);
    
        // 配對和丟棄按鈕容器
        let actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.id = 'actionButtonsContainer';
        actionButtonsContainer.style.position = 'absolute';
        actionButtonsContainer.style.top = '50%';
        actionButtonsContainer.style.left = '10px';
        actionButtonsContainer.style.backgroundColor = '#333';
        actionButtonsContainer.style.color = '#fff';
        actionButtonsContainer.style.padding = '10px';
        actionButtonsContainer.style.borderRadius = '10px';
        actionButtonsContainer.style.display = 'none'; // 默認隱藏
    
        // 配對按鈕
        let pairButton = document.createElement('button');
        pairButton.id = 'pair-button';
        pairButton.textContent = '配對';
        actionButtonsContainer.appendChild(pairButton);
    
        // 丟棄按鈕
        let discardButton = document.createElement('button');
        discardButton.id = 'discard-button';
        discardButton.textContent = '丟棄';
        discardButton.style.marginLeft = '10px'; // 添加一些間距 
        actionButtonsContainer.appendChild(discardButton);
    
        document.body.appendChild(actionButtonsContainer);
        
    }
    
    // 顯示配對和丟棄按鈕的函數
    showActionButtons() {
        let actionButtonsContainer = document.getElementById('actionButtonsContainer');
        if (actionButtonsContainer) {
            actionButtonsContainer.style.display = 'block';
        }
    }
    
    clearHTMLUI() { 
        const elementsToRemove = [
            'timeSettingContainer',
            'cardDeckContainer',
            'startGameContainer',
        ];
    
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                document.body.removeChild(element);
            }
        });
    }
    
    addWaveGradientBorder(color = 0x00ff00) { // 默認顏色為綠色
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const thickness = 50; // 漸層的厚度
        this.gradient = this.add.graphics({ x: 0, y: 0 });
        this.gradient.setDepth(-1); // 確保在最底層
        
        const maxWaveHeight = 30; // 波浪的最大高度，增加延伸幅度
        const waveSpeed = 500; // 波浪的速度，增加動畫速度
        console.log('DEBUG-COLOR', color)
        // 繪製初始漸層邊框
        for (let i = 0; i < thickness; i++) {
            let alpha = 1 - (i / thickness);
            
            // 上邊
            this.gradient.fillStyle(color, alpha); // 使用參數顏色
            this.gradient.fillRect(0, i, width, 1);
            
            // 下邊
            this.gradient.fillStyle(color, alpha); // 使用參數顏色
            this.gradient.fillRect(0, height - i, width, 1);
            
            // 左邊
            this.gradient.fillStyle(color, alpha); // 使用參數顏色
            this.gradient.fillRect(i, 0, 1, height);
            
            // 右邊
            this.gradient.fillStyle(color, alpha); // 使用參數顏色
            this.gradient.fillRect(width - i, 0, 1, height);
        }

        // 創建波浪動畫
        this.waveTween = this.tweens.add({
            targets: this.gradient,
            duration: waveSpeed,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween) => {
                const waveHeight = Math.sin(tween.progress * Math.PI) * maxWaveHeight;
                this.gradient.clear();
                
                for (let i = 0; i < thickness; i++) {
                    let alpha = 1 - (i / thickness);
                    let waveOffset = Math.sin((i / thickness) * Math.PI * 2 + tween.progress * Math.PI * 2) * waveHeight;
                    
                    // 上邊
                    this.gradient.fillStyle(color, alpha); // 使用參數顏色
                    this.gradient.fillRect(0, i + waveOffset, width, 1);
                    
                    // 下邊
                    this.gradient.fillStyle(color, alpha); // 使用參數顏色
                    this.gradient.fillRect(0, height - i - waveOffset, width, 1);
                    
                    // 左邊
                    this.gradient.fillStyle(color, alpha); // 使用參數顏色
                    this.gradient.fillRect(i + waveOffset, 0, 1, height);
                    
                    // 右邊
                    this.gradient.fillStyle(color, alpha); // 使用參數顏色
                    this.gradient.fillRect(width - i - waveOffset, 0, 1, height);
                }
            }
        });

        console.log("Wave tween created: ", this.waveTween);
        // 設置透明度
        this.gradient.setAlpha(0.7);


        // Create settings button
        let settingsButton = document.createElement('button');
        settingsButton.id = 'settingsButton';
        settingsButton.style.position = 'absolute';
        settingsButton.style.top = '10px';
        settingsButton.style.right = '10px';
        settingsButton.style.width = '40px'; 
        settingsButton.style.height = '40px';
        settingsButton.style.backgroundColor = '#333';
        settingsButton.style.border = 'none';
        settingsButton.style.borderRadius = '5px';
        settingsButton.style.cursor = 'pointer';
        
        // Add gear icon to settings button
        let gearIcon = document.createElement('i');
        gearIcon.className = 'fas fa-cog';
        gearIcon.style.color = '#fff';
        gearIcon.style.fontSize = '24px';
        settingsButton.appendChild(gearIcon);
        
        document.body.appendChild(settingsButton);
        
        // Create settings overlay
        let settingsOverlay = document.createElement('div');
        settingsOverlay.id = 'settingsOverlay';
        settingsOverlay.style.position = 'fixed';
        settingsOverlay.style.top = '0';
        settingsOverlay.style.left = '0';
        settingsOverlay.style.width = '100%';
        settingsOverlay.style.height = '100%';
        settingsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        settingsOverlay.style.display = 'none';
        settingsOverlay.style.justifyContent = 'center';
        settingsOverlay.style.alignItems = 'center';
        
        // Create settings container
        let settingsContainer = document.createElement('div');
        settingsContainer.id = 'settingsContainer';
        settingsContainer.style.width = '300px';
        settingsContainer.style.backgroundColor = '#333';
        settingsContainer.style.color = '#fff';
        settingsContainer.style.padding = '20px';
        settingsContainer.style.borderRadius = '10px';
        settingsContainer.style.textAlign = 'center';
        
        // Create settings title
        let settingsTitle = document.createElement('h2');
        settingsTitle.textContent = '設定';
        settingsContainer.appendChild(settingsTitle);
        
        // Create separator
        let separator = document.createElement('hr');
        separator.style.border = '1px solid #555';
        settingsContainer.appendChild(separator);
        
        // Create reconnect button
        let reconnectContainer = document.createElement('div');
        reconnectContainer.style.marginTop = '20px';
        
        let reconnectLabel = document.createElement('span');
        reconnectLabel.textContent = '重新連線';
        reconnectLabel.style.marginRight = '10px';
        
        let reconnectButton = document.createElement('button');
        reconnectButton.style.width = '40px';
        reconnectButton.style.height = '40px';
        reconnectButton.style.backgroundColor = '#555';
        reconnectButton.style.border = 'none';
        reconnectButton.style.borderRadius = '5px';
        reconnectButton.style.cursor = 'pointer';
        
        let reconnectIcon = document.createElement('i');
        reconnectIcon.className = 'fas fa-sync-alt';
        reconnectIcon.style.color = '#fff';
        reconnectButton.appendChild(reconnectIcon);

        reconnectButton.onclick = () => {
            console.log('重新連線按鈕被點擊了');
            this.gameManager.socket.emit('is_game_started_on_this_room', { roomId: this.gameManager.roomId, playerId: this.gameManager.playerId });
        };
        
        reconnectContainer.appendChild(reconnectLabel);
        reconnectContainer.appendChild(reconnectButton);
        settingsContainer.appendChild(reconnectContainer);
        
        settingsOverlay.appendChild(settingsContainer);
        document.body.appendChild(settingsOverlay);
        
        // Event listener for settings button
        settingsButton.onclick = () => {
            settingsOverlay.style.display = 'flex';
        };
        
        // Event listener to hide settings overlay
        settingsOverlay.onclick = (e) => {
            if (e.target === settingsOverlay) {
                settingsOverlay.style.display = 'none';
            }
        };
    }

    toggleGradientBorder(visible, color = 0x00ff00) { // 默認顏色為綠色
        if (visible) {
            if (this.gradient) {
                this.gradient.destroy(); // 刪除舊的 gradient
                if (this.waveTween) {
                    this.waveTween.stop(); // 停止舊的 waveTween
                }
            }
            this.addWaveGradientBorder(color); // 重新設置新的 gradient
            this.gradient.setVisible(true);
            if (this.waveTween) {
                try {
                    this.waveTween.resume();
                } catch (error) {
                    console.error('Failed to resume waveTween:', error);
                }
            }
        } else {
            if (this.gradient) {
                this.gradient.setVisible(false); 
                if (this.waveTween) {
                    try {
                        this.waveTween.pause();
                    } catch (error) {
                        console.error('Failed to pause waveTween:', error);
                    }
                }
            }
        }
        this.gradientVisible = visible;
    }
 
    changeGradientColor(newColor) {
        if (this.gradient) {
            this.gradient.destroy(); // 刪除舊的 gradient
            this.addWaveGradientBorder(newColor); // 重新設置顏色
        }
    }
 
    
     
     
    
    
} 
  