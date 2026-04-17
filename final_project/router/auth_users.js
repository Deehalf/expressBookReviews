const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Username valido cuando aun no existe en el arreglo de usuarios.
return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Verifica credenciales contra el registro en memoria.
return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.user && req.user.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  const book = books[isbn] || Object.values(books).find((b) => b.ISBN === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews = book.reviews || {};
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user && req.user.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const book = books[isbn] || Object.values(books).find((b) => b.ISBN === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews = book.reviews || {};
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: "Review by this user not found" });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
