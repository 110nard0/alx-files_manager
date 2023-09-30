import fs from 'fs';
import path from 'path';
import { v4 as uuid4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

export const postUpload = async (req, res) => {
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

  const {
    name, type, parentId = 0, isPublic = false, data,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  if (!type || !['file', 'folder', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return res.status(400).json({ error: 'Missing data' });
  }
  if (parentId !== 0) {
    const parentFile = await dbClient.getFileById(parentId);

    if (!parentFile) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }

  const file = {
    name, type, parentId, userId, isPublic,
  };

  if (type !== 'folder') {
    const filePath = path.join(folderPath, `${uuid4()}`);
    const fileData = Buffer.from(data, 'base64');

    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }

    fs.writeFile(filePath, fileData, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving file' });
      }

      file.localPath = filePath;
      dbClient.createFile(file)
        .then((newFile) => {
          res.status(201).json(newFile);
        })
        .catch(() => {
          return res.status(500).json({ error: 'Error inserting file in DB' });
        });
    });
  } else {
    const newFile = await dbClient.createFile(file);
    res.status(201).json(newFile);
  }
};