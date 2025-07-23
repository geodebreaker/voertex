const http = require("http");
const static = require("node-static");
const WebSocket = require("ws");
const fs = require("fs");
const NPVER = "0.0";
let db = require('./db.js');

const fileServer = new static.Server("");

const server = http.createServer((req, res) => {
  req.addListener("end", () => {
    fileServer.serve(req, res);
  }).resume();
});

const wss = new WebSocket.Server({ server });

let users = {};

let newPersist = {
  perm: 0,
  money: 200,
  pos: [0, 0, 0],
  rot: [0, 0],
  effect: {},
  inventory: {
    0: { type: '(empty)', amount: 1 },
    1: { type: "tv", amount: 2 },
  }
};

let newSvr = {
  packets: {},
  mapUD: [],
  persist: {
    googer: {
      ...newPersist,
      perm: 3,
    }
  },
  marker: null,
  map: '',
  newPersist,
  hide: false,
  bans: {}
};

let svrs = {};

function createSvr(name, ns = {}) {
  let s = structuredClone(newSvr);
  Object.entries(ns).forEach(x => s[x[0]] = x[1]);
  if (!svrs[name])
    svrs[name] = s;
  svrs[name].ns = structuredClone(s);
}

(async () => {
  let x = await db.get();
  if (x) {
    svrs = x.svrs || svrs;
    users = x.users || users;
  } else {
    createSvr('main');
    createSvr('uncensored');
    createSvr('sandbox', {
      newPersist: {
        ...newPersist,
        perm: 1,
        money: 0,
        effect: {
          speedCheatsOn: true,
        },
      },
    });
    createSvr('pop', { persist: { pop: { money: 1000, perm: 3 }, googer: { perm: 3 } } });
    createSvr('hidden', { hide: true });
    backup();
  }
})();

wss.on("connection", ws => {
  console.log("connection");
  ws.mapUD = [];
  ws.chat = [];
  ws.svr = null;
  ws.perm = null;

  send(ws, {
    type: "servers", servers: Object.entries(svrs).filter(x => !x[1].hide).map(x =>
      [x[0], Object.values(x[1].packets ?? {}).filter(x => !x.to).length])
  })

  ws.on("message", x => {
    let msg = JSON.parse(x.toString());
    // if (msg.type != 'packet') console.log(ws.name, '<', msg);
    switch (msg.type) {
      case 'packet':
        if (ws.name) {
          let p = msg.packet;
          if (p.marker) {
            svrs[ws.svr].marker = p.marker;
          }
          if (p.chat) {
            wss.clients.forEach(x => {
              if (x.name && x != ws && x.svr == ws.svr)
                x.chat.push(...p.chat.map(x => [ws.name, x]));
            });
          }
          if (p.mapUD) {
            p.mapUD.forEach((x, i) => {
              x[1] = ws.name;
              if (x[0] == 'calc') {
                let y = svrs[ws.svr].mapUD.find(y => y[0] == 'calc' && y[2] == x[2] && y[3] == x[3]);
                if (y) y[4] = x[4];
                else svrs[ws.svr].mapUD.push(x);
              } else if (x[0] == 'del') {
                let len = svrs[ws.svr].mapUD.length;
                svrs[ws.svr].mapUD = svrs[ws.svr].mapUD.filter(y =>
                  !((y[0] == 'new' && y[3] == x[2]) || (y[0] == 'calc' && y[2] == x[2]))
                );
                if (len == svrs[ws.svr].mapUD.length)
                  svrs[ws.svr].mapUD.push(x);
              } else if (x[0] == 'event') {
                if (x[3] == 'game/ban') {
                  if (svrs[ws.svr].bans[x[3][0]]) {
                    return svrs[ws.svr].bans[x[3][0]] = false;
                  } else svrs[ws.svr].bans[x[3][0]] = x[3][1] || null;
                }
                if (x[2] == 'game/ban' || x[2] == 'game/kick') {
                  wss.clients.forEach(y => {
                    if (y.name == x[3][0]) {
                      if (y.perm > ws.perm) return delete p.mapUD[i];
                      send(y, { type: 'update', mapUD: [x], packets: {} });
                      y.close();
                    }
                  })
                }
                if (x[2] == 'game/perm') {
                  svrs[ws.svr].persist[x[3][0]] = svrs[ws.svr].persist[x[3][0]] || {};
                  svrs[ws.svr].persist[x[3][0]].perm = x[3][1];
                }
              } else {
                svrs[ws.svr].mapUD.push(x);
              }
            });
            wss.clients.forEach(x => {
              if (x.name && x != ws && x.svr == ws.svr)
                x.mapUD.push(...p.mapUD);
            });
            delete p.mapUD;
          }
          if (p.persist) {
            ws.perm = p.persist.perm;
            svrs[ws.svr].persist[ws.name] = p.persist;
            delete p.persist;
          }
          svrs[ws.svr].packets[ws.name] = msg.packet;
        }
        break;
      case 'join':
        if (parseInt(NPVER.split('.')[0]) > parseInt(msg.ver.split('.')[0])) {
          send(ws, { type: 'fail', error: 'Invalid network protocol version. You need a new client.' });
          return ws.close();
        }
        if (parseInt(NPVER.split('.')[0]) < parseInt(msg.ver.split('.')[0])) {
          send(ws, { type: 'fail', error: 'This server needs an update!' });
          return ws.close();
        }
        if (userOn(msg.name)) {
          if (msg.kill) {
            wss.clients.forEach(x => {
              if (x.name == msg.name) {
                send(x, { type: 'update', mapUD: [['event', '_', 'game/kick', [x.name, 'You took that users name!']]], packets: {} });
                x.close();
              }
            });
          } else {
            send(ws, { type: 'fail', error: 'name taken' });
            return ws.close();
          }
        }
        if (!svrs[msg.svr]) {
          send(ws, { type: 'fail', error: 'room does not exist' });
          return ws.close();
        }
        if (svrs[msg.svr].bans.hasOwnProperty(msg.name)) {
          send(ws, { type: 'fail', error: 'you are banned in that room' });
          return ws.close();
        }
        ws.svr = msg.svr;
        ws.name = msg.name;
        send(ws, {
          type: 'connected',
          packets: svrs[ws.svr].packets,
          map: getMap(svrs[ws.svr].map),
          mapUD: svrs[ws.svr].mapUD,
          persist: svrs[ws.svr].persist[ws.name] || svrs[ws.svr].newPersist,
          time: Date.now()
        });
        wss.clients.forEach(x => {
          if (x.name && x != ws && x.svr == ws.svr)
            send(x, {
              type: 'pjoin',
              name: ws.name
            })
        });
        console.log(ws.name, 'joined', ws.svr);
        break;
      case 'run':
        if (/*users[ws.name].admin*/ws.name == 'googer')
          wss.clients.forEach(x => {
            if (x.svr == ws.svr)
              send(x, {
                type: 'run',
                code: msg.code
              })
          });
        break;
      // case 'backup':
      //   send(ws, {type:'backup',svrs,users}, true)
      //   break;
      case 'reset':
        wss.clients.forEach(x => {
          if (x.svr == ws.svr) {
            send(x, {
              type: 'reset',
            });
            ws.close();
          }
        });
        let s = svrs[ws.svr].ns;
        svrs[ws.svr] = null;
        createSvr(ws.svr, s);
        break;
    }
  });

  ws.on("close", () => {
    if (ws.name)
      wss.clients.forEach(x => {
        if (x.name && x.svr == ws.svr)
          send(x, {
            type: 'pleave',
            name: ws.name
          })
      });
    if (ws.name)
      delete svrs[ws.svr].packets[ws.name];
    console.log(ws.name, "disconnected");
  });
});

function backup() {
  let s = structuredClone(svrs);
  Object.values(s).forEach(x => {
    x.packets = {};
  });
  db.set(JSON.stringify({ svrs: s, users }, (_, v) =>
    typeof v === "number" ? Math.floor(v) : v
  ), true);
}

process.on("beforeExit", backup);
process.on("SIGINT", () => {
  backup();
  process.exit();
});
process.on("SIGTERM", () => {
  backup();
  process.exit();
});
process.on("SIGILL", () => {
  backup();
  process.exit();
});
setInterval(backup, 36e5);

function send(ws, data, nolog) {
  // if (data.type != 'update' && data.type != 'connected' || nolog) console.log(ws.name, '>', data);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

setInterval(() => {
  [].concat(...Object.values(svrs ?? {}).map(x => Object.values(x.packets ?? {}))).forEach(packet => {
    if (packet.t + 9e3 < Date.now())
      packet.to = true;
  });
  wss.clients.forEach(x => {
    if (x.name) {
      send(x, {
        type: 'update',
        packets: svrs[x.svr].packets,
        chat: x.chat,
        mapUD: x.mapUD,
        marker: svrs[x.svr].marker
      });
      x.chat = [];
      x.mapUD = [];
    }
  });
}, 200);

setInterval(() => {
  wss.clients.forEach(x => {
    if (!x.name) {
      send(x, {
        type: "servers", servers: Object.entries(svrs).filter(x => !x[1].hide).map(x =>
          [x[0], Object.values(x[1].packets ?? {}).filter(x => !x.to).length])
      }, true);
    }
  });
}, 30e3);

function userOn(u) {
  return !Object.values(svrs).every(x => Object.entries(x.packets).every(y => y[0] != u || y[0].to));
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function getMap(map) {
  return (
    ['map.js', ...fs.readdirSync('./game/' + (map ? map + '/' : '')).filter(x => x != 'map.js')]
      .map(x => {
        try { return fs.readFileSync('./game/' + (map ? map + '/' : '') + x).toString(); }
        catch (e) { return '' }
      }).join('\r\n\r\n'));
}

process.on('uncaughtException', x => console.error(x));
process.on('unhandledRejection', x => console.error(x));