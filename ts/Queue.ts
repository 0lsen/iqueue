/// <reference path="Food.ts"/>
/// <reference path="Maths.ts"/>

class Queue {
    private _queue : Food[] = [];
    private _fillRate : number[];

    public fill() : Food[] {
        let newFood : Food[] = [];
        this._fillRate.forEach((rate, i) => {
            let items = Maths.poisson(rate);
            if (items == Infinity) {alert("Abandon ship! Infinite amount of food created!"); return;}
            for (let j = 0; j < items; j++) {
                let food = new Food(i);
                this._queue.push(food);
                newFood.push(food);
            }
        });

        return newFood;
    }

    public consume(type : FoodType) : Food {
        let result = this._queue.find(food => food.canBeConsumed(type));
        if (typeof result != "undefined") {
            let index = this._queue.indexOf(result);
            this._queue.splice(index,1);
        }
        return result;
    }

    public sort() : void {
        this._queue.sort((f1, f2) => f2.score() - f1.score());
    }

    get queue(): Food[] {
        return this._queue;
    }

    set fillRate(value: number[]) {
        this._fillRate = value;
    }
}