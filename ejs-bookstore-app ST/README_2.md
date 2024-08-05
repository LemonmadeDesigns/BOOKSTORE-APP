# Separating Routes into Controllers

In this exercise, you will separate the routes from the `bookRoutes.js` and `magazineRoutes.js` files and place them into their own controller files. You will also update the `app.js` file to correctly use the separated `controllers` and routes.

This lesson plan guides you through creating and understanding routes using `EJS` and `Express.js`. By following the steps and completing the interactive exercises, you will gain a solid understanding of how to set up and use `routes` in a web application. With these steps, you will also learn how to separate the `routes` from the `controllers` and ensure everything works seamlessly.

## Step 1: Create Controller Files

Create a new folder called `controllers` in the `utilities` directory. Inside the `controllers` create two new files: `bookController.js` and `magazineController.js`.

  ```bash
  mkdir controllers

  touch controllers/bookControllers.js 
  touch controllers/magazineControllers.js
  ```

### `controllers/bookController.js`

Type in the following code in the `bookController.js` file:

```javascript
const Book = require('../models/bookModel'); // Import the Book model

// Controller function to handle fetching all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.render("books/index", { books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).render("error", { error: "Unable to fetch books" });
  }
};

// Controller function to handle adding a new book
const addNewBook = async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.redirect("/books");
};

// Controller function to handle editing a book
const editBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render("books/edit", { book });
};

// Controller function to handle updating a book
const updateBook = async (req, res) => {
  await Book.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/books");
};

// Controller function to handle deleting a book
const deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/books");
};

// Controller function to handle aggregating book data
const aggregateBooks = async (req, res) => {
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
};

// Export the controller functions
module.exports = {
  getAllBooks,
  addNewBook,
  editBook,
  updateBook,
  deleteBook,
  aggregateBooks
};
```

### `controllers/magazineController.js`

Type in the following code in the `magazineController.js` file:

```javascript
const Magazine = require('../models/magazineModel'); // Import the Magazine model

// Controller function to handle fetching all magazines
const getAllMagazines = async (req, res) => {
  const magazines = await Magazine.find();
  res.render('magazines/index', { magazines });
};

// Controller function to handle adding a new magazine
const addNewMagazine = async (req, res) => {
  const magazine = new Magazine(req.body);
  await magazine.save();
  res.redirect('/magazines');
};

// Controller function to handle editing a magazine
const editMagazine = async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  res.render('magazines/edit', { magazine });
};

// Controller function to handle updating a magazine
const updateMagazine = async (req, res) => {
  await Magazine.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/magazines');
};

// Controller function to handle deleting a magazine
const deleteMagazine = async (req, res) => {
  await Magazine.findByIdAndDelete(req.params.id);
  res.redirect('/magazines');
};

// Controller function to handle aggregating magazine data
const aggregateMagazines = async (req, res) => {
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
};

// Export the controller functions
module.exports = {
  getAllMagazines,
  addNewMagazine,
  editMagazine,
  updateMagazine,
  deleteMagazine,
  aggregateMagazines
};
```

### Step 2: Update Route Files to Use Controllers

Modify `bookRoutes.js` and `magazineRoutes.js` to import the controller functions and use them.

### `utilities/routes/bookRoutes.js`

```javascript
const express = require("express");
const router = express.Router();

// IMPORT THE BOOK CONTROLLER
const bookController = require('../../controllers/bookController'); 

// When someone visits our homepage
router.get("/", bookController.getAllBooks);

// When someone wants to add a new book
router.post("/add", bookController.addNewBook);

// When someone wants to edit a book
router.get("/edit/:id", bookController.editBook);

// When someone submits an edited book
router.post("/edit/:id", bookController.updateBook);

// When someone wants to delete a book
router.post("/delete/:id", bookController.deleteBook);

// When someone wants to see grouped book data
router.get("/aggregate", bookController.aggregateBooks);

module.exports = router; // Export only the router
```

### `utilities/routes/magazineRoutes.js`

```javascript
const express = require('express');
const router = express.Router();

// IMPORT THE MAGAZINE CONTROLLER
const magazineController = require('../../controllers/magazineController'); 

// When someone visits our homepage
router.get('/', magazineController.getAllMagazines);

// When someone wants to add a new magazine
router.post('/add', magazineController.addNewMagazine);

// When someone wants to edit a magazine
router.get('/edit/:id', magazineController.editMagazine);

// When someone submits an edited magazine
router.post('/edit/:id', magazineController.updateMagazine);

// When someone wants to delete a magazine
router.post('/delete/:id', magazineController.deleteMagazine);

// When someone wants to see grouped magazine data
router.get("/aggregate", magazineController.aggregateMagazines);

module.exports = router; // Export only the router
```

### Step 3: Update `app.js`

Update `app.js` to use the updated routes.

### `app.js`

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

1. **Create controller files**: `controllers/bookController.js` and `controllers/magazineController.js`.
2. **Update route files**: Import and use the controller functions in `bookRoutes.js` and `magazineRoutes.js`.
3. **Update `app.js`**: Ensure it correctly uses the updated routes.

By following these steps and completing this interactive exercise, you will gain a solid understanding of how to set up and use `routes` in a web application, separate the `routes` from the `controllers`, and ensure everything works seamlessly.

---

## REMOTE INSTRUCTORS

### INSTRUCTIONS FOR STARTING YOUR MONGOD & MONGO ON MAC

To resolve these issues, try the following steps:

1. Stop any running MongoDB processes:

   ```bash
   brew services stop mongodb-community
   ```

2. Check and fix permissions:

   ```bash
   sudo chown -R $(whoami) ~/data/db
   sudo chmod 755 ~/data/db
   ```

3. Remove the socket file if it exists:

   ```bash
   sudo rm /tmp/mongodb-27017.sock
   ```

4. Try starting MongoDB again:

   ```bash
   brew services start mongodb-community
   ```

5. If that doesn't work, try starting MongoDB manually:

   ```bash
   mongod --dbpath ~/data/db
   ```

6. If you're still having issues, you might need to reinstall MongoDB:

   ```bash
   brew uninstall mongodb-community
   brew tap mongodb/brew
   brew install mongodb-community
   ```

After trying these steps, attempt to start MongoDB again. If you're still encountering issues, there might be a problem with your Homebrew installation or system configuration. In that case, you might need to:

1. Update Homebrew: `brew update`
2. Upgrade all packages: `brew upgrade`
3. Check Homebrew for issues: `brew doctor`

If none of these solutions work, you might need to consider uninstalling and reinstalling Homebrew itself, or seek further assistance based on any specific error messages you receive.

---

## TROUBLE SHOOTING MongoDB & Mongosh

If it appears that MongoDB is not running or is not accessible on the default port (27017). Let's troubleshoot this step by step:

1. First, let's check if MongoDB is running:

   ```bash
   ps aux | grep mongod
   ```

   If you don't see a MongoDB process, it's not running.

2. Try starting MongoDB manually:

   ```bash
   mongod --dbpath ~/data/db
   ```

   Keep this terminal window open and check for any error messages.

3. If the above command starts MongoDB without errors, open a new terminal window and try connecting again:

   ```bash
   mongosh
   ```

4. If MongoDB doesn't start or you see error messages, check the MongoDB log file:

   ```bash
   cat /usr/local/var/log/mongodb/mongo.log
   ```

   Look for any error messages that might indicate why MongoDB isn't starting.

5. Ensure that the data directory exists and has the correct permissions:

   ```bash
   mkdir -p ~/data/db
   sudo chown -R $(whoami) ~/data/db
   ```

6. If you're still having issues, try removing the MongoDB lock file:

   ```bash
   sudo rm /tmp/mongodb-27017.sock
   sudo rm /usr/local/var/mongodb/mongod.lock
   ```

7. Then, repair the MongoDB database:

   ```bash
   mongod --repair --dbpath ~/data/db
   ```

8. After the repair, try starting MongoDB again:

   ```bash
   mongod --dbpath ~/data/db
   ```

9. If none of the above works, you might need to uninstall and reinstall MongoDB:

   ```bash
   brew services stop mongodb-community
   brew uninstall mongodb-community
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

10. After reinstalling, try connecting again:

    ```bash
    mongosh
    ```

If you're still encountering issues after trying these steps, there might be a more complex problem with your system configuration. In that case, you might need to check your firewall settings, ensure that port 27017 is not being used by another application, or consult the MongoDB documentation for more advanced troubleshooting steps.
