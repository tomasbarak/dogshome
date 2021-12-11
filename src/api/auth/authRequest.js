const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

let firebaseAdmin;

function setFirebaseAdmin(admin){
    firebaseAdmin = admin;
}

function auth(req, res, next){
    let token = String(req.headers.authtoken);
    firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
        next();
    }).catch((error) => {
        res.status(401).send({error: 'Unauthorized upload'});
    });
}

module.exports = {auth, setFirebaseAdmin};