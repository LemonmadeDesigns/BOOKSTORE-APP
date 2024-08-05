const express = require('express');
const router = express.Router();

// Import our Book and Magazine models
// const Book = require('../models/bookModel');
// const Magazine = require('../models/magazineModel');

// Import the Book model
const { Book } = require('../routes/bookRoutes');

// Import the Magazine model
const { Magazine } = require('../routes/magazineRoutes');

// When someone visits our homepage
router.get('/', async (req, res) => {
  try {
    // Fetch all books
    const bookAggregation = await Book.aggregate([
      {
        // Group books by author
        $group: {
          // Use the author field as the group identifier
          _id: "$author",
          // Collect an array of objects containing the title, isbn, and publishDate of each book
          books: {
            $push: {
              title: "$title",
              isbn: "$isbn",
              publishDate: "$publishDate"
            }
          },
          // Count the number of books for each author
          bookCount: { $sum: 1 }
        }
      },
      // Sort the grouped results in descending order based on the book count
      { $sort: { bookCount: -1 } }
    ]);

    // Fetch all magazines
    const magazineAggregation = await Magazine.aggregate([
      {
        // Group magazines by author
        $group: {
          // Use the author field as the group identifier
          _id: "$author",
          // Collect an array of objects containing the title, issue, and publishDate of each magazine
          magazines: {
            $push: {
              title: "$title",
              issue: "$issue",
              publishDate: "$publishDate"
            }
          },
          // Count the number of magazines for each author
          magazineCount: { $sum: 1 }
        }
      },
      // Sort the grouped results in descending order based on the magazine count
      { $sort: { magazineCount: -1 } }
    ]);

    // Combine book and magazine data
    const combinedData = bookAggregation.map(authorData => {
      // Find the magazine data for this author
      const magazineData = magazineAggregation.find(m => m._id === authorData._id);

      // Return combined data
      return {
        author: authorData._id,
        bookCount: authorData.bookCount,
        books: authorData.books,
        magazineCount: magazineData ? magazineData.magazineCount : 0,
        magazines: magazineData ? magazineData.magazines : []
      };
    });

    // Add authors who only have magazines
    magazineAggregation.forEach(magazineData => {
      if (!combinedData.find(d => d.author === magazineData._id)) {
        combinedData.push({
          // Add author data
          author: magazineData._id,
          bookCount: 0,
          books: [],
          // Add magazine data
          magazineCount: magazineData.magazineCount,
          magazines: magazineData.magazines
        });
      }
    });

    // Render the aggregate view
    res.render('aggregate', { aggregatedData: combinedData });
  } catch (error) {
    // Log any errors and render the error view
    console.error('Error fetching aggregated data:', error);
    res.status(500).render('error', { error: 'Unable to fetch aggregated data' });
  }
});

module.exports = router;
  