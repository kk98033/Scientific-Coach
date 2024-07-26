// client\src\helpers\skills.js

import { hideModal, showModal } from "./modal";

// 技能
const Skills = {
    FRIENDLY_MATCH: 'use_skill_1',
    INFORMATION_GATHERING: 'use_skill_2',
    POACHING: 'use_skill_3'
};

let selectedSkill = null;

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

    // 技能卡片資訊
    const skills = [
        {
            name: '友誼賽',
            image: 'assets\\card_ui\\桌遊正面+技能卡牌3種 x5_page-0002.jpg',
            description: '描述友誼賽技能',
            skill: Skills.FRIENDLY_MATCH
        },
        {
            name: '情蒐',
            image: 'assets\\card_ui\\桌遊正面+技能卡牌3種 x5_page-0003.jpg',
            description: '描述情蒐技能',
            skill: Skills.INFORMATION_GATHERING
        },
        {
            name: '挖角',
            image: 'assets\\card_ui\\桌遊正面+技能卡牌3種 x5_page-0004.jpg',
            description: '描述挖角技能',
            skill: Skills.POACHING
        }
    ];

    // 創建技能卡片
    skills.forEach(({ name, image, description, skill }) => {
        const skillCard = document.createElement('div');
        skillCard.className = 'card text-white bg-secondary m-2 skill-card';
        skillCard.style.width = '18rem';
        skillCard.style.cursor = 'pointer';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.innerHTML = `
            <img src="${image}" class="card-img-top" alt="${name}">
            <h5 class="card-title">${name}</h5>
            <p class="card-text">${description}</p>
        `;

        // 使用 bootstrap 的 tooltip
        $(cardBody).tooltip({ title: description, placement: 'top', trigger: 'hover' });

        // 長按事件
        let pressTimer;
        skillCard.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                toggleSkillOverlay();
            }, 1000); // 長按1秒後觸發
        });

        skillCard.addEventListener('mouseup', () => {
            clearTimeout(pressTimer); // 取消長按
        });

        skillCard.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer); // 取消長按
        });

        // 新增點擊事件，根據不同的技能調用對應的函數
        skillCard.addEventListener('click', () => {
            useSkill(skill);
        });

        skillCard.appendChild(cardBody);
        skillContainer.appendChild(skillCard);
    });

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

    // 通用的技能選擇函數
    function useSkill(skill) {
        selectedSkill = skill;
        console.log(`已選擇技能: ${skill}`);
        
        toggleSkillOverlay();
        if (skill !== Skills.INFORMATION_GATHERING) {
            showSkillPlayerListContainer();
            updateSkillPlayerList(gameManager.players, gameManager);
        } else {
            gameManager.socket.emit(Skills.INFORMATION_GATHERING, { roomId: gameManager.roomId, playerId: gameManager.playerId });
        }
    }
}

// 創建技能玩家列表容器
export function createSkillPlayerListContainer() {
    let overlay = document.createElement('div');
    overlay.id = 'skillPlayerListOverlay';
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; // 背景遮罩顏色
    overlay.style.zIndex = '1000';
    overlay.style.display = 'none'; // 預設隱藏
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    let playerListContainer = document.createElement('div');
    playerListContainer.id = 'skillPlayerListContainer';
    playerListContainer.className = 'p-3 bg-dark text-white rounded shadow-lg';
    playerListContainer.style.width = '300px';
    playerListContainer.style.height = '300px';
    playerListContainer.style.overflowY = 'scroll';
    playerListContainer.style.transition = 'transform 0.5s ease, opacity 0.5s ease'; // 彈出動畫效果
    playerListContainer.style.boxSizing = 'border-box';
    playerListContainer.style.transform = 'scale(0.8)';
    playerListContainer.style.opacity = '0';

    // 添加標題
    let title = document.createElement('h5');
    title.innerText = '選擇你要實施的對象';
    title.className = 'text-center mb-3';
    playerListContainer.appendChild(title);

    // 添加取消按鈕
    let cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-outline-light mb-3';
    cancelButton.innerText = '取消';
    cancelButton.style.width = '100%';
    cancelButton.addEventListener('click', hideSkillPlayerListContainer);
    playerListContainer.appendChild(cancelButton);

    // 添加CSS動畫
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(`
        @keyframes popUp {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `, styleSheet.cssRules.length);

    styleSheet.insertRule(`
        @keyframes shrinkDown {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0; }
        }
    `, styleSheet.cssRules.length);

    // 在彈出時應用動畫
    playerListContainer.style.animation = 'popUp 0.5s ease forwards';

    overlay.appendChild(playerListContainer);
    document.body.appendChild(overlay);

    return playerListContainer;
}

// 顯示技能玩家列表容器
export function showSkillPlayerListContainer() {
    const overlay = document.getElementById('skillPlayerListOverlay');
    if (overlay) {
        overlay.style.display = 'flex'; // 顯示遮罩
        const container = document.getElementById('skillPlayerListContainer');
        if (container) {
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
            container.style.animation = 'popUp 0.5s ease forwards';
        }
    }
}

// 隱藏技能玩家列表容器
export function hideSkillPlayerListContainer() {
    const overlay = document.getElementById('skillPlayerListOverlay');
    if (overlay) {
        const container = document.getElementById('skillPlayerListContainer');
        if (container) {
            console.log('hiding');
            container.style.animation = 'shrinkDown 0.5s ease forwards';
            setTimeout(() => {
                overlay.style.display = 'none'; // 隱藏遮罩
            }, 500); // 延遲時間與動畫時間一致
        }
    }
}

// 更新技能玩家列表，添加按鈕
export function updateSkillPlayerList(players, gameManager) {
    const container = document.getElementById('skillPlayerListContainer');
    if (container) {
        // 清空容器內現有的玩家列表
        container.innerHTML = '';

        // 根據選擇的技能設置標題
        const skillNameMap = {
            [Skills.FRIENDLY_MATCH]: '友誼賽',
            [Skills.INFORMATION_GATHERING]: '情蒐',
            [Skills.POACHING]: '挖角'
        };

        const selectedSkillName = skillNameMap[selectedSkill] || '未知技能';

        // 添加標題
        let title = document.createElement('h5');
        title.innerHTML = `選擇你要實施 <span style="color: red; font-weight: bold;">${selectedSkillName}</span> 的對象`;
        title.className = 'text-center mb-3';
        container.appendChild(title);

        // 添加取消按鈕
        let cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-outline-light mb-3';
        cancelButton.innerText = '取消';
        cancelButton.style.width = '100%';
        cancelButton.addEventListener('click', hideSkillPlayerListContainer);
        container.appendChild(cancelButton);

        // 新增玩家列表按鈕
        players.forEach(playerId => {
            if (playerId !== gameManager.playerId) {
                let playerButton = document.createElement('button');
                playerButton.className = 'btn btn-outline-primary w-100 mb-2';
                playerButton.innerText = playerId;
                playerButton.addEventListener('click', () => {
                    showModal(
                        '確認操作',
                        `你確定要對 ${playerId} 使用 <span style="color: red; font-weight: bold;">${selectedSkillName}</span> 嗎？`,
                        {
                            buttons: [
                                {
                                    text: '確認',
                                    className: 'btn btn-primary',
                                    callback: () => {
                                        console.log(`對 ${playerId} 使用${selectedSkillName}`);
                                        gameManager.socket.emit(selectedSkill, { roomId: gameManager.roomId, playerId: gameManager.playerId, targetPlayerId: playerId });
                                        hideSkillPlayerListContainer();
                                    }
                                },
                                {
                                    text: '取消',
                                    className: 'btn btn-secondary',
                                    callback: hideModal
                                }
                            ]
                        }
                    );
                });
                container.appendChild(playerButton);
            }
        });
    }
}

// 創建 "交換卡片" 按鈕和容器(友誼賽)
export function createSwapCardsContainer(gameManager) {
    // 檢查容器是否已存在
    if (document.getElementById('swapCardsContainer')) {
        return;
    }

    // 隱藏 "使用技能" 按鈕
    const skillButton = document.getElementById('skillButton');
    if (skillButton) {
        skillButton.style.display = 'none';
    }

    // 創建容器
    const container = document.createElement('div');
    container.id = 'swapCardsContainer';
    container.className = 'position-fixed';
    container.style.bottom = '50px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '1000';
    container.style.textAlign = 'center';

    // 創建狀態文字
    const statusText = document.createElement('p');
    statusText.id = 'swapStatusText';
    statusText.innerText = '我選擇了 0/2 ，對方選擇了 0/2 張卡片';
    statusText.style.marginBottom = '10px';

    // 創建 "交換卡片" 按鈕
    const swapButton = document.createElement('button');
    swapButton.id = 'swapCardsButton';
    swapButton.className = 'btn btn-outline-primary';
    swapButton.disabled = true;

    // 添加交換圖標和文字
    const swapIcon = document.createElement('i');
    swapIcon.className = 'fas fa-exchange-alt me-2'; // 使用 Font Awesome 的交換圖標，並添加間距
    swapButton.appendChild(swapIcon);
    swapButton.appendChild(document.createTextNode('無法交換'));

    // 設置按鈕點擊事件
    swapButton.addEventListener('click', function () {
        if (gameManager.isPlayerTurn()) {
            // 若為玩家回合，"真的"進行交換
            console.log("swap the cards");
            gameManager.socket.emit('swap_cards', { roomId: gameManager.roomId, playerId: gameManager.playerId });            
        } else {
            // 若非玩家回合，將按鈕狀態改為 "已確認交換"
            updateSwapCardsButton('confirmed');
            gameManager.socket.emit('confirm_swap', { roomId: gameManager.roomId, playerId: gameManager.playerId });            
        }
    });

    // 將狀態文字和按鈕添加到容器
    container.appendChild(statusText);
    container.appendChild(swapButton);

    // 將容器添加到文檔
    document.body.appendChild(container);
}

// 創建 "交換卡片" 按鈕和容器(挖角)
export function createSwapCardsContainerForPOACH(gameManager) {
    // 檢查容器是否已存在
    if (document.getElementById('swapCardsContainer')) {
        return;
    }

    // 隱藏 "使用技能" 按鈕
    const skillButton = document.getElementById('skillButton');
    if (skillButton) {
        skillButton.style.display = 'none';
    }

    // 創建容器
    const container = document.createElement('div');
    container.id = 'swapCardsContainer';
    container.className = 'position-fixed';
    container.style.bottom = '50px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '1000';
    container.style.textAlign = 'center';

    // 創建狀態文字
    const statusText = document.createElement('p');
    statusText.id = 'swapStatusText';
    statusText.innerText = '我選擇了 0/2 ，對方選擇了 0/2 張卡片';
    statusText.style.marginBottom = '10px';

    // 將狀態文字和按鈕添加到容器
    container.appendChild(statusText);

    // 發動技能的人才出現按鈕
    if (gameManager.isPlayerTurn()) {
        // 創建 "交換卡片" 按鈕
        const swapButton = document.createElement('button');
        swapButton.id = 'swapCardsButton';
        swapButton.className = 'btn btn-outline-primary';
        swapButton.disabled = true;
    
        // 添加交換圖標和文字
        const swapIcon = document.createElement('i');
        swapIcon.className = 'fas fa-exchange-alt me-2'; // 使用 Font Awesome 的交換圖標，並添加間距
        swapButton.appendChild(swapIcon);
        swapButton.appendChild(document.createTextNode('無法交換'));

        // 設置按鈕點擊事件
        swapButton.addEventListener('click', function () {
            if (gameManager.isPlayerTurn()) {
                // 若為玩家回合，進行交換卡片
                console.log("swap the cards");
                gameManager.socket.emit('swap_cards', { roomId: gameManager.roomId, playerId: gameManager.playerId });            
            }
        });
        container.appendChild(swapButton);
    }
    
    // 將容器添加到文檔
    document.body.appendChild(container);
}

// 刪除 "交換卡片" 按鈕和容器
export function removeSwapCardsContainer() {
    const container = document.getElementById('swapCardsContainer');
    if (container) {
        container.remove();
        // 顯示 "使用技能" 按鈕
        const skillButton = document.getElementById('skillButton');
        if (skillButton) {
            skillButton.style.display = 'block';
        }
    }
}

// 修改 "交換卡片" 按鈕的狀態
export function updateSwapCardsButton(state) {
    const swapButton = document.getElementById('swapCardsButton');
    if (swapButton) {
        switch (state) {
            case 'disabled':
                swapButton.className = 'btn btn-outline-danger';
                swapButton.innerText = '無法交換';
                swapButton.disabled = true;
                break;
            case 'enabled':
                swapButton.className = 'btn btn-outline-success';
                swapButton.innerText = '交換';
                swapButton.disabled = false;
                break;
            case 'confirmed':
                swapButton.className = 'btn btn-outline-primary';
                swapButton.innerText = '已確認交換';
                swapButton.disabled = true;
                break;
        }
        // 添加交換圖標
        const swapIcon = document.createElement('i');
        swapIcon.className = 'fas fa-exchange-alt me-2'; // 使用 Font Awesome 的交換圖標，並添加間距
        swapButton.insertBefore(swapIcon, swapButton.firstChild);
    }
}

// 更新狀態文字
export function updateSwapStatusText(mySelection, opponentSelection) {
    const statusText = document.getElementById('swapStatusText');
    if (statusText) {
        statusText.innerText = `我選擇了 ${mySelection}/2 ，對方選擇了 ${opponentSelection}/2 張卡片`;
    }
}
