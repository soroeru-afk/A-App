const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname)));

// 汎用プロキシ関数 (Node.js標準のhttpモジュールを使用して依存関係を排除)
function proxyRequest(urlStr, method, payload = null) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const postData = payload ? JSON.stringify(payload) : '';
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (payload && method === 'POST') {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      if (payload && method === 'POST') {
        req.write(postData);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// SD WebUI APIへのプロキシ
app.post('/api/proxy', async (req, res) => {
  const { targetUrl, payload } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    const result = await proxyRequest(targetUrl, 'POST', payload);
    res.setHeader('Content-Type', 'application/json');
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Proxy POST Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SD WebUI APIのGET系リクエストのプロキシ
app.post('/api/proxy/get', async (req, res) => {
  const { targetUrl } = req.body;
  try {
    const result = await proxyRequest(targetUrl, 'GET');
    res.setHeader('Content-Type', 'application/json');
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Proxy GET Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SOLID-REFORGE-ANGLE-CHANGER] Running at http://localhost:${PORT}`);
});
