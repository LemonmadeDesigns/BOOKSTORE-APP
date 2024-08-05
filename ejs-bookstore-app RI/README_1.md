# Lesson Plan: Routes using EJS

This LP provides a comprehensive lesson plan that covers the creation of schemas, routes, and their integration into an Express application, with interactive exercises to reinforce the concepts.

## Overview

This lesson plan will guide you through creating schemas for books and magazines, setting up routes for CRUD operations and aggregation, and integrating these routes into an Express application using EJS for rendering views.

### Lesson Objectives

1. Create schemas for books and magazines.
2. Create route pages for books, magazines, and aggregate data.
3. Add routes and schemas to the `app.js` file.
4. Understand the purpose and function of each part of the code.
5. Practice interactive exercises to reinforce the concepts.

Here are the three commands you need to start MongoDB, connect to the MongoDB shell, and then start your Express app:

1. **Start MongoDB**:

    ```bash
    mongod
    ```

    - This command starts the MongoDB server. Make sure you have MongoDB installed and your data directory is properly set up.

2. **Connect to MongoDB shell**:

    ```bash
    mongo
    ```

    - This command opens the MongoDB shell, allowing you to interact with your MongoDB instance.

3. **Start your Express app**:

    ```bash
    node app.js
    ```

    - This command starts your Express application. Make sure you are in the directory where your `app.js` file is located.

---

### How to start MongoDB (...if issues persist)

1. First, start MongoDB using Homebrew:

    ```bash
    brew services start mongodb-community
    ```

    Create the data directory first:

    ```bash
      mkdir -p ~/data/db
    ```

    Then give the path of your data, and then try:

    ```bash
    mongod --dbpath ~/data/db
    ```

1. After running one of these commands, check if MongoDB is running:

      ```bash
      ps aux | grep mongod
      ```

    You should see a process running for MongoDB.

    If not, Try connecting to MongoDB again:

      ```bash
      mongosh
      ```

      If this connects successfully, MongoDB is now running.

1. Run your application:

    ```bash
    node app.js
    ```

---

## Step 1: Create `Utilities` Directory

Let's create a `Utilities` directory. Then inside of the `Utilities` directory, let's create directories for `Models` and `Routes`

```bash
mkdir utilities && 
mkdir utilities/models && 
mkdir utilities/routes
```

## Step 2: Create Route for Books, Magazines, and Aggregate Data

### Route for Books `routes/bookRoutes.js`

Let's add Routes for Magazines.

```javascript
const express = require("express");
const router = express.Router();

// When someone visits our homepage
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.render("books/index", { books }); 
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).render("error", { error: "Unable to fetch books" });
  }
});

// Add a new book
router.post("/add", async (req, res) => {
  const book = new Book(req.body); 
  await book.save(); 
  res.redirect("/books"); 
});

// Edit a book
router.get("/edit/:id", async (req, res) => {
  const book = await Book.findById(req.params.id); 
  res.render("books/edit", { book }); 
});

// Submit edited book
router.post("/edit/:id", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body); 
  res.redirect("/books"); 
});

// Delete a book
router.post("/delete/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id); 
  res.redirect("/books"); 
});

// Aggregate book data
router.get("/aggregate", async (req, res) => {
  const result = await Book.aggregate([
    {
      $group: {
        _id: "$author",
        bookCount: { $sum: 1 },
        books: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
    { $sort: { bookCount: -1 } },
  ]);
  res.render("aggregate", { aggregatedData: result }); 
});

// Share our routes with the main app
module.exports = router; 
```

### Route for Magazines `routes/magazineRoutes.js`

Let's add Routes for Magazines.

```javascript
const express = require('express');
const router = express.Router();

// When someone visits our homepage
router.get('/', async (req, res) => {
  const magazines = await Magazine.find();
  res.render('magazines/index', { magazines });
});

// Add a new magazine
router.post('/add', async (req, res) => {
  const magazine = new Magazine(req.body);
  await magazine.save();
  res.redirect('/magazines');
});

// Edit a magazine
router.get('/edit/:id', async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  res.render('magazines/edit', { magazine });
});

// Submit edited magazine
router.post('/edit/:id', async (req, res) => {
  await Magazine.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/magazines');
});

// Delete a magazine
router.post('/delete/:id', async (req, res) => {
  await Magazine.findByIdAndDelete(req.params.id);
  res.redirect('/magazines');
});

// Aggregate magazine data
// Define a route for GET requests to "/aggregate"
router.get("/aggregate", async (req, res) => {
  // Perform an aggregation operation on the Magazine collection
  const result = await Magazine.aggregate([
    {
      // Group the documents by the author field
      $group: {
        // Use the author field as the group identifier
        _id: "$author",
        // Count the number of magazines for each author
        magazineCount: { $sum: 1 },
        // Collect an array of objects containing the title and isbn of each magazine
        magazines: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
    // Sort the grouped results in descending order based on the magazine count
    { $sort: { magazineCount: -1 } },
  ]);

  // Render the "aggregate" view, passing the aggregated data as a variable
  res.render("aggregate", { aggregatedData: result });
});


// Share our routes with the main app
module.exports = router; 
```

### Route for Aggregate `routes/aggregateRoute.js`

In the `aggregateRoute.js` file, we will first aggregate the books and magazines by author and sort them by the count of books and magazines.

Then, we will combine the book and magazine data by author.

Finally, we will render the aggregated data in a view.

```javascript
const express = require('express');
const router = express.Router();

// IMPORT THE BOOK MODEL
const { Book } = require('../routes/bookRoutes');

// IMPORT THE MAGAZINE MODEL
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
      const magazineData = magazineAggregation.find(magazineData => magazineData._id === authorData._id);

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

// Share our routes with the main app
module.exports = router;
```

## Step 3: Create Schemas for Books and Magazines

For now, let's create the schemas for the `Books` and `Magazines` inside of their Routes files. We will learn how to separate them into their own file later.

### Book Schema `routes/bookRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
  
  ...

// Imports Mongoose: A library that helps us interact with a MongoDB database.
const mongoose = require('mongoose');

// Defines a schema for books with fields: title, author, isbn, and publishDate.
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  publishDate: Date
});

// Creates and exports a Mongoose model named "Book" based on the defined schema.
module.exports = mongoose.model('Book', bookSchema);

  ...

router.get("/", async (req, res) => {
  
```

### Magazine Schema `models/magazineModels.js`

```javascript
const express = require("express");
const router = express.Router();

  ...

// Imports Mongoose: A library that helps us interact with a MongoDB database.
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
module.exports = mongoose.model('Magazine', magazineSchema);

  ...

router.get("/", async (req, res) => {
```

## Step 4: Add Routes and Schemas to `app.js`

Here, we are deconstructing the `Book` and `Magazine` models. `Deconstructing` means extracting specific properties from an object and assigning them to variables.

This is done using a `syntax` called `destructuring assignment`, which is a convenient way to extract values from objects or arrays.

```javascript
const express = require("express");
const mongoose = require("mongoose");

// Import the path module
const path = require("path");

// ROUTES
const bookRoutes = require("./utilities/routes/bookRoutes").router;
const magazineRoutes = require("./utilities/routes/magazineRoutes").router;
const aggregateRoutes = require("./utilities/routes/aggregateRoutes");

const app = express();

// CONNECT TO OUR BOOK DATABASE
mongoose
  .connect("mongodb://127.0.0.1:27017/bookstore-app")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  });

// MIDDLEWARE TO SERVE STATIC FILE
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
const PORT = process.env.PORT || 3002;

// START OUR APP ON PORT 3002
app.listen(PORT, () => console.log(`Our app is running on http://127.0.0.1:${PORT}`));
```

## Interactive Exercises

### Exercise 1: Create a New Book

1. Start your server: `node app.js`
2. Navigate to `http://localhost:3003/books`.
3. Add a new book by clicking on "Add Book" and filling in the form.

### Exercise 2: Edit an Existing Magazine

1. Navigate to `http://localhost:3003/magazines`.
2. Click on the "Edit" button next to any magazine.
3. Update the magazine details and save.

### Exercise 3: View Aggregated Data

1. Navigate to `http://localhost:3003/aggregate`.
2. Observe the aggregated data for books and magazines by author.

### Explanation of Routes

- **Books Route**: Handles all operations related to books, including adding, editing, deleting, and aggregating book data.
- **Magazines Route**: Handles all operations related to magazines, including adding, editing, deleting, and aggregating magazine data.

- **Aggregate Route**: Combines and displays aggregated data for both books and magazines by author.

### Exercise 4: Separating Schemas from Routes

In this exercise, you will separate the schemas from the `bookRoutes.js` and `magazineRoutes.js` files and place them into their own model files. You will also update the `app.js` file to correctly use the separated models and routes.

### Step 1: Create Model Files

Create two new files in your terminal: `models/bookModel.js` and `models/magazineModel.js`.

  ```bash
  touch models/bookModel.js models/magazineModel.js
  ```

#### `models/bookModel.js`

Type the following content in your `models/bookModel.js`:

```javascript
// REQUIRE THE MONGOOSE DEPENDCIES
const mongoose = require('mongoose');

// Defines a schema for books with fields: title, author, isbn, and publishDate.
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  publishDate: Date
});

// Creates and exports a Mongoose model named "Book" based on the defined schema.
module.exports = mongoose.model('Book', bookSchema);
```

#### `models/magazineModel.js`

Type the following content in your `models/magazineModel.js`:

```javascript
// REQUIRE THE MONGOOSE DEPENDCIES
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
module.exports = mongoose.model('Magazine', magazineSchema);
```

### Step 2: Update Route Files

Modify `bookRoutes.js` and `magazineRoutes.js` to import the models from the new model files.

#### `utilities/routes/bookRoutes.js`

```javascript
const express = require("express");
const router = express.Router();

// IMPORT THE BOOK MODEL
const Book = require('../../models/bookModel'); 

// When someone visits our homepage
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.render("books/index", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).render("error", { error: "Unable to fetch books" });
  }
});

// When someone wants to add a new book
router.post("/add", async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.redirect("/books");
});

// When someone wants to edit a book
router.get("/edit/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render("books/edit", { book });
});

// When someone submits an edited book
router.post("/edit/:id", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/books");
});

// When someone wants to delete a book
router.post("/delete/:id", async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/books");
});

// When someone wants to see grouped book data
router.get("/aggregate", async (req, res) => {
  const result = await Book.aggregate([
    {
      $group: {
        _id: "$author",
        bookCount: { $sum: 1 },
        books: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
    { $sort: { bookCount: -1 } },
  ]);

  res.render("aggregate", { aggregatedData: result });
});

module.exports = router; // Export only the router
```

#### `utilities/routes/magazineRoutes.js`

```javascript
const express = require('express');
const router = express.Router();

// IMPORT THE MAGAZINE MODEL
const Magazine = require('../../models/magazineModel'); 

// When someone visits our homepage
router.get('/', async (req, res) => {
  const magazines = await Magazine.find();
  res.render('magazines/index', { magazines });
});

// When someone wants to add a new magazine
router.post('/add', async (req, res) => {
  const magazine = new Magazine(req.body);
  await magazine.save();
  res.redirect('/magazines');
});

// When someone wants to edit a magazine
router.get('/edit/:id', async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  res.render('magazines/edit', { magazine });
});

// When someone submits an edited magazine
router.post('/edit/:id', async (req, res) => {
  await Magazine.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/magazines');
});

// When someone wants to delete a magazine
router.post('/delete/:id', async (req, res) => {
  await Magazine.findByIdAndDelete(req.params.id);
  res.redirect('/magazines');
});

// When someone wants to see grouped magazine data
router.get("/aggregate", async (req, res) => {
  const result = await Magazine.aggregate([
    {
      $group: {
        _id: "$author",
        magazineCount: { $sum: 1 },
        magazines: { $push: { title: "$title", isbn: "$isbn" } },
      },
    },
    { $sort: { magazineCount: -1 } },
  ]);

  res.render("aggregate", { aggregatedData: result });
});

module.exports = router; // Export only the router
```

### Step 3: Update `app.js`

Update `app.js` to use the separated models and routes.

#### `app.js`

```javascript
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// ROUTES
const bookRoutes = require('./utilities/routes/bookRoutes');
const magazineRoutes = require('./utilities/routes/magazineRoutes');
const aggregateRoutes = require('./utilities/routes/aggregateRoutes');

const app = express();

// CONNECT TO OUR BOOK DATABASE
mongoose.connect('mongodb://127.0.0.1:27017/bookstore-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Could not connect to MongoDB:', err);
  process.exit(1);
});

// MIDDLEWARE TO SERVE STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// TELL OUR APP TO USE EJS FOR MAKING PAGES
app.set('view engine', 'ejs');

// THIS HELPS OUR APP UNDERSTAND FORM DATA
app.use(express.urlencoded({ extended: true }));

// USE OUR BOOK ROUTES
app.use('/books', bookRoutes);

// USE OUR MAGAZINE ROUTES
app.use('/magazines', magazineRoutes);

// USE OUR AGGREGATE ROUTES
app.use('/aggregate', aggregateRoutes);

// OUR HOME ROUTE
app.get('/', async (req, res) => {
  console.log('Root route hit');
  try {
    // Fetch all books and magazines
    const books = await mongoose.model('Book').find();
    const magazines = await mongoose.model('Magazine').find();
    console.log('Data fetched:', { bookCount: books.length, magazineCount: magazines.length });

    // Render the home page with the data we fetched
    res.render('home', { books, magazines });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).render('error', { error: 'Unable to fetch data' });
  }
});

// ASSIGN PORT
const PORT = process.env.PORT || 3002;

// START OUR APP ON PORT 3002
app.listen(PORT, () => console.log(`Our app is running on http://127.0.0.1:${PORT}`));
```

### Summary of Steps

1. **Create model files**: `models/bookModel.js` and `models/magazineModel.js`.
2. **Update route files**: Import the models from the new model files in `bookRoutes.js` and `magazineRoutes.js`.
3. **Update `app.js`**: Ensure it correctly uses the separated models and routes.

## Conclusion

This lesson plan guides students through creating and understanding routes using EJS and Express.js. By following the steps and completing the interactive exercises, students will gain a solid understanding of how to set up and use routes in a web application. With these steps, students will also learn how to separate the schemas from the routes and ensure everything works seamlessly.

---

We're using separate collections for books and magazines, so use these commands to insert the same author with Books and Magazines:

```bash
// Insert books
db.books.insertMany([
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "978-0747532743",
    publishDate: new Date("1997-06-26")
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    isbn: "978-0747538486",
    publishDate: new Date("1998-07-02")
  }
]);
```

Then add this data to your database.

```bash
// Insert magazines
db.magazines.insertMany([
  {
    title: "The Rowling Magazine",
    author: "J.K. Rowling",
    isbn: "1234-5678",
    issue: "Summer 2023",
    publishDate: new Date("2023-06-01")
  },
  {
    title: "Wizarding World Monthly",
    author: "J.K. Rowling",
    isbn: "8765-4321",
    issue: "September 2023",
    publishDate: new Date("2023-09-01")
  }
]);
```

Remove `async` and `await` to see the bug it creates.

This idea was AUTHORED by:
  
> Kaitlyn Van Gorkom
