let Modals = [];

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

        this.afterExecute = objectIsSet(this.jsFunctions.afterExecute) ? this.jsFunctions.afterExecute : false;
        this.beforeLoad = objectIsSet(this.jsFunctions.beforeLoad) ? this.jsFunctions.beforeLoad : false;
        this.whenClose = objectIsSet(this.jsFunctions.whenClose) ? this.jsFunctions.whenClose : false;
        this.activeWhenClose = objectIsSet(this.jsFunctions.activeWhenClose) ? this.jsFunctions.activeWhenClose : false;

        let self = this;

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

    hasForm(){
        let send = ((this.ajaxOptions.send === undefined || this.ajaxOptions.send === '') ? true : this.ajaxOptions.send);
        return ( send ? ( ($('#' + this.id).find('form').attr('id') !== undefined)) : send );
    }

    generate(){
        Modals.push(this.id);

        $("body").append(this.html()).addClass('modal-open');
        this.execute();
    }

    execute(){
        loading(true);
        let self = this;
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
        let self = this;
        var contentDiv = $("div#" + self.id);

        contentDiv.find('.modal-dialog').html(data);
        contentDiv.find('.magic-modal-content').addClass('modal-content');
        contentDiv.fadeIn(300);

        contentDiv.find('.magic-modal-buttons').append(self.htmlModalButtons());
        contentDiv.find('.magic-form-submit').attr('this-magic-modal-name', self.id).addClass('magic-modal-execute');
        contentDiv.find('.magic-form-cancel').attr('this-magic-modal-name', self.id).addClass('magic-modal-close');

        self.beforeLoadExecute();
        self.appendJS();
        self.setFocus();
        setTimeout(self.addListeners(), 0);
    }

    appendJS(){
        let self = this;
        $('div#'+self.id).find('form').append(
            "<script>"+
                self.id+"Load=new LoadModal('"+self.id+"');" +
                "(function(){" +
                    "$('div#"+self.id+"').find('form').attr('onSubmit','setTimeout("+self.id+".disabledSubmit(),0);setTimeout("+self.id+"Load.load());');" +
                    "$('div#"+self.id+"').ajaxForm(window['"+self.id+"'].formOptions());" +
                "}());" +
            "</script>"
        );
    }

    formOptions(){
        let self = this;
        return {
            url: self.getForm().attr( 'action' ),
            success: function(data, textStatus, jqXHR) {
                loading(false);
                self.enabledSubmit();
                endRequest(self, data);
            },
            error: function(jqXHR, textStatus, errorThrown){
                loading(false);
                self.enabledSubmit();
                if( jqXHR.status !== 302 ){
                    new MagicMessage(
                        'error',
                        errorjqXHR(jqXHR.status ,  jqXHR.responseText),
                        jqXHR.responseText
                    )
                }
            }
        };
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
        let self = this;
        if(self.sending) return false;
        if(self.confirmToClose === true){
            new MagicMessage(
                'confirm',
                MagicsoftLanguage('Confirmation to close'),
                MagicsoftLanguage('If you close the screen you may lose important information. <br> <br> <strong> Do you want to continue?</strong>'),
                function(){self.executeClose();}
            )
        }else{
            self.executeClose();
        }
    }

    executeClose() {
        loading(false);
        let modalId = this.id;
        this.whenCloseExecute();

        Modals.pop();
        let divModal = $(document).find('div#' + modalId);

        setTimeout(function(){
    		divModal.fadeOut(200);
    		setTimeout(function(){
    			divModal.remove();
                $(document).find('div#' + modalId + '-backdrop').remove();
    			if(Modals.length === 0) $( 'body' ).removeClass('modal-open');
    		}, 0)
    	}, 200);
    }

    refresh(){
        let self = this;
        new MagicMessage(
            'confirm',
            MagicsoftLanguage('Reload this window'),
            MagicsoftLanguage('This action will return your data to the latest update. <br> <br> <strong> Recent changes will be lost.</strong>'),
            function(){self.execute()}
        )
    }

    getForm(){
        return $('div#' + this.id).find('form');
    }

    sendForm(){
        if(this.sending === false){
            loading(true);
            this.getForm().submit();
        }
    }

    beforeLoadExecute(){
        let self = this;
        if(!self.beforeLoad === false) setTimeout( self.beforeLoad, 0 );
    }

    whenCloseExecute(){
        if(this.activeWhenClose) if(!this.whenClose === false) setTimeout( this.whenClose , 0 );
    }

    addListeners(){
        let self = this;

        var buttonModal = document.querySelectorAll('.magic-modal');
        for (var i = 0; i < buttonModal.length; i++) {
            buttonModal[i].addEventListener('click', MagicModalInit);
        }

        document.querySelector('.magic-modal-refresh').addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            this.blur();

            self.refresh();
        })

        let buttonClose = document.querySelectorAll('.magic-modal-close');
        for (var i = 0; i < buttonClose.length; i++) {
            buttonClose[i].addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                this.blur();

                self.close();
            });
        }

        document.querySelector('.magic-modal-execute').addEventListener('click', function(e){
            e.stopPropagation();
            e.preventDefault();
            this.blur();

            if(self.confirmToSend === true){
                new MagicMessage(
                    'confirm',
                    MagicsoftLanguage('Confirmation to send'),
                    MagicsoftLanguage('Send data to server?'),
                    function(){self.sendForm();},
                    ''
                )
            }else{
                self.sendForm();
            }
        })
    }

    html(){
        return '\
        <div id = "' + this.id + '" class="modal" data-backdrop="static" style="display: none;">\
            <div class="modal-dialog modal-xl modal-lg">\
                <div class="magic-modal-content">\
                    <h1 style = "font-size: 80px; text-align: center; color: #ced1d2 !important;">loading...</h1>\
                </div>\
            </div>\
        </div>\
        <div id = "' + this.id + '-backdrop" class = "modal-backdrop show"></div>';
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
        <button type="button" class="magic-modal-refresh btn-default btn btn-outline-secondary btn-rounded">\
            <i class="fa fa-refresh ti-reload"></i>\
        </button>\
        <button type="button" class= "magic-modal-close btn-default btn btn-outline-secondary btn-rounded">\
            <i class="fa fa-close ti-close"></i>\
        </button>'
    }

    htmlModalFooter(){
        return '\
        <div>\
            <button type="button" this-magic-modal-name="' + this.id + '"  class = "btn btn-success magic-form-submit"> \
                Send\
             </button>\
            <button this-magic-modal-name="' + this.id + '" type="button" class= "btn btn-warning magic-form-cancel">\
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
function endRequest(modal, data){
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
                    MagicTemporalModal = new MagicModal(data.url,'','','MagicTemporalModal');
                }else{
                    modal.url = data.url;
                    modal.confirmToClose = false;
                    modal.activeWhenClose = true;
                    setTimeout(modal.execute(), 0 );
                }
            }else{
                if(typeof(attribute = $('#' + data.magic_select_attribute)) != "undefined"){
                    attribute.empty().append($('<option>', {
                        value: data.magic_select_value,
                        text: data.magic_select_text
                    })).val(data.magic_select_value).trigger('change');
                }
                endSubmitForm(modal);
            }
        }
    }else{
        endSubmitForm(modal)
    }
}

function endSubmitForm(modal){
    modal.executeClose();

    if(!modal.afterExecute === false){
        setTimeout(modal.afterExecute, 0);
    }
}

class LoadModal{
    constructor(modal){
        this.modal =  modal;
    }
    load(){
        if(window[this.modal].hasError() || $( 'div#' + this.modal).find( 'form' ).length == 0){
            loading(false);
            window[this.modal].enabledSubmit();
            return false;
        }else{
            setTimeout(this.modal + 'Load.load()', 0);
        }
    }
}

var magicModalClass = document.querySelectorAll('.magic-modal');
for (var i = 0; i < magicModalClass.length; i++) {
    magicModalClass[i].addEventListener('click', MagicModalInit);
}

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

/**EXTRA FUNCTIONS AND OPTIONS**/