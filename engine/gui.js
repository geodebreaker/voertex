let titlescreen;
let tsin = {};
let talert = '';
let chatdiv;
let interact = null;

function drawHUD() {
  let txt;
  push();
  translate(width / 2, 0);
  textAlign(CENTER, TOP);
  textSize(30);
  if (wsfail)
    txt = wsfail
  else if (wshasopened && ws.readyState == WebSocket.CLOSED)
    txt = 'Disconnected...';
  else if (talert)
    txt = talert;
  if (txt) {
    let twidth = textWidth(txt);
    let theight = textAscent() + textDescent();
    fill(64, 64, 64, 128);
    noStroke();
    rectMode(CENTER);
    rect(10, 30, twidth + 10, theight - 3);
    txt == talert ? fill(255) : fill(255, 0, 0);
    text(txt, 10, 10)
  }
  pop();
  if (titlescreen) return;
  push();
  translate(20, 20);
  fill(0, 0, 0, 128);
  rect(0, 0, 300, 200);
  if (!inputbox) {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(22);
    text('Press [T] to type...', 10, 160);
  }
  pop();
  push();
  translate(width - 15, 15);
  textAlign(RIGHT, TOP);
  textSize(12);
  txt = Math.floor(frameRate()) + ' FPS\n' + Object.entries(players).map(plr =>
    (plr[1].ping) + ' - ' + plr[0]).join('\n');
  let twidth = textWidth(txt);
  let theight = textLeading() * (Object.keys(players).length + 1);
  fill(0, 0, 0, 128);
  rect(-twidth - 5, -5, twidth + 10, theight + 10);
  fill(255);
  text(txt, 0, 0);
  pop();

  push();
  translate(width - 15, height - 15);
  textAlign(RIGHT, BOTTOM);
  textSize(12);
  txt = (minimenu ? Object.entries(mmcon[minimenu]).map(x => `${x[1][0]} [${x[0]}]`).join('\n') :
    Object.entries(inventory).map(x => `${x[1].type}${x[1].amount > 1 ? ' x' + x[1].amount : ''} ` +
      (x[0] == holding ? `{${x[0]}}\n` : `[${x[0]}]\n`)).join('') +
    'MiniMenu [Q]' + (PERM > 0 ? '\nCommand [/]' : ''))
    + '\n$' + money;
  twidth = textWidth(txt);
  theight = textLeading() * (txt.split('\n').length);
  fill(0, 0, 0, 128);
  rect(-twidth - 5, -theight - 5, twidth + 10, theight + 10);
  fill(255);
  text(txt, 0, 0);
  pop();

  push();
  translate(width / 2, height / 2);
  fill(255);
  stroke(0);
  strokeWeight(3);
  circle(0, 0, 10);
  if (interact && interact.text) {
    translate(0, 15);
    textAlign(CENTER, TOP);
    textSize(18);
    twidth = textWidth(interact.text);
    theight = textLeading() * interact.text.split('\n').length;
    fill(0, 0, 0, 128);
    noStroke();
    rect(-twidth / 2 - 5, -5, twidth + 10, theight + 10);
    fill(255);
    text(interact.text, 0, 0);
  }
  pop();
}

function drawTitleScreen() {
  tsin.name.position(width / 2 - 180, height * .85);
  tsin.pass.position(width / 2 - 180, height * .85 + 40);
  tsin.svrs.position(width / 2 - 300, height * .20);
  tsin.svrs.size(600, height * .60);

  bg();

  textFont(font);
  fill(255);
  push();
  translate(width / 2 - 250, height * .85);
  textAlign(LEFT, CENTER);
  textSize(18);
  text('Name:', 0, 10);
  translate(0, 40);
  text('Pass:', 0, 10);
  pop();
  push();
  translate(width / 2 + 60, height * .03);
  textAlign(CENTER, TOP);
  textSize(70);
  text('V OERTEX', -textWidth('V') / 2 - 5, 0);
  translate(-textWidth('OERTEX') / 2 - 60, 20, 45);
  image(textures.opaque, 0, 0);
  pop();
}

function makeTitleScreen() {
  titlescreen = true;
  inmenu = true;
  tsin = {};
  tsin.name = createInput(pname);
  tsin.name.position(width / 2 - 180, height * .85);
  tsin.name.size(430, 20);
  tsin.name.elt.focus();
  tsin.pass = createInput('');
  tsin.pass.position(width / 2 - 180, height * .85 + 40);
  tsin.pass.size(430, 20);
  tsin.pass.elt.placeholder = 'Passwords have not been implemented';
  tsin.svrs = createDiv('');
  tsin.svrs.position(width / 2 - 300, height * .20);
  tsin.svrs.size(600, height * .60);
  tsin.svrs.hide();
}

let svrsto = null;
function displaySvrs(svrs) {
  tsin.svrs.show();
  if (kickr !== false) {
    svrsto = svrs;
    tsin.svrs.elt.innerHTML =
      `<span class="listing kh">You where ${banr ? 'banned' : 'kicked'}</span>` +
      (kickr ? `<span class="listing kr">${kickr}</span>` : '') +
      `<span class="listing" onclick="kickr=false;displaySvrs(svrsto)">OK</span>`;
  } else tsin.svrs.elt.innerHTML = svrs.map(x =>
    `<span class="listing" onclick="joinSvr('${x[0]}')"><b>${x[0]}</b><span class="plrs">${x[1]}</span></span>`).join('');
}

function makeHUD() {
  chatdiv = createDiv("");
  chatdiv.position(30, 30);
  chatdiv.size(270, 130);
}

function chatMsg(a, b = null, c = null) {
  chatdiv.elt.innerHTML +=
    c === null && b !== null ? html`<span class="p">${a}:</span> ${b}<br>` :
      html`<span class="t">${a ? a + ' ' : ''}</span> <span class="p">${b ? b + ' ' : ''}</span> <span class="t">${c || ''}</span><br>`;
  chatdiv.elt.scrollTop = chatdiv.elt.scrollHeight;
}