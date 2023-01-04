function getChatMessages(shelter_id, chat_id) {
    return new Promise((resolve, reject) => {
        const url = `${api_host}/chat/shelter/${shelter_id}/publication/${chat_id}/`
        axios.get(url, requestOptions).then((response) => {
            resolve(response.data);
        }).catch((error) => {
            reject(error);
        });
    })
}