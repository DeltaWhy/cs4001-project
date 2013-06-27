$(function() {
    $(".step").hide();
    $(".step-controls .btn.restart").hide();
    $(".step-controls").hide();
    $(".step:first").show();
    //initial next button
    $(".step .btn.next").bind("click", function(e) {
        $(this).parents(".step").hide();
        $(this).parents(".step").next().show();
        $(".step-controls").show();
    });
    //next button
    $(".step-controls .btn.next").bind("click", function(e) {
        var $step = $(".step:visible").hide().next().show();
        if ($step.is(".step:last")) {
            $(".step-controls .btn.next").hide();
            $(".step-controls .btn.restart").show();
        }
    });
    //previous button
    $(".step-controls .btn.prev").bind("click", function(e) {
        var $step = $(".step:visible").hide().prev().show();
        if ($step.is(".step:first")) {
            $(".step-controls").hide();
        } else if ($step.next().is(".step:last")) {
            $(".step-controls .btn.restart").hide();
            $(".step-controls .btn.next").show();
        }
    });
    //reset button
    $(".step-controls .btn.restart").bind("click", function(e) {
        $(".step:visible").hide();
        $(".step").eq(1).show();
        $(".step-controls .btn.restart").hide();
        $(".step-controls .btn.next").show();
    });
});

//form initialization
$(function() {
    $.getJSON("data/cities.json").done(function(data) {
        $(".step").eq(1).data("stat-set",data);
    });
    $(".step").eq(1).find("input").bind("click", function(e) {
        updateStats($(this).parents(".step"), this.value);
    });
});

function updateStats(step, key) {
        var data = $(step).data("stat-set")[key];
        console.log($(step).data("stat-set"));
        $(step).find("img").attr("src", "img/"+data["image"]);
        $(step).find(".stat-value").each(function(ind, stat) {
            $(stat).html(data[$(stat).data("stat-type")]);
        });
}
