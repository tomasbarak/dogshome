const requestOptions = {
    headers: {
        'Authorization': window.location.hostname == "localhost" ? localStorage.getItem('session') : ""
    },
    withCredentials: window.location.hostname !== 'localhost'
}

// const api_host = `https://${window.location.hostname == "localhost" ? "" : "api."}${window.location.hostname}:${window.location.hostname == "localhost" ? "8843" : ''}`;
const api_host = `https://api.${window.location.hostname}`;
let current_chat_id = null;
let current_shelter_id = null;
let current_page = 1;
let current_last_message = null;
let remote_typing_timeout = null;

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
        sendMsg: (message) => {
            return new Promise((resolve, reject) => {
                const url = `${api_host}/chat/shelter/${message.shelter_id}/publication/${message.chat_id}/`
                axios.post(url, message, requestOptions).then((response) => {
                    resolve(response.data);
                }).catch((error) => {
                    reject(error);
                });
            })
        },

        selectChat: (shelter_id, chat_id) => {
            const shelter_container = document.getElementById(`shelter-${shelter_id}`);
            const chat_container = document.getElementById(`chat-${chat_id}`);
            
            const all_shelter_containers = document.getElementsByClassName("shelter-list-item-container");
            const all_chat_containers = document.getElementsByClassName("shelter-list-item-chat-container");

            for (let i = 0; i < all_shelter_containers.length; i++) {
                all_shelter_containers[i].className = "shelter-list-item-container";
                all_shelter_containers[i].getElementsByClassName("shelter-list-item-toggle-button-container")[0] || document.getElementById(`shelter-${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container toggled")[0];
            }

            for (let i = 0; i < all_chat_containers.length; i++) {
                const chat_container = all_chat_containers[i];
                chat_container.classList.remove("selected");
            }

            const chatsContainer = document.getElementById(`shelter-${shelter_id}`);
            const toggleBtnContainer = document.getElementById(`shelter-${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container")[0] || document.getElementById(`shelter-${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container toggled")[0];
            const chatListContainerToggled = document.getElementById(`chats-container-${shelter_id}`);
            let extendedHeight = chatListContainerToggled.scrollHeight;
            document.querySelector(":root").style.setProperty(`--${shelter_id}-extended-height`, `${extendedHeight + 60}px`);
            document.styleSheets[14].insertRule(`#shelter-${shelter_id}.toggled{max-height: var(--${shelter_id}-extended-height); transition: max-height 0.75s ease;}`)
            chatsContainer.className = `shelter-list-item-container toggled`;
            toggleBtnContainer.className = "shelter-list-item-toggle-button-container toggled";

            chat_container.classList.add("selected");
        },

        closeChat: () => {
            const chatNotSelected = document.getElementById("chat-not-selected");
            const chatLoading = document.getElementById("chat-loading-container");
            const chatContainer = document.getElementById("chat-container");
            chatLoading.className = "invisible";
            chatNotSelected.classList.remove("invisible");
            chatContainer.classList.add("invisible");

            const all_shelter_containers = document.getElementsByClassName("shelter-list-item-container");
            const all_chat_containers = document.getElementsByClassName("shelter-list-item-chat-container");

            for (let i = 0; i < all_shelter_containers.length; i++) {
                all_shelter_containers[i].className = "shelter-list-item-container";
            }

            for (let i = 0; i < all_chat_containers.length; i++) {
                const chat_container = all_chat_containers[i];
                chat_container.classList.remove("selected");
            }

            const chatContent = document.getElementById("chat-content");
            chatContent.innerHTML = "";

            const chatInput = document.getElementById("chat-footer-input");
            chatInput.value = "";

            document.getElementById("chat-header-inf").className = "invisible";

            const chatShelterImage = document.getElementById("chat-header-inf-shelter-img");
            chatShelterImage.src = "";

            const chatShelterName = document.getElementById("chat-header-inf-shelter-name");
            chatShelterName.innerHTML = "";

            const chatImage= document.getElementById("chat-header-inf-chat-img");
            chatImage.src = "";

            const chatTitle = document.getElementById("chat-header-inf-chat-title");
            chatTitle.innerHTML = "";

            const chatFooter = document.getElementById("chat-footer");
            chatFooter.className = "invisible";


            window.history.pushState({}, "", "/chats/");

            current_chat_id = null;
            current_shelter_id = null;
            current_last_message = null;
            current_page = 1;
            Chats.Actions.openSidebar();

        }
    },
    Events: {
        onWindowLoad: () => {
            const getQueryParams = () => {
                const qs = window.location.search.substr(1);
                const params = {};
                if (qs != "") {
                    qs.split("&").forEach((param) => {
                        const [key, value] = param.split("=");
                        params[key] = value;
                    });
                }

                return params;
            }

            const queryParams = getQueryParams();
            if (queryParams.cid != undefined && queryParams.sid != undefined) {
                const chatNotSelected = document.getElementById("chat-not-selected");
                const chatLoading = document.getElementById("chat-loading-container");
                chatLoading.className = "visible";
                chatNotSelected.classList.add("invisible");
                Chats.Actions.selectChat(queryParams.sid, queryParams.cid);
                const selected_chat = global_chats.find((chat) => chat.chat_id == queryParams.cid);
                Chats.UI.setChatHeader(selected_chat.shelter_photo, selected_chat.shelter_name, selected_chat.chat_photo, selected_chat.chat_name);
                document.getElementById("chat-header-inf").className = "";
                        
                Chats.Actions.getChatMessages(queryParams.sid, queryParams.cid, 1).then((messages) => {
                    chatLoading.className = "invisible";
                    Chats.Actions.closeSidebar();
                    const msgContainer = document.getElementById('chat-content');
                    msgContainer.innerHTML = "";
                    current_last_message = messages[0];
                    messages.forEach((message) => {
                        const i = messages.indexOf(message);
                        const previous_msg = messages[i + 1];
                        console.log(previous_msg)
                        Chats.UI.addMessageToChat(message, msgContainer, previous_msg == undefined ? {} : previous_msg);
                    });

                    document.getElementById("chat-loading-container").className = "invisible";
                    document.getElementById("chat-footer").className = "";
                    current_shelter_id = queryParams.sid;

                    Chats.Events.onChatLoad(queryParams.cid);
                });
            }

        },
        onShelterClick: (shelter_id) => {
            const chatsContainer = document.getElementById(`shelter-${shelter_id}`);
            const toggleBtnContainer = document.getElementById(`shelter-${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container")[0] || document.getElementById(`shelter-${shelter_id}`).getElementsByClassName("shelter-list-item-toggle-button-container toggled")[0];
            const chatListContainerToggled = document.getElementById(`chats-container-${shelter_id}`);
            if (chatsContainer.className.includes("toggled")) {
                chatsContainer.className = "shelter-list-item-container";
                toggleBtnContainer.className = "shelter-list-item-toggle-button-container";
            } else {
                let extendedHeight = chatListContainerToggled.scrollHeight;
                document.querySelector(":root").style.setProperty(`--${shelter_id}-extended-height`, `${extendedHeight + 60}px`);
                document.styleSheets[14].insertRule(`#shelter-${shelter_id}.toggled {max-height: var(--${shelter_id}-extended-height); transition: max-height 0.75s ease;}`)
                chatsContainer.className = `shelter-list-item-container toggled`;
                toggleBtnContainer.className = "shelter-list-item-toggle-button-container toggled";
            }
        },
        onChatClick: (shelter_id, chat_id, shelter_name, shelter_photo, chat_title, chat_photo) => {
            Chats.Actions.selectChat(shelter_id, chat_id);
            window.history.pushState({}, "", `?sid=${shelter_id}&cid=${chat_id}`);
            Chats.UI.setChatHeader(shelter_photo, shelter_name, chat_photo, chat_title);
            Chats.Actions.closeSidebar();
            document.getElementById("chat-header-inf").className = "";
            
            current_shelter_id = shelter_id;
            current_page = 1;
            document.getElementById("chat-loading-container").className = "visible";
            Chats.Actions.getChatMessages(shelter_id, chat_id).then((messages) => {
                const chatNotSelected = document.getElementById("chat-not-selected");
                chatNotSelected.classList.add("invisible");
                //Change created_at to date
                const msgContainer = document.getElementById('chat-content');
                msgContainer.innerHTML = "";
                current_last_message = messages[0];

                messages.forEach((message) => {
                    message["shelter_photo"] = shelter_photo;
                    const i = messages.indexOf(message);
                    const previous_msg = messages[i + 1];
                    Chats.UI.addMessageToChat(message, msgContainer, previous_msg == undefined ? {} : previous_msg);
                });

                document.getElementById("chat-loading-container").className = "invisible";
                document.getElementById("chat-footer").className = "";

                Chats.Events.onChatLoad(chat_id);
            }).catch((error) => {
                console.log(error);
            });
        },
        onChatLoad: (chat_id) => {
            socket.off(`typing-${current_chat_id}`);
            socket.off(`new-message-${current_chat_id}`);

            current_chat_id = chat_id;

            socket.on(`typing-${chat_id}`, () => {
                Chats.Events.onRemoteTyping();
            })

            socket.on(`new-message-${current_chat_id}`, (msg) => {
                Chats.Events.onNewMessage(msg);
            })
        },
        onSendMsg: () => {
            const msg = document.getElementById("chat-footer-input").value;
            if (msg != "") {
                const shelter = global_shelters.filter(s => { return s.shelter_id == current_shelter_id })[0];
                const msgContainer = document.getElementById('chat-content');
                const date = new Date();
                const msgObj = {
                    shelter_id: current_shelter_id,
                    chat_id: current_chat_id,
                    text: msg,
                    created_at: date.toISOString(),
                    is_shelter: shelter.is_shelter,
                }
                Chats.UI.addMessageToChat(msgObj, msgContainer, current_last_message, { append: false });
                document.getElementById("chat-footer-input").value = "";
                Chats.Actions.sendMsg(msgObj).then(res => {
                    //Message successfully sent
                }).catch(err => {
                    console.log("error sending message", err);
                });
            }
        },
        onTyping: () => {
            socket.emit("typing", {
                shelter_id: current_shelter_id,
                chat_id: current_chat_id
            });
        },
        onRemoteTyping: () => {
            const footer_higher = document.getElementById("footer-higher");
            footer_higher.className = "typing";

            if (remote_typing_timeout) {
                clearTimeout(remote_typing_timeout);
                remote_typing_timeout = null;
            }

            remote_typing_timeout = setTimeout(() => {
                footer_higher.className = "";
            }, 3000);

        },
        onNewMessage: (msg) => {
            if (msg.sender_id == current_shelter_id) {
                Chats.UI.addMessageToChat(msg, document.getElementById('chat-content'), current_last_message, { append: false });
            } else {
                console.log("MSG Received by other user")
            }
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
            shelterContainer.id = `shelter-${shelter_id}`;

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

            const chatsContainer = document.createElement('div');
            chatsContainer.className = "shelter-list-item-chats-container invisible";
            chatsContainer.id = `chats-container-${shelter_id}`;
            shelterContainer.appendChild(chatsContainer);

            shelterContainer.appendChild(chatsContainer);

            shelterInfoContainer.onclick = () => {
                Chats.Events.onShelterClick(shelter_id)
            };
        },
        addChatToShelterList: (chat, chatsContainer) => {
            const chatContainer = document.createElement('div');
            chatContainer.className = "shelter-list-item-chat-container";
            chatContainer.id = `chat-${chat.chat_id}`;

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
                if(chatContainer.className.includes("selected")){
                    Chats.Actions.toggleSidebar();
                    return;
                } else {
                    Chats.Events.onChatClick(chat.shelter_id, chat.chat_id, chat.shelter_name, chat.shelter_photo, chat.chat_name, chat.chat_photo);
                }
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
            console.log(current_shelter_id, current_chat_id)
        },

        addMessageToChat: (message, chatContainer, previous_msg={}, options = { append: true }) => {
            const isSender = message.user_id === message.sender_id;
            let date = new Date(message.created_at);
            let previous_msg_date = new Date(previous_msg.created_at);
            const isSameDate = date.toLocaleDateString() === previous_msg_date.toLocaleDateString()
            const contentContainer = document.createElement('div');
            contentContainer.id = message.created_at;
            contentContainer.className = isSender ? "chat-content-message-container sent" : "chat-content-message-container received";

            if (!isSender && previous_msg.sender_id !== message.sender_id) {
                const messageImage = document.createElement('img');
                messageImage.className = "chat-content-message-image";
                messageImage.src = message.shelter_photo || "https://dogshome.com.ar/profile/image/uploaded/default-user-image.png";
                contentContainer.appendChild(messageImage);
            } else {
                isSameDate ? contentContainer.classList.add("same-user-msg") : contentContainer.classList.remove("same-user-msg");
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
            //If the message was sent today, show the time, otherwise show the date
            messageTimestamp.innerText = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Argentina/Buenos_Aires',
                hour12: false
            })
            // + " " + date.toLocaleDateString('es-AR', {
            //     day: '2-digit',
            //     month: '2-digit',
            //     year: '2-digit',
            //     timeZone: 'America/Argentina/Buenos_Aires'
            // });

            const dateSeparatorContainer = document.createElement("div");

            //Create date separator if the message was sent on a different day
            if (!isSameDate) {
                const days = ["Dom.", "Lun.", "Mar.", "Mie.", "Jue.", "Vie.", "Sab."];
                dateSeparatorContainer.className = "chat-content-date-separator-container";

                const dateSeparator = document.createElement("a");
                dateSeparator.className = "chat-content-date-separator";

                if (date.getFullYear() === previous_msg_date.getFullYear()) {
                    dateSeparator.innerText = `${days[date.getDay()]} ${date.getDate()} de ${String(date.toLocaleString('es-AR', { month: 'long' })).charAt(0).toUpperCase() + String(date.toLocaleString('es-AR', { month: 'long' })).slice(1)}`;
                } else {
                    dateSeparator.innerText = `${days[date.getDay()]} ${date.getDate()} de ${String(date.toLocaleString('es-AR', { month: 'long' })).charAt(0).toUpperCase() + String(date.toLocaleString('es-AR', { month: 'long' })).slice(1)} de ${date.getFullYear()}`;
                }

                dateSeparatorContainer.appendChild(dateSeparator);
            }

            messageContainer.appendChild(messageText);
            messageContainer.appendChild(messageTimestamp);
            contentContainer.appendChild(messageContainer);

            if (options.append) {
                chatContainer.appendChild(contentContainer);
                chatContainer.appendChild(dateSeparatorContainer);
            } else {
                chatContainer.insertBefore(dateSeparatorContainer, chatContainer.firstChild);
                chatContainer.insertBefore(contentContainer, chatContainer.firstChild);
            }
        }
    }
}