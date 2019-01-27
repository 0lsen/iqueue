class Consumer {
    constructor(type) {
        this.type = type;
    }
    setDailyHunger() {
        this.dailyHunger = Math.round(Maths.normal(Consumer._consumptionAverage, Consumer._consumptionSpread));
    }
    isHungry() {
        return this.dailyHunger > 0;
    }
    consume() {
        let food = Consumer._queue.consume(this.type);
        if (food) {
            this.dailyHunger--;
            return food;
        }
        else {
            this.dailyHunger = 0;
            return null;
        }
    }
    static set queue(value) {
        this._queue = value;
    }
    static setConsumption(average, spread) {
        this._consumptionAverage = average;
        this._consumptionSpread = spread;
    }
}
class Controller {
    constructor() {
        this.delayOpacity = 50;
        this.delayTransition = 500;
        this.delayStep = 1000;
        this.$status = $('#status');
        this.$info = $('#info');
        this.$settings = $('#settings');
        this.$queue = $('#queue');
        this.optionVegans = 3;
        this.optionVegetarians = 3;
        this.optionOmnivores = 3;
        this.optionRateVeganFood = 0.1;
        this.optionRateVegetarianFood = 0.1;
        this.optionRateOmnivorousFood = 0.1;
        this.optionConsumptionAverage = 3;
        this.optionConsumptionSpread = 2;
        this.tileWidth = 50;
        this.tilePadding = 15;
        this.tooltipBorder = 5;
        this.tooltipWidth = 200;
        this.iqueue = new IQueue();
        this.build();
    }
    build() {
        this.setOptions();
        if (!this.$status.find('div').length) {
            this.buildInit();
        }
        this.setInfo();
    }
    buildInit() {
        this.buildStatus();
        this.buildSettings();
        this.buildDashboard();
    }
    buildStatus() {
        let $step = this.create('h2', 'step', 'Step: <span class="step"></span>');
        let $slowForwardButton = this.create('button', '', 'Slow Step');
        $slowForwardButton.on('click', e => this.eventStepForward(false));
        let $fastForwardButton = this.create('button', '', 'Quick Step');
        $fastForwardButton.on('click', e => this.eventStepForward(true));
        let $resetButton = this.create('button', '', 'Reset');
        $resetButton.on('click', e => this.eventReset(e));
        this.$status.append($step);
        this.$status.append($slowForwardButton);
        this.$status.append($fastForwardButton);
        this.$status.append($resetButton);
    }
    buildSettings() {
        let $consumers = this.create('div', 'consumers', '<h3>No. of Food Consumers</h3>');
        $consumers.append(this.create('div', '', '<label>Omnivores</label> <input name="omnivores" type="number" value="' + this.optionOmnivores + '"/>'));
        $consumers.append(this.create('div', '', '<label>Vegetarians</label> <input name="vegetarians" type="number" value="' + this.optionVegetarians + '"/>'));
        $consumers.append(this.create('div', '', '<label>Vegans</label> <input name="vegans" type="number" value="' + this.optionVegans + '"/>'));
        let $consumption = this.create('div', 'consumption', '<h3>Consumer Food Consumption per Period<sup>1</sup></h3>');
        $consumption.append(this.create('div', '', '<label>Average</label> <input name="average" type="number" value="' + this.optionConsumptionAverage + '"/>'));
        $consumption.append(this.create('div', '', '<label>Variation</label> <input name="variation" type="number" value="' + this.optionConsumptionSpread + '"/>'));
        // Hail to JS for knowing 'Infinity' !
        let $creation = this.create('div', 'creation', '<h3>Food Creation per Period<sup>2</sup></h3>');
        $creation.append(this.create('div', '', '<label>Meat</label> <input name="omnivores" type="number" value="' + 1 / this.optionRateOmnivorousFood + '"/>'));
        $creation.append(this.create('div', '', '<label>Milk/Eggs</label> <input name="vegetarians" type="number" value="' + 1 / this.optionRateVegetarianFood + '"/>'));
        $creation.append(this.create('div', '', '<label>Vegetables</label> <input name="vegans" type="number" value="' + 1 / this.optionRateVeganFood + '"/>'));
        this.$settings.append($consumers);
        this.$settings.append($consumption);
        this.$settings.append($creation);
        $('input').on('change', () => this.getAndSetOptions());
    }
    getAndSetOptions() {
        this.optionOmnivores = parseInt($('.consumers input[name=omnivores]').val().toString());
        this.optionVegetarians = parseInt($('.consumers input[name=vegetarians]').val().toString());
        this.optionVegans = parseInt($('.consumers input[name=vegans]').val().toString());
        this.optionConsumptionAverage = parseFloat($('.consumption input[name=average]').val().toString());
        this.optionConsumptionSpread = parseFloat($('.consumption input[name=variation]').val().toString());
        this.optionRateOmnivorousFood = 1 / parseInt($('.creation input[name=omnivores]').val().toString());
        this.optionRateVegetarianFood = 1 / parseInt($('.creation input[name=vegetarians]').val().toString());
        this.optionRateVeganFood = 1 / parseInt($('.creation input[name=vegans]').val().toString());
        this.setOptions();
    }
    setOptions() {
        this.iqueue.setConsumers(this.optionVegans, this.optionVegetarians, this.optionOmnivores);
        this.iqueue.setFillRates(this.optionRateOmnivorousFood, this.optionRateVegetarianFood, this.optionRateVeganFood);
        Consumer.setConsumption(this.optionConsumptionAverage, this.optionConsumptionSpread);
    }
    buildDashboard() {
        let $left = this.create('div', 'queue');
        $left.append(this.create('h2', '', 'Queue'));
        let $right = this.create('div', '');
        let $new = this.create('div', 'new');
        $right.append($new);
        let $consumed = this.create('div', 'consumed');
        $right.append($consumed);
        this.$queue.append($left);
        this.$queue.append($right);
    }
    setInfo() {
        $('span.step').html(IQueue.step.toString());
        if (!IQueue.step) {
            this.$info.html("Ready when you are.");
        }
        else {
            this.$info.empty();
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.new.length + '</span> new food items queued.'));
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.consumed.length + '</span> food items consumed.'));
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.getQueue().length + '</span> food items in queue.'));
        }
        this.show(this.$info.find('div'));
    }
    show($el) {
        setTimeout(() => $el.css("opacity", 1), this.delayOpacity);
    }
    destroy($el) {
        setTimeout(() => $el.css("opacity", 0), this.delayOpacity);
        setTimeout(() => $el.remove(), this.delayOpacity + this.delayTransition);
    }
    eventStepForward(fast) {
        this.iqueue.stepForward();
        this.setInfo();
        this.setDashboard(fast);
    }
    setDashboard(fast) {
        let delay = this.delayOpacity + this.delayTransition + this.delayStep;
        ;
        let $queue = this.$queue.find('.queue');
        let $new = this.$queue.find('.new');
        let $consumed = this.$queue.find('.consumed');
        $new.empty();
        $new.append(this.create('h2', '', 'New'));
        $consumed.empty();
        $consumed.append(this.create('h2', '', 'Consumed'));
        // show new food in queue
        if (this.iqueue.new.length) {
            setTimeout(() => {
                this.iqueue.new.forEach(food => {
                    $new.append(this.createTile(food));
                    setTimeout(() => {
                        let $el = this.createTile(food);
                        $queue.append($el);
                        this.show($el);
                    }, fast ? 0 : this.delayStep);
                });
                this.show($new.find('div'));
            }, fast ? 0 : delay);
            delay += this.delayOpacity + this.delayTransition + 2 * this.delayStep;
        }
        // remove consumed food from queue
        if (this.iqueue.consumed.length) {
            setTimeout(() => {
                this.iqueue.consumed.forEach(food => {
                    $consumed.append(this.createTile(food));
                    setTimeout(() => this.destroy($queue.find('.el' + food.id)), fast ? 0 : this.delayStep);
                });
                this.show($consumed.find('div'));
            }, fast ? 0 : delay);
            delay += this.delayOpacity + this.delayTransition + 2 * this.delayStep;
        }
        // show updated queue order
        setTimeout(() => {
            this.destroy($queue.find('div'));
            setTimeout(() => {
                $queue.empty();
                $queue.append(this.create('h2', '', 'Queue'));
                this.iqueue.getQueue().forEach(food => {
                    $queue.append(this.createTile(food));
                });
                this.show($queue.find('div'));
            }, fast ? 0 : this.delayTransition + this.delayOpacity);
        }, fast ? 0 : delay);
    }
    createTile(food) {
        let $el = this.create('div', 'el' + food.id + ' type' + food.type);
        $el.append(this.create('span', '', (Math.round(food.score() * 100) / 100).toString()));
        if (food.isSpoiled()) {
            $el.addClass('spoiled');
        }
        else {
            $el.css("background-color", "hsl(" + (2 - food.score()) * 100 + ",75%,50%)");
        }
        $el.on("click", (e) => this.tileClick(e, food.id));
        return $el;
    }
    tileClick(e, id) {
        let target = e.currentTarget;
        let $tt = $('#tooltip');
        let tileWidth = this.tileWidth + 2 * this.tilePadding;
        let placeRight = target.offsetLeft + tileWidth + this.tilePadding + this.tooltipWidth < document.body.clientWidth;
        $tt.css({
            "background-color": $(target).css("background-color"),
            "left": target.offsetLeft + (placeRight ? tileWidth : -(this.tooltipWidth + 2 * this.tilePadding + this.tooltipBorder)),
            "top": (target.offsetTop - this.tooltipBorder)
        });
        $tt.css("border-" + (placeRight ? "left" : "right") + "-width", 0);
        $tt.css("border-" + (placeRight ? "right" : "left") + "-width", this.tooltipBorder + "px");
        this.tileDetails($tt, FoodStorage.get(id));
        console.log("event triggered");
        $tt.toggle();
    }
    tileDetails($el, food) {
        $el.empty();
        $el.append(this.create('div', 'title', '#' + food.id));
        $el.append(this.create('div', '', 'Type: ' + Controller.foodTypeMap[food.type]));
        $el.append(this.create('div', '', 'Score: ' + Math.round(food.score() * 100) / 100));
        $el.append(this.create('div', '', 'RR: ' + food.rr()));
        $el.append(this.create('div', '', 'Calories: ' + food.calories));
        $el.append(this.create('div', '', 'Step Created: ' + food.stepCreated));
        $el.append(this.create('div', '', 'Step Spoiled: ' + food.stepSpoiled));
    }
    eventReset(event) {
        alert("Dev TODO: for now just reload page. Sry.");
    }
    create(type, clazz, content = undefined) {
        let $elem = $(document.createElement(type));
        $elem.addClass(clazz);
        if (typeof content !== "undefined")
            $elem.html(content);
        return $elem;
    }
}
Controller.foodTypeMap = [
    "Omnivorous",
    "Vegetarian",
    "Vegan"
];
class Food {
    constructor(type) {
        this._id = Food.id++;
        this._type = type;
        this._stepCreated = IQueue.step;
        this._calories = Math.round(Maths.normal(Food.caloriesAverage, Food.caloriesSpread));
        this._stepSpoiled = this._stepCreated + Math.round(Maths.normal(Food.spoilageAverage, Food.spoilageSpread));
        FoodStorage.add(this);
    }
    score() {
        let score = 0;
        score += this.rr();
        return score;
    }
    // https://en.wikipedia.org/wiki/Highest_response_ratio_next
    rr() {
        let t_est = this._stepSpoiled - this._stepCreated;
        let t_wait = IQueue.step - this._stepCreated;
        return (t_est + t_wait) / t_est;
    }
    canBeConsumed(type) {
        return type <= this._type;
    }
    isSpoiled() {
        return IQueue.step > this._stepSpoiled;
    }
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get stepCreated() {
        return this._stepCreated;
    }
    get stepSpoiled() {
        return this._stepSpoiled;
    }
    get calories() {
        return this._calories;
    }
}
Food.id = 0;
Food.caloriesAverage = 100;
Food.caloriesSpread = 50;
Food.spoilageAverage = 10;
Food.spoilageSpread = 7;
var FoodType;
(function (FoodType) {
    FoodType[FoodType["OMNIVOROUS"] = 0] = "OMNIVOROUS";
    FoodType[FoodType["VEGETARIAN"] = 1] = "VEGETARIAN";
    FoodType[FoodType["VEGAN"] = 2] = "VEGAN";
})(FoodType || (FoodType = {}));
class FoodStorage {
    static add(food) {
        this.storage.push(food);
    }
    static get(i) {
        return this.storage[i];
    }
}
FoodStorage.storage = [];
class Maths {
    static poisson(rate) {
        return Math.round(-Math.log(Math.random()) / rate);
    }
    // https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
    static normal(average, spread) {
        var u = 0, v = 0;
        while (u === 0)
            u = Math.random();
        while (v === 0)
            v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        return num * average + spread;
    }
}
/// <reference path="Food.ts"/>
/// <reference path="Maths.ts"/>
class Queue {
    constructor() {
        this._queue = [];
    }
    fill() {
        let newFood = [];
        this._fillRate.forEach((rate, i) => {
            let items = Maths.poisson(rate);
            if (items == Infinity) {
                alert("Abandon ship! Infinite amount of food created!");
                return;
            }
            for (let j = 0; j < items; j++) {
                let food = new Food(i);
                this._queue.push(food);
                newFood.push(food);
            }
        });
        return newFood;
    }
    consume(type) {
        let result = this._queue.find(food => food.canBeConsumed(type));
        if (typeof result != "undefined") {
            let index = this._queue.indexOf(result);
            this._queue.splice(index, 1);
        }
        return result;
    }
    sort() {
        this._queue.sort((f1, f2) => f2.score() - f1.score());
    }
    get queue() {
        return this._queue;
    }
    set fillRate(value) {
        this._fillRate = value;
    }
}
/// <reference path="Consumer.ts" />
/// <reference path="Controller.ts" />
/// <reference path="Queue.ts" />
class IQueue {
    constructor() {
        this.queue = new Queue();
        IQueue.step = 0;
        Consumer.queue = this.queue;
    }
    setConsumers(vegans, vegetarians, omnivores) {
        this.consumers = [];
        for (let i = 0; i < vegans; i++) {
            this.consumers.push(new Consumer(FoodType.VEGAN));
        }
        for (let i = 0; i < vegetarians; i++) {
            this.consumers.push(new Consumer(FoodType.VEGETARIAN));
        }
        for (let i = 0; i < omnivores; i++) {
            this.consumers.push(new Consumer(FoodType.OMNIVOROUS));
        }
    }
    setFillRates(omnivoreRate, vegetarianRate, veganRate) {
        this.queue.fillRate = [omnivoreRate, vegetarianRate, veganRate];
    }
    stepForward() {
        IQueue.step++;
        this._new = this.queue.fill();
        this.queue.sort();
        this._consumed = [];
        this.consumers.forEach(consumer => consumer.setDailyHunger());
        while (this.consumers.find(consumer => consumer.isHungry())) {
            this.shuffleConsumers();
            let hungryConsumers = this.consumers.filter(consumer => consumer.isHungry());
            hungryConsumers.forEach(consumer => {
                let food = consumer.consume();
                if (food)
                    this._consumed.push(food);
            });
        }
    }
    getQueue() {
        return this.queue.queue;
    }
    get new() {
        return this._new;
    }
    get consumed() {
        return this._consumed;
    }
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffleConsumers() {
        let currentIndex = this.consumers.length;
        let temp;
        let randomIndex;
        while (0 != currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex--);
            temp = this.consumers[currentIndex];
            this.consumers[currentIndex] = this.consumers[randomIndex];
            this.consumers[randomIndex] = temp;
        }
    }
}
