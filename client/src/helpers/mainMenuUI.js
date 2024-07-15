// client\src\helpers\mainMenuUI.js

export function createIPInput() {
    const formGroup = document.createElement('div');
    formGroup.className = 'mb-3';
    formGroup.style.position = 'absolute';
    formGroup.style.top = '15%';
    formGroup.style.left = '50%';
    formGroup.style.transform = 'translate(-50%, -50%)';

    const ipSettingInputElement = document.createElement('input');
    ipSettingInputElement.type = 'text';
    ipSettingInputElement.id = 'ipSettingInputElement';
    ipSettingInputElement.placeholder = '請輸入 IP';
    ipSettingInputElement.className = 'form-control';

    const ipSettingInputBtn = document.createElement('button');
    ipSettingInputBtn.id = 'ipSettingInputBtn';
    ipSettingInputBtn.textContent = '連接伺服器';
    ipSettingInputBtn.className = 'btn btn-primary mt-2';

    formGroup.appendChild(ipSettingInputElement);
    formGroup.appendChild(ipSettingInputBtn);

    return formGroup;
}

export function createRoomInput() {
    const formGroup = document.createElement('div');
    formGroup.className = 'mb-3';
    formGroup.style.position = 'absolute';
    formGroup.style.top = '50%';
    formGroup.style.left = '50%';
    formGroup.style.transform = 'translate(-50%, -50%)';

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = 'roomInput';
    inputElement.placeholder = '請輸入房間號';
    inputElement.className = 'form-control';

    const createRoomBtn = document.createElement('button');
    createRoomBtn.id = 'createRoomBtn';
    createRoomBtn.textContent = '新建房間';
    createRoomBtn.className = 'btn btn-success mt-2';

    const joinRoomBtn = document.createElement('button');
    joinRoomBtn.id = 'joinRoomBtn';
    joinRoomBtn.textContent = '加入房間';
    joinRoomBtn.className = 'btn btn-info mt-2';

    formGroup.appendChild(inputElement);
    formGroup.appendChild(createRoomBtn);
    formGroup.appendChild(joinRoomBtn);

    return formGroup;
}

export function createHostCheckbox() {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-check mb-3';
    formGroup.id = 'formGroup';
    formGroup.style.position = 'absolute';
    formGroup.style.top = '65%';
    formGroup.style.left = '50%';
    formGroup.style.transform = 'translate(-50%, -50%)';

    const hostCheckbox = document.createElement('input');
    hostCheckbox.type = 'checkbox';
    hostCheckbox.id = 'hostCheckbox';
    hostCheckbox.className = 'form-check-input';

    const hostCheckboxLabel = document.createElement('label');
    hostCheckboxLabel.textContent = '房主';
    hostCheckboxLabel.className = 'form-check-label';
    hostCheckboxLabel.htmlFor = 'hostCheckbox'; 

    formGroup.appendChild(hostCheckbox);
    formGroup.appendChild(hostCheckboxLabel);

    return formGroup;
}

export function createRoomListContainer() {
    const roomListContainer = document.createElement('div');
    roomListContainer.id = 'roomListContainer';
    roomListContainer.className = 'p-3 bg-dark text-white rounded shadow-lg'; // 匹配其他元素的樣式
    roomListContainer.style.position = 'absolute';
    roomListContainer.style.top = '50%';
    roomListContainer.style.left = '80%';
    roomListContainer.style.transform = 'translate(-50%, -50%)';
    roomListContainer.style.overflowY = 'scroll';
    roomListContainer.style.height = '150px'; // 調整高度
    roomListContainer.style.width = '250px'; // 調整寬度
    roomListContainer.style.zIndex = '1000'; // 保持較高的 z-index 層級
 
    // 添加自定義滾動條樣式
    const style = document.createElement('style');
    style.textContent = `
        #roomListContainer::-webkit-scrollbar {
            width: 12px;
        }
        #roomListContainer::-webkit-scrollbar-track {
            background: #444;
            border-radius: 10px;
        }
        #roomListContainer::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 10px;
            border: 3px solid #444;
        }
        #roomListContainer {
            scrollbar-width: thin;
            scrollbar-color: #888 #444;
        } 
        .room-item-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .room-item-hover:hover {
            transform: scale(1.1); /* 增加縮放比例 */
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); /* 增加陰影效果 */
        }
        .room-item-clicked {
            animation: clickEffect 0.6s forwards; /* 調整動畫持續時間 */
        }
        @keyframes clickEffect {
            0% {
                transform: scale(1);
                background-color: #6c757d; /* 初始背景色 */
            }
            50% {
                transform: scale(0.9); /* 縮小效果 */
                background-color: #ff6347; /* 點擊時變色效果 */
            }
            100% {
                transform: scale(1); /* 恢復原狀 */
                background-color: #6c757d; /* 恢復背景色 */
            }
        }
    `;
    document.head.appendChild(style);

    return roomListContainer;
}
