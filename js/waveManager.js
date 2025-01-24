// waveManager.js

let currentWave = 1;
const maxWaves = 10;
let waveInProgress = false;

let waveEnemyHealth = 0;
let waveEnemyDamage = 0;

// overlay
let waveOverlayActive = false;
let waveOverlayTimer = 0;
let waveDelayTimer = 0;

let victoryOverlayActive = false;
let victoryOverlayTimer = 0;

// array
let enemies = [];
let bullets = [];
let potions = [];      
let healthPotions = [];

const FIRE_RATE = 500;
let lastShotTime = 0;
const HEALTH_POTION_RATE = 5000;
let lastHealthPotionSpawnTime = 0;

/** starts a wave */
function startWave(waveNumber) {
  waveInProgress = true;
  lastHealthPotionSpawnTime = 0;

  let baseEnemies = 5;
  let waveEnemies = Math.round(baseEnemies * Math.pow(1.3, waveNumber - 1));

  // enemy stats
  waveEnemyHealth = Math.floor(player.strength * 0.9);
  waveEnemyDamage = 3 + (waveNumber - 1);

  updateEnemyStatsDisplay();

  enemies = [];
  for (let i = 0; i < waveEnemies; i++) {
    enemies.push(spawnEnemySafe());
  }

  // spawns a immunity potion if it is unlocked
  if (player.immunityUnlocked) {
    potions.push(spawnImmunityPotionSafe());
  }
}

function updateEnemyStatsDisplay() {
  let statsList = document.getElementById('enemyStats');
  statsList.innerHTML = '';

  let waveLi = document.createElement('li');
  waveLi.textContent = `Wave: ${currentWave}/${maxWaves}`;
  statsList.appendChild(waveLi);

  let healthLi = document.createElement('li');
  healthLi.textContent = `Enemy Health: ${waveEnemyHealth}`;
  statsList.appendChild(healthLi);

  let dmgLi = document.createElement('li');
  dmgLi.textContent = `Enemy Damage: ${waveEnemyDamage}`;
  statsList.appendChild(dmgLi);
}

function showWaveOverlay(waveNumber) {
  const waveOverlay = document.getElementById('waveOverlay');
  waveOverlay.textContent = `Wave ${waveNumber}`;
  waveOverlay.style.display = 'block';

  waveOverlayActive = true;
  waveOverlayTimer = 2 * FRAMES_PER_SECOND; 
}

function hideWaveOverlay() {
  const waveOverlay = document.getElementById('waveOverlay');
  waveOverlay.style.display = 'none';
  waveOverlayActive = false;
}

function showVictoryOverlay() {
  const victoryOverlay = document.getElementById('victoryOverlay');
  victoryOverlay.style.display = 'block';

  victoryOverlayActive = true;
  victoryOverlayTimer = 5 * FRAMES_PER_SECOND;
}

/** spawns enemies with some spacing from player and each other */
function spawnEnemySafe() {
  for (let attempts = 0; attempts < 100; attempts++) {
    let x = Math.random() * (WIDTH - 20);
    let y = Math.random() * (HEIGHT - 20);

    // Keep distance from player
    let distP = distance(x+10, y+10, player.x+player.width/2, player.y+player.height/2);
    if (distP < 80) continue; 

    // Check distance from other enemies
    let tooClose = enemies.some(e => {
      let ex = e.x + e.width/2;
      let ey = e.y + e.height/2;
      return distance(x+10, y+10, ex, ey) < 40; 
    });
    if (tooClose) continue;

    return { x, y, width: 20, height: 20, speed: 1.5, health: waveEnemyHealth };
  }
  // fallback
  return { x: 0, y: 0, width: 20, height: 20, speed: 1.5, health: waveEnemyHealth };
}

function spawnImmunityPotionSafe() {
  for (let attempts = 0; attempts < 100; attempts++) {
    let x = Math.random() * (WIDTH - 15);
    let y = Math.random() * (HEIGHT - 15);

    let distP = distance(x+7.5, y+7.5, player.x+player.width/2, player.y+player.height/2);
    if (distP < 80) continue;

    let tooClose = enemies.some(e => {
      let ex = e.x + e.width/2;
      let ey = e.y + e.height/2;
      return distance(x+7.5, y+7.5, ex, ey) < 40;
    });
    if (tooClose) continue;

    return { x, y, size: 15 };
  }
  // fallback
  return { x: 0, y: 0, size: 15 };
}

function spawnHealthPotion() {
  if (!waveInProgress) return;
  for (let attempts = 0; attempts < 100; attempts++) {
    let x = Math.random() * (WIDTH - 15);
    let y = Math.random() * (HEIGHT - 15);

    let distP = distance(x+7.5, y+7.5, player.x+player.width/2, player.y+player.height/2);
    if (distP < 50) continue;

    let tooClose = enemies.some(e => {
      let ex = e.x + e.width/2;
      let ey = e.y + e.height/2;
      return distance(x+7.5, y+7.5, ex, ey) < 40;
    });
    if (!tooClose) {
      healthPotions.push({ x, y, size: 15 });
      return;
    }
  }
  // fallback
  healthPotions.push({ x: 0, y: 0, size: 15 });
}

function shootAtNearestEnemy(timestamp) {
  if (!waveInProgress || enemies.length === 0) return;

  if (timestamp - lastShotTime < FIRE_RATE) {
    return;  // fire cooldown
  }

  lastShotTime = timestamp;

  let px = player.x + player.width/2;
  let py = player.y + player.height/2;

  // nearest enemy
  let nearestDist = Infinity, target = null;
  enemies.forEach(e => {
    let ex = e.x + e.width/2;
    let ey = e.y + e.height/2;
    let d = (ex - px)*(ex - px) + (ey - py)*(ey - py);
    if (d < nearestDist) {
      nearestDist = d;
      target = { ex, ey };
    }
  });

  if (!target) return;
  let dx = target.ex - px;
  let dy = target.ey - py;
  let dist = Math.sqrt(dx*dx + dy*dy);
  dx /= dist; 
  dy /= dist;

  // Create bullet
  bullets.push({
    x: px,
    y: py,
    size: 6,
    speed: player.bulletSpeed,
    vx: dx,
    vy: dy
  });

  // fires a second bullet for muli shot
  if (player.hasMultiShot) {
    bullets.push({
      x: px,
      y: py,
      size: 6,
      speed: player.bulletSpeed,
      vx: dx,
      vy: dy
    });
  }
}

function updateBulletsAndEnemies() {
  // bullet upgrades
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx * b.speed;
    b.y += b.vy * b.speed;

    // if off of the screen
    if (b.x < 0 || b.x > WIDTH || b.y < 0 || b.y > HEIGHT) {
      bullets.splice(i, 1);
      continue;
    }
    // collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      let e = enemies[j];
      if (rectIntersect(b.x, b.y, b.size, b.size, e.x, e.y, e.width, e.height)) {
        e.health -= player.strength;
        bullets.splice(i, 1);
        if (e.health <= 0) {
          enemies.splice(j, 1);
        }
        break;
      }
    }
  }

  // enemy movement
  for (let e of enemies) {
    let dx = (player.x + player.width/2) - (e.x + e.width/2);
    let dy = (player.y + player.height/2) - (e.y + e.height/2);
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0) {
      e.x += (dx/dist) * e.speed;
      e.y += (dy/dist) * e.speed;
    }
  }

  // overlaping and spacing with enemies
  separateEnemies(enemies);

  // collisions
  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    if (rectIntersect(e.x, e.y, e.width, e.height, player.x, player.y, player.width, player.height)) {
      if (!player.isImmune) {
        player.health -= waveEnemyDamage;
        updateHealthBar();
        if (player.health <= 0) {
          handlePlayerDefeat();
          return; 
        }
      }
    }
  }
}

function separateEnemies(enemies) {
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i+1; j < enemies.length; j++) {
      let e1 = enemies[i];
      let e2 = enemies[j];
      
      let dx = (e2.x + e2.width/2) - (e1.x + e1.width/2);
      let dy = (e2.y + e2.height/2) - (e1.y + e1.height/2);
      let dist = Math.sqrt(dx*dx + dy*dy);

      let minDist = 35; 
      if (dist < minDist && dist > 0) {
        let overlap = (minDist - dist) / 2;
        dx /= dist; 
        dy /= dist;
        e1.x -= dx * overlap;
        e1.y -= dy * overlap;
        e2.x += dx * overlap;
        e2.y += dy * overlap;
      }
    }
  }
}

function updatePotions() {
  // Immunity potions
  for (let i = potions.length - 1; i >= 0; i--) {
    let p = potions[i];
    if (rectIntersect(p.x, p.y, p.size, p.size, player.x, player.y, player.width, player.height)) {
      player.isImmune = true;
      player.immunityTimer = 300; // 5s
      potions.splice(i, 1);
    }
  }

  // Health potions
  for (let i = healthPotions.length - 1; i >= 0; i--) {
    let hp = healthPotions[i];
    if (rectIntersect(hp.x, hp.y, hp.size, hp.size, player.x, player.y, player.width, player.height)) {
      player.health = Math.min(player.health + 50, player.maxHealth);
      updateHealthBar();
      healthPotions.splice(i, 1);
    }
  }
}

function waveManagerUpdate(timestamp) {
  // overlay
  if (!waveInProgress && currentWave <= maxWaves && !victoryOverlayActive) {
    const waveOverlay = document.getElementById('waveOverlay');

    if (waveOverlayActive) {
      waveOverlayTimer--;
      if (waveOverlayTimer <= 0) {
        hideWaveOverlay();
        waveDelayTimer = 3 * FRAMES_PER_SECOND;
      }
    } 
    else if (waveDelayTimer > 0) {
      waveDelayTimer--;
      if (waveDelayTimer <= 0) {
        startWave(currentWave);
      }
    } 
    else {
      showWaveOverlay(currentWave);
    }
  }

  // If wave in progress then shoot bullets and spawn health potions
  if (waveInProgress) {
    shootAtNearestEnemy(timestamp);
    if (timestamp - lastHealthPotionSpawnTime > HEALTH_POTION_RATE) {
      spawnHealthPotion();
      lastHealthPotionSpawnTime = timestamp;
    }
  }

  updateBulletsAndEnemies();

  updatePotions();

  // check wave
  if (waveInProgress && enemies.length === 0) {
    waveInProgress = false;
    grantRandomUpgrade();
    currentWave++;
    if (currentWave > maxWaves) {
      showVictoryOverlay();
    }
  }

  if (victoryOverlayActive) {
    victoryOverlayTimer--;
    if (victoryOverlayTimer <= 0) {
      window.location.href = 'index.html';
    }
  }
}
