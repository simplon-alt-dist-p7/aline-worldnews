import 'reflect-metadata';
import express, { type Express } from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT;

// Configuration CORS
app.use(
  cors({
    origin: ['http://localhost:5174'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "Bienvenue sur l'API writer/backend",
    status: 'running',
  });
});

app.use(errorHandler);

const startServer = async () => {
  if (process.env.NODE_ENV === 'test') return; // Ne rien faire pendant les tests

  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

startServer();

export { app };
