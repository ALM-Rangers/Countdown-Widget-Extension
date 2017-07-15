// ---------------------------------------------------------------------
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
// ---------------------------------------------------------------------
define(["require", "exports", "TFS/Work/RestClient", "VSS/WebApi/Constants", "VSS/Service", "q", "VSS/Controls", "VSS/Controls/Combos", "moment-timezone"], function (require, exports, Work_Client, WebApi_Constants, Service, Q, Controls, Combos, moment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import TelemetryClient = require("scripts/TelemetryClient");
    var Configuration = (function () {
        function Configuration(WidgetHelpers, isSprintWidget) {
            this.WidgetHelpers = WidgetHelpers;
            this.isSprintWidget = isSprintWidget;
            this.widgetConfigurationContext = null;
            this.$countdownDateInput = $("#countdown-date-input");
            this.$datetimepicker = $("#datetimepicker");
            this.$select = $("select");
            this.$backgroundColor = $("#background-color-input");
            this.$foregroundColor = $("#foreground-color-input");
            this.$skipNonWorkingDays = $("#skipNonWorkingDays");
            this.currentIterationEnd = null;
        }
        Configuration.prototype.load = function (widgetSettings, widgetConfigurationContext) {
            var _this = this;
            this.widgetConfigurationContext = widgetConfigurationContext;
            this.getCurrentIteration()
                .then(function (currentIterationEnd) {
                _this.currentIterationEnd = currentIterationEnd;
                var settings = JSON.parse(widgetSettings.customSettings.data);
                _this.showTimezones(settings);
                _this.showColorPickers(settings);
                _this.showDateTimePicker(settings, currentIterationEnd);
                _this.showWorkingDays(settings);
                VSS.resize();
                _this.$select
                    .add(_this.$backgroundColor)
                    .add(_this.$foregroundColor)
                    .add(_this.$skipNonWorkingDays)
                    .change(function () {
                    _this.widgetConfigurationContext.notify(_this.WidgetHelpers.WidgetEvent.ConfigurationChange, _this.WidgetHelpers.WidgetEvent.Args(_this.getCustomSettings()));
                });
            });
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        Configuration.prototype.onSave = function () {
            var isValid = true;
            if (isValid) {
                // TelemetryClient.TelemetryClient.getClient().trackEvent("Updated configuration");
                return this.WidgetHelpers.WidgetConfigurationSave.Valid(this.getCustomSettings());
            }
            else {
                return this.WidgetHelpers.WidgetConfigurationSave.Invalid();
            }
        };
        Configuration.prototype.showDateTimePicker = function (settings, currentIterationEnd) {
            var _this = this;
            if (!this.isSprintWidget) {
                var countDownDate = moment().format("MM-DD-YYYY HH:mm");
                if (settings && settings.countDownDate) {
                    countDownDate = settings.countDownDate;
                }
                else {
                    countDownDate = moment().add(1, "days").format("MM-DD-YYYY HH:mm");
                }
                var dateTimeOptions = {
                    change: function () {
                        _this.widgetConfigurationContext.notify(_this.WidgetHelpers.WidgetEvent.ConfigurationChange, _this.WidgetHelpers.WidgetEvent.Args(_this.getCustomSettings()));
                    },
                    dateTimeFormat: "F",
                    type: "date-time",
                    value: countDownDate,
                };
                Configuration.$dateTimeCombo = Controls.create(Combos.Combo, this.$datetimepicker, dateTimeOptions);
            }
            else {
                this.$datetimepicker.hide();
                $(".countdown-config-label").hide();
            }
        };
        Configuration.prototype.showColorPickers = function (settings) {
            var palette = [
                ["black", "white", "tan", "turquoise", "pink"],
                ["red", "yellow", "green", "blue", "violet"],
            ];
            var colorSettings = {
                color: "",
                hideAfterPaletteSelect: true,
                palette: palette,
                showPalette: true,
                showPaletteOnly: true,
            };
            colorSettings.color = (settings && settings.backgroundColor) ?
                settings.backgroundColor
                : "green";
            this.$backgroundColor.spectrum(colorSettings);
            colorSettings.color = (settings && settings.foregroundColor) ?
                settings.foregroundColor
                : "white";
            this.$foregroundColor.spectrum(colorSettings);
        };
        Configuration.prototype.showTimezones = function (settings) {
            if (!this.isSprintWidget) {
                var timezones = moment.tz.names();
                for (var i = 0; i < timezones.length; i++) {
                    var opt = document.createElement("option");
                    opt.innerHTML = timezones[i];
                    opt.value = timezones[i];
                    this.$select[0].appendChild(opt);
                }
                if (settings && settings.timezone) {
                    this.$select.val(settings.timezone);
                }
                else {
                    this.$select.val(moment.tz.guess());
                }
            }
            else {
                this.$select.hide();
                $(".countdown-config-label").hide();
            }
        };
        Configuration.prototype.showWorkingDays = function (settings) {
            if (settings) {
                this.$skipNonWorkingDays.prop("checked", settings.skipNonWorkingDays);
            }
            else {
                this.$skipNonWorkingDays.prop("checked", false);
            }
        };
        Configuration.prototype.getCustomSettings = function () {
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
                data: JSON.stringify({
                    backgroundColor: backgroundColor,
                    countDownDate: formattedDate,
                    foregroundColor: foregroundColor,
                    skipNonWorkingDays: skipNonWorkingDays,
                    timezone: $("select").val(),
                }),
            };
            return result;
        };
        Configuration.prototype.getCurrentIteration = function () {
            var deferred = Q.defer();
            var webContext = VSS.getWebContext();
            var teamContext = {
                project: "",
                projectId: webContext.project.id,
                team: "",
                teamId: webContext.team.id,
            };
            var workClient = Service.VssConnection
                .getConnection()
                .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);
            workClient.getTeamIterations(teamContext).then(function (iterations) {
                if (iterations.length > 0) {
                    workClient.getTeamIterations(teamContext, "current").then(function (teamIterations) {
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
        };
        return Configuration;
    }());
    Configuration.$dateTimeCombo = null;
    exports.Configuration = Configuration;
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        VSS.register("SprintEndCountdownWidget-Configuration", function () {
            var configuration = new Configuration(WidgetHelpers, true);
            return configuration;
        });
        VSS.notifyLoadSucceeded();
    });
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        VSS.register("CountdownWidget-Configuration", function () {
            var configuration = new Configuration(WidgetHelpers, false);
            return configuration;
        });
        VSS.notifyLoadSucceeded();
    });
});
//# sourceMappingURL=configuration.js.map