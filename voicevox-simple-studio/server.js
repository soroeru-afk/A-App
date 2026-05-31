import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 51021;
const VOICEVOX_URL = 'http://127.0.0.1:50021';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 汎用プロキシエンドポイント
app.use('/api/voicevox', async (req, res) => {
  try {
    const url = new URL(req.url, VOICEVOX_URL);
    
    // リクエストのヘッダーとボディを構築
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      // GET, HEADリクエスト以外はボディを含める
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
    };

    const response = await fetch(url.toString(), options);
    
    // レスポンスヘッダーの引き継ぎ
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // ステータスコードの設定
    res.status(response.status);
    
    // バイナリデータ（音声など）の場合はarrayBufferで処理
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to communicate with VOICEVOX' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
