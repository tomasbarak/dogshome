const { dirname } =                         require('path');
const appDir =                              dirname(require.main.filename);
const { connectClient, getMany, 
        getOne, getAllCollection, 
        saveOne, saveMany,
        deleteOne, deleteMany, sanitize, getManyWithLimit } =           require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL =                            `mongodb://${process.env.DATABASE_HOST}:27017/dogshome`;
const mongoDBName =                         'dogshome';

function init(app) {
    //Setting up index route
    app.get(['/alertas', '/alertas.html', '/alerts.html', '/alerts'], (req, res) => {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const user =            res.locals.user || {};

        connectClient(mongoURL).then(client => {
            const mongoDB =         client.db(mongoDBName);

            if (isPrivate) {
                res.render(appDir + '/src/components/alerts', {
                    uid:            '',
                    displayName:    'Cuenta Privada',
                    name:           'Cuenta',
                    surname:        'Privada',
                    photoUrl:       'https://dogshome.com.ar/profile/image/uploaded/default-private-user-image.png',
                    isPrivate:      true,
                    locals: {active: 0}
                });
                client.close();
            } else if (isVerified) {
                let name =                          user.name || '{}';
                let parsedDisplayName =             JSON.parse(name);
                const nameAndSurname =              parsedDisplayName.nameAndSurname || {};
                const nameAndSurname_name =         nameAndSurname.name || ' ';
                const nameAndSurname_surname =      nameAndSurname.surname || ' ';
                const nameAndSurname_fullName =     nameAndSurname.displayName || ' ';
                res.render(appDir + '/src/components/alerts', {
                    uid:            user.user_id,
                    displayName:    nameAndSurname_fullName || ' ',
                    name:           nameAndSurname_name || ' ',
                    surname:        nameAndSurname_surname || ' ',
                    photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                    isPrivate:      false,
                    locals: {
                        active: 1,
                        navButtons: [
                            {name: 'Inicio', href: '/'}
                        ],
                        userData: res.locals.userData,
                    }
                });
                client.close();

            } else if (!isVerified) {
                res.redirect('/verification');
                client.close();
            }
        }).catch(err => {
            console.log(err);
            client.close();
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