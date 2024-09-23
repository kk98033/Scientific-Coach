import { Scene } from 'phaser';
import Zone from '../helpers/zone';
import io from 'socket.io-client';
import Dealer from '../helpers/dealer';
import { createPlayerListContainer, createTimeSettingContainer, createCardDeckContainer, createStartGameContainer, createCurrentPlayerIDContainer, appendElementsToCenter, removeCanvasBlur, addCanvasBlur } from '../helpers/game_ui';
import { addLeaveGameButton, createSettingsOverlay } from '../helpers/settings';


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
        // this.load.image('cyanCardFront', 'assets/c1.png');
        // this.load.image('cyanCardBack', 'assets/CardBack.png');
        // this.load.image('magentaCardFront', 'assets/b1.png');
        // this.load.image('magentaCardBack', 'assets/CardBack.png');
        // console.log('All assets loaded');
    }

    create() {
        // 灰色
        this.cameras.main.setBackgroundColor('#1c1c1c'); 

        // let self = this;

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

        this.currentPlayerText = this.add.text(10, 15, 'TABLE ', { fontSize: '24px', fill: '#fff' });
        this.currentPlayerText = this.add.text(10, 5, 'Current Player: ', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(10, 30, '', { fontSize: '24px', fill: '#fff' });
    }

    update() {
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
        // 背景虛化
        addCanvasBlur();

        const playerListContainer = createPlayerListContainer();
        const timeSettingContainer = createTimeSettingContainer(this.gameManager, true); // 可編輯
        const cardDeckContainer = createCardDeckContainer(this.gameManager, true); // 可編輯
        const startGameContainer = createStartGameContainer(this.gameManager, true); // 開始遊戲
        createCurrentPlayerIDContainer(); // 創建玩家ID顯示容器

        appendElementsToCenter([timeSettingContainer, cardDeckContainer, startGameContainer]);
        document.body.appendChild(playerListContainer); // 放置在左下角

        // SETTINGS
        const settingsContainer = createSettingsOverlay();
        // addIPSettings(settingsContainer);
        // addIDSettings(settingsContainer, this.gameManager);
        // addReconnectButton(settingsContainer, this.gameManager);
        addLeaveGameButton(settingsContainer, this.gameManager);
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

        // 背景虛化
        console.log("debug: clear in game html ui");
        removeCanvasBlur();
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
        console.log("debug: clear html ui");
        removeCanvasBlur();
    }
} 
