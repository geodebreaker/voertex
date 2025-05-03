async function set(v, s) {
  if (!process.env.API) return;
  try {
    fetch(process.env.API || '', {
      method: 'POST',
      headers: {
        authorization: "Bearer " + process.env.KEY
      },
      body: s ? v : JSON.stringify(v)
    }).then(e => { if (!e.ok) throw new Error('failed set') });
    console.log('saved');
  } catch (e) {
    console.log('failed set');
    return;
  }
}

async function get() {
  if (!process.env.API) return;
  try {
    let x = await fetch(process.env.API, {
      headers: {
        authentication: "Bearer " + process.env.KEY
      }
    }).then(e => e.json());
    console.log('gotten');
    return x;
  } catch (e) {
    console.log('failed get');
    return;
  }
}

module.exports = { set, get };