import {  } from 'firebase-admin';

export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('session').value;
    console.log(token);
    // const { $adminApp } = useNuxtApp();
    
})