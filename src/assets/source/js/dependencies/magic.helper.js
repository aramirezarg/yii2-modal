$(document).on('click', '.execute_delete', function (e) {
    $(this).blur();
    e.preventDefault();
    var url = $(this).attr('href');
    new MagicMessage(
        'confirm',
        'Eliminar Registro',
        '¿Seguro que desea eliminar este Registro?',
        function(){
            $.getJSON( url ).done(
                function( data, textStatus, jqXHR ) {
                    if(data.showMessage === false){
                        location.reload();
                    }else{
                        new MagicMessage(
                            'success',
                            data.data.title,
                            data.data.data,
                            '',
                            function(){loading(true); location.reload();}
                        );
                    }
                }
            ).fail(
                function( jqXHR, textStatus, errorThrown ) {
                    loading(false);
                    if (jqXHR.status !== 302) {
                        new MagicMessage(
                            'error',
                            'Solicitud No Completada',
                            "<strong>Error " + jqXHR.status + "</strong>: " + jqXHR.responseText
                        );
                    }
                }
            );
        }
    );
});

function openInNewTab(url){
    var win = window.open(url, '_blank');
    if (win) {
        //Browser has allowed it to be opened
        win.focus();
        location.reload();
    } else {
        //Browser has blocked it
        new MagicMessage(
            'error',
            'Ventanas emergentes Bloquedas',
            'Por favor habilite las ventanas emergentes en su navegador.',
            '',
            function() { openInNewTab(url); }
        )
    }
}

$(document).on('click', '.execute_action', function (e) {
    $(this).blur();
    e.preventDefault();
    var target      = $(this).attr('target');
    var url         = $(this).attr('href') + ((target !== null && target !== undefined) ? '&target=' + target: '');
    var title       = $(this).attr('_title');
    var message     = $(this).attr('message');

    new MagicMessage(
        'confirm',
        title,
        message,
        function() {
            if(target === '_blank') {
                openInNewTab(url);
            }else{
                loading(true);
                $.getJSON(url).done(
                    function (data, textStatus, jqXHR) {
                        loading(false);
                        if (data.error) {
                            new MagicMessage(
                                'success',
                                data.data.title,
                                data.data.data,
                                '',
                                function () {
                                    //if(data.redirect) location.reload()
                                    loading(true);
                                    location.reload();
                                }
                            );
                        } else {
                            if (data.redirect) location.reload();
                        }
                    }
                ).fail(
                    function (jqXHR, textStatus, errorThrown) {
                        loading(false);
                        if (jqXHR.status !== 302) {
                            new MagicMessage(
                                'error',
                                'Solicitud No Completada',
                                "<strong>Error " + jqXHR.status + "</strong>: " + jqXHR.responseText
                            );
                        }
                    }
                );
            }
        }
    );
});

$(document).on('click', '.execute_function', function (e) {
    $(this).blur();
    e.preventDefault();
    var title       = $(this).attr('_title');
    var message     = $(this).attr('message');
    var okFunction     = $(this).attr('okFunction');

    new MagicMessage(
        'confirm',
        title,
        message,
        function() {
            setTimeout(okFunction,0);
        }
    );
});

$(document).on('click', '#download-file', function (e) {
    e.preventDefault();
    var url        = $(this).attr('href');
    new MagicMessage(
        'confirm',
        'Vista previa no disponible',
        'El archivo se descargará en su ordenador.',
        function(){
            downloadFile(url);
        }
    );
});

function beep() {
    var snd = new  Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}

_randText = function(){
    var text = "";
    var possible = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

function downloadFile(url)
{
    var iframe;
    iframe = document.getElementById("download-container");
    if (iframe === null)
    {
        iframe = document.createElement('iframe');
        iframe.id = "download-container";
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}

function jsonToUrl(obj){
    return Object.keys(obj).map(
        function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }
    ).join('&');
}

toJSON = function (ajax) {
    var clear = ajax.replace(/("|')/g, "");
    var pre = clear.split(',');
    var json = '';
    for (var i=0; i<pre.length; i++) {
        var section         = pre[i].split(':');
        var JSON_label      = $.trim(section[0]);
        var JSON_property   = '';

        for (var p=1; p<section.length; p++) {
            JSON_property += section[p] + ((p < (section.length - 1)) ? ':' : '');
        }
        JSON_property = $.trim(JSON_property);

        var quotation = ((JSON_property === 'true' || JSON_property === 'false') ? '' : '"');
        json += '"' + JSON_label + '":' + quotation + JSON_property + quotation  + ((i<(pre.length-1)) ? ',' : '');
    }

    try {
        return jQuery.parseJSON( "{" + json + "}");
    }catch(err) {
        return false;
    }
};

createId = function() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'magic_' + text;
};

function isDefined( _function, _method ) { return ( typeof( window[_function] + "." + _method ) !== "undefined" ); }

function isFullScreen(){
    return !(!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement);
}

objectIsSet = function (object){
    return (object !== undefined && object !== false && object !== '');
};

function isJSON(text){
    try {
        var _json = JSON.stringify(text);
        var json = JSON.parse(_json);
        if(typeof(text) === 'string')
            if(text.length === 0)
                return false;
    }
    catch(e){
        return false;
    }
    return true;
}

checkJSON = function(m) {

    if (typeof m == 'object') {
        try{ m = JSON.stringify(m); }
        catch(err) { return false; } }

    if (typeof m == 'string') {
        try{ m = JSON.parse(m); }
        catch (err) { return false; } }

    if (typeof m != 'object') { return false; }
    return true;

};

function toggleFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function loading(v){
    if(v){
        $( 'body' ).append("\
            <div id='loading_waiting' style='display: table-cell; vertical-align: middle;background-color: transparent; opacity: 0.5; z-index: 1000000' class='fade in modal'></div>"
        );
        var opts = {
            lines: 11 // The number of lines to draw
            , length: 0 // The length of each line
            , width: 10 // The line thickness
            , radius: 30 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1.5 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '30%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: true // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        };

        var target = document.getElementById('loading_waiting');
        var spinner = new Spinner(opts).spin(target);
    }else{
        $( '#loading_waiting').remove();
    }
}

function errorjqXHR(error, text){
    if (error === 0) {
        return 'Not connect: Verify Network.';
    } else if (error === 404) {
        return 'Requested page not found [404]';
    } else if (error === 500) {
        return 'Internal Server Error [500].';
    } else if (error === 'parsererror') {
        return 'Requested JSON parse failed.';
    } else if (error === 'timeout') {
        return 'Time out error.';
    } else if (error === 'abort') {
        return 'Ajax request aborted.';
    } else {
        return 'Uncaught Error: ' + text;
    }
}

var currentUrl = '';
function getUrl(){
    currentUrl = window.location.href;
}

function setUrl(){
    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        //console.log(currentUrl);
        window.history.replaceState('', '', currentUrl);
        //location.reload();
    }
}

function formatCurrency(val) {
    return accounting.formatMoney(val, 'L', 2);
}

(function ($) {
    $.fn.simpleMoneyFormat = function() {
        this.each(function(index, el) {
            var elType = null; // input or other
            var value = null;
            // get value
            if($(el).is('input') || $(el).is('textarea')){
                value = $(el).val().replace(/,/g, '');
                elType = 'input';
            } else {
                value = $(el).text().replace(/,/g, '');
                elType = 'other';
            }
            // if value changes
            $(el).on('paste keyup', function(){
                value = $(el).val().replace(/,/g, '');
                formatElement(el, elType, value); // format element
            });
            formatElement(el, elType, value); // format element
        });
        function formatElement(el, elType, value){
            var result = '';
            var valueArray = value.split('');
            var resultArray = [];
            var counter = 0;
            var temp = '';
            for (var i = valueArray.length - 1; i >= 0; i--) {
                temp += valueArray[i];
                counter++
                if(counter == 3){
                    resultArray.push(temp);
                    counter = 0;
                    temp = '';
                }
            };
            if(counter > 0){
                resultArray.push(temp);
            }
            for (var i = resultArray.length - 1; i >= 0; i--) {
                var resTemp = resultArray[i].split('');
                for (var j = resTemp.length - 1; j >= 0; j--) {
                    result += resTemp[j];
                };
                if(i > 0){
                    result += ','
                }
            };
            if(elType === 'input'){
                $(el).val(result);
            } else {
                $(el).empty().text(result);
            }
        }
    };
}(jQuery));

(function($) {

    jQuery.isEmpty = function(obj){
        var isEmpty = false;

        if (typeof obj === 'undefined' || obj === null || obj === ''){
            isEmpty = true;
        }

        if (typeof obj === 'number' && isNaN(obj)){
            isEmpty = true;
        }

        if (obj instanceof Date && isNaN(Number(obj))){
            isEmpty = true;
        }

        return isEmpty;
    }

})(jQuery);