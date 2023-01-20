let notifications = {};
async function openDB(callback) {
    // ask to open the db
    const openRequest = self.indexedDB.open(dbName, version);
     
    openRequest.onerror = function (event) {
      console.log(
        "Everyhour isn't allowed to use IndexedDB?!" + event.target.errorCode
      );
    };
    
    // upgrade needed is called when there is a new version of you db schema that has been defined
    openRequest.onupgradeneeded = function (event) {
      db = event.target.result;
  
      if (!db.objectStoreNames.contains(storeName)) {
        // if there's no store of 'storeName' create a new object store
        db.createObjectStore(storeName, { keyPath: "key" }); //some use keyPath: "id" (basically the primary key) - unsure why yet
      }
    };
    
    openRequest.onsuccess = function (event) {
      db = event.target.result;
      if (callback) {
        callback();
      }
    };
  }
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
    return response;
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

const showLocalNotification = (title, body, icon, url, tag, swRegistration) => {
    const options = {
        body: body,
        icon: icon,
        badge: "https://dogshome.com.ar/images/DogsHomeLogo-ReDesign%20(Colorified&Final).png",
        data: {
            url: url
        },
        tag: tag,
        renotify: true
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
                console.log(jsonData.tag, notifications[jsonData.tag])
                if(notifications[jsonData.tag] !== undefined && notifications[jsonData.tag].length > 0){
                    notifications[jsonData.tag].push(jsonData.body);
                } else {
                    notifications[jsonData.tag] = [jsonData.body];
                }

                const body = notifications[jsonData.tag].join('\n');

                showLocalNotification(jsonData.title, jsonData.body, jsonData.icon, jsonData.url, jsonData.tag, self.registration);
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
            return clients.openWindow(event.notification.data.url);
    }));
});

const updateSubscription = async subscription => {
    const SERVER_URL = `https://notifications.${self.location.hostname}/update-subscription`;
    const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            old_subscription: subscription.oldSubscription,
            new_subscription: subscription.newSubscription
        }),
        withCredentials: true,
        credentials: 'include'
    }).catch(err => console.error(err))
    return response.json()
}
    

self.addEventListener("pushsubscriptionchange", function (event) {
    console.log("[Service Worker]: 'pushsubscriptionchange' event fired.");
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array("BIuQZD7wIPWept54SFP6hRxlv0rvFlkJaqcfPmZrqElOuAGxm98RGs5QBLnIPtkZWD")
        })
        .then(function (newSubscription) {
            console.log("[Service Worker]: New subscription: ", newSubscription);
            return saveSubscription(newSubscription);
        })
    );
});