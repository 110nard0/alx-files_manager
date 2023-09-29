import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        console.log('Connected to MongoDB');
      }
    });

    this.db = this.client.db(database);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const userCount = await this.db.collection('users').countDocuments();
    return userCount;
  }

  async nbFiles() {
    const fileCount = await this.db.collection('files').countDocuments();
    return fileCount;
  }
}

const dbClient = new DBClient();
export default dbClient;
