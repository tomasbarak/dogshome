const { connect } = require('http2');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app) {

    app.get(['/perfil/lista/borradores', '/perfil/lista/borradores.html', '/profile/list/drafts', '/profile/list/drafts.html'], (req, res) => {
            const isPrivate = res.locals.isPrivate;
            const isVerified = res.locals.isVerified;
            const user = res.locals.user || {};
            if(isPrivate || !isVerified){
                res.render(appDir + '/public/404', {
                    errorCode: "404",
                    errorMessage: "Página no encontrada",
                });
            }else{
                connectClient(mongoURL).then(client => {
                    const userId = sanitize(req.params.u || user.uid || ' ');

                    const mongoDB = client.db(mongoDBName);
                    const draftsCollection = mongoDB.collection('PublicationDrafts');
                    let requestProjection = { _id: 0 };
                    let requestQuery = { RefId: userId };

                    getMany(draftsCollection, requestProjection, requestQuery).then((snapshot) => {
                        let parsedDisplayName = JSON.parse(user.name);
                        res.render(appDir + '/public/view-drafts.ejs',{
                            drafts: snapshot,
                            uid: userId,
                            displayName: parsedDisplayName.nameAndSurname.displayName,
                            photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                            isPrivate:      isPrivate,
                            locals: {
                                active: 4,
                                navButtons: [
                                    {name: 'Inicio', href: '/'},
                                    {name: 'Alertas', href: '/alertas'}
                                ],
                                userData: res.locals.userData,
                                dropdownActive: 2,
                            }
                        })
                        client.close();
                    }).catch(err => {
                        console.log(err);
                        client.close();
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).send(err);
                });

            }
            
    });
}

module.exports = { init };