const express = require('express');
const {
  createBook,
  getAllBooks,
  deleteBook,
  updateBook,
  issueBook,
  returnBook,
  getIssuedBooks,
} = require('../controllers/bookController');
const { authToken } = require('../middleware/jwtMiddleware');

const router = express.Router();

router.post('/', authToken, createBook);

router.get('/', getAllBooks);

router.delete('/:bookID', authToken, deleteBook);

router.patch('/:bookID', authToken, updateBook);

router.post('/:bookID/issue', authToken, issueBook);

router.post('/:bookID/return', authToken, returnBook);

router.get('/issued-books', authToken, getIssuedBooks);
module.exports = router;
