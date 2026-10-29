import mongoose from 'mongoose';
import { createApp } from './app.js';
const port = Number(process.env.PORT || 4000);
try {
  const app = createApp();
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expanse_planner', { serverSelectionTimeoutMS: 5000 });
  const host = process.env.HOST || '127.0.0.1';
  const server = app.listen(port, host, () => console.log(`Expanse API: http://${host}:${port}`));
  const close = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} catch (err) {
  console.error(`API could not start: ${err.message}\nStart MongoDB or set MONGODB_URI in backend/.env. The frontend demo works without the API.`);
  process.exit(1);
}
