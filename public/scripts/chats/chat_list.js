const requestOptions = {
    headers: {
        'Authorization': window.location.hostname == "localhost" ? localStorage.getItem('session') : ""
    },
    withCredentials: window.location.hostname !== 'localhost'
}

const api_host = `https://${window.location.hostname == "localhost" ? "" : "api."}${window.location.hostname}:${window.location.hostname == "localhost" ? "8843" : ''}`;

let current_chat_id = null;
let current_shelter_id = null;
let current_page = 1;

const Chats = {
    Actions: {
        toggleSidebar: () => {
            document.getElementById("chat-list").classList.toggle("toggled");
            document.getElementById("chat-list-toggle-btn-container").classList.toggle("toggled");
        },
        openSidebar: () => {
            document.getElementById("chat-list").classList.remove("toggled");
            document.getElementById("chat-list-toggle-btn-container").classList.remove("toggled");
        },
        closeSidebar: () => {
            document.getElementById("chat-list").classList.add("toggled");
            document.getElementById("chat-list-toggle-btn-container").classList.add("toggled");
        },
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
        },
        getChatMessages: (shelter_id, chat_id, page) => {
            return new Promise((resolve, reject) => {
                const url = `${api_host}/chat/shelter/${shelter_id}/publication/${chat_id}/page/${page}`
                axios.get(url, requestOptions).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            })
        },
    },
    Events: {
        onChatClick: (shelter_id, chat_id, shelter_name, shelter_photo, chat_title, chat_photo) => {
            Chats.UI.setChatHeader(shelter_photo, shelter_name, chat_photo, chat_title);
            Chats.Actions.closeSidebar();
            document.getElementById("chat-header-inf").className = "";
            current_chat_id = chat_id;
            current_shelter_id = shelter_id;
            current_page = 1;
            document.getElementById("chat-loading-container").className = "visible";
            Chats.Actions.getChatMessages(shelter_id, chat_id).then((messages) => {
                const chatNotSelected = document.getElementById("chat-not-selected");
                chatNotSelected.classList.add("invisible");
                //Change created_at to date
                const msgContainer = document.getElementById('chat-content');
                msgContainer.innerHTML = "";
                messages.forEach((message) => {
                    message["shelter_photo"] = shelter_photo;
                    const i = messages.indexOf(message);
                    const previous_msg = messages[i + 1];
                    console.log(message, previous_msg);
                    Chats.UI.addMessageToChat(message, msgContainer, previous_msg == undefined ? {} : previous_msg);
                });
                
                document.getElementById("chat-loading-container").className = "invisible";
                document.getElementById("chat-footer").className = "";

                console.log(messages);
            }).catch((error) => {
                console.log(error);
            });
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

            chatContainer.addEventListener('click', () => {
                Chats.Events.onChatClick(chat.shelter_id, chat.chat_id, chat.shelter_name, chat.shelter_photo, chat.chat_name, chat.chat_photo);
            });
        },
        setChatHeader: (shelter_photo, shelter_name, chat_photo, chat_name) => {
            const chatHeader = document.getElementById("chat-header-inf");
            const chatShelterImage = document.getElementById("chat-header-inf-shelter-img");
            const chatShelterName = document.getElementById("chat-header-inf-shelter-name");
            const chatImage = document.getElementById("chat-header-inf-chat-img");
            const chatName = document.getElementById("chat-header-inf-chat-title");

            chatShelterImage.src = shelter_photo || "https://dogshome.com.ar/profile/image/uploaded/default-user-image.png";
            chatShelterName.innerText = shelter_name;
            chatImage.src = chat_photo;
            chatName.innerText = chat_name;
        },

        addMessageToChat: (message, chatContainer, previous_msg) => {
            console.log(previous_msg.user_id !== message.user_id)
            const isSender = message.user_id === message.sender_id;

            const contentContainer = document.createElement('div');
            contentContainer.id = message.created_at;
            contentContainer.className = isSender ? "chat-content-message-container sent" : "chat-content-message-container received";

            if(!isSender && previous_msg.sender_id !== message.sender_id){
                const messageImage = document.createElement('img');
                messageImage.className = "chat-content-message-image";
                messageImage.src = message.shelter_photo || "https://dogshome.com.ar/profile/image/uploaded/default-user-image.png";
                contentContainer.appendChild(messageImage);
            } else {
                const emptyImageContainer = document.createElement('div');
                emptyImageContainer.className = "chat-content-message-empty-image";
                contentContainer.appendChild(emptyImageContainer);
            }

            const messageContainer = document.createElement('div');
            messageContainer.className = "chat-message-container";

            const messageText = document.createElement('p');
            messageText.className = "chat-content-message-text";
            messageText.innerText = message.text;

            const messageTimestamp = document.createElement("a")
            messageTimestamp.className = "chat-content-message-timestamp";
            let date = new Date(message.created_at);
            //If the message was sent today, show the time, otherwise show the date
            messageTimestamp.innerText = date.toLocaleTimeString([], {
                hour: '2-digit', 
                minute:'2-digit', 
                timeZone: 'America/Argentina/Buenos_Aires',
                hour12: false
            })
            // + " " + date.toLocaleDateString('es-AR', {
            //     day: '2-digit',
            //     month: '2-digit',
            //     year: '2-digit',
            //     timeZone: 'America/Argentina/Buenos_Aires'
            // });
            
            messageContainer.appendChild(messageText);
            messageContainer.appendChild(messageTimestamp);
            contentContainer.appendChild(messageContainer);
            chatContainer.appendChild(contentContainer);
        }
    }
}