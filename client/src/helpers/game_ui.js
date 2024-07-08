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

// src/helper/ui.js

export function createSkillButtonAndOverlay(gameManager) {
    // 新增動畫樣式
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes expandContainerFromButton {
            from {
                transform: scale(0.1);
                opacity: 0;
                transform-origin: bottom center;
            }
            to {
                transform: scale(1);
                opacity: 1;
                transform-origin: bottom center;
            }
        }
        @keyframes collapseContainerToButton {
            from {
                transform: scale(1);
                opacity: 1;
                transform-origin: bottom center;
            }
            to {
                transform: scale(0.1);
                opacity: 0;
                transform-origin: bottom center;
            }
        }
        #skillContainer.show {
            animation: expandContainerFromButton 0.3s forwards;
        }
        #skillContainer.hide {
            animation: collapseContainerToButton 0.3s forwards;
        }
    `;
    document.head.appendChild(style);

    // 創建 "使用技能" 按鈕
    const skillButton = document.createElement('button');
    skillButton.id = 'skillButton';
    skillButton.className = 'btn btn-outline-primary position-fixed';
    skillButton.style.bottom = '10px';
    skillButton.style.left = '50%';
    skillButton.style.transform = 'translateX(-50%)';
    skillButton.style.zIndex = '1000';

    // 添加技能圖標和文字
    const skillIcon = document.createElement('i');
    skillIcon.className = 'fas fa-magic me-2'; // 使用 Font Awesome 的魔法棒圖標，並添加間距
    skillButton.appendChild(skillIcon);
    skillButton.appendChild(document.createTextNode('使用技能'));

    // 創建技能選擇覆蓋層
    const overlay = document.createElement('div');
    overlay.id = 'skillOverlay';
    overlay.className = 'd-none position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75';
    overlay.style.zIndex = '1050';

    // 創建技能選擇容器
    const skillContainer = document.createElement('div');
    skillContainer.id = 'skillContainer';
    skillContainer.className = 'd-flex justify-content-around w-50 bg-dark p-3 rounded'; // 確保容器也有背景色和圓角
    skillContainer.style.zIndex = '1051'; // 讓技能選擇容器顯示在覆蓋層之上

    // 創建四個技能卡片
    for (let i = 1; i <= 4; i++) {
        const skillCard = document.createElement('div');
        skillCard.className = 'card text-white bg-secondary m-2 skill-card';
        skillCard.style.width = '18rem';
        skillCard.style.cursor = 'pointer';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.innerHTML = `<h5 class="card-title">技能 ${i}</h5><p class="card-text">這是技能 ${i} 的描述。</p>`;
        
        skillCard.appendChild(cardBody);
        skillCard.addEventListener('click', () => {
            const skillFunctionName = `useSkill${i}`;
            if (typeof gameManager[skillFunctionName] === 'function') {
                gameManager[skillFunctionName](); // 調用對應的技能函數
            } else {
                console.error(`技能函數 ${skillFunctionName} 不存在於 gameManager`);
            }
            toggleSkillOverlay();
        });
        
        skillContainer.appendChild(skillCard);
    }

    overlay.appendChild(skillContainer);

    // 添加按鈕點擊事件
    skillButton.addEventListener('click', toggleSkillOverlay);

    // 添加覆蓋層點擊事件（點擊覆蓋層關閉技能選擇）
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            toggleSkillOverlay();
        }
    });

    document.body.appendChild(skillButton);
    document.body.appendChild(overlay);

    // 切換技能選擇覆蓋層顯示/隱藏
    function toggleSkillOverlay() {
        const skillButtonRect = skillButton.getBoundingClientRect();
        skillContainer.style.transformOrigin = `${skillButtonRect.left + skillButtonRect.width / 2}px ${skillButtonRect.top + skillButtonRect.height / 2}px`;

        if (overlay.classList.contains('d-none')) {
            overlay.classList.remove('d-none');
            skillContainer.classList.add('show');
        } else {
            skillContainer.classList.remove('show');
            skillContainer.classList.add('hide');
            skillContainer.addEventListener('animationend', () => {
                overlay.classList.add('d-none');
                skillContainer.classList.remove('hide');
            }, { once: true });
        }
    }
}
