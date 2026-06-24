import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Simple API health/info endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', game: 'Spectrum Ascension' });
  });

  if (!isProd) {
    // Development mode
    console.log('Loading Vite middleware for development...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log('Serving production build assets...');
    app.use('/Spectrum-Ascension', express.static(path.resolve(__dirname, 'docs')));
    app.use(express.static(path.resolve(__dirname, 'docs')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'docs/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Critical failure starting server:', error);
});

