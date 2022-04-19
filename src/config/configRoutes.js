/*
 *  FILE USED TO INITIALIZE ALL APP ROUTES 
 */

const { dirname } =     require('path');
const appDir =          dirname(require.main.filename);

function config(app, firebaseadmin){
    //API routes
    require( appDir + '/src/api/routes/uploadImage')                    .init(app);
    require( appDir + '/src/api/routes/accountProfile')                 .init(app);
    require( appDir + '/src/api/routes/accountStats')                   .init(app);
    require( appDir + '/src/api/routes/allPublications')                .init(app);
    require( appDir + '/src/api/routes/publicationById')                .init(app);
    require( appDir + '/src/api/routes/accountDisplayName')             .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/email/sendVerification')         .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/accountPhotoUrl')                .init(app, firebaseadmin);
////require( appDir + '/src/api/routes/verifyEmail')                    .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/getImage')                       .init(app);
    require( appDir + '/src/api/generateApiToken')                      .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/publicationDraft')               .init(app);

    //WebPage routes
    require( appDir + '/src/api/routes/webPage/index')                  .init(app);
    require( appDir + '/src/api/routes/webPage/profile')                .init(app);
    require( appDir + '/src/api/routes/webPage/publication')            .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/create/profile/create-profile')  .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/manageSession')          .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/signin')                 .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/signup')                 .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/verification')           .init(app, firebaseadmin);
    require( appDir + '/src/api/routes/webPage/signout')                .init(app);
    require( appDir + '/src/api/routes/webPage/createPublication')      .init(app);
    require( appDir + '/src/api/routes/webPage/viewDrafts')             .init(app);


    //Github changes listener
    require( appDir + '/src/api/listeners/githubPushListener')          .listen(app);
}

module.exports = {config};