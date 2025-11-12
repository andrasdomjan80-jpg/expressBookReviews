const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Use an OBJECT map so it matches general.js usage
// e.g., users["john"] = { username: "john", password: "pw" }
let users = {};

/**
 * Validate username (basic: non-empty string)
 */
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

/**
 * Check if provided username/password match what we have on record.
 * For the object map shape: users[username] = { username, password }
 */
const authenticatedUser = (username, password) => {
  if (!username || !password) return false;
  const u = users[username];
  return !!(u && u.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  // Create JWT and save it to the session for the auth middleware to verify
  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({
    message: "Customer successfully logged in",
    token: accessToken
  });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const review = req.query.review;
  
    // Prefer username from verified JWT payload, fallback to session copy
    const username =
      (req.user && req.user.data) ||
      (req.session && req.session.authorization && req.session.authorization.username);
  
    if (!username) return res.status(401).json({ message: "Not authenticated" });
    if (!review || !review.trim()) {
      return res.status(400).json({ message: "Review text is required in the 'review' query parameter" });
    }
  
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found" });
  
    if (!book.reviews || typeof book.reviews !== "object") book.reviews = {};
  
    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review;
  
    return res.status(200).json({
      message: isUpdate ? "Review updated successfully" : "Review added successfully",
      isbn,
      user: username,
      review: book.reviews[username]
    });
  });
  
  // Delete the logged-in user's review for a book
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  
    const username =
      (req.user && req.user.data) ||
      (req.session && req.session.authorization && req.session.authorization.username);
  
    if (!username) return res.status(401).json({ message: "Not authenticated" });
  
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found" });
  
    if (!book.reviews || typeof book.reviews !== "object") {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  
    if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
      return res.status(404).json({ message: "No review by this user for this book" });
    }
  
    delete book.reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully", isbn, user: username });
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
