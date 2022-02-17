const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { connectClient, getMany,
    getOne, getAllCollection,
    saveOne, saveMany,
    deleteOne, deleteMany, sanitize } = require(appDir + '/src/api/mongodbFunctions.js');
const mongoURL = 'mongodb://localhost:27017/dogshome';
const mongoDBName = 'dogshome';

function init(app){
    app.get(['/create/publication', '/create/publication.html', '/crear/publicacion', '/crear/publicacion.html'], (req, res) => {
        res.render(appDir + '/public/create-publication');
        dogshome.createUser({
            user: 'barak', 
            pwd: '!Aj9WdkbA$1W', 
            roles: [{role: 'readWrite', db: 'dogshome'}]
        })
    });
}

module.exports = {init};