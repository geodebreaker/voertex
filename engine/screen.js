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
let texturesSrc = ["goober.jpg", "grass.jpg", "beacon.png", "marker.png", "ladder.png", "opaque.webp", "bg.webp"];
let textures = {};
let teapot;
let sky = [128, 192, 255];
let renderdis = 8192;
let marker = null;
let nmarker = null;
let deg90 = Math.PI / 2;
let deg180 = Math.PI;
let money = 200;
let noclip = false;
let jumpSpeed = 12;
let grav = -1;
let tileShader;
let ladderSpeed = 4;
let onladder = false;
let floor = "grass";
let minimenu = null;
let mmcon = {
  main: {
    Z: ["Respawn", () => player.pos = createVector(0, 0, 0)],
    X: ["Marker", () => nmarker = createVector(player.pos.x, player.pos.z)],
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  font = loadFont("./engine/assets/googlesans.ttf");
  teapot = loadModel("./engine/assets/teapot.obj");
  tileShader = loadShader('./engine/lib/tile.vert', './engine/lib/tile.frag');

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
    } else {
      bg(true);
    }
    tick();
    draw3D();
  } else {
    background(0);
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
  if (minimenu && mmcon[minimenu][key.toUpperCase()]) {
    let mm = minimenu;
    minimenu = null;
    mmcon[mm][key.toUpperCase()][1]();
    return;
  }
  if (!inmenu && interact && interact.keys.includes(key.toLowerCase()))
    return interact.obj.interact[key.toLowerCase()].apply(interact.obj, []);
  if ((!inmenu || minimenu) && (key == 'q' || key == 'Q')) {
    minimenu = minimenu ? null : 'main';
  }
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

function cheats(name) {
  if (pname.startsWith(name)) {
    // noclip = 1;
    jumpSpeed = 40;
    speed = 10;
    sprint = 15;
    money = 1000000;
  }
}

let timeOff = 0;
function now() {
  return Date.now() + timeOff;
}


function bg(x) {
  push();
  if (x) {
    translate(-width / 2, -height / 2);
    drawingContext.disable(drawingContext.DEPTH_TEST);
  }
  let fc = frameCount * 0.1;
  let fx = sin(fc * 0.1) * 20 + fc + camYaw * -50;
  let fy = cos(fc * 0.1) * 20 + fc + camPitch * 50;
  textureWrap(MIRROR);
  texture(textures.bg);
  tint(192);
  beginShape();
  vertex(0, 0, fx, fy);
  vertex(width, 0, width + fx, fy);
  vertex(width, height, 0, width + fx, height + fy);
  vertex(0, height, 0, fx, height + fy);
  endShape();
  if (x) drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}