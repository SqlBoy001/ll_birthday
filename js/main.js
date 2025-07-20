/**
 * =============================================================================
 * 菱菱生日祝福网页 - 主JavaScript文件
 * 作者: 爱你的人
 * 创建时间: 2025年
 * 描述: 应用核心逻辑、事件处理和功能协调
 * =============================================================================
 */

'use strict';

// 全局应用对象
window.BirthdayApp = (function() {
    
    // 私有变量
    let isInitialized = false;
    let currentScene = 'loading';
    let isMobile = false;
    let isLowPowerMode = false;
    
    // DOM元素缓存
    const elements = {};
    
    // 配置对象
    const config = {
        loadingDuration: 3000,
        autoplay: true,
        effectsEnabled: true,
        musicEnabled: true,
        lightsEnabled: true,
        particleCount: isMobile ? 50 : 100,
        animationSpeed: 1,
        debugMode: false
    };
    
    // 状态对象
    const state = {
        isLoading: true,
        isWelcomeScreen: false,
        isMainContent: false,
        musicPlaying: false,
        effectsActive: true,
        lightsOn: true,
        interactionCount: 0
    };
    
    /**
     * 初始化应用
     */
    function init() {
        if (isInitialized) return;
        
        console.log('🎂 菱菱生日祝福网页正在初始化...');
        
        // 检测设备类型
        detectDevice();
        
        // 缓存DOM元素
        cacheElements();
        
        // 绑定事件监听器
        bindEvents();
        
        // 初始化各个模块
        initModules();
        
        // 开始加载流程
        startLoadingSequence();
        
        isInitialized = true;
        
        console.log('✨ 应用初始化完成！');
    }
    
    /**
     * 检测设备类型和性能
     */
    function detectDevice() {
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 检测网络连接
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');
            }
        }
        
        // 检测电池状态（如果支持）
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                if (battery.level < 0.2) {
                    isLowPowerMode = true;
                    document.body.classList.add('power-save-mode');
                }
            });
        }
        
        // 移动端特殊处理
        if (isMobile) {
            document.body.classList.add('mobile-device');
            config.particleCount = 30;
        }
        
        console.log('📱 设备检测:', { isMobile, isLowPowerMode });
    }
    
    /**
     * 缓存DOM元素
     */
    function cacheElements() {
        elements.loadingScreen = document.getElementById('loading-screen');
        elements.welcomeScreen = document.getElementById('welcome-screen');
        elements.mainContent = document.getElementById('main-content');
        elements.enterBtn = document.getElementById('enter-btn');
        elements.lightsToggle = document.getElementById('lights-toggle');
        elements.musicToggle = document.getElementById('music-toggle');
        elements.effectsToggle = document.getElementById('effects-toggle');
        elements.musicPlayer = document.getElementById('music-player');
        elements.playPauseBtn = document.getElementById('play-pause-btn');
        elements.volumeSlider = document.getElementById('volume-slider');
        elements.backgroundMusic = document.getElementById('background-music');
        elements.particlesCanvas = document.getElementById('particles-canvas');
        elements.balloonsContainer = document.getElementById('balloons-container');
        elements.starsContainer = document.getElementById('stars-container');
        elements.confettiContainer = document.getElementById('confetti-container');
        elements.mainTitle = document.getElementById('main-title');
        elements.wishesText = document.getElementById('wishes-text');
        elements.birthdayDate = document.querySelector('.birthday-date');
        
        console.log('💾 DOM元素缓存完成');
    }
    
    /**
     * 绑定事件监听器
     */
    function bindEvents() {
        // 进入按钮
        if (elements.enterBtn) {
            elements.enterBtn.addEventListener('click', handleEnterClick);
        }
        
        // 控制按钮
        if (elements.lightsToggle) {
            elements.lightsToggle.addEventListener('click', toggleLights);
        }
        
        if (elements.musicToggle) {
            elements.musicToggle.addEventListener('click', toggleMusic);
        }
        
        if (elements.effectsToggle) {
            elements.effectsToggle.addEventListener('click', toggleEffects);
        }
        
        // 音乐播放器
        if (elements.playPauseBtn) {
            elements.playPauseBtn.addEventListener('click', togglePlayPause);
        }
        
        if (elements.volumeSlider) {
            elements.volumeSlider.addEventListener('input', handleVolumeChange);
        }
        
        // 游戏触发器
        const gameTriggers = document.querySelectorAll('.game-trigger');
        gameTriggers.forEach(trigger => {
            trigger.addEventListener('click', handleGameTrigger);
        });
        
        // 全局事件
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 粒子效果触发
        if (elements.particlesCanvas) {
            elements.particlesCanvas.addEventListener('click', triggerFirework);
            if (isMobile) {
                elements.particlesCanvas.addEventListener('touchstart', triggerFirework);
            }
        }
        
        console.log('🎯 事件监听器绑定完成');
    }
    
    /**
     * 初始化各个模块
     */
    function initModules() {
        // 初始化粒子系统
        if (window.ParticleSystem && elements.particlesCanvas) {
            window.ParticleSystem.init(elements.particlesCanvas, {
                maxParticles: config.particleCount,
                enableFireworks: true,
                enableHearts: true,
                enableBubbles: true
            });
        }
        
        // 初始化音频系统
        if (window.AudioManager) {
            window.AudioManager.init({
                backgroundMusic: elements.backgroundMusic,
                autoplay: config.autoplay,
                volume: 0.7
            });
        }
        
        // 初始化移动端特性
        if (window.MobileManager && isMobile) {
            window.MobileManager.init();
        }
        
        // 创建背景装饰
        createBackgroundDecorations();
        
        console.log('🎨 模块初始化完成');
    }
    
    /**
     * 开始加载序列
     */
    function startLoadingSequence() {
        if (!elements.loadingScreen) return;
        
        // 更新进度条
        const progressBar = elements.loadingScreen.querySelector('.progress-bar');
        if (progressBar) {
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        }
        
        // 模拟资源加载
        const loadingPromises = [
            preloadImages(),
            preloadAudio(),
            initializeComponents()
        ];
        
        Promise.all(loadingPromises).then(() => {
            setTimeout(() => {
                hideLoadingScreen();
            }, config.loadingDuration);
        }).catch(error => {
            console.error('❌ 加载过程中出现错误:', error);
            hideLoadingScreen(); // 即使出错也要继续
        });
    }
    
    /**
     * 预加载图片
     */
    function preloadImages() {
        return new Promise((resolve) => {
            // 暂时跳过图片预加载，因为我们使用emoji而不是图片
            console.log('📸 跳过图片预加载 - 使用emoji图标');
            resolve();
        });
    }
    
    /**
     * 预加载音频
     */
    function preloadAudio() {
        return new Promise((resolve) => {
            // 暂时跳过音频预加载，用户可以手动播放
            console.log('🎵 跳过音频预加载');
            resolve();
        });
    }
    
    /**
     * 初始化组件
     */
    function initializeComponents() {
        return new Promise((resolve) => {
            // 创建生日蛋糕
            createBirthdayCake();
            
            // 设置初始状态
            setupInitialStates();
            
            resolve();
        });
    }
    
    /**
     * 隐藏加载屏幕
     */
    function hideLoadingScreen() {
        if (!elements.loadingScreen) return;
        
        elements.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
            showWelcomeScreen();
        }, 500);
        
        state.isLoading = false;
        currentScene = 'welcome';
    }
    
    /**
     * 显示欢迎屏幕
     */
    function showWelcomeScreen() {
        if (!elements.welcomeScreen) return;
        
        elements.welcomeScreen.classList.remove('hidden');
        
        // 添加装饰动画
        createWelcomeDecorations();
        
        state.isWelcomeScreen = true;
        console.log('🎪 欢迎屏幕已显示');
    }
    
    /**
     * 创建欢迎屏幕装饰
     */
    function createWelcomeDecorations() {
        const decorationsContainer = elements.welcomeScreen.querySelector('.welcome-decorations');
        if (!decorationsContainer) return;
        
        // 创建飘浮的心形
        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '💕';
            heart.style.position = 'absolute';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = Math.random() * 100 + '%';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            heart.style.opacity = Math.random() * 0.7 + 0.3;
            heart.style.animation = `heartFloat ${3 + Math.random() * 4}s ease-in-out infinite`;
            heart.style.animationDelay = Math.random() * 2 + 's';
            
            decorationsContainer.appendChild(heart);
        }
    }
    
    /**
     * 处理进入按钮点击
     */
    function handleEnterClick(e) {
        e.preventDefault();
        
        // 按钮点击动画
        elements.enterBtn.classList.add('animate-buttonPress');
        setTimeout(() => {
            elements.enterBtn.classList.remove('animate-buttonPress');
        }, 200);
        
        // 切换到主内容
        showMainContent();
        
        // 增加交互计数
        state.interactionCount++;
    }
    
    /**
     * 显示主要内容
     */
    function showMainContent() {
        if (!elements.mainContent) return;
        
        // 隐藏欢迎屏幕
        elements.welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            elements.welcomeScreen.style.display = 'none';
        }, 500);
        
        // 显示主内容
        setTimeout(() => {
            elements.mainContent.classList.remove('hidden');
            startMainContentAnimations();
        }, 300);
        
        state.isWelcomeScreen = false;
        state.isMainContent = true;
        currentScene = 'main';
        
        console.log('🎉 主内容已显示');
    }
    
    /**
     * 开始主内容动画
     */
    function startMainContentAnimations() {
        // 标题动画
        if (elements.mainTitle) {
            setTimeout(() => {
                elements.mainTitle.classList.add('animate-fadeInUp');
            }, 200);
        }
        
        // 祝福文字动画
        if (elements.wishesText) {
            const wishLines = elements.wishesText.querySelectorAll('.wish-line');
            wishLines.forEach((line, index) => {
                const delay = parseInt(line.dataset.delay) || (index * 1000);
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                    line.style.transition = 'all 1s ease-out';
                }, delay);
            });
        }
        
        // 生日日期特效
        if (elements.birthdayDate) {
            setTimeout(() => {
                elements.birthdayDate.classList.add('animate-textGlow');
            }, 1500);
        }
        
        // 启动背景效果
        startBackgroundEffects();
        
        // 自动播放音乐（如果用户之前有交互）
        if (state.interactionCount > 0 && config.musicEnabled) {
            setTimeout(() => {
                tryAutoplayMusic();
            }, 2000);
        }
    }
    
    /**
     * 尝试自动播放音乐
     */
    function tryAutoplayMusic() {
        if (window.AudioManager && elements.backgroundMusic) {
            window.AudioManager.play().then(() => {
                updateMusicButton(true);
                state.musicPlaying = true;
            }).catch(error => {
                console.log('🔇 自动播放被阻止，等待用户交互');
            });
        }
    }
    
    /**
     * 创建背景装饰
     */
    function createBackgroundDecorations() {
        createBalloons();
        createStars();
        createConfetti();
    }
    
    /**
     * 创建气球
     */
    function createBalloons() {
        if (!elements.balloonsContainer) return;
        
        const balloonCount = isMobile ? 5 : 8;
        const balloonTypes = ['pink', 'gold', 'blue', 'purple', 'red'];
        const balloonEmojis = ['🎈', '🎀', '🎊', '🎉'];
        
        for (let i = 0; i < balloonCount; i++) {
            const balloon = document.createElement('div');
            const colorType = balloonTypes[Math.floor(Math.random() * balloonTypes.length)];
            const emoji = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
            
            balloon.className = `balloon ${colorType}`;
            balloon.innerHTML = emoji;
            balloon.style.left = Math.random() * 85 + 5 + '%';
            balloon.style.top = Math.random() * 70 + 15 + '%';
            balloon.style.fontSize = (Math.random() * 1 + 1.5) + 'rem';
            
            // 随机动画组合
            const animationDuration = 3 + Math.random() * 4;
            const animationDelay = Math.random() * 3;
            
            if (Math.random() > 0.5) {
                balloon.classList.add('animate-special');
            } else {
                balloon.style.animation = `balloonFloat ${animationDuration}s ease-in-out infinite`;
            }
            balloon.style.animationDelay = animationDelay + 's';
            
            // 添加点击事件
            balloon.addEventListener('click', (e) => {
                handleBalloonClick(e, balloon);
            });
            
            elements.balloonsContainer.appendChild(balloon);
        }
        
        console.log(`🎈 创建了 ${balloonCount} 个气球`);
    }
    
    /**
     * 创建星星
     */
    function createStars() {
        if (!elements.starsContainer) return;
        
        const starCount = isMobile ? 15 : 25;
        const starSizes = ['small', 'medium', 'large'];
        const starEmojis = ['⭐', '✨', '🌟', '💫', '🌙'];
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            const sizeClass = starSizes[Math.floor(Math.random() * starSizes.length)];
            const emoji = starEmojis[Math.floor(Math.random() * starEmojis.length)];
            
            star.className = `star ${sizeClass}`;
            star.innerHTML = emoji;
            star.style.left = Math.random() * 95 + '%';
            star.style.top = Math.random() * 95 + '%';
            
            // 动画设置
            const animationDuration = 2 + Math.random() * 4;
            const animationDelay = Math.random() * 5;
            
            if (Math.random() > 0.7) {
                star.classList.add('animate-special');
            } else {
                star.style.animation = `starTwinkle ${animationDuration}s infinite`;
            }
            star.style.animationDelay = animationDelay + 's';
            
            // 添加点击事件
            star.addEventListener('click', (e) => {
                handleStarClick(e, star);
            });
            
            elements.starsContainer.appendChild(star);
        }
        
        console.log(`⭐ 创建了 ${starCount} 颗星星`);
    }
    
    /**
     * 创建彩带
     */
    function createConfetti() {
        if (!elements.confettiContainer || isLowPowerMode) return;
        
        const confettiCount = isMobile ? 8 : 12;
        const confettiTypes = ['pink', 'gold', 'blue', 'purple', 'red'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const colorType = confettiTypes[Math.floor(Math.random() * confettiTypes.length)];
            
            confetti.className = `confetti ${colorType}`;
            confetti.style.left = Math.random() * 95 + '%';
            confetti.style.top = '-20px';
            
            // 随机尺寸
            const width = 6 + Math.random() * 8;
            const height = 10 + Math.random() * 10;
            confetti.style.width = width + 'px';
            confetti.style.height = height + 'px';
            
            // 动画设置
            const fallDuration = 3 + Math.random() * 5;
            const animationDelay = Math.random() * 8;
            const rotationSpeed = 360 + Math.random() * 720;
            
            confetti.style.animation = `confettiFall ${fallDuration}s linear infinite`;
            confetti.style.animationDelay = animationDelay + 's';
            
            // 添加旋转动画
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            elements.confettiContainer.appendChild(confetti);
        }
        
        console.log(`🎊 创建了 ${confettiCount} 个彩带`);
    }
    
    /**
     * 创建生日蛋糕
     */
    function createBirthdayCake() {
        const cakeContainer = document.querySelector('.cake-container');
        if (!cakeContainer) return;
        
        // 创建蛋糕HTML结构
        cakeContainer.innerHTML = `
            <div class="cake-3d">
                <div class="cake-layer cake-bottom">
                    <div class="cake-top"></div>
                    <div class="cake-side"></div>
                </div>
                <div class="cake-layer cake-top">
                    <div class="cake-top"></div>
                    <div class="cake-side"></div>
                </div>
                <div class="candles-container">
                    ${createCandles()}
                </div>
                <div class="cake-decorations">
                    <div class="decoration">🌹</div>
                    <div class="decoration">🍓</div>
                    <div class="decoration">🌹</div>
                </div>
            </div>
        `;
        
        // 添加点击事件
        const candles = cakeContainer.querySelectorAll('.candle');
        candles.forEach(candle => {
            candle.addEventListener('click', lightCandle);
        });
        
        // 蛋糕出现动画
        setTimeout(() => {
            cakeContainer.querySelector('.cake-3d').classList.add('animate-cakeAppear');
        }, 500);
    }
    
    /**
     * 创建蜡烛
     */
    function createCandles() {
        const candleCount = 5; // 可以根据需要调整
        let candlesHTML = '';
        
        for (let i = 0; i < candleCount; i++) {
            const angle = (360 / candleCount) * i;
            candlesHTML += `
                <div class="candle" data-angle="${angle}">
                    <div class="candle-body"></div>
                    <div class="candle-flame hidden"></div>
                </div>
            `;
        }
        
        return candlesHTML;
    }
    
    /**
     * 点燃蜡烛
     */
    function lightCandle(e) {
        const candle = e.currentTarget;
        const flame = candle.querySelector('.candle-flame');
        
        if (flame && flame.classList.contains('hidden')) {
            flame.classList.remove('hidden');
            flame.classList.add('animate-candleLight');
            
            // 触发粒子效果
            if (window.ParticleSystem) {
                const rect = candle.getBoundingClientRect();
                window.ParticleSystem.createSparkles(rect.left + rect.width/2, rect.top);
            }
            
            // 检查是否所有蜡烛都点燃了
            checkAllCandlesLit();
        }
    }
    
    /**
     * 检查所有蜡烛是否都点燃了
     */
    function checkAllCandlesLit() {
        const candles = document.querySelectorAll('.candle');
        const litCandles = document.querySelectorAll('.candle .candle-flame:not(.hidden)');
        
        if (candles.length === litCandles.length) {
            // 所有蜡烛都点燃了，播放特殊效果
            setTimeout(() => {
                showBirthdayMessage();
            }, 1000);
        }
    }
    
    /**
     * 显示生日祝福消息
     */
    function showBirthdayMessage() {
        // 创建特殊的祝福消息
        const message = document.createElement('div');
        message.className = 'birthday-message';
        message.innerHTML = `
            <h2>🎂 许个愿吧，菱菱！ 🎂</h2>
            <p>愿你的每一个愿望都能实现</p>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 105, 180, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 1s ease-out;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '1';
        }, 100);
        
        // 3秒后自动消失
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 1000);
        }, 3000);
        
        // 触发烟花效果
        if (window.ParticleSystem) {
            window.ParticleSystem.createCelebration();
        }
    }
    
    /**
     * 启动背景效果
     */
    function startBackgroundEffects() {
        if (!config.effectsEnabled) return;
        
        // 启动粒子系统
        if (window.ParticleSystem) {
            window.ParticleSystem.start();
        }
        
        // 添加装饰动画类
        if (elements.balloonsContainer) {
            const balloons = elements.balloonsContainer.querySelectorAll('.balloon');
            balloons.forEach(balloon => {
                balloon.classList.add('animate-balloonFloat');
            });
        }
        
        if (elements.starsContainer) {
            const stars = elements.starsContainer.querySelectorAll('.star');
            stars.forEach(star => {
                star.classList.add('animate-starTwinkle');
            });
        }
    }
    
    /**
     * 触发烟花效果
     */
    function triggerFirework(e) {
        if (!window.ParticleSystem || !config.effectsEnabled) return;
        
        const rect = elements.particlesCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        window.ParticleSystem.createFirework(x, y);
        
        // 增加交互计数
        state.interactionCount++;
    }
    
    /**
     * 切换灯光
     */
    function toggleLights() {
        state.lightsOn = !state.lightsOn;
        
        if (state.lightsOn) {
            document.body.classList.remove('lights-off');
            elements.lightsToggle.innerHTML = '<span class="btn-icon">💡</span>';
        } else {
            document.body.classList.add('lights-off');
            elements.lightsToggle.innerHTML = '<span class="btn-icon">🌙</span>';
        }
        
        console.log('💡 灯光状态:', state.lightsOn ? '开启' : '关闭');
    }
    
    /**
     * 切换音乐
     */
    function toggleMusic() {
        if (window.AudioManager) {
            if (state.musicPlaying) {
                window.AudioManager.pause();
                state.musicPlaying = false;
            } else {
                window.AudioManager.play().then(() => {
                    state.musicPlaying = true;
                }).catch(error => {
                    console.error('音乐播放失败:', error);
                });
            }
            
            updateMusicButton(state.musicPlaying);
        }
    }
    
    /**
     * 更新音乐按钮状态
     */
    function updateMusicButton(isPlaying) {
        if (elements.musicToggle) {
            elements.musicToggle.innerHTML = `<span class="btn-icon">${isPlaying ? '🎵' : '🔇'}</span>`;
        }
        
        if (elements.playPauseBtn) {
            elements.playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
        }
    }
    
    /**
     * 切换特效
     */
    function toggleEffects() {
        config.effectsEnabled = !config.effectsEnabled;
        state.effectsActive = config.effectsEnabled;
        
        if (config.effectsEnabled) {
            startBackgroundEffects();
            elements.effectsToggle.innerHTML = '<span class="btn-icon">✨</span>';
        } else {
            stopBackgroundEffects();
            elements.effectsToggle.innerHTML = '<span class="btn-icon">⭕</span>';
        }
        
        console.log('✨ 特效状态:', config.effectsEnabled ? '开启' : '关闭');
    }
    
    /**
     * 停止背景效果
     */
    function stopBackgroundEffects() {
        if (window.ParticleSystem) {
            window.ParticleSystem.stop();
        }
        
        // 移除动画类
        const animatedElements = document.querySelectorAll('.animate-balloonFloat, .animate-starTwinkle');
        animatedElements.forEach(el => {
            el.classList.add('animate-paused');
        });
    }
    
    /**
     * 切换播放/暂停
     */
    function togglePlayPause() {
        toggleMusic();
    }
    
    /**
     * 处理音量变化
     */
    function handleVolumeChange(e) {
        const volume = parseFloat(e.target.value);
        if (window.AudioManager) {
            window.AudioManager.setVolume(volume);
        }
        
        // 更新音量按钮图标
        if (elements.volumeBtn) {
            let icon = '🔊';
            if (volume === 0) icon = '🔇';
            else if (volume < 0.5) icon = '🔉';
            
            elements.volumeBtn.textContent = icon;
        }
    }
    
    /**
     * 处理游戏触发
     */
    function handleGameTrigger(e) {
        const gameType = e.currentTarget.parentElement.className;
        
        switch (true) {
            case gameType.includes('surprise-box'):
                openSurpriseBox();
                break;
            case gameType.includes('balloon-game'):
                startBalloonGame();
                break;
            case gameType.includes('memory-game'):
                startMemoryGame();
                break;
        }
        
        // 按钮点击动画
        e.currentTarget.classList.add('animate-buttonPress');
        setTimeout(() => {
            e.currentTarget.classList.remove('animate-buttonPress');
        }, 200);
    }
    
    /**
     * 打开惊喜盒子
     */
    function openSurpriseBox() {
        const surprises = [
            '💕 你是我见过最美的女孩',
            '🌟 你的笑容比星星还要闪亮',
            '🌹 每一天和你在一起都是情人节',
            '🎈 愿我们的爱情像气球一样飞得更高',
            '🎂 生日快乐，我的小公主！'
        ];
        
        const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
        showModal('惊喜盒子 🎁', randomSurprise);
        
        // 触发特效
        if (window.ParticleSystem) {
            window.ParticleSystem.createHeartRain();
        }
    }
    
    /**
     * 开始气球游戏
     */
    function startBalloonGame() {
        showModal('气球游戏 🎈', '点击屏幕上的气球来收集它们！每收集一个气球都会有惊喜哦～');
        
        // 创建可点击的气球
        createInteractiveBalloons();
    }
    
    /**
     * 开始记忆游戏
     */
    function startMemoryGame() {
        showModal('记忆翻牌 💝', '翻开卡片找到成对的心形图案！');
        
        // 这里可以实现具体的记忆游戏逻辑
        createMemoryCards();
    }
    
    /**
     * 显示模态框
     */
    function showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                <p>${content}</p>
                <button class="modal-close">确定</button>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-out;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #FF69B4, #FFB6C1);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            max-width: 400px;
            margin: 1rem;
            transform: scale(0.8);
            transition: transform 0.3s ease-out;
        `;
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        `;
        
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 100);
    }
    
    /**
     * 创建可交互的气球
     */
    function createInteractiveBalloons() {
        // 实现可点击收集的气球游戏
        console.log('🎈 启动气球游戏');
    }
    
    /**
     * 创建记忆卡片
     */
    function createMemoryCards() {
        // 实现记忆翻牌游戏
        console.log('💝 启动记忆游戏');
    }
    
    /**
     * 处理气球点击
     */
    function handleBalloonClick(e, balloon) {
        e.stopPropagation();
        
        // 播放音效
        if (window.AudioManager) {
            window.AudioManager.playSceneSound('click');
        }
        
        // 气球爆炸效果
        balloon.style.animation = 'none';
        balloon.style.transform = 'scale(1.5)';
        balloon.style.opacity = '0';
        balloon.style.transition = 'all 0.3s ease-out';
        
        // 创建爆炸粒子
        if (window.ParticleSystem) {
            const rect = balloon.getBoundingClientRect();
            window.ParticleSystem.createFirework(
                rect.left + rect.width / 2, 
                rect.top + rect.height / 2
            );
        }
        
        // 移除气球并创建新的
        setTimeout(() => {
            balloon.remove();
            
            // 50%概率创建新气球
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    createSingleBalloon();
                }, 2000);
            }
        }, 300);
        
        console.log('🎈 气球被点击');
    }
    
    /**
     * 处理星星点击
     */
    function handleStarClick(e, star) {
        e.stopPropagation();
        
        // 播放音效
        if (window.AudioManager) {
            window.AudioManager.playSceneSound('sparkle');
        }
        
        // 星星闪烁效果
        star.style.animation = 'starPulse 0.5s ease-in-out';
        
        // 创建星星粒子
        if (window.ParticleSystem) {
            const rect = star.getBoundingClientRect();
            window.ParticleSystem.createSparkles(
                rect.left + rect.width / 2, 
                rect.top + rect.height / 2
            );
        }
        
        // 临时增大效果
        setTimeout(() => {
            star.style.transform = 'scale(1.5)';
            setTimeout(() => {
                star.style.transform = 'scale(1)';
                star.style.transition = 'transform 0.3s ease-out';
            }, 200);
        }, 100);
        
        console.log('⭐ 星星被点击');
    }
    
    /**
     * 创建单个气球
     */
    function createSingleBalloon() {
        if (!elements.balloonsContainer) return;
        
        const balloonTypes = ['pink', 'gold', 'blue', 'purple', 'red'];
        const balloonEmojis = ['🎈', '🎀', '🎊', '🎉'];
        
        const balloon = document.createElement('div');
        const colorType = balloonTypes[Math.floor(Math.random() * balloonTypes.length)];
        const emoji = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
        
        balloon.className = `balloon ${colorType}`;
        balloon.innerHTML = emoji;
        balloon.style.left = Math.random() * 85 + 5 + '%';
        balloon.style.top = Math.random() * 70 + 15 + '%';
        balloon.style.fontSize = (Math.random() * 1 + 1.5) + 'rem';
        balloon.style.opacity = '0';
        balloon.style.transform = 'scale(0.5)';
        balloon.style.transition = 'all 0.5s ease-out';
        
        // 添加点击事件
        balloon.addEventListener('click', (e) => {
            handleBalloonClick(e, balloon);
        });
        
        elements.balloonsContainer.appendChild(balloon);
        
        // 淡入动画
        setTimeout(() => {
            balloon.style.opacity = '1';
            balloon.style.transform = 'scale(1)';
            balloon.style.animation = `balloonFloat ${3 + Math.random() * 4}s ease-in-out infinite`;
            balloon.style.animationDelay = Math.random() * 2 + 's';
        }, 100);
    }
    
    /**
     * 设置初始状态
     */
    function setupInitialStates() {
        // 设置音量
        if (elements.volumeSlider) {
            elements.volumeSlider.value = 0.7;
        }
        
        // 设置按钮状态
        updateMusicButton(false);
        
        console.log('⚙️ 初始状态设置完成');
    }
    
    /**
     * 处理窗口大小变化
     */
    function handleResize() {
        // 重新调整粒子系统
        if (window.ParticleSystem) {
            window.ParticleSystem.resize();
        }
        
        // 重新检测设备类型
        detectDevice();
    }
    
    /**
     * 处理屏幕方向变化
     */
    function handleOrientationChange() {
        setTimeout(() => {
            handleResize();
        }, 100);
    }
    
    /**
     * 处理页面可见性变化
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // 页面不可见时暂停音乐和动画
            if (window.AudioManager && state.musicPlaying) {
                window.AudioManager.pause();
            }
            if (window.ParticleSystem) {
                window.ParticleSystem.pause();
            }
        } else {
            // 页面可见时恢复
            if (window.AudioManager && state.musicPlaying) {
                window.AudioManager.play();
            }
            if (window.ParticleSystem && config.effectsEnabled) {
                window.ParticleSystem.resume();
            }
        }
    }
    
    /**
     * 公共API
     */
    return {
        init: init,
        toggleMusic: toggleMusic,
        toggleLights: toggleLights,
        toggleEffects: toggleEffects,
        triggerFirework: triggerFirework,
        getState: () => ({ ...state }),
        getConfig: () => ({ ...config }),
        isMobile: () => isMobile,
        
        // 调试方法
        debug: {
            showState: () => console.table(state),
            showConfig: () => console.table(config),
            createFirework: (x, y) => window.ParticleSystem && window.ParticleSystem.createFirework(x || 400, y || 300)
        }
    };
})();

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BirthdayApp.init();
    });
} else {
    window.BirthdayApp.init();
} 