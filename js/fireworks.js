class Firework {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.hue = 120;
        this.isRunning = false;

        // 调整画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(x, y) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: `hsl(${this.hue}, 100%, 50%)`
            });
        }
        this.hue += 20;
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // 重力
            p.alpha *= 0.96; // 淡出效果

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${p.alpha})`;
            this.ctx.fill();

            if (p.alpha <= 0.01) {
                this.particles.splice(i, 1);
            }
        }

        // 随机创建新烟花
        if (Math.random() < 0.05) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height * 0.6);
            this.createParticles(x, y);
        }

        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
    }
}

// 导出烟花类
window.Firework = Firework; 