const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname)));

// SD WebUI APIへのプロキシ
app.post('/api/proxy', async (req, res) => {
  const { targetUrl, payload } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SD WebUI APIのGET系リクエストのプロキシ
app.post('/api/proxy/get', async (req, res) => {
  const { targetUrl } = req.body;
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch status' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SOLID-REFORGE-ANGLE-CHANGER] Running at http://localhost:${PORT}`);
});
