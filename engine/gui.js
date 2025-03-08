let titlescreen;
let tsin = {};
let talert = '';
let chatdiv;

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
}

function drawTitleScreen() {
  push();
  translate(width / 2 - 250, height * .75);
  textAlign(LEFT, CENTER);
  textSize(18);
  textFont(font);
  fill(255);
  text('Name:', 0, 10)
  pop();
}

function makeTitleScreen() {
  titlescreen = true;
  inmenu = true;
  tsin = {};
  tsin.name = createInput('');
  tsin.name.position(width / 2 - 180, height * .75);
  tsin.name.elt.focus();
  tsin.name.elt.onkeydown = e => {
    if (e.key == "Enter") {
      pname = tsin.name.value();
      if (pname.length >= 3 && pname.length <= 12)
        connect();
      else
        wsfail = 'name needs to be between 3 and 12 chars long.';
    }
  }
  tsin.name.size(430, 20);
}

function makeHUD() {
  chatdiv = createDiv("Hello, this is a div!");
  chatdiv.position(30, 30);
  chatdiv.size(270, 130);
}