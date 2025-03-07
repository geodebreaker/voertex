class Player {
  constructor(x, y, name, col) {
    this.pos = createVector(x, y);
    this.name = name;
    this.enabled = true;
    this.col = col;
    this.say = null;
  }

  render() {
    if (!this.enabled) return;
    push();
    fill(this.col);
    translate(this.pos.x, -25, this.pos.y);
    box(50);
    drawFloatingText(this.name, false);
    if (this.say) {
      translate(0, -35, 0);
      drawFloatingText(this.say, true);
    }
    pop();
  }
}

class lPlayer extends Player {
  constructor(x, y) {
    super(x, y, 'asdf', color(255, 0, 0));
    this.buffer = [];
    this.saytime = 0;
    this.bt = 0;
  }

  tick(dt) {
    if (this.saytime < Date.now()) {
      this.say = null
    }
    if (!inmenu && keys['t']) {
      this.say = '...';
      this.saytime = Date.now() + 3e5;
      inputbox = createInput("");
      inputbox.position(20, 20);
      inputbox.elt.focus();
      inmenu = true;
      inputbox.elt.onkeydown = e => {
        if (e.key == "Enter") {
          inmenu = false;
          this.say = inputbox.value();
          this.saytime = Date.now() + 60e3;
          inputbox.remove();
          inputbox = null;
        }
      };
    }
    let moveDir = createVector(0, 0);

    if (!inmenu && (keys['w'] || keys['ArrowUp'])) moveDir.y -= keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['s'] || keys['ArrowDown'])) moveDir.y += keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['a'] || keys['ArrowLeft'])) moveDir.x -= keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['d'] || keys['ArrowRight'])) moveDir.x += keys['shift'] ? sprint : speed;

    let rotatedDir = createVector(
      moveDir.x * cos(camYaw) - moveDir.y * sin(camYaw),
      moveDir.x * sin(camYaw) + moveDir.y * cos(camYaw)
    ).mult(dt);

    this.pos.add(rotatedDir);

    this.bt += dt || 0;
    if (this.bt > 1) {
      this.bt %= 1;
      this.buffer.push({
        x: this.pos.x,
        y: this.pos.y,
        s: this.say,
      });
      if (this.buffer.length == bufferlim)
        this.buffer.shift();
    }
  }
}

class mPlayer extends Player {
  constructor(packet, name) {
    let mp = {
      buffer: packet.buffer || [{ x: 0, y: 0, s: null }],
      bi: 0,
      time: Date.now()
    }
    let say = mp.buffer[0]?.s;
    super(mp.buffer[0]?.x || 0, mp.buffer[0]?.y || 0, name, color(0, 255, 0));
    this.mp = mp;
    this.say = say;
  }

  update(packet) {
    this.mp = {
      buffer: packet.buffer,
      bi: 0,
      bit: 0,
      time: Date.now()
    }
    this.ubuffer();
    this.enabled = true;
  }

  tick(dt) {
    this.mp.bit += dt || 0;
    if (this.mp.bit > 1) {
      this.mp.bit %= 1;
      if (this.mp.bi != this.mp.buffer.length - 1)
        this.mp.bi++;
    }
  }

  ubuffer() {
    this.say = this.mp.buffer[this.mp.bi]?.s;
    this.pos = this.pos.set(
      this.mp.buffer[this.mp.bi]?.x || 0,
      this.mp.buffer[this.mp.bi]?.y || 0);
  }
}