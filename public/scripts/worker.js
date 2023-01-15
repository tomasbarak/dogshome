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
    const SERVER_URL = 'https://notifications.dogshome.com.ar/subscribe'
    console.log(subscription);
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

    const options = {applicationServerKey, userVisibleOnly: true}
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

self.addEventListener('push', function (event) {
    if (event.data) {
        console.log('This push event has data: ', event.data.text());
    } else {
        console.log('This push event has no data.');
    }
});