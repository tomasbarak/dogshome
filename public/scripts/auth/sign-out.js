function signOut() {
    axios.post("/sessionLogout").then(function (response) {
        window.location.href = "/signin";
    })
}

function deleteAllFlags() {
    localStorage.clear()
}