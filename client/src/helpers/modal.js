export function showModal(title, message, confirmCallback, cancelCallback) {
    // 創建模態框背景遮罩
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'; // 調整背景遮罩顏色
    overlay.style.zIndex = '1050';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // 創建模態框元素
    let modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.backgroundColor = '#333'; // 設置模態框背景顏色為黑暗模式
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.maxWidth = '500px';
    modal.style.width = '100%';
    modal.style.color = '#fff'; // 設置文字顏色為白色

    // 標題
    let modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.innerText = title;
    modalTitle.style.color = '#fff'; // 設置標題文字顏色為白色
    modal.appendChild(modalTitle);

    // 消息內容
    let modalBody = document.createElement('p');
    modalBody.className = 'modal-body';
    modalBody.innerText = message;
    modalBody.style.color = '#ccc'; // 設置消息文字顏色為淡灰色
    modal.appendChild(modalBody);

    // 按鈕容器
    let buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '20px';

    // 確認按鈕
    let confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-primary';
    confirmButton.innerText = '確認';
    confirmButton.style.backgroundColor = '#007bff'; // 設置按鈕背景顏色為藍色
    confirmButton.style.color = '#fff'; // 設置按鈕文字顏色為白色
    confirmButton.style.border = 'none'; // 移除按鈕邊框
    confirmButton.style.marginRight = '10px';
    confirmButton.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        hideModal();
    });
    buttonContainer.appendChild(confirmButton);

    // 取消按鈕
    let cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.innerText = '取消';
    cancelButton.style.backgroundColor = '#777'; // 設置按鈕背景顏色為黑暗模式
    cancelButton.style.color = '#fff'; // 設置按鈕文字顏色為白色
    cancelButton.style.border = 'none'; // 移除按鈕邊框
    cancelButton.addEventListener('click', () => {
        if (cancelCallback) cancelCallback();
        hideModal();
    });
    buttonContainer.appendChild(cancelButton);

    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

export function hideModal() {
    let overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}
