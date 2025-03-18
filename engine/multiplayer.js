const NPVER = "0.0";
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
  if ($p_lock$ != PERM) {
    location = '?kick=hacking&ban=true';
    noLoop();
    throw new Error();
  };
  if (!player || ws.readyState == WebSocket.closed) return;
  let packet = {
    buffer: player.buffer,
    col: player.col,
    t: now(),
    mapUD,
    persist: {
      money,
      col: player.col,
      pos: [player.pos.x, player.pos.y, player.pos.z],
      effects: {
        noclip: noclip || undefined, frozen: frozen || undefined, oldPos: oldPos?.length ? oldPos : undefined,
        speedCheatsOn: speedCheatsOn || undefined, inARoom: inARoom || undefined
      },
      rot: [camYaw, camPitch],
      perm: PERM,
      inventory
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
  url.search = '';
  url.hash = '';
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
  let z = () => setTimeout(async () => {
    let url = (location.protocol == 'http:' ? 'ws://' : 'wss://') + prompt('Provide server:');
    let res = await testUrl(url);
    if (res) {
      WSURL = url;
      connect(res);
    } else z();
  }, 5e2);
  z();
})();

let ws = { readyState: WebSocket.CLOSED };

function connect(iws) {
  if (!iws) talert = 'Connecting...';
  else wshasopened = true;
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
        if (titlescreen) closeTitleScreen();
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
      case 'servers':
        displaySvrs(x.servers);
        break;
    }
  };
  if (iws) console.log('connected');
}

function joinSvr(svr) {
  serverid = svr;
  pname = tsin.name.value();
  if (pname.length >= 3 && pname.length <= 12) {
    if (window.localStorage) localStorage.name = pname;
    wsfail = '';
    if (ws.readyState == WebSocket.OPEN) joinGame();
    else if (WSURL) connect();
    else wsfail = 'Still searching, try again in 5 seconds.';
  } else wsfail = 'name needs to be between 3 and 12 chars long.';
}

function joinGame() {
  talert = 'Joining...';
  if (pname && serverid) wssend({ type: 'join', name: pname, svr: serverid, ver: NPVER, kill: localStorage?.kill });
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
    // console.log(data.persist);
    money = data.persist.money ?? 0;
    if (data.persist.col) player.col = data.persist.col;
    if (data.persist.pos) player.pos.set(...data.persist.pos);
    if (data.persist.rot) {
      camYaw = data.persist.rot[0] || 0;
      camPitch = data.persist.rot[1] || 0;
    }
    if (data.persist.effects) {
      let f = data.persist.effects;
      noclip = f.noclip ?? noclip;
      frozen = f.frozen ?? frozen;
      speedCheatsOn = f.speedCheatsOn ?? speedCheatsOn;
      speedCheats(speedCheatsOn);
      oldPos = f.oldPos ?? oldPos;
      inARoom = f.inARoom ?? inARoom;
      inventory = f.inventory ?? inventory;
    }
    PERM = data.persist.perm ?? PERM;
    $p_lock$ = data.persist.perm ?? $p_lock$;
    player.operm = PERM;
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
          if (localStorage?.name && params.get('room')) setTimeout(() => joinSvr(params.get('room')), 5e2);
          else displaySvrs(JSON.parse(x.data).servers);
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

addEvent('game/kick', (p, r) => {
  if (p == pname) location = "?kick=" + (r ? encodeURI(r) : '');
});

addEvent('game/ban', (p, r) => {
  if (p == pname) location = "?kick=" + (r ? encodeURI(r) : '') + '&ban=true';
})

addEvent('game/perm', (p, d) => {
  if (p == pname) {
    $p_lock$ = d;
    PERM = d;
  }
});