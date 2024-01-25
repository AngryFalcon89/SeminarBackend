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
    const books = await BookModel.find();
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
