const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany, getOne, getAllCollection, saveOne, saveMany, deleteOne, deleteMany } = require(appDir + '/src/api/mongodbFunctions.js');
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
        const isPrivate =       res.locals.isPrivate;

        if (!isPrivate) {
            const authtoken = req.cookies.session || '';
            let hashed = crypto.createHash('sha256').update(authtoken).digest('hex');
            const url = 'mongodb://localhost:27017/';
            connectClient(url).then(client => {

                const db = client.db('dogshome');
                const collection = db.collection('api_keys')
                let collectionName = 'api_tokens';
                getAllCollection(collection).then(result => {
                    console.log(result);
                }).catch(err => {
                    console.log(err)
                });;
                saveOne(collection, { [hashed]: { userToken: authtoken } }).then(result => {
                    console.log('Successfully inserted api token');
                    res.send(hashed);
                    client.close();
                }).catch(err => {
                    res.status(500).send(err);
                    console.log(err);
                    client.close();
                });

            });
        }else{
            res.status(401).send({ error: `Cant generate api token: ${req.cookies.session}` });
        }
    });

}

module.exports = { init };

