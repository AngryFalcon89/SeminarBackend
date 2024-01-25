const BookModel = require('../models/bookModel');

module.exports.createBook = async (req, res) => {
  try {
    const {
      ID,
      Accession_Number,
      MAL_ACC_Number,
      Author,
      Title,
      Book_Status,
      Publisher,
      Publishing_Year,
      Author1,
      Author2,
      Author3,
    } = req.body;

    const newBook = new BookModel({
      ID,
      Accession_Number,
      MAL_ACC_Number,
      Author,
      Title,
      Book_Status,
      Publishing_Year,
      Publisher,
      Author1,
      Author2,
      Author3,
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
    // const searchQuery = req.query.search_query;

    // if (searchQuery) {
    //   const books = await BookModel.find({
    //     $or: [
    //       { Title: searchQuery },
    //       { Author: searchQuery },
    //       { Publisher: searchQuery },
    //     ],
    //   });

    //   return res.status(200).json({
    //     status: 'success',
    //     message: 'Books according to search query fetched',
    //     books,
    //   });
    // }

    const searchQuery = req.query.search_query;
    const queryObject = { $or: [] };

    if (searchQuery) {
      queryObject.$or.push({ Author: { $regex: searchQuery, $options: 'i' } });
      queryObject.$or.push({
        Publisher: { $regex: searchQuery, $options: 'i' },
      });
      queryObject.$or.push({ Title: { $regex: searchQuery, $options: 'i' } });
    }

    const books = await BookModel.find(queryObject);
    return res.status(200).json({
      status: 'success',
      message: 'Books fetched successfully',
      books,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports.deleteBook = async (req, res) => {
  try {
    const { bookID } = req.params;

    const bookToBeDeleted = await BookModel.findById(bookID);

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
    const { bookID } = req.params;
    const updatedBook = req.body;

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
    const { bookID } = req.params;

    const bookToBeIssued = await BookModel.findById(bookID);

    if (!bookToBeIssued.Book_Status) {
      return res
        .status(200)
        .json({ status: 'fail', message: 'Book not available' });
    }

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
    const { bookID } = req.params;

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
    const issuedBooks = await BookModel.find({ Book_Status: false });
    return res.status(200).json({
      status: 'success',
      message: 'Issued Books Fetched Successfully',
      issuedBooks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
