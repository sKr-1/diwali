const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const inputContainer = document.getElementById("inputContainer");
const wishText = document.getElementById("wishText");

const canvas = document.getElementById("fireworkCanvas");
const ctx = canvas.getContext("2d");

const fireworkSound = document.getElementById("fireworkSound");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) {
    inputContainer.style.display = "none";
    wishText.style.display = "block";
    wishText.textContent = `🪔 Happy Diwali, ${name}! 🪔`;

    fireworkSound.play().catch(() => {});
    startColorChange();
    startFireworks();
  }
});

// Color shifting effect
const colors = ["#ff4d4d", "#ffcc00", "#33cc33", "#3399ff", "#cc33ff"];
let colorIndex = 0;

function startColorChange() {
  setInterval(() => {
    wishText.style.color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
  }, 2500);
}

let fireworks = [];

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tx = Math.random() * width;
    this.ty = Math.random() * height / 2;
    this.particles = [];
    this.done = false;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speed = 3 + Math.random() * 2;
    this.trail = [];
    this.trailLength = 12;
  }

  update() {
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.trailLength) this.trail.shift();

    if (dist > this.speed) {
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;
    } else if (!this.done) {
      this.explode();
      this.done = true;
    }

    if (this.done) {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => p.alpha > 0);
    }
  }

  explode() {
    const count = 100;
    const patterns = ["circle", "star", "halfmoon", "ring"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      let vx, vy;

      switch (pattern) {
        case "circle":
          vx = Math.cos(angle) * (Math.random() * 5 + 2);
          vy = Math.sin(angle) * (Math.random() * 5 + 2);
          break;

        case "star":
          // Star with alternating spikes
          const spikeLength = (i % 10 < 5) ? (Math.random() * 6 + 3) : (Math.random() * 2 + 1);
          vx = Math.cos(angle) * spikeLength;
          vy = Math.sin(angle) * spikeLength;
          break;

        case "halfmoon":
          // Half moon burst (only upper half circle)
          if (angle > Math.PI) continue;
          vx = Math.cos(angle) * (Math.random() * 4 + 2);
          vy = Math.sin(angle) * (Math.random() * 4 + 2);
          break;

        case "ring":
          vx = Math.cos(angle) * 4;
          vy = Math.sin(angle) * 4;
          break;
      }

      this.particles.push(new Particle(this.tx, this.ty, this.color, vx, vy));
    }
  }

  draw() {
    if (!this.done) {
      ctx.beginPath();
      for (let i = 0; i < this.trail.length - 1; i++) {
        const p0 = this.trail[i];
        const p1 = this.trail[i + 1];
        ctx.strokeStyle = `rgba(255, 255, 255, ${i / this.trail.length})`;
        ctx.lineWidth = 2;
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();

      const gradient = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, 12);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.particles.forEach(p => p.draw());
    }
  }

  isFinished() {
    return this.done && this.particles.length === 0;
  }
}

class Particle {
  constructor(x, y, color, vx, vy) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.color = color;
    this.vx = vx !== undefined ? vx : Math.cos(Math.random() * 2 * Math.PI) * (Math.random() * 5 + 2);
    this.vy = vy !== undefined ? vy : Math.sin(Math.random() * 2 * Math.PI) * (Math.random() * 5 + 2);
    this.friction = 0.95;
    this.gravity = 0.08;
    this.size = Math.random() * 2 + 1;
    this.decay = Math.random() * 0.015 + 0.007;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function startFireworks() {
  setInterval(() => {
    const textRect = wishText.getBoundingClientRect();
    const originX = textRect.left + textRect.width / 2;
    const originY = textRect.top;

    // Launch fireworks batch
    for (let i = 0; i < 5; i++) {
      fireworks.push(new Firework(originX, originY));
    }

    // 🔊 Play sound once per batch (not every firework)
    fireworkSound.currentTime = 0;
    fireworkSound.play().catch(() => {});
  }, 2500); // Launch batch every 1.5 seconds

  animate();
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  fireworks.forEach(fw => {
    fw.update();
    fw.draw();
  });

  fireworks = fireworks.filter(fw => !fw.isFinished());

  requestAnimationFrame(animate);
}
