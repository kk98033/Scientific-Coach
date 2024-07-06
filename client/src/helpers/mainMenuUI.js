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
    roomListContainer.className = 'list-group';
    roomListContainer.style.position = 'absolute';
    roomListContainer.style.top = '50%';
    roomListContainer.style.left = '80%';
    roomListContainer.style.transform = 'translate(-50%, -50%)';
    roomListContainer.style.overflowY = 'scroll';
    roomListContainer.style.height = '200px';
    roomListContainer.style.backgroundColor = '#000';  // 設置背景顏色為黑色
    roomListContainer.style.color = '#fff';  // 設置文字顏色為白色
    roomListContainer.style.border = '1px solid #444';  // 設置邊框顏色以匹配黑暗模式
    roomListContainer.style.borderRadius = '5px';  // 添加圓角

    return roomListContainer;
}


