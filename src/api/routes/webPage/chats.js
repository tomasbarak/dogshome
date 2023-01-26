const { dirname } =                         require('path');
const appDir =                              dirname(require.main.filename);
const { connectClient, getMany, 
        getOne, getAllCollection, 
        saveOne, saveMany,
        deleteOne, deleteMany, sanitize, getManyWithLimit } =           require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL =                            'mongodb://localhost:27017/dogshome';
const mongoDBName =                         'dogshome';

function init(app, firebasAdmin) {
    app.get(['/chat', '/chat.html', '/chats', 'chats.html'], (req, res) => {
        const isPrivate =       res.locals.isPrivate;
        const isVerified =      res.locals.isVerified;
        const user =            res.locals.user || {};

        connectClient(mongoURL).then(client => {
            const mongoDB =         client.db(mongoDBName);
            if(isPrivate || !isVerified){
                res.render(appDir + '/public/404', {
                    errorCode: "404",
                    errorMessage: "Página no encontrada",
                });
            } else if (!isVerified) {
                res.redirect('/verification');
                client.close();
            } else{
                let name =                          user.name || '{}';
                let parsedDisplayName =             JSON.parse(name);
                const nameAndSurname =              parsedDisplayName.nameAndSurname || {};
                const nameAndSurname_name =         nameAndSurname.name || ' ';
                const nameAndSurname_surname =      nameAndSurname.surname || ' ';
                const nameAndSurname_fullName =     nameAndSurname.displayName || ' ';
                res.render(appDir + '/public/chats', {
                    uid:            user.user_id,
                    displayName:    nameAndSurname_fullName || ' ',
                    name:           nameAndSurname_name || ' ',
                    surname:        nameAndSurname_surname || ' ',
                    photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                    isPrivate:      false,
                    locals: {
                        active: 6,
                        dropdownActive: 4,
                        navButtons: [
                            {name: 'Inicio', href: '/'},
                            {name: 'Alertas', href: '/alerts'},
                        ],
                        userData: res.locals.userData,
                    },
                });
                client.close();

            }
        }).catch(err => {
            console.log(err);
            client.close();
        });
    });
}

module.exports = { init };