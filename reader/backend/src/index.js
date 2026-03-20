// Charger dotenv **avant tout** pour que process.env soit prêt
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const express = require('express');
const cors = require('cors');

const articlesRoutes = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:5175'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  }),
);

// Middleware pour parser le JSON
app.use(express.json());

// Route test simple
app.get('/', (req, res) => {
  res.send('Reader back OK ✅');
});

// Routes principales
app.use('/articles', articlesRoutes);

// Écoute du serveur **sauf en test** (Jest/Supertest n'en a pas besoin)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reader back démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
