import { Scene } from 'phaser';
// import Card from '../helpers/card';
import Zone from '../helpers/zone';
import io from 'socket.io-client';
import Dealer from '../helpers/dealer';

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
        let self = this;

        // this.dealText = this.add.text(75, 350, ['DEAL CARDS']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#00ffff').setInteractive();
        // this.zone = new Zone(this);
        // this.dropZones = this.zone.renderZone();
        // this.outline = this.dropZones.forEach(zone => this.zone.renderOutline(zone));
        // this.gameManager.dropZones = this.dropZones;

        // this.gameManager.setupDragEvents();
        this.gameManager.setupPointerEvents();

        this.createHTMLUI();

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
        document.getElementById('start-game').addEventListener('click', () => {
            this.gameManager.socket.emit('initialize_game', this.gameManager.roomId);
            // this.gameManager.getPlayerHand();
        });
        // DEBUG for get card
        document.getElementById('get-card').addEventListener('click', () => {
            this.gameManager.getPlayerHand();
        });

        document.getElementById('draw-card').addEventListener('click', () => {
            // TODO: draw card and end turn
            this.gameManager.drawCards();
            this.gameManager.drawCards();
            // 丟棄兩張牌
            this.gameManager.endTurn()
        });

        this.isPlayerA = false;
        this.opponentCards = [];

        // this.socket.on('isPlayerA', function () {
        //     self.isPlayerA = true;
        // })

        // this.socket.on('dealCards', function () {
        //     self.dealer.dealCards();
        //     self.dealText.disableInteractive();
        // })

        this.gameManager.socket.on('update_player_list', function (data) {
            console.log("AAAAA")
            console.log(data)
            self.updatePlayerList(data.players);
        });
        this.gameManager.socket.on('game_started', function (data) {
            document.getElementById('start-game').remove();
            document.getElementById('get-card').remove();
            // document.getElementById('draw-card').remove();
        });

        // this.socket.on('cardPlayed', function (gameObject, isPlayerA) {
        //     // if (isPlayerA !== self.isPlayerA) {
        //     //     let sprite = gameObject.textureKey;
        //     //     self.opponentCards.shift().destroy();
        //     //     self.dropZone.data.values.cards++;
        //     //     let card = new Card(self);
        //     //     card.render(((self.dropZone.x - 350) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), sprite).disableInteractive();
        //     // }
        // })

        // this.dealText.on('pointerdown', function () {
        //     self.socket.emit("dealCards");
        // })

        this.gameManager.socket.emit('update_player_list', { roomId: this.gameManager.roomId });
    }

    // handlePointerDown(pointer) {
    //     const { x, y } = pointer;
    //     let clickedOnCard = false;

    //     this.children.list.forEach(child => {
    //         if (child.texture && child.texture.key.includes('Card') && child.getBounds().contains(x, y)) {
    //             this.toggleCardSelection(child);
    //             clickedOnCard = true;
    //         }
    //     });

    //     if (!clickedOnCard) {
    //         this.dropZones.forEach(zone => {
    //             if (zone.getBounds().contains(x, y)) {
    //                 this.handleDropZoneClick();
    //             }
    //         });
    //     }
    //     console.log(this.selectedCards)
    // }

    // toggleCardSelection(card) {
    //     const index = this.selectedCards.indexOf(card);
    //     if (index === -1) {
    //         card.setTint(0xff69b4);
    //         this.selectedCards.push(card);
    //     } else {
    //         card.clearTint();
    //         this.selectedCards.splice(index, 1);
    //     }
    // }

    // handleDropZoneClick() {
    //     this.selectedCards.forEach(card => {
    //         // 處理卡片加入卡桌的邏輯
    //         card.clearTint();
    //         card.setInteractive(false);
    //         this.gameManager.dealCards(card, this.dropZones.indexOf(card.zone));
    //     });
    //     this.selectedCards = [];
    // }

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

    createHTMLUI() {
        // create player list container
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

        // button
        let createRoomBtn = document.createElement('button');
        createRoomBtn.id = 'start-game';
        createRoomBtn.textContent = '開始遊戲';
        createRoomBtn.style.position = 'absolute';
        createRoomBtn.style.top = '60%';
        createRoomBtn.style.left = '45%';
        document.body.appendChild(createRoomBtn);

        let getCardBtn = document.createElement('button');
        getCardBtn.id = 'get-card';
        getCardBtn.textContent = '取得手牌';
        getCardBtn.style.position = 'absolute';
        getCardBtn.style.top = '60%';
        getCardBtn.style.left = '55%';
        document.body.appendChild(getCardBtn);

        let drawCardBtn = document.createElement('button');
        drawCardBtn.id = 'draw-card';
        drawCardBtn.textContent = '抽牌';
        drawCardBtn.style.position = 'absolute';
        drawCardBtn.style.top = '60%';
        drawCardBtn.style.left = '65%';
        document.body.appendChild(drawCardBtn);
    }
}
