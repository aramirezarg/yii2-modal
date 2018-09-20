/**
 * Created by alfre on 22/4/2017.
 */


var currentUrl = '';
function getUrl(){
    currentUrl = window.location.href;
    console.log(currentUrl);
}

function setUrl(){
    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        //console.log(currentUrl);
        window.history.replaceState('', '', currentUrl);
        //location.reload();
    }
}

/*window.onbeforeunload = function(){
    //setUrl();
    return setUrl1();
};

function setUrl1(){
    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        console.log(currentUrl);
        window.history.replaceState('', '', currentUrl);
        location.reload();
    }
}*/