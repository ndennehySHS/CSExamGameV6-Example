// frogger.js
let frog;
let cars = [];
let logs = [];
let lives = 3;
let score = 0;
let portal;

// Set API_BASE to the absolute URL if needed, or leave as an empty string for relative paths.
const API_BASE = ''; 

let carTexs = [] //car textures
let portalTex;
let mapTex;
let logTex;

function preload(){
  carTexs = [
    loadImage('assets/car1.png'),
    loadImage('assets/car2.png'),
    loadImage('assets/car3.png'),
    loadImage('assets/car4.png')
  ]
  portalTex = loadImage('assets/Portal.png')
  mapTex = loadImage('assets/map.png')
  logTex = loadImage('assets/log.png')
}

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('gameCanvas');
  frog = new Frog();
  portal = new Portal(random(width - 40), random(40, 200));
  for (let i = 0; i < 5; i++) {
    cars.push(new Car(i * 160 + 80, 320));
    logs.push(new Log(i * 160 + 80, 100));
  }
}

function draw() {
  background(173, 216, 230);
  image(mapTex,0,0,800,600)
  displayScore();
  portal.show();
  frog.show();
  frog.move();

  for (let car of cars) {
    car.show();
    car.move();
  }

  for (let log of logs) {
    log.show();
    log.move();
  }

  checkCollisions();
  checkSuccess();
}

function displayScore() {
  fill(255);
  textSize(24);
  text(`Score: ${score}`, 10, 30);
  text(`Lives: ${lives}`, 10, 60);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    frog.setDir(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    frog.setDir(1, 0);
  } else if (keyCode === UP_ARROW) {
    frog.setDir(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    frog.setDir(0, 1);
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || DOWN_ARROW) {
    frog.setDir(0, 0);
  }
}

function checkCollisions() {
  for (let car of cars) {
    if (car.hits(frog)) {
      lives -= 1;
      frog.reset();
      if (lives <= 0) {
        gameOver();
      }
    }
  }
  for (let log of logs) {
    if (log.hits(frog)) {
      score += 10;
      frog.reset();
    }
  }
}

function checkSuccess() {
  if (portal.hits(frog)) {
    score += 50; // Award points for reaching the portal
    frog.reset();
    portal.relocate(); // Change portal position
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
        scoreSource: "Frogger"
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

class Frog {
  constructor() {
    this.x = width / 2;
    this.y = height - 60;
    this.xdir = 0;
    this.ydir = 0;
  }

  show() {
    fill(0, 255, 0);
    rect(this.x, this.y, 40, 40);
  }

  setDir(xdir, ydir) {
    this.xdir = xdir;
    this.ydir = ydir;
  }

  move() {
    this.x += this.xdir * 20; // Reduced movement distance
    this.y += this.ydir * 20; // Reduced movement distance
    this.x = constrain(this.x, 0, width - 40);
    this.y = constrain(this.y, 0, height - 40);
  }

  reset() {
    this.x = width / 2;
    this.y = height - 60;
  }
}

class Car {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.xdir = 1;
    let randomTex = Math.round(Math.random()*3)
    this.tex = carTexs[randomTex]
  }

  show() {
    if (this.xdir > 0) {
        push();
        translate(this.x + 50, this.y + 25); 
        rotate(PI); 
        image(this.tex, -50, -25, 100, 50); 
        pop();
    } else {
        image(this.tex, this.x, this.y+150, 100, 50);
    }
  }

  move() {
    this.x += this.xdir * 2;
    if (this.x > width || this.x < -100) {
      this.xdir *= -1;
    }
  }

  hits(frog) {
    let d = dist(this.x + 40, this.y + 20, frog.x + 20, frog.y + 20);
    return d < 40;
  }
}

class Log {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
    this.xdir = 1;
  }

  show() {
    fill(139, 69, 19);
    if(this.xdir < 0){
      image(logTex,this.x, this.y-60, 80, 50)
    }else{
      image(logTex,this.x, this.y, 80, 50)

    }
  }

  move() {
    this.x += this.xdir * 2;
    if (this.x > width || this.x < -80) {
      this.xdir *= -1;
    }
  }

  hits(frog) {
    let d = dist(this.x + 40, this.y + 20, frog.x + 20, frog.y + 20);
    return d < 40;
  }
}

class Portal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 40;
  }

  show() {
    fill(128, 0, 128);
    image(portalTex, this.x, this.y, 50, 50);
  }

  hits(frog) {
    let d = dist(this.x + 20, this.y + 20, frog.x + 20, frog.y + 20);
    return d < 40;
  }

  relocate() {
    this.x = random(width - 40);
    this.y = random(40, 200);
  }
}