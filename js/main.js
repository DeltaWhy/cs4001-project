$(function() {
    $(".step").hide();
    $(".step1").show();
    $(".step .btn.next").bind("click", function(e) {
        $(this).parents(".step").hide();
        $(this).parents(".step").next().show();
    });
    $(".step .btn.prev").bind("click", function(e) {
        $(this).parents(".step").hide();
        $(this).parents(".step").prev().show();
    });
    $(".step .btn.restart").bind("click", function(e) {
        $(this).parents(".step").hide();
        $(".step2").show();
    });
});
