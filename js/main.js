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
        changeStep($(".step:first"));
    }
}

function changeStep(step) {
    $(".step").hide();
    $(step).show();
    if ($(step).attr("id") == "results") {
        updateResults();
    }
    if ($(step).is(":first")) {
        $(".step-controls .btn.restart").hide();
        $(".step-controls .btn.prev").hide();
        $(".step-controls .btn.next").show();
    } else if ($(step).is(":last")) {
        $(".step-controls .btn.restart").show();
        $(".step-controls .btn.prev").show();
        $(".step-controls .btn.next").hide();
    } else {
        $(".step-controls .btn.restart").hide();
        $(".step-controls .btn.prev").show();
        $(".step-controls .btn.next").show();
    }
}

function initSteps() {
    changeStep($(".step:first"));
    //next button
    $(".step-controls .btn.next").bind("click", function(e) {
        changeStep($(".step:visible").next(".step"));
    });
    //previous button
    $(".step-controls .btn.prev").bind("click", function(e) {
        changeStep($(".step:visible").prev(".step"));
    });
    //reset button
    $(".step-controls .btn.restart").bind("click", function(e) {
        changeStep($(".step:first"));
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
