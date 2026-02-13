import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import gameplayRoutes from './routes/gameplay';
import resultsRoutes from './routes/results';
import adminRoutes from './routes/admin';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', gameRoutes);
  app.use('/api', gameplayRoutes);
  app.use('/api', resultsRoutes);
  app.use('/api/admin', adminRoutes);

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  return app;
}
