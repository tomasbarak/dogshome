const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

const saveSubscription = async subscription => {
    const SERVER_URL = `https://notifications.${self.location.hostname}/subscribe`;
    const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription),
        withCredentials: true,
        credentials: 'include'
    }).catch(err => console.error(err))
    return response.json()
}

self.addEventListener('activate', async () => {
    const applicationServerKey = urlB64ToUint8Array("BIuQZD7wIPWept54SFP6hRxlv0rvFlkJaqcfPmZrqElOuAGxm98RGs5QBLnIPtkZWD-d2WnACiyfJaN-5jwcYrE");
    console.log(applicationServerKey);

    const options = { applicationServerKey, userVisibleOnly: true }
    console.log(options);

    self.registration.pushManager.subscribe(options).then(subscription => {
        console.log(subscription);
        saveSubscription(subscription).then(response => {
            console.log(response);
        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        console.error(err);
    });
});

const showLocalNotification = (title, body, icon, url, swRegistration) => {
    const options = {
        body: body,
        icon: icon,
        badge: "https://dogshome.com.ar/images/DogsHomeLogo-ReDesign%20(Colorified&Final).png",
        url: url,
    }

    swRegistration.showNotification(title, options);
}

async function checkClientIsVisible() {
    const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
    });

    for (var i = 0; i < windowClients.length; i++) {
        if (windowClients[i].visibilityState === "visible") {
            return true;
        }
    }

    return false;
}

self.addEventListener('push', function (event) {
    if (event.data) {
        const jsonData = JSON.parse(event.data.json());
        checkClientIsVisible().then(isVisible => {
            if (!isVisible) {
                showLocalNotification(jsonData.title, jsonData.body, jsonData.icon, jsonData.url, self.registration);
            }
        }).catch(err => {
            console.error(err);
        });
    } else {
        console.log('This push event has no data.');
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    console.log(event.notification);
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        for (const client of clientList) {
            if (client.url === event.notification.url && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow(event.notification.url);
    }));
});