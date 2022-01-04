
function createSlider(allImages, postPhoto){
    var slider_holder = document.getElementById("slider").getElementsByClassName("holder")[0];
    console.log("Slider created with " + allImages)

    createSingleSlideElement(postPhoto);

    for(let key in allImages){
        createSingleSlideElement(allImages[key])
    }
}

function createSingleSlideElement(image_slide){
    var slider_holder = document.getElementById("slider").getElementsByClassName("holder")[0];
    console.log(slider_holder);
    //Creates the element with class "slide-wrapper"

    var slideWrapper = document.createElement("div");
    slideWrapper.className = "slide-wrapper";

    //Append "slide-wrapper" to "holder"
    slider_holder.appendChild(slideWrapper);

    //Creates the element with class "slide"

    var slide = document.createElement("div");
    slide.className = "slide";

    //Append "slide" to "slide-wrapper"
    slideWrapper.appendChild(slide);

    //Creates the element with class "slider-image"
    var slider_image = document.createElement("div");
    slider_image.className = "slider-image";

    //Apend "slider_image to "slide"
    slide.appendChild(slider_image);

    //Creates img component

    var image = document.createElement("img");
    image.id = "image-slider";
    image.src = image_slide;

    //Append image to "slider_image"
    slider_image.appendChild(image);
}