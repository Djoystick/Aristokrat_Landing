/**
 * Canvas Stage Spotlight Engine (vibeprompts.dev inspiration)
 * Реализует направленный кинематографичный софит с трекингом курсора
 * и парящими сценическими частицами света (Dust Motes).
 */
class StageSpotlight {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;

    // Mouse coordinates (normalized & smoothed)
    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight * 0.45,
      isActive: false
    };

    // Spotlight origin (top center stage truss)
    this.origin = {
      x: window.innerWidth / 2,
      y: -60
    };

    // Particles array
    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 25 : 55;

    this.isRunning = true;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse & touch events
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.targetX = e.clientX - rect.left;
      this.mouse.targetY = e.clientY - rect.top;
      this.mouse.isActive = true;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.targetX = e.touches[0].clientX - rect.left;
        this.mouse.targetY = e.touches[0].clientY - rect.top;
        this.mouse.isActive = true;
      }
    }, { passive: true });

    // Initialize particles
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }

    // Visibility API optimization
    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning) this.render();
    });

    this.render();
  }

  resize() {
    this.width = this.canvas.parentElement ? this.canvas.parentElement.offsetWidth : window.innerWidth;
    this.height = this.canvas.parentElement ? this.canvas.parentElement.offsetHeight : window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.origin.x = this.width / 2;
  }

  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: Math.random() * 0.45 + 0.15,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01
    };
  }

  render() {
    if (!this.isRunning) return;

    // Smooth lerp mouse tracking
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // Default gentle floating when mouse hasn't moved
    if (!this.mouse.isActive) {
      const time = Date.now() * 0.001;
      this.mouse.targetX = this.width / 2 + Math.sin(time * 0.7) * 140;
      this.mouse.targetY = this.height * 0.42 + Math.cos(time * 0.5) * 60;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw main stage cone spotlight
    this.drawSpotlightBeam();

    // Draw floating illuminated particles
    this.drawParticles();

    requestAnimationFrame(() => this.render());
  }

  drawSpotlightBeam() {
    const ctx = this.ctx;
    const originX = this.origin.x;
    const originY = this.origin.y;
    const targetX = this.mouse.x;
    const targetY = this.mouse.y;

    // Vector angle & distance
    const dx = targetX - originX;
    const dy = targetY - originY;
    const angle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);

    // Cone width at target
    const coneRadius = Math.max(160, Math.min(320, dist * 0.42));

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Light Cone polygon
    const p1x = originX;
    const p1y = originY;
    const perpAngle = angle + Math.PI / 2;
    const p2x = targetX + Math.cos(perpAngle) * coneRadius;
    const p2y = targetY + Math.sin(perpAngle) * coneRadius;
    const p3x = targetX - Math.cos(perpAngle) * coneRadius;
    const p3y = targetY - Math.sin(perpAngle) * coneRadius;

    const coneGradient = ctx.createRadialGradient(originX, originY, 20, targetX, targetY, coneRadius * 1.8);
    coneGradient.addColorStop(0, 'rgba(254, 243, 199, 0.28)'); // warm amber light at source
    coneGradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.16)');
    coneGradient.addColorStop(0.7, 'rgba(217, 119, 6, 0.07)');
    coneGradient.addColorStop(1, 'rgba(180, 83, 9, 0)');

    ctx.fillStyle = coneGradient;
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.arc(targetX, targetY, coneRadius, perpAngle, perpAngle + Math.PI, false);
    ctx.closePath();
    ctx.fill();

    // 2. Focused spotlight puddle on the stage floor / target
    const puddleGrad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, coneRadius);
    puddleGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)'); // brilliant center
    puddleGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.20)');
    puddleGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.08)');
    puddleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.arc(targetX, targetY, coneRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let p of this.particles) {
      p.y -= p.vy;
      p.x += p.vx;
      p.pulse += p.pulseSpeed;

      // Wrap around bounds
      if (p.y < 0) {
        p.y = this.height;
        p.x = Math.random() * this.width;
      }
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;

      // Distance to spotlight target to boost luminescence
      const distToLight = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
      const isLit = distToLight < 260;
      const glowBoost = isLit ? (1 - distToLight / 260) * 1.5 : 0.2;

      const currentAlpha = Math.min(1, (p.alpha + Math.sin(p.pulse) * 0.2) * (1 + glowBoost));

      ctx.fillStyle = isLit
        ? `rgba(254, 243, 199, ${currentAlpha})`
        : `rgba(245, 158, 11, ${currentAlpha * 0.35})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (isLit ? 1.3 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

window.StageSpotlight = StageSpotlight;
