function signOut() {
    const getPushEndpoint = () => {
        //Check if browser supports service workers
        return new Promise((resolve, reject) => {
            if ('serviceWorker' in navigator) {
                //Check if browser supports push notifications
                if (Notification.permission === 'granted') {
                    //If it's okay let's create a notification
                    navigator.serviceWorker.getRegistrations().then(function (regs) {
                        regs[0].pushManager.getSubscription().then(function (subscription) {
                            if (subscription) {
                                resolve(subscription.endpoint);
                            } else {
                                resolve(null);
                            }
                        });
                    }).catch(err => {
                        reject(err);
                    })
                }
            }
        });
    }

    getPushEndpoint().then((endpoint) => {

        const body = { pushEndpoint: endpoint }
        const headers = { 'Content-Type': 'application/json' }

        axios.post("/sessionLogout", body, {
            headers: headers
        }).then(function (response) {
            window.location.href = "/signin";
        })
    }).catch(err => {
        console.log(err);
    });
}

function deleteAllFlags() {
    localStorage.clear()
}