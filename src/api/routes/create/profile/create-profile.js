const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, database, firebaseAdmin, firebaseApp){
    app.get('/profile/creation/start', (req, res) => {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const creationInstance = res.locals.creationInstance;
        const user =            res.locals.user || {};
        console.log('isPrivate', isPrivate);
        if(!isPrivate){
            if(isVerified){
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
        }else{
            res.status(401).send({ error: `Cant verify token: ${req.cookies.session}` });
        }
    });
    app.post('/profile/creation/start', (req, res) => {
        let {name, surname} = req.body;
        const { uid } = res.locals.user;
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
            if(error){
                console.log(error);
                res.status(500).send({ error: error });
            }else{
                res.redirect('/profile/creation/profile-type');
            }
        });
    });
}

module.exports = { init };