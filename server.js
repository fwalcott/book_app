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

//Default View Engine 
app.set('view engine', 'ejs');


//Routes 
app.get('/', (request, response) => {
response.status(200).render('pages/index')
}) 

app.get('/hello', (request, response) => {
    response.status(200).render('pages/index')
}) 









app.listen(PORT, () => console.log(`Now listeniing on ${PORT}`));




