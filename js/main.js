document.addEventListener('DOMContentLoaded', () => {
    // 初始化变量
    const startDate = new Date('2024-06-01'); // 在这里修改你们相识的日期
    const musicBtn = document.getElementById('musicBtn');
    const bgMusic = document.getElementById('bgMusic');
    const showWishBtn = document.getElementById('showWishBtn');
    const wishContent = document.getElementById('wishContent');
    const typingText = document.getElementById('typingText');
    const fireworksCanvas = document.getElementById('fireworks');
    const floatingWishes = document.getElementById('floatingWishes');
    
    // 获取所有阶段元素
    const stages = document.querySelectorAll('.wish-stage');
    let currentStage = 0;
    
    // 初始化烟花
    const firework = new Firework(fireworksCanvas);
    
    // 初始化轮播图
    const swiper = new Swiper('.swiper-container', {
        effect: 'cards',
        grabCursor: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        loop: true
    });

    // 计算相识天数
    function updateDaysCount() {
        const today = new Date();
        const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        document.getElementById('daysCounter').textContent = Math.max(0, days);
    }
    updateDaysCount();

    // 音乐控制
    let isMusicPlaying = false;
    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicBtn.classList.add('paused');
        } else {
            bgMusic.play().catch(err => console.log('播放失败，需要用户交互'));
            musicBtn.classList.remove('paused');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // 切换阶段
    function switchToStage(stageIndex) {
        stages.forEach((stage, index) => {
            if (index === stageIndex) {
                stage.classList.add('active');
            } else {
                stage.classList.remove('active');
            }
        });

        // 根据阶段执行不同的动画
        switch(stageIndex) {
            case 0: // 烟花阶段
                firework.start();
                break;
            case 1: // 蛋糕阶段
                firework.stop();
                break;
            case 2: // 照片回忆阶段
                loadMemoryPhotos();
                break;
            case 3: // 最终祝福阶段
                startFloatingWishes();
                showFinalWishes();
                break;
        }
    }

    // 加载照片墙
    function loadMemoryPhotos() {
        const photoWall = document.querySelector('.photo-wall');
        photoWall.innerHTML = ''; // 清空现有照片
        
        // 添加照片（这里使用轮播图中的照片）
        const photos = document.querySelectorAll('.swiper-slide img');
        photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.src;
            img.className = 'memory-photo';
            img.alt = '美好回忆';
            photoWall.appendChild(img);
        });
    }

    // 创建悬浮祝福
    function createFloatingWish(text) {
        const wish = document.createElement('div');
        wish.className = 'floating-wish';
        wish.textContent = text;
        wish.style.left = `${Math.random() * 80 + 10}%`;
        floatingWishes.appendChild(wish);

        wish.addEventListener('animationend', () => {
            if (wish.parentNode === floatingWishes) {
                floatingWishes.removeChild(wish);
            }
        });
    }

    // 悬浮祝福文字
    const floatingTexts = [
        "生日快乐 ✨",
        "永远开心 🌟",
        "美梦成真 💫",
        "幸福常在 💝",
        "青春永驻 🌸",
        "甜蜜每一天 🎂",
        "愿望成真 ⭐",
        "平安喜乐 💖"
    ];

    let floatingInterval = null;

    // 开始悬浮祝福
    function startFloatingWishes() {
        let index = 0;
        if (floatingInterval) {
            clearInterval(floatingInterval);
        }
        
        createFloatingWish(floatingTexts[index]);
        index = (index + 1) % floatingTexts.length;

        floatingInterval = setInterval(() => {
            if (wishContent.classList.contains('hidden')) {
                clearInterval(floatingInterval);
                return;
            }
            createFloatingWish(floatingTexts[index]);
            index = (index + 1) % floatingTexts.length;
        }, 2000);
    }

    // 打字效果
    function typeWriter(text, element, speed = 100) {
        let i = 0;
        element.textContent = '';
        return new Promise(resolve => {
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // 最终祝福文字
    const finalWishes = [
        "亲爱的生日快乐！🎂",
        "今天是属于你的特别日子",
        "愿你永远保持那灿烂的笑容",
        "我会一直陪在你身边",
        "让我们一起创造更多美好的回忆",
        "永远爱你 ❤️"
    ];

    // 显示最终祝福
    async function showFinalWishes() {
        typingText.textContent = '';
        for (const wish of finalWishes) {
            await typeWriter(wish, typingText);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // 绑定阶段切换按钮事件
    document.querySelectorAll('.next-stage-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (index === stages.length - 1) {
                // 最后一个阶段，点击后重新开始
                currentStage = 0;
            } else {
                currentStage = index + 1;
            }
            switchToStage(currentStage);
        });
    });

    // 显示祝福内容
    let isWishVisible = false;
    showWishBtn.addEventListener('click', () => {
        if (!isWishVisible) {
            wishContent.classList.remove('hidden');
            currentStage = 0;
            switchToStage(currentStage);
            showWishBtn.textContent = '关闭祝福';
        } else {
            wishContent.classList.add('hidden');
            firework.stop();
            if (floatingInterval) {
                clearInterval(floatingInterval);
            }
            showWishBtn.textContent = '点击开启生日惊喜';
        }
        isWishVisible = !isWishVisible;
    });

    // 自动播放音乐（需要用户交互后）
    document.body.addEventListener('click', () => {
        if (!isMusicPlaying) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicBtn.classList.remove('paused');
            }).catch(err => console.log('自动播放失败，需要用户手动点击播放'));
        }
    }, { once: true });
}); 