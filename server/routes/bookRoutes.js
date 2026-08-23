import express from "express";
import multer from "multer";
import allBooks from "../models/bookModel.js";
import studentModel from "../models/studentModel.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =====================================================
// GET ALL BOOKS
// =====================================================
router.get("/allbooks", async (req, res) => {
  try {
    const books = await allBooks.find({});
    return res.status(200).json({
      success: true,
      message: "Books fetched successfully.",
      data: books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// GET SINGLE BOOK (WITH PAGES)
// =====================================================
router.get("/singlebook/:id", async (req, res) => {
  try {
    const book = await allBooks.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book fetched successfully.",
      data: {
        _id: book._id,
        name: book.name,
        author: book.author,
        quantity: book.quantity,
        description: book.description,
        pageCount: book.pages?.length || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// GET SINGLE BOOK PAGE IMAGE
// =====================================================
router.get("/bookpage/:bookId/:index", async (req, res) => {
  try {
    const book = await allBooks.findById(req.params.bookId);

    if (!book || !book.pages || book.pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book pages not found.",
      });
    }

    const index = Number(req.params.index);

    if (index < 0 || index >= book.pages.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid page index.",
      });
    }

    const page = book.pages[index];

    if (!page || !page.data) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }

    res.set("Content-Type", page.contentType || "image/jpeg");
    res.send(page.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// GET SINGLE BOOK PHOTO
// =====================================================
router.get("/bookphoto/:id", async (req, res) => {
  try {
    const book = await allBooks.findById(req.params.id);

    if (!book || !book.photo || !book.photo.data) {
      return res.status(404).json({
        success: false,
        message: "Book photo not found.",
      });
    }

    res.set("Content-Type", book.photo.contentType);
    res.send(book.photo.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// ADD BOOK
// =====================================================
router.post(
  "/allbooks",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "pages", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      const { name, author, quantity, description } = req.body;

      if (!name || !author || !quantity || !description) {
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      if (!req.files || !req.files.photo || !req.files.photo[0]) {
        return res.status(400).json({
          success: false,
          message: "Book image is required.",
        });
      }

      // Check duplicate book
      const existingBook = await allBooks.findOne({ name: name.trim() });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: "Book with this name already exists.",
        });
      }

      // Build pages array from uploaded page images
      const pages = (req.files.pages || []).map((file) => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));

      const book = new allBooks({
        name: name.trim(),
        author: author.trim(),
        quantity: Number(quantity),
        description: description.trim(),
        photo: {
          data: req.files.photo[0].buffer,
          contentType: req.files.photo[0].mimetype,
        },
        pages,
      });

      await book.save();

      res.status(201).json({
        success: true,
        message: "Book added successfully.",
        data: book,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// =====================================================
// DELETE BOOK
// =====================================================
router.delete("/deletebook", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Book name is required.",
      });
    }

    const book = await allBooks.findOne({ name });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    await allBooks.deleteOne({ name });

    res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// ISSUE BOOK(S) TO STUDENT
// Supports single book (bookName) or batch (books array).
// Enforces a max of 30 books issued per student.
// =====================================================
const MAX_ISSUE_LIMIT = 30;

router.post("/issuebook", async (req, res) => {
  try {
    const { studentEmail, bookName, books, dueDate } = req.body;

    // Normalize to an array of book names
    let bookNames = [];
    if (Array.isArray(books) && books.length > 0) {
      bookNames = books.map((b) => String(b).trim()).filter(Boolean);
    } else if (bookName) {
      bookNames = [String(bookName).trim()];
    }

    if (!studentEmail || bookNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student email and at least one book name are required.",
      });
    }

    const student = await studentModel.findOne({
      email: studentEmail.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Enforce max 30 books per student
    const currentlyIssued = student.issue?.length || 0;
    const remaining = MAX_ISSUE_LIMIT - currentlyIssued;

    if (remaining <= 0) {
      return res.status(400).json({
        success: false,
        message: `Student already has ${currentlyIssued} book(s) issued. Maximum limit is ${MAX_ISSUE_LIMIT}.`,
      });
    }

    if (bookNames.length > remaining) {
      return res.status(400).json({
        success: false,
        message: `Cannot issue ${bookNames.length} book(s). Student can take only ${remaining} more book(s) (max ${MAX_ISSUE_LIMIT}).`,
      });
    }

    // Validate all books exist
    const uniqueNames = [...new Set(bookNames)];
    const booksFound = await allBooks.find({ name: { $in: uniqueNames } });

    if (booksFound.length !== uniqueNames.length) {
      return res.status(404).json({
        success: false,
        message: "One or more books were not found.",
      });
    }

    // Check for already-issued and out-of-stock books
    const alreadyIssued = [];
    const outOfStock = [];
    const validBooks = [];

    for (const name of uniqueNames) {
      const book = booksFound.find(
        (b) => b.name.toLowerCase() === name.toLowerCase()
      );

      const isAlreadyIssued = student.issue.some(
        (item) => item.bookName?.toLowerCase() === name.toLowerCase()
      );

      if (isAlreadyIssued) {
        alreadyIssued.push(book.name);
        continue;
      }

      if (book.quantity <= 0) {
        outOfStock.push(book.name);
        continue;
      }

      validBooks.push(book);
    }

    if (alreadyIssued.length > 0 || outOfStock.length > 0) {
      let message = "Issue failed.";
      if (alreadyIssued.length > 0) {
        message += ` Already issued to student: ${alreadyIssued.join(", ")}.`;
      }
      if (outOfStock.length > 0) {
        message += ` Out of stock: ${outOfStock.join(", ")}.`;
      }
      return res.status(400).json({ success: false, message });
    }

    if (validBooks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid books to issue.",
      });
    }

    const issueDate = new Date().toISOString().split("T")[0];
    const computedDueDate =
      dueDate ||
      new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Decrement quantity for each book
    await Promise.all(
      validBooks.map((book) =>
        allBooks.updateOne({ _id: book._id }, { $inc: { quantity: -1 } })
      )
    );

    // Add all issue records to the student
    const issueRecords = validBooks.map((book) => ({
      bookId: book._id,
      bookName: book.name,
      issueDate,
      dueDate: computedDueDate,
      status: "Issued",
    }));

    await studentModel.updateOne(
      { _id: student._id },
      { $push: { issue: { $each: issueRecords } } }
    );

    return res.status(200).json({
      success: true,
      message: `${issueRecords.length} book(s) issued successfully.`,
      data: {
        books: issueRecords.map((r) => r.bookName),
        issueDate,
        dueDate: computedDueDate,
      },
    });
  } catch (err) {
    console.error("Issue Book Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================================================
// SUBMIT BOOK FROM STUDENT
// =====================================================
router.post("/submitbook", async (req, res) => {
  try {
    const { studentEmail, bookName } = req.body;

    if (!studentEmail || !bookName) {
      return res.status(400).json({
        success: false,
        message: "Student email and book name are required.",
      });
    }

    const student = await studentModel.findOne({
      email: studentEmail.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Find the issued book record
    const issuedIndex = student.issue.findIndex(
      (item) => item.bookName?.toLowerCase() === bookName.trim().toLowerCase()
    );

    if (issuedIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "This book is not issued to the student.",
      });
    }

    const issuedRecord = student.issue[issuedIndex];

    const submitDate = new Date().toISOString().split("T")[0];

    // Remove from issue array
    await studentModel.updateOne(
      { _id: student._id },
      { $pull: { issue: { bookName: issuedRecord.bookName } } }
    );

    // Add to submit array
    await studentModel.updateOne(
      { _id: student._id },
      {
        $push: {
          submit: {
            bookId: issuedRecord.bookId,
            bookName: issuedRecord.bookName,
            issueDate: issuedRecord.issueDate,
            dueDate: issuedRecord.dueDate,
            submitDate,
            status: "Submitted",
          },
        },
      }
    );

    // Increment book quantity back
    const book = await allBooks.findOne({ name: bookName.trim() });
    if (book) {
      await allBooks.updateOne({ _id: book._id }, { $inc: { quantity: 1 } });
    }

    return res.status(200).json({
      success: true,
      message: "Book submitted successfully.",
      data: { bookName, submitDate },
    });
  } catch (err) {
    console.error("Submit Book Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

