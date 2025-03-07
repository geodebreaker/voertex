let player;
let speed = 3;
let sprint = 5;
let sensitivity = 0.005;
let camYaw = 0, camPitch = 0;
let keys = {};
let font;
let inmenu = false;
let inputbox;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  player = new lPlayer(0, 0);

  canvas.onclick = () => requestPointerLock();
  font = loadFont("./engine/assets/comicsans.ttf");

  players['hehehe'] = new mPlayer({buffer:[{x:100,y:50,s:'hi'}]}, 'hehehe');
}

function tick() {
  let dt = deltaTime * 0.06;
  updatePlayers(dt);
  player.tick(dt);
}

function draw() {
  tick();

  background(20);

  rotateX(camPitch);
  rotateY(camYaw);

  translate(-player.pos.x, 0, -player.pos.y);

  drawGrid(1000, 50);

  Object.values(players).map(x => x.render())

  player.render();
}

function keyPressed() { keys[key.toLowerCase()] = true; }
function keyReleased() { keys[key.toLowerCase()] = false; }

function mouseMoved(event) {
  if (document.pointerLockElement === canvas) {
    camYaw += event.movementX * sensitivity;
    camPitch -= event.movementY * sensitivity;
    camPitch = constrain(camPitch, -PI / 2, PI / 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawGrid(size, step) {
  stroke(100);
  for (let x = -size / 2; x <= size / 2; x += step) {
    line(x, 0, -size / 2, x, 0, size / 2);
  }
  for (let z = -size / 2; z <= size / 2; z += step) {
    line(-size / 2, 0, z, size / 2, 0, z);
  }
}

function drawFloatingText(txt, t) {
  push();
  translate(0, -50, 0);
  rotateY(-camYaw);
  rotateX(-camPitch);

  textAlign(CENTER, CENTER);
  textSize(t ? 18 : 12);
  textFont(font);
  let twidth = textWidth(txt);
  let theight = textAscent() + textDescent();

  fill(t ? color(255) : color(64, 64, 64, 128));
  noStroke();
  rectMode(CENTER);
  rect(0, 3, twidth + 10, theight + 3);

  fill(t ? 0 : 255);
  stroke(0);
  strokeWeight(2);
  text(txt, 0, 0);
  pop();
}