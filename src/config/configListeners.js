
function config(app, firebaseApp, database, firebaseadmin){
    require('../api/listeners/publicationCreationListener').listen(firebaseApp, database);
}
module.exports = {config};