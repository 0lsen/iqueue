class Consumer {
    private static _queue : Queue;

    private static _consumptionAverage : number;
    private static _consumptionSpread : number;

    private type : FoodType;
    private dailyHunger : number;

    constructor(type : FoodType) {
        this.type = type
    }

    public setDailyHunger() : void {
        this.dailyHunger = Math.round(Maths.normal(Consumer._consumptionAverage, Consumer._consumptionSpread));
    }

    public isHungry() : boolean {
        return this.dailyHunger > 0;
    }

    public consume() : Food {
        let food = Consumer._queue.consume(this.type);
        if (food) {
            this.dailyHunger--;
            return food;
        } else {
            this.dailyHunger = 0;
            return null;
        }
    }

    static set queue(value: Queue) {
        this._queue = value;
    }

    static setConsumption(average : number, spread : number) {
        this._consumptionAverage = average;
        this._consumptionSpread = spread;
    }
}

