let Modals = [];

/**INIT FROM ATTRIBUTE**/
function MagicModalInit(e) {
    e.stopPropagation();
    e.preventDefault();

    $(this).blur();
    let name = (_name = $(this).attr('name')) === undefined || _name === '' ? createId() : _name;
    let url = (_url = $(this).attr('href')) === undefined ? $(this).attr('url') : _url;
    let ajaxOptions = $(this).attr('ajaxOptions');
    let jsFunctions = $(this).attr('jsFunctions');
    let params = $(this).attr('data-params');

    window[name] = new MagicModal(url, ajaxOptions, jsFunctions, name, params);
}
/**INIT FROM ATTRIBUTE**/

MagicModal = function (url, ajaxOptions, jsFunctions, name, params) {
    this.id = objectIsSet(name) ? name : createId();
    this.sending = false;
    this.url = url;

    this.ajaxOptions = objectIsSet(ajaxOptions) ? ajaxOptions : 'send:true,response:true,confirmToLoad:false,confirmToSend:false,confirmToClose:false';
    this.ajaxOptions = jQuery.parseJSON(checkJSON(this.ajaxOptions) ? this.ajaxOptions : toJSON(this.ajaxOptions));

    this.jsFunctions = objectIsSet(jsFunctions) ? jsFunctions : 'afterExecute:false,beforeLoad:false,whenClose:false,activeWhenClose:false';
    this.jsFunctions = jQuery.parseJSON(checkJSON(this.jsFunctions) ? this.jsFunctions : toJSON(this.jsFunctions));

    params = objectIsSet(params) ? params : '{}';
    this.params = $.extend(true, jQuery.parseJSON(checkJSON(params) ? params : toJSON(params)), {magic_modal_name: this.id});

    this.confirmToLoad = objectIsSet(this.ajaxOptions.confirmToLoad) ? this.ajaxOptions.confirmToLoad : false;
    this.confirmToSend = objectIsSet(this.ajaxOptions.confirmToSend) ? this.ajaxOptions.confirmToSend : false;
    this.confirmToClose = objectIsSet(this.ajaxOptions.confirmToClose) ? this.ajaxOptions.confirmToClose : false;

    this.confirmToLoadMessage = objectIsSet(this.ajaxOptions.confirmToLoadMessage) ? this.ajaxOptions.confirmToLoadMessage : magicModalMessages.confirmToLoad.message;
    this.confirmToSendMessage = objectIsSet(this.ajaxOptions.confirmToSendMessage) ? this.ajaxOptions.confirmToSendMessage : magicModalMessages.confirmToSend.message;
    this.confirmToCloseMessage = objectIsSet(this.ajaxOptions.confirmToCloseMessage) ? this.ajaxOptions.confirmToCloseMessage : magicModalMessages.confirmToClose.message;

    this.afterExecute = objectIsSet(this.jsFunctions.afterExecute) ? "'" + this.jsFunctions.afterExecute + "'" : false;
    this.beforeLoad = objectIsSet(this.jsFunctions.beforeLoad) ? this.jsFunctions.beforeLoad : false;
    this.whenClose = objectIsSet(this.jsFunctions.whenClose) ? this.jsFunctions.whenClose : false;
    this.activeWhenClose = objectIsSet(this.jsFunctions.activeWhenClose) ? this.jsFunctions.activeWhenClose : false;

    self = this;

    if(self.confirmToLoad) {
        new MagicMessage(
            'confirm',
            magicModalMessages.confirmToLoad.title,
            self.confirmToLoadMessage,
            function () {
                self.generate();
            }
        );
    }else{
        self.generate();
    }
};

MagicModal.prototype.addListeners = function(){
    var items = document.getElementsByClassName('magic-modal');
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', MagicModalInit);
    }
}

MagicModal.prototype.getSendForm = function () {
    let send = ((this.ajaxOptions.send === undefined || this.ajaxOptions.send === '') ? true : this.ajaxOptions.send);
    return ( send ? ( ($('#' + this.id).find('form').attr('id') !== undefined)) : send );
};
MagicModal.prototype.getAfterExecute = function () {return this.afterExecute;};
MagicModal.prototype.getBeforeLoad = function () {return this.beforeLoad;};
MagicModal.prototype.getWhenClose = function () {return this.whenClose;};
MagicModal.prototype.getUrl = function () {return this.url;};

MagicModal.prototype.setWhenClose = function (value) {this.whenClose = value;};
MagicModal.prototype.setAfterExecute = function (value) {this.afterExecute = value;};
MagicModal.prototype.setBeforeLoad = function (value) {this.beforeLoad = value;};
MagicModal.prototype.setActiveWhenClose = function () {this.activeWhenClose = true;};
MagicModal.prototype.setInactiveWhenClose = function () {this.activeWhenClose = false;};
MagicModal.prototype.setUrl = function (url) {this.url = url;};

MagicModal.prototype.unSetToConfirmClose = function () {this.confirmToClose = false;};

MagicModal.prototype.generate = function () {
    Modals.push(this.id);
    $( "body" ).append(this.html());
    setTimeout( this.execute(), 0);
};

MagicModal.prototype.execute = function () {
    loading(true);
    self = this;
    self.sending = false;

    $.get(
        self.url,
        self.params
    ).done(
        function( data, textStatus, jqXHR ) {
            loading(false);
            if (isJSON(data)) {
                if(data.error){
                    setTimeout(self.id + '.setInactiveWhenClose()', 0);
                    setTimeout(self.id + '.executeClose()', 0);
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
                    self.construct(data);
                }
            }else{
                self.construct(data);
            }
        }
    ).fail(
        function( jqXHR, textStatus, errorThrown ) {
            loading( false );
            setTimeout( self.id + '.executeClose()', 0 );
            if (jqXHR.status !== 302) {
                new MagicMessage(
                    'error',
                    'Application does not complete',
                    "<strong>Error " + jqXHR.status + "</strong>: " + jqXHR.responseText
                );
            }
        }
    );
};

MagicModal.prototype.construct = function (data) {
    let self = this;
    let _modal = $('div#' + self.id);
    $('body').addClass('modal-open');

    $('#' + self.id + '-modal-content').html(data);

    _modal.find('.magic-form-submit').attr('magic-modal-name', this.id).addClass('magic-modal-execute');
    _modal.find('.magic-form-cancel').attr('magic-modal-name', this.id).addClass('magic-modal-close');

    if ( !self.getBeforeLoad() === false ) setTimeout( self.getBeforeLoad(), 0 );

    setTimeout( self.appendJS(),0 );
    setTimeout( self.setFocus(),0 );
    setTimeout( self.addListeners(),0 );
};

MagicModal.prototype.appendJS = function () {
    self = this;
    let _modal = $('div#' + self.id );

    setTimeout(
        function(){
            $(document).find( '.modal-backdrop' ).remove();
            setTimeout(
                function(){
                    $("#" + self.id + "_modal-backdrop").addClass("modal-backdrop fade in");
                }, 0
            );
        }, 0
    );
    
    if(_modal.find('.for-buttons-modal').length > 0){
        _modal.find('.for-buttons-modal').append(self.htmlModalButtons());
    }else{
        _modal.find('.modal-content').prepend(self.htmlModalHeader());
    }

    _modal.find('form').append("\
         <script> \
            " + self.id + "_load = new LoadModal('" + self.id + "');\
            $(function() {\
				let div = $( 'div#" + self.id + "' );\
                div.find( 'form' ).attr('onSubmit','setTimeout(' + self.id + '.disabledSubmit(), 0);setTimeout(" + self.id + "_load.load());');\
                let form = div.find( 'form' );\
                let afterExecute = " + self.getAfterExecute() + ";\
                let modal = '" + self.id + "';\
                let options = { \
                    url: form.attr( 'action' ), \
                    success: function(data, textStatus, jqXHR) {\
						loading(false);\
						setTimeout(modal + '.enabledSubmit()', 0 );\
						endRequest(modal, data, afterExecute);\
                    },\
                    error: function(jqXHR, textStatus, errorThrown){\
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

MagicModal.prototype.close = function () {
    if(this.sending) return false;
    self = this;
    if(self.confirmToClose === true){
        new MagicMessage(
            'confirm',
            magicModalMessages.confirmToClose.title,
            self.confirmToCloseMessage,
            function(){
                self.executeClose();
            },
            ''
        )
    }else{
        self.executeClose();
    }
};

MagicModal.prototype.executeClose = function () {
    loading(false);

    Modals.pop();

    if(Modals.length === 0) $( 'body' ).removeClass( 'modal-open' ).addClass( '' );

    $('#' + this.id ).modal( 'hide' ).remove();
    $('#' + this.id + '_modal-backdrop' ).remove();

    if(this.activeWhenClose)
        if(!this.getWhenClose() === false) setTimeout( this.getWhenClose() , 0 );
};

MagicModal.prototype.refresh = function(){
    self = this;
    new MagicMessage(
        'confirm',
        magicModalMessages.confirmToReload.title,
        magicModalMessages.confirmToReload.message,
        function(){self.execute();},
        ''
    )
};

MagicModal.prototype.sendForm = function(form){
    if(this.sending === false){
        loading(true);
        $(form).submit();
    }
};

MagicModal.prototype.html = function(){
    return '\
    <div id="' + this.id + '" class="modal fade in" role="dialog" tabindex = "-1" data-backdrop="static" style="display: block;">\
        <div class="modal-dialog modal-lg">\
            <div class="modal-content" style = "border-radius: 4px">\
                <div id="' + this.id + '-modal-body">\
                    <div id="' + this.id + '-modal-content">\
                        <h1 style = "font-size: 80px; text-align: center; color: #F5F5F5">loading...</h1>\
                    </div>\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class = "modal-backdrop fade in" id = "' + this.id + '_modal-backdrop"/>';
};

MagicModal.prototype.htmlModalHeader = function(){
    return '\
    <div class="box-header header-form modal-header" style="background-color: whitesmoke">\
        <h3 class="box-title">\
            <i class="fa fa-list-ul" style="font-size: x-large; text-decoration: none; padding-right: 5px; color:orange;"></i>\
            <strong style="font-size: x-large; text-decoration: none; color:black">Modal</strong>\
            <i class="ion ion-ios-arrow-right" style="padding-right: 5px; padding-left: 5px;"></i>\
            <small style="font-size: large; text-decoration:none;">DEFAULT VIEW</small>\
        </h3>\
        <div class="box-tools pull-right for-buttons-modal">' +
            this.htmlModalButtons() + '\
        </div>\
    </div>';
}

MagicModal.prototype.htmlModalButtons = function(){
    return '\
    <button magic-modal-name="' + this.id + '" type="button" class="magic-modal-refresh btn btn-box-tool bnt-refresh" data-toggle="button" aria-pressed="false">\
        <i class="fa fa-refresh"></i>\
    </button>\
    <button magic-modal-name="' + this.id + '" type="button" class= "magic-modal-close btn btn-box-tool">\
        <i class="glyphicon glyphicon-remove"></i>\
    </button>'
};

MagicModal.prototype.htmlModalFooter = function(){
    return '\
    <div>\
        <button type="button" id="execute_form" form = "' + this.id + '"  class = "btn btn-success"> \
            Send\
         </button>\
        <button magic-modal-name="' + this.id + '" type="button" class= "btn btn-warning" >\
            <span id="cancel_modal">Close</span>\
        </button>\
    </div>';
};

/**EXTRA FUNCTIONS AND OPTIONS**/
function endRequest(modal, data, afterExecute){
    if (checkJSON(data)) {
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
                    _modal = window[modal];
                    setTimeout(_modal.setUrl(data.url), 0 );
                    setTimeout(_modal.unSetToConfirmClose(), 0 );
                    setTimeout(_modal.setActiveWhenClose(), 0 );
                    setTimeout(_modal.execute(), 0 );
                }
            }else{
                if(typeof(attribute = $('#' + data.magic_select_attribute)) != "undefined"){
                    attribute.empty().append($('<option>', {
                        value: data.magic_select_value,
                        text: data.magic_select_text
                    })).val(data.magic_select_value).trigger('change');
                }
                endSubmitForm(modal, afterExecute);
            }
        }
    }else{
        endSubmitForm(modal, afterExecute)
    }
}

function endSubmitForm(_modal, afterExecute){
    window[_modal].executeClose();
    if(!window[_modal].afterExecute === false) setTimeout(afterExecute, 0 );
}

function LoadModal(modal) {
    this.modal =  modal;
}

LoadModal.prototype.load = function(){
    if(window[this.modal].hasError() || $( 'div#' + this.modal).find( 'form' ).length == 0){
        loading(false);
        window[this.modal].enabledSubmit();
        return false;
    }else{
        setTimeout(this.modal + '_load.load()', 0);
    }
};

$(document).on('click', '.magic-modal-execute', function (evt) {
    $(this).blur();
    let modal = window[$(this).attr('magic-modal-name')];
    let form = $( 'div#' + $(this).attr('magic-modal-name') ).find( 'form' );

    evt.preventDefault();

    if(modal.confirmToSend === true){
        new MagicMessage(
            'confirm',
            magicModalMessages.confirmToSend.title,
            modal.confirmToSendMessage,
            function(){modal.sendForm(form);},
            ''
        )
    }else{
        setTimeout( modal.sendForm(form), 0 );
    }
});

$(document).on('click', '.magic-modal-refresh', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).blur();

    window[$(this).attr('magic-modal-name')].refresh();
});

$(document).on('click', '.magic-modal-close', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).blur();

    window[$(this).attr('magic-modal-name')].close();
});

var items = document.getElementsByClassName('magic-modal');
for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', MagicModalInit);
}
/**EXTRA FUNCTIONS AND OPTIONS**/