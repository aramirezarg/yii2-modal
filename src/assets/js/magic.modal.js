let Modals = [];

/**INIT FROM ATTRIBUTE**/
function MagicModalInit(e) {
    e.stopPropagation();
    e.preventDefault();

    $(this).blur();
    let name = (_name = $(this).attr('magic-modal-name')) === undefined || _name === '' ? createId() : _name;
    let url = (_url = $(this).attr('href')) === undefined ? $(this).attr('url') : _url;
    let ajaxOptions = $(this).attr('ajaxOptions');
    let jsFunctions = $(this).attr('jsFunctions');
    let params = $(this).attr('data-params');

    window[name] = new MagicModal(url, ajaxOptions, jsFunctions, name, params);
}
/**INIT FROM ATTRIBUTE**/

class MagicModal{
    constructor(url, ajaxOptions, jsFunctions, name, params) {
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

        this.afterExecute = objectIsSet(this.jsFunctions.afterExecute) ? "'" + this.jsFunctions.afterExecute + "'" : false;
        this.beforeLoad = objectIsSet(this.jsFunctions.beforeLoad) ? this.jsFunctions.beforeLoad : false;
        this.whenClose = objectIsSet(this.jsFunctions.whenClose) ? this.jsFunctions.whenClose : false;
        this.activeWhenClose = objectIsSet(this.jsFunctions.activeWhenClose) ? this.jsFunctions.activeWhenClose : false;

        self = this;

        if(self.confirmToLoad) {
            new MagicMessage(
                'confirm',
                MagicsoftLanguage('Confirmation to load'),
                MagicsoftLanguage('Execute this action?'),
                function () {self.generate()}
            );
        }else{
            self.generate();
        }
    }

    addListeners(){
        var items = document.getElementsByClassName('magic-modal');
        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', MagicModalInit);
        }
    }

    hasForm(){
        let send = ((this.ajaxOptions.send === undefined || this.ajaxOptions.send === '') ? true : this.ajaxOptions.send);
        return ( send ? ( ($('#' + this.id).find('form').attr('id') !== undefined)) : send );
    }

    generate(){
        Modals.push(this.id);

        $("body").append(this.html()).addClass('modal-open');
        $('div#' + this.id).fadeIn(200);
        this.execute();
    }

    execute() {
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
                        setTimeout(self.id + '.activeWhenClose = false', 0);
                        setTimeout(self.id + '.executeClose()', 0);
                        new MagicMessage(
                            'error',
                            data.data.title,
                            data.data.data,
                            '',
                            function() {if(data.redirect) location.reload();}
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
    }

    construct(data){
        self = this;
        var contentDiv = $("div#" + self.id);

        contentDiv.find('.modal-dialog').html(data);
        contentDiv.find('.magic-modal-content').addClass('modal-content');

        contentDiv.find('.magic-modal-buttons').append(self.htmlModalButtons());
        contentDiv.find('.magic-form-submit').attr('magic-modal-name', self.id).addClass('magic-modal-execute');
        contentDiv.find('.magic-form-cancel').attr('magic-modal-name', self.id).addClass('magic-modal-close');

        self.beforeLoadExecute();
        self.appendJS();
        self.setFocus();
        self.addListeners();
    }

    appendJS(){
        self = this;
        let _modal = $('div#' + self.id);

        $(document).find( '.modal-backdrop' ).remove();

        /*if(_modal.find('.for-buttons-modal').length > 0){
            _modal.find('.for-buttons-modal').append(self.htmlModalButtons());
        }else{
            _modal.find('.data-modal').prepend(self.htmlModalHeader());
        }*/

        _modal.find('form').append("\
             <script> \
                " + self.id + "_load = new LoadModal('" + self.id + "');\
                $(function() {\
                    let div = $( 'div#" + self.id + "' );\
                    div.find( 'form' ).attr('onSubmit','setTimeout(' + self.id + '.disabledSubmit(), 0);setTimeout(" + self.id + "_load.load());');\
                    let form = div.find( 'form' );\
                    let afterExecute = " + self.afterExecute + ";\
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
    }

    setFocus(){
        $( "div#" + this.id ).find('form').find('input, textarea, select')
            .not('input[type=hidden],input[type=button],input[type=submit],input[type=reset],input[type=image],button')
            .filter(':enabled:visible:first')
            .focus();
    }

    disabledSubmit(){
        this.sending = true;
        $( "div#" + this.id ).find('.magic-form-submit').addClass('disabled').prop('disabled', true);
    }

    enabledSubmit(){
        this.sending = false;
        $( "div#" + this.id ).find('.magic-form-submit').removeClass('disabled').prop('disabled', false);
    }

    hasError(){
        return $( "div#" + this.id ).find( 'form' ).find('.has-error').length;
    }

    close(){
        if(this.sending) return false;
        self = this;
        if(self.confirmToClose === true){
            new MagicMessage(
                'confirm',
                MagicsoftLanguage('Confirmation to close'),
                MagicsoftLanguage('If you close the screen you may lose important information. <br> <br> <strong> Do you want to continue?</strong>'),
                function(){
                    self.executeClose();
                },
                ''
            )
        }else{
            self.executeClose();
        }
    }

    executeClose() {
        loading(false);
        Modals.pop();
        if(Modals.length === 0) $( 'body' ).removeClass('modal-open');

        $(document).find('div#' + this.id).fadeOut(200).remove();

        this.whenCloseExecute();
    }

    refresh(){
        self = this;
        new MagicMessage(
            'confirm',
            MagicsoftLanguage('Reload this window'),
            MagicsoftLanguage('This action will return your data to the latest update. <br> <br> <strong> Recent changes will be lost.</strong>'),
            function(){self.execute()},
            ''
        )
    }

    sendForm(form){
        if(this.sending === false){
            loading(true);
            $(form).submit();
        }
    }

    beforeLoadExecute(){
        if(!self.beforeLoad === false) setTimeout( self.beforeLoad, 0 );
    }

    whenCloseExecute(){
        if(this.activeWhenClose) if(!this.whenClose === false) setTimeout( this.whenClose , 0 );
    }

    html(){
        return '\
        <div id = "' + this.id + '" class="modal" data-backdrop="static" style="display: none;">\
            <div class="modal-dialog modal-lg">\
                <div class="magic-modal-content">\
                    <h1 style = "font-size: 80px; text-align: center; color: #ced1d2 !important;">loading...</h1>\
                </div>\
            </div>\
        </div>';
    }

    htmlModalHeader(){
        return '\
        <div class="modal-header">\
            <h3 class="modal-title">\
                <i class="fa fa-list-ul" style="font-size: x-large; text-decoration: none; padding-right: 5px; color:orange;"></i>\
                <strong style="font-size: x-large; text-decoration: none; color:black">Modal</strong>\
                <i class="ion ion-ios-arrow-right" style="padding-right: 5px; padding-left: 5px;"></i>\
                <small style="font-size: large; text-decoration:none;">DEFAULT VIEW</small>\
            </h3>' +
            this.htmlModalButtons() + '\
        </div>';
    }

    htmlModalButtons(){
        return '\
        <button magic-modal-name="' + this.id + '" type="button" class="magic-modal-refresh btn-default btn btn-outline-secondary btn-rounded" data-toggle="button" aria-pressed="false">\
            <i class="fa fa-refresh ti-reload"></i>\
        </button>\
        <button magic-modal-name="' + this.id + '" type="button" class= "magic-modal-close btn-default btn btn-outline-secondary btn-rounded">\
            <i class="fa fa-close ti-close"></i>\
        </button>'
    }

    htmlModalFooter(){
        return '\
        <div>\
            <button type="button" magic-modal-name="' + this.id + '"  class = "btn btn-success magic-form-submit"> \
                Send\
             </button>\
            <button magic-modal-name="' + this.id + '" type="button" class= "btn btn-warning magic-form-cancel">\
                <span id="cancel_modal">Close</span>\
            </button>\
        </div>';
    }

    setWhenClose(value){this.whenClose = value}
    setAfterExecute(value){this.afterExecute = value}
    setBeforeLoad(value){this.beforeLoad = value}
    setActiveWhenClose(){this.activeWhenClose = true}
    setInactiveWhenClose(){this.activeWhenClose = false;}
    setUrl(url){this.url = url}
}
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
                    setTimeout(_modal.url = data.url, 0 );
                    setTimeout(_modal.this.confirmToClose = false, 0 );
                    setTimeout(_modal.this.activeWhenClose = true, 0 );
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
            MagicsoftLanguage('Confirmation to send'),
            MagicsoftLanguage('Send data to server?'),
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