const express = require('express');
const {
  createBook,
  getAllBooks,
  deleteBook,
  updateBook,
} = require('../controllers/bookController');
const { authToken } = require('../middleware/jwtMiddleware');

const router = express.Router();

router.post('/', authToken, createBook);

router.get('/', getAllBooks);

router.delete('/:bookID', authToken, deleteBook);

router.patch('/:bookID', authToken, updateBook);

module.exports = router;
