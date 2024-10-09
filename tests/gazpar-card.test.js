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

    test("rightPaddingWeeklyArray", () => {

      var rightPaddingArray = GazparCard.rightPaddingWeeklyArray([], 24);

      expect(rightPaddingArray.length).toBe(24);

      expect(Date.parseDate(rightPaddingArray[0].time_period)).toStrictEqual(Date.today().addDays(-7));
      expect(Date.parseDate(rightPaddingArray[23].time_period)).toStrictEqual(Date.today().addDays(-168));

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

    test("compareVersions", () => {

      expect(GazparCard.compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(GazparCard.compareVersions("1.0.0", "1.0.1")).toBe(-1);
      expect(GazparCard.compareVersions("1.0.1", "1.0.0")).toBe(1);
      expect(GazparCard.compareVersions("1.0.0", "1.1.0")).toBe(-1);
      expect(GazparCard.compareVersions("1.1.0", "1.0.0")).toBe(1);
      expect(GazparCard.compareVersions("1.0.0", "2.0.0")).toBe(-1);
      expect(GazparCard.compareVersions("2.0.0", "1.0.0")).toBe(1);
      expect(GazparCard.compareVersions("1.3.4", "1.3.10")).toBe(-1);
    });
});
