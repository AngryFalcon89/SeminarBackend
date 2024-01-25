const express = require('express');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

module.exports = app;
