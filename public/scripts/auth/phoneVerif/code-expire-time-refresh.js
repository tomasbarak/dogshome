function codeExpirationCounter(timeUntilExpire){
    setInterval(function(){
        if(timeUntilExpire > 0){
            var expireTimeInMinutes = Math.floor(timeUntilExpire / 60);;
            var expireTimeRestSeconds = timeUntilExpire - expireTimeInMinutes * 60;
            if (timeUntilExpire > 60){
                document.getElementById("time-expiration").innerHTML="El código expira en " + expireTimeInMinutes + " minutos y " + expireTimeRestSeconds + " segundos";
            }else{
                document.getElementById("time-expiration").innerHTML="El código expira en " + expireTimeRestSeconds + " segundos";
            }
            timeUntilExpire--;
        }else{
            document.getElementById("time-expiration").innerHTML="El código expiró";
            return;
        }
    },1000);
}