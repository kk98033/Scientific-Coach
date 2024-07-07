// \src\helpers\alert.js

export function showAlert(message, alertType = 'warning') {
    // 創建彈出視窗元素
    let alertBox = document.createElement('div');
    alertBox.className = `alert alert-${alertType} alert-dismissible fade show`;
    alertBox.role = 'alert';
    alertBox.style.position = 'fixed';
    alertBox.style.top = '10%';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.zIndex = '1050';
    alertBox.style.transition = 'top 1s ease-in-out, opacity 1s ease-in-out';
    alertBox.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // 更透明的背景
    alertBox.style.border = '1px solid rgba(0, 0, 0, 0.1)'; // 調整邊框透明度
    alertBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)'; // 加入陰影
    alertBox.innerHTML = `
        <div style="display: flex; align-items: center;">
            <div style="margin-right: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.708c.889 0 1.437-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 7a1.002 1.002 0 1 1-2.004 0 1.002 1.002 0 0 1 2.004 0z"/>
                </svg>
            </div>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertBox);

    // 強制重繪以觸發CSS過渡效果
    setTimeout(() => {
        alertBox.style.top = '5%'; // 彈入效果
    }, 10);

    // 設置自動消失
    setTimeout(() => {
        alertBox.style.opacity = '0'; // 透明度漸變消失
        alertBox.style.top = '0'; // 上移效果
        setTimeout(() => {
            alertBox.remove(); // 完全消失後移除元素
        }, 1000); // 確保動畫完成後移除元素
    }, 3000); // 3秒後自動消失
}
