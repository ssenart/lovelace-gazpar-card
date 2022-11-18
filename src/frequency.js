const Daily = 'Daily';
const Weekly = 'Weekly';
const Monthly = 'Monthly';
const Yearly = 'Yearly';

/*
export const Frequency = Object.freeze({
    Daily:   Symbol(Daily),
    Weekly:  Symbol(Weekly),
    Monthly: Symbol(Monthly),
    Yearly:  Symbol(Yearly)
});
*/

export class Frequency {
    static Daily = new Frequency(Daily);
    static Weekly = new Frequency(Weekly);
    static Monthly = new Frequency(Monthly);
    static Yearly = new Frequency(Yearly);
  
    constructor(name) {
      this.name = name;
    }

    toString() {
      return `${this.name}`;
    }

    static parse(str)
    {
        var res = "";

        switch (str) {
            case Daily:
                res = Frequency.Daily;
                break;
            case Weekly:
                res = Frequency.Weekly;
                break;
            case Monthly:
                res = Frequency.Monthly;
                break;     
            case Yearly:
                res = Frequency.Yearly;
                break;
            default:
                throw `Invalid frequency string '${str}'`
        }

        return res;
    }
}
