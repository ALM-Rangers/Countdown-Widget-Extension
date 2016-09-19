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

/// <reference path='../typings/index.d.ts' />

import CountdownCalculator = require("scripts/countdownCalculator");
import moment = require("moment-timezone");
import Work_Client = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import WebApi_Constants = require("VSS/WebApi/Constants");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import Service = require("VSS/Service");
import Q = require("q");
import System_Contracts = require("VSS/Common/Contracts/System");

export class CountdownWiget {
    constructor(public WidgetHelpers,
        public isSprintEndWidget: boolean) { }

    private showSprintWidget(customSettings: ISettings, workingdays: System_Contracts.DayOfWeek[]) {
        var webContext = VSS.getWebContext();
        var teamContext: TFS_Core_Contracts.TeamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
        var workClient: Work_Client.WorkHttpClient = Service.VssConnection
            .getConnection()
            .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

        return workClient.getTeamIterations(teamContext).then(iterations => {
            if (iterations.length > 0) {
                return workClient.getTeamIterations(teamContext, "current").then(teamIterations => {
                    var iterationEndDate = teamIterations[0].attributes.finishDate;
                    if (iterationEndDate) {
                        return this.display(moment(iterationEndDate), customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
                    }
                    else {
                        return this.display(null, customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
                    }
                });
            }
            else {
                return this.display(null, customSettings.name, customSettings.backgroundColor, customSettings.foregroundColor, workingdays);
            }
        });
    }

    private display(to, name: string, backgroundColor, foregroundColor, workingdays: System_Contracts.DayOfWeek[]) {
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
        var calculator = new CountdownCalculator.CountdownCalculator(
            now,
            to,
            workingdays
        );

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
    }

    private showCountdownWidget(customSettings, workingdays) {
        return this.display(
            moment.tz(customSettings.countDownDate, "MM-DD-YYYY HH:mm", customSettings.timezone),
            customSettings.name,
            customSettings.backgroundColor,
            customSettings.foregroundColor,
            workingdays);
    }

    private showCountdown(widgetSettings) {
        var customSettings = <ISettings>JSON.parse(widgetSettings.customSettings.data);

        if (!customSettings) {
            customSettings =
                {
                    countDownDate: moment().add(1, "days").format("MM-DD-YYYY HH:mm"),
                    timezone: (<any>moment).tz.guess(),
                    backgroundColor: "green",
                    foregroundColor: "white",
                    name: widgetSettings.name,
                    skipNonWorkingDays: false
                }
        }
        else {
            customSettings.name = widgetSettings.name;
        }

        try {
            var webContext = VSS.getWebContext();
            var teamContext: TFS_Core_Contracts.TeamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
            var workClient: Work_Client.WorkHttpClient = Service.VssConnection
                .getConnection()
                .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

            return workClient.getTeamSettings(teamContext).then(teamSettings => {

                var workingdays: System_Contracts.DayOfWeek[] = [];
                if (customSettings.skipNonWorkingDays) {
                    workingdays = teamSettings.workingDays;
                }

            if (this.isSprintEndWidget) {
                return this.showSprintWidget(customSettings, workingdays);
            }
            else {
                return this.showCountdownWidget(customSettings, workingdays);
            }
        });
        }
        catch (e) {
            console.log(e);
        }
    }

    public load(widgetSettings) {
        return this.showCountdown(widgetSettings);
    }
    public reload(widgetSettings) {
        return this.showCountdown(widgetSettings);
    }
}