/* eslint-disable */
import fs from 'fs';
// import mime from 'mime-types';
import path from 'path';
import { v4 as uuid4 } from 'uuid';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';
// import queue from '../worker';
// import fileQueue from '../jobber';

const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

// GET /files
// export const getIndex = async (req, res) => {
//   const token = req.headers['x-token'];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const key = `auth_${token}`;
//   const userId = await redisClient.get(key);

//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await dbClient.getUserById(userId);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { parentId, page } = req.query;
//   const files = await dbClient.getFiles(parentId, page);

//   return res.json(files);
// };

// GET /files/:id/data
// export const getFile = async (req, res) => {
//   const token = req.headers['x-token'];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const key = `auth_${token}`;
//   const userId = await redisClient.get(key);

//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await dbClient.getUserById(userId);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.params;
//   const { size } = req.query;
//   const file = await dbClient.getFileById(id);

//   if (!file) {
//     return res.status(404).json({ error: 'Not found' });
//   }
//   if (!file.isPublic && (!user || file.userId !== userId)) {
//     return res.status(404).json({ error: 'Not found' });
//   }
//   if (file.type === 'folder') {
//     return res.status(400).json({ error: "A folder doesn't have content" });
//   }

//   let filePath = file.localPath;
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: 'Not found' });
//   }

//   if (file.type === 'image' && size) {
//     const sizePath = `${filePath}_${size}`;

//     if (fs.existsSync(sizePath)) {
//       filePath = sizePath;
//     } else {
//       return res.status(404).json({ error: 'Not found' });
//     }
//   }

//   const mimeType = mime.contentType(file.name);
//   res.setHeader('Content-Type', mimeType);
//   res.sendFile(filePath);
//   // fs.createReadStream(filePath).pipe(res);
// };

// GET /files/:id
// export const getShow = async (req, res) => {
//   const token = req.headers['x-token'];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const key = `auth_${token}`;
//   const userId = await redisClient.get(key);

//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await dbClient.getUserById(userId);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.params;
//   const file = await dbClient.getFileById(id);

//   if (!file) {
//     return res.status(404).json({ error: 'Not found' });
//   }

//   return res.json(file);
// };

// POST /files
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

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    fs.writeFile(filePath, fileData, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving file' });
      }
    });

    file.localPath = filePath;
  }

  dbClient.createFile(file)
    .then((newFile) => {
      // if (newFile.type === 'image') {
      //   fileQueue.add('image', { // BULLMQ SYNTAX
      //   const job = queue.create('fileQueue', {
      //     userId,
      //     fileId: newFile._id,
      //   })
      //     .save((err) => {
      //       if (!err) console.log(job.id);
      //     });
      //   console.log('image added to queue');
      // }

      res.status(201).json(newFile);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error inserting file in DB' });
    });
};

// PUT /files/:id/publish
// export const putPublish = async (req, res) => {
//   const token = req.headers['x-token'];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const key = `auth_${token}`;
//   const userId = await redisClient.get(key);

//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await dbClient.getUserById(userId);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.params;
//   const file = await dbClient.getFileById(id);

//   if (!file) {
//     return res.status(404).json({ error: 'Not found' });
//   }

//   dbClient.updateFile(id, true)
//     .then((updatedFile) => res.status(200).json(updatedFile))
//     .catch(() => res.status(500).json({ error: 'Error updating file in DB' }));
// };

// PUT /files/:id/unpublish
// export const putUnpublish = async (req, res) => {
//   const token = req.headers['x-token'];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const key = `auth_${token}`;
//   const userId = await redisClient.get(key);

//   if (!userId) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const user = await dbClient.getUserById(userId);
//   if (!user) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const { id } = req.params;
//   const file = await dbClient.getFileById(id);

//   if (!file) {
//     return res.status(404).json({ error: 'Not found' });
//   }

//   dbClient.updateFile(id, false)
//     .then((updatedFile) => res.status(200).json(updatedFile))
//     .catch(() => res.status(500).json({ error: 'Error updating file in DB' }));
// };
