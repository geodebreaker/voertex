let PERMANTIHACKER = true; // no hacking lol
const fn = x => Function('...args', x);
const $ = x => document.querySelector(x);
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
let texturesSrc = [
  "goober.jpg", "grass.jpg", "beacon.png",
  "marker.png", "ladder.png", "opaque.webp",
  "bg.webp", "yummers.gif"
];
let gifSrc = [];
let textures = {};
let teapot;
let sky = [128, 192, 255];
let renderdis = 4096;
let marker = null;
let nmarker = null;
let deg90 = Math.PI / 2;
let deg180 = Math.PI;
let money = 200;
let noclip = false;
let jumpSpeed = 8;
let grav = -0.5;
let tileShader;
let ladderSpeed = 4;
let onladder = false;
let floor = "grass";
let frozen = false;
let inventory = {
  0: { type: "(empty)", amount: 1 },
  // 1: { type: "tv", data: {}, amount: 2 },
};
let holding = 0;
let items = {
  "(empty)": {},
};
let health = 100;
let maxhealth = 100;
let respawn = 5e3;

let minimenu = null;
let mmcon = {
  main: {
    Z: ["Respawn", () => { if (!frozen) callEvent('game/die', [true], true) }],
    X: ["Marker", () => nmarker = createVector(player.pos.x, player.pos.z)],
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  font = loadFont("./engine/assets/googlesans.ttf");
  teapot = loadModel("./engine/assets/teapot.obj");
  tileShader = loadShader('./engine/lib/tile.vert', './engine/lib/tile.frag');

  makeTitleScreen();

  texturesSrc.forEach(x => {
    if (x.match(/\..{2,5}$/) && x.match(/\..{2,5}$/)[0] == '.gif')
      return gifSrc.push(x);
    let y = x.replace(/\..{2,5}$/, '');
    textures[y] = loadImage('./engine/assets/' + x);
  });

  gifSrc.forEach(async x => {
    let y = x.replace(/\..{2,5}$/, '');
    textures[y] = textures.goober;
    fetch('./engine/assets/' + x).then(z => z.blob().then(z => {
      textures[y] = loadImage(URL.createObjectURL(z));
    }));
  });

  connect();
}

function closeTitleScreen() {
  player = new lPlayer(0, 0, 0);
  titlescreen = false;
  inmenu = false;
  wsfail = '';
  tsin.name.remove();
  tsin.pass.remove();
  tsin.svrs.remove();
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
  if (player?.dead)
    tintscreen('red');
  if (titlescreen)
    drawTitleScreen();
  drawHUD();
  drawingContext.enable(drawingContext.DEPTH_TEST);
  pop();
}

function keyPressed() {
  keys[key.toLowerCase()] = true;
  if (!inmenu && minimenu && mmcon[minimenu][key.toUpperCase()]) {
    let mm = minimenu;
    minimenu = null;
    mmcon[mm][key.toUpperCase()][1]();
    return;
  }
  if (!inmenu && interact && interact.keys.includes(key.toLowerCase()))
    return interact.obj.interact[key.toLowerCase()].apply(interact.obj, []);
  if (!inmenu && (key == 'q' || key == 'Q'))
    minimenu = minimenu ? null : 'main';
  if ((PERM > 0) && !inmenu && (key == '/' || key == '?')) {
    minimenu = minimenu ? null : 'cmd';
    cmdEx = false;
    mmcon.cmd.P[0] = 'Execute';
  }
  if (!inmenu && !minimenu) {
    if (inventory[holding] && items[inventory[holding].type]?.interact?.[key])
      runitem(key);
    Object.keys(inventory).forEach(x => {
      if (key == x || keymap[key] == x) {
        holding = x;
      }
    });
  }
  if (!inmenu && (key == '=' || key == '+'))
    firstperson = !firstperson;
}

function windowBlur() {
  keys.alt = false;
  keys.w = false;
}

function mousePressed() {
  if (inventory[holding] && items[inventory[holding].type]?.interact?.[mouseButton])
    runitem(mouseButton);
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

function registerMM(mm, alpha, m = 'main') {
  let i = 0;
  while (i < alpha.length && mmcon[m][alpha[i]] && mmcon[m][alpha[i]][0] != mm[0]) i++;
  if (mmcon[m][alpha[i]]?.[0] == mm[0]) return;
  if (i < alpha.length) mmcon[m][alpha[i]] = mm;
  else {
    console.log('couldnt register mm', mm[0], m);
  }
}

async function ask(msg) {
  let res = prompt(msg);
  keys = {};
  return res;
}

let params = new URLSearchParams(location.search);
let kickr = params.has('kick') ? params.get('kick') : false;
let banr = params.has('ban');
if (params.has('kill')) localStorage.kill = params.get('kill') == 'true';
history.replaceState('', '', '/');

let keymap = {
  "!": 1,
  "@": 2,
  "#": 3,
  "$": 4,
  "%": 5,
  "^": 6,
  "&": 7,
  "*": 9,
  "(": 9,
  ")": 0
};

function runitem(k) {
  let i = inventory[holding];
  let f = items[i.type].interact[k];
  let x = {
    ...i,
    remove() {
      delete inventory[holding];
      holding = 0;
    }
  };
  f.apply(x);
  Object.entries(x).filter(y => ![
    'remove'
  ].includes(y[0])).forEach(y => i[y[0]] = y[1]);
}

function pickup(type, data) {
  const spots = '123456789';
  let spot, i = 0;
  do spot = spots[i++]
  while (inventory[spot] && inventory[spot].type != type);
  if (!spot) return false;
  if (inventory[spot])
    inventory[spot].amount++;
  else
    inventory[spot] = { type, amount: 1 };
  return true;
}

function heal(amt, revive = false) {
  if (player.dead && !revive) return;
  health += amt;
  if (health > maxhealth) {
    // bonushealth = maxhealth - health;
    health = maxhealth;
  }
  if (health <= 0 && !frozen) {
    callEvent('game/die', [], true);
  }
}

function html(a, ...c) {
  let d = document.createElement('x');
  let b = c.map(x => {
    d.innerText = x;
    return d.innerHTML;
  });
  return a.reduce((x, y, i) => x + y + (b[i] || ''), '');
}

// cheat: press [s], [d] and [shift] while walking (backwards) into a wall, then tab out and back in

addEvent('game/die', fr => {
  health = 0;
  player.dead = true;
  if (respawn !== false || fr) 
    setTimeout(() => callEvent('game/respawn', [], true), respawn === false ? 5e3 : respawn);
});

addEvent('game/respawn', () => {
  player.pos = createVector(0, 0, 0);
  player.dead = false;
  health = maxhealth;
  oldPos = [];
});