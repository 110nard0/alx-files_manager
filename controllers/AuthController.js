import crypto from 'crypto';
import { v4 as uuid4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';


export const getConnect = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [ email, password ] = credentials.split(':');
  const user = await dbClient.getUserByEmail(email);

  if (!user || user.password !== crypto.createHash('sha1').update(password).digest('hex')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuid4();
  const key = `auth_${token}`;

  // await redisClient.set(key, user._id.toString(), 24 * 3600);
  await redisClient.set(key, user._id, 24 * 3600);
  res.status(200).json({ token });
}

export const getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];

  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
  const userId = redisClient.get(key);

  if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(key);
  res.sendStatus(204);
}
