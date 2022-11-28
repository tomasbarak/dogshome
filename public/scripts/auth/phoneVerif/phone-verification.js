function getPhoneFlag(phone){
    let user = firebase.auth().currentUser
    let dbRef = firebase.database().ref()
    //console.log(user.uid);
    dbRef.child('Users').child(user.uid).get().then((snapshot) => {
        const data = snapshot.val().PublicRead;
       //console.log(data);
        if(data !== null ){
            console.log(data + 'Phone is ' + phone);
            if(data.PhoneVerified !== null && data.PhoneVerified !== 'true'){
                console.log(data);
                verifyPhoneNumber(phone)
            }else{
                window.location = 'crear-perfil.html';
            }
        }else{
            window.location = 'crear-perfil.html';
        }

    }).catch((error) => {
        console.log(error);
    });
}

function reqListener() {
    let specificResponseItem = JSON.parse(this.response);
    if(specificResponseItem.success === true){
        codeExpirationCounter(specificResponseItem.seconds_to_expire);
        console.log(specificResponseItem);
        showPhoneVerificationSentMsg(specificResponseItem.message);
    }else{
        console.log(specificResponseItem);
    }
}
var phoneGlobal;
function verifyPhoneNumber(phone){
    let cleanedPhone = phone.replaceAll('-', '');
    cleanedPhone = cleanedPhone.replaceAll(' ', '');
    phoneGlobal = cleanedPhone;
    console.log("phone = " + cleanedPhone);
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("POST", "https://coral-newt-2178.twil.io/start?phone_number=" + cleanedPhone + "&country_code=54");
    oReq.send();
}
function reqVerifyListener(){
    var ResponseItems = JSON.parse(this.response);
    console.log(ResponseItems);
    if(ResponseItems.success === true){
        showPhoneVerificationSuccess(ResponseItems.message);
        saveUserPhoneNumber(phoneGlobal);
    }else{
        if(ResponseItems.error_code === '60022'){
            showPhoneVerificationWrong('El código ingresado es incorrecto');
            saveUserPhoneNumber();
        }else if(ResponseItems.error_code === '60023'){
            showPhoneVerificationWrong('No se ha enviado ningún código de verificación aún');
        }else{
            showPhoneVerificationWrong('Ocurrió un error');
        }

    }
}
function verifyCode(code){
    let cleanedPhone = phoneGlobal;
    cleanedPhone = cleanedPhone.replaceAll(' ', '');
    console.log("phone = " + cleanedPhone);
    let oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqVerifyListener);
    oReq.open("POST", "https://coral-newt-2178.twil.io/check?phone_number=" + cleanedPhone + "&country_code=54&verification_code=" + code);
    oReq.send();
}
function getVerificationCode(){
    let verificationCode = ""
    let digit1 = document.getElementById('digit-1').value.toString();
    let digit2 = document.getElementById('digit-2').value.toString();
    let digit3 = document.getElementById('digit-3').value.toString();
    let digit4 = document.getElementById('digit-4').value.toString();
    let digit5 = document.getElementById('digit-5').value.toString();
    let digit6 = document.getElementById('digit-6').value.toString();
    verificationCode = digit1 + digit2 + digit3 + digit4 + digit5 + digit6;
    console.log(verificationCode);
    verifyCode(verificationCode);
}