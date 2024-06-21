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

        // this.add.image(512, 384, 'background'); 
        // this.add.image(512, 300, 'logo');
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
            const hostCheckbox = document.getElementById('hostCheckbox'); 
            const isHost = hostCheckbox ? hostCheckbox.checked : false; 

            var roomNumber = document.getElementById('roomInput').value;

            console.log('加入：' + roomNumber);
            if (isHost) {
                gameManager.joinRoom(roomNumber, isHost);
            } else {
                gameManager.joinRoom(roomNumber, isHost);
            }
            
            this.removeHTMLUI();
            this.scene.stop('MainMenu');
            this.scene.start(isHost ? 'GameTable' : 'Game', { gameManager: gameManager });
        });
        

        document.getElementById('createRoomBtn').addEventListener('click', function () {
            console.log('創建房間');
            gameManager.createRoom();
        });

        document.getElementById('ipSettingInputBtn').addEventListener('click', function () {
            var inputID = document.getElementById('ipSettingInputElement').value;
            console.log('ip', inputID);
            if (inputID) 
                gameManager.setIP(inputID, inputID)
        });

        // 新增的部分：獲取房間列表
        gameManager.socket.on('room_list', (rooms) => {
            console.log("a")
            this.updateRoomList(rooms);
        });

        // 請求獲取房間列表
        gameManager.socket.emit('get_room_list');

        // 檢查是否在手機上
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            this.addFullScreenButton();
        }
    }

    updateRoomList(rooms) {
        const roomListContainer = document.getElementById('roomListContainer');
        if (roomListContainer)
            roomListContainer.innerHTML = ''; // 清空列表
    
        rooms.forEach(roomId => {
            const roomItem = document.createElement('div');
            roomItem.textContent = `房間 ID: ${roomId}`;
            roomItem.style.marginBottom = '10px';
            roomItem.style.cursor = 'pointer';
            roomItem.addEventListener('click', () => {
                document.getElementById('roomInput').value = roomId;
            });
            if (roomItem)
                roomListContainer.appendChild(roomItem);
        });
    }
    

    createHTMLUI() {
        let ipSettingInputElement = document.createElement('input');
        ipSettingInputElement.type = 'text';
        ipSettingInputElement.id = 'ipSettingInputElement';
        ipSettingInputElement.placeholder = '請輸入ip';
        ipSettingInputElement.style.position = 'absolute';
        ipSettingInputElement.style.top = '15%';
        ipSettingInputElement.style.left = '50%';
        ipSettingInputElement.style.transform = 'translate(-50%, -50%)';
    
        let ipSettingInputBtn = document.createElement('button');
        ipSettingInputBtn.id = 'ipSettingInputBtn';
        ipSettingInputBtn.textContent = '連接伺服器';
        ipSettingInputBtn.style.position = 'absolute';
        ipSettingInputBtn.style.top = '13.5%';
        ipSettingInputBtn.style.left = '60%';
    
        let inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.id = 'roomInput';
        inputElement.placeholder = '請輸入房間號';
        inputElement.style.position = 'absolute';
        inputElement.style.top = '50%';
        inputElement.style.left = '50%';
        inputElement.style.transform = 'translate(-50%, -50%)';
    
        let createRoomBtn = document.createElement('button');
        createRoomBtn.id = 'createRoomBtn';
        createRoomBtn.textContent = '新建房間';
        createRoomBtn.style.position = 'absolute';
        createRoomBtn.style.top = '60%';
        createRoomBtn.style.left = '45%';
    
        let joinRoomBtn = document.createElement('button');
        joinRoomBtn.id = 'joinRoomBtn';
        joinRoomBtn.textContent = '加入房間';
        joinRoomBtn.style.position = 'absolute';
        joinRoomBtn.style.top = '60%';
        joinRoomBtn.style.left = '55%';

        let hostCheckboxLabel = document.createElement('label');
        hostCheckboxLabel.textContent = '房主: ';
        hostCheckboxLabel.style.position = 'absolute';
        hostCheckboxLabel.style.top = '65%';
        hostCheckboxLabel.style.left = '50%';
        hostCheckboxLabel.style.transform = 'translate(-50%, -50%)';
        hostCheckboxLabel.id = 'hostCheckboxLabel';

        let hostCheckbox = document.createElement('input');
        hostCheckbox.type = 'checkbox';
        hostCheckbox.id = 'hostCheckbox';
        hostCheckbox.style.position = 'absolute';
        hostCheckbox.style.top = '65%';
        hostCheckbox.style.left = '55%';
    
        let roomListContainer = document.createElement('div');
        roomListContainer.id = 'roomListContainer';
        roomListContainer.style.position = 'absolute';
        roomListContainer.style.top = '50%';
        roomListContainer.style.left = '80%';
        roomListContainer.style.transform = 'translate(-50%, -50%)';
        roomListContainer.style.width = '10%';
        roomListContainer.style.height = '20%';
        roomListContainer.style.overflowY = 'scroll';
        roomListContainer.style.backgroundColor = '#333';
        roomListContainer.style.color = '#fff';
        roomListContainer.style.padding = '10px';
        roomListContainer.style.borderRadius = '10px';
    
        document.body.appendChild(inputElement);
        document.body.appendChild(createRoomBtn);
        document.body.appendChild(joinRoomBtn);
        document.body.appendChild(ipSettingInputElement);
        document.body.appendChild(ipSettingInputBtn);
        document.body.appendChild(roomListContainer);
        document.body.appendChild(hostCheckboxLabel);
        document.body.appendChild(hostCheckbox);
    }
    

    removeHTMLUI() {
        let inputElement = document.getElementById('roomInput');
        let createRoomBtn = document.getElementById('createRoomBtn');
        let joinRoomBtn = document.getElementById('joinRoomBtn');
        let ipSettingInputElement = document.getElementById('ipSettingInputElement');
        let ipSettingInputBtn = document.getElementById('ipSettingInputBtn');
        let roomListContainer = document.getElementById('roomListContainer');
        let hostCheckboxLabel = document.getElementById('hostCheckboxLabel');
        let hostCheckbox = document.getElementById('hostCheckbox');

        if (inputElement) {
            inputElement.parentNode.removeChild(inputElement);
        }
        if (createRoomBtn) {
            createRoomBtn.parentNode.removeChild(createRoomBtn);
        }
        if (joinRoomBtn) {
            joinRoomBtn.parentNode.removeChild(joinRoomBtn);
        }
        if (ipSettingInputElement) {
            ipSettingInputElement.parentNode.removeChild(ipSettingInputElement);
        }
        if (ipSettingInputBtn) {
            ipSettingInputBtn.parentNode.removeChild(ipSettingInputBtn);
        }
        if (roomListContainer) {
            roomListContainer.parentNode.removeChild(roomListContainer);
        }
        if (hostCheckboxLabel) {
            hostCheckboxLabel.parentNode.removeChild(hostCheckboxLabel);
        }
        if (hostCheckbox) {
            hostCheckbox.parentNode.removeChild(hostCheckbox);
        }
    }

    addFullScreenButton() {
        const fullScreenButton = document.createElement('button');
        fullScreenButton.textContent = '進入全螢幕模式';
        fullScreenButton.style.position = 'absolute';
        fullScreenButton.style.top = '80%';
        fullScreenButton.style.left = '50%';
        fullScreenButton.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(fullScreenButton);
    
        fullScreenButton.addEventListener('click', () => {
            this.enterFullScreenAndRotate();
            fullScreenButton.remove(); // Remove button after entering fullscreen
        });
    }

    enterFullScreenAndRotate() {
        // 全螢幕
        const requestFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                return document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                return document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                return document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                return document.documentElement.msRequestFullscreen();
            }
        };
    
        requestFullscreen().catch((err) => {
            console.error('Fullscreen request failed:', err);
        });
    
        // 強制橫向
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch((err) => {
                console.error('Screen orientation lock failed:', err);
            });
        } else {
            console.error('Screen orientation.lock() is not available on this device.');
        }
    }
    
    
    
    
}
