async function set(v) {
  try {
    fetch(process.env.API, {
      method: 'POST',
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "cookie": "__test=19bca806e3b1612c6ac3d3a0e8206710" //cheap workaround
      },
      body: JSON.stringify(v)
    });
    console.log('saved');
  } catch (e) {
    console.log('failed set');
    return;
  }
}

async function get() {
  try {
    let x = await fetch(process.env.API, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "cookie": "__test=19bca806e3b1612c6ac3d3a0e8206710"
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