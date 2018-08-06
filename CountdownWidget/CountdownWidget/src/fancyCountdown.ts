// ---------------------------------------------------------------------
// <copyright file="fancyCountdown.ts">
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

// tslint:disable-next-line
/// <reference path="isettings.d.ts" />

import moment = require("moment-timezone");

export class FancyCountdown {
	private WidgetHelpers;

	constructor(widgetHelpers) {
		this.WidgetHelpers = widgetHelpers;
	}

	public load(widgetSettings) {
		return this.buildWidget(widgetSettings);
	}

	public reload(widgetSettings) {
		return this.buildWidget(widgetSettings);
	}

	public disableWidgetForStakeholdersfunction() {
		return false;
	}

	private buildWidget(widgetSettings) {
		const webContext = VSS.getWebContext();
		const settings = this.parseSettings(widgetSettings);

		const renderValues = {
			backgroundWidth: this.getBackgroundWidth(settings.backgroundWidth),
			daysColor: settings.daysColor,
			endDate: "",
			foregroundWidth: this.getForgroundWidth(settings.foregroundWidth),
			hoursColor: settings.hoursColor,
			minutesColor: settings.minutesColor,
			name: widgetSettings.name,
			secondsColor: settings.secondsColor,
		};

		if (settings.countdownType === "toCustomDateTime") {
			renderValues.endDate = moment.tz(settings.countdownDate, "YYYY-MM-DD HH:mm", settings.timezone);
			this.renderWidget(renderValues);
		} else {
			require(["VSS/Service", "TFS/Work/RestClient", "VSS/WebApi/Constants", "TFS/Core/Contracts"],
				(vssService, tfsWorkRestClient, vssWebApiContstants, tfsCoreContracts) => {

				const httpClient = vssService.VssConnection
					.getConnection()
					.getHttpClient(tfsWorkRestClient.WorkHttpClient, vssWebApiContstants.ServiceInstanceTypes.TFS);

				const teamIterationsPromise = httpClient.getTeamIterations({
					projectId: webContext.project.id,
					teamId: webContext.team.id,
				}, "current");

				teamIterationsPromise.then((teamIterations) => {
					if (teamIterations && teamIterations[0]) {
						renderValues.endDate = moment.utc(teamIterations[0].attributes.finishDate).hour(23).minute(59).second(59);
					}

					this.renderWidget(renderValues);
				});
			});
		}

		return this.WidgetHelpers.WidgetStatusHelper.Success();
	}

	private parseSettings(widgetSettings) {
		const settings = JSON.parse(widgetSettings.customSettings.data);

		if (!settings) {
			return {
				backgroundWidth: "Normal",
				countdownType: "toEndOfSprint",
				daysColor: "rgb(255, 204, 102)",
				foregroundWidth: "Normal",
				hoursColor: "rgb(153, 204, 255)",
				minutesColor: "rgb(187, 255, 187)",
				secondsColor: "rgb(255, 153, 153)",
			};
		}

		return settings;
	}

	private renderWidget(renderValues) {
		$("h2.title").text(renderValues.name);

		$("#dateCountdown").remove();
		$("h2.title").after("<div id='dateCountdown' data-date='"
			+ renderValues.endDate.local().format("YYYY-MM-DD HH:mm:ss")
			+ "' style='width: 95%; margin-left: auto; margin-right: auto;'></div>");

		($("#dateCountdown") as any).TimeCircles({
			animation: "smooth",
			bg_width: renderValues.backgroundWidth,
			circle_bg_color: "#60686F",
			fg_width: renderValues.foregroundWidth,
			time: {
				Days: {
					color: renderValues.daysColor,
					show: true,
					text: "Days",
				},
				Hours: {
					color: renderValues.hoursColor,
					show: true,
					text: "Hours",
				},
				Minutes: {
					color: renderValues.minutesColor,
					show: true,
					text: "Minutes",
				},
				Seconds: {
					color: renderValues.secondsColor,
					show: true,
					text: "Seconds",
				},
			},
		});

		VSS.resize();
	}

	private getBackgroundWidth(backgroundWithName) {
		if (backgroundWithName === "Thin") {
			return 0.5;
		}
		if (backgroundWithName === "Thick") {
			return 1.5;
		}

		return 1.0;
	}

	private getForgroundWidth(foregroundWidthName) {
		if (foregroundWidthName === "Thin") {
			return 0.02;
		}
		if (foregroundWidthName === "Thick") {
			return 0.08;
		}

		return 0.05;
	}
}

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
	WidgetHelpers.IncludeWidgetConfigurationStyles();

	VSS.register("FancyCountdown", () => {
		const configuration = new FancyCountdown(WidgetHelpers);
		return configuration;
	});

	VSS.notifyLoadSucceeded();
});
