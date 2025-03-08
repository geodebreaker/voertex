let player;
let speed = 3;
let sprint = 5;
let sensitivity = 0.005;
let camYaw = 0, camPitch = 0;
let keys = {};
let font;
let inmenu;
let inputbox;
let firstperson = 1;
let texturesSrc = ["goober.jpg", "grass.jpg"];
let textures = {};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  font = loadFont("./engine/assets/googlesans.ttf");

  texturesSrc.forEach(x => {
    let y = x.replace(/\..{2,5}$/, '');
    textures[y] = loadImage('./engine/assets/' + x);
  });

  makeTitleScreen();
}

function closeTitleScreen() {
  player = new lPlayer(0, 0);
  titlescreen = false;
  inmenu = false;
  wsfail = '';
  tsin.name.remove();
  canvas.onclick = () => requestPointerLock();
  makeHUD();
}

function tick() {
  updatePlayers(deltaTime);
  player.tick(deltaTime);
}

function draw() {
  textFont(font);
  if (!titlescreen) {
    background(128, 192, 255);
    tick();
    draw3D();
  } else {
    background(128);
  }

  push();
  resetMatrix();
  let gl = this._renderer.GL;
  gl.disable(gl.DEPTH_TEST);
  translate(-width / 2, -height / 2);
  if (titlescreen)
    drawTitleScreen();
  drawHUD();
  gl.enable(gl.DEPTH_TEST);
  pop();
}

function draw3D() {
  push();
  if (firstperson) {
    perspective(PI / 2.8, width / height, 0.1, 5000);
    camera(
      player.pos.x, /*pos.y*/-100, player.pos.y,
      player.pos.x + cos(camYaw - PI / 2),
      -100 + tan(-camPitch),
      player.pos.y + sin(camYaw - PI / 2),
      0, 1, 0
    );
  } else {
    camera(0, 0, 800);

    rotateX(camPitch);
    rotateY(camYaw);

    translate(-player.pos.x, 0, -player.pos.y);
  }

  drawGrid(1000, 50);

  Object.values(players).map(x => x.render())

  if (!firstperson)
    player.render();

  objDraw.forEach(x => {
    push();
    translate(...x.pos.slice(0, 3));
    if (x.tex) {
      texture(textures[x.tex]);
    } else {
      fill(...x.col.slice(0, 3));
    }
    if (x.col[3] != undefined) {
      stroke(...x.col.slice(3, 6));
      strokeWeight(x.col[6] ?? 1);
    } else {
      noStroke();
    }
    box(...x.pos.slice(3, 6));
    pop();
  });
  pop();
}

function keyPressed() {
  if (!inmenu && key == '=' || key == '+')
    firstperson = !firstperson;
  keys[key.toLowerCase()] = true;
}
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
  let floorSize = 5000;
  push();
  // textureMode(NORMAL);
  textureWrap(MIRROR);
  rotateX(HALF_PI);
  // rotateZ(camYaw);
  translate(player.pos.x - player.pos.x % 128, player.pos.y - player.pos.y % 128, -1);
  // fill(0, 200, 0);
  // noStroke();
  // plane(10000, 10000);
  texture(textures['grass']);
  beginShape();
  vertex(-floorSize / 2, -floorSize / 2, 0, 0);
  vertex(floorSize / 2, -floorSize / 2, floorSize, 0);
  vertex(floorSize / 2, floorSize / 2, 0, floorSize, floorSize);
  vertex(-floorSize / 2, floorSize / 2, 0, 0, floorSize);
  endShape();
  pop();

  push();
  stroke(0);
  strokeWeight(1);
  for (let x = -size / 2; x <= size / 2; x += step) {
    line(x, 0, -size / 2, x, 0, size / 2);
  }
  for (let z = -size / 2; z <= size / 2; z += step) {
    line(-size / 2, 0, z, size / 2, 0, z);
  }
  pop();
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
  text(txt, 0, 0);
  pop();
}

let objDraw = [
  {
    pos: [100, -60, 150, 50, 50, 50],
    col: [0, 0, 255]
  }, {
    pos: [200, -50, -250, 50, 10, 50],
    tex: "goober",
    col: [0, 0, 0, 255, 255, 0, 3]
  }
]