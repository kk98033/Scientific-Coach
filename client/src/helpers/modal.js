// \src\helpers\modal.js

export function showModal(title, message, confirmCallback, cancelCallback) {
    // 創建模態框背景遮罩
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1050';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // 創建模態框元素
    let modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.maxWidth = '500px';
    modal.style.width = '100%';

    // 標題
    let modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.innerText = title;
    modal.appendChild(modalTitle);

    // 消息內容
    let modalBody = document.createElement('p');
    modalBody.className = 'modal-body';
    modalBody.innerText = message;
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
