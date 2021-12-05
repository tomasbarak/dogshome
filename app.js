//Express and api
const express =            require('express')
const bodyParser =         require('body-parser');
const cors =               require('cors');
const fs =                 require('fs');
const https =              require('https');
const http =               require('http');

var cert = fs.readFileSync('./certs/certificate.crt');
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
var HttpServer = http.createServer(function(req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80, function() {
  console.log('HTTP Server listening on port 80')
});

SecureServer.listen(443, function() {
  console.log('HTTPS Server listening on port 443', "Process id: ", process.pid);
  require('./src/config/configRoutes.js').config(expressApp, firebaseApp, database);
})