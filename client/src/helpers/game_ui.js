// src/helper/ui.js

export function createPlayerListContainer() {
    let playerListContainer = document.createElement('div');
    playerListContainer.id = 'playerListContainer';
    playerListContainer.className = 'p-3 bg-dark text-white rounded shadow-lg';
    playerListContainer.style.width = '250px';
    playerListContainer.style.height = '200px';
    playerListContainer.style.overflowY = 'scroll';
    playerListContainer.style.position = 'fixed';
    playerListContainer.style.bottom = '10px'; // 確保在玩家ID下方
    playerListContainer.style.left = '10px';
    playerListContainer.style.zIndex = '1000'; // 設置較低的 z-index

    return playerListContainer;
}

export function createTimeSettingContainer(gameManager, isEditable = false) {
    let timeSettingContainer = document.createElement('div');
    timeSettingContainer.id = 'timeSettingContainer';
    timeSettingContainer.className = 'p-3 bg-dark text-white rounded';

    let timeSettingLabel = document.createElement('label');
    timeSettingLabel.textContent = '時間設定 (秒):';
    timeSettingLabel.className = 'me-2';

    let timeSettingInput = document.createElement('input');
    timeSettingInput.id = 'roundTimeInput';
    timeSettingInput.type = 'number';
    timeSettingInput.value = '30';
    timeSettingInput.min = '1';
    timeSettingInput.className = 'form-control d-inline-block w-auto';
    timeSettingInput.readOnly = !isEditable; // 設置是否可編輯

    timeSettingContainer.appendChild(timeSettingLabel);
    timeSettingContainer.appendChild(timeSettingInput);

    if (isEditable) {
        timeSettingInput.addEventListener('input', (event) => {
            console.log(gameManager);
            gameManager.updateSettings();
        });

        timeSettingInput.onclick = () => {
            gameManager.updateSettings();
        };
    }

    return timeSettingContainer;
}

export function createCardDeckContainer(gameManager, isEditable = false) {
    let cardDeckContainer = document.createElement('div');
    cardDeckContainer.id = 'cardDeckContainer';
    cardDeckContainer.className = 'p-3 bg-dark text-white rounded';

    for (let i = 1; i <= 4; i++) {
        let deckContainer = document.createElement('div');
        deckContainer.id = `deckContainer_${i}`;
        deckContainer.className = 'mb-3';

        let deckLabel = document.createElement('span');
        deckLabel.textContent = `排組 ${i}: `;
        deckLabel.className = 'me-2';

        let addButton = document.createElement('button');
        addButton.id = `addButton_${i}`;
        addButton.textContent = '+';
        addButton.className = 'btn btn-primary me-2';
        addButton.disabled = !isEditable; // 設置是否可編輯
        addButton.onclick = () => {
            let deckCount = document.getElementById(`deckCount_${i}`);
            let currentCount = parseInt(deckCount.textContent, 10);
            deckCount.textContent = currentCount + 1;
            gameManager.updateSettings();
        };

        let deckCount = document.createElement('span');
        deckCount.id = `deckCount_${i}`;
        deckCount.textContent = i === 1 ? '1' : '0';
        deckCount.className = 'me-2';

        let subtractButton = document.createElement('button');
        subtractButton.id = `subtractButton_${i}`;
        subtractButton.textContent = '-';
        subtractButton.className = 'btn btn-primary';
        subtractButton.disabled = !isEditable; // 設置是否可編輯
        subtractButton.onclick = () => {
            let currentCount = parseInt(deckCount.textContent, 10);
            if (currentCount > 0) {
                deckCount.textContent = currentCount - 1;
            }
            gameManager.updateSettings();
        };

        deckContainer.appendChild(deckLabel);
        deckContainer.appendChild(addButton);
        deckContainer.appendChild(deckCount);
        deckContainer.appendChild(subtractButton);
        cardDeckContainer.appendChild(deckContainer);
    }

    return cardDeckContainer;
}

export function createStartGameContainer(gameManager, isStartGame = false) {
    let startGameContainer = document.createElement('div');
    startGameContainer.id = 'startGameContainer';
    startGameContainer.className = 'p-3 bg-dark text-white rounded';

    let playerReadyCount = document.createElement('div');
    playerReadyCount.id = 'playerReadyCount';
    playerReadyCount.textContent = '0/4 玩家已準備好';
    playerReadyCount.className = 'mb-3';
    startGameContainer.appendChild(playerReadyCount);

    let readyOrStartBtn = document.createElement('button');
    readyOrStartBtn.id = isStartGame ? 'start-game' : 'ready-btn';
    readyOrStartBtn.textContent = isStartGame ? '開始遊戲' : '準備開始';
    readyOrStartBtn.className = `btn btn-outline-${isStartGame ? 'primary' : 'primary'}`;
    readyOrStartBtn.disabled = isStartGame; // 設置開始遊戲按鈕默認禁用

    readyOrStartBtn.onclick = () => {
        if (isStartGame) {
            gameManager.initializeAndStartGame();
        } else {
            if (readyOrStartBtn.textContent === '準備開始') {
                gameManager.playerReady();
                readyOrStartBtn.textContent = '取消準備';
                readyOrStartBtn.className = 'btn btn-outline-secondary';
            } else {
                gameManager.playerNotReady();
                readyOrStartBtn.textContent = '準備開始';
                readyOrStartBtn.className = 'btn btn-outline-primary';
            }
        }
    };
    startGameContainer.appendChild(readyOrStartBtn);

    return startGameContainer;
}

export function createActionButtonsContainer() {
    let actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.id = 'actionButtonsContainer';
    actionButtonsContainer.className = 'p-3 bg-dark text-white rounded';
    actionButtonsContainer.style.display = 'none'; // 默認隱藏
    actionButtonsContainer.style.position = 'fixed'; // 固定位置
    actionButtonsContainer.style.top = '50%'; // 垂直居中顯示
    actionButtonsContainer.style.left = '10px'; // 確保位於最左邊
    actionButtonsContainer.style.transform = 'translateY(-50%)'; // 垂直居中對齊
    actionButtonsContainer.style.zIndex = '1000'; // 設置較低的 z-index

    // 配對按鈕
    let pairButton = document.createElement('button');
    pairButton.id = 'pair-button';
    pairButton.textContent = '配對';
    pairButton.className = 'btn btn-primary me-2';
    actionButtonsContainer.appendChild(pairButton);

    // 丟棄按鈕
    let discardButton = document.createElement('button');
    discardButton.id = 'discard-button';
    discardButton.textContent = '丟棄';
    discardButton.className = 'btn btn-outline-danger';
    actionButtonsContainer.appendChild(discardButton);

    return actionButtonsContainer;
}

export function createCurrentPlayerIDContainer() {
    let currentPlayerIDContainer = document.createElement('div');
    currentPlayerIDContainer.id = 'currentPlayerIDContainer';
    currentPlayerIDContainer.className = 'position-fixed p-2 bg-dark text-white rounded shadow-lg';
    currentPlayerIDContainer.style.bottom = '220px'; // 確保在playerListContainer上方
    currentPlayerIDContainer.style.left = '10px';
    currentPlayerIDContainer.style.zIndex = '1000'; // 設置較低的 z-index

    let currentPlayerIDLabel = document.createElement('span');
    currentPlayerIDLabel.textContent = '目前玩家ID: ';
    currentPlayerIDLabel.className = 'me-2';

    let currentPlayerID = document.createElement('span');
    currentPlayerID.id = 'currentPlayerID';
    currentPlayerID.textContent = '未設置';

    currentPlayerIDContainer.appendChild(currentPlayerIDLabel);
    currentPlayerIDContainer.appendChild(currentPlayerID);

    document.body.appendChild(currentPlayerIDContainer);
}


export function appendElementsToCenter(elements) {
    let container = document.createElement('div');
    container.className = 'd-flex flex-column align-items-center justify-content-center position-fixed top-50 start-50 translate-middle gap-3';
    container.style.zIndex = '1000'; // 確保在畫布上方
    elements.forEach(element => {
        container.appendChild(element);
    });
    document.body.appendChild(container);
}
