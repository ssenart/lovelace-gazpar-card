import { GazparCard } from '../src/gazpar-card.js';

describe("date formatting", () => {
  describe("date", () => {
    test("parseDate", () => {
      expect(Date.parseDate("09/11/2022")).toEqual(new Date(2022, 10, 9));
    });
  });
});
