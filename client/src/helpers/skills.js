// client\src\helpers\skills.js

import { showModal } from "./modal";


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
            description: '描述友誼賽技能'
        },
        {
            name: '情蒐',
            image: 'assets\\card_ui\\桌遊正面+技能卡牌3種 x5_page-0003.jpg',
            description: '描述情蒐技能'
        },
        {
            name: '挖角',
            image: 'assets\\card_ui\\桌遊正面+技能卡牌3種 x5_page-0004.jpg',
            description: '描述挖角技能'
        }
    ];

    // 創建三個技能卡片
    skills.forEach((skill, index) => {
        const skillCard = document.createElement('div');
        skillCard.className = 'card text-white bg-secondary m-2 skill-card';
        skillCard.style.width = '18rem';
        skillCard.style.cursor = 'pointer';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        cardBody.innerHTML = `
            <img src="${skill.image}" class="card-img-top" alt="${skill.name}">
            <h5 class="card-title">${skill.name}</h5>
            <p class="card-text">${skill.description}</p>
        `;

        // 使用 bootstrap 的 tooltip
        $(cardBody).tooltip({title: skill.description, placement: 'top', trigger: 'hover'});

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
            switch (index) {
                case 0:
                    useSkill1();
                    break;
                case 1:
                    useSkill2();
                    break;
                case 2:
                    useSkill3();
                    break;
            }
        });

        skillCard.appendChild(cardBody);
        skillContainer.appendChild(skillCard);
    });

    // 技能1的函數
    function useSkill1() {
        console.log('已選擇技能: 友誼賽');
        
        gameManager.socket.emit('use_skill_1', { roomId: gameManager.roomId, playerId: gameManager.playerId });

        toggleSkillOverlay();
    }

    // 技能2的函數
    function useSkill2() {
        console.log('已選擇技能: 情蒐');
        
        gameManager.socket.emit('use_skill_2', { roomId: gameManager.roomId, playerId: gameManager.playerId });

        toggleSkillOverlay();
    }

    // 技能3的函數
    function useSkill3() {
        console.log('已選擇技能: 挖角');

        gameManager.socket.emit('use_skill_3', { roomId: gameManager.roomId, playerId: gameManager.playerId });
        
        toggleSkillOverlay();
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
