function tryMove(d, j) {
  let y = player.pos.y + j > 0 || testCollideAll(createVector(player.x, player.z), 25, false, player.pos.y + j, true);
  let x = noclip ? false : testCollideAll(createVector(d.x, 0).add(player.pos.x, player.pos.z), 25, false, player.pos.y);
  let z = noclip ? false : testCollideAll(createVector(0, d.z).add(player.pos.x, player.pos.z), 25, false, player.pos.y);
  if (!x) player.pos.add(d.x, 0, 0);
  if (!z) player.pos.add(0, 0, d.z);
  if (y) {
    player.yv = 0;
  } else {
    player.pos.y += j;
  }
}

function onGround() {
  return player.pos.y + 5 > 0 || testCollideAll(createVector(player.x, player.z), 25, false, player.pos.y + 5, true);
}

function mdir(d, p) { 
  return createVector(
    p.x * cos(d) - p.y * sin(d),
    0,
    p.x * sin(d) + p.y * cos(d)
  )
}

function testCollideAll(P, S, ca, Py, test) {
  let res = null;
  push();
  resetMatrix();
  Object.values(world.objs).every(obj => {
    push();
    obj.translate();
    let o = obj.obj.every((x, i) => {
      if (!x.collide && !ca) return true;
      push();
      translate(...x.pos.slice(0, 3));
      let s = x.pos.slice(3, 6);
      if (s.length == 1) s = [s[0], s[0], s[0]];
      s = createVector(s[0], s[1], s[2]);

      translate(s.mult(.5, -1, .5));
      let p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
      let a = createVector(p[0], p[2]);
      let y1 = p[1];

      translate(s.mult(-2, -1, -2));
      p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
      let b = createVector(p[0], p[2]);
      let y2 = p[1];

      let cr = testCollide(P, S, a, b);
      if (Math.min(y1, y2) >= Py || Math.max(y1, y2) < S * -2 + Py) {
        pop();
        if (test && cr) {
          fill(255, 0, 0)
          rect(-100, -100, 100, 100)
        }
        return true;
      }
      if (cr) { if (res) res.push([x.pid, i]); else res = [[x.pid, i]] }
      pop();
      return ca ? true : !cr;
    });
    pop();
    return o;
  });
  pop();
  return res;
}

function testCollide(k, r, a, b) {
  a = a.copy();
  b = b.copy();
  if (a.x > b.x) [a.x, b.x] = [b.x, a.x];
  if (a.y > b.y) [a.y, b.y] = [b.y, a.y];
  let rs = r * r;
  // return (
  //   testCollideSquare(createVector(a.x - r, a.y - r), createVector(b.x + r, b.y + r), k)
  // )
  return (
    testCollideSquare(createVector(a.x, a.y - r), b, k) ||
    testCollideSquare(createVector(a.x - r, a.y), b, k) ||
    testCollideSquare(a, createVector(b.x, b.y + r), k) ||
    testCollideSquare(a, createVector(b.x + r, b.y), k) ||
    testCollideCircle(a.copy(), rs, k) ||
    testCollideCircle(b.copy(), rs, k) ||
    testCollideCircle(createVector(a.x, b.y), rs, k) ||
    testCollideCircle(createVector(b.x, a.y), rs, k)
  );
}

function testCollideSquare(a, b, k) {
  return a.x < k.x && a.y < k.y && b.x > k.x && b.y > k.y;
}

function testCollideCircle(a, rs, k) {
  return a.sub(k).magSq() <= rs;
}