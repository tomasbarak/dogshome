var actualInstance;
var accTypeSelection;
var usedInstances = [1];
var conditionsReached = false;
const omitibleInstances = [4, 7, 8];

setBackButtonVisibility();

setInterval(function(){
    setSkipVisibility();
}, 0)

function setInicialInstance(inicialNumber){
    if(inicialNumber !== null || inicialNumber !== undefined){
        //console.log(sessionStorage.getItem('sessionInstance'))
        if(sessionStorage.getItem('sessionInstance') !== null && sessionStorage.getItem('sessionInstance') !== undefined){
            actualInstance = Number(sessionStorage.getItem('sessionInstance'));
            if(JSON.parse(sessionStorage.getItem('instanceSequence')) !== null && JSON.parse(sessionStorage.getItem('instanceSequence')) !== undefined){
                usedInstances = usedInstances = JSON.parse(sessionStorage.getItem('instanceSequence'));
            }
            console.log('acutal instance does not exists but we can recover last session: ' + actualInstance)
        }else{
            if(inicialNumber != undefined && inicialNumber != null){
                console.log("aaashe initial: "+inicialNumber)
                actualInstance = inicialNumber;
                console.log("aaashe2 actual: "+actualInstance)
                sessionStorage.setItem('sessionInstance', inicialNumber);
            }else{
                actualInstance = 1;
                sessionStorage.setItem('sessionInstance', 1);
            }
        }
    }else{
        //console.log("nashenashe2")
        actualInstance = 0;
        sessionStorage.setItem('sessionInstance', '0');
    }
    //console.log(actualInstance)
    setBackButtonVisibility(Number(actualInstance))
    refreshInstances(Number(actualInstance));
    setLoading(false);
}
function setBackButtonVisibility(instance){
    if(instance <= 1 || instance === undefined || instance === null){
        document.getElementById('back-button').style.display = 'none';
        console.log('nashe1 ' + instance);
        console.log( actualInstance );

    }else{
        document.getElementById('back-button').style.display = 'flex';
    }
}

function setSkipVisibility(){
    const skipButton = document.getElementById('skip-btn');
    if(omitibleInstances.includes(actualInstance)){
        skipButton.style.display = "flex";
    }else{
        skipButton.style.display = "none";
    }
}

function submitInstance(){
    if(actualInstance < 10){
        console.log(actualInstance);
        switch (actualInstance){
            //email y contraseña
            case 0:
                break;
            //Nombre y apellido
            case 1:
                saveNameAndSurnameValues();
                break;
            //Tipo de cuenta
            case 2:
                saveAccountType(accTypeSelection);
                setAccTypeSelection(accTypeSelection);
                console.log('Selected account type: ' + accTypeSelection);
                if(accTypeSelection !== 2){
                    console.log("Before nashe" + actualInstance)
                    actualInstance++
                    setBackButtonVisibility(actualInstance);
                    sessionStorage.setItem('sessionInstance', actualInstance);
                }
                break;
            //Nombre del refugio
            case 3:
                const refInput = document.getElementById('refugio-name');
                let refName = String(refInput.value.replace(/\s/g, '_').trim());

                if(refName.length >= 3){
                    saveRefName(refName);
                }else{
                    return;
                }
                saveRefName(refName);
                break;
            //Foto de perfil
            case 4:

                break;
            //Telefono(s)
            case 5:
                if(verifyPhoneFormat(document.getElementById('acc-phone-num').value)){
                    sessionStorage.setItem('sessionAccPhoneNum', document.getElementById('acc-phone-num').value);
                    window.location = "phone-verification.html";
                }
                break;
            //Descripcion corta
            case 6:
                let textarea = document.getElementById('short-desc');

                if(textarea.value.length > 0){
                    saveUserShortDesc(textarea.value);
                }
                console.log('Selected account type: ' + accTypeSelection);
                if(accTypeSelection == 1){
                    console.log("Before nashe" + actualInstance)
                    actualInstance+=2;
                    setBackButtonVisibility(actualInstance);
                    sessionStorage.setItem('sessionInstance', actualInstance);
                }
                break;
            //Sitio web
            case 7:
                let website = document.getElementById('website');

                if(website.value.length > 0){
                    saveUserWebSite(website.value)
                }

                break;
            //Redes sociales
            case 8:
                let instagram = document.getElementById('instagram').value;
                let facebook = document.getElementById('facebook').value;
                let twitter = document.getElementById('twitter').value;
                saveSocialMedia({instagram, facebook, twitter})
                break;
            //Terminos y condiciones
            case 9:
                const user = firebase.auth().currentUser;
                firebase.database().ref('Users/' + user.uid + '/PublicRead').update({
                        Finished: true
                    }, (error) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Success");
                            window.location = "index.html"
                        }
                    });
                break;
        }
        actualInstance ++;
        usedInstances.push(actualInstance);
        sessionStorage.setItem('instanceSequence', JSON.stringify(usedInstances));
        console.log("Used instances: " + JSON.parse(sessionStorage.getItem('instanceSequence')));
        setBackButtonVisibility(Number(actualInstance));
        sessionStorage.setItem('sessionInstance', actualInstance);
        refreshInstances(Number(actualInstance));
        saveActualInstance(actualInstance);
    }

}

function skipInstance(instanceToSkip){
if(omitibleInstances.includes(instanceToSkip)){
    actualInstance++;
    usedInstances.push(actualInstance);
    setBackButtonVisibility(Number(actualInstance));
    refreshInstances(Number(actualInstance));
    saveActualInstance(actualInstance);
    sessionStorage.setItem('sessionInstance', Number(actualInstance));
}
}
function instanceGoBack(){
    if(actualInstance > 1){
        console.log("Es que si: " + usedInstances[usedInstances.length - 1]);
        usedInstances.pop();
        sessionStorage.setItem('instanceSequence', JSON.stringify(usedInstances));
        console.log(Number(usedInstances[usedInstances.length - 1]))
        actualInstance =  Number(usedInstances[usedInstances.length - 1]);
        setBackButtonVisibility(Number(actualInstance));
        sessionStorage.setItem('sessionInstance', Number(actualInstance));
        refreshInstances(Number(actualInstance));
        saveActualInstance(actualInstance);
    }
}

function  setAccTypeSelection(selection){
    var accountTypesContainer = document.getElementById('account-types-container');

    var accountTypes = accountTypesContainer.getElementsByClassName('account-type-option-container');

    switch (selection){
        case 1:
            document.getElementById('adoptante').className = 'account-type-option acc-type-selected';
            document.getElementById('refugio').className = 'account-type-option acc-type-unselected';
            document.getElementById('rescatista-solo').className = 'account-type-option acc-type-unselected';
            break;
        case 2:
            document.getElementById('adoptante').className = 'account-type-option acc-type-unselected';
            document.getElementById('refugio').className = 'account-type-option acc-type-selected';
            document.getElementById('rescatista-solo').className = 'account-type-option acc-type-unselected';
            break;
        case 3:
            document.getElementById('adoptante').className = 'account-type-option acc-type-unselected';
            document.getElementById('refugio').className = 'account-type-option acc-type-unselected';
            document.getElementById('rescatista-solo').className = 'account-type-option acc-type-selected';
            break;
    }
}

function saveNameAndSurnameValues(){
    var nameInputValue = document.getElementById('name').value;
    var surnameInputValue = document.getElementById('surname').value;

    updateProfileDisplayName(nameInputValue, surnameInputValue);

    sessionStorage.setItem('sessionAccName', nameInputValue);
    sessionStorage.setItem('sessionAccSurname', surnameInputValue);
}
function saveAccountType(selection){
    sessionStorage.setItem('sessionAccType', selection);
    saveAccType(selection);
}
function putProfileImage() {
    var image = document.getElementById('profile-image-upload-cont');
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("upload-photo").files[0]);
    console.log(document.getElementById("upload-photo").fullPatt)
    var fileName = document.getElementById("upload-photo").files[0].name;
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile==="jpg" || extFile==="jpeg" || extFile==="png"){
        oFReader.onload = function (oFREvent) {
            document.getElementById("profile-image-upload-cont").src = oFREvent.target.result;
            //console.log(document.getElementById("upload-photo").files[0])
            //console.log(oFREvent.target.result)
            uploadPhotoCloudinary(document.getElementById("upload-photo").files[0]);
            document.getElementById("profile-image-upload-cont").style.objectFit = 'cover';
            document.getElementById("profile-image-upload-cont").style.width = '100%';
            document.getElementById("profile-image-upload-cont").style.height = '100%';
            document.getElementById("profile-image-upload-cont").style.borderRadius = '75px';
            saveSessionAccImage();
        }
    }else{
        alert('Solo estan permitidas imagenes PNG o JPG')
    }
}
function formatPhoneNum(uncleanedPhone){
        //Filter only numbers from the input
        let cleaned = ('' + uncleanedPhone).replace(/\D/g, '');

        console.log(cleaned);
        //Check if the input is of correct length
        let match = cleaned.match(/^([0-9]{2,3})([0-9]{4})([0-9]{4})$/);

        console.log(match);
        if (match) {
            var matched = match[1] + ' ' + match[2] + '-' + match[3];
            document.getElementById('acc-phone-num').value = matched;
            //console.log(match)
        }else {
            //console.log('nose')
            document.getElementById('acc-phone-num').value = cleaned;
        }
}
function verifyPhoneFormat(uncleanedPhone){
        //Filter only numbers from the input
        let cleaned = ('' + uncleanedPhone).replace(/\D/g, '');

        console.log(cleaned);
        //Check if the input is of correct length
        let match = cleaned.match(/^([0-9]{2,3})([0-9]{4})([0-9]{4})$/);

        console.log(match);
        if (match) {
            var matched = match[1] + ' ' + match[2] + '-' + match[3];
            return matched;
            //console.log(match)
        }else {
            return false;
            //console.log('nose')
        }
}
function saveSessionAccImage(){
    var bannerImage = document.getElementById('profile-image-upload-cont');
    var imgData = bannerImage.src;
    sessionStorage.setItem("sessionAccImgEncoded", encodeURIComponent(imgData));
}

function getBase64Image(img) {
    console.log(img.src)
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL();

    //console.log(dataURL);
    return dataURL;
}