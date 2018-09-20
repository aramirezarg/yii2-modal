var Modals = [];
$(document).on('click', '#use-modal', function (e) {
    e.preventDefault();

    var name = $(this).attr('name');
    var url = $(this).attr('href') === undefined ? $(this).attr('url') : $(this).attr('href');
    var ajaxOptions = $(this).attr('ajaxOptions');
    var jsFunctions = $(this).attr('jsFunctions');

    $(this).blur();

    if(name === undefined || name === ''){
        var _name = createId();
        window[_name] = new MagicModal(url, ajaxOptions, jsFunctions, _name);
    }else{
        window[name] = new MagicModal(url, ajaxOptions, jsFunctions, name);
    }
});

MagicModal = function (url, ajaxOptions, jsFunctions, name ) {
    this.id = name;
    this.sending = false;
    this.url = url;
    this.ajaxOptions = (ajaxOptions === undefined || ajaxOptions === false)
        ? toJSON('send:true,response:true,from:false,confirm:false,preConfirm:false,message:Ejecutar Acción,confirmClose:false') :
        toJSON(ajaxOptions);
    this.jsFunctions = (jsFunctions === undefined || jsFunctions === false) ?
        toJSON('afterExecute:false,beforeLoad:false,whenClose:false,activeWhenClose:false')
        : toJSON(jsFunctions);

    this.confirmToSend = ((this.ajaxOptions.confirm === undefined || this.ajaxOptions.confirm === false) ? false : this.ajaxOptions.confirm );
    this.preConfirmToSend = ((this.ajaxOptions.preConfirm === undefined || this.ajaxOptions.preConfirm === false) ? false : this.ajaxOptions.preConfirm );
    this.confirmToSendMessage = ((this.ajaxOptions.message === undefined || this.ajaxOptions.message === false) ? 'Enviar información al Servidor?' : this.ajaxOptions.message );

    this.confirmToClose = ((this.ajaxOptions.confirmClose === undefined || this.ajaxOptions.confirmClose === false) ? false : this.ajaxOptions.confirmClose );

    this.afterExecute = ((this.jsFunctions.afterExecute === undefined || this.jsFunctions.afterExecute === false) ? false : "'" + this.jsFunctions.afterExecute + "'" );
    this.beforeLoad = ((this.jsFunctions.beforeLoad === undefined || this.jsFunctions.beforeLoad === false) ? false : this.jsFunctions.beforeLoad );
    this.whenClose = ((this.jsFunctions.whenClose === undefined || this.jsFunctions.whenClose === false) ? false : this.jsFunctions.whenClose );
    this.activeWhenClose = ((this.jsFunctions.activeWhenClose === undefined || this.jsFunctions.activeWhenClose === false) ? false : this.jsFunctions.activeWhenClose );

    _this = this;

    if(this.preConfirmToSend) {
        new MagicMessage(
            'confirm',
            'Confirmación de Carga',
            this.confirmToSendMessage,
            function () {
                _this.generate();
            }
        );
    }else{
        this.generate();
    }
};

MagicModal.prototype.generate = function () {
    Modals.push(this.id);
    $( "body" ).append(this.html());
    setTimeout( this.execute(), 0);
};

MagicModal.prototype.getSendForm = function () {
    var send = ((this.ajaxOptions.send === undefined || this.ajaxOptions.send === '') ? true : this.ajaxOptions.send );
    return ( send ? ( ($('#' + this.id).find('form').attr('id') !== undefined)) : send );
};

MagicModal.prototype.getAfterExecute = function () { return this.afterExecute; };
MagicModal.prototype.getBeforeLoad = function () { return this.beforeLoad; };
MagicModal.prototype.getWhenClose = function () { return this.whenClose; };
MagicModal.prototype.getUrl = function () { return this.url; };

MagicModal.prototype.setWhenClose = function (value) { this.whenClose = value; };
MagicModal.prototype.setAfterExecute = function (value) { this.afterExecute = value; };
MagicModal.prototype.setBeforeLoad = function (value) { this.beforeLoad = value; };
MagicModal.prototype.setActiveWhenClose = function () {this.activeWhenClose = true; };
MagicModal.prototype.setInactiveWhenClose = function () {this.activeWhenClose = false; };
MagicModal.prototype.setUrl = function (url) {this.url = url; };
MagicModal.prototype.unSetToConfirmClose = function () {this.confirmToClose = false; };

MagicModal.prototype.execute = function () {loading(true);
    this.sending = false;
    var params = 'modal:true, modal_name:' + this.id;
    var _this = this;
    $.get(
        this.url,
        toJSON( params )
    ).done(
        function( data, textStatus, jqXHR ) {
            loading(false);
            if (isJSON(data)) {
                if(data.error){
                    setTimeout( _this.id + '.setInactiveWhenClose()', 0 );
                    setTimeout( _this.id + '.executeClose()', 0 );
                    new MagicMessage(
                        'error',
                        data.data.title,
                        data.data.data,
                        '',
                        function() {
                            if(data.redirect) location.reload();
                        }
                    )
                }else{
                    _this.construct(data);
                }
            } else{
                _this.construct(data);
            }
        }
    ).fail(
        function( jqXHR, textStatus, errorThrown ) { loading( false );
            setTimeout( _this.id + '.executeClose()', 0 );
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
};

MagicModal.prototype.construct = function (data) {
    var _modal = $('div#' + this.id);
    $('body').addClass('modal-open');

    $('#' + this.id + '-modal-content').html(data);

    _modal.find('.control_modal').find('#_execute_form').attr('form', this.id);
    _modal.find('.control_modal').find('#_execute_form').attr('id', 'execute_form');
    _modal.find('.control_modal').find('._close_no_question').attr('onclick', this.id + '.close(); return false;');

    _modal.find('.modal-footer-buttons').html(_modal.find('.control_modal').html());

    if ( !this.getBeforeLoad() === false ) setTimeout( this.getBeforeLoad(), 0 );
    setTimeout( this.appendJS() );
    setTimeout( this.setFocus(), 100);
};

MagicModal.prototype.setFocus = function(){
    $( "div#" + this.id ).find('form').find('input, textarea, select')
        .not('input[type=hidden],input[type=button],input[type=submit],input[type=reset],input[type=image],button')
        .filter(':enabled:visible:first')
        .focus();
};

MagicModal.prototype.disabledSubmit = function () {
    this.sending = true;
    $( "div#" + this.id ).find('#execute_form').addClass('disabled').prop('disabled', true);
};

MagicModal.prototype.enabledSubmit = function () {
    this.sending = false;
    $( "div#" + this.id ).find('#execute_form').removeClass('disabled').prop('disabled', false);
};

MagicModal.prototype.hasError = function () {
    return $( "div#" + this.id ).find( 'form' ).find('.has-error').length;
};

MagicModal.prototype.appendJS = function () {
    var _this = this;
    var _modal = $('div#' + _this.id );

    setTimeout(
        function(){
            $(document).find( '.modal-backdrop' ).remove();
            setTimeout(
                function(){
                    $("#" + _this.id + "_modal-backdrop").addClass("modal-backdrop fade in");
                }, 0
            );
        }, 0
    );

    _modal.find( '.for-buttons-modal' ).append(_this.htmlModalHeader());

    _modal.find( '.footer-form' ).remove();
    if(_this.getSendForm()){
        _modal.find( '.footer-form' ).remove();
    }else{
        _modal.find( '#execute_form' ).remove();
        _modal.find( '#cancel_modal' ).html( 'Close ' );
    }
    $(document).on('beforeSubmit', ".comments-main-form form, .comment-form form", function (event, messages) {
        $(this).find("[type=submit]").prop('disabled', true);
    });

    _modal.find('form').append("\
         <script> \
                var " + _this.id + "_load = new LoadModal('" + _this.id + "');\
            $(function() {\
				var div = $( 'div#" + _this.id + "' );\
                div.find( 'form' ).attr('onSubmit','setTimeout(' + _this.id + '.disabledSubmit(), 0);setTimeout(" + _this.id + "_load.load());');\
                var form = div.find( 'form' );\
                var afterExecute = " + _this.getAfterExecute() + ";\
                var modal = '" + _this.id + "';\
                var options = { \
                    url:        form.attr( 'action' ), \
                    success:    function(data, textStatus, jqXHR) {\
						loading(false);\
						setTimeout( modal + '.enabledSubmit()', 0 );\
						endRequest(modal, data, afterExecute);\
                    },\
                    error:      function(jqXHR, textStatus, errorThrown){\
                        loading(false);\
                        setTimeout( modal + '.enabledSubmit()', 0 );\
                        if( jqXHR.status !== 302 ){\
							new MagicMessage(\
                                'error',\
                                 errorjqXHR(jqXHR.status ,  jqXHR.responseText),\
                                 jqXHR.responseText\
                            )\
                        }\
                    }\
                }; \
                div.find( 'form' ).ajaxForm(options);\
            });\
        </script>"
    );
};

function endSubmitForm(modal, afterExecute){
    setTimeout( modal + '.executeClose()', 0 );
    if(!afterExecute === false) setTimeout( afterExecute, 0 );
}

function endRequest(modal, data, afterExecute){
    if (isJSON(data)) {
        if(data.error === true){
            new MagicMessage(
                'error',
                data.data.title,
                data.data.data
            )
        }else{
            if(data.setUrl === true){
                if(data.close_parent === false){
                    temporalModal = new MagicModal(data.url,'','','temporalModal');
                }else{
                    setTimeout( modal + '.setUrl(\"' + data.url + '\")', 0 );
                    setTimeout( modal + '.unSetToConfirmClose()');
                    setTimeout( modal + '.setActiveWhenClose()');
                    setTimeout( modal + '.execute()', 0 );
                }
            }else{console.log('set value');
                if(data.magicResponseSet === true){
                    var attribute = $('#' + data.magic_response_attribute_id);
                    attribute.append($('<option>', {
                        value: data.magic_response_attribute_id_value,
                        text : data.magic_response_attribute_value
                    }));

                    attribute.val(data.magic_response_attribute_id_value);
                    attribute.trigger('change');
                }
                endSubmitForm(modal, afterExecute);
            }
        }
    }else{
        endSubmitForm(modal, afterExecute)
    }
}

$(document).on('click', '.close_no_question', function (e) {
    e.preventDefault();
    setTimeout( $(this).attr('modal') + '.close()',0);
});

MagicModal.prototype.close = function () {
    if(this.sending) return false;
    _this = this;
    if(_this.confirmToClose === true){
        new MagicMessage(
            'confirm',
            'Confirmación de Cierre',
            'Si cierra la pantalla puede perder información importante. <br><br><strong>¿Desea continuar?</strong>',
            function(){
                _this.executeClose();
            },
            ''
        )
    }else{
        _this.executeClose();
    }
};

function removeItemFromArr( arr, item ) {
    return arr.filter( function( e ) {
        return e !== item;
    } );
}

function LoadModal(modal) {
    this.modal =  modal;
}
LoadModal.prototype.load = function(){
    var content = $( 'div#' + this.modal);
    var hasError =  content.find( 'form' ).find('.has-error').length;
    lengthContent = content.find( 'form' ).length;
    if(hasError || lengthContent == 0){
        loading(false);
        setTimeout(this.modal + ".enabledSubmit()", 0);
        return false;
    }else{
        setTimeout(this.modal + '_load.load()', 0);
    }
};

MagicModal.prototype.executeClose = function () {
    loading(false);

    if (isFullScreen()) setTimeout( toggleFullScreen() , 0 );

    Modals.pop();

    if(Modals.length === 0) $( 'body' ).removeClass( 'modal-open' ).addClass( '' );

    $('#' + this.id ).modal( 'hide' ).remove();
    $('#' + this.id + '_modal-backdrop' ).remove();

    if(this.activeWhenClose)
        if(!this.getWhenClose() === false) setTimeout( this.getWhenClose() , 0 );
};

function isFullScreen(){
    return !(!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement);
}

MagicModal.prototype.fullScreen = function(){
    this.maximize();
    setTimeout( toggleFullScreen() , 0 );
};

MagicModal.prototype.zoom = function(){
    if(this.isMaximized()) this.minimize();
    else this.maximize();
};

MagicModal.prototype.isMaximized = function(){
    return $('#' + this.id).hasClass('file-zoom-fullscreen');
};

MagicModal.prototype.minimize = function(){
    if(isFullScreen()) this.fullScreen();

    var _div = $('#' + this.id );

    _div.removeClass( 'file-zoom-fullscreen' );
    _div.find( '#icon_window_maximize' ).removeClass( 'fa-window-restore' ).addClass( 'fa-window-maximize' );

    $( '#' + this.id + '-modal-body' ).removeClass('resize');
    $( '#' + this.id + '-modal-content' ).removeClass('resize');
    _div.find( '.content-in-modal' ).removeClass('resize');

    $( 'div#' + this.id ).find( '.content-in-modal' ).css({
        "overflow-y": "none",
        "height": 'auto'
    });
};

MagicModal.prototype.maximize = function(){
    var _div = $('#' + this.id );

    var heightHeader = $( 'div#' + this.id ).find( '.modal-header' ).innerHeight();
    var heightFooter = $( '#' + this.id + '-modal-footer').innerHeight();

    _div.addClass("file-zoom-fullscreen");
    _div.find( '#icon_window_maximize' ).removeClass('fa-window-maximize').addClass('fa-window-restore');

    $( '#' + this.id + '-modal-body').addClass('resize');
    $( '#' + this.id + '-modal-content').addClass('resize');
    _div.find( '.content-in-modal' ).addClass('resize');

    _div.find( '.content-in-modal' ).css({
        "overflow-y": "scroll",
        "height": ($( window ).height() - (heightHeader + heightFooter))
    });
};

MagicModal.prototype.htmlModalHeader = function(){
    return '\
        <button onclick="' + this.id + '.refresh()" type="button" class="btn bg-orange btn-flat bnt-refresh" data-toggle="button" aria-pressed="false">\
            <i class="fa fa-refresh"></i>\
        </button>\
        <button onclick="' + this.id + '.fullScreen()" type="button" class="btn bg-green btn-fullscreen btn-flat" data-toggle="button" aria-pressed="false">\
            <i class="fa fa-arrows-alt"></i>\
        </button>\
        <button onclick="' + this.id + '.zoom()" id = "zoom_modal" type="button" class="btn bg-orange btn-borderless btn-flat" data-toggle="button" aria-pressed="false">\
            <i id = "icon_window_maximize" class="fa fa-window-maximize"></i>\
        </button>\
        <button onclick="' + this.id + '.close()" type="button" class= "btn bg-red btn-flat">\
            <i class="glyphicon glyphicon-remove"></i>\
        </button>'
};

MagicModal.prototype.refresh = function(){
    _this = this;
    new MagicMessage(
        'confirm',
        'Recargar Pantalla',
        'Esta acción retornará sus datos a la última actualización. <br><br><strong>Los cambios recientes se perderán.</strong>',
        function(){_this.execute();},
        ''
    )
};

$(document).on('click', '#execute_form', function (evt) {
    $(this).blur();
    var modal = window[$(this).attr('form')];
    var form = $( 'div#' + $(this).attr('form') ).find( 'form' );

    evt.preventDefault();

    if(modal.confirmToSend === true){
        new MagicMessage(
            'confirm',
            'Confirmación de Envío',
            modal.confirmToSendMessage,
            function(){modal.sendForm(form);},
            ''
        )
    }else{
        setTimeout( modal.sendForm(form), 0 );
    }
});

MagicModal.prototype.sendForm = function(form){
    if(this.sending === false){
        loading(true);
        $(form).submit();
    }
};

MagicModal.prototype.htmlModalFooter = function(){
    return '\
    <div class = "">\
        <button type="button" id="execute_form" form = "' + this.id + '"  class = "btn btn-success"> \
            <span class ="glyphicon glyphicon-ok" style="padding-right: 3px"/>\
            Enviar\
         </button>\
        <button onclick="' + this.id + '.close()" type="button" class= "btn btn-warning" >\
            <span class ="glyphicon glyphicon-ban-circle style="padding-right: 3px"/>\
            <span id="cancel_modal">Cerrar </span>\
        </button>\
    </div>';
};

MagicModal.prototype.html = function(){
    return '\
    <div id="' + this.id + '" class="file-zoom-dialog modal fade in" role="dialog" tabindex = "-1" tabindex data-backdrop="static" style="display: block; padding-right: 17px;">\
        <div class="modal-dialog modal-lg">\
            <div class="modal-content" style = "border-radius: 4px">\
                <div id="' + this.id + '-modal-body" class="">\
                    <div id="' + this.id + '-modal-content">\
                        <h1 style = "font-size: 80px; text-align: center; color: #F5F5F5">loading...</h1>\
                    </div>\
                </div>\
                <div id="' + this.id + '-modal-footer" class="modal-footer" style = "background-color: #3c3f41; padding: 5px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px">\
                    <div class = "modal-footer-buttons btn-group"></div>\
                </div>\
            </div>\
        </div>\
        <script>\
            $(window).resize(function() {\
				var div = $( "div#' + this.id + '" );\
                var heightHeader = div.find( ".modal-header" ).innerHeight();\
                var heightFooter = $( "#' + this.id + '-modal-footer").innerHeight();\
                if(div.hasClass("file-zoom-fullscreen")){\
                    div.find( ".content-in-modal" ).css({\
                        "overflow-y":       "scroll",\
                        "height":           ($( window ).height() - (heightFooter + heightHeader + 8)),\
                    });\
                }\
            });\
        </script>\
    </div>\
    <div class = "modal-backdrop fade in" id = "' + this.id + '_modal-backdrop"/>';
};