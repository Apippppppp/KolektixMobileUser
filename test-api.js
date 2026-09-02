import https from 'https';

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const res = await get('https://api.kolektix.my.id/api/event');
  if (res.status === 200) {
    const json = JSON.parse(res.data);
    console.log('Total events fetched:', json.data ? json.data.length : 0);
    console.log('Sample event item 0:', JSON.stringify(json.data[0], null, 2));
    if (json.data.length > 1) {
      console.log('Sample event item 1:', JSON.stringify(json.data[1], null, 2));
    }
  }
}

run();
