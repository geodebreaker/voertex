objDraw = [
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

  // Roof (anchored at top)
  {
    pos: [0, -200, 0, 320, 40, 320], // Roof sits at y = -200
    col: [100, 50, 0]
  },

  // Walls
  {
    pos: [0, 0, -150, 300, 200, 10], // Back Wall
    col: [200, 100, 50]
  },
  {
    pos: [-150, 0, 0, 10, 200, 300], // Left Wall
    col: [180, 90, 40]
  },
  {
    pos: [150, 0, 0, 10, 200, 300], // Right Wall
    col: [180, 90, 40]
  },

  // Door (at ground level)
  {
    pos: [0, 0, 150, 80, 150, 20], // Door starts at y = -50 (half of 100 height)
    col: [120, 70, 20, 210],
    // ndt: true
  },

  // Windows (positioned at correct height)
  {
    pos: [-80, -100, 150, 50, 50, 20], // Left Window (higher up on the front wall)
    col: [128, 192, 255, 64],
    // ndt: true
  },
  {
    pos: [80, -100, 150, 50, 50, 20], // Right Window
    col: [128, 192, 255, 64],
    // ndt: true
  },

  // Front Wall
  // {
  //   pos: [0, 0, 150, 300, 200, 10], // Front Wall (200 tall, extends upwards from y=0)
  //   col: [200, 100, 50]
  // },
];