// \src\helpers\notification.js

export function showNotification(message, alertType = 'warning') {
    // 創建通知元素
    let notification = document.createElement('div');
    notification.className = `alert alert-${alertType} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.style.position = 'fixed';
    notification.style.top = '5%';
    notification.style.right = '10px';
    notification.style.zIndex = '1050';
    notification.style.transition = 'transform 0.5s ease-in-out';
    notification.style.transform = 'translateX(100%)'; // 初始位置在右邊外面
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);

    // 強制重繪以觸發CSS過渡效果
    setTimeout(() => {
        notification.style.transform = 'translateX(0)'; // 彈入效果
    }, 10);

    // 設置自動消失
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)'; // 彈出效果
        setTimeout(() => {
            notification.remove(); // 完全消失後移除元素
        }, 500);
    }, 3000); // 3秒後自動消失
}
