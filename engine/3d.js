
function draw3D() {
	push();
	floatingTextArr = [];
	if (firstperson) {
		perspective(PI / 2.8, width / height, 0.1, 5000);
		camera(
			player.pos.x, player.pos.y - 100, player.pos.z,
			player.pos.x + cos(camYaw - PI / 2),
			player.pos.y - 100 + tan(-camPitch),
			player.pos.z + sin(camYaw - PI / 2),
			0, 1, 0
		);
	} else {
		camera(0, 0, 800);

		rotateX(camPitch);
		rotateY(camYaw);

		translate(-player.pos.x, -player.pos.y, -player.pos.z);
	}

	if (!firstperson)
		player.render();

	Object.values(players).map(x => x.render());

	drawGrid(1000, 50);

	push();
	translate(-200, -100, 300)
	noStroke();
	scale(25, -25, 25);
	texture(textures['grass']);
	model(teapot);
	pop();

	drawObjs();

	if (marker) {
		push();
		translate(marker.x - 25, -50, marker.y);
		rotateY(-camYaw);
		rotateZ(-deg90 / 2);
		texture(textures.marker);
		plane(50, 50);
		rotateZ(deg90 / 2);
		let dis = Math.max(0, marker.copy().sub(player.pos.x, player.pos.z).mag() / 3 - 500);
		translate(0, -5050 - dis / 2, 0);
		texture(textures.beacon);
		tint(255, 255, 255, 128); 
		plane(50 + dis / 2, 10000 + dis);
		pop();
	}

	floatingTextArr.forEach(x => drawFloatingText(...x));
	pop();
}

function drawObjs() {
	let afterdraw = [];

	Object.values(world.objs).forEach(x => {
		push();
		x.translate();
		let p = _renderer.uModelMatrix.multiplyVec4(0, 0, 0, 1);
		p = createVector(...p).sub(player.pos);
		if (p.magSq() > renderdis * renderdis) return pop();
		x.obj.forEach(x => drawObj(x, afterdraw));
		pop();
	});

	afterdraw.forEach(x => drawObj(x[0], null, x[1]));
}

function drawObj(x, y, m) {
	if (x.hide) return;
	if (x.dl && y) {
		return y.push([x, _renderer.uModelMatrix.mat4.slice()]);
	}
	push();
	if (m) _renderer.uModelMatrix.mat4 = m;
	translate(...x.pos.slice(0, 3));
	if (x.tex) {
		texture(textures[x.tex]);
	} else {
		fill(...x.col.slice(0, 4));
	}
	if (x.stk) {
		stroke(...x.stk.slice(1));
		strokeWeight(x.stk[0] ?? 1);
	} else {
		noStroke();
	}
	if (x.pos[4])
		translate(0, -x.pos[4] / 2, 0)
	box(...x.pos.slice(3, 6));
	pop();
}


function drawGrid(size, step) {
	let floorSize = 5000;
	let tex = textures.grass;
	push();
	textureWrap(MIRROR);
	rotateX(HALF_PI);
	translate(
		player.pos.x - player.pos.x % (tex.width * 2),
		player.pos.z - player.pos.z % (tex.height * 2), -1);
	texture(tex);
	beginShape();
	vertex(-floorSize / 2, -floorSize / 2, 0, 0);
	vertex(floorSize / 2, -floorSize / 2, floorSize, 0);
	vertex(floorSize / 2, floorSize / 2, 0, floorSize, floorSize);
	vertex(-floorSize / 2, floorSize / 2, 0, 0, floorSize);
	endShape();
	pop();

	push();
	stroke(0);
	strokeWeight(1);
	for (let x = -size / 2; x <= size / 2; x += step) {
		line(x, 0, -size / 2, x, 0, size / 2);
	}
	for (let z = -size / 2; z <= size / 2; z += step) {
		line(-size / 2, 0, z, size / 2, 0, z);
	}
	pop();
}

function floatingText(txt, t) {
	floatingTextArr.push([txt, t, _renderer.uModelMatrix.mat4.slice()]);
}

function drawFloatingText(txt, t, m) {
	push();
	_renderer.uModelMatrix.mat4 = m;
	if (!t) drawingContext.disable(drawingContext.DEPTH_TEST);
	translate(0, -50, 0);
	rotateY(-camYaw);
	rotateX(-camPitch);

	textAlign(CENTER, CENTER);
	textSize(t ? 18 : 12);
	textFont(font);
	let twidth = textWidth(txt);
	let theight = textAscent() + textDescent();

	fill(t ? color(255) : color(64, 64, 64, 128));
	noStroke();
	rectMode(CENTER);
	rect(0, 3, twidth + 10, theight + 3);

	fill(t ? 0 : 255);
	text(txt, 2, 0);
	if (!t) drawingContext.enable(drawingContext.DEPTH_TEST);
	pop();
}

let floatingTextArr;