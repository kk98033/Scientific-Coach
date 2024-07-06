// src/helper/settings.js

export function createSettingsOverlay() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes expandFromButton {
            from {
                transform: scale(0.1);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        @keyframes collapseToButton {
            from {
                transform: scale(1);
                opacity: 1;
            }
            to {
                transform: scale(0.1);
                opacity: 0;
            }
        }
        #settingsContainer.show {
            animation: expandFromButton 0.3s forwards;
        }
        #settingsContainer.hide {
            animation: collapseToButton 0.3s forwards;
        }
    `;
    document.head.appendChild(style);

    // Create settings button
    let settingsButton = document.createElement('button');
    settingsButton.id = 'settingsButton';
    settingsButton.className = 'btn btn-dark'; // 使用 Bootstrap 樣式
    settingsButton.style.position = 'absolute';
    settingsButton.style.top = '10px';
    settingsButton.style.right = '10px';
    settingsButton.style.width = '40px';
    settingsButton.style.height = '40px';
    settingsButton.style.borderRadius = '5px';
    settingsButton.style.zIndex = '10000'; // 提高 z-index 確保在最上層

    // Add gear icon to settings button
    let gearIcon = document.createElement('i');
    gearIcon.className = 'fas fa-cog';
    settingsButton.appendChild(gearIcon);

    document.body.appendChild(settingsButton);

    // Create settings overlay
    let settingsOverlay = document.createElement('div');
    settingsOverlay.id = 'settingsOverlay';
    settingsOverlay.style.position = 'fixed';
    settingsOverlay.style.top = '0';
    settingsOverlay.style.left = '0';
    settingsOverlay.style.width = '100%';
    settingsOverlay.style.height = '100%';
    settingsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    settingsOverlay.style.display = 'none';
    settingsOverlay.style.justifyContent = 'center';
    settingsOverlay.style.zIndex = '9999'; // 確保在畫面最上方
    settingsOverlay.style.alignItems = 'center';

    // Create settings container
    let settingsContainer = document.createElement('div');
    settingsContainer.id = 'settingsContainer';
    settingsContainer.className = 'bg-dark text-white p-4 rounded'; // 使用 Bootstrap 樣式
    settingsContainer.style.width = '300px';
    settingsContainer.style.textAlign = 'center';
    settingsContainer.style.position = 'relative'; // 確保 z-index 生效
    settingsContainer.style.zIndex = '10000'; // 確保在 overlay 上方

    // Create settings title
    let settingsTitle = document.createElement('h2');
    settingsTitle.textContent = '設定';
    settingsTitle.style.marginBottom = '20px';
    settingsContainer.appendChild(settingsTitle);

    // Create separator
    let separator = document.createElement('hr');
    separator.className = 'border-secondary';
    settingsContainer.appendChild(separator);

    settingsOverlay.appendChild(settingsContainer);
    document.body.appendChild(settingsOverlay);

    // Event listener for settings button
    settingsButton.onclick = () => {
        if (settingsOverlay.style.display === 'flex') {
            settingsContainer.classList.remove('show');
            settingsContainer.classList.add('hide');
            settingsContainer.addEventListener('animationend', () => {
                settingsOverlay.style.display = 'none';
                settingsContainer.classList.remove('hide');
            }, { once: true });
        } else {
            settingsOverlay.style.display = 'flex';
            settingsContainer.classList.remove('hide');
            settingsContainer.classList.add('show');
        }
    };

    // Event listener to hide settings overlay
    settingsOverlay.onclick = (e) => {
        if (e.target === settingsOverlay) {
            settingsContainer.classList.remove('show');
            settingsContainer.classList.add('hide');
            settingsContainer.addEventListener('animationend', () => {
                settingsOverlay.style.display = 'none';
                settingsContainer.classList.remove('hide');
            }, { once: true });
        }
    };

    return settingsContainer; // Return the container so additional settings can be added
}



export function addIPSettings(container) {
    // IP setting elements
    let ipSettingContainer = document.createElement('div');
    ipSettingContainer.className = 'd-flex align-items-center mb-3'; // 使用 Bootstrap 樣式

    let ipSettingLabel = document.createElement('label');
    ipSettingLabel.textContent = '連線伺服器:';
    ipSettingLabel.className = 'me-2'; // 使用 Bootstrap 樣式
    ipSettingContainer.appendChild(ipSettingLabel);

    let ipSettingInput = document.createElement('input');
    ipSettingInput.type = 'text';
    ipSettingInput.id = 'ipSettingInput';
    ipSettingInput.placeholder = 'IP地址';
    ipSettingInput.className = 'form-control me-2'; // 使用 Bootstrap 樣式
    ipSettingContainer.appendChild(ipSettingInput);

    let ipSettingButton = document.createElement('button');
    ipSettingButton.textContent = '連接';
    ipSettingButton.className = 'btn btn-primary'; // 使用 Bootstrap 樣式
    ipSettingButton.onclick = () => {
        // 連接伺服器邏輯
        console.log('連接伺服器: ' + ipSettingInput.value);
    };
    ipSettingContainer.appendChild(ipSettingButton);

    container.appendChild(ipSettingContainer);
}

export function addIDSettings(container, gameManager) {
    // ID setting elements
    let idSettingContainer = document.createElement('div');
    idSettingContainer.className = 'd-flex align-items-center mb-3'; // 使用 Bootstrap 樣式

    let idSettingLabel = document.createElement('label');
    idSettingLabel.textContent = '設置ID:';
    idSettingLabel.className = 'me-2'; // 使用 Bootstrap 樣式
    idSettingContainer.appendChild(idSettingLabel);

    let idSettingInput = document.createElement('input');
    idSettingInput.type = 'text';
    idSettingInput.id = 'idSettingInput';
    idSettingInput.placeholder = '玩家ID';
    idSettingInput.className = 'form-control me-2'; // 使用 Bootstrap 樣式

    // 添加 input 事件監聽器，僅允許英文和數字
    idSettingInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    });

    idSettingContainer.appendChild(idSettingInput);

    let idSettingButton = document.createElement('button');
    idSettingButton.textContent = '設置';
    idSettingButton.className = 'btn btn-primary'; // 使用 Bootstrap 樣式
    idSettingButton.onclick = handleSetPlayerIDButton(gameManager); // 綁定處理函數
    idSettingContainer.appendChild(idSettingButton);

    container.appendChild(idSettingContainer);

    // Display current player ID
    let currentPlayerIDContainer = document.createElement('div');
    currentPlayerIDContainer.className = 'd-flex align-items-center mb-3'; // 使用 Bootstrap 樣式

    let currentPlayerIDLabel = document.createElement('label');
    currentPlayerIDLabel.textContent = '目前玩家ID:';
    currentPlayerIDLabel.className = 'me-2'; // 使用 Bootstrap 樣式
    currentPlayerIDContainer.appendChild(currentPlayerIDLabel);

    let currentPlayerID = document.createElement('span');
    currentPlayerID.id = 'currentPlayerID';
    currentPlayerID.textContent = '未設置';
    currentPlayerIDContainer.appendChild(currentPlayerID);
    container.appendChild(currentPlayerIDContainer);
}


export function addReconnectButton(container, gameManager) {
    // Reconnect button
    let reconnectContainer = document.createElement('div');
    reconnectContainer.className = 'd-flex align-items-center mb-3'; // 使用 Bootstrap 樣式

    let reconnectLabel = document.createElement('label');
    reconnectLabel.textContent = '重新連線:';
    reconnectLabel.className = 'me-2'; // 使用 Bootstrap 樣式
    reconnectContainer.appendChild(reconnectLabel);

    let reconnectButton = document.createElement('button');
    reconnectButton.className = 'btn btn-primary'; // 使用 Bootstrap 樣式

    let reconnectIcon = document.createElement('i');
    reconnectIcon.className = 'fas fa-sync-alt';
    reconnectButton.appendChild(reconnectIcon);

    reconnectButton.onclick = () => {
        console.log('重新連線按鈕被點擊了');
        gameManager.socket.emit('is_game_started_on_this_room', { roomId: gameManager.roomId, playerId: gameManager.playerId });
    };

    reconnectContainer.appendChild(reconnectButton);
    container.appendChild(reconnectContainer);
}

export function setCurrentPlayerID(playerID) {
    const currentPlayerIDElement = document.getElementById('currentPlayerID');
    const idSettingInputElement = document.getElementById('idSettingInput');
    
    if (currentPlayerIDElement) {
        currentPlayerIDElement.textContent = playerID;
    }
    
    if (idSettingInputElement) {
        idSettingInputElement.value = playerID;
    }
}

export function handleSetPlayerIDButton(gameManager) {
    return () => {
        const idSettingInputElement = document.getElementById('idSettingInput');
        const playerID = idSettingInputElement ? idSettingInputElement.value : '';

        if (playerID) {
            setCurrentPlayerID(playerID);
            gameManager.playerId = playerID;
            console.log('玩家ID設置為: ' + playerID);
            console.log(gameManager.playerId)
        }
    };
}