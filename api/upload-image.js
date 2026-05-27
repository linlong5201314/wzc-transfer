import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KEY_LATEST = 'transfer:image:latest';
const KEY_HISTORY = 'transfer:image:history';
const MAX_HISTORY = 50;
const MAX_BASE64_BYTES = 3 * 1024 * 1024; // 3MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const image = typeof body.image === 'string' ? body.image : '';
    const filename = typeof body.filename === 'string' ? body.filename.slice(0, 128) : 'image.jpg';
    const senderId = typeof body.senderId === 'string' ? body.senderId.slice(0, 64) : 'anonymous';

    if (!image) {
      return res.status(400).json({ error: '图片不能为空' });
    }
    if (Buffer.byteLength(image, 'utf8') > MAX_BASE64_BYTES) {
      return res.status(413).json({ error: '图片过大，请压缩后重试' });
    }

    const message = {
      image,
      filename,
      senderId,
      timestamp: Date.now()
    };

    await Promise.all([
      redis.set(KEY_LATEST, message),
      redis.lpush(KEY_HISTORY, message),
      redis.ltrim(KEY_HISTORY, 0, MAX_HISTORY - 1)
    ]);

    return res.status(200).json({
      ok: true,
      message: { filename, senderId, timestamp: message.timestamp }
    });
  } catch (err) {
    console.error('upload-image error:', err);
    return res.status(500).json({ error: '服务器错误', detail: String(err?.message || err) });
  }
}
