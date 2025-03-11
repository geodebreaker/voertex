const http = require("http");
const static = require("node-static");
const WebSocket = require("ws");
const fs = require("fs");

const fileServer = new static.Server("");

const server = http.createServer((req, res) => {
  req.addListener("end", () => {
    fileServer.serve(req, res);
  }).resume();
});

const wss = new WebSocket.Server({ server });

let packets = {};
let mapUD = [];

wss.on("connection", ws => {
  console.log("connection");
  ws.mapUD = [];

  ws.on("message", x => {
    let msg = JSON.parse(x.toString());
    if (msg.type != 'packet') console.log(ws.name, '<', msg);
    switch (msg.type) {
      case 'packet':
        if (ws.name) {
          let p = msg.packet;
          if (p.mapUD) {
            mapUD.push(...p.mapUD);
            wss.clients.forEach(x => {
              if (x.name && x != ws)
                x.mapUD.push(...p.mapUD);
            });
            delete p.mapUD;
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
          mapUD
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
        mapUD: x.mapUD
      });
      x.mapUD = [];
    }
  });
}, 200);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function getMap() {
  return fs.readFileSync('./game/map.js').toString();
}

process.on('uncaughtException', x => console.error(x));
process.on('unhandledRejection', x => console.error(x));