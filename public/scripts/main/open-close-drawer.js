function drawerAction(){
    console.log(document.getElementById("drawer-navigator").className);

    var drawerState = document.getElementById("drawer-navigator").className;

    if(drawerState === "drawer-closed"){
        document.getElementById("drawer-navigator").className = "drawer-open";
        document.getElementById("drawer-navigator-dim").className = "dim-active";
    }else{
        document.getElementById("drawer-navigator").className = "drawer-closed";
        document.getElementById("drawer-navigator-dim").className = "dim-null";
    }
}

function forceDrawerOpen(){
    document.getElementById("drawer-navigator").className = "drawer-open";
    document.getElementById("drawer-navigator-dim").className = "dim-active";
}

function forceDrawerClose(){
    document.getElementById("drawer-navigator").className = "drawer-closed";
    document.getElementById("drawer-navigator-dim").className = "dim-null";
}