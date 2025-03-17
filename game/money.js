mdlRef.money = {
  obj: [
    {
      meta: true,
      skip: true,
      data: {
        from: 'unknown',
        amt: 0,
      },
      calc() {
        let p = world.objs[this.pid].obj.find(x => x.id == 'model');
        p.interact.text = '[E] Pick up ' + this.data.amt + '$\nFrom: ' + this.data.from;
      }
    },
    {
      id: "model",
      pos: [0, 0, 0, 20, 8, 12],
      col: [62, 156, 53],
      stk: [1, 0],
      interact: {
        text: '[E] Pick up',
        e() {
          let p = world.objs[this.pid].obj.find(x => x.meta);
          money += p.data.amt;
          interact = null;
          deleteObj(this.pid);
        },
        keys: ['e']
      }
    }
  ]
};

registerMM(["Drop Money", async () => {
  if (money == 0) return;
  let drop = parseInt(await ask('How much (up to ' + money + ')'));
  if (!drop || drop < 0 || drop > money) return;
  money -= drop;
  makeMoney(drop);
}], 'MNZXCVBFGHJKL1234567890');

function makeMoney(amt, loc, from = pname) {
  if (!loc) loc = player.pos.copy().add(mdir(camYaw, createVector(0, -50)));
  createObj({
    name: 'money',
    metadata: { from, amt },
    pos: [loc.x, loc.y, loc.z]
  });
}