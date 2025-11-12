const express = require('express');
const axios = require('axios'); // ✅ For async/await or Promise-based HTTP calls
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ✅ Register a new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users[username] = { username, password };
  return res.status(200).json({ message: "User successfully registered. You can now log in." });
});

// ✅ Get the book list (base endpoint)
public_users.get('/', function (req, res) {
  res.status(200).json(books);
});

// ✅ Get book details based on ISBN (base endpoint)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ✅ Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  const booksByAuthor = [];

  keys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push(books[key]);
    }
  });

  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// ✅ Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const booksByTitle = [];

  keys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push(books[key]);
    }
  });

  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// ✅ Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    const reviews = book.reviews || {};
    res.status(200).json(reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

/**
 * Helper: Build absolute base URL for internal Axios calls
 */
function buildSelfRootUrl(req) {
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${req.baseUrl || ''}`;
}

/**
 * ✅ Task 1 (previous): Get all books using Axios (async & promise)
 */

// 🧭 Async/Await version
public_users.get('/books/async', async (req, res) => {
  try {
    const url = `${buildSelfRootUrl(req)}/`;
    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books with async/await",
      error: err.message
    });
  }
});

// 🔗 Promise callbacks version
public_users.get('/books/promise', (req, res) => {
  const url = `${buildSelfRootUrl(req)}/`;
  axios.get(url)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(500).json({
      message: "Error fetching books with Promise callbacks",
      error: err.message
    }));
});

/**
 * ✅ Task 2: Get book details by ISBN using Axios (async & promise)
 */

// 🧭 Async/Await version
public_users.get('/isbn-async/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const url = `${buildSelfRootUrl(req)}/isbn/${isbn}`;
    const response = await axios.get(url);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching book details with async/await",
      error: err.message
    });
  }
});

// 🔗 Promise callbacks version
public_users.get('/isbn-promise/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const url = `${buildSelfRootUrl(req)}/isbn/${isbn}`;

  axios.get(url)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(500).json({
      message: "Error fetching book details with Promise callbacks",
      error: err.message
    }));
});

module.exports.general = public_users;
