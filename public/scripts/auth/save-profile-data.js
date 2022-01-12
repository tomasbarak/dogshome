function saveProfileData(){
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture : imageUrl
    }, (error) => {
        if (error) {
            // The write failed...
        } else {
            // Data saved successfully!
        }
    });
}
function updateProfilePhoto(photo){
    const user = firebase.auth().currentUser;

    user.updateProfile({
        photoURL: photo
    }).then(() => {
        // Update successful
        console.log("Profile Image Updated Successfully(URL: " + user.photoURL + ")")
        // ...
    }).catch((error) => {
        // An error occurred
        console.log(error);
        // ...
    });
}
function updateProfileDisplayName(name, surname) {
    const user = firebase.auth().currentUser;
    var displayName = name.replaceAll(' ', '') + ' ' + surname.replaceAll(' ', '');
    user.updateProfile({
        displayName: JSON.stringify({
            "nameAndSurname": {
                "name": name.replaceAll(' ', ''),
                "surname": surname.replaceAll(' ', ''),
                "displayName": displayName
            },
            "accountType": {
                "typeStr": "",
                "typeSelectionNum": ""
            }
        })
    }).then(() => {
        // Update successful
        console.log("Display Name Updated Successfully(" + user.displayName + ")")
        // ...
    }).catch((error) => {
        // An error occurred
        console.log(error);
        // ...
    });
    saveNameAndSurnameInDatabase();

    function saveNameAndSurnameInDatabase() {
        firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
            Name: name.replaceAll(' ', ''),
            Surname: surname.replaceAll(' ', '')
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
    }
}

    function saveAccType(typeNumber) {
        const user = firebase.auth().currentUser;

        const uid = user.uid;

        var typeStr;
        if (typeNumber === 1) {
            typeStr = "Adoptante";
        } else if (typeNumber === 2) {
            typeStr = "Refugio";
        } else {
            typeStr = "Rescatista";
        }
        console.log(typeStr);
        saveDatabase();

        function saveDatabase() {
            firebase.database().ref('Users/' + uid + "/PublicRead/Type").update({
                TypeNum: typeNumber,
                TypeStr: typeStr
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }
    }

    function uploadPhotoCloudinary(img) {
        console.log(img)
        firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
            var xhr = new XMLHttpRequest();
            var formdata = new FormData();
            formdata.append('upload', img);
            const user = firebase.auth().currentUser;
            xhr.addEventListener("load", function () {
                var response = JSON.parse(xhr.responseText);
                var photoUrl = response.url;
                updateProfilePhoto(photoUrl);
                savePhotoInDatabase(photoUrl);
            });
            xhr.open('POST', 'https://api.softvisiondevelop.com.ar/profile/upload/image/', true);
            xhr.setRequestHeader('authtoken', idToken);
            xhr.send(formdata);
    
            function savePhotoInDatabase(photoURL) {
                firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
                    Photo: photoURL
                }, (error) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Success");
                    }
                });
            }
        }).catch(function (error) {

        })
        
    }

    function saveFirstBlankData() {
        const user = firebase.auth().currentUser;
        saveEmailInDatabase();
        saveIdInDatabase();

        function saveEmailInDatabase() {
            firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
                Email: user.email
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }

        function saveIdInDatabase() {
            firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
                Id: user.uid
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }

        /*function saveBlankPostsId() {
            firebase.database().ref('Users/' + user.uid + "/PublicRead/PostsIds").update({
                0: "firstPost"
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }*/
    }
    function saveUserPhoneNumber(phone){
        const user = firebase.auth().currentUser;
        firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
            Phone: phone,
            PhoneVerified: "true"
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
    }
    function saveUserShortDesc(shortDesc){
        const user = firebase.auth().currentUser;
        firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
            ShortDescription: shortDesc,
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
    }

    function saveUserWebSite(website){
        const user = firebase.auth().currentUser;
        firebase.database().ref('Users/' + user.uid + "/PublicRead/").update({
            WebSite: website,
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
    }
    function saveActualInstance(instance){
        const user = firebase.auth().currentUser;
        console.log("profile UID: " + user.uid)
        if(usedInstances){
            firebase.database().ref('Users/' + user.uid + '/PublicRead').update({
                CreationInstance: instance,
                CreationInstanceMap: usedInstances
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }else{
            firebase.database().ref('Users/' + user.uid + '/PublicRead').update({
                CreationInstance: instance,
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Success");
                }
            });
        }
    }
    function saveSocialMedia(socialMediaObject){
        const user = firebase.auth().currentUser;
        firebase.database().ref('Users/' + user.uid + '/PublicRead/SocialMedia').update({
            Instagram: socialMediaObject.instagram,
            Facebook: socialMediaObject.facebook,
            Twitter: socialMediaObject.twitter,
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
        }
        function saveRefName(name){
            sessionStorage.setItem('sessionRefName', name);

            const user = firebase.auth().currentUser;
            firebase.database().ref('Users/' + user.uid + '/PublicRead').update({
            RefName: name
        }, (error) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Success");
            }
        });
        }
