//Express and api
const express =            require('express')
const bodyParser =         require('body-parser');
const cors =               require('cors');

let expressApp = require('./src/config/expressConfig.js').config(express, cors);

//Firebase
const firebaseApp =  require('./src/config/firebaseConfig').config();
const database =   require('firebase/database');

//Config api routes
const routes = require('./src/config/configRoutes.js').config(expressApp, firebaseApp, database);


expressApp.listen(process.env.PORT || 80)