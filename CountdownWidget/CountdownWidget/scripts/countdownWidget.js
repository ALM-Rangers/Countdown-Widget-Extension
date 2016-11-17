//---------------------------------------------------------------------
// <copyright file="countdownWidget.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    main code for the widget.
// </summary>
//---------------------------------------------------------------------
define(["require", "exports", "scripts/countdownCalculator", "moment-timezone", "TFS/Work/RestClient", "VSS/WebApi/Constants", "VSS/Service"], function (require, exports, CountdownCalculator, moment, Work_Client, WebApi_Constants, Service) {
    "use strict";
    var CountdownWiget = (function () {
        function CountdownWiget(WidgetHelpers, isSprintEndWidget) {
            this.WidgetHelpers = WidgetHelpers;
            this.isSprintEndWidget = isSprintEndWidget;
        }
        CountdownWiget.prototype.showSprintWidget = function (customSettings, workingdays) {
            var _this = this;
            var webContext = VSS.getWebContext();
            var teamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
            var workClient = Service.VssConnection
                .getConnection()
                .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);
            return workClient.getTeamIterations(teamContext).then(function (iterations) {
                if (iterations.length > 0) {
                    return workClient.getTeamIterations(teamContext, "current").then(function (teamIterations) {
                        var iterationEndDate = teamIterations[0].attributes.finishDate;
                        if (iterationEndDate) {
                            //console.log("iterationLastDay before apply moment.utc :" + iterationEndDate);
                            var iterationLastDay;
                            iterationLastDay = moment.utc(iterationEndDate).hour(23).minute(59).second(59);
                            //convert to utc else is convert to local time zone date
                            //.hour(23).minute(59).second(59) for have full last day iteration
                            //console.log("iterationLastDay after apply moment.utc :" + iterationLastDay.format());
                            return _this.display(iterationLastDay, customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
                        }
                        else {
                            return _this.display(null, customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
                        }
                    });
                }
                else {
                    return _this.display(null, customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
                }
            });
        };
        CountdownWiget.prototype.display = function (to, name, backgroundColor, foregroundColor, workingdays) {
            var $title = $(".title");
            var $container = $('#countdown-container');
            var $countdownBottomContainer = $("#countdown-bottom-container");
            var $errorContainer = $('#error-container');
            var $countDownBody = $('.countdown');
            $title.text(name);
            if (backgroundColor) {
                $countDownBody.css("background-color", backgroundColor);
            }
            if (foregroundColor) {
                $countDownBody.css("color", foregroundColor);
            }
            if (!to) {
                $errorContainer.text("Sorry, nothing to show");
                $title
                    .add($container)
                    .add($countdownBottomContainer)
                    .hide();
                return this.WidgetHelpers.WidgetStatusHelper.Success();
            }
            else {
                $title.
                    add($container)
                    .add($countdownBottomContainer)
                    .show();
                $errorContainer.empty();
            }
            var now = moment();
            var _workinddays = [];
            workingdays.forEach(function (element) {
                _workinddays.push(element);
            });
            var calculator = new CountdownCalculator.CountdownCalculator(now, to, _workinddays);
            if (calculator.isValid()) {
                var result = calculator.getDifference();
                $container.text(result.value);
                $countdownBottomContainer.text(result.getDisplayString() + " remaining");
            }
            else {
                $container.text(0);
                $countdownBottomContainer.text("days remaining");
            }
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        CountdownWiget.prototype.showCountdownWidget = function (customSettings, workingdays) {
            return this.display(moment.tz(customSettings.countDownDate, "MM-DD-YYYY HH:mm", customSettings.timezone), customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
        };
        CountdownWiget.prototype.showCountdown = function (widgetSettings) {
            var _this = this;
            var customSettings = JSON.parse(widgetSettings.customSettings.data);
            if (!customSettings) {
                customSettings =
                    {
                        countDownDate: moment().add(1, "days").format("MM-DD-YYYY HH:mm"),
                        timezone: moment.tz.guess(),
                        backgroundColor: "green",
                        foregroundColor: "white",
                        name: widgetSettings.name,
                        skipNonWorkingDays: false
                    };
            }
            else {
                customSettings.name = widgetSettings.name;
            }
            try {
                var webContext = VSS.getWebContext();
                var teamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
                var workClient = Service.VssConnection
                    .getConnection()
                    .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);
                return workClient.getTeamSettings(teamContext).then(function (teamSettings) {
                    var workingdays = [];
                    if (customSettings.skipNonWorkingDays) {
                        workingdays = teamSettings.workingDays;
                    }
                    if (_this.isSprintEndWidget) {
                        return _this.showSprintWidget(customSettings, workingdays);
                    }
                    else {
                        return _this.showCountdownWidget(customSettings, workingdays);
                    }
                });
            }
            catch (e) {
                console.log(e);
            }
        };
        CountdownWiget.prototype.load = function (widgetSettings) {
            return this.showCountdown(widgetSettings);
        };
        CountdownWiget.prototype.reload = function (widgetSettings) {
            return this.showCountdown(widgetSettings);
        };
        return CountdownWiget;
    }());
    exports.CountdownWiget = CountdownWiget;
});
//# sourceMappingURL=countdownWidget.js.map