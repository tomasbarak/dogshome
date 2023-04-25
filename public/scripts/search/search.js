function search(text, filters = {}) {
    return new Promise((resolve, reject) => {
        text = text || "";
        axios.post(`https://api.${window.location.hostname}/search`, {
            query: text !== "" ? text : '',
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
    });
}