const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, checkCollection, deleteCollection, insertOne } = require(appDir + '/src/api/mongodbFunctions.js');
const crypto = require('crypto');

const encrypt = (text, key, iv) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
function decrypt(text, key) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
//Route to generate api token

function init(app, firebaseAdmin) {
    app.get('/generate/api/token', function (req, res) {
        const authtoken = req.cookies.session || '';
        let hashed = crypto.createHash('sha256').update(authtoken).digest('hex');

        connectClient().then(db => {
            
            let dbo = db.db('dogshome');
            let collectionName = 'api_tokens';
            let cursor = dbo.collection(collectionName).find().toArray();
            cursor.then(docs => {
                console.log(docs);
            })

            insertOne(dbo, collectionName, { [hashed]: {userToken: authtoken} }).then(result => {
                console.log('Successfully inserted api token');
                res.send(hashed);
                db.close();
            }).catch(err => {
                res.status(500).send(err);
                console.log(err);
                db.close();
            });
        });
    });

}

module.exports = { init };

