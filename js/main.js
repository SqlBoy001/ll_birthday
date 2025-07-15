document.addEventListener('DOMContentLoaded', () => {
    // 音乐控制
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    let isMusicPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
        } else {
            bgMusic.play();
            musicBtn.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // 计算相识天数
    const startDate = new Date('2024-06-01'); // 设置你们相识的日期
    const daysCounter = document.getElementById('daysCounter');
    const today = new Date();
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    daysCounter.textContent = days;

    // 初始化轮播图
    new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });

    // 祝福按钮和内容控制
    const showWishBtn = document.getElementById('showWishBtn');
    const wishContent = document.getElementById('wishContent');
    const stages = document.querySelectorAll('.wish-stage');
    const darkOverlay = document.getElementById('darkOverlay');
    const candleLight = document.getElementById('candleLight');
    const memoriesContainer = document.getElementById('memoriesContainer');
    const guessText = document.getElementById('guessText');
    const makeWishBtn = document.getElementById('makeWishBtn');
    let currentStage = 0;
    let currentMemoryIndex = 0;

    // 照片和祝福数据
    const memories = [
        { photo: 'memory1.jpg', text: '记得我们第一次见面' },
        { photo: 'memory2.jpg', text: '一起看的第一场电影' },
        { photo: 'memory3.jpg', text: '你最爱的奶茶店' },
        { photo: 'memory4.jpg', text: '一起去的游乐园' },
        { photo: 'memory5.jpg', text: '第一次一起旅行' },
        { photo: 'memory6.jpg', text: '你最喜欢的餐厅' },
        { photo: 'memory7.jpg', text: '一起看的日落' },
        { photo: 'memory8.jpg', text: '第一次送你的花' },
        { photo: 'memory9.jpg', text: '亲爱的菱菱，生日快乐！' }
    ];

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'photo-overlay';
    document.body.appendChild(overlay);

    // 跟踪是否有图片处于放大状态
    let isPhotoEnlarged = false;

    // 缩小图片函数
    function shrinkPhoto() {
        const enlargedPhoto = document.querySelector('.memory-photo.enlarged');
        if (enlargedPhoto) {
            enlargedPhoto.classList.remove('enlarged');
            overlay.classList.remove('active');
            isPhotoEnlarged = false;
        }
    }

    // 放大图片函数
    function enlargePhoto(img) {
        img.classList.add('enlarged');
        overlay.classList.add('active');
        isPhotoEnlarged = true;
    }

    // 创建记忆元素
    function createMemoryElement(memory, index) {
        const div = document.createElement('div');
        div.className = `memory-item position-${index}`;
        div.innerHTML = `
            <img src="images/${memory.photo}" class="memory-photo" alt="回忆照片">
            <div class="memory-text">${memory.text}</div>
        `;

        // 为图片添加点击事件
        const img = div.querySelector('.memory-photo');
        img.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡到stage2
            if (isPhotoEnlarged) {
                shrinkPhoto();
            } else {
                enlargePhoto(img);
            }
        });

        return div;
    }

    // 为整个文档添加点击事件来处理图片缩小
    document.addEventListener('click', (event) => {
        // 如果点击的是放大的图片，让图片自己的点击事件处理
        if (event.target.classList.contains('memory-photo')) {
            return;
        }
        
        // 如果有图片在放大状态且点击的不是图片，则缩小图片
        if (isPhotoEnlarged) {
            event.preventDefault();
            event.stopPropagation();
            shrinkPhoto();
            return;
        }
    });

    // 初始化记忆墙
    function initializeMemories() {
        memoriesContainer.innerHTML = '';
        memories.forEach((memory, index) => {
            const element = createMemoryElement(memory, index);
            memoriesContainer.appendChild(element);
        });
        addMemoryClickEvents(); // 添加点击事件
    }

    // 显示下一个记忆
    function showNextMemory() {
        if (currentMemoryIndex < memories.length) {
            // 获取当前要显示的记忆元素
            const currentMemory = memoriesContainer.children[currentMemoryIndex];
            currentMemory.classList.add('active');

            // 如果不是第一个元素，将前一个元素缩小
            if (currentMemoryIndex > 0) {
                const previousMemory = memoriesContainer.children[currentMemoryIndex - 1];
                previousMemory.classList.add('shrink');
            }

            currentMemoryIndex++;

            // 检查是否已经显示完所有照片
            if (currentMemoryIndex >= memories.length) {
                guessText.textContent = "猜完了！快许愿！";
                makeWishBtn.style.display = 'inline-block';
                // 3秒后如果还没点击许愿按钮，自动触发许愿效果
                setTimeout(() => {
                    if (currentStage === 1 && currentMemoryIndex >= memories.length) {
                        makeWish();
                    }
                }, 3000);
            }
        }
    }

    // 许愿效果
    function makeWish() {
        // 添加吹气动画效果
        candleLight.classList.add('blown');
        
        // 延迟后显示黑幕
        setTimeout(() => {
            darkOverlay.classList.add('active');
            
            // 3秒后退出
            setTimeout(() => {
                darkOverlay.classList.remove('active');
                wishContent.classList.add('hidden');
                // 重置状态
                setTimeout(() => {
                    stages[1].classList.remove('active');
                    stages[0].classList.add('active');
                    candleLight.classList.remove('blown');
                    resetMemories();
                    guessText.textContent = "猜猜这是哪一天？";
                    currentStage = 0;
                }, 1000);
            }, 5000);
        }, 500);
    }

    // 重置记忆墙时也重置图片状态
    function resetMemories() {
        const memoryItems = memoriesContainer.getElementsByClassName('memory-item');
        Array.from(memoryItems).forEach(item => {
            item.classList.remove('active', 'shrink');
            const photo = item.querySelector('.memory-photo');
            if (photo) {
                photo.classList.remove('enlarged');
            }
        });
        overlay.classList.remove('active');
        isPhotoEnlarged = false;
        currentMemoryIndex = 0;
        makeWishBtn.style.display = 'none';
        guessText.textContent = "猜猜这是哪一天？";
    }

    // 显示初始内容
    showWishBtn.addEventListener('click', () => {
        wishContent.classList.remove('hidden');
        initializeMemories();
        resetMemories();
        currentStage = 0;
        stages[0].classList.add('active');
        stages[1].classList.remove('active');
        
        // 重置烟花容器状态
        const fireworksContainer = document.querySelector('.fireworks-container');
        fireworksContainer.classList.remove('hidden');
    });

    // 阶段切换按钮
    document.querySelector('.next-stage-btn').addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        if (currentStage === 0) {
            // 隐藏烟花容器
            const fireworksContainer = document.querySelector('.fireworks-container');
            fireworksContainer.classList.add('hidden');
            
            // 切换阶段
            stages[0].classList.remove('active');
            stages[1].classList.add('active');
            currentStage = 1;
            showNextMemory();
        } else if (currentStage === 1 && !isPhotoEnlarged && currentMemoryIndex < memories.length) {
            // 如果已经在第二阶段，且没有图片在放大状态，则显示下一张照片
            showNextMemory();
        }
    });

    // 为第二阶段添加点击事件，任何点击都触发显示下一张照片
    const stage2 = document.getElementById('stage2');
    stage2.addEventListener('click', (event) => {
        // 如果有图片在放大状态，不触发显示下一张照片
        if (isPhotoEnlarged) {
            return;
        }

        // 如果点击的是许愿按钮或者图片本身，不触发显示下一张照片
        if (event.target === makeWishBtn || 
            event.target.closest('.wish-btn') || 
            event.target.classList.contains('memory-photo') ||
            event.target.classList.contains('next-stage-btn')) { // 添加对猜猜看按钮的判断
            return;
        }
        
        if (currentStage === 1 && currentMemoryIndex < memories.length) {
            showNextMemory();
        }
    });

    // 为每个记忆元素添加点击事件
    function addMemoryClickEvents() {
        const memoryItems = memoriesContainer.getElementsByClassName('memory-item');
        Array.from(memoryItems).forEach(item => {
            item.addEventListener('click', (event) => {
                event.stopPropagation(); // 阻止事件冒泡
                if (currentStage === 1 && currentMemoryIndex < memories.length) {
                    showNextMemory(event);
                }
            });
        });
    }

    // "许愿"按钮
    makeWishBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡，防止触发显示下一张照片
        makeWish();
    });

    // 打字效果
    function startTypingEffect() {
        const text = "亲爱的菱菱，生日快乐！\n愿你永远开心快乐，\n我永远陪在你身边！";
        const typingText = document.getElementById('typingText');
        typingText.innerHTML = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                typingText.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
                i++;
                setTimeout(type, 100);
            }
        }
        
        type();
    }

    // 浮动祝福
    function addFloatingWish() {
        const wishes = [
            "生日快乐！",
            "永远开心！",
            "美梦成真！",
            "青春永驻！",
            "幸福快乐！"
        ];
        
        const floatingWishes = document.getElementById('floatingWishes');
        const wish = document.createElement('div');
        wish.className = 'floating-wish';
        wish.textContent = wishes[Math.floor(Math.random() * wishes.length)];
        
        // 随机位置
        wish.style.left = Math.random() * 80 + 10 + '%';
        floatingWishes.appendChild(wish);
        
        // 动画结束后移除
        setTimeout(() => {
            floatingWishes.removeChild(wish);
        }, 4000);
    }

    // 定期添加浮动祝福
    setInterval(addFloatingWish, 2000);
}); 