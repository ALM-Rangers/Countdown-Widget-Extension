//---------------------------------------------------------------------
// <copyright file="main.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    widget startup code.
// </summary>
//---------------------------------------------------------------------
define(["require", "exports", "scripts/countdownWidget", "scripts/TelemetryClient"], function (require, exports, CountdownWidget, TelemetryClient) {
    "use strict";
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        VSS.register("SprintEndCountdownWidget", function () {
            var countdownWidget = new CountdownWidget.CountdownWiget(WidgetHelpers, true);
            TelemetryClient.TelemetryClient.getClient().trackEvent("SprintEndCountdownWidget created");
            return countdownWidget;
        });
        VSS.notifyLoadSucceeded();
    });
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        VSS.register("CountdownWidget", function () {
            var countdownWidget = new CountdownWidget.CountdownWiget(WidgetHelpers, false);
            TelemetryClient.TelemetryClient.getClient().trackEvent("CountdownWidget created");
            return countdownWidget;
        });
        VSS.notifyLoadSucceeded();
    });
});
//# sourceMappingURL=main.js.map