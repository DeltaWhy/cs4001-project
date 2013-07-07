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
    if ($(step).is(".step:first")) {
        $(".step-controls .btn.restart").hide();
        $(".step-controls .btn.prev").hide();
        $(".step-controls .btn.next").show();
    } else if ($(step).is(".step:last")) {
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

    //load json data and initialize selectors
    var $city_select = $("#city-sel");
    var $building_select = $("#building-sel");
    
    var city_data;
    var building_data;
    $.getJSON("data/cities.json").done(function(data) {
        city_data = data;
        $.each(data, function(id,city) {$city_select.append("<option value='"+id+"'>"+city.name+"</option>");console.log(city);})
        if (building_data) $city_select.change();
    });
    
    $.getJSON("data/buildings.json").done(function(data) {
        building_data = data;
        if (city_data) $city_select.change();
    });
    
    $city_select.change(function() {
        var $step = $(this).parents(".step");
        var city = city_data[this.value];
        $step.find("img").attr("src", "img/"+city["image"]);
        $step.find(".stat-value").each(function(ind, stat) {
            $(stat).html(city[$(stat).data("stat-type")]);
        });
        //update buildings listing for city
        $building_select.children(":not(:first)").remove();
        $.each(building_data[this.value], function(id, building) {$building_select.append("<option value='"+id+"'>"+building.name+"</option>");})
        $building_select.change();

        if (city.currency !== undefined) $(".currency").text(city.currency);
    });
    
    $building_select.change(function() {
        var $step = $(this).parents(".step");
        var building = building_data[$city_select.children("option:selected").val()][this.value];
        if (!building) { //undefined for the add your own option.
            $step.find("img").css("visibility","hidden");
            $step.find("input").val("").change();
        } else {
            $step.find("img").attr("src", "img/"+building["image"]).css("visibility","visible");
            $step.find(".stat-value").each(function(ind, stat) {
                $(stat).val(building[$(stat).data("stat-type")]).change();
            });
            $("#sqfoot-slider").slider("option", "max", building.area);
        }
    });

    //set up sliders
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
    $("#sqfoot").on("change", function() {$("#sqfoot-slider").slider("value", this.value);});

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
    $("#hours").on("change", function() {$("#hours-slider").slider("value", this.value);});
}
