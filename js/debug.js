// 调试脚本 - 强制显示所有内容
console.log('🔧 调试模式激活');

// 等待DOM加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugMode);
} else {
    initDebugMode();
}

function initDebugMode() {
    console.log('🔧 开始调试初始化');
    
    // 检查所有关键元素
    const elements = {
        loadingScreen: document.getElementById('loading-screen'),
        welcomeScreen: document.getElementById('welcome-screen'),
        mainContent: document.getElementById('main-content'),
        enterBtn: document.getElementById('enter-btn')
    };
    
    console.log('🔧 元素检查:', elements);
    
    // 强制隐藏加载屏幕
    if (elements.loadingScreen) {
        elements.loadingScreen.style.display = 'none';
        elements.loadingScreen.style.opacity = '0';
        elements.loadingScreen.style.visibility = 'hidden';
        elements.loadingScreen.style.pointerEvents = 'none';
        elements.loadingScreen.classList.add('hidden');
        console.log('✅ 隐藏了加载屏幕');
    }
    
    // 强制显示欢迎屏幕
    if (elements.welcomeScreen) {
        elements.welcomeScreen.classList.remove('hidden');
        elements.welcomeScreen.style.display = 'flex';
        elements.welcomeScreen.style.opacity = '1';
        console.log('✅ 显示了欢迎屏幕');
    }
    
    // 为进入按钮添加事件
    if (elements.enterBtn) {
        elements.enterBtn.addEventListener('click', () => {
            console.log('🔧 进入按钮被点击');
            
            // 隐藏欢迎屏幕
            if (elements.welcomeScreen) {
                elements.welcomeScreen.style.display = 'none';
            }
            
            // 显示主内容
            if (elements.mainContent) {
                elements.mainContent.classList.remove('hidden');
                elements.mainContent.style.display = 'block';
                elements.mainContent.style.opacity = '1';
                console.log('✅ 显示了主内容');
                
                // 创建装饰元素
                createSimpleDecorations();
            }
        });
        console.log('✅ 绑定了进入按钮事件');
    } else {
        console.error('❌ 找不到进入按钮');
    }
    
    console.log('🔧 调试初始化完成');
    
    // 检查音频状态
    checkAudioStatus();
}

function checkAudioStatus() {
    console.log('🎵 检查音频状态...');
    
    // 检查音效文件
    const effectsToCheck = ['click', 'pop', 'sparkle', 'bell', 'chime'];
    const audioPromises = effectsToCheck.map(effect => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', () => resolve({ effect, available: true }));
            audio.addEventListener('error', () => resolve({ effect, available: false }));
            audio.src = `assets/audio/effects/${effect}.mp3`;
        });
    });
    
    Promise.all(audioPromises).then(results => {
        const availableEffects = results.filter(r => r.available).map(r => r.effect);
        const missingEffects = results.filter(r => !r.available).map(r => r.effect);
        
        if (availableEffects.length > 0) {
            console.log('✅ 可用音效:', availableEffects);
        }
        
        if (missingEffects.length > 0) {
            console.log('ℹ️ 缺失音效（可选）:', missingEffects);
            console.log('💡 提示：您可以将音效文件放在 assets/audio/effects/ 目录中');
        }
        
        console.log('🎵 音频检查完成');
    });
}

function createSimpleDecorations() {
    console.log('🔧 创建简单装饰');
    
    // 创建气球
    const balloonsContainer = document.getElementById('balloons-container');
    if (balloonsContainer) {
        for (let i = 0; i < 5; i++) {
            const balloon = document.createElement('div');
            balloon.innerHTML = '🎈';
            balloon.style.position = 'absolute';
            balloon.style.left = Math.random() * 80 + 10 + '%';
            balloon.style.top = Math.random() * 60 + 20 + '%';
            balloon.style.fontSize = '2rem';
            balloon.style.animation = 'balloonFloat 3s ease-in-out infinite';
            balloon.style.animationDelay = Math.random() * 2 + 's';
            balloonsContainer.appendChild(balloon);
        }
        console.log('✅ 创建了气球');
    }
    
    // 创建星星
    const starsContainer = document.getElementById('stars-container');
    if (starsContainer) {
        for (let i = 0; i < 10; i++) {
            const star = document.createElement('div');
            star.innerHTML = '⭐';
            star.style.position = 'absolute';
            star.style.left = Math.random() * 90 + '%';
            star.style.top = Math.random() * 90 + '%';
            star.style.fontSize = '1rem';
            star.style.animation = 'starTwinkle 2s infinite';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
        console.log('✅ 创建了星星');
    }
} 