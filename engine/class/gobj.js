class Gobj {
  constructor(mdl, id) {
    this.id = id;
    if (mdl.name) {
      this.mdlname = mdl.name;
      this.mdl = cloneObj(mdlRef[mdl.name]);
    } else if (mdl.custom) {
      this.mdlname = '[CUSTOM]';
      this.mdl = mdl.custom;
    }
    this.obj = this.mdl.obj;
    delete this.mdl.obj;
    if (mdl.metadata) {
      let meta = this.obj.find(x => x.meta);
      if (!meta) this.obj.unshift({meta: true, skip: true});
      meta.data = mdl.metadata;
    }
    this.obj = this.obj.map((x, i) => {
      if (x.preset) {
        let p = mdlRef[x.preset];
        if (!p) p = mdlRef.missing;
        p = cloneObj(p.obj[0]);
        Object.entries(p).forEach(y => {
          if (!x.hasOwnProperty(y[0])) x[y[0]] = y[1]
        });
      }
      x.pid = this.id;
      x.oid = i;
      x.calc = cwrap(x.calc || (() => { }));
      return x;
    });
    this.pos = createVector(...(mdl.pos || [0]));
    this.rot = mdl.rot || [0, 0, 0];
    if (mdl.rh) this.rot[1] = mdl.rh;
    world.objs[this.id] = this;
    if (mdl.metadata) this.obj.find(x => x.meta).calc(true);
  }

  translate() {
    translate(this.pos);
    rotateY(this.rot[1]);
    rotateX(this.rot[0]);
    rotateZ(this.rot[2]);
  }
}

function nid() {
  return ':' + Math.floor(Math.random() * (36 ** 8 - 1)).toString(36);
}

function createWorld() {
  world.objs = {};
  map.objs.forEach((x, i) => {
    new Gobj(x, ':o:' + i);
  })
}

let mdlRef = {
  missing: {
    obj: [
      {
        pos: [0, 0, 0, 50],
        tex: "missing"
      }
    ]
  }
};

let world = {
  objs: {

  }
};

let map = {
  objs: [

  ]
};

function cwrap(fn) {
  return function (x) {
    if (!x) mapUD.push(['calc', this.pid, this.oid, this.data]);
    return fn.apply(this);
  }
}

function domapUD(x) {
  let type = x[0];
  switch (type) {
    case 'calc':
      let obj = world.objs[x[1]].obj[x[2]];
      let data = x[3];
      obj.data = data;
      obj.calc(true);
      break;
    case 'new':
      createObj(x[1], x[2], true);
      break;
    case 'del':
      deleteObj(x[1], true);
      break;
  }
}

function createObj(mdl, id=nid(), x=false) {
  if (!x) mapUD.push(['new', mdl, id]);
  return new Gobj(mdl, id);
}

function deleteObj(pid, x) {
  if (!x) mapUD.push(['del', pid]); 
  delete world.objs[pid];
}