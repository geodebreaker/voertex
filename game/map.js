let deg90 = Math.PI / 2;
let deg180 = Math.PI;

let world = {
  obj: {

  }
};


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
      id: "door",
      pos: [0, 1, 150, 82, 152, 8],
      col: [120, 70, 20, 255],
      interact(x) { // allow open and close
        x.doorstate(x.this);
      },
      collide: true
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

let map = {
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