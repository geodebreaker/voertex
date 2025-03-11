class Gobj {
  constructor(mdl, id) {
    this.id = id;//id();
    this.mdl = cloneObj(mdlRef[mdl.name]);
    this.obj = this.mdl.obj;
    delete this.mdl.obj;
    this.obj.forEach((x, i) => {
      x.pid = this.id;
      x.oid = i;
      x.calc = cwrap(x.calc || (()=>{}));
    });
    this.pos = createVector(...(mdl.pos || [0]));
    this.rot = mdl.rot || [0, 0, 0];
    if (mdl.rh) this.rot[1] = mdl.rh; 
    world.objs[this.id] = this;
  }

  translate() {
		translate(this.pos);
		rotateY(this.rot[1]);
		rotateX(this.rot[0]);
		rotateZ(this.rot[2]);
  }
}

// function id() {
//   return ':' + Math.floor(Math.random() * (36 ** 8 - 1)).toString(36);
// }

function createWorld() {
  world.objs = {};
  map.objs.forEach((x, i) => {
    new Gobj(x, i);
  })
}

let world = {
  objs: {
    
  }
};
let map = {
  objs: [

  ]
};

function cwrap(fn) {
  return function(x) {
    if (!x) mapUD.push(['calc', this.pid, this.oid, this.data]);
    return fn.apply(this);
  }
}

function domapUD(x) {
  let type = x[0];
  switch(type) {
    case 'calc':
      let obj = world.objs[x[1]].obj[x[2]];
      let data = x[3];

      obj.data = data;
      obj.calc(true);
      break;
  }
}