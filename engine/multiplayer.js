let players = {};
let bufferlim = 4;

function updatePlayers(dt) {
  Object.values(players).forEach(plr => {
    if (!plr.enabled) return;
    if (plr.mp.time + 3e3 < Date.now()) 
      return plr.enabled = false;
    plr.tick(dt);
  });
}

function createPacket() {
  let packet = {};
  packet.buffer = player.buffer;
  // send(packet)
}

function recvPackets(packets) {
  Object.fromEntries(packets).forEach(packet => {
    if (players[packet[0]])
      players[packet[0]].update(packet[1]);
    else
      players[packet[0]] = new mPlayer(packet[1], packet[0]);
  })
}

setInterval(createPacket, 1e2);