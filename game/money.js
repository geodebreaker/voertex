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

(() => {
  let MMmoney = ["Drop Money", () => {
    if (money == 0) return;
    let drop = parseInt(prompt('How much (up to ' + money + ')'));
    if (!drop || drop < 0 || drop > money) return;
    money -= drop;
    let loc = player.pos.copy().add(mdir(camYaw, createVector(0, -50)));
    createObj({ 
      name: 'money', 
      metadata: { from: pname, amt: drop }, 
      pos: [loc.x, loc.y, loc.z]
    });
  }];

  let alpha = 'MNZXCVBFGHJKL1234567890';
  let i = 0;

  while(i < alpha.length && mmcon.main[alpha[i]] && mmcon.main[alpha[i]][0] != "Drop Money") i++;
  if (mmcon.main[alpha[i]]?.[0] == "Drop Money") return;
  if (i < alpha.length) mmcon.main[alpha[i]] = MMmoney;
  else alert('ERROR');
})();