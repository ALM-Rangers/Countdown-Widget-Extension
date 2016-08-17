/// <reference path="../typings/index.d.ts" />
//---------------------------------------------------------------------
// <copyright file="configuration.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    widget configuration code.
// </summary>
//---------------------------------------------------------------------

/// <reference path="isettings.d.ts" />
/// <reference path='../typings/index.d.ts' />

import Work_Client = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import WebApi_Constants = require("VSS/WebApi/Constants");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import Service = require("VSS/Service");
import Q = require("q");
import Controls = require("VSS/Controls");
import Combos = require("VSS/Controls/Combos");
import TelemetryClient = require("scripts/TelemetryClient");

export class Configuration {
    widgetConfigurationContext = null;
    $countdownDateInput = $("#countdown-date-input");
    $datetimepicker = (<any>$('#datetimepicker'));
    $select = $('select');
    $backgroundColor = $("#background-color-input");
    $foregroundColor = $("#foreground-color-input");
    $skipNonWorkingDays = $("#skipNonWorkingDays");
    currentIterationEnd = null;
    static $dateTimeCombo: Combos.Combo = null;

    constructor(public WidgetHelpers, public isSprintWidget: boolean) { }

    public load(widgetSettings, widgetConfigurationContext) {
        var _that = this;
        this.widgetConfigurationContext = widgetConfigurationContext;

        this.getCurrentIteration()
            .then(currentIterationEnd => {
                this.currentIterationEnd = currentIterationEnd;
                var settings: ISettings = JSON.parse(widgetSettings.customSettings.data);

                this.showTimezones(settings);
                this.showColorPickers(settings);
                this.showDateTimePicker(settings, currentIterationEnd);
                this.showWorkingDays(settings);

                VSS.resize();
                this.$select
                    .add(this.$backgroundColor)
                    .add(this.$foregroundColor)
                    .add(this.$skipNonWorkingDays)
                    .change(() => {
                        this.widgetConfigurationContext.notify(this.WidgetHelpers.WidgetEvent.ConfigurationChange,
                            this.WidgetHelpers.WidgetEvent.Args(this.getCustomSettings()));
                    });
            });

        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }

    private showDateTimePicker(settings, currentIterationEnd) {
        var _that = this;
        if (!this.isSprintWidget) {
            var countDownDate = moment().format("MM-DD-YYYY HH:mm");
            if (settings && settings.countDownDate) {
                countDownDate = settings.countDownDate;
            }
            else {
                countDownDate = moment().add(1, "days").format("MM-DD-YYYY HH:mm");
            }

            var dateTimeOptions: Combos.IDateTimeComboOptions = {
                value: countDownDate,
                dateTimeFormat: "F",
                type: "date-time",
                change: () => {
                    this.widgetConfigurationContext.notify(this.WidgetHelpers.WidgetEvent.ConfigurationChange,
                        this.WidgetHelpers.WidgetEvent.Args(this.getCustomSettings()));
                }
            };
            Configuration.$dateTimeCombo = Controls.create(Combos.Combo, this.$datetimepicker, dateTimeOptions);
        }
        else {
            this.$datetimepicker.hide();
            $(".countdown-config-label").hide();
        }
    }

    private showColorPickers(settings) {
        var palette = [
            ['black', 'white', 'tan', 'turquoise', 'pink'],
            ['red', 'yellow', 'green', 'blue', 'violet']
        ]

        var colorSettings = {
            color: "",
            showPaletteOnly: true,
            showPalette: true,
            hideAfterPaletteSelect: true,
            palette: palette
        };

        colorSettings.color = (settings && settings.backgroundColor) ?
            settings.backgroundColor
            : "green";
        this.$backgroundColor.spectrum(colorSettings);

        colorSettings.color = (settings && settings.foregroundColor) ?
            settings.foregroundColor
            : "white";
        this.$foregroundColor.spectrum(colorSettings);

    }

    private showTimezones(settings) {
        if (!this.isSprintWidget) {
            var timezones = moment.tz.names();
            for (var i = 0; i < timezones.length; i++) {
                var opt = document.createElement('option');
                opt.innerHTML = timezones[i];
                opt.value = timezones[i];
                this.$select[0].appendChild(opt);
            }

            if (settings && settings.timezone) {
                this.$select.val(settings.timezone);
            }
            else {
                this.$select.val((<any>moment).tz.guess());
            }
        }
        else {
            this.$select.hide();
            $(".countdown-config-label").hide();
        }
    }

    private showWorkingDays(settings) {
        if (settings) {
            this.$skipNonWorkingDays.prop("checked", settings.skipNonWorkingDays);
        }
        else {
            this.$skipNonWorkingDays.prop("checked", false);
        }
    }

    private getCustomSettings() {
        var formattedDate = "";
        if (this.isSprintWidget) {
            if (this.currentIterationEnd) {
                formattedDate = moment(this.currentIterationEnd).format("MM-DD-YYYY HH:mm");
            }
        }
        else {
            var selectedDate = Configuration.$dateTimeCombo.getInputText();
            if (selectedDate) {
                formattedDate = moment(selectedDate).format("MM-DD-YYYY HH:mm");
            }
        }

        var foregroundColor = this.$foregroundColor.spectrum("get").toRgbString();
        var backgroundColor = this.$backgroundColor.spectrum("get").toRgbString();
        var skipNonWorkingDays = this.$skipNonWorkingDays.prop("checked");

        var result = {
            data: JSON.stringify(<ISettings>
                {
                    foregroundColor: foregroundColor,
                    backgroundColor: backgroundColor,
                    countDownDate: formattedDate,
                    timezone: $('select').val(),
                    skipNonWorkingDays: skipNonWorkingDays
                })
        };
        return result;
    }

    public onSave() {
        var isValid = true;
        if (isValid) {
            TelemetryClient.TelemetryClient.getClient().trackEvent("Updated configuration");
            return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
        }
        else {
            return this.WidgetHelpers.WidgetConfigurationSave.Invalid();
        }

    }

    private getCurrentIteration(): IPromise<Date> {
        var deferred = Q.defer<Date>();
        var webContext = VSS.getWebContext();
        var teamContext: TFS_Core_Contracts.TeamContext =
            {
                projectId: webContext.project.id,
                teamId: webContext.team.id,
                project: "",
                team: ""
            };

        var workClient: Work_Client.WorkHttpClient = Service.VssConnection
            .getConnection()
            .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

        workClient.getTeamIterations(teamContext).then(iterations => {
            if (iterations.length > 0) {
                workClient.getTeamIterations(teamContext, "current").then(teamIterations => {
                    if (teamIterations.length > 0) {
                        deferred.resolve(teamIterations[0].attributes.finishDate);
                    }
                    else {
                        deferred.resolve(null);
                    }
                });
            }
            else {
                deferred.resolve(null);
            }
        });

        return deferred.promise;
    }
}

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    VSS.register("SprintEndCountdownWidget-Configuration", () => {
        var configuration = new Configuration(WidgetHelpers, true);
        return configuration;
    })

    VSS.notifyLoadSucceeded();
});

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    VSS.register("CountdownWidget-Configuration", () => {
        var configuration = new Configuration(WidgetHelpers, false);
        return configuration;
    })

    VSS.notifyLoadSucceeded();
});