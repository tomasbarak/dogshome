/*
 *  FILE USED TO CONFIGURE FIREBASE ADMIN SDK
 */

const firebaseAdmin = require('firebase-admin');
const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

function config(){
    firebaseAdmin.initializeApp({
        credential:     firebaseAdmin.credential.cert(appDir + "/certs/firebase-adminsdk.json"),
        databaseURL:    "https://dogshome-6af88-default-rtdb.firebaseio.com"
    });
    
    return firebaseAdmin;
}

module.exports = {config};
