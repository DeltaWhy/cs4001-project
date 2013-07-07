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
        capacityFn: function (val) { return val * 15 },
        description: "Toilet description",
        improvement: "add more toilets"
    },
    sinks: {
        name: "Sinks",
        valueFn: function () { return parseInt($("#sinks").val()); },
        capacityFn: function (val) { return val * 15 },
        description: "Sink description",
        improvement: "add more sinks"
    },
    custodial: {
        name: "Custodial staff",
        valueFn: function () { return parseInt($("#custodial").val()); },
        capacityFn: function (val) { return val * 15 },
        description: "Custodial description",
        improvement: "hire more custodians"
    },
    security: {
        name: "Security",
        valueFn: function () { return parseInt($("#security").val()); },
        capacityFn: function (val) { return val * 15 },
        description: "Security description",
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
        cost: '$' + ((cards.custodial.value*custodialWage)+(cards.security.value*securityWage))*hours
    }));
}
