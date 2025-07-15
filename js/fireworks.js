class Firework {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        
        // 设置画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle(x, y, color) {
        return {
            x,
            y,
            color,
            velocity: {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8
            },
            alpha: 1,
            life: Math.random() * 150 + 50
        };
    }
    
    createFirework(x, y) {
        const colors = ['#ff0', '#ff3', '#f62', '#f24', '#f6c', '#f9f'];
        const particleCount = 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle(x, y, color));
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.velocity.x;
            p.y += p.velocity.y;
            p.velocity.y += 0.05; // 重力
            p.alpha -= 0.01;
            p.life--;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            this.ctx.fill();
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 随机创建新烟花
        if (Math.random() < 0.05) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height / 2);
            this.createFirework(x, y);
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        this.isRunning = false;
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 初始化烟花
function startFireworks() {
    const canvas = document.getElementById('fireworks');
    const fireworks = new Firework(canvas);
    fireworks.start();
} 