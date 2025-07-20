/**
 * =============================================================================
 * 菱菱生日祝福网页 - 音频管理系统
 * 作者: 爱你的人
 * 创建时间: 2025年
 * 描述: 管理背景音乐播放、音效控制和音频体验
 * =============================================================================
 */

'use strict';

window.AudioManager = (function() {
    
    // 私有变量
    let audioContext;
    let backgroundMusic;
    let currentTrack = 0;
    let isPlaying = false;
    let isMuted = false;
    let volume = 0.7;
    let fadeInterval;
    
    // 音频配置
    const config = {
        autoplay: false,
        loop: true,
        fadeInDuration: 2000,
        fadeOutDuration: 1000,
        crossfadeDuration: 3000,
        enableSoundEffects: true
    };
    
    // 音轨列表（可选）
    const trackList = [
        // 用户可以添加音频文件到assets/audio/目录
        // 格式：{ name: '歌曲名', src: '路径', duration: 秒数, mood: '心情' }
    ];
    
    // 音效列表（可选）
    const soundEffects = {
        // 音效文件会自动检测是否存在
        // 如果文件不存在，会使用静音替代
        click: 'assets/audio/effects/click.mp3',
        pop: 'assets/audio/effects/pop.mp3',
        sparkle: 'assets/audio/effects/sparkle.mp3',
        bell: 'assets/audio/effects/bell.mp3',
        chime: 'assets/audio/effects/chime.mp3'
    };
    
    // 已加载的音效
    const loadedSounds = {};
    
    /**
     * 初始化音频系统
     */
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);
        
        // 获取背景音乐元素
        backgroundMusic = options.backgroundMusic || document.getElementById('background-music');
        
        if (!backgroundMusic) {
            console.warn('⚠️ 未找到背景音乐元素');
            return;
        }
        
        // 设置音频属性
        setupAudioElement();
        
        // 初始化Web Audio API
        initWebAudioAPI();
        
        // 预加载音效
        preloadSoundEffects();
        
        // 绑定事件监听器
        bindAudioEvents();
        
        console.log('🎵 音频系统初始化完成');
    }
    
    /**
     * 设置音频元素
     */
    function setupAudioElement() {
        if (!backgroundMusic) return;
        
        backgroundMusic.volume = volume;
        backgroundMusic.loop = config.loop;
        backgroundMusic.preload = 'none'; // 不自动预加载
        
        // 设置音轨源（如果有可用音轨）
        if (trackList.length > 0) {
            setTrack(currentTrack);
        } else {
            console.log('ℹ️ 没有可用的背景音乐文件');
        }
    }
    
    /**
     * 初始化Web Audio API
     */
    function initWebAudioAPI() {
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // 创建音频节点
            if (backgroundMusic) {
                const source = audioContext.createMediaElementSource(backgroundMusic);
                const gainNode = audioContext.createGain();
                
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // 保存引用以便后续使用
                backgroundMusic._gainNode = gainNode;
            }
            
            console.log('🎛️ Web Audio API 初始化成功');
        } catch (error) {
            console.warn('⚠️ Web Audio API 初始化失败:', error);
        }
    }
    
    /**
     * 预加载音效（可选文件）
     */
    function preloadSoundEffects() {
        if (!config.enableSoundEffects) return;
        
        Object.keys(soundEffects).forEach(effectName => {
            // 创建静音替代音效
            createSilentSound(effectName);
            
            // 尝试加载真实音效（如果存在）
            const audio = new Audio();
            audio.preload = 'none'; // 不自动预加载
            audio.volume = 0.5;
            audio.src = soundEffects[effectName];
            
            audio.addEventListener('canplaythrough', () => {
                loadedSounds[effectName] = audio;
                console.log(`✅ 音效加载成功: ${effectName}`);
            });
            
            audio.addEventListener('error', () => {
                console.log(`ℹ️ 音效文件不存在，使用静音替代: ${effectName}`);
                // 保持静音替代，不需要做任何事
            });
            
            // 尝试加载
            audio.load();
        });
        
        console.log('🔊 音效系统已初始化（支持可选音频文件）');
    }
    
    /**
     * 创建静音音效替代
     */
    function createSilentSound(effectName) {
        // 创建一个空的音效对象
        const silentAudio = {
            play: () => Promise.resolve(),
            pause: () => {},
            currentTime: 0,
            volume: 0.5,
            duration: 0.1
        };
        
        loadedSounds[effectName] = silentAudio;
    }
    
    /**
     * 绑定音频事件
     */
    function bindAudioEvents() {
        if (!backgroundMusic) return;
        
        backgroundMusic.addEventListener('loadstart', handleLoadStart);
        backgroundMusic.addEventListener('canplay', handleCanPlay);
        backgroundMusic.addEventListener('play', handlePlay);
        backgroundMusic.addEventListener('pause', handlePause);
        backgroundMusic.addEventListener('ended', handleEnded);
        backgroundMusic.addEventListener('error', handleError);
        backgroundMusic.addEventListener('timeupdate', handleTimeUpdate);
        
        // 处理用户交互解锁音频
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
    }
    
    /**
     * 解锁音频播放（移动端需要）
     */
    function unlockAudio() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('🔓 音频上下文已解锁');
            });
        }
        
        // 播放一个静音音频来解锁
        if (backgroundMusic) {
            const originalVolume = backgroundMusic.volume;
            backgroundMusic.volume = 0;
            backgroundMusic.play().then(() => {
                backgroundMusic.pause();
                backgroundMusic.volume = originalVolume;
                backgroundMusic.currentTime = 0;
            }).catch(() => {
                // 静默处理错误
            });
        }
    }
    
    /**
     * 播放音乐
     */
    function play() {
        return new Promise((resolve, reject) => {
            if (!backgroundMusic) {
                reject(new Error('背景音乐元素未找到'));
                return;
            }
            
            // 检查音频上下文状态
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    playAudio(resolve, reject);
                });
            } else {
                playAudio(resolve, reject);
            }
        });
    }
    
    /**
     * 实际播放音频
     */
    function playAudio(resolve, reject) {
        backgroundMusic.play().then(() => {
            isPlaying = true;
            
            // 如果设置了淡入效果
            if (config.fadeInDuration > 0) {
                fadeIn(config.fadeInDuration);
            }
            
            resolve();
            dispatchEvent('play');
        }).catch(error => {
            console.error('❌ 音乐播放失败:', error);
            reject(error);
        });
    }
    
    /**
     * 暂停音乐
     */
    function pause() {
        if (!backgroundMusic || !isPlaying) return;
        
        if (config.fadeOutDuration > 0) {
            fadeOut(config.fadeOutDuration, () => {
                backgroundMusic.pause();
                isPlaying = false;
                dispatchEvent('pause');
            });
        } else {
            backgroundMusic.pause();
            isPlaying = false;
            dispatchEvent('pause');
        }
    }
    
    /**
     * 停止音乐
     */
    function stop() {
        if (!backgroundMusic) return;
        
        pause();
        backgroundMusic.currentTime = 0;
        dispatchEvent('stop');
    }
    
    /**
     * 设置音量
     */
    function setVolume(newVolume) {
        volume = Math.max(0, Math.min(1, newVolume));
        
        if (backgroundMusic) {
            backgroundMusic.volume = isMuted ? 0 : volume;
        }
        
        // 如果使用了Web Audio API
        if (backgroundMusic && backgroundMusic._gainNode) {
            backgroundMusic._gainNode.gain.value = isMuted ? 0 : volume;
        }
        
        dispatchEvent('volumechange', { volume });
    }
    
    /**
     * 静音/取消静音
     */
    function toggleMute() {
        isMuted = !isMuted;
        
        if (backgroundMusic) {
            backgroundMusic.volume = isMuted ? 0 : volume;
        }
        
        if (backgroundMusic && backgroundMusic._gainNode) {
            backgroundMusic._gainNode.gain.value = isMuted ? 0 : volume;
        }
        
        dispatchEvent('mutechange', { muted: isMuted });
        
        return isMuted;
    }
    
    /**
     * 切换到下一首音轨
     */
    function nextTrack() {
        if (trackList.length <= 1) return;
        
        const nextIndex = (currentTrack + 1) % trackList.length;
        switchTrack(nextIndex);
    }
    
    /**
     * 切换到上一首音轨
     */
    function previousTrack() {
        if (trackList.length <= 1) return;
        
        const prevIndex = currentTrack === 0 ? trackList.length - 1 : currentTrack - 1;
        switchTrack(prevIndex);
    }
    
    /**
     * 切换音轨
     */
    function switchTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= trackList.length) return;
        
        const wasPlaying = isPlaying;
        const currentTime = backgroundMusic ? backgroundMusic.currentTime : 0;
        
        if (config.crossfadeDuration > 0 && wasPlaying) {
            crossfadeToTrack(trackIndex);
        } else {
            setTrack(trackIndex);
            if (wasPlaying) {
                play();
            }
        }
    }
    
    /**
     * 设置音轨
     */
    function setTrack(trackIndex) {
        if (!backgroundMusic || trackIndex < 0 || trackIndex >= trackList.length) return;
        
        currentTrack = trackIndex;
        const track = trackList[currentTrack];
        
        backgroundMusic.src = track.src;
        backgroundMusic.load();
        
        dispatchEvent('trackchange', { track, index: currentTrack });
        
        console.log(`🎵 切换到音轨: ${track.name}`);
    }
    
    /**
     * 交叉淡化到新音轨
     */
    function crossfadeToTrack(trackIndex) {
        const originalVolume = volume;
        
        // 淡出当前音轨
        fadeOut(config.crossfadeDuration / 2, () => {
            setTrack(trackIndex);
            
            // 淡入新音轨
            play().then(() => {
                fadeIn(config.crossfadeDuration / 2);
            });
        });
    }
    
    /**
     * 淡入效果
     */
    function fadeIn(duration) {
        if (!backgroundMusic) return;
        
        const startVolume = 0;
        const endVolume = volume;
        const steps = 60; // 60fps
        const stepTime = duration / steps;
        const volumeStep = (endVolume - startVolume) / steps;
        
        let currentStep = 0;
        backgroundMusic.volume = startVolume;
        
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + (volumeStep * currentStep);
            
            if (currentStep >= steps) {
                backgroundMusic.volume = endVolume;
                clearInterval(fadeInterval);
            } else {
                backgroundMusic.volume = newVolume;
            }
        }, stepTime);
    }
    
    /**
     * 淡出效果
     */
    function fadeOut(duration, callback) {
        if (!backgroundMusic) return;
        
        const startVolume = backgroundMusic.volume;
        const endVolume = 0;
        const steps = 60;
        const stepTime = duration / steps;
        const volumeStep = (startVolume - endVolume) / steps;
        
        let currentStep = 0;
        
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume - (volumeStep * currentStep);
            
            if (currentStep >= steps) {
                backgroundMusic.volume = endVolume;
                clearInterval(fadeInterval);
                if (callback) callback();
            } else {
                backgroundMusic.volume = newVolume;
            }
        }, stepTime);
    }
    
    /**
     * 播放音效
     */
    function playSound(effectName, options = {}) {
        if (!config.enableSoundEffects || !loadedSounds[effectName]) {
            console.log(`ℹ️ 音效未启用或不可用: ${effectName}`);
            return;
        }
        
        const soundSource = loadedSounds[effectName];
        
        // 检查是否是真实的音频元素还是静音替代
        if (soundSource.cloneNode) {
            // 真实音频文件
            const sound = soundSource.cloneNode();
            sound.volume = options.volume || 0.5;
            
            sound.play().catch(error => {
                console.log(`ℹ️ 音效播放失败: ${effectName}`, error);
            });
            
            return sound;
        } else {
            // 静音替代 - 只是调用play方法
            soundSource.play();
            return soundSource;
        }
    }
    
    /**
     * 根据场景播放音效
     */
    function playSceneSound(scene) {
        switch (scene) {
            case 'click':
                playSound('click');
                break;
            case 'firework':
                playSound('pop', { volume: 0.3 });
                break;
            case 'candle':
                playSound('sparkle', { volume: 0.4 });
                break;
            case 'celebration':
                playSound('bell', { volume: 0.6 });
                break;
            case 'surprise':
                playSound('chime', { volume: 0.5 });
                break;
        }
    }
    
    /**
     * 事件处理器
     */
    function handleLoadStart() {
        dispatchEvent('loadstart');
    }
    
    function handleCanPlay() {
        dispatchEvent('canplay');
    }
    
    function handlePlay() {
        isPlaying = true;
        dispatchEvent('audioplay');
    }
    
    function handlePause() {
        isPlaying = false;
        dispatchEvent('audiopause');
    }
    
    function handleEnded() {
        isPlaying = false;
        
        // 如果启用了循环，切换到下一首
        if (config.loop && trackList.length > 1) {
            nextTrack();
        }
        
        dispatchEvent('ended');
    }
    
    function handleError(e) {
        console.error('❌ 音频加载错误:', e);
        dispatchEvent('audioerror', { error: e });
    }
    
    function handleTimeUpdate() {
        if (!backgroundMusic) return;
        
        const progress = backgroundMusic.currentTime / backgroundMusic.duration;
        dispatchEvent('timeupdate', {
            currentTime: backgroundMusic.currentTime,
            duration: backgroundMusic.duration,
            progress: progress
        });
    }
    
    /**
     * 分发自定义事件
     */
    function dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`audio:${eventName}`, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * 获取当前播放信息
     */
    function getCurrentInfo() {
        if (!backgroundMusic) return null;
        
        return {
            isPlaying,
            isMuted,
            volume,
            currentTrack: trackList[currentTrack],
            currentTime: backgroundMusic.currentTime,
            duration: backgroundMusic.duration,
            progress: backgroundMusic.currentTime / backgroundMusic.duration
        };
    }
    
    /**
     * 音频可视化（可选功能）
     */
    function createVisualizer(canvasElement) {
        if (!audioContext || !backgroundMusic) return null;
        
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(backgroundMusic);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvas = canvasElement;
        const ctx = canvas.getContext('2d');
        
        function draw() {
            requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                
                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;
                
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        }
        
        draw();
        return { analyser, draw };
    }
    
    /**
     * 销毁音频系统
     */
    function destroy() {
        stop();
        
        if (fadeInterval) {
            clearInterval(fadeInterval);
        }
        
        if (audioContext) {
            audioContext.close();
        }
        
        // 清理事件监听器
        if (backgroundMusic) {
            backgroundMusic.removeEventListener('loadstart', handleLoadStart);
            backgroundMusic.removeEventListener('canplay', handleCanPlay);
            backgroundMusic.removeEventListener('play', handlePlay);
            backgroundMusic.removeEventListener('pause', handlePause);
            backgroundMusic.removeEventListener('ended', handleEnded);
            backgroundMusic.removeEventListener('error', handleError);
            backgroundMusic.removeEventListener('timeupdate', handleTimeUpdate);
        }
        
        console.log('🔇 音频系统已销毁');
    }
    
    /**
     * 公共API
     */
    return {
        // 基本控制
        init,
        play,
        pause,
        stop,
        destroy,
        
        // 音量控制
        setVolume,
        getVolume: () => volume,
        toggleMute,
        isMuted: () => isMuted,
        
        // 音轨控制
        nextTrack,
        previousTrack,
        switchTrack,
        getCurrentTrack: () => currentTrack,
        getTrackList: () => [...trackList],
        
        // 音效
        playSound,
        playSceneSound,
        
        // 状态查询
        isPlaying: () => isPlaying,
        getCurrentInfo,
        
        // 高级功能
        createVisualizer,
        
        // 配置
        setConfig: (newConfig) => Object.assign(config, newConfig),
        getConfig: () => ({ ...config })
    };
})(); 