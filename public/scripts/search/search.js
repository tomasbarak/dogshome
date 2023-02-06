function search(text, filters={}) {
    text = String(text).trim();
    if(text == "") {
        return;
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
            console.log(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }
}