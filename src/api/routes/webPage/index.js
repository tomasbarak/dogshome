const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const axios = require('axios');

function init(app, firebaseAdmin, firebaseApp, database) {
    //Setting up index route
    app.get(['/', '/index', '/index.html', '/inicio'], (req, res) => {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const user =            res.locals.user || {};

        const db =              database.getDatabase(firebaseApp);
        const recentPostsRef =  database.query(database.ref(db, 'Publications/All'), database.limitToLast(50));
        const get =             database.get;

        get(recentPostsRef).then((snapshot) => {
            var json_data =     snapshot.val();
            const result =      createArrayFromJson(json_data);

            if (isPrivate) {
                res.render(appDir + '/public/index', {
                    uid: '',
                    displayName: 'Cuenta Privada',
                    name: 'Cuenta',
                    surname: 'Privada',
                    photoUrl: 'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                    publications: result,
                    isPrivate: true
                });
            } else if (isVerified) {

                let name =                          user.name || '{}';
                console.log('name', name);
                let parsedDisplayName =             JSON.parse(name);
                const nameAndSurname =              parsedDisplayName.nameAndSurname || {};
                const nameAndSurname_name =         nameAndSurname.name || ' ';
                const nameAndSurname_surname =      nameAndSurname.surname || ' ';
                const nameAndSurname_fullName =     nameAndSurname.displayName || ' ';

                res.render(appDir + '/public/index', {
                    uid: user.user_id,
                    displayName: nameAndSurname_fullName || ' ',
                    name: nameAndSurname_name || ' ',
                    surname: nameAndSurname_surname || ' ',
                    photoUrl: user.picture,
                    publications: result,
                    isPrivate: false
                });
            } else if (!isVerified) {
                res.redirect('/verification');
            }
        }).catch((error) => {
            console.log(error);
            res.status(500).send(error);
        });

    });
    function createArrayFromJson(json_data) {
        var result = [];

        for (var i in json_data) {
            result.push([json_data[i]]);
        }
        return result;
    }
}

module.exports = { init };