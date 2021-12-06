//Express and api
const express =            require('express')
const bodyParser =         require('body-parser');
const cors =               require('cors');
const fs =                 require('fs');
const https =              require('https');
const http =               require('http');
const { dirname } =        require('path');
const appDir =             dirname(require.main.filename);
const logColor =           require(appDir + '/src/config/logColors');
commitVersion =                 require('child_process')
                          .execSync('git rev-parse HEAD')
                          .toString().trim()

//SSL Certificate
var cert =                 fs.readFileSync( appDir + '/certs/certificate.crt');
var key =                  fs.readFileSync( appDir + '/certs/private.key');

var options = {
  key: key,
  cert: cert
};


let expressApp =           require( appDir + '/src/config/expressConfig').config(express, cors);

//Firebase
const firebaseApp =        require( appDir + '/src/config/firebaseConfig').config();
const firebaseAdmin =      require( appDir + '/src/config/firebaseAdminConfig').config();
const database =           require('firebase/database');

var SecureServer =         https.createServer(options, expressApp);

console.log(logColor.debug, 'Starting server ' + ' version: ' + commitVersion);

var HttpServer = http.createServer(function(req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80, function() {
  console.log(logColor.success, 'HTTP Server listening on port 80')
});

SecureServer.listen(443, function() {
  console.log(logColor.success, 'HTTPS Server listening on port 443');
  console.log(logColor.warn, "Process id:" + process.pid)
  require( appDir + '/src/config/configRoutes').config(expressApp, firebaseApp, database, firebaseAdmin);
  require( appDir + '/src/config/configListeners').config(firebaseApp, database, firebaseAdmin);
})