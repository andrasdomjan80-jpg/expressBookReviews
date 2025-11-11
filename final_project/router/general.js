const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  return res.status(300).json({message: "Yet to be implemented"});
});

// ✅ Get the book list
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// ✅ Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  return res.status(300).json({message: "Yet to be implemented"});
});

public_users.get('/title/:title', function (req, res) {
  return res.status(300).json({message: "Yet to be implemented"});
});

public_users.get('/review/:isbn', function (req, res) {
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
