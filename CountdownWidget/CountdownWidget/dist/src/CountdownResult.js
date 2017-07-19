// ---------------------------------------------------------------------
// <copyright file="countdownResult.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    code for a countdown result and unit.
// </summary>
// ---------------------------------------------------------------------
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    var Unit;
    (function (Unit) {
        Unit[Unit["Years"] = 0] = "Years";
        Unit[Unit["Days"] = 1] = "Days";
        Unit[Unit["Hours"] = 2] = "Hours";
        Unit[Unit["Minutes"] = 3] = "Minutes";
        Unit[Unit["Seconds"] = 4] = "Seconds";
        Unit[Unit["Invalid"] = 5] = "Invalid";
    })(Unit = exports.Unit || (exports.Unit = {}));
});
//# sourceMappingURL=CountdownResult.js.map