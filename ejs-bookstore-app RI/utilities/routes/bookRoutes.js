const express = require("express");
const router = express.Router();

// Import our Book model
// const Book = require("../models/bookModel"); 

// Imports Mongoose: A library that helps us interact with a MongoDB database.
const mongoose = require('mongoose');

// Defines a schema for books with fields: title, author, isbn, and publishDate.
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  publishDate: Date
});

const Book = mongoose.model('Book', bookSchema);


// When someone visits our homepage
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    
    // Changed from 'index' to 'books/index'
    res.render("books/index", { books }); 
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).render("error", { error: "Unable to fetch books" });
  }
});


// When someone wants to add a new book
router.post("/add", async (req, res) => {
  
  // Create a new book
  const book = new Book(req.body); 
  
  // Save it
  await book.save(); 
  
  // Go back to homepage
  res.redirect("/books"); 
});


// When someone wants to edit a book
router.get("/edit/:id", async (req, res) => {
  
  // Find the book
  const book = await Book.findById(req.params.id); 
  
  // Show the edit page with the book
  res.render("books/edit", { book }); 
});


// When someone submits an edited book
router.post("/edit/:id", async (req, res) => {
  
  // Update the book
  await Book.findByIdAndUpdate(req.params.id, req.body); 
  
  // Go back to homepage
  res.redirect("/books"); 
});


// When someone wants to delete a book
router.post("/delete/:id", async (req, res) => {
  
  // Find the book and delete it
  await Book.findByIdAndDelete(req.params.id); 
  
  // Go back to homepage
  res.redirect("/books"); 
});


// When someone wants to see grouped book data
router.get("/aggregate", async (req, res) => {

  // Declares a constant result to store the outcome of the aggregation operation.
  const result = await Book.aggregate([
    {
      // Indicates that this stage groups documents.
      $group: {
        // Groups by the author field.
        _id: "$author",
        
        // Counts the number of books by each author.
        bookCount: { $sum: 1 },

        // Collect an array of objects containing the title and isbn of each magazine
        // Pushes the title and isbn of each book into an array.
        books: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
      // Sorts the groups in descending order based on the bookCount field. The -1 indicates descending order, so authors with more books appear first.
    { $sort: { bookCount: -1 } },
  ]);
  
  // Show the aggregate page with our grouped data
  res.render("aggregate", { aggregatedData: result }); 
});

// // Share our routes with the main app
// module.exports = router; 

// Export the model along with the router
module.exports = { router, Book };
