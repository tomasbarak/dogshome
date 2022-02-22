//Express and api
const express = require('express')
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const logColor = require(appDir + '/src/config/logColors');
const { connectClient, getMany,
  getOne, getAllCollection,
  saveOne, saveMany,
  deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

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

  require(appDir + '/src/config/configRoutes').config(expressApp, firebaseAdmin);
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
    connectClient(mongoURL).then(client => {
      const token = req.cookies.session || ' ';
      res.header("Access-Control-Allow-Origin", '*');
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      let pathArr = req.url.split('/').slice(0, 3).join('/')
      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
      }
      console.log(`\x1b[36m${pathArr} \x1b[0m<-- \x1b[32m${ip}`);
      const freeAccessPath = ['/profile/image', '/profile/image/']
      if (!freeAccessPath.includes(pathArr)) {
        firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
          res.locals.isPrivate = false;
          res.locals.user = decodedIdToken;
          req.user_authenticated_id = decodedIdToken.uid;
          const mongoDB = client.db(mongoDBName);
          isFirstTime(decodedIdToken.uid, mongoDB).then((snapshot) => {
            const snapshotVal = snapshot || {};
            res.locals.accType = snapshotVal.Type;
            const creationInstance = snapshotVal.CreationInstance || 0;
            res.locals.creationInstance = creationInstance
            if (req.method == 'GET') {
              const creationRoutes = ['start', 'profile-type', 'shelter-name', 'profile-photo', 'phone', 'short-description', 'web-site', 'social-media', 'terms-and-conditions']
              if (decodedIdToken.email_verified) {
                res.locals.isVerified = true;
                if (creationInstance < 9) {
                  if (req.path !== `/profile/creation/${creationRoutes[creationInstance]}`) {
                    res.redirect(`/profile/creation/${creationRoutes[creationInstance]}`);
                    client.close();

                  } else {
                    next();
                    client.close();

                  }
                } else {
                  const profileCreationAccessPath = ['/profile/creation', '/profile/creation/'];
                  if (!profileCreationAccessPath.includes(pathArr)) {
                    next();
                    client.close();

                  } else {
                    res.redirect('/inicio');
                    client.close();

                  }
                }
              } else {
                res.locals.isVerified = false;
                next();
                client.close();

              }
            } else {
              if (decodedIdToken.email_verified) {
                res.locals.isVerified = true;
                next();
                client.close();

              } else {
                res.locals.isVerified = false;
                next();
                client.close();

              }
            }
          }).catch((error) => {
            console.log(error);
            res.status(500).send(error);
            client.close();

          })
        }).catch((error) => {
          res.locals.authError = error;
          res.locals.isPrivate = true;
          next();
          client.close();
          
        });
      } else {
        next();
        client.close();

      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
  });

  function isFirstTime(user_id, mongoDB) {
    user_id = sanitize(user_id);
    return new Promise((resolve, reject) => {
      const collection = mongoDB.collection('Users');
      let query = {Id: user_id};
      let projection = { _Id: 0};

      collection.find(query).project(projection).toArray((error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length > 0) {
            resolve(result[0]);

          } else {
            resolve({});
          }
        }
      })
    });
  }
}