import { Scene } from 'phaser';
import GameManager from '../helpers/gameManager';
import { createSettingsOverlay, addIPSettings, addIDSettings, setCurrentPlayerID } from '../helpers/settings';
import { createIPInput, createRoomInput, createHostCheckbox, createRoomListContainer } from '../helpers/mainMenuUI';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.events.on('shutdown', this.removeHTMLUI, this);

        const gameManager = new GameManager();
        this.gameManager = gameManager;

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, '主選單', {
            fontFamily: 'Arial Black', fontSize: '38px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5);

        this.gameManager.socket.on('your_player_id', (data) => {
            this.playerId = data.playerId;
            console.log('My player ID is:', data.playerId);
            setCurrentPlayerID(data.playerId);
        });

        this.createHTMLUI();

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            this.addFullScreenButton();
        }

        this.gameManager.socket.on('room_list', (rooms) => {
            this.updateRoomList(rooms);
        });

        this.gameManager.socket.emit('get_room_list');
    }

    updateRoomList(rooms) {
        const roomListContainer = document.getElementById('roomListContainer');
        if (roomListContainer) {
            roomListContainer.innerHTML = '';
            rooms.forEach(roomId => {
                const roomItem = document.createElement('button');
                roomItem.textContent = `房間 ID: ${roomId}`;
                roomItem.className = 'list-group-item list-group-item-action';
                roomItem.addEventListener('click', () => {
                    document.getElementById('roomInput').value = roomId;
                });
                roomListContainer.appendChild(roomItem);
            });
        }
    }

    createHTMLUI() {
        const container = document.createElement('div');
        container.className = 'container mt-5';

        const ipInputGroup = createIPInput();
        const roomInputGroup = createRoomInput();
        const hostCheckboxGroup = createHostCheckbox();
        const roomListContainer = createRoomListContainer();

        container.appendChild(ipInputGroup);
        container.appendChild(roomInputGroup);
        container.appendChild(hostCheckboxGroup);
        container.appendChild(roomListContainer);

        document.body.appendChild(container);

        const settingsContainer = createSettingsOverlay();
        addIPSettings(settingsContainer);
        addIDSettings(settingsContainer, this.gameManager);

        ipInputGroup.querySelector('#ipSettingInputBtn').addEventListener('click', () => {
            const inputID = document.getElementById('ipSettingInputElement').value;
            console.log('ip', inputID);
            if (inputID) this.gameManager.setIP(inputID, inputID);
        });

        roomInputGroup.querySelector('#createRoomBtn').addEventListener('click', () => {
            console.log('創建房間');
            this.gameManager.createRoom();
        });

        roomInputGroup.querySelector('#joinRoomBtn').addEventListener('click', () => {
            const hostCheckbox = document.getElementById('hostCheckbox');
            const isHost = hostCheckbox ? hostCheckbox.checked : false;
            const roomNumber = document.getElementById('roomInput').value;
            console.log('加入：' + roomNumber);
            if (isHost) {
                this.gameManager.joinRoom(roomNumber, isHost);
            } else {
                this.gameManager.joinRoom(roomNumber, isHost);
                console.log('ID', this.gameManager.playerId);
            }
            this.removeHTMLUI();
            this.scene.stop('MainMenu');
            this.scene.start(isHost ? 'GameTable' : 'Game', { gameManager: this.gameManager });
        });
    }

    removeHTMLUI() {
        const elementsToRemove = [
            'ipSettingInputElement', 'ipSettingInputBtn', 'roomInput', 'createRoomBtn',
            'joinRoomBtn', 'roomListContainer', 'hostCheckboxLabel', 'hostCheckbox',
            'settingsButton', 'settingsOverlay', 'formGroup'
        ];

        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.parentNode.removeChild(element);
            }
        });
    }

    addFullScreenButton() {
        const fullScreenButton = document.createElement('button');
        fullScreenButton.textContent = '進入全螢幕模式';
        fullScreenButton.className = 'btn btn-warning mt-3';
        fullScreenButton.style.position = 'absolute';
        fullScreenButton.style.top = '80%';
        fullScreenButton.style.left = '50%';
        fullScreenButton.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(fullScreenButton);

        fullScreenButton.addEventListener('click', () => {
            this.enterFullScreenAndRotate();
            fullScreenButton.remove();
        });
    }

    enterFullScreenAndRotate() {
        const requestFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                return document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                return document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                return document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                return document.documentElement.msRequestFullscreen();
            }
        };

        requestFullscreen().catch((err) => {
            console.error('Fullscreen request failed:', err);
        });

        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch((err) => {
                console.error('Screen orientation lock failed:', err);
            });
        } else {
            console.error('Screen orientation.lock() is not available on this device.');
        }
    }
}

export default MainMenu;
