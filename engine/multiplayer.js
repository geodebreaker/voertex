let players = {};
let buffersendlim = 5;
let bufferlim = buffersendlim + 1;
let buffertime = 200 / buffersendlim; // 200 is also on server side
let wshasopened = false;
let wsfail = '';
let pname = window.localStorage?.name || '';
let mapUD = [];
let chatToSend = [];
let serverid = null;

function updatePlayers(dt) {
  Object.values(players).forEach(plr => {
    if (!plr.enabled) return;
    // if (plr.mp.time - now() < 60e3)
    //   return delete players[plr.name];
    if (now() - plr.mp.time > 20e3)
      return plr.enabled = false;
    else plr.enabled = true;
    plr.tick(dt);
  });
}

function createPacket() {
  if (!player || ws.readyState == WebSocket.closed) return;
  let packet = {
    buffer: player.buffer,
    t: now(),
    mapUD,
    persist: {
      money,
      pos: [player.pos.x, player.pos.y, player.pos.z]
    },
    marker: nmarker ? [nmarker.x, nmarker.y] : undefined,
    chat: chatToSend
  };
  chatToSend = [];
  if (nmarker) marker = nmarker;
  nmarker = null;
  mapUD = [];
  wssend({ type: 'packet', packet })
}

function recvPackets(packets) {
  Object.entries(packets)/*.filter(packet => packet[0] != pname)*/.forEach(packet => {
    if (players[packet[0]])
      players[packet[0]].update(packet[1]);
    else
      players[packet[0]] = new mPlayer(packet[1], packet[0]);
  })
}

let WSURL = null;

(async () => {
  let url = new URL(window.location);
  let urls = [];
  url.protocol = url.protocol == 'http:' ? 'ws' : 'wss';
  urls[1] = url.href;
  url.host = 'svr.' + url.host;
  urls[0] = url.href;
  for (let i = 0; i < urls.length; i++) {
    let res = await testUrl(urls[i]);
    if (res) {
      WSURL = urls[i];
      connect(res);
      return
    }
  }
  wsfail = 'Could not find server. Please provide server.';
  setTimeout(() => WSURL = (location.protocol == 'http:' ? 'ws://' : 'wss://') + prompt('Provide server:'), 5e2);
})();

let ws = { readyState: WebSocket.CLOSED };

function connect(iws) {
  if (!iws) talert = 'Connecting...';
  ws.onclose = null;
  if (ws.close) ws.close();
  ws = iws || new WebSocket(WSURL);
  ws.onopen = () => { 
    if (!iws) console.log('connected');
    joinGame();
  };
  ws.onclose = () => {
    talert = '';
    if (wshasopened) {
      console.log('disconnected');
      setTimeout(connect, 10e3);
    } else {
      if (!wsfail) wsfail = 'Could not connect to server';
      console.log('failed');
    }
  };
  ws.onmessage = y => {
    let x = JSON.parse(y.data);
    if (x.type != 'update' && x.type != 'connected') console.log('<', x);
    switch (x.type) {
      case 'update':
        wsupdate(x);
        break;
      case 'run':
        console.log('running', x.code, eval(x.code))
        break;
      case 'connected':
        talert = '';
        if (!wshasopened) closeTitleScreen();
        wshasopened = true;
        wsupdate(x);
        break;
      case 'fail':
        talert = '';
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
  if (iws) console.log('connected');
}

function joinGame() {
  talert = 'Joining...';
  wssend({ type: 'join', name: pname, svr: 'main' });
}

function wssend(data) {
  if (ws.readyState == WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    // if (data.type == 'packet' && data.packet.mapUD.length > 0) console.log(data);
    if (data.type != 'packet') console.log('<', data);
  }
}

function wsupdate(data) {
  if (data.map) {
    eval(data.map);
    createWorld();
  }
  if (data.persist) {
    money = /*Skey +*/ data.persist.money;
    if (data.persist.pos) player.pos.set(...data.persist.pos);
  }
  if (data.marker) {
    marker = createVector(...data.marker);
  }
  if (data.chat) {
    data.chat.forEach(x => {
      chatMsg(x[0], x[1])
    });
  }
  if (data.time) timeOff = data.time - Date.now();
  data.mapUD.map(x => domapUD(x));
  recvPackets(data.packets);
}

function testUrl(url) {
  return new Promise(y => {
    let ws = new WebSocket(url);
    let hr = false;
    ws.onmessage = x => {
      hr = true;
      try {
        if (JSON.parse(x.data).type == 'servers') {
          y(ws);
        } else {
          ws.close();
          y(false);
        }
      } catch (e) {
        ws.close();
        y(false);
      }
    };
    ws.onclose = () => {
      if (hr) return;
      hr = true;
      y(false);
    }
    setTimeout(() => {
      if (hr) return;
      hr = true;
      ws.close();
      y(false);
    }, 3e3);
  });
}