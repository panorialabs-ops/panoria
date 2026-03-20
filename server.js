/*
  Simple proxy server to forward webhook requests to Discord.
  Usage: node server.js
  The server exposes POST /webhook which forwards the JSON body to the Discord webhook URL.
  It allows CORS so your frontend (served on another port) can call it.
*/
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use environment variable if provided, otherwise fallback to the hardcoded webhook
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1481825151552065596/HEscfhkBJDwrA3mfUgB5iQLnnwgfZQ-8lV7MsVPdJmRyC_m8Azvrtqn1KfLKHYnb0Lb6';

app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/', (req, res) => res.send('Panoria webhook proxy running'));

app.post('/webhook', async (req, res) => {
  try{
    const payload = req.body;
    if(!payload) return res.status(400).json({ error: 'missing JSON body' });

    const resp = await axios.post(DISCORD_WEBHOOK_URL, payload, { headers: { 'Content-Type': 'application/json' } });
    return res.status(resp.status).json({ ok: true });
  }catch(err){
    console.error('Webhook proxy error:', err && err.message ? err.message : err);
    // forward status if available
    const status = err.response && err.response.status ? err.response.status : 500;
    return res.status(status).json({ ok: false, error: err.message || 'unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
