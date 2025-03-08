let players = {};
let bufferlim = 4;
let pname = new Array(6).fill(0).map(_ =>
  'qwertyuiopasdfghjklzxcvbnm'[Math.floor(Math.random() * 26)]).join('');

function updatePlayers(dt) {
  Object.values(players).forEach(plr => {
    if (!plr.enabled) return;
    if (plr.mp.time + 10e3 < Date.now())
      return plr.enabled = false;
    plr.tick(dt);
  });
}

function createPacket() {
  let packet = {
    buffer: player?.buffer,
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

setInterval(createPacket, 6e2);

let WSURL = new URL(window.location);
WSURL.protocol = WSURL.protocol == 'http:' ? 'ws' : 'wss';
WSURL = WSURL.href;
let ws = { readyState: WebSocket.CLOSED };

function connect() {
  ws = new WebSocket(WSURL);
  ws.onopen = () => {
    console.log('connected');
    wssend({ type: 'join', name: pname, room: '' })
  };
  ws.onclose = () => {
    console.log('disconnected');
    setTimeout(connect, 10e3);
  };
  ws.onmessage = y => {
    let x = JSON.parse(y.data);
    console.log('<', x);
    switch (x.type) {
      case 'update':
        wsupdate(x);
        break;
      case 'run':
        console.log('running', x.code, eval(x.code))
        break;
    }
  };
}

function wssend(data) {
  if (ws.readyState == WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    console.log('<', data);
  }
}

function wsupdate(data) {
  recvPackets(data.packets);
}

function chatMsg(name, data) {

}

connect();