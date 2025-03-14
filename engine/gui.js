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
  txt = '$' + money;
  twidth = textWidth(txt);
  theight = textLeading() * (txt.split('\n').length);
  fill(0, 0, 0, 128);
  rect(-twidth - 5, -theight -5, twidth + 10, theight + 10);
  fill(255);
  text(txt, 0, 0);
  pop();

  push();
  translate(width / 2, height / 2);
  fill(255);
  stroke(0);
  strokeWeight(3);
  circle(0, 0, 10);
  if (interact) {
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
  tsin.name.position(width / 2 - 180, height * .75);
  tsin.svr.position(width / 2 - 180, height * .75 + 40);

  textFont(font);
  fill(255);
  push();
  translate(width / 2 - 250, height * .75);
  textAlign(LEFT, CENTER);
  textSize(18);
  text('Name:', 0, 10);
  translate(0, 40);
  text('Server:', 0, 10);
  pop();
  push();
  translate(width / 2, height * .25);
  textAlign(CENTER, CENTER);
  textSize(70);
  text('VOERTEX', 0, 0)
  pop();
}

function makeTitleScreen() {
  let conn = e => {
    if (e.key == "Enter") {
      if (tsin.svr.value()) WSURL = (location.protocol == 'http:' ? 'ws://' : 'wss://') + tsin.svr.value();
      pname = tsin.name.value();
      if (pname.length >= 3 && pname.length <= 12) {
        if (window.localStorage) localStorage.name = pname;
        connect(true);
      } else wsfail = 'name needs to be between 3 and 12 chars long.';
    }
  };
  titlescreen = true;
  inmenu = true;
  tsin = {};
  tsin.name = createInput(pname);
  tsin.name.position(width / 2 - 180, height * .75);
  tsin.name.size(430, 20);
  tsin.name.elt.focus();
  tsin.name.elt.onkeydown = conn;
  tsin.svr = createInput('');
  tsin.svr.position(width / 2 - 180, height * .75 + 40);
  tsin.svr.size(430, 20);
  tsin.svr.elt.placeholder = 'LEAVE BLANK TO AUTOFIND';
  tsin.svr.elt.onkeydown = conn;
}

function makeHUD() {
  chatdiv = createDiv("");
  chatdiv.position(30, 30);
  chatdiv.size(270, 130);
}

function chatMsg(name, data) {
  chatdiv.elt.innerText += name + (data ? ': ' + data : '') + '\n';
  chatdiv.elt.scrollTop = chatdiv.elt.scrollHeight;
}