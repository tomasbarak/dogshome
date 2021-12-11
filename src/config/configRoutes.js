const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

function config(app, firebaseApp, database, firebaseadmin){
    
    require( appDir + '/src/api/routes/accountProfile')         .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/accountStats')           .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/allPublications')        .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/publicationById')        .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/accountDisplayName')     .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/uploadImage')            .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/accountPhotoUrl')        .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/mainRoute')              .init(app);
    require( appDir + '/src/api/routes/getImage')               .init(app);
    require( appDir + '/src/api/listeners/githubPushListener')  .listen(app);
}

module.exports = {config};