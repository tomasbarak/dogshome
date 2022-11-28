function setLoading(isLoading){
    if(isLoading === true){
        console.log("loading");
        document.getElementById('loading-invisible').id = 'loading-visible';
    }else{
        console.log("finalized loading");
        document.getElementById('loading-visible').id = 'loading-invisible';
    }
}

function LoadingDisplay(isLoading){
    if(isLoading === true){
        console.log("meshe");
        document.getElementById('loading-visible').id = 'loading-invisible';
    }else{

    }
}