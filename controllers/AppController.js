import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getStatus = (req, res) => {
  const redisStatus = redisClient.isAlive();
  const dbStatus = dbClient.isAlive();

  res.statusCode = 200;
  res.json({ redis: redisStatus, db: dbStatus });
};

const getStats = async (req, res) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();

  res.statusCode = 200;
  res.json({ users, files });
};

module.exports = { getStats, getStatus };
