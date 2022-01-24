const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp) {
    app.get('/profile/creation/*', (req, res, next) => {
        const isPrivate = res.locals.isPrivate;
        const isVerified = res.locals.isVerified;
        if(!isPrivate){
            if(!isVerified){
                res.redirect('/inicio');
            }else{
                next();
            }
        }else{
            res.redirect('/inicio');
        }
    })
    app.post('/profile/creation/step/back', (req, res, next) => {
        let creationInstance = res.locals.creationInstance;
        const accType = res.locals.accType || {};
        const accTypeNum = accType.TypeNum;
        const uid = res.locals.user.uid;
        console.log('typeNum', accTypeNum);
        if(creationInstance > 0){
            if(creationInstance === 8 && accTypeNum === 1){
                console.log('Creation instance', creationInstance);
                creationInstance = 5;
            }else if(creationInstance === 7 && accTypeNum === 1){
                creationInstance = 5;
            }else if(creationInstance === 8 && accTypeNum !== 1){
                creationInstance--;
            }else if(creationInstance === 7 && accTypeNum !== 1){
                creationInstance--;
            }else if(creationInstance === 3 && accTypeNum === 2){
                creationInstance--;
            }else if(creationInstance === 3 && accTypeNum !== 2){
                creationInstance = 1;
            }else{
                creationInstance--;
            }
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);     
            user_profile.update({
                CreationInstance: creationInstance
            }).then(() => {
                res.send({'Success': true});
            }).catch((error) => {
                res.status(500).send(error);
            });
        }
    });
    
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
                    skippable: false,
                    canGoBack: false,
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
                let name_no_spaces = name.replace(/\s/g, '');
                const constructedDisplayName = name.replace(/\s/g, '') + ' ' + surname.replace(/\s/g, '');
                firebaseAdmin.auth().updateUser(uid, {
                    displayName: JSON.stringify({
                        "nameAndSurname": {
                            "name": name.replace(/\s/g, ''),
                            "surname": surname.replace(/\s/g, ''),
                            "displayName": constructedDisplayName
                        }
                    }),
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
                    skippable: false,
                    canGoBack: true,
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
                    skippable: false,
                    canGoBack: true,
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
                    skippable: true,
                    canGoBack: true,
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
            const { photoURL } = req.body;
            user_profile.update({
                CreationInstance: targetCreatioInstance,
                Photo: photoURL,
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    firebaseAdmin.auth().updateUser(uid, {
                        photoURL: photoURL,
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

    app.get('/profile/creation/phone', (req, res) => {
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
                    action: 'Ingresá tu número de teléfono',
                    actionRawName: 'phone',
                    sendDataPath: 'phone',
                    skippable: true,
                    canGoBack: true,
                });
            }
        }
    });

    app.post('/profile/creation/phone', (req, res) => {
        const libphonenumber = require('libphonenumber-js');
        const creationInstance = res.locals.creationInstance;
        let targetCreatioInstance = 5;
        const allowedInstance = 4;
        if (allowedInstance === creationInstance) {
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            const { phone_number, phone_country_code, phone_country_iso } = req.body;
            user_profile.update({
                CreationInstance: targetCreatioInstance,
                Contact:{
                    Phone: phone_number,
                    PhoneCountryCode: phone_country_code,
                    PhoneCountryISO: phone_country_iso,

                }
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/profile/creation/email' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }

    });

    app.get('/profile/creation/short-description', (req, res) => {
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
                    action: 'Describí tu perfil brevemente',
                    actionRawName: 'short-description',
                    sendDataPath: 'short-description',
                    skippable: false,
                    canGoBack: true,
                });
            }
        }
        
    });
    app.post('/profile/creation/short-description', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        const accType = res.locals.accType;
        const accTypeNum = accType.TypeNum;
        let targetCreationInstance;
        accTypeNum === 1 ? targetCreationInstance = 8 : targetCreationInstance = 6;
        const allowedInstance = 5;
        if (allowedInstance === creationInstance) {
            const { short_description } = req.body;
            console.log(short_description.length);
            if(short_description.length <= 141){
                const uid = res.locals.user.uid;
                const db = firebaseAdmin.database();
                const user_profile = db.ref(`Users/${uid}/PublicRead`);
                user_profile.update({
                    CreationInstance: targetCreationInstance,
                    ShortDescription: short_description,
                }, (error) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ error: error });
                    } else {
                        res.status(200).send({ redirectRoute: '/profile/creation/long-description' });
                    }
                });
            }else{
                res.status(413).send('La descripción es demasiado larga');
            }
            
        } else {
            res.status(401).send('Not authorized');
        }
    });
    
    app.get('/profile/creation/web-site', (req, res) => {
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
                    action: 'Ingresá tu página web',
                    actionRawName: 'web-site',
                    sendDataPath: 'web-site',
                    skippable: true,
                    canGoBack: true,
                });
            }
        }
    });
    app.post('/profile/creation/web-site', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        const accType = res.locals.accType;
        const accTypeNum = accType.TypeNum;
        let targetCreationInstance = 7;
        const allowedInstance = 6;
        if (allowedInstance === creationInstance) {
            const { web_site } = req.body;
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            user_profile.update({
                CreationInstance: targetCreationInstance,
                WebSite: web_site,
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/profile/creation/social-networks' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }
    })
    app.get('/profile/creation/social-media', (req, res) => {
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
                    action: 'Ingresá tus redes sociales',
                    actionRawName: 'social-media',
                    sendDataPath: 'social-media',
                    skippable: true,
                    canGoBack: true,
                });
            }
        }
    });
    app.post('/profile/creation/social-media', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        const accType = res.locals.accType;
        const accTypeNum = accType.TypeNum;
        let targetCreationInstance = 8;
        const allowedInstance = 7;
        if (allowedInstance === creationInstance) {
            const { instagram_user, facebook_user, twitter_user } = req.body;
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            user_profile.update({
                CreationInstance: targetCreationInstance,
                SocialMedia: {
                    Instagram: instagram_user,
                    Facebook: facebook_user,
                    Twitter: twitter_user,
                },
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/profile/creation/interests' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }
    });
    app.get('/profile/creation/terms-and-conditions', (req, res) => {
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
                    action: 'Aceptá los términos y condiciones',
                    actionRawName: 'terms-and-conditions',
                    sendDataPath: 'terms-and-conditions',
                    skippable: false,
                    canGoBack: true,
                });
            }
        }
    });
    app.post('/profile/creation/terms-and-conditions', (req, res) => {
        const creationInstance = res.locals.creationInstance;
        const accType = res.locals.accType;
        const accTypeNum = accType.TypeNum;
        let targetCreationInstance = 9;
        const allowedInstance = 8;
        if (allowedInstance === creationInstance) {
            const { accepted } = req.body;
            const uid = res.locals.user.uid;
            const db = firebaseAdmin.database();
            const user_profile = db.ref(`Users/${uid}/PublicRead`);
            user_profile.update({
                CreationInstance: targetCreationInstance,
                TermsAndConditions: true,
            }, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send({ error: error });
                } else {
                    res.status(200).send({ redirectRoute: '/inicio' });
                }
            });
        } else {
            res.status(401).send('Not authorized');
        }
    });
}

module.exports = { init };