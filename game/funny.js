let funnied = false;

mdlRef.funnystuff = {
  obj: [
    {
      id: "model",
      pos: [0, 0, 0, 8, 8, 8],
      col: [32, 128, 0, 200],
      stk: [1, 0, 255, 0, 128],
      dl: true,
      interact: {
        text: '[E] Pick up "funny stuff"',
        e() {
          interact = null;
          if (pickup('funny stuff'))
            deleteObj(this.pid);
        },
        keys: ['e']
      }
    }
  ]
};

items['funny stuff'] = {
  interact: {
    text: '[Z] To drop',
    left() {
      talert = 'funny';
      funnied = true;
      this.amount--;
      if (this.amount < 1)
        this.remove();
    },
    z() {
      let loc = player.pos.copy().add(mdir(camYaw, createVector(0, -50)));
      createObj({
        name: 'funnystuff',
        pos: [loc.x, loc.y, loc.z]
      });
      this.amount--;
      if (this.amount < 1)
        this.remove();
    }
  }
};

mdlRef.fsdispense = {
  obj: [
    {
      pos: [0, 0, 0, 35, 80, 35],
      col: [64, 64, 64],
      stk: [1, 0],
      interact: {
        text() {
          return money >= 20 ? '[E] Dispense (20$)' : 'you are broke ):';
        },
        e() {
          if (money < 20) return;
          money -= 20;
          interact = null;
          let loc = world.objs[this.pid].pos.copy().sub(0, 80, 0);
          createObj({
            name: 'funnystuff',
            pos: [loc.x, loc.y, loc.z]
          });
        },
        keys: ['e']
      },
      collide: true
    }, 
    {
      pos: [0, -78, 0, 15, 6, 15],
      col: [255, 0, 0],
      stk: [1, 128, 32, 32]
    }
  ]
};