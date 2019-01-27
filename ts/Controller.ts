class Controller {

    private static foodTypeMap = [
        "Omnivorous",
        "Vegetarian",
        "Vegan"
    ];

    private iqueue : IQueue;

    private delayOpacity = 50;
    private delayTransition = 500;
    private delayStep = 1000;

    private $status : JQuery = $('#status');
    private $info : JQuery = $('#info');
    private $settings : JQuery = $('#settings');
    private $queue : JQuery = $('#queue');

    private optionVegans : number = 3;
    private optionVegetarians : number = 3;
    private optionOmnivores : number = 3;

    private optionRateVeganFood : number = 0.1;
    private optionRateVegetarianFood : number = 0.1;
    private optionRateOmnivorousFood : number = 0.1;

    private optionConsumptionAverage : number = 3;
    private optionConsumptionSpread : number = 2;

    private tileWidth = 50;
    private tilePadding = 15;

    private tooltipBorder = 5;
    private tooltipWidth = 200;

    constructor() {
        this.iqueue = new IQueue();
        this.build();
    }

    private build() : void {
        this.setOptions();
        if (!this.$status.find('div').length) {
            this.buildInit();
        }
        this.setInfo();
    }

    private buildInit() : void {
        this.buildStatus();
        this.buildSettings();
        this.buildDashboard();
    }

    private buildStatus() : void {
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

    private buildSettings() : void {
        let $consumers = this.create('div', 'consumers', '<h3>No. of Food Consumers</h3>');
        $consumers.append(this.create('div', '', '<label>Omnivores</label> <input name="omnivores" type="number" value="' + this.optionOmnivores + '"/>'));
        $consumers.append(this.create('div', '', '<label>Vegetarians</label> <input name="vegetarians" type="number" value="' + this.optionVegetarians + '"/>'));
        $consumers.append(this.create('div', '', '<label>Vegans</label> <input name="vegans" type="number" value="' + this.optionVegans + '"/>'));

        let $consumption = this.create('div', 'consumption', '<h3>Consumer Food Consumption per Period<sup>1</sup></h3>');
        $consumption.append(this.create('div', '', '<label>Average</label> <input name="average" type="number" value="' + this.optionConsumptionAverage + '"/>'));
        $consumption.append(this.create('div', '', '<label>Variation</label> <input name="variation" type="number" value="' + this.optionConsumptionSpread + '"/>'));

        // Hail to JS for knowing 'Infinity' !
        let $creation = this.create('div', 'creation', '<h3>Food Creation per Period<sup>2</sup></h3>');
        $creation.append(this.create('div', '', '<label>Meat</label> <input name="omnivores" type="number" value="' + 1/this.optionRateOmnivorousFood + '"/>'));
        $creation.append(this.create('div', '', '<label>Milk/Eggs</label> <input name="vegetarians" type="number" value="' + 1/this.optionRateVegetarianFood + '"/>'));
        $creation.append(this.create('div', '', '<label>Vegetables</label> <input name="vegans" type="number" value="' + 1/this.optionRateVeganFood + '"/>'));

        this.$settings.append($consumers);
        this.$settings.append($consumption);
        this.$settings.append($creation);

        $('input').on('change', () => this.getAndSetOptions());
    }

    private getAndSetOptions() : void {
        this.optionOmnivores = parseInt($('.consumers input[name=omnivores]').val().toString());
        this.optionVegetarians = parseInt($('.consumers input[name=vegetarians]').val().toString());
        this.optionVegans = parseInt($('.consumers input[name=vegans]').val().toString());

        this.optionConsumptionAverage = parseFloat($('.consumption input[name=average]').val().toString());
        this.optionConsumptionSpread = parseFloat($('.consumption input[name=variation]').val().toString());

        this.optionRateOmnivorousFood = 1/parseInt($('.creation input[name=omnivores]').val().toString());
        this.optionRateVegetarianFood = 1/parseInt($('.creation input[name=vegetarians]').val().toString());
        this.optionRateVeganFood = 1/parseInt($('.creation input[name=vegans]').val().toString());

        this.setOptions();
    }

    private setOptions() : void {
        this.iqueue.setConsumers(this.optionVegans, this.optionVegetarians, this.optionOmnivores);
        this.iqueue.setFillRates(this.optionRateOmnivorousFood, this.optionRateVegetarianFood, this.optionRateVeganFood);
        Consumer.setConsumption(this.optionConsumptionAverage, this.optionConsumptionSpread);
    }

    private buildDashboard() : void {
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

    private setInfo() : void {
        $('span.step').html(IQueue.step.toString());
        if (!IQueue.step) {
            this.$info.html("Ready when you are.");
        } else {
            this.$info.empty();
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.new.length + '</span> new food items queued.'));
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.consumed.length + '</span> food items consumed.'));
            this.$info.append(this.create('div', '', '<span>' + this.iqueue.getQueue().length + '</span> food items in queue.'));
        }
        this.show(this.$info.find('div'));
    }

    private show($el : JQuery) : void {
        setTimeout(() => $el.css("opacity", 1), this.delayOpacity);
    }

    private destroy($el : JQuery) : void {
        setTimeout(() => $el.css("opacity", 0), this.delayOpacity);
        setTimeout(() => $el.remove(), this.delayOpacity+this.delayTransition);
    }
    private eventStepForward(fast : boolean) : void {
        this.iqueue.stepForward();
        this.setInfo();
        this.setDashboard(fast);
    }

    private setDashboard(fast : boolean) : void {
        let delay = this.delayOpacity+this.delayTransition+this.delayStep;;
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
            delay += this.delayOpacity+this.delayTransition+2*this.delayStep;
        }

        // remove consumed food from queue
        if (this.iqueue.consumed.length) {
            setTimeout(() => {
                this.iqueue.consumed.forEach(food => {
                    $consumed.append(this.createTile(food));
                    setTimeout(() => this.destroy($queue.find('.el'+food.id)), fast ? 0 : this.delayStep);
                });
                this.show($consumed.find('div'));
            }, fast ? 0 : delay);
            delay += this.delayOpacity+this.delayTransition+2*this.delayStep;
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
            }, fast ? 0 : this.delayTransition+this.delayOpacity);
        }, fast ? 0 : delay);
    }

    private createTile(food : Food) : JQuery {
        let $el = this.create('div', 'el'+food.id+' type'+food.type);
        $el.append(this.create('span', '', (Math.round(food.score()*100)/100).toString()))
        if (food.isSpoiled()) {
            $el.addClass('spoiled');
        } else {
            $el.css("background-color", "hsl("+(2-food.score())*100+",75%,50%)")
        }
        $el.on("click", (e) => this.tileClick(e, food.id));
        return $el;
    }

    private tileClick(e : JQuery.ClickEvent, id : number) : void {
        let target = e.currentTarget;
        let $tt = $('#tooltip');
        let tileWidth = this.tileWidth+2*this.tilePadding;
        let placeRight = target.offsetLeft + tileWidth + this.tilePadding + this.tooltipWidth < document.body.clientWidth;
        $tt.css({
            "background-color" : $(target).css("background-color"),
            "left" : target.offsetLeft + (placeRight ? tileWidth : -(this.tooltipWidth+2*this.tilePadding+this.tooltipBorder)),
            "top" : (target.offsetTop-this.tooltipBorder)
        });
        $tt.css("border-"+(placeRight ? "left" : "right")+"-width", 0);
        $tt.css("border-"+(placeRight ? "right" : "left")+"-width", this.tooltipBorder+"px");
        this.tileDetails($tt, FoodStorage.get(id));
        console.log("event triggered")
        $tt.toggle();
    }

    private tileDetails($el : JQuery, food : Food) : void {
        $el.empty();
        $el.append(this.create('div', 'title', '#'+food.id));
        $el.append(this.create('div', '', 'Type: '+Controller.foodTypeMap[food.type]));
        $el.append(this.create('div', '', 'Score: '+Math.round(food.score()*100)/100));
        $el.append(this.create('div', '', 'RR: '+food.rr()));
        $el.append(this.create('div', '', 'Calories: '+food.calories));
        $el.append(this.create('div', '', 'Step Created: '+food.stepCreated));
        $el.append(this.create('div', '', 'Step Spoiled: '+food.stepSpoiled));
    }

    private eventReset(event : JQuery.ClickEvent) : void {
        alert("Dev TODO: for now just reload page. Sry.");
    }

    private create(type : string, clazz : string, content : string = undefined) : JQuery {
        let $elem : JQuery = $(document.createElement(type));
        $elem.addClass(clazz);
        if (typeof content !== "undefined") $elem.html(content);
        return $elem;
    }
}