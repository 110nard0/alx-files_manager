import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import { Queue, QueueEvents, Worker } from 'bullmq';

import dbClient from './utils/db';

export const fileQueue = new Queue('fileQueue');
export const userQueue = new Queue('userQueue');

// Add job processor for fileQueue
const fileWorker = new Worker('fileQueue', async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.getFileById(fileId);
  if (!file || file.userId !== userId) {
    throw new Error('File not found in DB');
  }

  const filePath = file.localPath;
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found in local storage');
  }

  // Check if the file is an image
  if (file.type === 'image') {
    const sizes = [500, 250, 100];

    // Generate thumbnails
    await Promise.all(sizes.map(async (size) => {
      const thumbnailPath = `${filePath}_${size}`;
      const options = { width: size, responseType: 'base64' };
      const thumbnailData = await imageThumbnail(filePath, options);

      // Save thumbnails to disk
      await fs.writeFile(thumbnailPath, Buffer.from(thumbnailData, 'base64'),
        (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
        });
    }));
  }
});

// Add job processor for userQueue
const userWorker = new Worker('userQueue', async (job) => {
  const { userId } = job.data;
  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

// Create QueueSchedulers to manage job scheduling
const queueEvents = new QueueEvents('fileQueue');

queueEvents.on('completed', ({ jobId }) => {
  console.log(`done generating thumbnails for job #${jobId}`);
});

queueEvents.on(
  'failed',
  ({ jobId, failedReason }) => {
    console.error(`error generating thumbnails for job #${jobId}`, failedReason);
  },);

const uqueueEvents = new QueueEvents('userQueue');

uqueueEvents.on('completed', ({ jobId }) => {
  console.log(`done sending email for job #${jobId}`);
});

uqueueEvents.on(
  'failed',
  ({ jobId, failedReason }) => {
    console.error(`error sending email for job #${jobId}`, failedReason);
  });
