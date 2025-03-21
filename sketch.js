let player;
let e = 2.71828;
let aliens = [];
let fastAliens = [];
let bullets = [];
let lives = 3;
let score = 0;
let speedMultiplier = 1;
let alienImage;
let playerImage;
let bulletCount = 50;

// Set API_BASE to the absolute URL if needed, or leave as an empty string for relative paths.
const API_BASE = ''; 

function preload() {
    alienImage = loadImage('https://th.bing.com/th/id/R.f0c84304e094dec729db296558e03ac9?rik=myKA4vmvbKfLVQ&riu=http%3a%2f%2fwww.pngmart.com%2ffiles%2f4%2fSpace-Invaders-PNG-HD.png&ehk=nhM4Padb92XepZZTAJMMbNV38Z2sbK%2bCU2%2f7rnA2WGc%3d&risl=&pid=ImgRaw&r=0');
    playerImage = loadImage('https://art.pixilart.com/5356d58376909d9.png');
}

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('gameCanvas');
    resetGame();
    setInterval(spawnAliens, 5000);
    setInterval(spawnFastAliens, 10000);
    setInterval(increaseSpeed, 10000); // Increase speed every 10 seconds
    setInterval(addBullet, 1000); // Add a bullet every second
}

function draw() {
    background(173, 216, 230);
    displayScore();
    player.show();
    player.move();

    for (let bullet of bullets) {
        bullet.show();
        bullet.move();
    }

    for (let alien of aliens) {
        alien.show();
        alien.move();
    }

    for (let fastAlien of fastAliens) {
        fastAlien.show();
        fastAlien.move();
    }

    checkCollisions();
    checkPlayerHit();
}

function resetGame() {
    player = new Player();
    aliens = [];
    fastAliens = [];
    bullets = [];
    lives = 3;
    bulletCount = 50;
    speedMultiplier = 1;
    score = 0;
    spawnAliens();
    spawnFastAliens();
    loop();
}

function spawnAliens() {
    for (let i = 0; i < 5; i++) {
        aliens.push(new Alien(i * 80 + 80, 60));
    }
}

function spawnFastAliens() {
    for (let i = 0; i < 5; i++) {
        fastAliens.push(new FastAlien(i * 80 + 80, 120));
    }
}

function increaseSpeed() {
    speedMultiplier *= 2; // Increase speed multiplier by 100% every 10 seconds
}

function displayScore() {
    fill(255);
    textSize(24);
    text(`Score: ${score}`, 10, 30);
    text(`Lives: ${lives}`, 10, 60);
    text(`Bullets: ${bulletCount}`, 10, 90);
    text(`Speed Multiplier: ${speedMultiplier.toFixed(2)}`, 10, 120);
}

function keyPressed() {
    if (key === ' ' && bulletCount > 0) {
        bullets.push(new Bullet(player.x + 30, player.y));
        bulletCount--;
    }
    if (keyCode === LEFT_ARROW) {
        player.setDir(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
        player.setDir(1, 0);
    } else if (keyCode === UP_ARROW) {
        player.setDir(0, -1);
    } else if (keyCode === DOWN_ARROW) {
        player.setDir(0, 1);
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
        player.setDir(0, 0);
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            if (bullets[i] && bullets[i].hits(aliens[j])) {
                score += 10;
                aliens.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
        for (let k = fastAliens.length - 1; k >= 0; k--) {
            if (bullets[i] && bullets[i].hits(fastAliens[k])) {
                score += 20;
                fastAliens.splice(k, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

function checkPlayerHit() {
    for (let i = aliens.length - 1; i >= 0; i--) {
        if (aliens[i] instanceof Alien && aliens[i].hits(player)) {
            lives -= 1;
            aliens.splice(i, 1);
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    for (let i = fastAliens.length - 1; i >= 0; i--) {
        if (fastAliens[i] instanceof FastAlien && fastAliens[i].hits(player)) {
            lives -= 1;
            fastAliens.splice(i, 1);
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

function gameOver() {
    noLoop();
    let playerName = prompt(`Game Over!\nScore = ${score}\nEnter your name:`).trim();
    if (playerName) {
      // Submit the score to the database.
      fetch(`${API_BASE}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: playerName,
          score: score,
          scoreSource: "Space Invaders"
        })
      })
      .then(response => {
        if (!response.ok) {
          // If the response is not OK, extract the error message.
          return response.json().then(err => { throw new Error(err.error || "Unknown error"); });
        }
        return response.json();
      })
      .then(data => {
        alert(`Score submitted successfully! (ID: ${data.insertedId})`);
      })
      .catch(error => {
        console.error('Error submitting score:', error);
        alert("Score submission failed: " + error.message);
      });
    } else {
      alert("No name entered, score not submitted.");
    }
}

function addBullet() {
    bulletCount++;
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.xdir = 0;
        this.ydir = 0;
    }

    show() {
        image(playerImage, this.x, this.y, 60, 60);
    }

    setDir(xdir, ydir) {
        this.xdir = xdir;
        this.ydir = ydir;
    }

    move() {
        this.x += this.xdir * 5;
        this.y += this.ydir * 5;
        this.x = constrain(this.x, 0, width - 60);
        this.y = constrain(this.y, 0, height - 60);
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 8;
    }

    show() {
        fill(50, 205, 50);
        ellipse(this.x, this.y, this.r * 2);
    }

    move() {
        this.y = this.y - 5;
    }

    hits(alien) {
        let d = dist(this.x, this.y, alien.x + 30, alien.y + 30);
        return d < this.r + alien.r;
    }
}

class Alien {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 30;
        this.xdir = 1 * -speedMultiplier;
    }

    show() {
        image(alienImage, this.x, this.y, 60, 60);
    }

    move() {
        this.x += this.xdir;
        if (this.x > width || this.x < 0) {
            this.xdir *= -1;
            this.y += this.r;
        }
    }

    hits(player) {
        let d = dist(this.x + 30, this.y + 30, player.x + 30, player.y + 30);
        return d < 30 + 30;
    }
}

class FastAlien extends Alien {
    constructor(x, y) {
        super(x, y);
        this.xdir = 5 * speedMultiplier;
        this.ydir = 1 * speedMultiplier;
    }
}