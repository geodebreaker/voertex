const http = require("http");
const static = require("node-static");
const WebSocket = require("ws");

const fileServer = new static.Server("");

const server = http.createServer((req, res) => {
  req.addListener("end", () => {
    fileServer.serve(req, res);
  }).resume();
});

const wss = new WebSocket.Server({ server });

let packets = {};

wss.on("connection", ws => {
  console.log("connection");
  send(ws, {
    type: 'update',
    packets
  });

  ws.on("message", x => {
    let msg = JSON.parse(x.toString());
    if (msg.type != 'packet') console.log(ws.name, '<', msg);
    switch (msg.type) {
      case 'packet':
        packets[ws.name] = msg.packet;
        break;
      case 'join':
        ws.name = msg.name;
        break;
      case 'run':
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
    delete packets[ws.name];
    console.log("Client disconnected");
  });
});

function send(ws, data) {
  if (data.type != 'update') console.log(ws.name, '>', data);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

setInterval(() => {
  wss.clients.forEach(x => {
    send(x, {
      type: 'update',
      packets
    })
  });
}, 6e2);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on('uncaughtException', x => console.error(x));
process.on('unhandledRejection', x => console.error(x));