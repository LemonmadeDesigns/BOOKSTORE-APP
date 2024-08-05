const express = require("express");
const mongoose = require("mongoose");

// Import the path module
const path = require("path");

// ROUTES
const bookRoutes = require("./utilities/routes/bookRoutes").router;
const magazineRoutes = require("./utilities/routes/magazineRoutes").router;
const aggregateRoutes = require("./utilities/routes/aggregateRoutes");

// MODELS
const Book = require('./utilities/models/bookModel');
const Magazine = require('./utilities/models/magazineModel');

const app = express();

// CONNECT TO OUR BOOK DATABASE
mongoose
  .connect("mongodb://127.0.0.1:27017/bookstore-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  });

// MIDDLEWAR TO SERVE STATIC FILE
app.use(express.static(path.join(__dirname, "public")));

// TELL OUR APP TO USE EJS FOR MAKING PAGES
app.set("view engine", "ejs");

// THIS HELPS OUR APP UNDERSTAND FORM DATA
app.use(express.urlencoded({ extended: true }));

// USE OUR BOOK ROUTES
app.use("/books", bookRoutes);

// USE OUR MAGAZINE ROUTES
app.use("/magazines", magazineRoutes);

// USE OUR AGGREGATE ROUTES
app.use("/aggregate", aggregateRoutes);

// OUR HOME ROUTE
app.get("/", async (req, res) => {
  console.log("Root route hit");
  try {

    // SINCE OUR MODELS ARE WITHIN OUR ROUTES FILES, ENSURE TO CALL THE MODELS FROM WITHIN THE ROUTES.

    // Retrieve Book model if defined in routes
    const { Book } = require('./utilities/routes/bookRoutes');
    
    // Retrieve Magazine model if defined in routes
    const { Magazine } = require('./utilities/routes/magazineRoutes');

    // Fetch all books and magazines
    const books = await Book.find();
    const magazines = await Magazine.find();
    console.log("Data fetched:", { bookCount: books.length, magazineCount: magazines.length });

    // Render the home page with the data we fetched
    res.render("home", { books, magazines });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).render("error", { error: "Unable to fetch data" });
  }
});

// ASSIGN PORT
const PORT = process.env.PORT || 3003;

// START OUR APP ON PORT 3003
app.listen(PORT, () => console.log(`Our app is running on http://127.0.0.1:${PORT}`));
