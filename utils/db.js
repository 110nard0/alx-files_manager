import { MongoClient, ObjectId } from 'mongodb';

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

  async createUser({ email, password }) {
    const newUser = await this.db.collection('users').insertOne({ email, password });
    return newUser.ops[0];
  }

  async getUserByEmail(email) {
    const user = await this.db.collection('users').findOne({ email });
    return user;
  }

  async getUserById(id) {
    const user = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
    return user;
  }

  async nbFiles() {
    const fileCount = await this.db.collection('files').countDocuments();
    return fileCount;
  }

  async nbUsers() {
    const userCount = await this.db.collection('users').countDocuments();
    return userCount;
  }
}

const dbClient = new DBClient();
export default dbClient;
