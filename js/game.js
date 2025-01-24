// game.js

// DOM elements
const pauseBtn = document.getElementById('pauseBtn');
const endGameBtn = document.getElementById('endGameBtn');
const restartBtn = document.getElementById('restartBtn');
const healthBar = document.getElementById('health-bar');
const healthText = document.getElementById('health-text');
const defeatOverlay = document.getElementById('defeatOverlay');

let gamePaused = false;
let keys = { w: false, a: false, s: false, d: false };

// Defeat overlay timing
let defeatOverlayActive = false;
let defeatOverlayTimer = 0;

// event listeners
document.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': keys.w = true; break;
    case 'a': keys.a = true; break;
    case 's': keys.s = true; break;
    case 'd': keys.d = true; break;
    // t for pause
    case 't':
      togglePause();
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': keys.w = false; break;
    case 'a': keys.a = false; break;
    case 's': keys.s = false; break;
    case 'd': keys.d = false; break;
  }
});

pauseBtn.addEventListener('click', togglePause);
endGameBtn.addEventListener('click', endGame);
restartBtn.addEventListener('click', restartGame);

// game loop
function gameLoop(timestamp) {
  if (!gamePaused && !defeatOverlayActive) {
    // Update player
    updatePlayerMovement(keys);
    updatePlayerImmunity();
    // Update wave
    waveManagerUpdate(timestamp);
    // Draw everything
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPotions();
  }

  // If defeat overlay is active, count down and then restart
  if (defeatOverlayActive) {
    defeatOverlayTimer--;
    if (defeatOverlayTimer <= 0) {
      // Restart the game automatically after 2 seconds
      window.location.reload();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

// draw
function drawBullets() {
  ctx.fillStyle = 'white';
  // bullets array is in waveManager.js
  for (let b of bullets) {
    ctx.fillRect(b.x, b.y, b.size, b.size);
  }
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  for (let e of enemies) {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  }
}

function drawPotions() {
  // pink for immunity
  ctx.fillStyle = 'pink';
  for (let p of potions) {
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  // yellow for health potions
  ctx.fillStyle = 'yellow';
  for (let hp of healthPotions) {
    ctx.fillRect(hp.x, hp.y, hp.size, hp.size);
  }
}

// health bar
function updateHealthBar() {
  let pct = (player.health / player.maxHealth) * 100;
  if (pct < 0) pct = 0;
  healthBar.style.width = pct + '%';
  healthText.textContent = `${player.health} / ${player.maxHealth}`;
}

// defeat logic
function handlePlayerDefeat() {
  // Instead of alert, show a defeat overlay
  defeatOverlay.style.display = 'block';
  defeatOverlayActive = true;
  defeatOverlayTimer = 2 * FRAMES_PER_SECOND; // 2 seconds
}

// control
function togglePause() {
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function endGame() {
  window.location.href = 'index.html';
}

function restartGame() {
  window.location.reload();
}

// init
updateHealthBar();
updateUpgradeStats(); // upgrades.js
showWaveOverlay(currentWave); // waveManager overlay
requestAnimationFrame(gameLoop);
