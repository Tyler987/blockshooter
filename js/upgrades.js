// upgrades.js

let upgradeCounts = {
    speed: 0,
    strength: 0,
    health: 0,
    bulletSpeed: 0,
    immunityPotions: 0,
    multiShot: 0
  };
  
  function grantRandomUpgrade() {
    // 10% chance for multiShot
    let roll = Math.random();
    if (roll < 0.1) {
      player.hasMultiShot = true;
      upgradeCounts.multiShot++;
      updateUpgradeStats();
      return;
    }
  
    // normal pool
    let normalUpgrades = ['speed', 'strength', 'health', 'bulletSpeed'];
    if (!player.immunityUnlocked) {
      normalUpgrades.push('immunityPotions');
    }
  
    let pick = normalUpgrades[Math.floor(Math.random() * normalUpgrades.length)];
    switch(pick) {
      case 'speed':
        player.speed += 1; 
        upgradeCounts.speed++;
        break;
      case 'strength':
        player.strength += 5; 
        upgradeCounts.strength++;
        break;
      case 'health':
        player.maxHealth += 20;
        player.health = player.maxHealth; 
        upgradeCounts.health++;
        updateHealthBar();
        break;
      case 'bulletSpeed':
        player.bulletSpeed += 2;
        upgradeCounts.bulletSpeed++;
        break;
      case 'immunityPotions':
        player.immunityUnlocked = true;
        upgradeCounts.immunityPotions = 1;
        break;
    }
    updateUpgradeStats();
  }
  
  function updateUpgradeStats() {
    let list = document.getElementById('upgradeStats');
    list.innerHTML = '';
    for (let key in upgradeCounts) {
      if (upgradeCounts[key] > 0) {
        let li = document.createElement('li');
        li.textContent = `${key}: ${upgradeCounts[key]}`;
        list.appendChild(li);
      }
    }
  }
  