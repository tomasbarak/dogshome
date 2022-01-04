function getAccountProfile(uid) {
    let baseUrl = 'https://api.softvisiondevelop.com.ar'
    let route = '/user/' + uid + '/profile';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType = 'json';
    xmlHttp.open("GET", baseUrl + route, true); // false for synchronous request
    xmlHttp.send(null);

    xmlHttp.onload = function () {
        const data = xmlHttp.response;
        if (data) {
            if (data.Photo) {
                document.getElementById("profile-view-image").src = data.Photo;
                document.getElementById("profile-image-mobile").src = data.Photo;
            } else {
                document.getElementById("profile-view-image").src = "/images/default-user-image.png";
                document.getElementById("profile-image-mobile").src = "/images/default-user-image.png";
            }
            let PostsCount = 0;
            if (data.PostsIds) {
                PostsCount = data.PostsIds.length
            } else {
                PostsCount = 0;
            }
            console.log(uid);
            setAccountPostsQ(PostsCount);
            console.log(data)
            if (data.SocialMedia) {
                let InstagramLink = document.getElementById("instagram-link");
                let Facebooklink = document.getElementById("facebook-link");
                let TwitterLink = document.getElementById("twitter-link");

                let InstagramLinkCont = document.getElementById("instagram-link-cont");
                let FacebooklinkCont = document.getElementById("facebook-link-cont");
                let TwitterLinkCont = document.getElementById("twitter-link-cont");

                let InstagramLinkDesk = document.getElementById("instagram-link-desk");
                let FacebooklinkDesk = document.getElementById("facebook-link-desk");
                let TwitterLinkDesk = document.getElementById("twitter-link-desk");

                let InstagramLinkContDesk = document.getElementById("instagram-link-cont-desk");
                let FacebooklinkContDesk = document.getElementById("facebook-link-cont-desk");
                let TwitterLinkContDesk = document.getElementById("twitter-link-cont-desk");
                if (data.SocialMedia.Instagram) {
                    let IGUser = data.SocialMedia.Instagram;
                    InstagramLink.href = "https://instagram.com/" + IGUser;
                    InstagramLinkDesk.href = "https://instagram.com/" + IGUser;

                    InstagramLinkCont.classList.remove('link-no-visible')
                    InstagramLinkContDesk.classList.remove('link-no-visible')
                }
                if (data.SocialMedia.Facebook) {
                    let FBUser = data.SocialMedia.Facebook;
                    Facebooklink.href = "https://facebook.com/" + FBUser;
                    FacebooklinkDesk.href = "https://facebook.com/" + FBUser;

                    FacebooklinkContDesk.classList.remove('link-no-visible')
                    FacebooklinkCont.classList.remove('link-no-visible')
                }
                if (data.SocialMedia.Twitter) {
                    let TWUser = data.SocialMedia.Twitter;
                    TwitterLink.href = "https://twitter.com/" + TWUser;
                    TwitterLinkDesk.href = "https://twitter.com/" + TWUser;

                    TwitterLinkCont.classList.remove('link-no-visible')
                    TwitterLinkContDesk.classList.remove('link-no-visible')
                }
            }
            if (data.ShortDescription) {
                let ShortDescriptionText = data.ShortDescription;
                let shortDescCont = document.getElementById('short-desc')
                shortDescCont.innerText = ShortDescriptionText;
            }
            if (data.PostsIds) {
                console.log("My posts: ", data.PostsIds)
                addMyPublications(data.PostsIds, myPublicationsCallback);
            }
            if (data.Type) {
                if (data.Type.TypeNum !== 1) {
                    let socialNetCont = document.getElementById('social-media-info');
                    socialNetCont.classList.remove('link-no-visible');

                    let postsShowCont = document.getElementById('content-show');
                    postsShowCont.classList.remove('link-no-visible')
                    if (data.RefName) {
                        document.getElementById("my-account-name-text").innerText = data.RefName;
                        document.getElementById("my-account-name-text-desk").innerText = data.RefName;
                    }
                } else {
                    if (data.Name && data.Surname) {
                        let completeName = data.Name + ' ' + data.Surname;
                        document.getElementById("my-account-name-text").innerText = completeName;
                        document.getElementById("my-account-name-text-desk").innerText = completeName;
                        console.log("Es una persona", completeName)
                    }
                }
            }
            if (data.WebSite) {
                document.getElementById("website-link").innerText = data.WebSite;
                document.getElementById("website-link-mobile").innerText = data.WebSite;
                if ((data.WebSite).toString().includes("http://") || (data.WebSite).toString().includes("https://")) {
                    document.getElementById("webpage-link-cont").href = data.WebSite;
                    document.getElementById("website-link-mobile").href = data.WebSite;
                } else {
                    document.getElementById("webpage-link-cont").onclick = function (event) {
                        let url = 'https://' + data.WebSite;
                        window.open(url, '_blank').focus();
                    }
                    document.getElementById("webpage-link-cont-mobile").onclick = function (event) {
                        let url = 'https://' + data.WebSite;
                        window.open(url, '_blank').focus();
                    }
                }
            } else {
                document.getElementById("webpage-link-cont").style.display = 'none';
                document.getElementById("webpage-link-cont-mobile").style.display = 'none';
            }
            if (data.Id) {
                document.getElementById("contact-button").onclick = function (e) {
                    let url = 'https://dogshome.softvisiondevelop.com.ar/chat.html?u=' + data.Id;
                    window.open(url, '_blank').focus();
                }
                if (firebase.auth().currentUser.uid === uid) {
                    document.getElementById("contact-button").style.display = 'none';
                }
            }

        }
    }
    getAccountStats(uid);
}
function getRequestedUserQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('u');
    console.log("Params: " + myParam)
    return myParam;
}
function addMyPublications(PostsIds, _callback) {
    if (PostsIds) {
        let swappedPostsIds = {};
        for (let key in PostsIds) {
            swappedPostsIds[PostsIds[key]] = key;
        }
        console.log("Swapped: ", swappedPostsIds);

        let baseUrl = 'https://api.softvisiondevelop.com.ar'
        let route = '/publications/all/';
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.responseType = 'json';
        xmlHttp.open("GET", baseUrl + route, true); // false for synchronous request
        xmlHttp.send(null);

        xmlHttp.onload = function () {
            console.log("Publications: ", xmlHttp.response);
            let publications = xmlHttp.response;
                if (publications) {
                    for (let key in publications) {
                        if (key in swappedPostsIds) {
                            console.log(key, publications[key]);
                            let publicationCreatedContainer = document.createElement('div');
                            publicationCreatedContainer.className = 'publication';
                            publicationCreatedContainer.onclick = function () {
                                window.location = "dog.html" + '?publication=' + publications[key].Id
                            };
                            console.log("Actual pub id: ", "dog.html" + '?publication=' + publications[key].Id)
                            //publicationCreatedContainer.style.height = (Math.random() * (330 - 270 + 1) + 270) + "px";
                            publicationsIDS.push(publications[key].Id);
                            console.log("Pushing data", '' + publications[key].Id)
                            let publicationContainer = document.getElementById("content-show").appendChild(publicationCreatedContainer);

                            let publicationCreatedImage = document.createElement('img');
                            publicationCreatedImage.className = 'publication-photo';
                            publicationCreatedImage.loading = 'lazy';
                            publicationCreatedImage.src = publications[key].Photo;

                            let publicationImage = publicationContainer.appendChild(publicationCreatedImage);

                            let publicationCreatedDescContainer = document.createElement('div');
                            publicationCreatedDescContainer.className = 'publication-desc-cont';

                            let publicationDescContainer = publicationContainer.appendChild(publicationCreatedDescContainer);

                            let publicationCreatedName = document.createElement('h1');
                            publicationCreatedName.className = 'publication-name';
                            publicationCreatedName.innerText = publications[key].Name;

                            let publicationName = publicationDescContainer.appendChild(publicationCreatedName);

                            let publicationCreatedDesc = document.createElement('p');
                            publicationCreatedDesc.className = 'publication-description';
                            publicationCreatedDesc.innerText = publications[key].SDescription;

                            let publicationDesc = publicationDescContainer.appendChild(publicationCreatedDesc);

                            let publicationCreatedRefNameCont = document.createElement('div');
                            publicationCreatedRefNameCont.className = 'ref-name-cont';

                            let publicationRefNameCont = publicationContainer.appendChild(publicationCreatedRefNameCont);

                            let publicationCreatedRefName = document.createElement('a');
                            publicationCreatedRefName.innerText = publications[key].Refugio;

                            let publicationRefName = publicationRefNameCont.appendChild(publicationCreatedRefName);

                        }
                    }
                } else {
                    console.log("No data available");
                }
                _callback()
        }
        }else {

        }
    }

    function setAccountStats(Stats) {
        if (Stats != null && Stats.length > 0) {
            if (Stats.Following) {
                document.getElementById("profile-following").innerText = Stats.Following.length
            }
            if (Stats.Following) {
                document.getElementById("profile-following-mobile").innerText = Stats.Following.length
            }
            if (Stats.Followers) {
                document.getElementById("profile-followers").innerText = Stats.Followers.length
            }
            if (Stats.Followers) {
                document.getElementById("profile-followers-mobile").innerText = Stats.Followers.length
            }
        } else {
            document.getElementById("profile-following").innerText = '0'
            document.getElementById("profile-following-mobile").innerText = '0'
            document.getElementById("profile-followers-mobile").innerText = '0'
            document.getElementById("profile-followers").innerText = '0'
        }
    }

    function setAccountPostsQ(PostsCount) {
        document.getElementById("profile-posts").innerText = PostsCount;

        document.getElementById("profile-posts-mobile").innerText = PostsCount;
    }

    function getAccountStats(uid) {
        firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
            console.log(idToken)
            let baseUrl = 'https://api.softvisiondevelop.com.ar';
            let route = '/user/' + uid + '/stats';
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.responseType = 'json';
            xmlHttp.open("GET", baseUrl + route, true); // false for synchronous request
            xmlHttp.setRequestHeader('authToken', idToken);
            xmlHttp.send(null);

            xmlHttp.onload = function () {
                const data = xmlHttp.response;
                setAccountStats(data);
            }
        }).catch(function (error) {
            console.log(error)
        });
    }