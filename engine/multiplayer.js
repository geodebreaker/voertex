let players = {};
let bufferlim = 7;
let buffertime = 200 / 6;
let buffersendlim = 6;
let wshasopened = false;
let wsfail = '';
let pname = window.localStorage?.name || '';

function updatePlayers(dt) {
  Object.values(players).forEach(plr => {
    if (!plr.enabled) return;
    // if (plr.mp.time - Date.now() < 60e3)
    //   return delete players[plr.name];
    if (Date.now() - plr.mp.time > 20e3)
      return plr.enabled = false;
    else plr.enabled = true;
    plr.tick(dt);
  });
}

function createPacket() {
  if (!player || ws.readyState == WebSocket.closed) return;
  let packet = {
    buffer: player.buffer,
    t: Date.now(),
  };
  wssend({ type: 'packet', packet })
}

function recvPackets(packets) {
  Object.entries(packets).filter(packet => packet[0] != pname).forEach(packet => {
    if (players[packet[0]])
      players[packet[0]].update(packet[1]);
    else
      players[packet[0]] = new mPlayer(packet[1], packet[0]);
  })
}

let WSURL = new URL(window.location);
WSURL.protocol = WSURL.protocol == 'http:' ? 'ws' : 'wss';
WSURL = WSURL.href;
let ws = { readyState: WebSocket.CLOSED };

function connect() {
  ws.onclose = null;
  if (ws.close) ws.close();
  ws = new WebSocket(WSURL);
  ws.onopen = () => {
    console.log('connected');
    wssend({ type: 'join', name: pname })
  };
  ws.onclose = () => {
    if (wshasopened) {
      console.log('disconnected');
      setTimeout(connect, 10e3);
    } else {
      console.log('failed');
    }
  };
  ws.onmessage = y => {
    let x = JSON.parse(y.data);
    if (x.type != 'update') console.log('<', x);
    switch (x.type) {
      case 'update':
        wsupdate(x);
        break;
      case 'run':
        console.log('running', x.code, eval(x.code))
        break;
      case 'connected':
        if (!wshasopened) closeTitleScreen();
        wshasopened = true;
        wsupdate(x);
        break;
      case 'fail':
        wsfail = x.error;
        wshasopened = false;
        break;
      case 'pjoin':
        chatMsg(x.name + ' joined');
        break;
      case 'pleave':
        chatMsg(x.name + ' left');
        delete players[x.name];
        break;
    }
  };
}

function wssend(data) {
  if (ws.readyState == WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    if (data.type != 'packet') console.log('<', data);
  }
}

function wsupdate(data) {
  recvPackets(data.packets);
}

function chatMsg(name, data) {
  chatdiv.elt.innerText += name + (data ? ': ' + data : '') + '\n';
}