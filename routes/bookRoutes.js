const express = require('express');
const {
  createBook,
  getAllBooks,
  deleteBook,
  updateBook,
} = require('../controllers/bookController');

const router = express.Router();

router.post('/', createBook);

router.get('/', getAllBooks);

router.delete('/:bookID', deleteBook);

router.patch('/:bookID', updateBook);

module.exports = router;
