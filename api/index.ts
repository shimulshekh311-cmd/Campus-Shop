import express from 'express';
import { apiRouter } from '../server/routes.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount the API router
app.use('/api', apiRouter);

export default app;
