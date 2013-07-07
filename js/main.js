//page setup
$(function() {
    $(".page").hide();
    if (location.hash) {
        $(location.hash).show();
        $(".nav a[href="+location.hash+"]").parents("li").addClass("active");
        changePage(location.hash);
    } else {
        $(".page").eq(0).show();
        $(".nav li").eq(0).addClass("active");
    }
    $(".nav a, a.brand").bind("click", function(e) {
        $(".page").hide();
        var id = $(e.target).attr("href");
        $(id).show();
        $(".nav li").removeClass("active");
        $(e.target).parents("li").addClass("active");
        changePage(id);
    });
    $(".next-page").bind("click", function(e) {
        var curPage = $(e.target).parents(".page");
        $(".page").hide();
        var curNav = $(".nav li.active");
        $(".nav li").removeClass("active");
        curPage.next(".page").show();
        curNav.next("li").addClass("active");
        changePage("#" + curPage.next(".page").attr("id"));
    });

    initForms();
    initSteps();
});

function changePage(page) {
    if (page == "#simulation") {
        resetSteps();
    }
}

function resetSteps() {
    $(".step").hide();
    $(".step:first").show();
    $(".step-controls .btn.restart").hide();
    $(".step-controls .btn.prev").hide();
}

function initSteps() {
    resetSteps();
    //next button
    $(".step-controls .btn.next").bind("click", function(e) {
        var $step = $(".step:visible").hide().next().show();
        if ($step.prev().is(".step:first")) {
            $(".step-controls .btn.prev").show();
        } 
        if ($step.is(".step:last")) {
            $(".step-controls .btn.next").hide();
            $(".step-controls .btn.restart").show();
        }
    });
    //previous button
    $(".step-controls .btn.prev").bind("click", function(e) {
        var $step = $(".step:visible").hide().prev().show();
        if ($step.is(".step:first")) {
            $(".step-controls .btn.prev").hide();
        } 
        if ($step.next().is(".step:last")) {
            $(".step-controls .btn.restart").hide();
            $(".step-controls .btn.next").show();
        }
    });
    //reset button
    $(".step-controls .btn.restart").bind("click", function(e) {
        $(".step:visible").hide();
        $(".step").eq(0).show();
        $(".step-controls .btn.prev").hide();
        $(".step-controls .btn.restart").hide();
        $(".step-controls .btn.next").show();
    });
}

//form initialization
function initForms() {
    var select;
    select = $(".step").eq(0).find("select");
    $.getJSON("data/cities.json").done(function(data) {
        $(".step").eq(0).data("stat-set",data);
        $.each(data, function(id,city) {$(select).append("<option value='"+id+"'>"+city.name+"</option>");})
        $(select).change();
    });
    $(select).change(function() {
        updateStats($(this).parents(".step"), this.value);
    }); 

    var sqfoot_max = 414000;
    $("#sqfoot-slider").slider({
        value: sqfoot_max,
        range: "min",
        min: 0,
        max: sqfoot_max,
        step: 1,
        slide: function (event, ui) {
            $("#sqfoot").val(ui.value);
        }
    });

    $("#hours-slider").slider({
        value: 12,
        range: "min",
        min: 0,
        max: 24,
        step: 1,
        slide: function (event, ui) {
            $("#hours").val(ui.value);
        }
    });
}

function updateStats(step, key) {
    var data = $(step).data("stat-set")[key];
    $(step).find("img").attr("src", "img/"+data["image"]);
    $(step).find(".stat-value").each(function(ind, stat) {
        $(stat).html(data[$(stat).data("stat-type")]);
    });
}
