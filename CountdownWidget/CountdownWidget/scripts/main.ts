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

/// <reference path='../typings/index.d.ts' />
/// <reference path="isettings.d.ts" />

import CountdownWidget = require("scripts/countdownWidget");
import TelemetryClient = require("scripts/TelemetryClient");

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    VSS.register("SprintEndCountdownWidget", () => {
        var countdownWidget = new CountdownWidget.CountdownWiget(WidgetHelpers, true);
        TelemetryClient.TelemetryClient.getClient().trackEvent("SprintEndCountdownWidget created");
        return countdownWidget;
    })
    VSS.notifyLoadSucceeded();
});

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    VSS.register("CountdownWidget", () => {
        var countdownWidget = new CountdownWidget.CountdownWiget(WidgetHelpers, false);
        TelemetryClient.TelemetryClient.getClient().trackEvent("CountdownWidget created");
        return countdownWidget;
    })
    VSS.notifyLoadSucceeded();
});
