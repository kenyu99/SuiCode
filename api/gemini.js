export default async function handler(req, res) {

  const allowedOrigin = "https://kenyu99.github.io"; 
  const requestOrigin = req.headers.origin;

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
    if (req.method !== 'OPTIONS') {
      return res.status(403).json({ error: '拒絕存取：未授權的請求來源。' });
    }
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { model } = req.query;
    const targetModel = model || 'gemini-3.5-flash';
    
    const rawApiKeys = process.env.GEMINI_API_KEY;
    if (!rawApiKeys) {
      return res.status(500).json({ error: '伺服器未設定 GEMINI_API_KEY 環境變數' });
    }

    const apiKeys = rawApiKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
    if (apiKeys.length === 0) {
      return res.status(500).json({ error: '無效的 GEMINI_API_KEY 設定' });
    }

    const selectedApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${selectedApiKey}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
