import fs from 'fs';
import kue from 'kue';
import imageThumbnail from 'image-thumbnail';

import dbClient from './utils/db';

const queue = kue.createQueue();
export default queue;

queue.process('fileQueue', async (job, done) => {
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
  done();
});

queue.process('userQueue', async (job, done) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
})

// Create a queue scheduler to manage job scheduling
queue
  .on('job enqueue', (id, type) => {
    console.log(`Job ${id} got queued of type ${type}`);
  })
  .on('job complete', (id, result) => {
    kue.Job.get(id, (err, job) => {
      if (err) return;
      job.remove((err) => {
        if (err) throw err;
        console.log('removed completed job #%d', job.id);
      });
    });
  });
