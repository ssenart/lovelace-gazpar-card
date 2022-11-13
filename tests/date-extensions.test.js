import '../src/date-extensions.js';

describe("date extensions", () => {

    test("parseDate", () => {
        expect(Date.parseDate("09/11/2022")).toEqual(new Date(2022, 10, 9));
    });

    test("formatDate", () => {
        expect((new Date(2022, 10, 9)).formatDate()).toEqual("09/11/2022");
    });

    test("parseMonthPeriod", () => {
        expect(Date.parseMonthPeriod("Novembre 2022")).toEqual(new Date(2022, 10, 1));
    });

    test("formatMonthPeriod", () => {
        expect((new Date(2022, 10, 1)).formatMonthPeriod()).toEqual("Novembre 2022");
    });

    test("addDays", () => {
        expect((new Date(2022, 10, 18)).addDays(4)).toEqual(new Date(2022, 10, 22));
    });

    test("addMonths", () => {
        expect((new Date(2022, 10, 18)).addMonths(4)).toEqual(new Date(2023, 2, 18));
    });

});
