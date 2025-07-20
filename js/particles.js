/**
 * =============================================================================
 * 菱菱生日祝福网页 - 粒子特效系统
 * 作者: 爱你的人
 * 创建时间: 2025年
 * 描述: 创建各种粒子特效，包括烟花、爱心雨、花瓣飘洒等
 * =============================================================================
 */

'use strict';

window.ParticleSystem = (function() {
    
    // 私有变量
    let canvas, ctx;
    let particles = [];
    let animationId;
    let isRunning = false;
    let isPaused = false;
    
    // 配置
    const config = {
        maxParticles: 100,
        enableFireworks: true,
        enableHearts: true,
        enableBubbles: true,
        enablePetals: true,
        gravityStrength: 0.3,
        windStrength: 0.1
    };
    
    // 粒子类型
    const ParticleTypes = {
        FIREWORK: 'firework',
        SPARK: 'spark',
        HEART: 'heart',
        BUBBLE: 'bubble',
        PETAL: 'petal',
        STAR: 'star'
    };
    
    // 颜色配置
    const colors = {
        firework: ['#FF69B4', '#FFB6C1', '#FF1493', '#FFD700', '#FFA500'],
        heart: ['#FF69B4', '#FF1493', '#DC143C'],
        bubble: ['rgba(255,105,180,0.6)', 'rgba(135,206,250,0.6)', 'rgba(255,255,255,0.8)'],
        petal: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FFE4E1'],
        star: ['#FFD700', '#FFA500', '#FFFF00']
    };
    
    /**
     * 粒子类
     */
    class Particle {
        constructor(x, y, type, options = {}) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.life = 1.0;
            this.maxLife = options.maxLife || 1.0;
            this.decay = options.decay || 0.02;
            
            // 运动属性
            this.vx = options.vx || (Math.random() - 0.5) * 10;
            this.vy = options.vy || (Math.random() - 0.5) * 10;
            this.gravity = options.gravity || 0.3;
            this.friction = options.friction || 0.98;
            
            // 视觉属性
            this.size = options.size || Math.random() * 5 + 2;
            this.color = options.color || this.getRandomColor(type);
            this.rotation = options.rotation || 0;
            this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.2;
            
            // 特殊属性
            this.bounceHeight = options.bounceHeight || 0;
            this.trail = [];
            this.maxTrailLength = options.maxTrailLength || 10;
        }
        
        getRandomColor(type) {
            const colorArray = colors[type] || colors.firework;
            return colorArray[Math.floor(Math.random() * colorArray.length)];
        }
        
        update() {
            // 更新位置
            this.x += this.vx;
            this.y += this.vy;
            
            // 应用重力和摩擦
            if (this.type !== ParticleTypes.BUBBLE) {
                this.vy += this.gravity;
            } else {
                this.vy -= 0.1; // 气泡上升
            }
            
            this.vx *= this.friction;
            this.vy *= this.friction;
            
            // 更新旋转
            this.rotation += this.rotationSpeed;
            
            // 更新轨迹
            if (this.trail.length < this.maxTrailLength) {
                this.trail.push({ x: this.x, y: this.y, life: this.life });
            } else {
                this.trail.shift();
                this.trail.push({ x: this.x, y: this.y, life: this.life });
            }
            
            // 更新生命值
            this.life -= this.decay;
            
            // 边界检测
            this.checkBoundaries();
            
            return this.life > 0;
        }
        
        checkBoundaries() {
            if (this.x < 0 || this.x > canvas.width) {
                this.vx *= -0.8;
                this.x = Math.max(0, Math.min(canvas.width, this.x));
            }
            
            if (this.y > canvas.height) {
                if (this.type === ParticleTypes.BUBBLE) {
                    // 气泡重新从底部生成
                    this.y = canvas.height + 10;
                    this.x = Math.random() * canvas.width;
                } else {
                    this.vy *= -0.6;
                    this.y = canvas.height;
                    this.vx *= 0.9;
                }
            }
        }
        
        draw() {
            ctx.save();
            
            // 设置透明度
            ctx.globalAlpha = this.life;
            
            // 移动到粒子位置
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            switch (this.type) {
                case ParticleTypes.FIREWORK:
                case ParticleTypes.SPARK:
                    this.drawSpark();
                    break;
                case ParticleTypes.HEART:
                    this.drawHeart();
                    break;
                case ParticleTypes.BUBBLE:
                    this.drawBubble();
                    break;
                case ParticleTypes.PETAL:
                    this.drawPetal();
                    break;
                case ParticleTypes.STAR:
                    this.drawStar();
                    break;
            }
            
            ctx.restore();
            
            // 绘制轨迹
            this.drawTrail();
        }
        
        drawSpark() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加发光效果
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size * 2;
            ctx.fill();
        }
        
        drawHeart() {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size * 4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💕', 0, 0);
        }
        
        drawBubble() {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.7, this.color.replace('0.6', '0.3'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 高光
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(-this.size * 0.3, -this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        drawPetal() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            // 绘制花瓣形状
            const petalLength = this.size * 2;
            const petalWidth = this.size;
            
            ctx.ellipse(0, -petalLength/2, petalWidth/2, petalLength/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加阴影
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 1;
        }
        
        drawStar() {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size * 3}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', 0, 0);
            
            // 添加发光效果
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size;
        }
        
        drawTrail() {
            if (this.trail.length < 2 || this.type === ParticleTypes.HEART) return;
            
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const alpha = (point.life * (i / this.trail.length)) * 0.5;
                
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.size * 0.5;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(nextPoint.x, nextPoint.y);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    /**
     * 初始化粒子系统
     */
    function init(canvasElement, options = {}) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        // 合并配置
        Object.assign(config, options);
        
        // 设置画布大小
        resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', resizeCanvas);
        
        console.log('✨ 粒子系统初始化完成');
        
        // 启动背景粒子效果
        startBackgroundParticles();
    }
    
    /**
     * 调整画布大小
     */
    function resizeCanvas() {
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // 设置高DPI支持
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        ctx.scale(dpr, dpr);
    }
    
    /**
     * 启动背景粒子效果
     */
    function startBackgroundParticles() {
        if (!config.enableBubbles) return;
        
        // 创建一些初始气泡
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createBubble();
            }, i * 2000);
        }
        
        // 定期创建新气泡
        setInterval(() => {
            if (particles.length < config.maxParticles && config.enableBubbles) {
                createBubble();
            }
        }, 3000);
    }
    
    /**
     * 启动动画循环
     */
    function start() {
        if (isRunning) return;
        
        isRunning = true;
        isPaused = false;
        animate();
        
        console.log('🎬 粒子动画开始');
    }
    
    /**
     * 停止动画
     */
    function stop() {
        if (!isRunning) return;
        
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        console.log('⏹️ 粒子动画停止');
    }
    
    /**
     * 暂停动画
     */
    function pause() {
        isPaused = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    /**
     * 恢复动画
     */
    function resume() {
        if (!isRunning) return;
        
        isPaused = false;
        animate();
    }
    
    /**
     * 动画循环
     */
    function animate() {
        if (!isRunning || isPaused) return;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新和绘制粒子
        particles = particles.filter(particle => {
            const isAlive = particle.update();
            if (isAlive) {
                particle.draw();
            }
            return isAlive;
        });
        
        // 继续动画
        animationId = requestAnimationFrame(animate);
    }
    
    /**
     * 创建烟花
     */
    function createFirework(x, y) {
        if (!config.enableFireworks) return;
        
        const sparkCount = 15 + Math.random() * 10;
        const baseColor = colors.firework[Math.floor(Math.random() * colors.firework.length)];
        
        for (let i = 0; i < sparkCount; i++) {
            const angle = (Math.PI * 2 * i) / sparkCount;
            const speed = 3 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particles.push(new Particle(x, y, ParticleTypes.SPARK, {
                vx: vx,
                vy: vy,
                color: baseColor,
                size: 2 + Math.random() * 3,
                decay: 0.015 + Math.random() * 0.01,
                maxLife: 1.0,
                gravity: 0.1,
                friction: 0.95,
                maxTrailLength: 8
            }));
        }
        
        // 添加中心爆炸效果
        particles.push(new Particle(x, y, ParticleTypes.FIREWORK, {
            vx: 0,
            vy: 0,
            color: baseColor,
            size: 8,
            decay: 0.05,
            gravity: 0
        }));
        
        console.log('💥 烟花爆炸于:', x, y);
    }
    
    /**
     * 创建爱心雨
     */
    function createHeartRain() {
        if (!config.enableHearts) return;
        
        const heartCount = 10;
        
        for (let i = 0; i < heartCount; i++) {
            const x = Math.random() * canvas.width;
            const y = -50 - Math.random() * 100;
            
            particles.push(new Particle(x, y, ParticleTypes.HEART, {
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                size: 3 + Math.random() * 4,
                decay: 0.005,
                gravity: 0.05,
                friction: 0.99,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            }));
        }
        
        console.log('💕 爱心雨开始');
    }
    
    /**
     * 创建花瓣飘洒
     */
    function createPetalShower() {
        if (!config.enablePetals) return;
        
        const petalCount = 8;
        
        for (let i = 0; i < petalCount; i++) {
            const x = Math.random() * canvas.width;
            const y = -30;
            
            particles.push(new Particle(x, y, ParticleTypes.PETAL, {
                vx: (Math.random() - 0.5) * 3 + config.windStrength,
                vy: 1 + Math.random() * 1.5,
                size: 2 + Math.random() * 3,
                decay: 0.003,
                gravity: 0.02,
                friction: 0.98,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15
            }));
        }
        
        console.log('🌸 花瓣飘洒');
    }
    
    /**
     * 创建气泡
     */
    function createBubble() {
        if (!config.enableBubbles) return;
        
        const x = Math.random() * canvas.width;
        const y = canvas.height + 20;
        
        particles.push(new Particle(x, y, ParticleTypes.BUBBLE, {
            vx: (Math.random() - 0.5) * 1,
            vy: -1 - Math.random() * 2,
            size: 5 + Math.random() * 15,
            decay: 0.001,
            gravity: -0.02,
            friction: 0.99,
            maxLife: 2.0
        }));
    }
    
    /**
     * 创建星星闪烁
     */
    function createSparkles(x, y) {
        const sparkleCount = 5;
        
        for (let i = 0; i < sparkleCount; i++) {
            particles.push(new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                ParticleTypes.STAR, {
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: 1 + Math.random() * 2,
                    decay: 0.02,
                    gravity: 0,
                    friction: 0.95
                }
            ));
        }
    }
    
    /**
     * 创建庆祝效果
     */
    function createCelebration() {
        // 多个烟花
        const fireworkCount = 5;
        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                const x = canvas.width * 0.2 + Math.random() * canvas.width * 0.6;
                const y = canvas.height * 0.2 + Math.random() * canvas.height * 0.4;
                createFirework(x, y);
            }, i * 300);
        }
        
        // 爱心雨
        setTimeout(() => {
            createHeartRain();
        }, 1000);
        
        // 花瓣飘洒
        setTimeout(() => {
            createPetalShower();
        }, 1500);
        
        console.log('🎉 庆祝模式激活！');
    }
    
    /**
     * 创建生日特效
     */
    function createBirthdaySpecial() {
        // 创建"HAPPY BIRTHDAY"文字粒子效果
        const text = "HAPPY BIRTHDAY";
        const fontSize = 30;
        
        // 临时画布来获取文字路径
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        tempCtx.font = `${fontSize}px Arial`;
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'center';
        tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // 获取像素数据并创建粒子
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let y = 0; y < tempCanvas.height; y += 3) {
            for (let x = 0; x < tempCanvas.width; x += 3) {
                const index = (y * tempCanvas.width + x) * 4;
                const alpha = data[index + 3];
                
                if (alpha > 128) {
                    particles.push(new Particle(x, y, ParticleTypes.STAR, {
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        size: 1 + Math.random(),
                        decay: 0.01,
                        color: colors.star[Math.floor(Math.random() * colors.star.length)],
                        gravity: 0.1
                    }));
                }
            }
        }
        
        console.log('🎂 生日特效已启动！');
    }
    
    /**
     * 清除所有粒子
     */
    function clear() {
        particles = [];
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    /**
     * 获取粒子数量
     */
    function getParticleCount() {
        return particles.length;
    }
    
    /**
     * 公共API
     */
    return {
        init: init,
        start: start,
        stop: stop,
        pause: pause,
        resume: resume,
        resize: resizeCanvas,
        clear: clear,
        
        // 特效创建方法
        createFirework: createFirework,
        createHeartRain: createHeartRain,
        createPetalShower: createPetalShower,
        createBubble: createBubble,
        createSparkles: createSparkles,
        createCelebration: createCelebration,
        createBirthdaySpecial: createBirthdaySpecial,
        
        // 状态查询
        isRunning: () => isRunning,
        isPaused: () => isPaused,
        getParticleCount: getParticleCount,
        
        // 配置
        setConfig: (newConfig) => Object.assign(config, newConfig),
        getConfig: () => ({ ...config })
    };
})(); 