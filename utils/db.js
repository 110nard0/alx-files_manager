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

  async createFile(file) {
    const { insertedId } = await this.db.collection('files').insertOne(file);
    const newFile = await this.getFileById(insertedId);
    return newFile;
  }

  async createUser({ email, password }) {
    const newUser = await this.db.collection('users').insertOne({ email, password });
    return newUser.ops[0];
  }

  async getFileById(fileId) {
    const file = await this.db.collection('files').findOne({ _id: new ObjectId(fileId) });
    return file;
  }

  async getFiles(parentId = 0, page = 0) {
    const collection = this.db.collection('files');
    const pageSize = 20;
    const skip = page * pageSize;
    let files = [];

    if (parentId === 0) {
      files = await collection.find({}).toArray();
    } else {
      const aggregationPipeline = [
        { $match: { parentId } },
        { $skip: skip },
        { $limit: pageSize },
      ];

      files = await collection.aggregate(aggregationPipeline).toArray();
    }

    return files;
  }

  async getUserByEmail(email) {
    const user = await this.db.collection('users').findOne({ email });
    return user;
  }

  async getUserById(userId) {
    const user = await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
    return user;
  }

  async updateFile(fileId, fileStatus) {
    await this.db.collection('files').updateOne({ _id: new ObjectId(fileId) }, { $set: { isPublic: fileStatus } });
    const file = await this.getFileById(fileId);
    return file;
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
