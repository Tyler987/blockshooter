// player.js

let player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    width: 20,
    height: 20,
    speed: 3,
    maxHealth: 100,
    health: 100,
    strength: 10,
    bulletSpeed: 5,
    immunityUnlocked: false,
    isImmune: false,
    immunityTimer: 0, // frames
    hasMultiShot: false // multi-shot upgrade
  };
  
  function updatePlayerMovement(keys) {
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;
  
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
  }
  
  function updatePlayerImmunity() {
    if (player.isImmune) {
      player.immunityTimer--;
      if (player.immunityTimer <= 0) {
        player.isImmune = false;
      }
    }
  }
  
  function drawPlayer() {
    ctx.fillStyle = player.isImmune ? 'cyan' : 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
  