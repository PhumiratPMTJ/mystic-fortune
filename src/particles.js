// Cosmic Star Particles Canvas Background
// Renders glowing stars and random shooting stars for a premium 3D deep-space feel

class StarBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.shootingStars = [];
    this.animationFrameId = null;
    this.maxStars = 80;
    this.resizeHandler = this.resize.bind(this);
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Set size
    this.resize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Generate initial stars
    this.stars = [];
    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push(this.createStar(true));
    }
    
    // Start animation loop
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStar(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : 0,
      size: Math.random() * 1.8 + 0.2,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.05 + 0.01,
      glow: Math.random() > 0.8, // Some stars glow more
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseDir: Math.random() > 0.5 ? 1 : -1
    };
  }

  createShootingStar() {
    return {
      x: Math.random() * this.canvas.width * 0.8,
      y: Math.random() * this.canvas.height * 0.4,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 12 + 6,
      angle: Math.PI / 6 + Math.random() * (Math.PI / 12), // around 30-45 degrees
      opacity: 1.0,
      decay: Math.random() * 0.025 + 0.015
    };
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.resizeHandler);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Draw and update normal stars
    this.stars.forEach((star, idx) => {
      // Pulse opacity
      star.opacity += star.pulseSpeed * star.pulseDir;
      if (star.opacity >= 1.0) {
        star.opacity = 1.0;
        star.pulseDir = -1;
      } else if (star.opacity <= 0.1) {
        star.opacity = 0.1;
        star.pulseDir = 1;
      }
      
      // Move star down slowly
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        this.stars[idx] = this.createStar(false);
      }
      
      // Draw star
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      
      if (star.glow) {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#8e2de2';
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.fill();
    });
    
    // Reset shadow blur
    this.ctx.shadowBlur = 0;
    
    // 2. Draw and update shooting stars
    if (Math.random() < 0.007 && this.shootingStars.length < 2) {
      this.shootingStars.push(this.createShootingStar());
    }
    
    this.shootingStars.forEach((sStar, idx) => {
      const dx = Math.cos(sStar.angle) * sStar.speed;
      const dy = Math.sin(sStar.angle) * sStar.speed;
      
      // Draw tail
      const grad = this.ctx.createLinearGradient(
        sStar.x, sStar.y, 
        sStar.x - Math.cos(sStar.angle) * sStar.length, 
        sStar.y - Math.sin(sStar.angle) * sStar.length
      );
      grad.addColorStop(0, `rgba(255, 215, 0, ${sStar.opacity})`); // Gold tip
      grad.addColorStop(0.2, `rgba(142, 45, 226, ${sStar.opacity * 0.7})`); // Purple middle
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fades out
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 1.8;
      this.ctx.moveTo(sStar.x, sStar.y);
      this.ctx.lineTo(
        sStar.x - Math.cos(sStar.angle) * sStar.length, 
        sStar.y - Math.sin(sStar.angle) * sStar.length
      );
      this.ctx.stroke();
      
      // Update position
      sStar.x += dx;
      sStar.y += dy;
      sStar.opacity -= sStar.decay;
    });
    
    // Remove dead shooting stars
    this.shootingStars = this.shootingStars.filter(sStar => sStar.opacity > 0 && sStar.y < this.canvas.height && sStar.x < this.canvas.width);
    
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
}

export const StarBg = new StarBackground();
export default StarBg;
