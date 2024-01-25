const { default: mongoose } = require('mongoose');

const bookSchema = new mongoose.Schema({
  ID: Number,
  Accession_Number: Number,
  MAL_ACC_Number: Number,
  Author: String,
  Title: String,
  Book_Status: {
    type: Boolean,
    default: true,
  },
  Edition: Number,
  Publisher: String,
  Category1: String,
  Category2: String,
  Category3: String,
  Publishing_Year: Date,
  Author1: String,
  Author2: String,
  Author3: String,
});

module.exports = mongoose.model('Book', bookSchema);
