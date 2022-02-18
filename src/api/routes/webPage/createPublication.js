const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app){
    app.get(['/create/publication/:draftId/step_one', '/create/publication/:draftId/step_one.html', '/crear/publicacion/:draftId/paso_uno', '/crear/publicacion/:draftId/paso_uno.html'], (req, res) => {
        connectClient(mongoURL).then( (client) => {    
            const draftId = req.params.draftId;
            const isPrivate =       res.locals.isPrivate;
            const isVerified =      res.locals.isVerified;
            const user =            res.locals.user || {};

            let name =                          user.name || '{}';
            let parsedDisplayName =             JSON.parse(name);
            const nameAndSurname =              parsedDisplayName.nameAndSurname || {};
            const nameAndSurname_name =         nameAndSurname.name || ' ';
            const nameAndSurname_surname =      nameAndSurname.surname || ' ';
            const nameAndSurname_fullName =     nameAndSurname.displayName || ' ';

            const mongoDB =             client.db(mongoDBName);
            const collection =          mongoDB.collection('PublicationDrafts');
            let requestProjection =     { _id: 0};
            let requestQuery =          { Id: draftId };

            res.render(appDir + '/public/create-publication', {
                uid:            user.user_id,
                displayName:    nameAndSurname_fullName || ' ',
                name:           nameAndSurname_name || ' ',
                surname:        nameAndSurname_surname || ' ',
                photoUrl:       user.picture || 'https://dogshome.com.ar/profile/image/uploaded/default-user-image.png',
                isPrivate:      isPrivate
            });
        }).catch( (err) => {
            console.log(err);
            res.status(500).send({error: err});
        });
    });
}

module.exports = {init};