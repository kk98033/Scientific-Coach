import { Scene } from 'phaser';
import Zone from '../helpers/zone';
import io from 'socket.io-client';
import Dealer from '../helpers/dealer';
import { createPlayerListContainer, createTimeSettingContainer, createCardDeckContainer, createStartGameContainer, createCurrentPlayerIDContainer, appendElementsToCenter } from '../helpers/game_ui';


export class GameTable extends Scene {
    constructor() {
        super({
            key: 'GameTable'
        });
    }

    init(data) {
        this.gameManager = data.gameManager;
        this.gameManager.scene = this;
        this.gameManager.isGameTable = true;
        console.log(this.gameManager.socket);
    }

    preload() {
        this.load.image('cyanCardFront', 'assets/c1.png');
        this.load.image('cyanCardBack', 'assets/CardBack.png');
        this.load.image('magentaCardFront', 'assets/b1.png');
        this.load.image('magentaCardBack', 'assets/CardBack.png');
        console.log('All assets loaded');
    }

    create() {
        let self = this;

        this.zone = new Zone(this);
        this.dropZones = this.zone.renderZone();
        this.outline = this.dropZones.forEach(zone => this.zone.renderOutline(zone));
        this.gameManager.dropZones = this.dropZones;
        this.gameManager.zone = this.zone;

        // this.gameManager.setupDragEvents();
        this.gameManager.setupPointerEvents();

        this.createHTMLUI();

        // 更新準備玩家 UI
        this.gameManager.updateReadyPlayers();

        this.setupDragEvents();

        this.currentPlayerText = this.add.text(10, 15, 'TABLE ', { fontSize: '24px', fill: '#fff' });
        this.currentPlayerText = this.add.text(10, 5, 'Current Player: ', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(10, 30, '', { fontSize: '24px', fill: '#fff' });

        // this.dealer = new Dealer(this);


        // this.gameManager.socket.on('update_player_list', function (data) {
        //     console.log("AAAAA");
        //     console.log(data);
        //     self.updatePlayerList(data.players);
        // });

        // this.gameManager.socket.on('game_started', function (data) {
        //     document.getElementById('start-game').remove();
        //     document.getElementById('get-card').remove();
        // });

        // this.gameManager.socket.emit('update_player_list', { roomId: this.gameManager.roomId });
    }

    update() {
    }

    setupDragEvents() {
        // this.input.on('pointermove', (pointer) => {
        //     let highlightedZoneIndex = -1;
        //     this.dropZones.forEach((zone, index) => {
        //         if (this.isPointerInZone(pointer, zone)) {
        //             highlightedZoneIndex = index;
        //         } else {
        //             this.zone.clearHighlightZone(index);
        //         }
        //     });

        //     if (highlightedZoneIndex !== -1) {
        //         this.zone.highlightZone(highlightedZoneIndex);
        //     }
        // });

        // this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        //     gameObject.x = dragX;
        //     gameObject.y = dragY;
        // });

        // this.input.on('dragstart', (pointer, gameObject) => {
        //     console.log(this.gameManager.isPlayerTurn());
        //     console.log(gameObject);
        //     if (!this.gameManager.isPlayerTurn()) {
        //         console.log("It's not your turn!");
        //     } else {
        //         gameObject.setTint(0xff69b4);
        //         this.children.bringToTop(gameObject);
        //     }
        // });

        // this.input.on('dragend', (pointer, gameObject, dropped) => {
        //     if (gameObject.scene) {
        //         console.log(gameObject);
        //         gameObject.clearTint();
        //         gameObject.input.enabled = true;
        //         if (!dropped) {
        //             gameObject.x = gameObject.input.dragStartX;
        //             gameObject.y = gameObject.input.dragStartY;
        //         }
        //     }
        // });

        // this.input.on('drop', (pointer, gameObject, dropZone) => {
        //     const zoneIndex = this.dropZones.findIndex(zone => this.isPointerInZone(pointer, zone));

        //     if (zoneIndex !== -1) {
        //         console.log(`Card dropped in zone ${zoneIndex}`);
        //         this.gameManager.dealCards(gameObject, zoneIndex);
        //         this.zone.clearHighlightZone(zoneIndex);
        //     } else {
        //         console.log('Card not dropped in any zone');
        //     }
        // });
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
        playerListContainer.innerHTML = ''; 

        players.forEach(playerId => {
            const playerItem = document.createElement('div');
            playerItem.textContent = `Player ID: ${playerId}`;
            playerItem.style.marginBottom = '10px';
            
            if (playerId === this.gameManager.currentPlayer) {
                playerItem.style.color = 'green'; 
                playerItem.style.fontWeight = 'bold'; 
            }

            playerListContainer.appendChild(playerItem);
        });
    }

    createHTMLUI() {
        const playerListContainer = createPlayerListContainer();
        const timeSettingContainer = createTimeSettingContainer(this.gameManager, true); // 可編輯
        const cardDeckContainer = createCardDeckContainer(this.gameManager, true); // 可編輯
        const startGameContainer = createStartGameContainer(this.gameManager, true); // 開始遊戲
        createCurrentPlayerIDContainer(); // 創建玩家ID顯示容器

        appendElementsToCenter([timeSettingContainer, cardDeckContainer, startGameContainer]);
        document.body.appendChild(playerListContainer); // 放置在左下角
    }

    // createHTMLUI() {
    //     let playerListContainer = document.createElement('div');
    //     playerListContainer.id = 'playerListContainer';
    //     playerListContainer.style.position = 'absolute';
    //     playerListContainer.style.bottom = '10px';
    //     playerListContainer.style.left = '10px';
    //     playerListContainer.style.width = '200px';
    //     playerListContainer.style.height = '150px';
    //     playerListContainer.style.overflowY = 'scroll';
    //     playerListContainer.style.backgroundColor = '#333';
    //     playerListContainer.style.color = '#fff';
    //     playerListContainer.style.padding = '10px';
    //     playerListContainer.style.borderRadius = '10px';
    
    //     document.body.appendChild(playerListContainer);
    
    //     // Time setting input
    //     let timeSettingContainer = document.createElement('div');
    //     timeSettingContainer.id = 'timeSettingContainer';
    //     timeSettingContainer.style.position = 'absolute';
    //     timeSettingContainer.style.top = '30%';
    //     timeSettingContainer.style.left = '10px';
    //     timeSettingContainer.style.backgroundColor = '#333';
    //     timeSettingContainer.style.color = '#fff';
    //     timeSettingContainer.style.padding = '10px';
    //     timeSettingContainer.style.borderRadius = '10px';

    //     let timeSettingLabel = document.createElement('label');
    //     timeSettingLabel.textContent = '時間設定 (秒):';
    //     timeSettingLabel.style.marginRight = '10px';

    //     let timeSettingInput = document.createElement('input');
    //     timeSettingInput.id = 'roundTimeInput';
    //     timeSettingInput.type = 'number';
    //     timeSettingInput.value = '30';
    //     timeSettingInput.min = '1';

    //     timeSettingContainer.appendChild(timeSettingLabel);
    //     timeSettingContainer.appendChild(timeSettingInput);
    //     document.body.appendChild(timeSettingContainer);

    //     timeSettingInput.addEventListener('input', (event) => {
    //         console.log(this.gameManager);
    //         this.gameManager.updateSettings();
    //     });

    //     timeSettingInput.onclick = () => {
    //         this.gameManager.updateSettings();
    //     };
    
    //     // Card deck selection
    //     let cardDeckContainer = document.createElement('div');
    //     cardDeckContainer.id = 'cardDeckContainer';
    //     cardDeckContainer.style.position = 'absolute';
    //     cardDeckContainer.style.top = '40%';
    //     cardDeckContainer.style.left = '10px';
    //     cardDeckContainer.style.backgroundColor = '#333';
    //     cardDeckContainer.style.color = '#fff';
    //     cardDeckContainer.style.padding = '10px';
    //     cardDeckContainer.style.borderRadius = '10px';
    
    //     for (let i = 1; i <= 4; i++) {
    //         let deckContainer = document.createElement('div');
    //         deckContainer.id = `deckContainer_${i}`;
    //         deckContainer.style.marginBottom = '10px';
        
    //         let deckLabel = document.createElement('span');
    //         deckLabel.textContent = `排組 ${i}: `;
    //         deckLabel.style.marginRight = '10px';
        
    //         let addButton = document.createElement('button');
    //         addButton.id = `addButton_${i}`;
    //         addButton.textContent = '+';
    //         addButton.style.marginRight = '5px';
    //         addButton.onclick = () => {
    //             let deckCount = document.getElementById(`deckCount_${i}`);
    //             let currentCount = parseInt(deckCount.textContent, 10);
    //             deckCount.textContent = currentCount + 1;
    //             this.gameManager.updateSettings();
    //         };
        
    //         let deckCount = document.createElement('span');
    //         deckCount.id = `deckCount_${i}`;
    //         deckCount.textContent = i === 1 ? '1' : '0';
    //         deckCount.style.marginRight = '5px';
        
    //         let subtractButton = document.createElement('button');
    //         subtractButton.id = `subtractButton_${i}`;
    //         subtractButton.textContent = '-';
    //         subtractButton.onclick = () => {
    //             let deckCount = document.getElementById(`deckCount_${i}`);
    //             let currentCount = parseInt(deckCount.textContent, 10);
    //             if (currentCount > 0) {
    //                 deckCount.textContent = currentCount - 1;
    //             }
    //             this.gameManager.updateSettings();
    //         };
        
    //         deckContainer.appendChild(deckLabel);
    //         deckContainer.appendChild(addButton);
    //         deckContainer.appendChild(deckCount);
    //         deckContainer.appendChild(subtractButton);
    //         cardDeckContainer.appendChild(deckContainer);
    //     }
        
    //     document.body.appendChild(cardDeckContainer);
    
    //     // Game start button with player ready count
    //     let startGameContainer = document.createElement('div');
    //     startGameContainer.id = 'startGameContainer';
    //     startGameContainer.style.position = 'absolute';
    //     startGameContainer.style.top = '60%';
    //     startGameContainer.style.left = '10px';
    //     startGameContainer.style.backgroundColor = '#333';
    //     startGameContainer.style.color = '#fff';
    //     startGameContainer.style.padding = '10px';
    //     startGameContainer.style.borderRadius = '10px';
    
    //     let playerReadyCount = document.createElement('div');
    //     playerReadyCount.id = 'playerReadyCount';
    //     playerReadyCount.textContent = '0/4 玩家已準備好';
    //     playerReadyCount.style.marginBottom = '10px';
    //     startGameContainer.appendChild(playerReadyCount); 
    
    //     let createRoomBtn = document.createElement('button');
    //     createRoomBtn.id = 'start-game';
    //     createRoomBtn.textContent = '開始遊戲';
    //     createRoomBtn.disabled = true; // 設置為不能點及
    //     createRoomBtn.style.backgroundColor = 'gray'; // 默認顯示為灰色
    //     createRoomBtn.onclick = () => {
    //         this.initializeAndStartGame();
    //     }; 
    //     startGameContainer.appendChild(createRoomBtn);
     
    //     document.body.appendChild(startGameContainer); 
    // } 
} 
