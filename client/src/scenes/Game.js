import { Scene } from 'phaser';
// import Card from '../helpers/card';
import { createPlayerListContainer, createTimeSettingContainer, createCardDeckContainer, createStartGameContainer, createActionButtonsContainer, createCurrentPlayerIDContainer, appendElementsToCenter, createGameRecordContainer, createControlButtonsContainer, addBlurOverlay, removeCanvasBlur, addCanvasBlur, updatePlayerList } from '../helpers/game_ui';
import { showNotification } from '../helpers/notification';
import { createSettingsOverlay, addIPSettings, addIDSettings, addReconnectButton, setCurrentPlayerID, handleSetPlayerIDButton, addClearTableButton, addToggleUIVisibilityButton, addLeaveGameButton } from '../helpers/settings';
import { showAlert } from '../helpers/alert';
import { addWaveGradientBorder, toggleGradientBorder, changeGradientColor } from '../helpers/waveGradient';
import { createSkillButtonAndOverlay, createSkillPlayerListContainer, hideSkillButton, hideSkillPlayerListContainer, updateSkillPlayerList } from '../helpers/skills'
import { hideModal, showModal } from '../helpers/modal';

export class Game extends Scene {
    constructor() {
        super({
            key: 'Game'
        });
        this.blurEffect = null;
        this.wakeLock = null; // 用來存儲 Wake Lock 實例
        this.silentVideoElement = null; // 用於播放無聲影片
    }

    // 請求螢幕鎖定
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                showAlert('Wake Lock is active');
                
                // 監聽釋放事件，例如螢幕解鎖或瀏覽器失去焦點時
                this.wakeLock.addEventListener('release', () => {
                    showAlert('Wake Lock was released');
                });
            } catch (err) {
                showAlert('Failed to acquire Wake Lock:', err);
            }
        } else {
            showAlert('Wake Lock API is not supported on this browser');
            this.playSilentAudio(); // 呼叫播放無聲影片的後備方案
        }
    }

    // 釋放螢幕鎖定
    releaseWakeLock() {
        if (this.wakeLock !== null) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake Lock has been released');
        }
    }

    // 播放無聲影片來防止螢幕熄滅
    playSilentAudio() {
        this.silentAudioElement = document.createElement('audio');
        this.silentAudioElement.src = '../audio/silent.mp3'; // 替換為無聲音頻的路徑
        this.silentAudioElement.loop = true;
        this.silentAudioElement.muted = true; // 保持靜音
        this.silentAudioElement.style.display = 'none'; // 隱藏音頻元素
        document.body.appendChild(this.silentAudioElement);
    
        this.silentAudioElement.play().catch(error => {
            console.error('Failed to play the silent audio:', error);
        });
    }

    // 停止播放無聲影片
    stopSilentAudio() {
        if (this.silentAudioElement) {
            this.silentAudioElement.pause();
            this.silentAudioElement.remove();
            this.silentAudioElement = null;
        }
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
        // 灰色
        this.cameras.main.setBackgroundColor('#1c1c1c'); 

        this.waveIsVisable = true;

        // 加入紅色漸層效果
        addWaveGradientBorder(this, 0xff0000);
        toggleGradientBorder(this, false);

        this.gameManager.setupDragEvents();
        this.gameManager.setupPointerEvents(); 

        this.createHTMLUI();

        // 更新準備玩家 UI
        this.gameManager.updateReadyPlayers();

        // this.setupDragEvents();

        this.currentPlayerText = this.add.text(10, 5, 'Current Player: ', { fontSize: '36px', fill: '#fff' });
        this.timerText = this.add.text(10, 30, '', { fontSize: '36px', fill: '#fff' });

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

        document.getElementById('ready-btn').addEventListener('click', () => {
            // 請求 Wake Lock 來防止螢幕熄滅
            this.requestWakeLock();
        });

        this.isPlayerA = false; 
        this.opponentCards = [];
 
 
        this.gameManager.socket.on('update_player_list',  (data) => {
            console.log("AAAAA") 
            console.log(data)
            this.gameManager.players = data.players;
            updatePlayerList(data.players, this.gameManager);
            updateSkillPlayerList(data.players, this.gameManager);
        }); 

        this.gameManager.socket.on('game_started',  (data) => {
            this.clearHTMLUI();
            this.showActionButtons(); 

            if (!this.gameManager.isPlayerTurn()) {
                hideSkillButton(); 
            }
        }); 

        this.gameManager.socket.on('is_game_started_on_this_room', (data) => {
            const { gameIsStarted, isPlayerInRoom, playerId } = data; 
            if (!this.gameManager || this.gameManager.playerId != playerId) return;

            console.log(gameIsStarted, isPlayerInRoom);
        
            if (gameIsStarted && isPlayerInRoom) {
                // 可以重新連線加入
                this.gameManager.getPlayerHand();
                const message = '成功重新加入'; 
                showNotification(message, 'success'); 
                this.clearHTMLUI();
                this.showActionButtons(); 

                this.gameManager.socket.emit('update_game_state', { roomId: this.gameManager.roomId });

            } else {
                // 不可以重新連線加入
                const message = !gameIsStarted ? '遊戲尚未開始。' : '你不在房間內。';
                showNotification(message, 'warning');
            }
        });
        
 
        this.gameManager.socket.emit('update_player_list', { roomId: this.gameManager.roomId });

        // 在剛進入遊戲的時候抓取 server 上面的 settings 並且更新 UI
        this.gameManager.getAndUpdateSettings();
    }

    update() {
    }

    shutdown() {
        // 當場景關閉時釋放 Wake Lock 並停止播放無聲影片
        this.releaseWakeLock();
        this.stopSilentAudio();
    }

    // todo: remove this, I forgor what is this
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

    createHTMLUI() {
        // 背景虛化
        addCanvasBlur();

        const playerListContainer = createPlayerListContainer();
        const timeSettingContainer = createTimeSettingContainer(this.gameManager); // 默認不可編輯
        const cardDeckContainer = createCardDeckContainer(this.gameManager); // 默認不可編輯
        const startGameContainer = createStartGameContainer(this.gameManager); // 默認準備開始
        const actionButtonsContainer = createActionButtonsContainer();
        const gameRecordContainer = createGameRecordContainer(); // 新增遊戲紀錄框
    
        createCurrentPlayerIDContainer(); // 創建玩家ID顯示容器
    
        // 將主要的容器置中
        appendElementsToCenter([timeSettingContainer, cardDeckContainer, startGameContainer]);

        // 單獨附加其他容器到文檔中
        document.body.appendChild(actionButtonsContainer);
        document.body.appendChild(playerListContainer); // 放置在左下角
        document.body.appendChild(gameRecordContainer); // 放置在右下角 
    
        // SETTINGS
        const settingsContainer = createSettingsOverlay();
        // addIPSettings(settingsContainer);
        // addIDSettings(settingsContainer, this.gameManager);
        addReconnectButton(settingsContainer, this.gameManager);
        addLeaveGameButton(settingsContainer, this.gameManager);
        addClearTableButton(settingsContainer, this.gameManager);
        addToggleUIVisibilityButton(settingsContainer);

        createSkillPlayerListContainer();
    } 
    

    
    // 顯示配對和丟棄按鈕的函數
    showActionButtons() {
        // 創建使用技能按鈕和覆蓋層
        createSkillButtonAndOverlay(this.gameManager);
        
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
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        // 背景虛化
        removeCanvasBlur();
    }

    clearInGameHTMLUI() {
        const elementsToRemove = [
            'playerListContainer',
            'actionButtonsContainer',
            'currentPlayerIDContainer',
            'gameRecordContainer',
            'skillContainer', 'skillOverlay', 'skillButton'
        ];
     
        elementsToRemove.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
} 
  