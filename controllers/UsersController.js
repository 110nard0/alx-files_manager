import bcrypt from 'bcrypt';
import dbClient from '../utils/db';

export const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email'});
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password'});
  }

  const existingUser = await dbClient.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await dbClient.createUser({ email, password: hashedPassword });

  res.status(201).json({ id: newUser._id, email: newUser.email });
};
