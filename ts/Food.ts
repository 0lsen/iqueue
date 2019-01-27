class Food {
    private static id = 0;

    private static caloriesAverage = 100;
    private static caloriesSpread = 50;

    private static spoilageAverage = 10;
    private static spoilageSpread = 7;

    private _id : number;
    private _type : FoodType;
    private _stepCreated : number;
    private _stepSpoiled : number;
    private _calories : number;

    constructor(type: FoodType) {
        this._id = Food.id++;
        this._type = type;
        this._stepCreated = IQueue.step;
        this._calories = Math.round(Maths.normal(Food.caloriesAverage, Food.caloriesSpread));
        this._stepSpoiled = this._stepCreated + Math.round(Maths.normal(Food.spoilageAverage, Food.spoilageSpread));

        FoodStorage.add(this);
    }

    public score() : number {
        let score = 0;
        score += this.rr();
        return score;
    }

    // https://en.wikipedia.org/wiki/Highest_response_ratio_next
    public rr() : number {
        let t_est = this._stepSpoiled - this._stepCreated;
        let t_wait = IQueue.step - this._stepCreated;
        return (t_est + t_wait) / t_est;
    }

    public canBeConsumed(type : FoodType) : boolean {
        return type <= this._type;
    }

    public isSpoiled() : boolean {
        return IQueue.step > this._stepSpoiled;
    }

    get id(): number {
        return this._id;
    }

    get type(): FoodType {
        return this._type;
    }

    get stepCreated(): number {
        return this._stepCreated;
    }

    get stepSpoiled(): number {
        return this._stepSpoiled;
    }

    get calories(): number {
        return this._calories;
    }
}

enum FoodType {
    OMNIVOROUS = 0,
    VEGETARIAN = 1,
    VEGAN = 2
}

class FoodStorage {

    private static storage : Food[] = [];

    public static add(food : Food) : void {
        this.storage.push(food);
    }

    public static get(i : number) : Food {
        return this.storage[i];
    }
}