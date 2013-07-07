var renderResults = Mustache.compile($("#results-template").html());
var factors = {
    space: {
        name: "Space",
        valueFn: function () { return parseInt($("#sqfoot").val()); },
        capacityFn: function (val) { return Math.round(val/37.7); },
    },
    toilets: {
        name: "Toilets",
        valueFn: function () { return parseInt($("#toilets").val()); },
        capacityFn: function (val) {
            if (val <= 7) return val * 15;
            else return (7*15) + (val-7)*30;
        },
        description: "Shelters require one toilet per 15 residents up to 100 residents,\
        and one per 30 residents after that.",
        improvement: "add more toilets"
    },
    sinks: {
        name: "Sinks",
        valueFn: function () { return parseInt($("#sinks").val()); },
        capacityFn: function (val) { return val * 15 },
        description: "Shelters require one sink per 15 residents.",
        improvement: "add more sinks"
    },
    custodial: {
        name: "Custodial staff",
        valueFn: function () { return parseInt($("#custodial").val()); },
        capacityFn: function (val) { return val * 20 },
        description: "Shelters require about 1 custodian per 20 residents.",
        improvement: "hire more custodians"
    },
    security: {
        name: "Security",
        valueFn: function () { return parseInt($("#security").val()); },
        capacityFn: function (val) { return val * 100 },
        description: "Shelters require about 1 security person per 100 residents (recommended minimum of 2).",
        improvement: "hire more security"
    },
};

function updateResults() {
    var hours = parseInt($("#hours").val());
    var custodialWage = parseFloat($("#custodial-wage").val());
    var securityWage = parseFloat($("#security-wage").val());

    _.each(_.values(factors), function (card) {
        card.value = card.valueFn();
        card.capacity = card.capacityFn(card.value);
    });

    var limiter = _.min(_.values(factors), function (card) { return card.capacity; });
    var capacity = limiter.capacity;
    var maxCapacity = factors.space.capacity;

    var cards = _.clone(factors);
    delete cards.space;
    var goodCards = _.filter(_.values(cards), function(card) { return card.capacity >= maxCapacity });
    var badCards = _.filter(_.values(cards), function(card) { return card.capacity < maxCapacity });

    $("#results").html(renderResults({
        capacity: capacity,
        maxCapacity: maxCapacity,
        remaining: maxCapacity-capacity,
        percentCapacity: capacity/maxCapacity*100.0 + '%',
        percentRemaining: (maxCapacity-capacity)/maxCapacity*100.0 + '%',
        goodCards: goodCards,
        badCards: badCards,
        improvement: limiter.improvement,
        cost: ((cards.custodial.value*custodialWage)+(cards.security.value*securityWage))*hours
    }));

    //hackety hack
    $("#results .currency").text($(".currency:first").text());
}
