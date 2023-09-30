import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const existingUser = await dbClient.getUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({ error: 'Already exists' });
  }

  const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
  const newUser = await dbClient.createUser({ email, password: hashedPassword });

  res.status(201).json({ id: newUser._id, email: newUser.email });
};

export const getMe = async (req, res) => {
  const token = req.headers['x-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await dbClient.getUserById(userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, _id: id } = user;
  res.status(200).json({ id, email });
};
