import admin from 'firebase-admin'
import { getApps } from 'firebase-admin/app'

export default function useFirebaseAdmin() {
    let app;

    if (getApps().length === 0) {
        app = admin.initializeApp({
            credential: admin.credential.cert('./certs/firebase/firebase-adminsdk.json'),
            databaseURL: "https://dogshome-6af88-default-rtdb.firebaseio.com"
        }, "admin-app");
    } else {
        app = getApps()[0];
    }
    
    return app;
}