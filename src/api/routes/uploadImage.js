const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);
const logColor =        require(appDir + '/src/config/logColors');
const multer = require('multer')
const authRequest = require(appDir + '/src/api/auth/authRequest');

const authentication = authRequest.auth;
function init(app, firebaseAdmin){
    //multer options
    authRequest.setFirebaseAdmin(firebaseAdmin);

    const storage = multer.diskStorage({
        destination: 'uploads',
        //Set image file name as unique without original name
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        },
        limits: {
            fileSize: 1000000,
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            cb(new Error('Please upload an image.'))
            }
            cb(undefined, true)
        },
        image: {
            type: Buffer
            }
    })
    var upload = multer({ storage: storage })

    app.post('/profile/upload/image/', authentication, upload.single('upload'), function(req, res, next){
        console.log(logColor.debug, 'Profile upload images accessed by', req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").pop());
        res.header('Access-Control-Allow-Origin', '*');
        res.status(200).send({'url': 'https://api.softvisiondevelop.com.ar/profile/image/uploaded/' + req.file.filename});
    })
    
}
module.exports = {init};