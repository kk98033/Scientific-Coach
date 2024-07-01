import { Scene } from 'phaser';
import Zone from '../helpers/zone';
import io from 'socket.io-client';
import Dealer from '../helpers/dealer';

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
