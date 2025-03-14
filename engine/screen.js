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
let texturesSrc = ["goober.jpg", "grass.jpg", "beacon.png", "marker.png"];
let textures = {};
let teapot;
let sky = [128, 192, 255];
let renderdis = 2048;
let marker = null;
let nmarker = null;
let deg90 = Math.PI / 2;
let deg180 = Math.PI;
let money = 200;
let noclip = false;
let jumpSpeed = -12;
let grav = -1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  font = loadFont("./engine/assets/googlesans.ttf");
  teapot = loadModel("./engine/assets/teapot.obj");

  texturesSrc.forEach(x => {
    let y = x.replace(/\..{2,5}$/, '');
    textures[y] = loadImage('./engine/assets/' + x);
  });

  makeTitleScreen();
}

function closeTitleScreen() {
  player = new lPlayer(0, 0, 0);
  titlescreen = false;
  inmenu = false;
  wsfail = '';
  tsin.name.remove();
  tsin.svr.remove();
  canvas.onclick = () => requestPointerLock();
  makeHUD();
}

function tick() {
  updatePlayers(deltaTime);
  player.tick(deltaTime);
}

function draw() {
  textFont(font);
  // blendMode(OVERLAY);

  if (!titlescreen) {
    if (sky?.length > 0) {
      drawingContext.disable(drawingContext.DEPTH_TEST);
      fill(...sky);
      noStroke();
      rect(-width / 2, -height / 2, width, height);
      drawingContext.enable(drawingContext.DEPTH_TEST);
    }
    tick();
    draw3D();
  } else {
    background(128);
  }

  push();
  resetMatrix();
  drawingContext.disable(drawingContext.DEPTH_TEST);
  translate(-width / 2, -height / 2);
  if (titlescreen)
    drawTitleScreen();
  drawHUD();
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}

function keyPressed() {
  keys[key.toLowerCase()] = true;
  if (!inmenu && interact && interact.keys.includes(key.toLowerCase()))
    return interact.obj.interact[key.toLowerCase()].apply(interact.obj, []);
  if (!inmenu && (key == 'm' || key == 'M'))
    nmarker = createVector(player.pos.x, player.pos.z);
  if (!inmenu && (key == '=' || key == '+'))
    firstperson = !firstperson;
}

function keyReleased() {
  keys[key.toLowerCase()] = false;
}

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