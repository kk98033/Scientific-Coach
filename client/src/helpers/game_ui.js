// client\src\helpers\game_ui.js

export function addCanvasBlur() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.classList.add('blur-canvas');
    }
}

export function removeCanvasBlur() {
    console.log("debug: remove")
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.classList.remove('blur-canvas');
    }
}

export function updatePlayerList(players, gameManager) {
    const playerListContainer = document.getElementById('playerListContainer');
    if (!playerListContainer) return;

    // 保存原來的收起/展開按鈕
    const toggleButton = playerListContainer.querySelector('.toggle-button');
    const hiddenText = playerListContainer.querySelector('.hidden-text');
    
    // 清空列表，但保留收起/展開按鈕
    playerListContainer.innerHTML = '';

    // 如果有收起/展開按鈕，重新附加到容器
    if (toggleButton) {
        playerListContainer.appendChild(toggleButton);
    }

    if (hiddenText) {
        playerListContainer.appendChild(hiddenText);
    }

    players.forEach(playerId => {
        const playerItem = document.createElement('div');
        playerItem.textContent = `Player ID: ${playerId}`;
        playerItem.style.marginBottom = '10px';
        
        // 高亮當前玩家
        if (playerId === gameManager.currentPlayer) {
            playerItem.style.color = 'green'; // 將當前玩家 ID 設置為綠色
            playerItem.style.fontWeight = 'bold'; // 讓文字加粗
        }

        playerListContainer.appendChild(playerItem);
    });
}

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
    playerListContainer.style.transition = 'height 0.5s'; // 添加動畫效果
    playerListContainer.style.boxSizing = 'border-box';

    // 創建收起/展開按鈕
    let toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px'; // 固定在右上角
    toggleButton.style.backgroundColor = 'transparent';
    toggleButton.style.border = '2px solid white';
    toggleButton.style.color = 'white';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.padding = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.zIndex = '1001'; // 確保按鈕在最上層

    // 使用 Font Awesome 的圖標
    toggleButton.innerHTML = '<i class="fas fa-minus"></i>';

    // 創建隱藏時顯示的文字節點
    let hiddenText = document.createElement('div');
    hiddenText.className = 'hidden-text';
    hiddenText.style.display = 'none';
    hiddenText.style.justifyContent = 'center';
    hiddenText.style.alignItems = 'center';
    hiddenText.style.height = '100%';
    hiddenText.style.color = 'rgba(255, 255, 255, 0.5)'; // 淡化文字顏色
    hiddenText.style.transition = 'opacity 0.5s ease'; // 添加動畫效果
    hiddenText.innerText = '已隱藏';

    // 定義 "已隱藏" 文字的 pop-up 動畫
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        @keyframes popUp {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
    `, styleSheet.cssRules.length);

    // 事件監聽器，用於切換收起/展開
    toggleButton.addEventListener('click', function() {
        const children = playerListContainer.children;
        if (playerListContainer.style.height === '200px') {
            playerListContainer.style.height = '40px'; // 維持按鈕高度
            playerListContainer.style.overflowY = 'hidden'; // 隱藏內容
            toggleButton.innerHTML = '<i class="fas fa-plus"></i>';

            // 在高度縮起完成後顯示 "已隱藏" 文字
            setTimeout(() => {
                hiddenText.style.display = 'flex';
                hiddenText.style.animation = 'popUp 0.5s ease'; // 使用 pop-up 動畫
                hiddenText.style.opacity = '1';
            }, 500); // 延遲時間與 height 的過渡時間一致

            // 隱藏其他元素
            for (let i = 0; i < children.length; i++) {
                if (children[i] !== toggleButton && children[i] !== hiddenText) {
                    children[i].style.display = 'none';
                }
            }
        } else {
            playerListContainer.style.height = '200px';
            playerListContainer.style.overflowY = 'scroll'; // 顯示滾動條
            toggleButton.innerHTML = '<i class="fas fa-minus"></i>';
            hiddenText.style.animation = ''; // 移除動畫
            hiddenText.style.opacity = '0';

            // 在高度展開完成後隱藏 "已隱藏" 文字
            setTimeout(() => {
                hiddenText.style.display = 'none';
                for (let i = 0; i < children.length; i++) {
                    if (children[i] !== toggleButton && children[i] !== hiddenText) {
                        children[i].style.display = 'block';
                        children[i].style.transition = 'opacity 0.5s'; // 添加顯示動畫
                        children[i].style.opacity = '0';
                        setTimeout(() => children[i].style.opacity = '1', 10); // 觸發動畫
                    }
                }
            }, 500); // 延遲時間與 height 的過渡時間一致
        }
    });

    playerListContainer.appendChild(toggleButton);
    playerListContainer.appendChild(hiddenText);

    return playerListContainer;
}


export function createTimeSettingContainer(gameManager, isEditable = false) {
    let timeSettingContainer = document.createElement('div');
    timeSettingContainer.id = 'timeSettingContainer';
    timeSettingContainer.className = 'p-3 bg-dark text-white rounded';

    // 時間設定標籤和輸入框
    let timeSettingLabel = document.createElement('label');
    timeSettingLabel.textContent = '時間設定 (秒):';
    timeSettingLabel.className = 'd-block mb-2'; // 使用 d-block 和 mb-2 來確保垂直排列並添加下方間距

    let timeSettingInput = document.createElement('input');
    timeSettingInput.id = 'roundTimeInput';
    timeSettingInput.type = 'number';
    timeSettingInput.value = '30';
    timeSettingInput.min = '1';
    timeSettingInput.className = 'form-control mb-3'; // 使用 mb-3 來添加下方間距
    timeSettingInput.readOnly = !isEditable; // 設置是否可編輯

    timeSettingContainer.appendChild(timeSettingLabel);
    timeSettingContainer.appendChild(timeSettingInput);

    // 配對卡片及獲勝標籤和輸入框
    let matchCardsToWinLabel = document.createElement('label');
    matchCardsToWinLabel.textContent = '配對卡片即獲勝:';
    matchCardsToWinLabel.className = 'd-block mb-2'; // 使用 d-block 和 mb-2 來確保垂直排列並添加下方間距

    let matchCardsToWinInput = document.createElement('input');
    matchCardsToWinInput.id = 'matchCardsToWinInput';
    matchCardsToWinInput.type = 'number';
    matchCardsToWinInput.value = '5';
    matchCardsToWinInput.min = '1';
    matchCardsToWinInput.className = 'form-control mb-3'; // 使用 mb-3 來添加下方間距
    matchCardsToWinInput.readOnly = !isEditable; // 設置是否可編輯

    timeSettingContainer.appendChild(matchCardsToWinLabel);
    timeSettingContainer.appendChild(matchCardsToWinInput);

    if (isEditable) {
        timeSettingInput.addEventListener('input', () => {
            gameManager.updateSettings();
        });

        timeSettingInput.onclick = () => {
            gameManager.updateSettings();
        };

        matchCardsToWinInput.addEventListener('input', () => {
            gameManager.updateSettings();
        });

        matchCardsToWinInput.onclick = () => {
            gameManager.updateSettings();
        };
    }

    return timeSettingContainer;
}


export function createCardDeckContainer(gameManager, isEditable = false) {
    let cardDeckContainer = document.createElement('div');
    cardDeckContainer.id = 'cardDeckContainer';
    cardDeckContainer.className = 'p-3 bg-dark text-white rounded';

    const style = document.createElement('style');
    style.innerHTML = `
        #cardDeckContainer {
            max-height: 500px; /* 設定預設最大高度 */
            overflow-y: auto; /* 啟用滾動 */
        }
        @media (max-height: 480px) {
            #cardDeckContainer {
                max-height: 150px; /* 手機橫向螢幕上設定較小的最大高度 */
            }
        }
    `;
    document.head.appendChild(style);

    let selectedCType = null; // 記錄選擇的C類型（C1或C2）
    let sports = ['體操', '足球', '桌球', '射擊', '棒球', '柔道'];
    let deckCounts = Array(sports.length).fill(0); // 用於記錄每個卡組的數量
    let deckCountSpans = []; // 用於記錄每個顯示已加入組數的元素

    sports.forEach((sport, index) => {
        let deckContainer = document.createElement('div');
        deckContainer.id = `deckContainer_${index + 1}`;
        deckContainer.className = 'mb-3';

        let deckLabel = document.createElement('span');
        deckLabel.textContent = `${sport}: `;
        deckLabel.className = 'me-2';

        let selectA1 = document.createElement('span');
        selectA1.textContent = 'A1';
        selectA1.className = 'badge me-2';
        selectA1.style.backgroundColor = '#aca86b';

        let selectB1 = document.createElement('span');
        selectB1.textContent = 'B1';
        selectB1.className = 'badge me-2';
        selectB1.style.backgroundColor = '#77bee9';

        let selectC1 = document.createElement('button');
        selectC1.textContent = 'C1';
        selectC1.className = 'btn me-2';
        selectC1.style.backgroundColor = '#f8b0a2';
        selectC1.setAttribute('data-type', 'C1');
        selectC1.disabled = !isEditable;
        selectC1.onclick = () => {
            toggleSelection(selectC1, selectC2, 'C1', index);
            selectedCType = selectC1.classList.contains('selected') ? 'C1' : null;
            updateAddButtonState(addButton, selectedCType);
            if (selectedCType) { // 如果選中了 C1
                addButton.click(); // 自動添加一組
            }
            gameManager.updateSettings();
        };

        let selectC2 = document.createElement('button');
        selectC2.textContent = 'C2';
        selectC2.className = 'btn me-2';
        selectC2.style.backgroundColor = '#f48b71';
        selectC2.setAttribute('data-type', 'C2');
        selectC2.disabled = !isEditable;
        selectC2.onclick = () => {
            toggleSelection(selectC2, selectC1, 'C2', index);
            selectedCType = selectC2.classList.contains('selected') ? 'C2' : null;
            updateAddButtonState(addButton, selectedCType);
            if (selectedCType) { // 如果選中了 C2
                addButton.click(); // 自動添加一組
            }
            gameManager.updateSettings();
        };

        let addButton = document.createElement('button');
        addButton.id = `addButton_${index + 1}`;
        addButton.textContent = '+';
        addButton.className = 'btn btn-primary me-2';
        addButton.style.minWidth = '40px';
        addButton.style.minHeight = '40px';
        addButton.disabled = !selectedCType || !isEditable;
        addButton.onclick = () => {
            if (selectedCType) {
                updateDeckCount(deckCountSpans[index], ++deckCounts[index]);
                gameManager.updateSettings();
            }
        };

        let subtractButton = document.createElement('button');
        subtractButton.id = `subtractButton_${index + 1}`;
        subtractButton.textContent = '-';
        subtractButton.className = 'btn btn-primary me-2';
        subtractButton.style.minWidth = '40px';
        subtractButton.style.minHeight = '40px';
        subtractButton.disabled = !isEditable;
        subtractButton.onclick = () => {
            if (deckCounts[index] > 1) { // 最多減少到剩下一組
                updateDeckCount(deckCountSpans[index], --deckCounts[index]);
                gameManager.updateSettings();
            }
        };

        let deckCountSpan = document.createElement('span');
        deckCountSpan.id = `deckCountSpan_${index + 1}`;
        deckCountSpan.textContent = `已加入 0 組`;
        deckCountSpan.className = 'ms-3';
        deckCountSpans.push(deckCountSpan);

        deckContainer.appendChild(deckLabel);
        deckContainer.appendChild(selectA1);
        deckContainer.appendChild(selectB1);
        deckContainer.appendChild(selectC1);
        deckContainer.appendChild(selectC2);
        deckContainer.appendChild(addButton);
        deckContainer.appendChild(subtractButton);
        deckContainer.appendChild(deckCountSpan);
        cardDeckContainer.appendChild(deckContainer);
    });

    return cardDeckContainer;

    function toggleSelection(selectedButton, otherButton, cType, index) {
        if (!selectedButton.classList.contains('selected')) {
            selectedButton.classList.add('selected');
            selectedButton.style.backgroundColor = '#28a745'; // 綠色
            otherButton.classList.remove('selected');
            otherButton.style.backgroundColor = otherButton.textContent === 'C1' ? '#f8b0a2' : '#f48b71'; // 恢復原色
        } else {
            selectedButton.classList.remove('selected');
            selectedButton.style.backgroundColor = cType === 'C1' ? '#f8b0a2' : '#f48b71';
        }
    
        if (!selectedButton.classList.contains('selected') && !otherButton.classList.contains('selected')) {
            resetDeckCount(index); // 只重置當前項目的數量
        }
    }

    function updateDeckCount(deckCountSpan, count) {
        deckCountSpan.textContent = `已加入 ${count} 組`;
    }

    function updateAddButtonState(addButton, selectedCType) {
        addButton.disabled = !selectedCType;
    }

    function resetDeckCount(index) {
        deckCounts[index] = 0;
        updateDeckCount(deckCountSpans[index], deckCounts[index]);
    }
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
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideIn {
            from {
                transform: translateX(-100%);
            }
            to {
                transform: translateX(0);
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(-100%);
            }
        }
        @keyframes popUp {
            0% {
                transform: scale(0.8);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        .slide-in {
            animation: slideIn 0.5s forwards;
        }
        .slide-out {
            animation: slideOut 0.5s forwards;
        }
        .pop-up {
            animation: popUp 0.3s ease-out forwards;
        }
        .hidden {
            opacity: 0;
            transform: scale(0.8);
        }
    `;
    document.head.appendChild(style);

    let actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.id = 'actionButtonsContainer';
    actionButtonsContainer.className = 'p-3 bg-dark text-white';
    actionButtonsContainer.style.position = 'fixed';
    actionButtonsContainer.style.top = '50%';
    actionButtonsContainer.style.left = '0';
    actionButtonsContainer.style.transform = 'translateY(-50%) translateX(-100%)';
    actionButtonsContainer.style.zIndex = '1000';
    actionButtonsContainer.style.transition = 'transform 0.5s';
    actionButtonsContainer.style.borderTopRightRadius = '0';
    actionButtonsContainer.style.borderBottomRightRadius = '0';
    actionButtonsContainer.style.borderTopLeftRadius = '0.25rem';
    actionButtonsContainer.style.borderBottomLeftRadius = '0.25rem';

    // 配對按鈕
    let pairButton = document.createElement('button');
    pairButton.id = 'pair-button';
    pairButton.className = 'btn btn-outline-primary me-2 hidden';

    // 配對按鈕圖標和文字
    let pairIcon = document.createElement('i');
    pairIcon.className = 'fas fa-handshake me-2';
    pairButton.appendChild(pairIcon);
    pairButton.appendChild(document.createTextNode('配對'));

    actionButtonsContainer.appendChild(pairButton);

    // 丟棄按鈕
    let discardButton = document.createElement('button');
    discardButton.id = 'discard-button';
    discardButton.className = 'btn btn-outline-danger hidden';

    // 丟棄按鈕圖標和文字
    let discardIcon = document.createElement('i');
    discardIcon.className = 'fas fa-trash-alt me-2';
    discardButton.appendChild(discardIcon);
    discardButton.appendChild(document.createTextNode('丟棄'));

    actionButtonsContainer.appendChild(discardButton);

    // 隱藏/顯示按鈕標籤
    let toggleButton = document.createElement('div');
    toggleButton.id = 'toggle-button';
    toggleButton.className = 'bg-dark text-white p-2';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '0';
    toggleButton.style.right = '-40px';
    toggleButton.style.height = '100%';
    toggleButton.style.transform = 'translateX(-10px)';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '1001';
    toggleButton.style.borderTopRightRadius = '0.25rem';
    toggleButton.style.borderBottomRightRadius = '0.25rem';

    // 隱藏/顯示按鈕圖標和文字
    let toggleIcon = document.createElement('i');
    toggleIcon.className = 'fas fa-bars';
    toggleButton.appendChild(toggleIcon);

    toggleButton.addEventListener('click', () => {
        if (actionButtonsContainer.style.transform.includes('translateX(-100%)')) {
            actionButtonsContainer.style.transform = 'translateY(-50%) translateX(0)';
            // 展開動畫後顯示按鈕並添加 Pop up 動畫
            setTimeout(() => {
                pairButton.classList.remove('hidden');
                discardButton.classList.remove('hidden');
                pairButton.classList.add('pop-up');
                discardButton.classList.add('pop-up');
            }, 500); // 確保在容器展開後觸發
        } else {
            actionButtonsContainer.style.transform = 'translateY(-50%) translateX(-100%)';
            pairButton.classList.remove('pop-up');
            discardButton.classList.remove('pop-up');
            setTimeout(() => {
                pairButton.classList.add('hidden');
                discardButton.classList.add('hidden');
            }, 500); // 確保在容器收起後隱藏
        }
    });

    actionButtonsContainer.appendChild(toggleButton);

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


// 用於創建可隱藏的遊戲紀錄容器
export function createGameRecordContainer() {
    let gameRecordContainer = document.createElement('div');
    gameRecordContainer.id = 'gameRecordContainer';
    gameRecordContainer.className = 'p-3 bg-dark text-white rounded shadow-lg';
    gameRecordContainer.style.width = '250px';
    gameRecordContainer.style.height = '150px';
    gameRecordContainer.style.overflowY = 'hidden';
    gameRecordContainer.style.position = 'fixed';
    gameRecordContainer.style.bottom = '10px';
    gameRecordContainer.style.right = '10px';
    gameRecordContainer.style.zIndex = '1000';
    gameRecordContainer.style.transition = 'height 0.5s';
    gameRecordContainer.style.boxSizing = 'border-box';

    let title = document.createElement('h5');
    title.textContent = '遊戲紀錄';
    title.className = 'mb-3';

    let gameLevel = document.createElement('div');
    gameLevel.id = 'gameLevel';
    gameLevel.textContent = '遊戲等級: N/A';
    gameLevel.className = 'mb-2';

    let resourcePoints = document.createElement('div');
    resourcePoints.id = 'resourcePoints';
    resourcePoints.textContent = '資源點數數量: N/A';
    resourcePoints.className = 'mb-2';

    let cardPairCount = document.createElement('div');
    cardPairCount.id = 'cardPairCount';
    cardPairCount.textContent = '卡牌配對數量: N/A';

    gameRecordContainer.appendChild(title);
    gameRecordContainer.appendChild(gameLevel);
    gameRecordContainer.appendChild(resourcePoints);
    gameRecordContainer.appendChild(cardPairCount);

    // 創建收起/展開按鈕
    let toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px';
    toggleButton.style.backgroundColor = 'transparent';
    toggleButton.style.border = '2px solid white';
    toggleButton.style.color = 'white';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.padding = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.zIndex = '1001';

    // 使用 Font Awesome 的圖標
    toggleButton.innerHTML = '<i class="fas fa-minus"></i>';

    // 創建隱藏時顯示的文字節點
    let hiddenText = document.createElement('div');
    hiddenText.className = 'hidden-text';
    hiddenText.style.display = 'none';
    hiddenText.style.justifyContent = 'center';
    hiddenText.style.alignItems = 'center';
    hiddenText.style.height = '100%';
    hiddenText.style.color = 'rgba(255, 255, 255, 0.5)'; // 淡化文字顏色
    hiddenText.style.transition = 'opacity 0.5s ease'; // 添加動畫效果
    hiddenText.innerText = '已隱藏';

    // 定義 "已隱藏" 文字的 pop-up 動畫
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        @keyframes popUp {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
    `, styleSheet.cssRules.length);

    // 事件監聽器，用於切換收起/展開
    toggleButton.addEventListener('click', function() {
        const children = gameRecordContainer.children;
        if (gameRecordContainer.style.height === '150px') {
            gameRecordContainer.style.height = '40px'; // 維持按鈕高度
            gameRecordContainer.style.overflowY = 'hidden'; // 隱藏內容
            toggleButton.innerHTML = '<i class="fas fa-plus"></i>';

            // 在高度縮起完成後顯示 "已隱藏" 文字
            setTimeout(() => {
                hiddenText.style.display = 'flex';
                hiddenText.style.animation = 'popUp 0.5s ease'; // 使用 pop-up 動畫
                hiddenText.style.opacity = '1';
            }, 500); // 延遲時間與 height 的過渡時間一致

            // 隱藏其他元素
            for (let i = 0; i < children.length; i++) {
                if (children[i] !== toggleButton && children[i] !== hiddenText) {
                    children[i].style.display = 'none';
                }
            }
        } else {
            gameRecordContainer.style.height = '150px';
            gameRecordContainer.style.overflowY = 'hidden'; // 顯示滾動條
            toggleButton.innerHTML = '<i class="fas fa-minus"></i>';
            hiddenText.style.animation = ''; // 移除動畫
            hiddenText.style.opacity = '0';

            // 在高度展開完成後隱藏 "已隱藏" 文字
            setTimeout(() => {
                hiddenText.style.display = 'none';
                for (let i = 0; i < children.length; i++) {
                    if (children[i] !== toggleButton && children[i] !== hiddenText) {
                        children[i].style.display = 'block';
                        children[i].style.transition = 'opacity 0.5s'; // 添加顯示動畫
                        children[i].style.opacity = '0';
                        setTimeout(() => children[i].style.opacity = '1', 10); // 觸發動畫
                    }
                }
            }, 500); // 延遲時間與 height 的過渡時間一致
        }
    });

    gameRecordContainer.appendChild(toggleButton);
    gameRecordContainer.appendChild(hiddenText);

    return gameRecordContainer;
}

export function updateGameRecord(level, points, pairs) {
    const gameLevel = document.getElementById('gameLevel');
    const resourcePoints = document.getElementById('resourcePoints');
    const cardPairCount = document.getElementById('cardPairCount');

    let levelText;
    switch (level) {
        case 0:
            levelText = 'C 級';
            break;
        case 1:
            levelText = 'B 級';
            break;
        case 2:
            levelText = 'A 級';
            break;
        default:
            levelText = 'N/A';
            break;
    }

    if (gameLevel && gameLevel.textContent !== `遊戲等級: ${levelText}`) {
        gameLevel.textContent = `遊戲等級: ${levelText}`;
        createAnimation(gameLevel, "level up"); // 等級提升時顯示 "level up"
    }

    if (resourcePoints && resourcePoints.textContent !== `資源點數數量: ${points}`) {
        let diff = points - parseInt(resourcePoints.textContent.split(': ')[1], 10);
        resourcePoints.textContent = `資源點數數量: ${points}`;
        createAnimation(resourcePoints, diff > 0 ? `+${diff}` : `${diff}`);
    }

    if (cardPairCount && cardPairCount.textContent !== `卡牌配對數量: ${pairs}`) {
        let diff = pairs - parseInt(cardPairCount.textContent.split(': ')[1], 10);
        cardPairCount.textContent = `卡牌配對數量: ${pairs}`;
        createAnimation(cardPairCount, diff > 0 ? `+${diff}` : `${diff}`);
    }
}

function createAnimation(element, text) {
    let animation = document.createElement('div');
    animation.textContent = text;
    animation.className = 'text-success position-absolute';
    animation.style.fontSize = '0.8rem'; // 初始字體較小
    animation.style.transition = 'opacity 2s ease-out, transform 2s ease-out, font-size 2s ease-out'; // 調慢動畫速度並增加字體大小過渡
    animation.style.opacity = '1';
    animation.style.zIndex = '2000'; // 確保在最上層

    // 設置動畫位置
    const rect = element.getBoundingClientRect();
    animation.style.top = `${rect.top - 20}px`; // 在元素上方顯示動畫
    animation.style.left = `${rect.left + rect.width / 2}px`;
    animation.style.transform = 'translate(-50%, 0)';

    document.body.appendChild(animation);

    // 觸發動畫
    setTimeout(() => {
        animation.style.opacity = '0';
        animation.style.transform = 'translate(-50%, -30px)'; // 動畫上移更多
        animation.style.fontSize = '1.5rem'; // 字體變大
        setTimeout(() => {
            document.body.removeChild(animation);
        }, 2000); // 動畫持續2秒
    }, 0);
}

// 處理減少的動畫
function createReductionAnimation(element, text) {
    let animation = document.createElement('div');
    animation.textContent = text;
    animation.className = 'text-danger position-absolute';
    animation.style.fontSize = '1rem'; // 初始字體較大
    animation.style.fontWeight = 'bold'; // 設置字體為粗體
    animation.style.transition = 'opacity 2s ease-out, transform 2s ease-out, font-size 2s ease-out'; // 調慢動畫速度並增加字體大小過渡
    animation.style.opacity = '1';
    animation.style.zIndex = '2000'; // 確保在最上層

    // 設置動畫位置
    const rect = element.getBoundingClientRect();
    animation.style.top = `${rect.top - 20}px`; // 在元素上方顯示動畫
    animation.style.left = `${rect.left + rect.width / 2}px`;
    animation.style.transform = 'translate(-50%, 0)';

    document.body.appendChild(animation);

    // 觸發動畫
    setTimeout(() => {
        animation.style.opacity = '0';
        animation.style.transform = 'translate(-50%, -30px)'; // 動畫上移更多
        animation.style.fontSize = '1.5rem'; // 字體變大
        setTimeout(() => {
            document.body.removeChild(animation);
        }, 2000); // 動畫持續2秒
    }, 0);
}

export function updateResourcePoints(points) {
    const resourcePoints = document.getElementById('resourcePoints');

    if (resourcePoints) {
        resourcePoints.textContent = `資源點數數量: ${points}`;

        // 確保動畫每次都會觸發
        setTimeout(() => {
            createReductionAnimation(resourcePoints, "減少");
        }, 100); // 延遲一點時間以確保動畫效果能夠重新觸發
    }
}