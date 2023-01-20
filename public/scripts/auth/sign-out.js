

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

    try {
        const subscription = await getPushSubscription();
        if (subscription) {
            const endpoint = subscription.endpoint;
            const body = { pushEndpoint: endpoint }
            const headers = { 'Content-Type': 'application/json' }
    
            axios.post("/sessionLogout", body, {
                headers: headers
            }).then(function (response) {
                window.location.href = "/signin";
            })
        } else {
            const body = { pushEndpoint: null }
            const headers = { 'Content-Type': 'application/json' }

            axios.post("/sessionLogout", body, {
                headers: headers
            }).then(function (response) {
                window.location.href = "/signin";
            });
        }
    } catch (err) {
        const headers = { 'Content-Type': 'application/json' }

        axios.post("/sessionLogout", {}, {
            headers: headers
        }).then(function (response) {
            window.location.href = "/signin";
        });
    }
    
}

function deleteAllFlags() {
    localStorage.clear()
}