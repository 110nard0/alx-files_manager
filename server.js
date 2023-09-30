import express from 'express';
import router from './routes/index';

const app = express();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', router);

app.listen(port, host, () => {
  console.log(`Server running on port ${port}`);
});
