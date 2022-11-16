import { GazparCard } from '../src/gazpar-card.js';

describe("Data preparation", () => {

    test("rightPaddingDailyArray", () => {

      var rightPaddingArray = GazparCard.rightPaddingDailyArray([], 14);

      expect(rightPaddingArray.length).toBe(14);

      expect(Date.parseDate(rightPaddingArray[0].time_period)).toStrictEqual(Date.today().addDays(-1));
      expect(Date.parseDate(rightPaddingArray[13].time_period)).toStrictEqual(Date.today().addDays(-14));

      rightPaddingArray.forEach((item) => {
        expect(item.energy_kwh).toBe(null) && expect(item.volume_m3).toBe(null);
      });
    });

    test("rightPaddingMonthlyArray", () => {

      var rightPaddingArray = GazparCard.rightPaddingMonthlyArray([], 24);

      expect(rightPaddingArray.length).toBe(24);

      expect(Date.parseMonthPeriod(rightPaddingArray[0].time_period)).toStrictEqual(new Date(Date.today().setDate(1)).addMonths(-1));
      expect(Date.parseMonthPeriod(rightPaddingArray[23].time_period)).toStrictEqual(new Date(Date.today().setDate(1)).addMonths(-24));

      rightPaddingArray.forEach((item) => {
        expect(item.energy_kwh).toBe(null) && expect(item.volume_m3).toBe(null);
      });
    });

});
