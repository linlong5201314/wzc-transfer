// 诊断接口: GET /api/health
// 用来定位"为什么 API 报 500"
// 安全: 只返回是否存在、长度,不返回真实值
import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  const checks = {
    env: {
      UPSTASH_REDIS_REST_URL: {
        present: !!url,
        length: url.length,
        startsWithHttps: url.startsWith('https://'),
        endsWithSlash: url.endsWith('/'),
        hasQuotes: url.startsWith('"') || url.endsWith('"'),
        preview: url ? url.slice(0, 20) + '...' + url.slice(-8) : null
      },
      UPSTASH_REDIS_REST_TOKEN: {
        present: !!token,
        length: token.length,
        hasQuotes: token.startsWith('"') || token.endsWith('"'),
        preview: token ? token.slice(0, 6) + '...' + token.slice(-4) : null
      }
    },
    redis: { ok: false, error: null },
    runtime: {
      node: process.version,
      vercelRegion: process.env.VERCEL_REGION || null,
      vercelEnv: process.env.VERCEL_ENV || null
    }
  };

  // 尝试连接 Redis
  if (url && token) {
    try {
      const redis = Redis.fromEnv();
      const pong = await redis.ping();
      checks.redis.ok = pong === 'PONG' || pong === true;
      checks.redis.response = pong;
    } catch (err) {
      checks.redis.error = String(err?.message || err);
    }
  } else {
    checks.redis.error = '环境变量缺失,无法测试';
  }

  const httpStatus = (checks.env.UPSTASH_REDIS_REST_URL.present
    && checks.env.UPSTASH_REDIS_REST_TOKEN.present
    && checks.redis.ok) ? 200 : 500;

  return res.status(httpStatus).json(checks);
}
