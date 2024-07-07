// \src\helpers\waveGradient.js

export function addWaveGradientBorder(scene, color = 0x00ff00) { // 默認顏色為綠色
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const thickness = 50; // 漸層的厚度
    scene.gradient = scene.add.graphics({ x: 0, y: 0 });
    scene.gradient.setDepth(-1); // 確保在最底層
    
    const maxWaveHeight = 30; // 波浪的最大高度，增加延伸幅度
    const waveSpeed = 500; // 波浪的速度，增加動畫速度
    console.log('DEBUG-COLOR', color);
    
    // 繪製初始漸層邊框
    for (let i = 0; i < thickness; i++) {
        let alpha = 1 - (i / thickness);
        
        // 上邊
        scene.gradient.fillStyle(color, alpha); // 使用參數顏色
        scene.gradient.fillRect(0, i, width, 1);
        
        // 下邊
        scene.gradient.fillStyle(color, alpha); // 使用參數顏色
        scene.gradient.fillRect(0, height - i, width, 1);
        
        // 左邊
        scene.gradient.fillStyle(color, alpha); // 使用參數顏色
        scene.gradient.fillRect(i, 0, 1, height);
        
        // 右邊
        scene.gradient.fillStyle(color, alpha); // 使用參數顏色
        scene.gradient.fillRect(width - i, 0, 1, height);
    }

    // 創建波浪動畫
    scene.waveTween = scene.tweens.add({
        targets: scene.gradient,
        duration: waveSpeed,
        repeat: -1,
        yoyo: true,
        onUpdate: (tween) => {
            const waveHeight = Math.sin(tween.progress * Math.PI) * maxWaveHeight;
            scene.gradient.clear();
            
            for (let i = 0; i < thickness; i++) {
                let alpha = 1 - (i / thickness);
                let waveOffset = Math.sin((i / thickness) * Math.PI * 2 + tween.progress * Math.PI * 2) * waveHeight;
                
                // 上邊
                scene.gradient.fillStyle(color, alpha); // 使用參數顏色
                scene.gradient.fillRect(0, i + waveOffset, width, 1);
                
                // 下邊
                scene.gradient.fillStyle(color, alpha); // 使用參數顏色
                scene.gradient.fillRect(0, height - i - waveOffset, width, 1);
                
                // 左邊
                scene.gradient.fillStyle(color, alpha); // 使用參數顏色
                scene.gradient.fillRect(i + waveOffset, 0, 1, height);
                
                // 右邊
                scene.gradient.fillStyle(color, alpha); // 使用參數顏色
                scene.gradient.fillRect(width - i - waveOffset, 0, 1, height);
            }
        }
    });

    console.log("Wave tween created: ", scene.waveTween);
    // 設置透明度
    scene.gradient.setAlpha(0.7);
}

export function toggleGradientBorder(scene, visible, color = 0x00ff00) { // 默認顏色為綠色
    if (visible) {
        if (scene.gradient) {
            scene.gradient.destroy(); // 刪除舊的 gradient
            if (scene.waveTween) {
                scene.waveTween.stop(); // 停止舊的 waveTween
            }
        }
        addWaveGradientBorder(scene, color); // 重新設置新的 gradient
        scene.gradient.setVisible(true);
        if (scene.waveTween) {
            try {
                scene.waveTween.resume();
            } catch (error) {
                console.error('Failed to resume waveTween:', error);
            } 
        }
    } else {
        if (scene.gradient) {
            scene.gradient.setVisible(false); 
            if (scene.waveTween) {
                try {
                    scene.waveTween.pause();
                } catch (error) {
                    console.error('Failed to pause waveTween:', error);
                }
            }
        }
    }
    scene.gradientVisible = visible;
}

export function changeGradientColor(scene, newColor) {
    if (scene.gradient) {
        scene.gradient.destroy(); // 刪除舊的 gradient
        addWaveGradientBorder(scene, newColor); // 重新設置顏色
    }
}
