const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/books',function (req, res) {
  // Endpoint base para exponer el catálogo completo.
  return res.status(200).json(books);
});

// Get the book list available in the shop using Axios + async/await
public_users.get('/', async function (req, res) {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const response = await axios.get(`${baseUrl}/books`);
    return res.status(200).type("application/json").send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch books using Axios" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Busca por clave numérica o por el campo ISBN dentro del objeto libro.
  const isbn = req.params.isbn;
  const book = books[isbn] || Object.values(books).find((b) => b.ISBN === isbn);
  if (book) {
    return res.status(200).type("application/json").send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Busca por el autor dentro del objeto libro.
  const author = req.params.author;
  const book = Object.values(books).find((b) => b.author === author);   
  if (book) {
    return res.status(200).type("application/json").send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Busca por el título dentro del objeto libro.
  const title = req.params.title;
  const book = Object.values(books).find((b) => b.title === title);   
  if (book) {
    return res.status(200).type("application/json").send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Busca por clave numérica o por el campo ISBN para obtener sus reseñas.
  const isbn = req.params.isbn;
  const book = books[isbn] || Object.values(books).find((b) => b.ISBN === isbn);

  if (book) {
    return res.status(200).type("application/json").send(JSON.stringify(book.reviews || {}, null, 2));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
