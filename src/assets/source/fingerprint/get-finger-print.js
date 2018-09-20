$(document).on("click", "#begin_invoice_system", function (e) {
    e.preventDefault();
    var href = $( this ).attr("href");
    var fp = new Fingerprint2();
    fp.get(function(result, components) {
        window.location = href + '?token=' + result;
    });
});