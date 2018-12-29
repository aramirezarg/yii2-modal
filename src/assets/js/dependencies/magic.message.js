class MagicMessage{
    constructor(type, title, message, okFunction, cancelFunction, name){
        this.class = '';
        this.color = '';
        this.icon = '';

        this.type = type;
        this.title = title;
        this.message = message;
        this.okFunction = okFunction;
        this.cancelFunction = cancelFunction;
        this.name = name;

        if(objectIsSet(name)){
            this.construct();
        }else{
            name = this.getName();
            window[name] = new MagicMessage(type, title, message, okFunction, cancelFunction, name);
        }
    }

    construct() {
        Modals.push(this.name);

        this.setConfig();

        $( "body" ).append("\
            <div class = 'modal bootstrap-dialog type-" + this.class + this.name + " size-normal' data-backdrop='static' style='display: none;'>\
                <div class='modal-dialog'>\
                    <div class='modal-content' style = 'border-radius: 4px'>" +
                        this.htmlHead() +
                        this.htmlBody() +
                        this.htmlFooter() + "\
                   </div>\
                </div>\
            </div>"
        ).addClass('modal-open');
        $('.' + this.name).fadeIn(200).find('.content-message').html(this.message);
    }

    setConfig() {
        var config = {
            confirm: {class: "warning ", color: "orange", icon: "glyphicon-question-sign"},
            alert: {class: "info ", color: "#00CED1", icon: "glyphicon-info-sign"},
            error: {class: "warning ", color: "#ff4f3a", icon: "glyphicon-warning-sign"},
            default: {class: "default ", color: "#00CED1", icon: "glyphicon-comment"}
        };

        this.class = config[this.type]['class'];
        this.color = config[this.type]['color'];
        this.icon = config[this.type]['icon'];
    }

    htmlHead(){
        return "\
            <div class='box-header header-form modal-header' style='background-color:" + this.color + ";'>\
                <i class='glyphicon " + this.icon + "' style='font-size: 30px;'></i>\
                <span style='font-size: 25px;'> " + this.title + "</span>\
            </div>\
        ";
    }

    htmlBody(){
        return "\
            <div class='box-body'>\
                <div class = 'content-message' style='font-size: 16px'/>\
            </div>\
        ";
    }

    htmlFooter(){
        return "\
            <div class='box-footer footer-form ' style = 'background-color: whitesmoke;'>\
                <div magic-message = '" + this.name  + "' class='box-tools pull-right'>" +
                    this.okButton() + this.cancelButton() + "\
                </div>\
            </div>\
        ";
    }

    okButton(){
        return "<div class='btn-group'><button class = 'magic-message-run btn btn-" + (this.type == 'confirm' ? 'success' : 'warning') + "'>" + magicModalMessages.confirmTexts.ok + "</button></div>";
    }

    cancelButton(){
        return this.type == 'confirm' ? "<div class='btn-group'><a class='magic-message-close btn btn-warning' style='margin: 5px;'>" + magicModalMessages.confirmTexts.cancel + "</a></div>" : '';
    }

    runOkFunction() {
        setTimeout(this.okFunction, 0);
    }

    runCancelFunction() {
        setTimeout(this.cancelFunction, 0);
    }

    close() {
        Modals.pop();

        if(Modals.length === 0) $('body').removeClass('modal-open');

        $(document).find('.' + this.name).fadeOut(200);
    }

    getName(){
        var name = "", textBase = "abcdefghijklmnopqrstuvwxyz123456789";
        for( var i=0; i < 20; i++ ) name += textBase.charAt(Math.floor(Math.random() * textBase.length));
        return 'MSM_' + name;
    }
};

$(document).on('click', '.magic-message-run', function (e) {
    $(this).blur();
    e.preventDefault();
    magicMessage = $(this).parent().parent().attr('magic-message');

    window[magicMessage].runOkFunction();
    window[magicMessage].close();
});

$(document).on('click', '.magic-message-close', function (e) {
    $(this).blur();
    e.preventDefault();
    magicMessage = $(this).parent().parent().attr('magic-message');

    window[magicMessage].runCancelFunction();
    window[magicMessage].close();
});