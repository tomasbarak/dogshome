function search(text, filters = {}) {
    return new Promise((resolve, reject) => {
        text = String(text).trim();
        if (text == "") {
            reject("No se ha ingresado ningún texto para buscar");
        } else {
            axios.post(`https://api.${window.location.hostname}/search`, {
                query: text,
                filters: filters,
                page: 1
            }, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then((response) => {
                resolve(response.data);
            }).catch((error) => {
                reject(error);
            });
        }
    });
}