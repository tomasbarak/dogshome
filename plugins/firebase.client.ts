import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";

export default defineNuxtPlugin(nuxtApp => {
    const firebaseConfig = {
        apiKey: "AIzaSyA-WFc4p_XQHXdCk1kQZviucvtzD_kUl_Q",
        authDomain: "dogshome-6af88.firebaseapp.com",
        databaseURL: "https://dogshome-6af88-default-rtdb.firebaseio.com",
        projectId: "dogshome-6af88",
        storageBucket: "dogshome-6af88.appspot.com",
        messagingSenderId: "41412657640",
        appId: "1:41412657640:web:a82615bcd2aa558bb2e45d",
        measurementId: "G-VNN34TGQD9"
    };

    const app = initializeApp(firebaseConfig);

    const analytics = getAnalytics(app);
    const auth: Auth = getAuth(app);

    return {
        provide: {
            auth,
        }
    }

    nuxtApp.vueApp.provide('auth', auth);
    nuxtApp.provide('auth', auth);
})