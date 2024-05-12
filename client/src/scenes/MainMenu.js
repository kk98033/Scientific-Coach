import { Scene } from 'phaser';
import { io } from 'socket.io-client';
import GameManager from '../helpers/gameManager'

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.events.on('shutdown', this.removeHTMLUI, this);

        // const socket = io('http://localhost:3000');
        const gameManager = new GameManager();

        this.add.image(512, 384, 'background');
        this.add.image(512, 300, 'logo');
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: '38px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5);

        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');

        // });

        this.createHTMLUI();

        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            var roomNumber = document.getElementById('roomInput').value;
            console.log('加入：' + roomNumber);
            gameManager.joinRoom(roomNumber);
            this.scene.stop('MainMenu');
            this.scene.start('Game');
        });

        document.getElementById('createRoomBtn').addEventListener('click', function () {
            console.log('創建房間');
            gameManager.createRoom();
        });
    }

    createHTMLUI() {
        // input
        let inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.id = 'roomInput';
        inputElement.placeholder = '請輸入房間號';
        inputElement.style.position = 'absolute';
        inputElement.style.top = '50%';
        inputElement.style.left = '50%';
        inputElement.style.transform = 'translate(-50%, -50%)';

        // create room button
        let createRoomBtn = document.createElement('button');
        createRoomBtn.id = 'createRoomBtn';
        createRoomBtn.textContent = '新建房間';
        createRoomBtn.style.position = 'absolute';
        createRoomBtn.style.top = '60%';
        createRoomBtn.style.left = '45%';

        // join room button
        let joinRoomBtn = document.createElement('button');
        joinRoomBtn.id = 'joinRoomBtn';
        joinRoomBtn.textContent = '加入房間';
        joinRoomBtn.style.position = 'absolute';
        joinRoomBtn.style.top = '60%';
        joinRoomBtn.style.left = '55%';

        document.body.appendChild(inputElement);
        document.body.appendChild(createRoomBtn);
        document.body.appendChild(joinRoomBtn);
    }

    removeHTMLUI() {
        let inputElement = document.getElementById('roomInput');
        let createRoomBtn = document.getElementById('createRoomBtn');
        let joinRoomBtn = document.getElementById('joinRoomBtn');

        if (inputElement) {
            inputElement.parentNode.removeChild(inputElement);
        }
        if (createRoomBtn) {
            createRoomBtn.parentNode.removeChild(createRoomBtn);
        }
        if (joinRoomBtn) {
            joinRoomBtn.parentNode.removeChild(joinRoomBtn);
        }
    }

}
