export function showModal(title, message, options = {}) {
    const { confirmCallback, cancelCallback, closeOnSpace = false, buttons = [] } = options;

    // 移除現有的模態框背景遮罩（如果存在）
    let existingOverlay = document.querySelector('.modal-overlay.modal-specific-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // 創建模態框背景遮罩
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-specific-overlay'; // 添加特定的類名
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
    modalTitle.innerHTML = title;
    modalTitle.style.color = '#fff'; // 設置標題文字顏色為白色
    modal.appendChild(modalTitle);

    // 消息內容
    let modalBody = document.createElement('p');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = message;
    modalBody.style.color = '#ccc'; // 設置消息文字顏色為淡灰色
    modal.appendChild(modalBody);

    // 按鈕容器
    let buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '20px';

    // 動態創建按鈕
    buttons.forEach(button => {
        let btn = document.createElement('button');
        btn.className = button.className || 'btn';
        btn.innerText = button.text;
        btn.style.backgroundColor = button.backgroundColor || '#007bff';
        btn.style.color = button.color || '#fff';
        btn.style.border = button.border || 'none';
        btn.style.marginRight = '10px';
        btn.addEventListener('click', () => {
            if (button.callback) button.callback();
            if (button.closeOnClick !== false) hideModal();
        });
        buttonContainer.appendChild(btn);
    });

    // 如果沒有自訂按鈕，則使用預設確認和取消按鈕
    if (buttons.length === 0) {
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
    }

    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 如果設定了空白鍵關閉
    if (closeOnSpace) {
        const closeOnSpaceHandler = (e) => {
            if (e.key === ' ') {
                hideModal();
                document.removeEventListener('keydown', closeOnSpaceHandler);
            }
        };
        document.addEventListener('keydown', closeOnSpaceHandler);
    }
}

export function hideModal() {
    let overlay = document.querySelector('.modal-overlay.modal-specific-overlay');
    if (overlay) {
        overlay.remove();
    }
}
