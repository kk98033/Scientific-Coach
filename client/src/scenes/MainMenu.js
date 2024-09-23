import { Scene } from 'phaser';
import GameManager from '../helpers/gameManager';
import { createSettingsOverlay, addIPSettings, addIDSettings, setCurrentPlayerID, addFullScreenButton } from '../helpers/settings';
import { createIPInput, createRoomInput, createHostCheckbox, createRoomListContainer } from '../helpers/mainMenuUI';
import { hideLoading, showLoading } from '../helpers/loading';
import { showNotification } from '../helpers/notification';
import { showAlert } from '../helpers/alert';
import { loadImages } from '../helpers/loader';
import { showUserIDModal } from '../helpers/userIDModal';
import { getCookie } from '../helpers/cookie';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }
    
    preload() {
        // 顯示 loading 動畫
        showLoading();

        // 加載圖片資源
        loadImages(this);

        // 加載完成後隱藏 loading 動畫
        this.load.on('complete', () => {
            hideLoading();
        });
    }

    create() {
        // 灰色
        this.cameras.main.setBackgroundColor('#1c1c1c'); 

        this.events.on('shutdown', this.removeHTMLUI, this);

        const gameManager = new GameManager();
        this.gameManager = gameManager;

        

        // this.gameManager.socket.on('your_player_id', (data) => {
        //     this.playerId = data.playerId;
        //     console.log('My player ID is:', data.playerId);
        //     setCurrentPlayerID(data.playerId);
        // });
 
        this.gameManager.socket.on('player_joined_success', (data) => {
            let playerId = data.userId; 
            if (this.gameManager.playerId !== playerId && this.gameManager.isGameTable) {
                console.log(" !!!")
                console.log(this.gameManager.playerId, playerId, data)
                return;
            }

            // 成功加入房間!
            hideLoading(); 
            
            console.log("debug-scene", this.scene.key);
            if (this.scene.key !== 'MainMenu') {
                return;
            }
 
            console.log('debug player join', data);

            // 檢查 hostCheckbox 是否存在
            const hostCheckbox = document.getElementById('hostCheckbox');
            if (!hostCheckbox) return;

            // 切換到遊戲場景
            const isHost = hostCheckbox ? hostCheckbox.checked : false;
            this.removeHTMLUI();
            this.scene.stop('MainMenu');
            this.scene.start(isHost ? 'GameTable' : 'Game', { gameManager: this.gameManager });
    
            if (this.gameManager.playerId === data.userId || isHost) {
                showNotification(`成功加入房間: ${this.gameManager.roomId}`, 'info'); 
            } 
        });
 
        this.createHTMLUI();  

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            addFullScreenButton();
        }

        this.gameManager.socket.on('room_list', (rooms) => {
            console.log('debug room', rooms)
            this.updateRoomList(rooms);
        });

        this.gameManager.socket.emit('get_room_list');

        // 檢查用戶 ID
        const userID = getCookie('userID');
        if (!userID) {
            showUserIDModal(
                (userID) => {
                    console.log('User ID set to:', userID);
                    showAlert(`成功設定玩家 ID 為: ${userID}`, 'success'); 
                    showNotification('如果需要修改 ID，請去設定修改!', 'info');
                    this.gameManager.setPlayerID(userID);
                    this.updatePlayerID(userID); // 更新 player ID
                }
            );
        } else {
            showAlert(`瀏覽器 Cookie 中你目前的 ID 為: ${userID}`, 'info'); 
            showNotification('如果需要修改 ID，請去設定修改!', 'info');
            this.gameManager.setPlayerID(userID);
            this.updatePlayerID(userID); // 更新 player ID
        }


        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, '主選單', { 
            fontFamily: 'Arial Black', fontSize: '38px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5);
    }

    updateRoomList(newRooms) {
        const roomListContainer = document.getElementById('roomListContainer');
        if (roomListContainer) {
            const existingRooms = Array.from(roomListContainer.getElementsByClassName('card')).map(card => card.getAttribute('data-room-id'));
            let isNewRoomAdded = false;
    
            // 添加新房間
            newRooms.forEach(roomId => {
                if (!existingRooms.includes(roomId)) {
                    isNewRoomAdded = true;
                    const roomItem = document.createElement('div');
                    roomItem.className = 'card mb-2 bg-secondary text-white new-room room-item-hover';
                    roomItem.style.cursor = 'pointer';
                    roomItem.style.opacity = '0'; // 初始透明度設置為0
                    roomItem.style.transform = 'scale(0.9)'; // 初始縮放設置為0.9
                    roomItem.setAttribute('data-room-id', roomId); // 設置房間ID作為屬性
    
                    const cardBody = document.createElement('div');
                    cardBody.className = 'card-body d-flex justify-content-between align-items-center';
                    cardBody.textContent = `房間 ID: ${roomId}`;
    
                    roomItem.appendChild(cardBody);
                    roomItem.addEventListener('click', () => {
                        document.getElementById('roomInput').value = roomId;
                        roomItem.classList.add('room-item-clicked');
                        setTimeout(() => {
                            roomItem.classList.remove('room-item-clicked');
                        }, 600); // 確保動畫效果持續
                    });
    
                    roomListContainer.appendChild(roomItem);
    
                    // 添加動畫效果
                    setTimeout(() => {
                        roomItem.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                        roomItem.style.opacity = '1';
                        roomItem.style.transform = 'scale(1)';
                    }, 100);
                }
            });
    
            // 移除已刪除的房間
            existingRooms.forEach(roomId => {
                if (!newRooms.includes(roomId)) {
                    const roomItem = roomListContainer.querySelector(`[data-room-id="${roomId}"]`);
                    if (roomItem) {
                        roomItem.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                        roomItem.style.opacity = '0';
                        roomItem.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            roomItem.remove(); // 完全移除房間元素
                        }, 500); // 確保動畫完成後移除
                    }
                }
            });
    
            // 滾動到最下面
            if (isNewRoomAdded) {
                roomListContainer.scrollTop = roomListContainer.scrollHeight;
            }
        }
    }
    

    createHTMLUI() {
        const container = document.createElement('div');
        container.className = 'container mt-5';

        // const ipInputGroup = createIPInput();
        const roomInputGroup = createRoomInput();
        const hostCheckboxGroup = createHostCheckbox();
        const roomListContainer = createRoomListContainer();

        // container.appendChild(ipInputGroup);
        container.appendChild(roomInputGroup);
        container.appendChild(hostCheckboxGroup);
        container.appendChild(roomListContainer);

        document.body.appendChild(container);

        const settingsContainer = createSettingsOverlay();
        addIPSettings(settingsContainer);
        addIDSettings(settingsContainer, this.gameManager);
        // console.log('player id: ', this.gameManager.playerId)
        // setCurrentPlayerID(this.gameManager.playerId);
        // ipInputGroup.querySelector('#ipSettingInputBtn').addEventListener('click', () => {
        //     const inputID = document.getElementById('ipSettingInputElement').value;
        //     console.log('ip', inputID);
        //     if (inputID) this.gameManager.setIP(inputID, inputID);
        // });

        roomInputGroup.querySelector('#createRoomBtn').addEventListener('click', () => {
            console.log('創建房間');
            this.gameManager.createRoom();
            showAlert('成功創建房間!', 'success'); 
        });

        roomInputGroup.querySelector('#joinRoomBtn').addEventListener('click', () => {
            const hostCheckbox = document.getElementById('hostCheckbox');
            const isHost = hostCheckbox ? hostCheckbox.checked : false;
            const roomNumber = document.getElementById('roomInput').value;
            console.log('加入：' + roomNumber);
            if (isHost) {
                // 嘗試加入房間
                this.gameManager.joinRoom(roomNumber, isHost);
            } else {
                // 嘗試加入房間
                this.gameManager.joinRoom(roomNumber, isHost);
                console.log('ID', this.gameManager.playerId);
            }
            // this.removeHTMLUI();
            // this.scene.stop('MainMenu');
            // this.scene.start(isHost ? 'GameTable' : 'Game', { gameManager: this.gameManager });
        });
    }

    updatePlayerID(userID) {
        console.log('Updating player ID:', userID);
        this.gameManager.playerId = userID;
        setCurrentPlayerID(this.gameManager.playerId);
        console.log('after updating: ', this.gameManager.playerId);
    }

    removeHTMLUI() {
        const elementsToRemove = [
            'roomInput', 'createRoomBtn',
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
}

export default MainMenu;
