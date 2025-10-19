(() => {
  const container = document.getElementById('container');
  const form = document.getElementById('nameForm');
  const input = document.getElementById('nameInput');
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  const burstSound = document.getElementById('burst-sound');

  let width, height;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener('resize', resize);

  class Rocket {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * width * 0.8 + width * 0.1;
      this.y = y !== undefined ? y : height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -(7 + Math.random() * 3);
      this.exploded = false;
      this.particles = [];
      this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    }
    update() {
      if (!this.exploded) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        if (this.vy >= 0) {
          this.explode();
        }
      } else {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.done);
      }
    }
    explode() {
      this.exploded = true;
      const count = 40 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.x, this.y, this.color));
      }
      burstSound.currentTime = 0;
      burstSound.play().catch(() => {});
    }
    draw(ctx) {
      if (!this.exploded) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this.particles.forEach(p => p.draw(ctx));
      }
    }
    done() {
      return this.exploded && this.particles.length === 0;
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.speed = Math.random() * 4 + 1;
      this.angle = Math.random() * 2 * Math.PI;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.alpha = 1;
      this.decay = 0.015 + Math.random() * 0.015;
      this.color = color;
      this.size = 2 + Math.random() * 2;
      this.done = false;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      if (this.alpha <= 0) {
        this.done = true;
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let rockets = [];
  let greetingPos = null;
  let animationStarted = false;
  let launchIntervalId = null;

  function launchRocket() {
    if (rockets.length < 5) {
      if (greetingPos) {
        rockets.push(new Rocket(greetingPos.x, greetingPos.y));
      } else {
        rockets.push(new Rocket());
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    rockets.forEach(r => {
      r.update();
      r.draw(ctx);
    });
    rockets = rockets.filter(r => !r.done());
    requestAnimationFrame(animate);
  }

  form.addEventListener('submit', e => {
    e.preventDefault(); // prevent page reload
    const name = input.value.trim();
    if (name) {
      container.innerHTML = `<div id="greeting">Happy Diwali, <span>${name}</span>!</div>`;
      const greeting = document.getElementById('greeting');
      const rect = greeting.getBoundingClientRect();
      greetingPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      rockets = [];
      if (!animationStarted) {
        animationStarted = true;
        animate();
        launchIntervalId = setInterval(launchRocket, 800);
      }
    }
  });
})();
