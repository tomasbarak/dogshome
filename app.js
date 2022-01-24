//Express and api
const express = require('express')
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const logColor = require(appDir + '/src/config/logColors');
const axios = require('axios');
commitVersion = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim()

//SSL Certificate
var cert = fs.readFileSync(appDir + '/certs/certificate.crt');
var key = fs.readFileSync(appDir + '/certs/private.key');

var options = {
  key: key,
  cert: cert
};


let expressApp = require(appDir + '/src/config/expressConfig').config(express, cors);

//Firebase
const firebaseApp = require(appDir + '/src/config/firebaseConfig').config();
const firebaseAdmin = require(appDir + '/src/config/firebaseAdminConfig').config();
const database = require('firebase/database');

var SecureServer = https.createServer(options, expressApp);

console.log(logColor.debug, 'App started version: ' + commitVersion);

var HttpServer = http.createServer(function (req, res) {
  res.writeHead(301, { "Location": `https://${req.headers['host']}${req.url}` });
  res.end();
}).listen(80, function () {
  console.log(logColor.success, 'HTTP Server listening on port 80')
});

SecureServer.listen(443, function () {
  console.log(logColor.success, 'HTTPS Server listening on port 443');
  console.log(logColor.warn, "Process id:" + process.pid)

  setupPreloadFunction(expressApp, firebaseAdmin);

  require(appDir + '/src/config/configRoutes').config(expressApp, firebaseApp, database, firebaseAdmin);
  require(appDir + '/src/config/configListeners').config(firebaseApp, database, firebaseAdmin);
  expressApp.use(function (req, res, next) {
    res.status(404);
    res.render(appDir + '/public/404', {
      errorCode: "404",
      errorMessage: "Página no encontrada",
      isPrivate: res.locals.isPrivate,
    });
  });
  //require(appDir + '/src/cleaning/purgeUnverifiedUsers').init(firebaseAdmin)
})
function setupPreloadFunction(expressApp, firebaseAdmin) {
  expressApp.use(function (req, res, next) {
    const token = req.cookies.session || ' ';
    res.header("Access-Control-Allow-Origin", '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    let pathArr = req.url.split('/').slice(0,3).join('/')
    console.log(logColor.debug, 'pathArr', pathArr, '<--', req.url );
    const freeAccessPath = ['/profile/image', '/profile/image/']
    if(!freeAccessPath.includes(pathArr)){
    firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
      res.locals.isPrivate = false;
      res.locals.user = decodedIdToken;
      req.user_authenticated_id = decodedIdToken.uid;
      isFirstTime(decodedIdToken.uid).then((snapshot) => {
        const snapshotVal = snapshot.val() || {};
        res.locals.accType = snapshotVal.Type;
        const creationInstance = snapshotVal.CreationInstance || 0;
        res.locals.creationInstance = creationInstance
        if (req.method == 'GET') {
          const creationRoutes = ['start', 'profile-type', 'shelter-name', 'profile-photo', 'phone', 'short-description', 'web-site', 'social-media', 'terms-and-conditions']
          console.log('Type', res.locals.accType);
          if (decodedIdToken.email_verified) {
            res.locals.isVerified = true;
            if (creationInstance < 9) {
              console.log('Profile is not complete');
              if(req.path !== `/profile/creation/${creationRoutes[creationInstance]}`){
                console.log('Path is not equal');
                console.log('Creation instance', creationInstance);
                console.log(`/profile/creation/${creationRoutes[creationInstance]}`);
                console.log(req.path);
                res.redirect(`/profile/creation/${creationRoutes[creationInstance]}`);
              }else{
                next();
              }
            }else{
              console.log('Is equal path');
              const profileCreationAccessPath = ['/profile/creation', '/profile/creation/'];
              if(!profileCreationAccessPath.includes(pathArr)){
                next();
              }else{
                res.redirect('/inicio');
              }
            }
          } else {
            res.locals.isVerified = false;
            next();
          }
        } else {
          if (decodedIdToken.email_verified) {
            res.locals.isVerified = true;
            next();
          } else {
            res.locals.isVerified = false;
            next();
          }
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
      })
    }).catch((error) => {
      res.locals.authError = error;
      res.locals.isPrivate = true;
      next();
    });
  }else{
    next();
  }
  });

  function isFirstTime(user_id) {
    const { ref, get, getDatabase, query } = database;

    const db = getDatabase(firebaseApp);
    const user_profile = query(ref(db, `Users/${user_id}/PublicRead/`));

    return get(user_profile);
  }
}