

async function signOut() {

    const getPushSubscription = async () => {
        //check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            throw new Error('No Service Worker support!');
        }
        if (!('PushManager' in window)) {
            throw new Error('No Push API Support!');
        }
        //check if permission is granted
        const permission = window.Notification.permission;
        if (permission !== 'granted') {
            throw new Error('Permission not granted for Notification');
        }
    
        //register service worker
        const registrations = await navigator.serviceWorker.getRegistrations() ;
        //Check if there is any registration
        if (registrations.length === 0) {
            throw new Error('No Service Worker is registered!');
        }
        const registration = registrations[0];
        //get subscription
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            return subscription;
        } else {
            return null;
        }
    }

    const headers = { 'Content-Type': 'application/json' }

    try {
        const subscription = await getPushSubscription();
        const endpoint = subscription ? subscription.endpoint : null;
        
        const body = { pushEndpoint: endpoint }

        axios.post(`https://api.${window.location.hostname}/auth/logout`, body, {
            headers: headers,
            withCredentials: true
        }).then(() => {
            window.location.href = '/login';
        }).catch(function (error) {
            console.log(error);
        });
    } catch (err) {
        const body = { pushEndpoint: null }

        axios.post(`https://api.${window.location.hostname}/auth/logout`, body, {
            headers: headers,
            withCredentials: true
        }).then((response) => {
            window.location.href = '/login';
        }).catch(function (error) {
            console.log(error);
        });
    }
    
}

function deleteAllFlags() {
    localStorage.clear()
}