const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

function config(app, firebaseApp, database, firebaseadmin){
    //API routes
    require( appDir + '/src/api/routes/uploadImage')                    .init(app, firebaseadmin, database, firebaseApp);
    require( appDir + '/src/api/routes/accountProfile')                 .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/accountStats')                   .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/allPublications')                .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/publicationById')                .init(app, firebaseApp, database);
    require( appDir + '/src/api/routes/accountDisplayName')             .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/accountPhotoUrl')                .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/getImage')                       .init(app);

    //WebPage routes
    require( appDir + '/src/api/routes/webPage/index')                  .init(app, firebaseadmin, firebaseApp, database);
    require( appDir + '/src/api/routes/webPage/profile')                .init(app, database, firebaseadmin, firebaseApp);
    require( appDir + '/src/api/routes/webPage/createSession')          .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/signin')                 .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/signout')                .init(app);

    //Github changes listener
    require( appDir + '/src/api/listeners/githubPushListener')          .listen(app);
}

module.exports = {config};