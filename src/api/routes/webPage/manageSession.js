const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const mdb = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app, firebaseAdmin) {
    app.post('/sessionLogin', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        // Get the ID token passed and the CSRF token.
        const idToken = req.body.idToken;
        // Set session expiration to 15 days.
        const expiresIn = 60 * 60 * 24 * 14 * 1000;
        // Create the session cookie. This will also verify the ID token in the process.
        // The session cookie will have the same claims as the ID token.
        // To only allow session cookie setting on recent sign-in, auth_time in ID token
        // can be checked to ensure user was recently signed in before creating a session cookie.
        firebaseAdmin.auth()
            .createSessionCookie(idToken, { expiresIn })
            .then(
                (sessionCookie) => {
                    const subscription = req.body.subscription;

                    if(subscription) {
                        firebaseAdmin.auth().verifySessionCookie(sessionCookie, true /** checkRevoked */).then((decodedIdToken) => {
                            const user_id = decodedIdToken.uid;

                            mdb.connectClient(mongoURL).then( (client) => {
                                const collection = client.db(mongoDBName).collection('Subscriptions');
                                const subscription_to_save = {
                                    user_id: user_id,
                                    push_subscription: subscription
                                };

                                mdb.saveOne(collection, subscription_to_save, subscription_to_save).then( (result) => {
                                    res.set("Set-Cookie", `session=${sessionCookie}; HttpOnly; Secure; SameSite=none; Path=/; Domain=${req.headers.host === 'localhost.test' ? ".localhost.test" : ".dogshome.com.ar"}; Max-Age=${expiresIn}`);
                                    res.redirect('/');
                                }).catch( (error) => {
                                    res.status(500).send({
                                        error: error
                                    });
                                });
                            }).catch((error) => {
                                reject(error);
                            });
                        }).catch((error) => {
                            console.log(error);
                        })
                    } else {
                        res.set("Set-Cookie", `session=${sessionCookie}; HttpOnly; Secure; SameSite=none; Path=/; Domain=${req.headers.host === 'localhost.test' ? ".localhost.test" : ".dogshome.com.ar"}; Max-Age=${expiresIn}`);
                        res.redirect('/');
                    }
                    
                },
                (error) => {
                    res.status(401).send(error);
                }
            );
    });
    app.post('/sessionLogout', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        // Delete the session cookie.
        const user = res.locals.user;
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        if(!isPrivate){
            res.clearCookie('session');
            const body = req.body;
            console.log(body);
            const pushEndpoint = body.pushEndpoint;
            console.log(pushEndpoint);
            mdb.connectClient(mongoURL).then(client => {
                const mongoDB = client.db(mongoDBName);
                const subscriptionsCollection = mongoDB.collection('Subscriptions');
                let requestQuery = { "push_subscription.endpoint": pushEndpoint, "user_id": user.uid };
                mdb.deleteMany(subscriptionsCollection, requestQuery).then(result => {
                    console.log(result);
                    firebaseAdmin.auth().revokeRefreshTokens(user.uid).then(() => {
                        res.send('Logged out');
                    }).catch((error) => {
                        console.log(error)
                        res.status(500).send(error);
                    });
                    client.close();
                }).catch(err => {
                    console.error(err);
                    client.close();
                });
            }).catch(err => {
                console.error(err);
            });
            
        }else{
            res.status(200).send('Logged out');
        }
        
    })
}

module.exports = { init };