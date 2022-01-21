const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get('/profile/creation/start', (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        const creationInstance = res.locals.creationInstance;
        const user = res.locals.user || {};
        console.log('isPrivate', isPrivate);
        if (!isPrivate) {
            if (isVerified) {
                res.render(appDir + '/public/create-profile.ejs', {
                    uid: user.user_id,
                    creationInstance: creationInstance,
                    isVerified: isVerified,
                    isPrivate: isPrivate,
                    action: 'Ingresá tu nombre y apellido',
                    actionRawName: 'name-and-surname',
                    sendDataPath: 'start',
                });
            }
        } else {
            res.status(401).send({ error: `Cant verify token: ${req.cookies.session}` });
        }
    });
    app.post('/profile/creation/start', (req, res) => {
        let { name, surname } = req.body;
        const uid = res.locals.user.uid;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        surname = surname.charAt(0).toUpperCase() + surname.slice(1);
        const db = firebaseAdmin.database();
        const user_profile = db.ref(`Users/${uid}/PublicRead`);
        user_profile.set({
            Name: name,
            Surname: surname,
            CreationInstance: 1,
            Id: uid,
        }, (error) => {
            if (error) {
                console.log(error);
                res.status(500).send({ error: error });
            } else {
                firebaseAdmin.auth().updateUser(uid, {
                    displayName: `{nameAndSurname: {name: ${name}, surname: ${surname}, displayName: ${name} ${surname}}}`,
                }).then(() => {
                    res.status(200).send({ redirectRoute: '/profile/creation/profile-type' });
                }).catch((error) => {
                    console.log(error);
                    res.status(500).send({ error: error });
                });
            }
        });
    });
    app.get('/profile/creation/profile-type', (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        const creationInstance = res.locals.creationInstance;
        const user = res.locals.user || {};

        if (!isPrivate) {
            if (isVerified) {
                res.render(appDir + '/public/create-profile.ejs', {
                    uid: user.user_id,
                    creationInstance: creationInstance,
                    isVerified: isVerified,
                    isPrivate: isPrivate,
                    action: 'Elegí el tipo de cuenta',
                    actionRawName: 'profile-type',
                    sendDataPath: 'profile-type',
                });
            }
        }
    });
    app.post('/profile/creation/profile-type', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        let targetCreatioInstance = 1;
        const allowedInstance = 1;
        if (allowedInstance === creationInstance) {
            let { accTypeName, accTypeNum } = req.body;
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            if (accTypeNum == 2) {
                targetCreatioInstance = 2;
            } else {
                targetCreatioInstance = 3;
            }

            user_profile.update({
                CreationInstance: targetCreatioInstance,
                Type: {
                    TypeNum: accTypeNum,
                    TypeStr: accTypeName.charAt(0).toUpperCase() + accTypeName.slice(1),
                }
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/profile/creation/shelter-name' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }

    });
    app.get('/profile/creation/shelter-name', (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        const creationInstance = res.locals.creationInstance;
        const user = res.locals.user || {};

        if (!isPrivate) {
            if (isVerified) {
                res.render(appDir + '/public/create-profile.ejs', {
                    uid: user.user_id,
                    creationInstance: creationInstance,
                    isVerified: isVerified,
                    isPrivate: isPrivate,
                    action: 'Ingresá el nombre del refugio',
                    actionRawName: 'shelter-name',
                    sendDataPath: 'shelter-name',
                });
            }
        }
    });
    app.post('/profile/creation/shelter-name', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        let targetCreatioInstance = 3;
        const allowedInstance = 2;
        if (allowedInstance === creationInstance) {
            let { shelterName } = req.body;
            const uid = res.locals.user.uid;
            shelterName = shelterName.charAt(0).toUpperCase() + shelterName.slice(1);
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            user_profile.update({
                CreationInstance: targetCreatioInstance,
                RefName: shelterName,
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/profile/creation/shelter-address' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }

    });
    app.get('/profile/creation/profile-photo', (req, res) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        const creationInstance = res.locals.creationInstance;
        const user = res.locals.user || {};

        if (!isPrivate) {
            if (isVerified) {
                res.render(appDir + '/public/create-profile.ejs', {
                    uid: user.user_id,
                    creationInstance: creationInstance,
                    isVerified: isVerified,
                    isPrivate: isPrivate,
                    action: 'Subí tu foto de perfil',
                    actionRawName: 'profile-photo',
                    sendDataPath: 'profile-photo',
                });
            }
        }
    });
    app.post('/profile/creation/profile-photo', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        let targetCreatioInstance = 4;
        const allowedInstance = 3;
        if (allowedInstance === creationInstance) {
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            const { photoUrl } = req.body;
            user_profile.update({
                CreationInstance: targetCreatioInstance,
                Photo: photoUrl,
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    firebaseAdmin.auth().updateUser(uid, {
                        picture: photoUrl,
                    }).then(() => {
                        res.status(200).send({ redirectRoute: '/profile/creation/short-description' });
                    }).catch((error) => {
                        console.log(error);
                        res.status(500).send({ error: error });
                    });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }

    });
}

module.exports = { init };