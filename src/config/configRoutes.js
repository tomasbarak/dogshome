
function config(app, firebaseApp, database, firebaseadmin){
    require('../api/routes/accountProfile').init(app, firebaseApp, database);
    require('../api/routes/accountStats').init(app, firebaseApp, database);
    require('../api/routes/allPublications').init(app, firebaseApp, database);
    require('../api/routes/accountDisplayName').init(app, firebaseadmin);
    require('../api/routes/accountPhotoUrl').init(app, firebaseadmin);
    require('../api/routes/publicationById').init(app, firebaseadmin);
}
module.exports = {config};