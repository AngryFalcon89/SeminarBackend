const express = require('express');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

// Middleware to trim every string field in req.body
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
});

app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

module.exports = app;
