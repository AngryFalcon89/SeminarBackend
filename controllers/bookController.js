const { isNumeric, isAlphanumeric, isDate, isAlpha } = require('validator');
const { default: mongoose } = require('mongoose');
const { default: isEmail } = require('validator/lib/isEmail');
const BookModel = require('../models/bookModel');

module.exports.createBook = async (req, res) => {
  try {
    const {
      ID,
      Accession_Number,
      MAL_ACC_Number,
      Author,
      Title,
      Publisher,
      Edition,
      Publishing_Year,
      Author1,
      Author2,
      Author3,
      Category1,
      Category2,
      Category3,
    } = req.body;

    // ID VALIDATION STARTS
    if (!('ID' in req.body) || !ID) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide ID' });
    }

    if (!isNumeric(ID)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'ID is not a number' });
    }

    if (await BookModel.findOne({ ID })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a unique ID' });
    }
    // ID VALIDATION ENDS

    // Accession_Number VALIDATION STARTS
    if (Accession_Number) {
      if (!isNumeric(Accession_Number)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Accession_Number is not a number',
        });
      }
    }

    // Accession_Number VALIDATION ENDS

    // MAL_ACC_Number VALIDATION STARTS
    if (MAL_ACC_Number) {
      if (!isNumeric(MAL_ACC_Number)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'MAL_ACC_Number is not a number' });
      }
    }

    // MAL_ACC_Number VALIDATION ENDS

    // Author VALIDATION STARTS
    if (!('Author' in req.body) || !Author) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide Author' });
    }

    if (!isAlphanumeric(Author, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Author can only be alphanumeric' });
    }
    // Author VALIDATION ENDS

    // Title VALIDATION STARTS
    if (!('Title' in req.body) || !Title) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide Title' });
    }

    if (!isAlphanumeric(Title, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Title can only be alphanumeric' });
    }
    // Title VALIDATION ENDS

    // Publisher VALIDATION STARTS
    if (!('Publisher' in req.body) || !Publisher) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide Publisher' });
    }

    if (!isAlphanumeric(Publisher, 'en-US', { ignore: ' ,.' })) {
      return res.status(400).json({
        status: 'fail',
        message: 'Publisher can only be alphanumeric',
      });
    }
    // Publisher VALIDATION ENDS

    // Edition VALIDATION STARTS
    if (Edition) {
      if (!isAlphanumeric(Edition, 'en-US', { ignore: ' ' })) {
        return res.status(400).json({
          status: 'fail',
          message: 'Edition can only be alphanumeric',
        });
      }
    }
    // Edition VALIDATION ENDS

    // Publishing_Year VALIDATION STARTS
    if (Publishing_Year) {
      if (!isDate(Publishing_Year)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Publishing_Year is not a date' });
      }
    }
    // Publishing_Year VALIDATION ENDS

    // Author1 VALIDATION STARTS
    if (Author1) {
      if (!isAlphanumeric(Author1, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author1 is not a alphanumeric' });
      }
    }
    // Author1 VALIDATION ENDS

    // Author2 VALIDATION STARTS
    if (Author2) {
      if (!isAlphanumeric(Author2, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author2 is not a alphanumeric' });
      }
    }
    // Author2 VALIDATION ENDS

    // Author3 VALIDATION STARTS
    if (Author3) {
      if (!isAlphanumeric(Author3, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author3 is not a alphanumeric' });
      }
    }
    // Author3 VALIDATION ENDS

    // Category1 VALIDATION STARTS
    if (Category1) {
      if (!isAlphanumeric(Category1, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category1 is not a alphanumeric' });
      }
    }
    // Category1 VALIDATION ENDS

    // Category2 VALIDATION STARTS
    if (Category2) {
      if (!isAlphanumeric(Category2, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category2 is not a alphanumeric' });
      }
    }
    // Category2 VALIDATION ENDS

    // Category3 VALIDATION STARTS
    if (Category3) {
      if (!isAlphanumeric(Category3, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category3 is not a alphanumeric' });
      }
    }
    // Category3 VALIDATION ENDS

    const newBook = new BookModel({
      ID,
      Accession_Number,
      MAL_ACC_Number,
      Author,
      Title,
      Publishing_Year,
      Publisher,
      Author1,
      Author2,
      Author3,
      Category1,
      Category2,
      Category3,
    });

    await newBook.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'Book Saved Successfully', newBook });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.getAllBooks = async (req, res) => {
  try {
    const searchQuery = req.query.search_query;

    // eslint-disable-next-line radix
    const page = parseInt(req.query.page) || 1;
    // eslint-disable-next-line radix
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBooks = await BookModel.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    if (searchQuery) {
      const books = await BookModel.find({
        $or: [
          { Title: { $regex: searchQuery, $options: 'i' } },
          { Author: { $regex: searchQuery, $options: 'i' } },
          { Publisher: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('-IssuedTo')
        .skip(skip)
        .limit(limit)
        .sort({ ID: 1 });

      return res.status(200).json({
        status: 'success',
        message: 'Books according to search query fetched',
        currentPage: page,
        totalPages,
        books,
      });
    }

    const books = await BookModel.find()
      .select('-IssuedTo')
      .skip(skip)
      .limit(limit)
      .sort({ ID: 1 });
    return res.status(200).json({
      status: 'success',
      message: 'Books fetched successfully',
      books,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.deleteBook = async (req, res) => {
  try {
    let { bookID } = req.params;

    bookID = bookID ? bookID.trim() : '';

    if (!mongoose.isValidObjectId(bookID)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'bookID is not a valid ID' });
    }

    const bookToBeDeleted = await BookModel.findById(bookID);

    if (!bookToBeDeleted) {
      return res
        .status(400)
        .json({ status: 'fail', message: "book with this ID doesn't exist" });
    }

    await bookToBeDeleted.deleteOne();

    return res
      .status(200)
      .json({ status: 'success', message: 'Book successfully deleted' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.updateBook = async (req, res) => {
  try {
    let { bookID } = req.params;

    bookID = bookID ? bookID.trim() : '';

    if (!mongoose.isValidObjectId(bookID)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'bookID is not a valid ID' });
    }

    if (!(await BookModel.findById(bookID))) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Book with this ID not found' });
    }

    const updatedBook = req.body;

    // ID VALIDATION STARTS
    if (updatedBook.ID) {
      const { ID } = updatedBook;
      if (!isNumeric(ID)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'ID is not a number' });
      }

      if (await BookModel.findOne({ ID })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Please provide a unique ID' });
      }
    }
    // ID VALIDATION ENDS

    // Accession_Number VALIDATION STARTS
    if (updatedBook.Accession_Number) {
      const { Accession_Number } = updatedBook;
      if (!isNumeric(Accession_Number)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Accession_Number is not a number',
        });
      }
    }

    // Accession_Number VALIDATION ENDS

    // MAL_ACC_Number VALIDATION STARTS
    if (updatedBook.MAL_ACC_Number) {
      const { MAL_ACC_Number } = updatedBook;
      if (!isNumeric(MAL_ACC_Number)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'MAL_ACC_Number is not a number' });
      }
    }

    // MAL_ACC_Number VALIDATION ENDS

    // Author VALIDATION STARTS
    if (updatedBook.Author) {
      const { Author } = updatedBook;

      if (!isAlphanumeric(Author, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author can only be alphanumeric' });
      }
    }
    // Author VALIDATION ENDS

    // Title VALIDATION STARTS
    if (updatedBook.Title) {
      const { Title } = updatedBook;

      if (!isAlphanumeric(Title, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Title can only be alphanumeric' });
      }
    }
    // Title VALIDATION ENDS

    // Publisher VALIDATION STARTS
    if (updatedBook.Publisher) {
      const { Publisher } = updatedBook;

      if (!isAlphanumeric(Publisher, 'en-US', { ignore: ' ,.' })) {
        return res.status(400).json({
          status: 'fail',
          message: 'Publisher can only be alphanumeric',
        });
      }
    }
    // Publisher VALIDATION ENDS

    // Edition VALIDATION STARTS
    if (updatedBook.Edition) {
      const { Edition } = updatedBook;
      if (!isAlphanumeric(Edition, 'en-US', { ignore: ' ' })) {
        return res.status(400).json({
          status: 'fail',
          message: 'Edition can only be alphanumeric',
        });
      }
    }
    // Edition VALIDATION ENDS

    // Publishing_Year VALIDATION STARTS
    if (updatedBook.Publishing_Year) {
      const { Publishing_Year } = this.updateBook;
      if (!isDate(Publishing_Year)) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Publishing_Year is not a date' });
      }
    }
    // Publishing_Year VALIDATION ENDS

    // Author1 VALIDATION STARTS
    if (updatedBook.Author1) {
      const { Author1 } = updatedBook;
      if (!isAlphanumeric(Author1, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author1 is not a alphanumeric' });
      }
    }
    // Author1 VALIDATION ENDS

    // Author2 VALIDATION STARTS
    if (updatedBook.Author2) {
      const { Author2 } = updatedBook;
      if (!isAlphanumeric(Author2, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author2 is not a alphanumeric' });
      }
    }
    // Author2 VALIDATION ENDS

    // Author3 VALIDATION STARTS
    if (updatedBook.Author3) {
      const { Author3 } = updatedBook;
      if (!isAlphanumeric(Author3, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Author3 is not a alphanumeric' });
      }
    }
    // Author3 VALIDATION ENDS

    // Category1 VALIDATION STARTS
    if (updatedBook.Category1) {
      const { Category1 } = updatedBook;
      if (!isAlphanumeric(Category1, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category1 is not a alphanumeric' });
      }
    }
    // Category1 VALIDATION ENDS

    // Category2 VALIDATION STARTS
    if (updatedBook.Category2) {
      const { Category2 } = updatedBook;
      if (!isAlphanumeric(Category2, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category2 is not a alphanumeric' });
      }
    }
    // Category2 VALIDATION ENDS

    // Category3 VALIDATION STARTS
    if (updatedBook.Category3) {
      const { Category3 } = updatedBook;
      if (!isAlphanumeric(Category3, 'en-US', { ignore: ' ' })) {
        return res
          .status(400)
          .json({ status: 'fail', message: 'Category3 is not a alphanumeric' });
      }
    }
    // Category3 VALIDATION ENDS

    const bookToBeUpdated = await BookModel.findByIdAndUpdate(
      { _id: bookID },
      updatedBook,
      {
        new: true,
      }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Book Updated Successfully',
      bookToBeUpdated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.issueBook = async (req, res) => {
  try {
    const { name, email, returnDate, remarks } = req.body;
    let { bookID } = req.params;

    bookID = bookID ? bookID.trim() : '';

    if (!mongoose.isValidObjectId(bookID)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'bookID is not a valid ID' });
    }

    if (!(await BookModel.findById(bookID))) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Book with this ID not found' });
    }

    const bookToBeIssued = await BookModel.findById(bookID);

    if (!bookToBeIssued.Book_Status) {
      return res
        .status(200)
        .json({ status: 'fail', message: 'Book not available' });
    }

    // NAME VALIDATION STARTS
    if (!('name' in req.body) || !name) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a name' });
    }

    if (!isAlpha(name, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Name can only be alphabetic' });
    }
    // NAME VALIDATION ENDS

    // EMAIl VAVLIDATION STARTS
    if (!('email' in req.body) || !email) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a email' });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please enter a valid email' });
    }
    // EMAIl VAVLIDATION ENDS

    // remarks VALIDATION STARTS
    if (!('remarks' in req.body) || !remarks) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a remarks' });
    }

    if (!isAlpha(remarks, 'en-US', { ignore: ' ' })) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'remarks can only be alphabetic' });
    }
    // remarks VALIDATION ENDS

    // returnDate VALIDATION STARTS
    if (!('returnDate' in req.body) || !returnDate) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please provide a returnDate' });
    }

    if (!isDate(returnDate)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'returnDate can only be alphabetic' });
    }
    // remarks VALIDATION ENDS

    bookToBeIssued.IssuedTo = {
      name,
      email,
      remarks,
      returnDate,
      issuedAt: Date.now(),
    };

    await bookToBeIssued.save();

    bookToBeIssued.Book_Status = false;

    await bookToBeIssued.save();

    return res.status(200).json({
      status: 'success',
      message: 'book issued successfully',
      bookToBeIssued,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.returnBook = async (req, res) => {
  try {
    let { bookID } = req.params;

    bookID = bookID ? bookID.trim() : '';

    if (!mongoose.isValidObjectId(bookID)) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'bookID is not a valid ID' });
    }

    if (!(await BookModel.findById(bookID))) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Book with this ID not found' });
    }

    const bookToBeReturned = await BookModel.findById(bookID);

    if (bookToBeReturned.Book_Status) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Book was not issued to anyone' });
    }

    bookToBeReturned.IssuedTo = null;
    bookToBeReturned.Book_Status = true;

    await bookToBeReturned.save();

    return res
      .status(200)
      .json({ status: 'success', message: 'Book returned successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.getIssuedBooks = async (req, res) => {
  try {
    // eslint-disable-next-line radix
    const page = parseInt(req.query.page) || 1;
    // eslint-disable-next-line radix
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBooks = await BookModel.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    const issuedBooks = await BookModel.find({ Book_Status: false })
      .skip(skip)
      .limit(limit)
      .sort({ 'IssuedTo.issuedAt': -1 });
    return res.status(200).json({
      status: 'success',
      message: 'Issued Books Fetched Successfully',
      issuedBooks,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
