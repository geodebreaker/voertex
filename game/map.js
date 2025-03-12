mdlRef.door = {
  obj: [
    {
      pos: [0, 0, 0, 82, 152, 8],
      col: [120, 70, 20],
      interact: {
        text() {
          return this.data.owner ?
            (this.data.owner == pname ?
              (this.data.open ? '[E] To close' : '[E] To open') + '\n[P] To sell' :
              'Owned by ' + this.data.owner) :
            (money >= this.cost ? '[E] To buy house' : 'You cannot afford this house')
        },
        e() {
          if (this.data.owner) {
            if (this.data.owner != pname) return;
            this.data.open = !this.data.open;
            if (!this.data.open)
              tryMove(mdir(camYaw, createVector(0, 20)));
            this.calc();
          } else if (money >= this.cost) {
            money -= this.cost;
            this.data.owner = pname;
            this.calc();
          }
        },
        p() {
          if (this.data.owner == pname) {
            money += this.cost;
            this.data.owner = null;
            this.calc();
          }
        },
        keys: ['e', 'p']
      },
      collide: true,
      hide: false,
      data: {
        open: false,
        owner: null
      },
      calc() {
        this.hide = this.data.open;
        this.collide = !this.data.open;
      },
      on: {
        leave(u) {
          if (this.data.owner == u) {
            this.data.owner = null;
            this.calc(true);
          }
        }
      },
      cost: 100
    },
  ]
}

mdlRef.house = {
  obj: [
    // gobber
    {
      pos: [0, -100, -80, 50],
      tex: "goober",
      stk: [3, 255, 255, 0]
    },

    // floor
    {
      pos: [0, 0, 0, 300, 10, 300],
      col: [120, 70, 20]
    },

    // roof
    {
      pos: [0, -200, 0, 320, 40, 320],
      col: [100, 50, 0]
    },

    // walls
    {
      pos: [0, 0, -150, 300, 200, 10], // back
      col: [200, 100, 50],
      collide: true
    },
    {
      pos: [-152.5, 0, 0, 5, 200, 310], // left
      col: [180, 90, 40],
      collide: true
    },
    {
      pos: [152.5, 0, 0, 5, 200, 310], // right
      col: [180, 90, 40],
      collide: true,
    },

    // door
    {
      preset: "door",
      pos: [0, 1, 150, 82, 152, 8],
    },

    // windows
    {
      pos: [-80, -99, 150, 52, 52, 8], // left
      col: [128, 192, 255, 64],
      dl: true,
      collide: true
    },
    {
      pos: [80, -99, 150, 52, 52, 8], // right
      col: [128, 192, 255, 64],
      dl: true,
      collide: true
    },

    //front
    // {
    //   pos: [0, 0, 150, 300, 200, 10],
    //   col: [200, 100, 50]
    // },
    {
      pos: [0, -150, 150, 300, 50, 10],
      col: [200, 100, 50],
      collide: true
    },

    {
      pos: [127.5, -100, 150, 45, 50, 10],
      col: [200, 100, 50],
      collide: true
    },
    {
      pos: [-127.5, -100, 150, 45, 50, 10],
      col: [200, 100, 50],
      collide: true
    },

    {
      pos: [47.5, -100, 150, 15, 50, 10],
      col: [200, 100, 50],
      collide: true
    },
    {
      pos: [-47.5, -100, 150, 15, 50, 10],
      col: [200, 100, 50],
      collide: true
    },

    {
      pos: [95, 0, 150, 110, 100, 10],
      col: [200, 100, 50],
      collide: true
    },
    {
      pos: [-95, 0, 150, 110, 100, 10],
      col: [200, 100, 50],
      collide: true
    },
  ]
};

mdlRef.goober = {
  obj: [
    // gobber
    {
      pos: [0, -100, -80, 50],
      tex: "goober",
      stk: [3, 255, 255, 0]
    },
  ]
}

map = {
  objs: [
    {
      name: 'goober'
    },
    {
      name: 'house',
      pos: [200, 0, -600]
    },
    {
      name: 'house',
      pos: [-200, 0, -600]
    },

    {
      name: 'house',
      pos: [-600, 0, -200],
      rh: deg90
    },
    {
      name: 'house',
      pos: [-600, 0, 200],
      rh: deg90
    },

    {
      name: 'house',
      pos: [200, 0, 600],
      rh: deg180
    },
    {
      name: 'house',
      pos: [-200, 0, 600],
      rh: deg180
    },

    {
      name: 'house',
      pos: [600, 0, -200],
      rh: -deg90
    },
    {
      name: 'house',
      pos: [600, 0, 200],
      rh: -deg90
    },
  ]
};