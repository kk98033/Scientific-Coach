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
    }

    init(data) {
        this.gameManager = data.gameManager;
        this.gameManager.scene = this;
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

        this.dealText = this.add.text(75, 350, ['DEAL CARDS']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#00ffff').setInteractive();
        this.zone = new Zone(this);
        this.dropZone = this.zone.renderZone();
        this.outline = this.zone.renderOutline(this.dropZone);
        this.gameManager.dropZone = this.dropZone;

        this.createHTMLUI();

        this.setupDragEvents();


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
        this.dealer = new Dealer(this);

        // this.dealText.on('pointerdown', function () {
        //     self.dealCards();
        // })

        this.dealText.on('pointerover', function () {
            self.dealText.setColor('#ff69b4');
        })

        this.dealText.on('pointerout', function () {
            self.dealText.setColor('#00ffff');
        })

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

        this.socket = io('http://localhost:3000');

        this.socket.on('connect', function () {
            console.log('Connected!');
        });

        // DEBUG for start game
        document.getElementById('start-game').addEventListener('click', () => {
            this.socket.emit('initialize_game', this.gameManager.roomId);
            // this.gameManager.getPlayerHand();
        });
        // DEBUG for get card
        document.getElementById('get-card').addEventListener('click', () => {
            this.gameManager.getPlayerHand();
        });
        document.getElementById('draw-card').addEventListener('click', () => {
            this.gameManager.drawCards();
        });

        this.isPlayerA = false;
        this.opponentCards = [];

        this.socket.on('isPlayerA', function () {
            self.isPlayerA = true;
        })

        this.socket.on('dealCards', function () {
            self.dealer.dealCards();
            self.dealText.disableInteractive();
        })

        this.socket.on('cardPlayed', function (gameObject, isPlayerA) {
            // if (isPlayerA !== self.isPlayerA) {
            //     let sprite = gameObject.textureKey;
            //     self.opponentCards.shift().destroy();
            //     self.dropZone.data.values.cards++;
            //     let card = new Card(self);
            //     card.render(((self.dropZone.x - 350) + (self.dropZone.data.values.cards * 50)), (self.dropZone.y), sprite).disableInteractive();
            // }
        })

        this.dealText.on('pointerdown', function () {
            self.socket.emit("dealCards");
        })
    }

    update() {
    }

    setupDragEvents() {
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            // console.log("before", gameObject.x, gameObject.y)
        });

        this.input.on('dragstart', (pointer, gameObject) => {
            console.log(this.gameManager.isPlayerTurn())
            if (!this.gameManager.isPlayerTurn()) {
                console.log("It's not your turn!");
                // pointer.dragState = 0;  // 停止拖動
                // gameObject.input.enabled = false;  // 禁用拖動
                // gameObject.x = gameObject.input.dragStartX;  // 立即返回原位
                // gameObject.y = gameObject.input.dragStartY;
            } else {
                gameObject.setTint(0xff69b4);
                this.children.bringToTop(gameObject);
            }
        });

        this.input.on('dragend', (pointer, gameObject, dropped) => {
            gameObject.clearTint();
            gameObject.input.enabled = true;
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // dropZone.data.values.cards++;
            // let newX = (dropZone.x - 350) + (dropZone.data.values.cards * 50);
            // let newY = dropZone.y;

            // if (gameObject.card) { // Check if the gameObject has a 'card' property
            //     gameObject.card.updatePosition(newX, newY);
            //     console.log(gameObject.card)
            // }

            // gameObject.disableInteractive();
            console.log('deal card');
            this.gameManager.dealCards(gameObject);

            this.socket.emit('deal_cards', { roomId: this.gameManager.roomId, playerId: this.gameManager.playerId, cardId: gameObject.card.cardId });

            // TODO: 看出牌後還有沒有要做的事情
            this.socket.emit('end_turn', { roomId: this.gameManager.roomId, playerId: this.gameManager.playerId, card: gameObject.card.cardId });
        });
    }

    createHTMLUI() {
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
