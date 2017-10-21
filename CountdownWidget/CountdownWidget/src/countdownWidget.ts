// ---------------------------------------------------------------------
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
// ---------------------------------------------------------------------

import CountdownCalculator = require("./countdownCalculator");
import CountdownResult = require("./countdownResult");
import moment = require("moment-timezone");
import Work_Client = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import WebApi_Constants = require("VSS/WebApi/Constants");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import Service = require("VSS/Service");
import Q = require("q");
import System_Contracts = require("VSS/Common/Contracts/System");

export class CountdownWiget {
	constructor(
		public WidgetHelpers,
		public isSprintEndWidget: boolean) { }

	public load(widgetSettings) {
		return this.showCountdown(widgetSettings);
	}

	public reload(widgetSettings) {
		return this.showCountdown(widgetSettings);
	}

	private showSprintWidget(customSettings: ISettings, workingdays: System_Contracts.DayOfWeek[]) {
		const webContext = VSS.getWebContext();
		const teamContext: TFS_Core_Contracts.TeamContext = {
			project: "",
			projectId: webContext.project.id,
			team: "",
			teamId: webContext.team.id,
		};
		const workClient: Work_Client.WorkHttpClient = Service.VssConnection
			.getConnection()
			.getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

		return workClient.getTeamIterations(teamContext).then((iterations) => {
			if (iterations.length > 0) {
				return workClient.getTeamIterations(teamContext, "current").then((teamIterations) => {

					const iterationEndDate = teamIterations[0].attributes.finishDate;
					if (iterationEndDate) {
						let iterationLastDay: moment.Moment;
						iterationLastDay = moment.utc(iterationEndDate).hour(23).minute(59).second(59);
						// convert to utc else is convert to local time zone date
						// .hour(23).minute(59).second(59) for have full last day iteration
						return this.display(
							iterationLastDay,
							customSettings.name,
							customSettings.backgroundColor,
							customSettings.foregroundColor,
							workingdays);
					} else {
						return this.display(
							null,
							customSettings.name,
							customSettings.backgroundColor,
							customSettings.foregroundColor,
							workingdays);
					}
				});
			} else {
				return this.display(
					null,
					customSettings.name,
					customSettings.backgroundColor,
					customSettings.foregroundColor,
					workingdays);
			}
		});
	}

	private display(to, name: string, backgroundColor, foregroundColor, workingdays: System_Contracts.DayOfWeek[]) {
		const $title = $(".title");
		const $container = $("#countdown-container");
		const $countdownBottomContainer = $("#countdown-bottom-container");
		const $errorContainer = $("#error-container");
		const $countDownBody = $(".countdown");

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
		} else {
			$title.
				add($container)
				.add($countdownBottomContainer)
				.show();
			$errorContainer.empty();
		}

		const now = moment();
		const tempWorkingDays = [];

		workingdays.forEach((element) => {
			tempWorkingDays.push(element);
		});

		const calculator = new CountdownCalculator.CountdownCalculator(
			now,
			to,
			tempWorkingDays,
		);

		if (calculator.isValid()) {
			const result = calculator.getDifference();
			if (result.unit === CountdownResult.Unit.Days) {
				// round to the nearest 10th of a day, and remove extra fractional part
				$container.text(result.value.toFixed(1));
			} else {
				$container.text(result.value);
			}
			$countdownBottomContainer.text(result.getDisplayString() + " remaining");
		} else {
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
		let customSettings = JSON.parse(widgetSettings.customSettings.data) as ISettings;

		if (!customSettings) {
			customSettings = {
				backgroundColor: "green",
				countDownDate: moment().add(1, "days").format("MM-DD-YYYY HH:mm"),
				foregroundColor: "white",
				name: widgetSettings.name,
				skipNonWorkingDays: false,
				timezone: (moment as any).tz.guess(),
			};
		} else {
			customSettings.name = widgetSettings.name;
		}

		try {
			const webContext = VSS.getWebContext();
			const teamContext: TFS_Core_Contracts.TeamContext = {
				project: "",
				projectId: webContext.project.id,
				team: "",
				teamId: webContext.team.id,
			};

			const workClient: Work_Client.WorkHttpClient = Service.VssConnection
				.getConnection()
				.getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

			return workClient.getTeamSettings(teamContext).then((teamSettings) => {

				let workingdays: System_Contracts.DayOfWeek[] = [];
				if (customSettings.skipNonWorkingDays) {
					workingdays = teamSettings.workingDays;
				}

				if (this.isSprintEndWidget) {
					return this.showSprintWidget(customSettings, workingdays);
				} else {
					return this.showCountdownWidget(customSettings, workingdays);
				}
			});
		} catch (e) {
			// telemetry.log(..)
		}
	}
}
