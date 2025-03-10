function tryMove(d) {
  let r = testCollideAll(player.pos);
  if (!r) player.pos.add(d);
}

function testCollideAll(P, S) {
  push();
  resetMatrix();
  let r = !map.objs.every(x => {
		let mdl = mdlRef[x.name] || { obj: [] };
		let pos = createVector(...(x.pos || [0]));
		let rot = x.rot || [0, 0, 0];
		if (x.rh) rot[1] = x.rh;
		push();
		translate(pos);
		rotateY(rot[1]);
		rotateX(rot[0]);
		rotateZ(rot[2]);
    let o = mdl.obj.every(x => {
      push();
	    translate(...x.pos.slice(0, 3));
      let s = x.pos.slice(3, 6);
      if (s.length == 1) s = [s[0], s[0], s[0]];
      s = createVector(s[0], 0, s[2]);
      translate(s.mult(.5));
      let p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
      let a = createVector(p[0], p[2]);
      translate(s.mult(-2));
      p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
      let b = createVector(p[0], p[2]);
      let cr = testCollide(P, S, a.sub(200, 200), b.sub(200, 200));
      console.log(cr, P.x, P.y, a.x, a.y, b.x, b.y, testCollideSquare(a, b, P));
      pop();
      return !cr;
    });
		pop();
    return o;
	});
  pop();
  return r;
}

function testCollide(k, r, a, b) {
  a = a.copy();
  b = b.copy();
  if (a.x > b.x) [a.x, b.x] = [b.x, a.x];
  if (a.y > b.y) [a.y, b.y] = [b.y, a.y];
  let rs = r * r;
  return (
    testCollideSquare(a.x - r, a.y - r, b.x + r, b.y + r)
  )
  // return (
  //   testCollideSquare(createVector(a.x, a.y - r), b, k) &&
  //   testCollideSquare(createVector(a.x - r, a.y), b, k) &&
  //   testCollideSquare(a, createVector(b.x, b.y + r), k) &&
  //   testCollideSquare(a, createVector(b.x + r, b.y), k) &&
  //   testCollideCircle(a.copy(), rs, k) &&
  //   testCollideCircle(b.copy(), rs, k) &&
  //   testCollideCircle(createVector(a.x, b.y), rs, k) &&
  //   testCollideCircle(createVector(b.x, a.y), rs, k)
  // );
}

function testCollideSquare(a, b, k) {
  return a.x < k.x && a.y < k.y && b.x > k.x && b.y > k.y;
}

function testCollideCircle(a, rs, k) {
  return a.sub(k).magSq() > rs;
}