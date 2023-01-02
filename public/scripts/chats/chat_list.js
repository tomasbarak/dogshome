const requestOptions = {
    headers: {
        'Authorization': window.location.hostname == "localhost" ? localStorage.getItem('session') : ""
    },
    withCredentials: window.location.hostname !== 'localhost'
}

const api_host = `https://${window.location.hostname == "localhost" ? "" : "api."}${window.location.hostname}:${window.location.hostname == "localhost" ? "8843" : ''}`;

const Chats = {
    Actions: {
        getShelters: () => {
            return new Promise((resolve, reject) => {
                const url = `${api_host}/chat/shelters`
                axios.get(url, requestOptions).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            });
        },
        getChatsByShelter: (shelter_id) => {
            return new Promise((resolve, reject) => {
                const url = `${api_host}/chat/shelter/${shelter_id}`
                axios.get(url, requestOptions).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            })
        }
    },
    UI: {
        addShelterItemToList: ({
            shelter_id,
            shelter_name,
            shelter_photo
        }) => {
            const shelterContainer = document.createElement('div');
            shelterContainer.className = "shelter-list-item-container";
            shelterContainer.id = shelter_id;

            const shelterImage = document.createElement('img');
            shelterImage.className = "shelter-list-item-image";
            shelterImage.src = shelter_photo ? shelter_photo : "https://dogshome.com.ar/profile/image/uploaded/default-user-image.png";

            const shelterInfoContainer = document.createElement("div");
            shelterInfoContainer.className = "shelter-list-item-info-container";

            const shelterName = document.createElement('h1');
            shelterName.className = "shelter-list-item-name";
            shelterName.innerText = shelter_name;

            const toggleButtonContainer = document.createElement('div');
            toggleButtonContainer.className = "shelter-list-item-toggle-button-container";

            const toggleButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            toggleButton.className = "shelter-list-item-toggle-button";
            toggleButton.setAttribute('viewBox', '0 0 24 24');
            toggleButton.setAttribute('width', '24');
            toggleButton.setAttribute('height', '24');

            const toggleButtonPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            toggleButtonPath.setAttribute('d', "M5.22 8.72a.75.75 0 011.06 0L12 14.44l5.72-5.72a.751.751 0 011.042.018.751.751 0 01.018 1.042l-6.25 6.25a.75.75 0 01-1.06 0L5.22 9.78a.75.75 0 010-1.06z")

            toggleButton.appendChild(toggleButtonPath);
            toggleButtonContainer.appendChild(toggleButton);

            shelterInfoContainer.appendChild(shelterImage);
            shelterInfoContainer.appendChild(shelterName);
            shelterInfoContainer.appendChild(toggleButtonContainer);
            shelterContainer.appendChild(shelterInfoContainer);
            const chatList = document.getElementById('shelter-list-container');
            chatList.appendChild(shelterContainer);
            $(chatList).on("swipeleft", function (e) {
                console.log(e);
                alert("swipeleft");
            })

            const chatsContainer = document.createElement('div');
            chatsContainer.className = "shelter-list-item-chats-container invisible";
            chatsContainer.id = `chats-container-${shelter_id}`;
            shelterContainer.appendChild(chatsContainer);

            shelterContainer.appendChild(chatsContainer);

            shelterInfoContainer.onclick = function () {
                const chatsContainer = document.getElementById(`${shelter_id}`);
                const toggleBtnContainer = document.getElementById(`${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container")[0] || document.getElementById(`${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container toggled")[0];
                const chatListContainerToggled = document.getElementById(`chats-container-${shelter_id}`);
                if (chatsContainer.className.includes("toggled")) {
                    chatsContainer.className = "shelter-list-item-container";
                    toggleBtnContainer.className = "shelter-list-item-toggle-button-container";
                } else {
                    let extendedHeight = chatListContainerToggled.scrollHeight;
                    document.querySelector(":root").style.setProperty(`--${shelter_id}-extended-height`, `${extendedHeight + 60}px`);
                    document.styleSheets[14].insertRule(`#${shelter_id}.toggled {max-height: var(--${shelter_id}-extended-height); transition: max-height 0.75s ease;}`)
                    chatsContainer.className = "shelter-list-item-container toggled";
                    toggleBtnContainer.className = "shelter-list-item-toggle-button-container toggled";

                }
            }
        },
        addChatToShelterList: (chat, chatsContainer) => {
            const chatContainer = document.createElement('div');
            chatContainer.className = "shelter-list-item-chat-container";
            chatContainer.id = chat.chat_id;

            const chatImage = document.createElement('img');
            chatImage.className = "shelter-list-item-chat-image";
            chatImage.src = chat.chat_photo ? chat.chat_photo : "https://dogshome.com.ar/profile/image/uploaded/default-user-image.png";

            const chatInfoContainer = document.createElement("div");
            chatInfoContainer.className = "shelter-list-item-chat-info-container";

            const chatName = document.createElement('h1');
            chatName.className = "shelter-list-item-chat-name";
            chatName.innerText = chat.chat_name;

            const chatLastMessage = document.createElement('p');
            chatLastMessage.className = "shelter-list-item-chat-last-message";
            chatLastMessage.innerText = chat.lastMessage;

            chatInfoContainer.appendChild(chatName);
            chatInfoContainer.appendChild(chatLastMessage);
            chatContainer.appendChild(chatImage);
            chatContainer.appendChild(chatInfoContainer);
            chatsContainer.appendChild(chatContainer);
        }
    }
}