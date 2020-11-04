'use strict';

//Bring out depencies 
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const { response } = require('express');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//Where my server will look for pages in the browser
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true}));

//Default View Engine
app.set('view engine', 'ejs');


//Routes
app.get('/', (request, response) => {
  response.status(200).render('pages/index');
});

app.get('/hello', (request, response) => {
  response.status(200).render('pages/index');
});

app.get('/searches/new', (request, response) => {
  response.status(200).render('pages/searches/new');
});

app.post('/searches', bookHandler);

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
    .then(data => {
      console.log('This is the data: ', data);
      response.render('pages/searches/show', {searchResults: data});
    })
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Something went wrong with the Google Books API');
    });
}
// Constructors

function Book(obj) {
  let noImage = 'https://i.imgur.com/J5LVHEL.jpg';
  let httpRegex = /^(http:\/\/)/g;
  this.bookTitle = obj.title;
  this.img = obj.imageLinks.smallThumbnail ? obj.imageLinks.smallThumbnail.replace(httpRegex, 'https://'):noImage;
  this.author = obj.authors;
  this.description = obj.description;
  this.isbn = obj.isbn;

}


app.listen(PORT, () => console.log(`Now listeniing on ${PORT}`));




