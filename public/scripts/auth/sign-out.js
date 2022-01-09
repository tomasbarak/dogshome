function signOut() {
    axios.post("/signout", {}).then(function (response) {
        window.location.href = "/signin";
    })
}

function deleteAllFlags() {
    localStorage.clear()
}