import { initializeApp, credential} from "firebase-admin";

export default defineNuxtPlugin(nuxtApp => {
    const app = initializeApp({
        credential:     credential.cert('./certs/firebase/firebase-adminsdk.json'),
        databaseURL:    "https://dogshome-6af88-default-rtdb.firebaseio.com"
    }, "admin-app");;

    return {
        provide: {
            adminApp: app,
        }
    }

})