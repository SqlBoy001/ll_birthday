/**
 * =============================================================================
 * 菱菱生日祝福网页 - 移动端特性管理
 * 作者: 爱你的人
 * 创建时间: 2025年
 * 描述: 处理移动端特有功能，包括触摸手势、设备传感器和性能优化
 * =============================================================================
 */

'use strict';

window.MobileManager = (function() {
    
    // 私有变量
    let isInitialized = false;
    let orientationAngle = 0;
    let deviceMotionEnabled = false;
    let vibrationSupported = false;
    let touchSupported = false;
    
    // 触摸状态
    const touchState = {
        isLongPress: false,
        longPressTimer: null,
        startTime: 0,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    };
    
    // 手势配置
    const gestureConfig = {
        longPressDuration: 800,
        swipeThreshold: 100,
        tapThreshold: 10,
        doubleTapDelay: 300,
        pinchThreshold: 0.1
    };
    
    // 设备信息
    const deviceInfo = {
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        hasNotch: false,
        pixelRatio: 1
    };
    
    /**
     * 初始化移动端管理器
     */
    function init() {
        if (isInitialized) return;
        
        console.log('📱 移动端管理器初始化...');
        
        // 检测设备信息
        detectDevice();
        
        // 检测功能支持
        detectCapabilities();
        
        // 设置视口
        setupViewport();
        
        // 绑定触摸事件
        bindTouchEvents();
        
        // 绑定设备事件
        bindDeviceEvents();
        
        // 优化性能
        optimizePerformance();
        
        isInitialized = true;
        
        console.log('✅ 移动端管理器初始化完成');
    }
    
    /**
     * 检测设备信息
     */
    function detectDevice() {
        const userAgent = navigator.userAgent;
        
        deviceInfo.isIOS = /iPad|iPhone|iPod/.test(userAgent);
        deviceInfo.isAndroid = /Android/.test(userAgent);
        deviceInfo.isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        deviceInfo.isChrome = /Chrome/.test(userAgent);
        deviceInfo.pixelRatio = window.devicePixelRatio || 1;
        
        // 检测刘海屏
        if (deviceInfo.isIOS) {
            const safePadding = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('env(safe-area-inset-top)')) || 0;
            deviceInfo.hasNotch = safePadding > 20;
        }
        
        // 添加设备类名
        document.body.classList.add(deviceInfo.isIOS ? 'ios-device' : 'android-device');
        if (deviceInfo.hasNotch) {
            document.body.classList.add('has-notch');
        }
        
        console.log('📱 设备信息:', deviceInfo);
    }
    
    /**
     * 检测功能支持
     */
    function detectCapabilities() {
        // 检测触摸支持
        touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 检测振动支持
        vibrationSupported = 'vibrate' in navigator;
        
        // 检测设备动作支持
        deviceMotionEnabled = 'DeviceMotionEvent' in window;
        
        console.log('🔍 功能支持:', {
            touch: touchSupported,
            vibration: vibrationSupported,
            deviceMotion: deviceMotionEnabled
        });
    }
    
    /**
     * 设置视口
     */
    function setupViewport() {
        // 防止缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
        
        // 设置状态栏样式（iOS）
        if (deviceInfo.isIOS) {
            const statusBarMeta = document.createElement('meta');
            statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
            statusBarMeta.content = 'black-translucent';
            document.head.appendChild(statusBarMeta);
        }
        
        // 监听视口变化
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('orientationchange', handleOrientationChange);
    }
    
    /**
     * 绑定触摸事件
     */
    function bindTouchEvents() {
        if (!touchSupported) return;
        
        // 全局触摸事件
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: false });
        document.addEventListener('touchcancel', handleTouchCancel, { passive: false });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        console.log('👆 触摸事件绑定完成');
    }
    
    /**
     * 绑定设备事件
     */
    function bindDeviceEvents() {
        // 设备方向事件
        if ('orientation' in window) {
            window.addEventListener('orientationchange', handleOrientationChange);
        }
        
        // 设备动作事件
        if (deviceMotionEnabled) {
            // 请求权限（iOS 13+）
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                // 延迟请求，等待用户交互
                document.addEventListener('click', requestMotionPermission, { once: true });
            } else {
                // 直接绑定
                window.addEventListener('devicemotion', handleDeviceMotion);
                window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
        }
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        console.log('📟 设备事件绑定完成');
    }
    
    /**
     * 请求设备动作权限
     */
    function requestMotionPermission() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleDeviceMotion);
                    window.addEventListener('deviceorientation', handleDeviceOrientation);
                    console.log('✅ 设备动作权限已获得');
                }
            }).catch(error => {
                console.warn('⚠️ 设备动作权限被拒绝:', error);
            });
        }
    }
    
    /**
     * 处理触摸开始
     */
    function handleTouchStart(e) {
        const touch = e.touches[0];
        
        touchState.startTime = Date.now();
        touchState.startX = touch.clientX;
        touchState.startY = touch.clientY;
        touchState.currentX = touch.clientX;
        touchState.currentY = touch.clientY;
        touchState.isLongPress = false;
        
        // 设置长按计时器
        touchState.longPressTimer = setTimeout(() => {
            touchState.isLongPress = true;
            handleLongPress(touch);
        }, gestureConfig.longPressDuration);
        
        // 阻止默认行为（如果需要）
        if (shouldPreventDefault(e.target)) {
            e.preventDefault();
        }
    }
    
    /**
     * 处理触摸移动
     */
    function handleTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchState.currentX = touch.clientX;
            touchState.currentY = touch.clientY;
            
            const deltaX = Math.abs(touch.clientX - touchState.startX);
            const deltaY = Math.abs(touch.clientY - touchState.startY);
            
            // 如果移动距离超过阈值，取消长按
            if (deltaX > gestureConfig.tapThreshold || deltaY > gestureConfig.tapThreshold) {
                clearTimeout(touchState.longPressTimer);
            }
            
            // 检测滑动
            if (deltaX > gestureConfig.swipeThreshold || deltaY > gestureConfig.swipeThreshold) {
                handleSwipe(touch);
            }
        } else if (e.touches.length === 2) {
            // 处理双指操作（缩放、旋转）
            handlePinch(e.touches);
        }
        
        if (shouldPreventDefault(e.target)) {
            e.preventDefault();
        }
    }
    
    /**
     * 处理触摸结束
     */
    function handleTouchEnd(e) {
        clearTimeout(touchState.longPressTimer);
        
        const touchDuration = Date.now() - touchState.startTime;
        const deltaX = Math.abs(touchState.currentX - touchState.startX);
        const deltaY = Math.abs(touchState.currentY - touchState.startY);
        
        // 判断是否为点击
        if (!touchState.isLongPress && 
            touchDuration < gestureConfig.longPressDuration &&
            deltaX < gestureConfig.tapThreshold && 
            deltaY < gestureConfig.tapThreshold) {
            handleTap(e.changedTouches[0]);
        }
        
        // 重置状态
        touchState.isLongPress = false;
    }
    
    /**
     * 处理触摸取消
     */
    function handleTouchCancel(e) {
        clearTimeout(touchState.longPressTimer);
        touchState.isLongPress = false;
    }
    
    /**
     * 处理点击
     */
    function handleTap(touch) {
        // 触发点击音效
        if (window.AudioManager) {
            window.AudioManager.playSceneSound('click');
        }
        
        // 轻微振动反馈
        vibrate([10]);
        
        // 触发粒子效果
        if (window.ParticleSystem) {
            window.ParticleSystem.createSparkles(touch.clientX, touch.clientY);
        }
        
        // 分发自定义事件
        dispatchCustomEvent('mobiletap', {
            x: touch.clientX,
            y: touch.clientY
        });
    }
    
    /**
     * 处理长按
     */
    function handleLongPress(touch) {
        // 强振动反馈
        vibrate([50, 50, 50]);
        
        // 触发特殊效果
        if (window.ParticleSystem) {
            window.ParticleSystem.createHeartRain();
        }
        
        // 播放特殊音效
        if (window.AudioManager) {
            window.AudioManager.playSceneSound('surprise');
        }
        
        // 分发自定义事件
        dispatchCustomEvent('longpress', {
            x: touch.clientX,
            y: touch.clientY
        });
        
        console.log('👆 长按触发');
    }
    
    /**
     * 处理滑动
     */
    function handleSwipe(touch) {
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        
        let direction = '';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        // 根据滑动方向执行不同操作
        switch (direction) {
            case 'left':
                // 切换到下一首音乐
                if (window.AudioManager) {
                    window.AudioManager.nextTrack();
                }
                break;
            case 'right':
                // 切换到上一首音乐
                if (window.AudioManager) {
                    window.AudioManager.previousTrack();
                }
                break;
            case 'up':
                // 增加音量
                if (window.AudioManager) {
                    const currentVolume = window.AudioManager.getVolume();
                    window.AudioManager.setVolume(Math.min(1, currentVolume + 0.1));
                }
                break;
            case 'down':
                // 减少音量
                if (window.AudioManager) {
                    const currentVolume = window.AudioManager.getVolume();
                    window.AudioManager.setVolume(Math.max(0, currentVolume - 0.1));
                }
                break;
        }
        
        // 分发自定义事件
        dispatchCustomEvent('swipe', {
            direction,
            deltaX,
            deltaY
        });
        
        console.log(`👆 滑动: ${direction}`);
    }
    
    /**
     * 处理双指缩放
     */
    function handlePinch(touches) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // 这里可以实现缩放逻辑
        // 目前只是记录，避免意外缩放
        console.log('👆 双指操作:', distance);
    }
    
    /**
     * 处理设备动作
     */
    function handleDeviceMotion(e) {
        const acceleration = e.accelerationIncludingGravity;
        
        // 检测摇晃
        if (acceleration) {
            const totalAcceleration = Math.abs(acceleration.x) + 
                                     Math.abs(acceleration.y) + 
                                     Math.abs(acceleration.z);
            
            if (totalAcceleration > 20) {
                handleShake();
            }
        }
    }
    
    /**
     * 处理设备方向
     */
    function handleDeviceOrientation(e) {
        const alpha = e.alpha; // Z轴旋转
        const beta = e.beta;   // X轴旋转
        const gamma = e.gamma; // Y轴旋转
        
        // 根据设备方向调整粒子效果
        if (window.ParticleSystem) {
            // 重力方向随设备倾斜变化
            const gravityX = Math.sin(gamma * Math.PI / 180) * 0.1;
            const gravityY = Math.sin(beta * Math.PI / 180) * 0.1;
            
            window.ParticleSystem.setConfig({
                windStrength: gravityX
            });
        }
    }
    
    /**
     * 处理摇晃
     */
    function handleShake() {
        // 防抖动
        const now = Date.now();
        if (now - (this.lastShake || 0) < 1000) return;
        this.lastShake = now;
        
        // 强振动反馈
        vibrate([100, 50, 100, 50, 100]);
        
        // 触发烟花效果
        if (window.ParticleSystem) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            window.ParticleSystem.createCelebration();
        }
        
        // 播放庆祝音效
        if (window.AudioManager) {
            window.AudioManager.playSceneSound('celebration');
        }
        
        // 分发自定义事件
        dispatchCustomEvent('shake');
        
        console.log('📳 设备摇晃检测');
    }
    
    /**
     * 处理屏幕方向变化
     */
    function handleOrientationChange() {
        setTimeout(() => {
            orientationAngle = window.orientation || 0;
            
            // 重新调整粒子系统
            if (window.ParticleSystem) {
                window.ParticleSystem.resize();
            }
            
            // 分发自定义事件
            dispatchCustomEvent('orientationchange', { angle: orientationAngle });
            
            console.log('📱 屏幕方向变化:', orientationAngle);
        }, 100);
    }
    
    /**
     * 处理视口变化
     */
    function handleViewportChange() {
        // 重新设置视口高度（修复iOS键盘问题）
        if (deviceInfo.isIOS) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        // 分发自定义事件
        dispatchCustomEvent('viewportchange');
    }
    
    /**
     * 处理页面可见性变化
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停动画和音频
            if (window.ParticleSystem) {
                window.ParticleSystem.pause();
            }
        } else {
            // 页面显示时恢复
            if (window.ParticleSystem) {
                window.ParticleSystem.resume();
            }
        }
    }
    
    /**
     * 振动反馈
     */
    function vibrate(pattern) {
        if (!vibrationSupported) return;
        
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('⚠️ 振动失败:', error);
        }
    }
    
    /**
     * 判断是否应该阻止默认行为
     */
    function shouldPreventDefault(target) {
        // 对于特定元素不阻止默认行为
        const allowDefaults = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        return !allowDefaults.includes(target.tagName);
    }
    
    /**
     * 分发自定义事件
     */
    function dispatchCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(`mobile:${eventName}`, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * 性能优化
     */
    function optimizePerformance() {
        // 禁用不必要的事件
        document.addEventListener('selectstart', e => e.preventDefault());
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // 优化滚动性能
        document.addEventListener('touchmove', e => {
            if (shouldPreventDefault(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 设置性能相关的CSS属性
        document.body.style.webkitUserSelect = 'none';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitTapHighlightColor = 'transparent';
        
        console.log('⚡ 移动端性能优化完成');
    }
    
    /**
     * 进入全屏模式
     */
    function requestFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    /**
     * 退出全屏模式
     */
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    /**
     * 检测网络状态
     */
    function checkNetworkStatus() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
            // 根据网络状态调整性能
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');
                
                // 通知其他模块降低质量
                dispatchCustomEvent('networkchange', { 
                    ...networkInfo, 
                    quality: 'low' 
                });
            }
            
            return networkInfo;
        }
        
        return null;
    }
    
    /**
     * 电池状态检测
     */
    function checkBatteryStatus() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const batteryInfo = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
                
                // 低电量模式
                if (battery.level < 0.2 && !battery.charging) {
                    document.body.classList.add('low-battery');
                    dispatchCustomEvent('batterylow', batteryInfo);
                }
                
                return batteryInfo;
            });
        }
        
        return null;
    }
    
    /**
     * 获取设备信息
     */
    function getDeviceInfo() {
        return {
            ...deviceInfo,
            touchSupported,
            vibrationSupported,
            deviceMotionEnabled,
            orientationAngle,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            network: checkNetworkStatus()
        };
    }
    
    /**
     * 公共API
     */
    return {
        // 初始化
        init,
        
        // 设备信息
        getDeviceInfo,
        isIOS: () => deviceInfo.isIOS,
        isAndroid: () => deviceInfo.isAndroid,
        hasNotch: () => deviceInfo.hasNotch,
        
        // 功能检测
        supportsTouch: () => touchSupported,
        supportsVibration: () => vibrationSupported,
        supportsDeviceMotion: () => deviceMotionEnabled,
        
        // 交互功能
        vibrate,
        requestFullscreen,
        exitFullscreen,
        
        // 状态检测
        checkNetworkStatus,
        checkBatteryStatus,
        
        // 事件相关
        dispatchEvent: dispatchCustomEvent,
        
        // 配置
        setGestureConfig: (newConfig) => Object.assign(gestureConfig, newConfig),
        getGestureConfig: () => ({ ...gestureConfig })
    };
})(); 