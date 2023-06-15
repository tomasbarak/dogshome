const { connect } = require('http2');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = `mongodb://${process.env.DATABASE_HOST}:27017/dogshome`;
const mongoDBName = 'dogshome';

function init(app) {

    app.get(['/perfil/lista/favoritos', '/perfil/lista/favoritos.html', '/profile/list/favorites', '/profile/list/favorites.html'], (req, res) => {
            const isPrivate = res.locals.isPrivate;
            const isVerified = res.locals.isVerified;
            const user = res.locals.user || {};
            if(isPrivate || !isVerified){
                res.render(appDir + '/public/404', {
                    errorCode: "404",
                    errorMessage: "Página no encontrada",
                });
            }else{
                const userId = sanitize(req.params.u || user.uid || ' ');

                let parsedDisplayName = JSON.parse(user.name);
                res.render(appDir + '/public/favorites.ejs',{
                    uid: userId,
                    displayName: parsedDisplayName.nameAndSurname.displayName,
                    photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                    isPrivate:      isPrivate,
                    locals: {
                        active: 5,
                        navButtons: [
                            {name: 'Inicio', href: '/'},
                            {name: 'Alertas', href: '/alertas'}
                        ],
                        userData: res.locals.userData,
                        dropdownActive: 3,
                    }
                })
            }
            
    });
}

module.exports = { init };