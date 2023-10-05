/* eslint-disable consistent-return */
// import crypto from 'crypto';
import sha1 from 'sha1';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import queue from '../worker';
// import userQueue from '../jobber';

// POST /users
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

  // const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
  const hashedPassword = sha1(password);

  dbClient.createUser({
    email,
    password: hashedPassword,
  })
    .then((newUser) => {
      const { _id: userId, email } = newUser;

      // Add a job to the queue
      // userQueue.add('user', { userId }); // BULLMQ SYNTAX
      const job = queue.create('userQueue', { userId })
        .save((err) => {
          if (!err) console.log(job.id);
        });
      console.log('user added to queue');

      res.status(201).json({ id: userId, email });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Error inserting user in DB' });
    });
};

// /GET /users/me
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
