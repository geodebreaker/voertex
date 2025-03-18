/*
qz respawn
qx marker
qm money
/zz noclip
/zx speed
/ev goto pos
/ez teleport player
/ex goto player
/ec bring player
/ee return player
/p execute on another player
/mo kick player
/mp ban player
/ml edit player perms 
/mx give money to player
/mz bring to admin room
/mc freeze player
*/

addEvent('cmd/ex', (p, x, ...d) => {
  if (p == '*' || pname.startsWith(p)) cmd.apply({ FE: true }, [x, ...d]);
});

let cmds = {
  noclip(x = !noclip) {
    noclip = x;
  },
  speed(x) {
    speedCheats(x);
  },
  goto(who) {
    let p = Object.keys(players).find(x => x.startsWith(who));
    if (players[p]) {
      oldPos.push([player.pos.x, player.pos.y, player.pos.z]);
      player.pos.set(players[p].pos);
    }
  },
  gpos(...pos) {
    pos = pos.join(',').split(',').map(x => parseFloat(x.trim())).filter(x => x != NaN);
    if (pos.length == 3) {
      oldPos.push([player.pos.x, player.pos.y, player.pos.z]);
      player.pos.set(pos);
    }
  },
  tp(who = '*') {
    callEvent('cmd/ex', [who, 'goto', pname])
  },
  bring(from, to) {
    callEvent('cmd/ex', [from, 'goto', to])
  },
  freeze(who) {
    if (!this.FE && PERM < 2) return "NPERM";
    if (!who || this.FE) frozen = !frozen;
    else callEvent('cmd/ex', [who, 'freeze']);
  },
  return(who) {
    if (this.FE || (!who && oldPos.length > 0)) player.pos = createVector(...oldPos.pop());
    else if (who) callEvent('cmd/ex', [who, 'return']);
  },
  aroom(who) {
    if (!this.FE && PERM < 2) return "NPERM";
    if (!this.FE && who && who !== true) callEvent('cmd/ex', [who, 'aroom']);
    else if (who !== true) frozen = !frozen;
    inARoom = !inARoom;
    if (inARoom) {
      oldPos.push([player.pos.x, player.pos.y, player.pos.z]);
      player.pos.set(100000, -100000, 100000);
    } else {
      player.pos = createVector(...oldPos.pop())
    }
  },
  kick(who, reason) {
    if (PERM < 2) return "NPERM";
    let p = Object.keys(players).find(x => x.startsWith(who));
    if (players[p]) callEvent('game/kick', [p, reason]);
  },
  ban(who, reason) {
    if (PERM < 3) return "NPERM";
    let p = Object.keys(players).find(x => x.startsWith(who));
    if (players[p]) callEvent('game/ban', [p, reason]);
  },
  givemoney(amt, who) {
    if (!this.FE && PERM < 2) return "NPERM";
    if (!who || this.FE) money += parseInt(amt) || 0;
    else callEvent('cmd/ex', [who, 'givemoney', amt]);
  },
  perm(who, pd) {
    if (PERM < 3) return "NPERM";
    if (who == pname) return;
    callEvent('game/perm', [who, Math.max(Math.min(parseInt(pd) || 0, 2), 0)]);
  }
};

let inARoom = false;
let oldPos = [];
let PERM = 0;

function cmd(name, ...args) {
  let res = cmds[name].apply({FE: this.FE}, [...args]);
  if (res == "NPERM") alert('Not allowed.');
}

function cmdb(name, ...args) {
  if (cmdEx) {
    if (!['gpos','goto','tp','bring','speed','noclip','return'].includes(name)) return alert('Not allowed');
    callEvent('cmd/ex', [cmdEx, name, ...args]);
  } else {
    cmd(name, ...args);
  }
}

//// builder ////

let cmdEx = false;
// registerMM(['Command', () => minimenu = 'cmd'], '/');

mmcon.cmd = {};
registerMM(['Cheats', () => minimenu = 'cmd/cheats'], 'Z', 'cmd');
registerMM(['Teleport', () => minimenu = 'cmd/tp'], 'E', 'cmd');
registerMM(['Execute', async () => {
  cmdEx = cmdEx ? false : await ask('Execute as who?');
  mmcon.cmd.P[0] = cmdEx ? 'Remove Execute' : 'Execute';
  minimenu = 'cmd';
}], 'P', 'cmd');
registerMM(['User Management', () => { if (PERM > 1) minimenu = 'cmd/um'; else alert('Not allowed.') }], 'M', 'cmd');

mmcon['cmd/cheats'] = {};
registerMM(['Noclip', () => cmdb('noclip')], 'Z', 'cmd/cheats');
registerMM(['Speed', () => cmdb('speed')], 'X', 'cmd/cheats');

mmcon['cmd/tp'] = {};
registerMM(['Goto Pos', async () => cmdb('gpos', await ask('Position? (x,y,z)'))], 'V', 'cmd/tp');
registerMM(['Teleport', async () => cmdb('tp', await ask('Teleport who?'))], 'Z', 'cmd/tp');
registerMM(['Goto', async () => cmdb('goto', await ask('Go to who?'))], 'X', 'cmd/tp');
registerMM(['Bring', async () => cmdb('bring', await ask('Bring who?'), await ask('To who?'))], 'C', 'cmd/tp');
registerMM(['Return', async () => cmdb('return', await ask('Return who?'))], 'E', 'cmd/tp');

mmcon['cmd/um'] = {};
registerMM(['Kick', async () => cmdb('kick', await ask('Kick who?'), await ask('Why?'))], 'O', 'cmd/um');
registerMM(['Ban', async () => cmdb('ban', await ask('Ban who?'), await ask('Why?'))], 'P', 'cmd/um');
registerMM(['Perms', async () => cmdb('perm', await ask('Who?'), await ask('0: user, 1: editor, 2: admin'))], 'L', 'cmd/um');
registerMM(['Give Money', async () => cmdb('givemoney', await ask('Amount?'), await ask('To who?'))], 'X', 'cmd/um');
registerMM(['Admin Room', async () => cmdb('aroom', await ask('Who to bring to admin room?') || true)], 'Z', 'cmd/um');
registerMM(['Freeze', async () => cmdb('freeze', await ask('Freeze who?'))], 'C', 'cmd/um');

// speedcheats

let speedCheatsOn = false;
function speedCheats(x = !speedCheatsOn) {
  speedCheatsOn = x;
  jumpSpeed = x ? 25 : 8;
  speed = x ? 10 : 3;
  sprint = x ? 15 : 5;
}