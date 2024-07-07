// \src\helpers\loading.js

export function showLoading() {
    // 創建背景遮罩
    let overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
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

    // 創建loading元素
    let spinner = document.createElement('div');
    spinner.className = 'spinner-border text-light';
    spinner.role = 'status';
    spinner.style.width = '3rem';
    spinner.style.height = '3rem';

    let spinnerText = document.createElement('span');
    spinnerText.className = 'sr-only';
    spinnerText.innerText = 'Loading...';

    spinner.appendChild(spinnerText);
    overlay.appendChild(spinner);

    document.body.appendChild(overlay);
}

export function hideLoading() {
    let overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}
