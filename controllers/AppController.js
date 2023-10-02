import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus = (req, res) => {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    res.statusCode = 200;
    res.json({ redis: redisStatus, db: dbStatus });
  };

  static async getStats (req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    res.statusCode = 200;
    res.json({ users, files });
  };
}

module.exports = AppController;
