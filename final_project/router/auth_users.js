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

// Add a book review (to be implemented later)
regd_users.put("/auth/review/:isbn", (req, res) => {
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
