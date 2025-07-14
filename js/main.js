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

    // 祝福文字内容
    const wishes = [
        "亲爱的生日快乐！🎂",
        "今天是属于你的特别日子",
        "愿你永远保持那灿烂的笑容",
        "我会一直陪在你身边",
        "让我们一起创造更多美好的回忆",
        "永远爱你 ❤️"
    ];

    // 创建悬浮祝福
    function createFloatingWish(text) {
        const wish = document.createElement('div');
        wish.className = 'floating-wish';
        wish.textContent = text;
        // 随机水平位置
        wish.style.left = `${Math.random() * 80 + 10}%`;
        floatingWishes.appendChild(wish);

        // 动画结束后移除元素
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

    // 定时发送悬浮祝福
    function startFloatingWishes() {
        let index = 0;
        // 清除之前的定时器
        if (floatingInterval) {
            clearInterval(floatingInterval);
        }
        
        // 立即显示第一个祝福
        createFloatingWish(floatingTexts[index]);
        index = (index + 1) % floatingTexts.length;

        // 设置定时器
        floatingInterval = setInterval(() => {
            if (wishContent.classList.contains('hidden')) {
                clearInterval(floatingInterval);
                return;
            }
            createFloatingWish(floatingTexts[index]);
            index = (index + 1) % floatingTexts.length;
        }, 2000);
    }

    // 显示祝福内容
    let isWishVisible = false;
    showWishBtn.addEventListener('click', async () => {
        if (!isWishVisible) {
            wishContent.classList.remove('hidden');
            firework.start(); // 开始烟花效果
            startFloatingWishes(); // 开始悬浮祝福
            
            // 清空之前的文字
            typingText.textContent = '';
            
            // 逐行显示祝福语
            for (const wish of wishes) {
                await typeWriter(wish, typingText);
                if (!isWishVisible) break; // 如果关闭了祝福，停止打字
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            wishContent.classList.add('hidden');
            firework.stop(); // 停止烟花效果
            if (floatingInterval) {
                clearInterval(floatingInterval);
            }
            typingText.textContent = '';
            // 清除所有浮动祝福
            while (floatingWishes.firstChild) {
                floatingWishes.removeChild(floatingWishes.firstChild);
            }
        }
        isWishVisible = !isWishVisible;
        showWishBtn.textContent = isWishVisible ? '关闭祝福' : '点击查看生日祝福';
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