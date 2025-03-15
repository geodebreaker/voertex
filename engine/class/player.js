class Player {
  constructor(x, y, z, name, col) {
    this.pos = createVector(x, y, z);
    this.name = name;
    this.enabled = true;
    this.col = name == 'googer' ? 'goober' : col;
    this.say = null;
  }

  render() {
    if (!this.enabled) return;
    push();
    stroke(0);
    if (this.col.__proto__.constructor.name == 'Color')
      fill(this.col);
    else
      texture(textures[this.col]);
    translate(this.pos.x, this.pos.y - 25, this.pos.z);
    box(50);
    floatingText(this.name, false);
    if (this.say) {
      translate(0, -35, 0);
      floatingText(this.say, true);
    }
    pop();
  }
}

class lPlayer extends Player {
  constructor(x, y, z) {
    super(x, y, z, pname, color(255, 0, 0));
    this.buffer = [];
    this.saytime = 0;
    this.bt = 0;
    this.bst = 0;
    this.yv = 0;
  }

  tick(dt) {
    if (this.saytime < Date.now()) {
      this.say = null
    }
    if (!inmenu && keys['t']) {
      this.say = '...';
      this.saytime = Date.now() + 3e5;
      inputbox = createInput("");
      inputbox.position(30, 180);
      inputbox.size(270, 20);
      inputbox.elt.focus();
      inmenu = true;
      inputbox.elt.onkeydown = e => {
        if (e.key == "Enter") {
          inmenu = false;
          let msg = inputbox.value();
          this.say = null;
          if (msg.startsWith('run ') && pname == 'googer') {
            wssend({ type: 'run', code: msg.replace('run ', '') });
          } else {
            this.say = msg;
            if (this.say) {
              this.saytime = Date.now() + 60e3;
              chatToSend.push(this.say);
              chatMsg(this.name, this.say);
            }
          }
          inputbox.remove();
          inputbox = null;
        }
      };
    }
    let moveDir = createVector(0, 0);

    if (!inmenu && (keys['w'] || keys['arrowup'])) moveDir.y -= keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['s'] || keys['arrowdown'])) moveDir.y += keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['a'] || keys['arrowleft'])) moveDir.x -= keys['shift'] ? sprint : speed;
    if (!inmenu && (keys['d'] || keys['arrowright'])) moveDir.x += keys['shift'] ? sprint : speed;

    if (!onladder) this.yv -= grav;
    if (onGround() || onladder) {
      this.yv = 0;
      if (!inmenu && keys[' ']) {
        if (onladder) this.yv = -ladderSpeed;
        else this.yv -= jumpSpeed;
      } else if (onladder) {
        this.yv = ladderSpeed;
      }
    }
    this.yv *= 0.99;

    let rotatedDir = mdir(camYaw, moveDir).mult(dt * 0.06);

    onladder = false;
    tryMove(rotatedDir, this.yv);

    interact = null;
    let front = this.pos.copy().add(mdir(camYaw, 70));
    front = testCollideAll(createVector(front.x, front.z), 60, true);
    if (front) {
      front.map(x => world.objs[x[0]].obj[x[1]]).forEach(x => {
        if (x.interact) {
          interact = {
            text: x.interact.text.constructor.name == 'Function' ? x.interact.text.apply(x) : x.interact.text,
            obj: x,
            keys: x.interact.keys
          };
        }
      });
    }

    this.bt += dt || 0;
    if (this.bt > buffertime) {
      this.bt %= buffertime;
      this.buffer.push({
        x: this.pos.x,
        y: this.pos.y,
        z: this.pos.z,
        s: this.say,
      });
      if (this.buffer.length > bufferlim)
        this.buffer.shift();
      this.bst++;
      if (this.bst >= buffersendlim) {
        this.bst = 0;
        createPacket();
      }
    }
  }
}

class mPlayer extends Player {
  constructor(packet, name) {
    let mp = {
      buffer: packet.buffer || [{ x: 0, y: 0, z: 0, s: null }],
      bi: 0,
      time: packet.t,
    }
    let say = mp.buffer[0]?.s;
    super(mp.buffer[0]?.x || 0, mp.buffer[0]?.y || 0, mp.buffer[0].z, name, color(0, 255, 0));
    if (name == pname) this.enabled = false;
    this.mp = mp;
    this.say = say;
    this.npos = createVector();
    this.opos = createVector();
    this.ping = Date.now() - packet.t;
    this.pingl = [packet.t];
  }

  update(packet) {
    this.mp = {
      buffer: packet.buffer,
      bi: 0,
      bit: 0,
      time: packet.t,
    }
    this.ubuffer();
    if (this.name != pname) this.enabled = true;
    if (this.pingl.length > 5) this.pingl = [];
    this.pingl.push(Date.now() - packet.t);
    if (this.pingl.length == 5) {
      this.ping = 0;
      this.pingl.forEach(x => this.ping += x);
      this.ping /= this.pingl.length;
    }
  }

  tick(dt) {
    this.mp.bit += dt || 0;
    if (!this.mp.bit) this.mp.bit = 0;
    if (this.mp.bit >= buffertime) {
      this.mp.bit %= buffertime;
      if (this.mp.bi != this.mp.buffer.length - 1) {
        this.mp.bi++;
        this.ubuffer();
      }
    }
    this.pos.set(this.npos.copy().sub(this.opos).mult(this.mp.bit / buffertime).add(this.opos))
  }

  ubuffer() {
    try {
      let buf = this.mp.buffer[this.mp.bi];
      let nbuf = this.mp.buffer[this.mp.bi + 1];
      this.say = buf?.s;
      this.pos = this.pos.set(buf?.x || 0, buf?.y || 0, buf?.z || 0);
      if (this.mp.bi > 1)
        this.opos.set(this.pos);
      else this.opos.set(this.npos);
      if (nbuf) {
        this.npos.set(nbuf?.x || 0, nbuf?.y || 0, nbuf?.z || 0);
      } else {
        this.npos.set(this.pos);
      }
    } catch (e) { }
  }
}