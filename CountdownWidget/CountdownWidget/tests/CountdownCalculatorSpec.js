define(["require", "exports", "moment-timezone", "../scripts/countdownCalculator"], function (require, exports, moment, CountdownCalculator) {
    "use strict";
    describe("countdown ", function () {
        it("from date before to date is valid", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("21122015", "DDMMYYYY"), moment("01012016", "DDMMYYYY"));
            expect(calculator.isValid()).toBe(true);
        });
        it("from date after to date is invalid", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("01012016", "DDMMYYYY"), moment("21122015", "DDMMYYYY"));
            expect(calculator.isValid()).toBe(false);
        });
        it("from 1-12-2015 to 31-12-2015 is 30 days", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("1-12-2015", "DD-MM-YYYY"), moment("31-12-2015", "DD-MM-YYYY"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(30);
            expect(countdownResult.unit).toBe(CountdownCalculator.Unit.Days);
        });
        it("from 1-12-2015 to 2-12-2015 is 1 day", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("01-12-2015", "DD-MM-YYYY"), moment("02-12-2015", "DD-MM-YYYY"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(1);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Days");
        });
        it("from 1-12-2015 10:00 to 1-12-2015 11:00 is 1 hour", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("01-12-2015 10:00", "DD-MM-YYYY HH"), moment("01-12-2015 11:00", "DD-MM-YYYY HH"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(1);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Hours");
        });
        it("from 1-12-2015 10:00 to 1-12-2015 10:59 is 59 minutes", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("01-12-2015 10:00", "DD-MM-YYYY HH:mm"), moment("01-12-2015 10:59", "DD-MM-YYYY HH:mm"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(59);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Minutes");
        });
        it("from 1-12-2015 10:00:00 to 1-12-2015 10:00:59 is 59 seconds", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("01-12-2015 10:00:00", "DD-MM-YYYY HH:mm:ss"), moment("01-12-2015 10:00:59", "DD-MM-YYYY HH:mm:ss"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(59);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Seconds");
        });
        it("invalid countdown to return a difference of 0", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment("02-12-2015", "DD-MM-YYYY"), moment("01-12-2015", "DD-MM-YYYY"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(0);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Invalid");
        });
        it("countdown from 01-12-2015 10:00 Europe/Amsterdam to 01-12-2015 10:00 America/Los_Angeles to be 9 hours", function () {
            var calculator = new CountdownCalculator.CountdownCalculator(moment.tz("01-12-2015 10:00", "DD-MM-YYYY H:m", "Europe/Amsterdam"), moment.tz("01-12-2015 10:00", "DD-MM-YYYY H:m", "America/Los_Angeles"));
            var countdownResult = calculator.getDifference();
            expect(countdownResult.value).toBe(9);
            expect(CountdownCalculator.Unit[countdownResult.unit]).toBe("Hours");
        });
    });
});
//# sourceMappingURL=CountdownCalculatorSpec.js.map