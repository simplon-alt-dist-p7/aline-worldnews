require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001;
const cors = require('cors');
const articlesRoutes = require('./routes/articles');

app.use(
  cors({
    origin: ['http://localhost:5175', 'https://votredomaine.com'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Reader back OK ✅');
});

app.use('/articles', articlesRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Reader back démarré sur http://localhost:${PORT}`);
});

module.exports = app;
