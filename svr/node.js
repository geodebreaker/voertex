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
let newPersist = {
  money: 200
};

let packets = {};
let mapUD = [];
let persist = {};
let marker = null;

wss.on("connection", ws => {
  console.log("connection");
  ws.mapUD = [];
  ws.chat = [];

  ws.on("message", x => {
    let msg = JSON.parse(x.toString());
    if (msg.type != 'packet') console.log(ws.name, '<', msg);
    switch (msg.type) {
      case 'test':
        send(ws, 'isvtx');
        break;
      case 'packet':
        if (ws.name) {
          let p = msg.packet;
          if (p.marker) {
            marker = p.marker;
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
                let y = mapUD.find(y => y[1] == x[1] && y[2] == y[2]);
                if (y) y[3] = x[3];
                else mapUD.push(x);
              } else {
                mapUD.push(x);
              }
            });
            wss.clients.forEach(x => {
              if (x.name && x != ws)
                x.mapUD.push(...p.mapUD);
            });
            delete p.mapUD;
          }
          if (p.persist) {
            persist[ws.name] = p.persist;
            delete p.persist;
          }
          packets[ws.name] = msg.packet;
        }
        break;
      case 'join':
        if (packets[msg.name] && !packets[msg.name].to) {
          send(ws, { type: 'fail', error: 'name taken' });
          return ws.close();
        }
        ws.name = msg.name;
        send(ws, {
          type: 'connected',
          packets,
          map: getMap(),
          mapUD,
          persist: persist[ws.name] || newPersist
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
      delete packets[ws.name];
    console.log(ws.name, "disconnected");
  });
});

function send(ws, data) {
  if (data.type != 'update') console.log(ws.name, '>', data);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

setInterval(() => {
  Object.entries(packets).forEach(packet => {
    if (packet[1].t + 9e3 < Date.now())
      packets[packet[0]].to = true;
  });
  wss.clients.forEach(x => {
    if (x.name) {
      send(x, {
        type: 'update',
        packets,
        chat: x.chat,
        mapUD: x.mapUD,
        marker
      });
      x.chat = [];
      x.mapUD = [];
    }
  });
}, 200);

const PORT = 8080;
if (server) server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function getMap() {
  return (//fs.readFileSync('./svr/lock.js').toString()
    //.replaceAll("***", Math.floor(Math.random() * (36 ** 8 - 1)).toString(36)) +
    fs.readdirSync('./game/').map(x => {
      // if (fs.fstatSync(2, './game/' + x).isFile())
        try { return fs.readFileSync('./game/' + x).toString(); } catch(e) { return '' }
      // else return 'console.log("error")';
    }).join('\r\n\r\n'));
}

process.on('uncaughtException', x => console.error(x));
process.on('unhandledRejection', x => console.error(x));