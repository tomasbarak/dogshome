/*
 *  FILE USED TO CONFIGURE FIREBASE ADMIN SDK
 */

const firebaseAdmin = require('firebase-admin');

function config(){
    firebaseAdmin.initializeApp({
        credential:     firebaseAdmin.credential.cert("./firebase-adminsdk.json"),
        databaseURL:    "https://dogshome-6af88-default-rtdb.firebaseio.com"
    });
    
    return firebaseAdmin;
}

module.exports = {config};