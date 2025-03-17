let physdis = 800;

function tryMove(d, j) {
  let y = onGround(j);
  let x = noclip ? false : testCollideAll(createVector(d.x, 0).add(player.pos.x, player.pos.z), 25, false, player.pos.y, 50);
  let z = noclip ? false : testCollideAll(createVector(0, d.z).add(player.pos.x, player.pos.z), 25, false, player.pos.y, 50);
  if ((x || []).filter(x => !x[2]).length == 0)
    player.pos.x += d.x;
  else x.forEach(x => x[2] ? onladder = true : null);
  if ((z || []).filter(z => !z[2]).length == 0)
    player.pos.z += d.z;
  else z.forEach(x => x[2] ? onladder = true : null);
  if (y === true || (y || []).filter(y => !y[2]).length != 0) {
    player.yv = 0;
    if (y !== true) y.forEach(x => x[2] ? onladder = true : null);
  } else {
    player.pos.y += j;
  }
  if (
    [].concat(x || [], z || [], y === true ? [] : y || [])
      .find(x => (x[0] + "").startsWith('plr') && x[1] < 2000)) {
    player.pos.sub(0, 52, 0);
  }
}

function onGround(j = 5) {
  return player.pos.y + j > 0 || (noclip ? false : testCollideAll(createVector(player.pos.x, player.pos.z), 20, false, player.pos.y + j, 50));
}

function mdir(d, p) {
  return createVector(
    p.x * cos(d) - p.y * sin(d),
    0,
    p.x * sin(d) + p.y * cos(d)
  )
}

function testCollideAll(P, S, ca, Py, PH) {
  let res = null;
  push();
  resetMatrix();
  Object.values(world.objs).every(obj => {
    push();
    obj.translate();
		let p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
		p = createVector(p[0], p[2]).sub(player.pos.x, player.pos.z);
		if (p.magSq() > physdis * physdis) {
      pop();
      return true;
    }
    let o = obj.obj.every((x, i) => {
      if (x.skip || !x.collide && !x.ladder && !ca) return true;
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
      if (Math.min(y1, y2) >= Py || Math.max(y1, y2) < PH * -2 + Py) {
        pop();
        return true;
      }
      if (cr) { if (res) res.push([x.pid, i, x.ladder]); else res = [[x.pid, i, x.ladder]] }
      pop();
      return ca ? true : (x.ladder ? true : !cr);
    });
    pop();
    return o;
  });
  if (!ca) {
    Object.values(players).forEach(x => {
      if (!x.enabled) return;
      let c = x.pos.copy().sub(P.x, Py, P.y);
      c = createVector(Math.abs(c.x), Math.abs(c.y), Math.abs(c.z));
      if (c.x < S * 2 && c.y < PH && c.z < S * 2 && player.pos.magSq() > S * S * 4) {
        if (res) res.push(['plr:' + x.name, c.magSq(), false]); else res = [['plr:' + x.name, c.magSq(), false]]
      }
    });
  }
  pop();
  return res;
}

function testCollide(k, r, a, b) {
  a = a.copy();
  b = b.copy();
  if (a.x > b.x) [a.x, b.x] = [b.x, a.x];
  if (a.y > b.y) [a.y, b.y] = [b.y, a.y];
  // let rs = r * r;
  return (
    testCollideSquare(createVector(a.x - r, a.y - r), createVector(b.x + r, b.y + r), k)
  )
  //   return (
  //     testCollideSquare(createVector(a.x, a.y - r), b, k) ||
  //     testCollideSquare(createVector(a.x - r, a.y), b, k) ||
  //     testCollideSquare(a, createVector(b.x, b.y + r), k) ||
  //     testCollideSquare(a, createVector(b.x + r, b.y), k) ||
  //     testCollideCircle(a.copy(), rs, k) ||
  //     testCollideCircle(b.copy(), rs, k) ||
  //     testCollideCircle(createVector(a.x, b.y), rs, k) ||
  //     testCollideCircle(createVector(b.x, a.y), rs, k)
  //   );
}

function testCollideSquare(a, b, k) {
  return a.x < k.x && a.y < k.y && b.x > k.x && b.y > k.y;
}

function testCollideCircle(a, rs, k) {
  return a.sub(k).magSq() <= rs;
}