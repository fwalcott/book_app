'use strict';

//Bring out depencies 
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const { response } = require('express');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Create postgres client
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

//Where my server will look for pages in the browser
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));

//Default View Engine
app.set('view engine', 'ejs');


//Routes
app.get('/', (request, response) => {
  const SQL = `SELECT * FROM books;`;

  client.query(SQL)
    .then(results => response.render('pages/index', { results: results.rows }))
    .catch(errorHandler);
  console.log('Database used');
});

// response.status(200).render('pages/index');

app.get('/hello', (request, response) => {
  response.status(200).render('pages/index');
});

app.get('/searches/new', (request, response) => {
  response.status(200).render('pages/searches/new');
});

app.post('/searches', bookHandler);
app.get('/books/:id', requestInfo);
app.post('/addBook', addBookHandler);
app.get('*', errorHandler);

// Constructors

function Book(obj) {
  let noImage = 'https://i.imgur.com/J5LVHEL.jpg';
  // let httpRegex = /^(http:\/\/)/g;
  this.bookTitle = obj.title || 'No Title Available';
  this.image_url = obj.imageLinks ? obj.imageLinks.smallThumbnail : noImage;
  this.author = obj.authors ? obj.authors[0] : 'No Author Available';
  this.description = obj.description || 'No description Available';
  this.isbn = obj.industryIdentifiers ? obj.industryIdentifiers[0].identifier : 'No ISBN Available';
}


//Handlers
function bookHandler(request, response) {
  let search = request.body.title;
  let key = process.env.GOOGLEBOOKS_API_KEY;

  const URL = `https://www.googleapis.com/books/v1/volumes?q=in${request.body.choice}:${search}&key=${key}`;


  superagent.get(URL)
    .then(data => data.body.items.map(book => new Book(book.volumeInfo)))
    //   console.log(data.body.items, 'data response for data.body.items');
    // console.log(data.body.items);
    // console.log('book: ', book);
    .then(book => {
      console.log('This is the data: ', book);
      response.render('pages/searches/show', { searchResults: book });
    })
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Something went wrong with the Google Books API');
    });
}

function errorHandler(request, response) {
  response.status(500).render('pages/error');
}

function requestInfo(request, response) {
  const SQL = `SELECT * FROM books WHERE id = $1`;
  const SQL_values = [request.params.id];

  client.query(SQL, SQL_values)
    .then(results => {
      console.log('This is results.rows in the requestInfo Handler: ', results.rows[0]);
      response.render('pages/books/show', { book: results.rows[0] });
    })
    .catch(errorHandler);
  console.log('Database used');

}

function addBookHandler(request, response) {
  let SQL = `INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;

  const params = [request.body.author, request.body.title, request.body.isbn, request.body.image_url, request.body.description];

  client.query(SQL, params)
    // .then(() => {
    //   SQL = 'SELECT * FROM books WHERE isbn=$1;';
    //   let values = [request.body.isbn];
    //   return client.query(SQL, values)
    .then(book => {
      console.log('This is book.rows: ', book);
      response.status(200).redirect(`/books/${book.rows[0].id}`)
        .catch((error) => {
          console.log('ERROR', error);
          response.status(500).send('Something went wrong with adding the book.');
        });
    })
    // console.log('Added to Database')
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Something went wrong.');
    });

}


// app.listen(PORT, () => console.log(`Now listeniing on ${PORT}`));

//Start server
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });



