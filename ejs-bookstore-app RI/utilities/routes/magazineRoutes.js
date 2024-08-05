const express = require('express');
const router = express.Router();

// Import our Magazine model
// const Magazine = require('../models/magazineModel');

// // Imports Mongoose: A library that helps us interact with a MongoDB database.
const mongoose = require('mongoose');

// Defines a schema for magazines with fields: title, author, isbn, publishDate, and issue.
const magazineSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  publishDate: Date,
  issue: String // Additional field for magazines
});

// Creates and exports a Mongoose model named "Magazine" based on the defined schema.
const Magazine = mongoose.model('Magazine', magazineSchema);


// When someone visits our homepage
router.get('/', async (req, res) => {

  // Fetch all magazines
  const magazines = await Magazine.find();

  // Show the homepage with our magazines
  res.render('magazines/index', { magazines });
});


// When someone wants to add a new magazine
router.post('/add', async (req, res) => {

  // Create a new magazine
  const magazine = new Magazine(req.body);

  // Save it
  await magazine.save();

  // Go back to homepage
  res.redirect('/magazines');
});


// When someone wants to edit a magazine
router.get('/edit/:id', async (req, res) => {

  // Find the magazine
  const magazine = await Magazine.findById(req.params.id);

  // Show the edit page with the magazine
  res.render('magazines/edit', { magazine });
});


// When someone submits an edited magazine
router.post('/edit/:id', async (req, res) => {

  // Update the magazine
  await Magazine.findByIdAndUpdate(req.params.id, req.body);

  // Go back to homepage
  res.redirect('/magazines');
});


// When someone wants to delete a magazine
router.post('/delete/:id', async (req, res) => {

  // Find the magazine and delete it
  await Magazine.findByIdAndDelete(req.params.id);

  // Go back to homepage
  res.redirect('/magazines');
});


// When someone wants to see grouped magazine data
router.get("/aggregate", async (req, res) => {

  // Aggregate our magazine data
  const result = await Magazine.aggregate([
    {
      // Group by author
      $group: {
        
        // Group by author
        _id: "$author",

        // Count the number of magazines by each author 
        magazineCount: { $sum: 1 },

        // Push the title and isbn of each magazine into an array
        magazines: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
    // Sort the results by magazine count in descending order
    { $sort: { magazineCount: -1 } },
  ]);

  // Show the aggregate page with our grouped data
  res.render("aggregate", { aggregatedData: result }); 
});

// // Share our routes with the main app
// module.exports = router; 

// Export the model along with the router
module.exports = { router, Magazine };