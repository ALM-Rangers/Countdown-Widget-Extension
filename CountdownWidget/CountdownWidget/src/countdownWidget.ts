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

import moment = require("moment-timezone");
import Q = require("q");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import Work_Contracts = require("TFS/Work/Contracts");
import Work_Client = require("TFS/Work/RestClient");
import Promise from "ts-promise";
import System_Contracts = require("VSS/Common/Contracts/System");
import Service = require("VSS/Service");
import WebApi_Constants = require("VSS/WebApi/Constants");
import CountdownCalculator = require("./countdownCalculator");
import CountdownResult = require("./countdownResult");

export class CountdownWiget {
	private currentSettings: ISettings;
	private workingDays: System_Contracts.DayOfWeek[];
	private renderValues: any = {};
	private calculator: CountdownCalculator.CountdownCalculator;

	constructor(
		public WidgetHelpers,
		public isSprintEndWidget: boolean) { }

	public load(widgetSettings) {
		return this.showCountdown(widgetSettings);
	}

	public reload(widgetSettings) {
		return this.showCountdown(widgetSettings);
	}

	private showCountdown(widgetSettings) {
		try {
			this.parseSettings(widgetSettings);

			this.fetchWorkingDays()
				.then(() => {
					return this.determineRenderValues();
				})
				.then(() => {
					this.calculateCountdown();
					this.calculateBackgroundColor();
					this.renderWidget();
				});

			return this.WidgetHelpers.WidgetStatusHelper.Success();
		} catch (e) {
			// Satisfy the linter
		}
	}

	private parseSettings(widgetSettings) {
		this.currentSettings = JSON.parse(widgetSettings.customSettings.data) as ISettings;

		if (!this.currentSettings) {
			this.currentSettings = {
				backgroundColor: "green",
				backgroundColorHoursColor: "red",
				backgroundColorHoursEnabled: false,
				backgroundColorHoursThreshold: 12,
				countDownDate: moment().add(1, "days").format("MM-DD-YYYY HH:mm"),
				foregroundColor: "white",
				name: widgetSettings.name,
				roundNumber: false,
				skipNonWorkingDays: false,
				timezone: (moment as any).tz.guess(),
			};
		}

		this.currentSettings.name = widgetSettings.name;
	}

	private fetchWorkingDays() {
		const teamContext = this.buildTeamContext();
		const workClient = this.buildWorkClient();

		return workClient.getTeamSettings(teamContext).then((teamSettings) => {
			this.workingDays = [];
			if (this.currentSettings.skipNonWorkingDays) {
				this.workingDays = teamSettings.workingDays;
			}
		});
	}

	private determineRenderValues() {
		if (this.isSprintEndWidget) {
			return this.determineSprintWidgetRenderValues();
		}

		return this.determineCountdownWidgetRenderValues();
	}

	private determineSprintWidgetRenderValues() {
		const teamContext = this.buildTeamContext();
		const workClient = this.buildWorkClient();

		return workClient.getTeamIterations(teamContext).then((iterations) => {
			if (iterations.length > 0) {
				return workClient.getTeamIterations(teamContext, "current").then((teamIterations) => {

					const iterationEndDate = teamIterations[0].attributes.finishDate;
					if (iterationEndDate) {
						const iterationLastDay = moment.utc(iterationEndDate).hour(23).minute(59).second(59);

						this.renderValues.to = iterationLastDay;
					}
				});
			}

			this.renderValues.to = null;
		});
	}

	private determineCountdownWidgetRenderValues() {
		const date = this.currentSettings.countDownDate;
		const timezone = this.currentSettings.timezone;
		this.renderValues.to = moment.tz(date, "MM-DD-YYYY HH:mm", timezone);

		return Promise.resolve();
	}

	private calculateCountdown() {
		const now = moment();
		const tempWorkingDays = [];

		this.workingDays.forEach((element) => {
			tempWorkingDays.push(element);
		});

		this.calculator = new CountdownCalculator.CountdownCalculator(
			now,
			this.renderValues.to,
			this.currentSettings.roundNumber,
			tempWorkingDays,
		);
	}

	private calculateBackgroundColor() {
		this.renderValues.backgroundColor = this.currentSettings.backgroundColor;

		if (this.currentSettings.backgroundColorHoursEnabled && this.calculator.isValid()) {
			const difference = this.calculator.getDifference();
			if (difference.isLessThan(this.currentSettings.backgroundColorHoursThreshold, CountdownResult.Unit.Hours)) {
				this.renderValues.backgroundColor = this.currentSettings.backgroundColorHoursColor;
			}
		}
	}

	private renderWidget() {
		const $title = $("#countdown-title");
		const $container = $("#countdown-container");
		const $countdownBottomContainer = $("#countdown-bottom-container");
		const $errorContainer = $("#error-container");
		const $countDownBody = $(".countdown");
		const $allContentElements = $title
			.add($container)
			.add($countdownBottomContainer);

		$title.text(this.currentSettings.name);

		$countDownBody.css("background-color", this.renderValues.backgroundColor);

		if (this.currentSettings.foregroundColor) {
			$countDownBody.css("color", this.currentSettings.foregroundColor);
		}

		if (this.calculator.isValid()) {
			const result = this.calculator.getDifference();

			$allContentElements.show();
			$errorContainer.empty();

			$container.text(result.getDisplayValue());
			$countdownBottomContainer.text(result.getDisplayUnit() + " remaining");
			$container.css("font-size", result.getValueFontSize());
		} else {
			$allContentElements.hide();
			$errorContainer.text("Sorry, nothing to show");
		}
	}

	private buildTeamContext() {
		const webContext = VSS.getWebContext();

		const teamContext: TFS_Core_Contracts.TeamContext = {
			project: "",
			projectId: webContext.project.id,
			team: "",
			teamId: webContext.team.id,
		};

		return teamContext;
	}

	private buildWorkClient() {
		const workClient: Work_Client.WorkHttpClient = Service.VssConnection
			.getConnection()
			.getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);

		return workClient;
	}
}
