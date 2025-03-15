const http = require("http");
const static = require("node-static");
const WebSocket = require("ws");
const fs = require("fs");

const fileServer = new static.Server("");

const server = process.argv[2] == '-d' ? http.createServer((req, res) => {
  req.addListener("end", () => {
    fileServer.serve(req, res);
  }).resume();
}) : null;

const wss = new WebSocket.Server(server ? { server } : { port: process.env.PORT });

let newSvr = {
  packets: {},
  mapUD: [],
  persist: {},
  marker: null,
  map: '',
  newPersist: {
    money: 200,
    pos: [0, 0, 0]
  }
};

let svrs = {};

function createSvr(name, ns={}) {
  let s = structuredClone(newSvr);
  Object.entries(ns).forEach(x => s[x[0]] = x[1]);
  svrs[name] = s;
}

createSvr('main');
createSvr('tortuga');
createSvr('skibidi');
createSvr('pop', { persist: { pop: { money: 1000 } } });

wss.on("connection", ws => {
  console.log("connection");
  ws.mapUD = [];
  ws.chat = [];
  ws.svr = null;

  send(ws, {
    type: "servers", servers: Object.entries(svrs).map(x =>
      [x[0], Object.values(x[1].packets).filter(x => !x.to).length])
  })

  ws.on("message", x => {
    let msg = JSON.parse(x.toString());
    if (msg.type != 'packet') console.log(ws.name, '<', msg);
    switch (msg.type) {
      case 'packet':
        if (ws.name) {
          let p = msg.packet;
          if (p.marker) {
            svrs[ws.svr].marker = p.marker;
          }
          if (p.chat) {
            wss.clients.forEach(x => {
              if (x.name && x != ws)
                x.chat.push(...p.chat.map(x => [ws.name, x]));
            });
          }
          if (p.mapUD) {
            p.mapUD.forEach(x => {
              if (x[0] == 'calc') {
                let y = svrs[ws.svr].mapUD.find(y => y[0] == 'calc' && y[1] == x[1] && y[2] == y[2]);
                if (y) y[3] = x[3];
                else svrs[ws.svr].mapUD.push(x);
              } else {
                svrs[ws.svr].mapUD.push(x);
              }
              if (x[0] == 'del') {
                svrs.mapUD = svrs[ws.svr].mapUD.filter(y =>
                  !((y[0] == 'add' && y[2] == x[1]) || (y[0] == 'calc' && y[1] == x[1]))
                );
              }
            });
            wss.clients.forEach(x => {
              if (x.name && x != ws)
                x.mapUD.push(...p.mapUD);
            });
            delete p.mapUD;
          }
          if (p.persist) {
            svrs[ws.svr].persist[ws.name] = p.persist;
            delete p.persist;
          }
          svrs[ws.svr].packets[ws.name] = msg.packet;
        }
        break;
      case 'join':
        if (userOn(msg.name)) {
          send(ws, { type: 'fail', error: 'name taken' });
          return ws.close();
        }
        if (!svrs[msg.svr]) {
          send(ws, { type: 'fail', error: 'room does not exist' });
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
          if (x.name && x != ws)
            send(x, {
              type: 'pjoin',
              name: ws.name
            })
        });
        break;
      case 'run':
        if (ws.name)
          wss.clients.forEach(x => {
            send(x, {
              type: 'run',
              code: msg.code
            })
          });
        break;
    }
  });

  ws.on("close", () => {
    if (ws.name)
      wss.clients.forEach(x => {
        if (x.name)
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

function send(ws, data, nolog) {
  if (data.type != 'update' && data.type != 'connected' || nolog) console.log(ws.name, '>', data);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

setInterval(() => {
  [].concat(...Object.values(svrs).map(x => Object.values(x.packets))).forEach(packet => {
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
        type: "servers", servers: Object.entries(svrs).map(x =>
          [x[0], Object.values(x[1].packets).filter(x => !x.to).length])
      }, true);
    }
  });
}, 30e3);

function userOn(u) {
  return !Object.values(svrs).every(x => Object.entries(x.packets).every(y => y[0] != u || y[0].to));
}

const PORT = 8080;
if (server) server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function getMap() {
  return (//fs.readFileSync('./svr/lock.js').toString()
    //.replaceAll("***", Math.floor(Math.random() * (36 ** 8 - 1)).toString(36)) +
    fs.readdirSync('./game/').map(x => {
      // if (fs.fstatSync(2, './game/' + x).isFile())
      try { return fs.readFileSync('./game/' + x).toString(); } catch (e) { return '' }
      // else return 'console.log("error")';
    }).join('\r\n\r\n'));
}

process.on('uncaughtException', x => console.error(x));
process.on('unhandledRejection', x => console.error(x));