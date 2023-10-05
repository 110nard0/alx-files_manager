import { promisify } from 'util';
import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('connect', () => {
      console.log('Redis server connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
