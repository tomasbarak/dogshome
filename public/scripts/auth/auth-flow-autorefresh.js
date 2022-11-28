var userProfile;
function refreshInstances(instance){
    var user = firebase.auth().currentUser;
    //console.log(instance)
    switch(instance){
        case undefined:

            setInstanceVisibility('email-and-password');
            break;
        case 0:
            setInstanceVisibility('email-and-password');
            break;
        //Nombre y apellido
        case 1:
            var nameInput = document.getElementById('name');
            var surnameInput = document.getElementById('surname');
            setInstanceVisibility('name-and-surname');
            setInstanceLabel('Ingresá tu nombre');
            setInstanceInfo('Ingresá tu nombre y apellido para poder identificarte y brindarte atención personalizada')
            if(user.displayName){
                nameInput.value = JSON.parse(user.displayName).nameAndSurname.name;
                surnameInput.value = JSON.parse(user.displayName).nameAndSurname.surname;
            }
            break;
        //Tipo de cuenta
        case 2:
            console.log('instance 2')
            setInstanceVisibility('account-type');
            setInstanceLabel('Elegí el tipo de cuenta');
            setInstanceInfo('El tipo de cuenta que elijas definirá las acciones que podrás realizar (Publicar contenido, Contactar refugios, etc.) Leé las especificaciones de cada tipo de cuenta en la documentación de DogsHome.')
            break;
        //Nombre del refugio
        case 3:
            setInstanceVisibility('name-ref');
            setInstanceLabel('Ingrese el nombre para su refugio');
            setInstanceInfo('Dale un nombre a tu refugio, si no tenes un refugio, podés inventar el nombre. Esto te servirá para que los demás usuarios te reconozcan.')
            break;
        //Foto de perfil
        case 4:
            var imageCont = document.getElementById('profile-image-upload-cont');
            setInstanceVisibility('profile-image-selection');
            setInstanceLabel('Seleccioná una imagen para tu perfil');
            setInstanceInfo('Sube una foto de perfil representativa, asi los demás podrán reconocerte facilmente.');
            if(user.photoURL){
                imageCont.src = user.photoURL;
                imageCont.style.objectFit = 'cover';
                imageCont.style.width = '100%';
                imageCont.style.height = '100%';
                imageCont.style.borderRadius = '75px';
            }
            break;
        //Telefono(s)
        case 5:
            setInstanceVisibility('account-phone-num');
            setInstanceLabel('Ingresá tu numero celular');
            setInstanceInfo('El numero de teléfono servirá para que las demás personas puedan contactarte, se necesitará verificarlo para evitar fraudes')
            break;
        //Descripcion corta
        case 6:
            setInstanceVisibility('short-desc-ref');
            setInstanceLabel('Escribí una descripción corta');
            setInstanceInfo('La descripción corta de tu cuenta sirve para que las demás personas puedan saber de que se trata tu refugio o que haces como rescatista.')
            break;
        //Sitio web
        case 7:
            setNextBtnText("Siguiente");
            setInstanceVisibility('website-ref');
            setInstanceLabel('Escribí la dirección de tu sitio web (opcional)');
            setInstanceInfo('Ingresando un sitio web podés dar a conocerte de una manera más personalizada')
            break;
        //Redes sociales
        case 8:
            setNextBtnText("Siguiente");
            setInstanceVisibility('social-net');
            setInstanceLabel('Ingresá tus redes sociales');
            setInstanceInfo('Poniendo tus redes sociales tenés más posibilidades de contactar personas')
            break;
        //Terminos y condiciones
        case 9:
            setThermsAndConditions();
            setNextBtnText("Acepto");
            setInstanceVisibility('dogshome-therms');
            setInstanceLabel('Aceptá nuestros terminos y condiciones para finalizar');
            setInstanceInfo('Para empezar a utilizar nuestra web, necesitás aceptar los términos y condiciones')
            break;
    }
    //console.log(Number(instance))

}

function setInstanceVisibility(instanceIdName){
    console.log(instanceIdName);

    var allInstances = document.getElementsByClassName('signup-instance');
    for(let key in allInstances){
        //console.log(allInstances[key].id);
        if(allInstances[key].id !== undefined){
            if(allInstances[key].id === instanceIdName){
                //console.log(allInstances[key]);
                allInstances[key].style.display = 'flex';
            }else{
                //console.log(allInstances[key]);
                allInstances[key].style.display = 'none';
            }
        }
    }
}
function setInstanceLabel(text){
    var instanceLabel = document.getElementById('instance-label');

    instanceLabel.innerText = text;
}
function setInstanceInfo(infoText){
    var infoElement = document.getElementById('infoElement');

    infoElement.innerText = infoText;
    //console.log(infoElement);
}
function setNextBtnText(text){
    let nextBtn = document.getElementById('sign-in-btn');
    nextBtn.innerText = text;
}
function showContextInfo(){
    var infoElement = document.getElementById('infoElementContainer');

    infoElement.className = 'infoElementContainerVisible';
}
function dismissContextInfo(){
    var infoElement = document.getElementById('infoElementContainer');

    infoElement.className = 'infoElementContainerNoVisible';
}
function getCreationInstance(){
    const dbRef = firebase.database().ref();
    let user = firebase.auth().currentUser;
    console.log(user)
    dbRef.child("Users").child(user.uid).child("PublicRead").get().then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            let actualInstance = snapshot.val().CreationInstance;
            let actualInstanceMap = snapshot.val().CreationInstanceMap;
            let accountSelection;
            if(snapshot.val().Type != null && snapshot.val().Type != undefined){
                 accountSelection = snapshot.val().Type.TypeNum;
            }
            if(accountSelection != null && accountSelection != undefined){
                accTypeSelection = accountSelection;
            }
            if(actualInstance >= 10){
                window.location = "index.html";
            }else{
                console.log(actualInstance, actualInstanceMap)
                setInicialInstance(actualInstance);
                if(actualInstanceMap){
                    usedInstances = actualInstanceMap
                }
            }
            if(accountSelection != undefined && accountSelection!= null){
                setAccTypeSelection(accountSelection);
            }
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}