/*
//  FILE USED TO CONFIG FIREBASE SDK
 !  WARNING: FIREBASE SDK IS NO LONGER USED IN THIS APP
 */

require('dotenv')       .config({path: './.env'});
const initializeApp =   require('firebase/app').initializeApp;

function config(){
    const firebaseConfig = {
      apiKey:             process.env.apiKey,
      authDomain:         process.env.authDomain,
      databaseURL:        process.env.databaseURL,
      projectId:          process.env.projectId,
      storageBucket:      process.env.storageBucket,
      messagingSenderId:  process.env.messagingSenderId,
      appId:              process.env.appId,
      measurementId:      process.env.measurementId
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    return app;
}

module.exports = {config};