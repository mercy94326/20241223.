let sprites = {
    // 第一個角色的精靈圖
    player1: {
      idle: {
        img: null,
        width: 627/8,
        height: 106,
        frames: 8
      },
      walk: {
        img: null,
        width: 731/8,
        height: 97,
        frames: 8
      },
      jump: {
        img: null,
        width: 1039/9,
        height: 112,
        frames: 9
      }
    },
    // 第二個角色的精靈圖
    player2: {
      idle: {
        img: null,
        width: 611/8,
        height: 133,
        frames: 8
      },
      walk: {
        img: null,
        width: 807/7,
        height: 112,
        frames: 7
      },
      jump: {
        img: null,
        width: 843/8,
        height: 112,
        frames: 8
      }
    },
    background: null,  // 添加背景圖片屬性
  };
  
  let players = [];
  let projectiles = [];
  let particles = [];
  
  function preload() {
    // 載入背景圖片
    sprites.background = loadImage('background.png');  // 需要準備背景圖片
    
    // 載入第一個角色的圖片
    sprites.player1.idle.img = loadImage('player1_idle.png');
    sprites.player1.walk.img = loadImage('player1_walk.png');
    sprites.player1.jump.img = loadImage('player1_jump.png');
    
    // 載入第二個角色的圖片
    sprites.player2.idle.img = loadImage('player2_idle.png');
    sprites.player2.walk.img = loadImage('player2_walk.png');
    sprites.player2.jump.img = loadImage('player2_jump.png');
  }
  
  function setup() {
    createCanvas(windowWidth,windowHeight);
    
    // 創建兩個玩家
    players[0] = new Player(100, height - 200, sprites.player1, 'player1');
    players[1] = new Player(width - 100, height - 200, sprites.player2, 'player2');
  }
  
  function draw() {
    // 替換 background(220) 為背景圖片
    image(sprites.background, 0, 0, width, height);
    
    // 更新和顯示玩家
    players.forEach(player => {
      player.update();
      player.display();
    });
    
    // 更新和顯示發射物
    for (let i = projectiles.length - 1; i >= 0; i--) {
      projectiles[i].update();
      projectiles[i].display();
      
      // 檢查碰撞
      players.forEach(player => {
        if (projectiles[i].hits(player)) {
          player.takeDamage(10);
          projectiles.splice(i, 1);
        }
      });
    }

    // 添加控制說明
    drawInstructions();
    
    // 添加右上角文字
    drawTitle();
    
    // 更新���顯示粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].display();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
  }
  
  // 添加新函數來繪製控制說明
  function drawInstructions() {
    textSize(16);
    fill(255);
    textAlign(LEFT);
    
    // 玩家1控制說明
    text('玩家1控制：', 20, height - 120);
    text('A/D - 左右移動', 20, height - 100);
    text('空白鍵 - 跳躍', 20, height - 80);
    text('Shift - 奔跑', 20, height - 60);
    text('F - 攻擊', 20, height - 40);
    
    // 玩家2控制說明
    text('玩家2控制：', 200, height - 120);
    text('←/→ - 左右移動', 200, height - 100);
    text('Enter - 跳躍', 200, height - 80);
    text('Ctrl - 奔跑', 200, height - 60);
    text('/ - 攻擊', 200, height - 40);
  }
  
  // 添加新函數來繪製標題
  function drawTitle() {
    textSize(24);
    fill(255);
    textAlign(RIGHT);
    text('教育科技', width - 20, 40);
  }
  
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = random(5, 15);
      this.speedX = random(-10, 10);
      this.speedY = random(-10, 5);
      this.gravity = 0.5;
      this.life = 255;
      this.fadeSpeed = random(5, 10);
    }

    update() {
      this.x += this.speedX;
      this.speedY += this.gravity;
      this.y += this.speedY;
      this.life -= this.fadeSpeed;
      this.size *= 0.95;
    }

    display() {
      push();
      noStroke();
      fill(this.color[0], this.color[1], this.color[2], this.life);
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(this.color[0], this.color[1], this.color[2]);
      circle(this.x, this.y, this.size);
      pop();
    }

    isDead() {
      return this.life <= 0;
    }
  }
  
  class Player {
    constructor(x, y, spriteSheet, type) {
      this.x = x;
      this.y = y;
      this.sprites = spriteSheet;
      this.type = type;
      this.health = 100;
      this.currentAnimation = 'idle';
      this.frame = 0;
      
      // 移動相關屬性
      this.walkSpeed = 5;
      this.runSpeed = 10;
      this.currentSpeed = this.walkSpeed;
      this.direction = 1; // 1為右，-1為左
      
      // 跳躍相關屬性
      this.velocityY = 0;
      this.gravity = 0.8;
      this.jumpForce = -15;
      this.isJumping = false;
      this.doubleJump = false;
      
      // 動畫相關屬性
      this.frameCount = 0;
      this.animationSpeed = 0.2;
      this.isRunning = false;
      this.groundY = height - 200;
      
      // 修改攻擊相關屬性
      this.attackCooldown = 0;
      this.attackCooldownTime = 15;    // 縮短冷卻時間
      this.projectileSpeed = 15;       // 發射物速度
      this.projectileDamage = 15;      // 發射物傷害
      this.attackPattern = 0;          // 攻擊模式
      this.maxAttackPatterns = 3;      // 攻擊模式數量
      this.scale = 1.5; // 添加縮放比例屬性
      this.isDead = false;
      this.deathAnimationComplete = false;
      this.fadeOut = 255;
      this.deathEffect = {
        flash: 255,
        particles: [],
        shakeAmount: 0,
        shakeTime: 0
      };
      // 為每個玩家設置特定的粒子顏色
      this.particleColor = type === 'player1' ? [255, 100, 100] : [100, 100, 255];
    }
    
    update() {
      if (this.isDead) {
        // 更新屏幕震動
        if (this.deathEffect.shakeTime > 0) {
          this.deathEffect.shakeTime--;
        }
        
        // 死亡動畫更新
        this.frameCount += this.animationSpeed;
        let sprite = this.sprites[this.currentAnimation];
        this.frame = Math.floor(this.frameCount) % sprite.frames;
        
        if (this.frame >= sprite.frames - 1) {
          this.deathAnimationComplete = true;
          this.fadeOut = max(0, this.fadeOut - 5);
        }
        return;
      }
      
      // 重力效果
      this.velocityY += this.gravity;
      this.y += this.velocityY;
      
      // 地面碰撞檢測
      if (this.y > this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.doubleJump = false;
      }
      
      // 重置移動狀態
      this.isRunning = false;
      this.currentSpeed = this.walkSpeed;
      
      // 更新攻擊冷卻
      if (this.attackCooldown > 0) {
        this.attackCooldown--;
      }
      
      // 玩家1控制 (WASD + Shift奔跑 + 空白鍵跳躍)
      if (this.type === 'player1') {
        // 奔跑控制
        if (keyIsDown(SHIFT)) {
          this.isRunning = true;
          this.currentSpeed = this.runSpeed;
        }
        
        // 移動控制
        if (keyIsDown(65)) { // A
          this.x -= this.currentSpeed;
          this.direction = -1;
        }
        if (keyIsDown(68)) { // D
          this.x += this.currentSpeed;
          this.direction = 1;
        }
        
        // 跳躍控制
        if (keyIsDown(32)) { // 空白鍵
          this.tryJump();
        }
        
        // 攻擊控制
        if (keyIsDown(70) && this.attackCooldown <= 0) { // F鍵發射
          this.shoot();
          this.attackCooldown = this.attackCooldownTime;
        }
      }
      
      // 玩家2控制 (方向鍵 + Ctrl奔跑 + Enter跳躍)
      if (this.type === 'player2') {
        // 奔跑控制
        if (keyIsDown(CONTROL)) {
          this.isRunning = true;
          this.currentSpeed = this.runSpeed;
        }
        
        // 移動控制
        if (keyIsDown(LEFT_ARROW)) {
          this.x -= this.currentSpeed;
          this.direction = -1;
        }
        if (keyIsDown(RIGHT_ARROW)) {
          this.x += this.currentSpeed;
          this.direction = 1;
        }
        
        // 跳躍控制
        if (keyIsDown(ENTER)) {
          this.tryJump();
        }
        
        // 攻擊控制
        if (keyIsDown(191) && this.attackCooldown <= 0) { // /鍵發射
          this.shoot();
          this.attackCooldown = this.attackCooldownTime;
        }
      }
      
      // 更新動畫
      this.updateAnimation();
    }
    
    tryJump() {
      if (!this.isJumping) {
        this.jump();
      } else if (!this.doubleJump) {
        // 二段跳
        this.doubleJump = true;
        this.velocityY = this.jumpForce * 0.8; // 二段跳高度略低
      }
    }
    
    jump() {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
      this.currentAnimation = 'jump';
    }
    
    updateAnimation() {
      this.frameCount += this.animationSpeed;
      
      // 根據狀態選擇動畫
      if (this.isJumping) {
        this.currentAnimation = 'jump';
      } else if (this.isRunning) {
        this.currentAnimation = 'walk'; // 假設用walk動畫但播放速度更快
        this.animationSpeed = 0.4; // 奔��時動畫更快
      } else if (Math.abs(this.velocityX) > 0) {
        this.currentAnimation = 'walk';
        this.animationSpeed = 0.2;
      } else {
        this.currentAnimation = 'idle';
        this.animationSpeed = 0.15;
      }
      
      // 更新動畫幀
      let sprite = this.sprites[this.currentAnimation];
      this.frame = Math.floor(this.frameCount) % sprite.frames;
    }
    
    display() {
      if (this.isDead) {
        push();
        
        // 應用屏幕震動效果
        if (this.deathEffect.shakeTime > 0) {
          let shakeX = random(-this.deathEffect.shakeAmount, this.deathEffect.shakeAmount);
          let shakeY = random(-this.deathEffect.shakeAmount, this.deathEffect.shakeAmount);
          translate(shakeX, shakeY);
        }
        
        // 閃光效果
        if (this.deathEffect.flash > 0) {
          push();
          drawingContext.shadowBlur = 30;
          drawingContext.shadowColor = color(this.particleColor[0], 
                                           this.particleColor[1], 
                                           this.particleColor[2]);
          pop();
          this.deathEffect.flash -= 10;
        }
        
        translate(this.x, this.y);
        tint(255, this.fadeOut);
        
        if (this.type === 'player1') {
          scale(this.direction * this.scale, this.scale);
        } else {
          scale(-this.direction * this.scale, this.scale);
        }
        
        let sprite = this.sprites[this.currentAnimation];
        let frameX = this.frame * sprite.width;
        
        image(
          sprite.img,
          -sprite.width/2,
          -sprite.height,
          sprite.width,
          sprite.height,
          frameX,
          0,
          sprite.width,
          sprite.height
        );
        
        pop();
        
        // 顯示勝利訊息
        if (this.deathAnimationComplete) {
          push();
          textAlign(CENTER);
          textSize(48);
          drawingContext.shadowBlur = 10;
          drawingContext.shadowColor = '#000000';
          fill(255, this.fadeOut);
          let winnerText = this.type === 'player1' ? 'Player 2 獲勝！' : 'Player 1 獲勝！';
          text(winnerText, width/2, height/2);
          pop();
        }
        
        return;
      }
      
      push();
      translate(this.x, this.y);
      
      // 根據玩家類設定不同的翻轉邏輯
      if (this.type === 'player1') {
        scale(this.direction * this.scale, this.scale); // 加入縮放
      } else {
        scale(-this.direction * this.scale, this.scale); // player2 也加入縮放
      }
      
      let sprite = this.sprites[this.currentAnimation];
      let frameX = this.frame * sprite.width;
      
      // 繪製當前幀
      image(
        sprite.img,
        -sprite.width/2,
        -sprite.height,
        sprite.width,
        sprite.height,
        frameX,
        0,
        sprite.width,
        sprite.height
      );
      
      pop();
      
      // 調整生命值條的位置和大小以配合放大後的角色
      fill(255, 0, 0);
      rect(this.x - 50, this.y - sprite.height * this.scale - 20, this.health, 10);
    }
    
    shoot() {
      // 根據不同的攻擊模式發射不同的彈幕
      switch(this.attackPattern) {
        case 0: // 三發散射
          for (let i = -1; i <= 1; i++) {
            let angle = i * 15;
            this.createProjectile(angle);
          }
          break;
          
        case 1: // 圓形彈幕
          for (let i = 0; i < 8; i++) {
            let angle = i * 45;
            this.createProjectile(angle);
          }
          break;
          
        case 2: // 波浪形
          for (let i = -2; i <= 2; i++) {
            let angle = i * 10;
            let speed = this.projectileSpeed * (1 + Math.abs(i) * 0.2);
            this.createProjectile(angle, speed);
          }
          break;
      }
      
      // 切換到下一個攻擊模式
      this.attackPattern = (this.attackPattern + 1) % this.maxAttackPatterns;
      this.attackCooldown = this.attackCooldownTime;
    }
    
    createProjectile(angle, speed = this.projectileSpeed) {
      let rad = angle * Math.PI / 180;
      let speedX = speed * Math.cos(rad);
      let speedY = speed * Math.sin(rad);
      
      projectiles.push(new Projectile(
        this.x + (this.direction * 30), // 從角色前方發射
        this.y - 50,
        this.type,
        speedX,
        speedY,
        this.projectileDamage
      ));
    }
    
    takeDamage(amount) {
      this.health -= amount;
      if (this.health <= 0 && !this.isDead) {
        this.health = 0;
        this.isDead = true;
        this.currentAnimation = 'death';
        this.frame = 0;
        this.frameCount = 0;
        
        // 創建死亡效果
        this.createDeathEffect();
        
        // 添加屏幕震動
        this.deathEffect.shakeAmount = 20;
        this.deathEffect.shakeTime = 30;
      }
    }
    
    createDeathEffect() {
      console.log("Creating death effect!"); // 添加這行來檢查
      // 創建大量粒子
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(
          this.x,
          this.y - 50,
          this.particleColor
        ));
      }
    }
  }
  
  class Projectile {
    constructor(x, y, playerType, speedX, speedY, damage) {
      this.x = x;
      this.y = y;
      this.speedX = speedX;
      this.speedY = speedY;
      this.damage = damage;
      this.playerType = playerType;
      this.direction = (playerType === 'player1') ? 1 : -1;
      this.size = 15;
      this.life = 255;
      this.fadeSpeed = 2;
      
      // 根據玩家類型設置不同的顏色和效果
      if (playerType === 'player1') {
        this.color = color(255, 50, 50);
        this.trailColor = color(255, 100, 100, 100);
      } else {
        this.color = color(50, 50, 255);
        this.trailColor = color(100, 100, 255, 100);
      }
    }

    update() {
      this.x += this.speedX * this.direction;
      this.y += this.speedY;
      
      // 添加重力效果
      this.speedY += 0.2;
      
      // 淡出效果
      this.life -= this.fadeSpeed;
    }

    display() {
      if (this.life <= 0) return;
      
      push();
      // 繪製發光效果
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = this.color;
      
      // 繪製軌跡
      noStroke();
      fill(this.trailColor);
      for (let i = 3; i > 0; i--) {
        let trailX = this.x - (this.speedX * this.direction * i * 2);
        let trailY = this.y - (this.speedY * i * 2);
        circle(trailX, trailY, this.size * 0.8);
      }
      
      // 繪製主體
      fill(this.color);
      circle(this.x, this.y, this.size);
      pop();
    }

    hits(player) {
      if (this.life <= 0) return false;
      let d = dist(this.x, this.y, player.x, player.y - 50);
      return d < 40 && this.playerType !== player.type;
    }

    isDead() {
      return this.life <= 0;
    }
  }