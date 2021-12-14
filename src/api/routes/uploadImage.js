const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const logColor = require(appDir + '/src/config/logColors');
const multer = require('multer');
const authRequest = require(appDir + '/src/api/auth/authRequest');

const authentication = authRequest.auth;

function init(app, firebaseAdmin, database, firebaseApp) {
    //multer options
    authRequest.setFirebaseAdmin(firebaseAdmin);

    const storage = multer.diskStorage({
        destination: 'uploads',
        //Set image file name as unique without original name
        filename: function (req, file, cb) {
            var re = /(?:\.([^.]+))?$/;
            let ext = re.exec(file.originalname)[1];
            authRequest.getUIDFromReq(req).then(uid => {
                cb(null, String(uid) + '.jpg');
            })
            
        },
        limits: {
            fileSize: 1000000,
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
                cb(new Error('Please upload an image.'))
            }
            cb(undefined, true)
        },
        image: {
            type: Buffer
        }
    })
    var upload = multer({ storage: storage })

    const changeProfilePhotoURL = async function (uid, photoURL) {
        await firebaseAdmin.auth().updateUser(uid, { photoURL: String(photoURL) })
    }
    
    const changeProfilePhotoDB = async function (uid, photoURL) {
        const db = firebaseAdmin.database();
        const ref = db.ref('Users/' + uid + '/PublicRead/');
        const set = db.update;

        ref.update({
            'Photo': photoURL,
        });
        
    }
    app.post('/profile/upload/image/', authentication, upload.single('upload'), function (req, res, next) {
        console.log(logColor.debug, 'Profile upload images accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        res.header('Access-Control-Allow-Origin', '*');

        authRequest.getUIDFromReq(req).then(uid => {
            console.log(uid)
            let photoURL = 'https://api.softvisiondevelop.com.ar/profile/image/uploaded/' + req.file.filename;
            changeProfilePhotoURL(uid, photoURL).then(() => {
                changeProfilePhotoDB(uid, photoURL).then(() => {
                    res.status(200).send({ 'url': photoURL });
                }).catch(err => {
                    console.log(err)
                    res.status(500).send({ 'error': 'Error updating photo (DB)' });
                })
            }).catch(err => {
                console.log(err)
                res.status(500).send({ 'error': 'Error updating photo' });
            })
        });

    })

}
module.exports = { init };