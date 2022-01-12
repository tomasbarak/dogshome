function checkProfile(user){
    let uid = user.uid;
    var getData = firebase.database().ref('Users/'+ uid + '/PublicRead/');

    getData.on('value', (snapshot) => {
        const data = snapshot.val();
        //console.log(data);
        if(data !== null ){
            if(data.Finished === true){

            }else{
                window.location = 'crear-perfil.html';
            }

        }else{
            window.location = 'crear-perfil.html';
        }

    });
}