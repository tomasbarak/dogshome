const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const logColor = require(appDir + '/src/config/logColors');
const multer = require('multer');
const authRequest = require(appDir + '/src/api/auth/authRequest');

const authentication = authRequest.auth;

function init(app, firebaseAdmin, database, firebaseApp) {
    //multer options
    const storage = multer.diskStorage({
        destination: 'uploads',
        //Set image file name as unique without original name
        filename: function (req, file, cb) {
            var re = /(?:\.([^.]+))?$/;
            let ext = re.exec(file.originalname)[1];
            cb(null, String(req.user_authenticated_id) + '.jpg');

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

    app.post('/profile/upload/image/', upload.single('file'), function (req, res, next) {
        console.log(logColor.debug, 'Profile upload images accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        res.header('Access-Control-Allow-Origin', true);
        res.header('Access-Control-Allow-Credentials', '*');
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        const user = res.locals.user;
        const uid = user.uid;
        if (!isPrivate) {
            if (isVerified) {
                console.log(uid)
                let photoURL = 'https://api.softvisiondevelop.com.ar/profile/image/uploaded/' + req.file.filename;
                res.send({ photoURL: photoURL });
            }else{
                res.status(403).send({ 'error': 'User not verified' });
            }
        }else{
            res.status(401).send('Not authorized');
        }
    })

}
module.exports = { init };