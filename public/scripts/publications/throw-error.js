function throwDontMatchError(){
    console.log("No se ha encontrado la pagina que buscabas");
    document.getElementById("error-container").className = "error-container-visible";
}
function throwGenericError(error){
    console.log(error);

}