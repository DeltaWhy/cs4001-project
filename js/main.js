//page setup
$(function() {
    if (!location.hash) history.replaceState(null,null,"#problem");
    changePage(location.hash);
    
    $(".nav a, a.brand").bind("click", function(e) {
        var id = $(e.target).attr("href");
        history.pushState(null,null,id);
        changePage(id);
        return false;
    });
    
    $(".next-page").bind("click", function(e) {
        var id = "#" + $(e.target).parents(".page").next().attr("id").substring(5);
        history.pushState(null,null,id);
        changePage(id);
        return false;
    });
    
    //history management
    window.onhashchange = function(e) {changePage(location.hash);};

    initForms();
    initSteps();
});

function changePage(page) {
    $(".page").hide();
    $("#page-"+page.substring(1)).show();
    $(".nav li.active").removeClass("active");
    $(".nav a[href="+page+"]").parent("li").addClass("active");
    
    if (page == "#simulation") {
        changeStep($(".step:first"));
    }
    
    if (page == "#discussion") {
        $("#disqus-city").children("option:first").prop("selected",true);
        $("#disqus-city").change();
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
    validateInputs();
}

function initSteps() {
    
    //next button
    $(".step-controls .btn.next").bind("click", function(e) {
        if (!$(e.target).hasClass("disabled"))
            changeStep($(".step:visible").next(".step"));
    });
    //previous button
    $(".step-controls .btn.prev").bind("click", function(e) {
        if (!$(e.target).hasClass("disabled"))
            changeStep($(".step:visible").prev(".step"));
    });
    //reset button
    $(".step-controls .btn.restart").bind("click", function(e) {
        if (!$(e.target).hasClass("disabled"))
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
        $.each(data, function(id,city) {$city_select.append("<option value='"+id+"'>"+city.name+"</option>");});
        $.each(city_data, function(id,city) {$("#disqus-city").append("<option value='"+id+"'>"+city.name+"</option>");});
        if (building_data) $city_select.change();
    });
    
    $.getJSON("data/buildings.json").done(function(data) {
        building_data = data;
        if (city_data) $city_select.change();
    });
    
    //city updates
    $city_select.change(function() {
        var $step = $(this).parents(".step");
        var city = city_data[this.value];
        $step.find("img").attr("src", "img/"+city["image"]);
        $step.find(".stat-value").each(function(ind, stat) {
            $(stat).text(city[$(stat).data("stat-type")]);
        });
        
        //update buildings listing for city
        $building_select.children(":not(:first)").remove();
        $.each(building_data[this.value], function(id, building) {$building_select.append("<option value='"+id+"'>"+building.name+"</option>");})
        $building_select.change();

        if (city.currency !== undefined) $(".currency").text(city.currency);

        validateInputs();
    });
    
    //building updates
    $building_select.change(function() {
        var $step = $(this).parents(".step");
        var building = building_data[$city_select.children("option:selected").val()][this.value];
        if (!building) { //undefined for the add your own option.
            $step.find("img").hide();
            $step.find("input").val("").change();
        } else {
            $step.find("img").attr("src", "img/"+building["image"]).show();
            $step.find(".stat-value").each(function(ind, stat) {
                $(stat).val(building[$(stat).data("stat-type")]).change();
            });
            $("#sqfoot-slider").slider("option", "max", building.area);
        }

        validateInputs();
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
            validateInputs();
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
            validateInputs();
        }
    });
    $("#hours").on("change", function() {$("#hours-slider").slider("value", this.value);});

    //attach form validation handlers
    $("#building-step form").on("change", validateInputs);
    
    //Disqus initialization. note: cities already populated when json recieved
    var $disqus_city = $("#disqus-city");
    var $disqus_building = $("#disqus-building").prop("disabled",true);
    
    //handler to make disussion match city/building when coming from eval tool
    $("#discussion-btn").click(function() {
        $disqus_city.children("[value=" + $city_select.val() + "]").prop("selected",true);
        $disqus_building.html($building_select.html()).prop("disabled",false);
        if ($building_select.val()) { //selected a building
            $disqus_building.children("[value=" + $building_select.val() + "]").prop("selected",true);
        }
        $("#disqus-change").click();
    });
    
    $disqus_city.change(function() {
        if (!$(this).val()) {
            $disqus_building.prop("disabled",true).children("option:first").prop("selected",true);
        } else {
            $disqus_building.children("option:not(:first)").remove();
            $.each(building_data[$(this).val()], function(id,building) {
                $disqus_building.append("<option value='"+id+"'>"+building.name+"</option>");
            });
            $disqus_building.prop("disabled",false);
        }
    });
    
    $("#disqus-change").click(function() {
        //change Disqus thread
        var identifier = "/general" 
        var title = "Homlessness Problem/Solution";
        
        var city = $disqus_city.val();
        if (city) {
            console.log("City: "+city);
            identifier = "/" + city;
            title = "Homelessness in " + city_data[city].name;
            var building = $disqus_building.val();
            if (building) {
                console.log("Building: "+building);
                identifier += "/" + building;
                title += " / " + building_data[city][building].name; 
            }      
        }
        
        changeDisqusThread(identifier,title);
    });

    $("#meta-thread").click(function(event) {
        event.preventDefault();
        $disqus_city.children().eq(0).prop("selected",true);
        $disqus_building.prop("disabled",true).children().eq(0).prop("selected",true);
        changeDisqusThread("/meta","Discussion about /tmp/home");
    });
    
    //update title of current thread
    $("#disqus-title").text("Homlessness Problem/Solution");
}

function changeDisqusThread(identifier, title) {
        console.log("Changing thread to: " + identifier + "\n With title: "+title);

        $("#disqus-title").text(title);

        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = "http://files.limiero.com/CS4001/#!" + identifier;
                this.page.title = title;
            }
        });
}

function validateInputs() {
    if (!$("#building-step").is(":visible")) {
        $(".step-controls .btn.next").removeClass("disabled");
        return true;
    }

    var valid = true;
    $("#building-step input").each(function(i,el) {
        var val = parseFloat($(el).val());
        if (isNaN(val) || val < 0) {
            valid = false;
        }
    });
    if (valid) {
        $(".step-controls .btn.next").removeClass("disabled");
    } else {
        $(".step-controls .btn.next").addClass("disabled");
    }
    return valid;
}
