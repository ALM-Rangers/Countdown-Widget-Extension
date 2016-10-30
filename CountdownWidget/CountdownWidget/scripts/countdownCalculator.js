/// <reference path="../typings/index.d.ts" />
/// <reference path="../typings/index.d.ts" />
//---------------------------------------------------------------------
// <copyright file="countdownCalculator.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    code to calculate the countdown delta.
// </summary>
//---------------------------------------------------------------------
define(["require", "exports"], function (require, exports) {
    "use strict";
    var CountdownCalculator = (function () {
        function CountdownCalculator(from, to, workingdays) {
            if (workingdays === void 0) { workingdays = []; }
            this.from = from;
            this.to = to;
            this.workingdays = workingdays;
        }
        CountdownCalculator.prototype.isValid = function () {
            return this.from.isBefore(this.to.format());
        };
        CountdownCalculator.prototype.getDayOfWeekNumber = function (day) {
            if (typeof day == "string") {
                switch (day) {
                    case "sunday": return 0;
                    case "monday": return 1;
                    case "tuesday": return 2;
                    case "wednesday": return 3;
                    case "thursday": return 4;
                    case "friday": return 5;
                    case "saturday": return 6;
                }
            }
            else {
                return day;
            }
        };
        CountdownCalculator.prototype.isWorkDay = function (day) {
            for (var i = 0; i < this.workingdays.length; i++) {
                var workingDay = this.getDayOfWeekNumber(this.workingdays[i]);
                if (workingDay == day)
                    return true;
            }
            return false;
        };
        CountdownCalculator.prototype.countExcluded = function () {
            var days = this.to.diff(this.from, 'days');
            var excludedDays = 0;
            for (var i = 1; i <= days; i++) {
                var weekday = this.from.clone().add(i, 'days').weekday();
                if (!this.isWorkDay(weekday)) {
                    excludedDays++;
                }
            }
            return excludedDays;
        };
        ;
        CountdownCalculator.prototype.getDifference = function () {
            var _this = this;
            if (!this.isValid()) {
                return new CountdownResult(0, Unit.Invalid);
            }
            var diff = function (unit) {
                return _this.to.diff(_this.from, Unit[unit].toLowerCase(), false);
            };
            var numberOfExcludedDays = 0;
            if (this.workingdays.length > 0) {
                numberOfExcludedDays = this.countExcluded();
            }
            var test = diff(Unit.Days);
            this.to.add(-numberOfExcludedDays, Unit[Unit.Days].toLowerCase());
            var numberOfDays = diff(Unit.Days);
            if (numberOfDays >= 1) {
                return new CountdownResult(numberOfDays, Unit.Days);
            }
            else {
                var numberOfHours = diff(Unit.Hours);
                if (numberOfHours >= 1) {
                    return new CountdownResult(numberOfHours, Unit.Hours);
                }
                else {
                    var numberOfMinutes = diff(Unit.Minutes);
                    if (numberOfMinutes >= 1) {
                        return new CountdownResult(numberOfMinutes, Unit.Minutes);
                    }
                    else {
                        var numberOfSeconds = diff(Unit.Seconds);
                        return new CountdownResult(numberOfSeconds, Unit.Seconds);
                    }
                }
            }
        };
        return CountdownCalculator;
    }());
    exports.CountdownCalculator = CountdownCalculator;
    var CountdownResult = (function () {
        function CountdownResult(value, unit) {
            this.value = value;
            this.unit = unit;
        }
        CountdownResult.prototype.getDisplayString = function () {
            return Unit[this.unit].toLowerCase();
        };
        return CountdownResult;
    }());
    exports.CountdownResult = CountdownResult;
    (function (Unit) {
        Unit[Unit["Years"] = 0] = "Years";
        Unit[Unit["Days"] = 1] = "Days";
        Unit[Unit["Hours"] = 2] = "Hours";
        Unit[Unit["Minutes"] = 3] = "Minutes";
        Unit[Unit["Seconds"] = 4] = "Seconds";
        Unit[Unit["Invalid"] = 5] = "Invalid";
    })(exports.Unit || (exports.Unit = {}));
    var Unit = exports.Unit;
    ;
});
//# sourceMappingURL=countdownCalculator.js.map