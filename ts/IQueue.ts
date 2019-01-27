/// <reference path="Consumer.ts" />
/// <reference path="Controller.ts" />
/// <reference path="Queue.ts" />

class IQueue {

    private consumers : Consumer[];
    private queue : Queue;
    public static step : number;

    private _new : Food[];
    private _consumed : Food[];

    constructor() {
        this.queue = new Queue();
        IQueue.step = 0;
        Consumer.queue = this.queue;
    }

    public setConsumers(
        vegans : number,
        vegetarians : number,
        omnivores : number
    ) : void {
        this.consumers = [];
        for (let i = 0; i < vegans; i++) { this.consumers.push(new Consumer(FoodType.VEGAN))}
        for (let i = 0; i < vegetarians; i++) { this.consumers.push(new Consumer(FoodType.VEGETARIAN))}
        for (let i = 0; i < omnivores; i++) { this.consumers.push(new Consumer(FoodType.OMNIVOROUS))}
    }

    public setFillRates(omnivoreRate, vegetarianRate, veganRate) : void {
        this.queue.fillRate = [omnivoreRate, vegetarianRate, veganRate];
    }

    public stepForward() : void {
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
                if (food) this._consumed.push(food);
            });
        }
    }

    public getQueue(): Food[] {
        return this.queue.queue;
    }

    get new(): Food[] {
        return this._new;
    }

    get consumed(): Food[] {
        return this._consumed;
    }

    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    private shuffleConsumers() : void {
        let currentIndex = this.consumers.length;
        let temp;
        let randomIndex;

        while (0 != currentIndex) {
            randomIndex = Math.floor(Math.random()*currentIndex--);
            temp = this.consumers[currentIndex];
            this.consumers[currentIndex] = this.consumers[randomIndex];
            this.consumers[randomIndex] = temp;
        }
    }
}