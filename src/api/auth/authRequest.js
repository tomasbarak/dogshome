const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

let firebaseAdmin;
function setFirebaseAdmin(admin){
    firebaseAdmin = admin;
}

let getUIDFromReq = async function (req){
    let token = String(req.headers.authtoken);
    let decodedToken = await firebaseAdmin.auth().verifyIdToken(token)
    return decodedToken.uid;
}

function auth(req, res, next){
    let token = String(req.headers.authtoken);
    firebaseAdmin.auth().verifyIdToken(token).then((decodedIdToken) => {
            generatedUID = decodedIdToken.uid;
            next();
    }).catch((error) => {
        res.status(401).send({error: 'Unauthorized upload'});
    });
}

module.exports = {auth, setFirebaseAdmin, getUIDFromReq};