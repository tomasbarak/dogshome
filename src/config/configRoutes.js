
function config(app, firebaseApp, database){
    require('../api/routes/accountProfile').init(app, firebaseApp, database);
    require('../api/routes/accountStats').init(app, firebaseApp, database);
}
module.exports = {config};