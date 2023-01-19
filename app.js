/*
    *FILE USED TO SETUP:
     - EXPRESS APP
     - FIREBASE SDK
     - ROUTING HANDLERS
     - PRELOAD FUNCTION
     - HTTP/HTTPS SERVER
 */

const express =       require('express')
const cors =          require('cors');
const fs =            require('fs');
const https =         require('https');
const http =          require('http');
const { dirname } =   require('path');
const appDir =        dirname(require.main.filename);
const logger =        require("node-color-log");
const argv =          require("minimist")(process.argv.slice(2));
const { connectClient, 
        getMany,
        getOne, 
        getAllCollection,
        saveOne, 
        saveMany,
        deleteOne, 
        deleteMany, 
        sanitize } =  require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL =      'mongodb://localhost:27017/dogshome';
const mongoDBName =   'dogshome';

/*////const commitVersion = require('child_process')
                      ////.execSync('git rev-parse HEAD')
                      ////.toString().trim()*/

//SSL Certificate
var cert =    fs.readFileSync(appDir + '/certs/certificate.crt');
var key =     fs.readFileSync(appDir + '/certs/private.key');
var options = { key: key,
                cert: cert };

let expressApp = require(appDir + '/src/config/expressConfig').config(express, cors);

//Firebase
const firebaseAdmin = require(appDir + '/src/config/firebaseAdminConfig').config();

var SecureServer = https.createServer(options, expressApp);

////logger.fontColorLog('cyan', 'App started version: ' + commitVersion);

SecureServer.listen(8443, function () {
  logger.fontColorLog('green', 'HTTPS Server listening on port 8443');
  logger.fontColorLog('yellow', "Process id:" + process.pid)

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

const addCors = (res) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
}

function setupPreloadFunction(expressApp, firebaseAdmin) {
  expressApp.use(function (req, res, next) {

    console.log(req.body)

    //Setup CORS headers
    addCors(res);

    //Creating a MongoDB connection
    connectClient(mongoURL).then(client => {
      const token =           req.cookies.session || ' ';
      const freeAccessPath =  ['/profile/image', '/profile/image/']

      let pathArr =           new URL(req.protocol + '://' + req.get('host') + req.originalUrl).pathname;
      let ip =                req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

      if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
      }

      //Log path access by user IP
      logger.color("cyan").log(pathArr).joint().color("white").log(" <-- ").joint().color("green").log(ip)

      //Check if required path is NOT freely accessible
      if (!freeAccessPath.includes(pathArr)) {

        //Verify session token with Firebase Admin
        firebaseAdmin.auth().verifySessionCookie(token, true /** checkRevoked */).then((decodedIdToken) => {
          res.locals.isPrivate =        false;
          res.locals.user =             decodedIdToken;
          req.user_authenticated_id =   decodedIdToken.uid;
          const mongoDB =               client.db(mongoDBName);

          //Check if its first time user
          isFirstTime(decodedIdToken.uid, mongoDB).then((snapshot) => {
            const snapshotVal =             snapshot || {};
            const creationInstance =        snapshotVal.CreationInstance || 0;
            res.locals.accType =            snapshotVal.Type;
            res.locals.creationInstance =   creationInstance

            //Check if the user is trying to access an account creation page
            if (req.method == 'GET') {
              const creationRoutes = ['start', 'profile-type', 'shelter-name', 'profile-photo', 'phone', 'short-description', 'web-site', 'social-media', 'terms-and-conditions']
              
              //Check if users e-mail is verified
              if (decodedIdToken.email_verified) {
                res.locals.isVerified = true;

                //Check if user profile creation is NOT complete
                if (creationInstance < 9) {

                  //Redirect user if is trying to access to a wrong step of creation
                  if (req.path !== `/profile/creation/${creationRoutes[creationInstance]}`) {
                    res.redirect(`/profile/creation/${creationRoutes[creationInstance]}`);
                    client.close();

                  } else {
                    next();
                    client.close();

                  }
                } else {
                  const collection =                mongoDB.collection('Users');
                  const profileCreationAccessPath = ['/profile/creation', '/profile/creation/'];

                  //Get finished user profile
                  getMany(collection, { _id: 0}, {Id: decodedIdToken.uid}).then((snapshot) => {
                    res.locals.userData = snapshot[0] || {};

                    //If user is trying to access to profile creation page redirect to index page
                    if (profileCreationAccessPath.includes(pathArr)) {
                      res.redirect('/inicio');
                      client.close();

                    }else {
                      next();
                      client.close();
  
                    }
                  }).catch((err) => {
                    console.log(err);
                    res.status(500).send(err);
                    client.close();
                  });
                  
                }
              } else {
                res.locals.isVerified = false;
                next();
                client.close();

              }
            } else {
              //Allow user to POST data to the server (Using next())
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

          //If session token is NOT valid set res.locals.isPrivate to true
          res.locals.authError = error;
          res.locals.isPrivate = true;

          next();
          client.close();
        });
      } else {
        //Allow user to access without authentication
        next();
        client.close();

      }
    }).catch((error) => {

      //Handle MongoDB connection error
      console.log(error);
      res.status(500).send(error);
    });
  });

  //Method to check if its user first time
  function isFirstTime(user_id, mongoDB) {
    user_id = sanitize(user_id);

    return new Promise((resolve, reject) => {
      const collection =  mongoDB.collection('Users');
      let query =         {Id: user_id};
      let projection =    { _Id: 0};

      //Find user profile
      collection.find(query).project(projection).toArray((error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result.length > 0) {
            //If user profile exists resolve with user profile
            resolve(result[0]);

          } else {
            //If user profile does NOT exist resolve with empty object
            resolve({});

          }
        }
      })
    });
  }
}