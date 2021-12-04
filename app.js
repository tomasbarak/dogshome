//Express and api
const express =            require('express')
const bodyParser =         require('body-parser');
const cors =               require('cors');
const fs =                 require('fs');
const https =              require('https');
const http =               require('http');

var cert = fs.readFileSync('./certs/certificate.cert');
var key = fs.readFileSync('./certs/private.key');
var options = {
  key: key,
  cert: cert
};

let expressApp = require('./src/config/expressConfig.js').config(express, cors);

//Firebase
const firebaseApp =  require('./src/config/firebaseConfig').config();
const database =   require('firebase/database');

var SecureServer = https.createServer(options, expressApp);
var HttpServer = http.createServer(expressApp);

//Config api routes

SecureServer.listen(8443, function() {
  HttpServer.listen(8080, function() {
    console.log('HTTPS Server listening on port 8443 && HTTP Server listening on port 8080', "Process id: ", process.pid);
    require('./src/config/configRoutes.js').config(expressApp, firebaseApp, database);
  });
})