// ---------------------------------------------------------------------
// <copyright file="fancyCountdownConfiguration.ts">
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
import spectrum = require("spectrum-colorpicker");
import Controls = require("VSS/Controls");
import Combos = require("VSS/Controls/Combos");
import DateUtils = require("VSS/Utils/Date");

export class FancyConfiguration {
	private dateTimeCombo: any;
	private foregroundWidthCombo: any;
	private backgroundWidthCombo: any;

	private WidgetHelpers: any;

	constructor(widgetHelpers) {
		this.WidgetHelpers = widgetHelpers;
	}

	public load(widgetSettings, widgetConfigurationContext) {
		const notifyChanges = () => this.notifyChanges(widgetConfigurationContext);
		const settings = this.parseSettings(widgetSettings);

		$("input[value=" + settings.countdownType + "]").prop("checked", "checked");

		const dateTimeOptions: Combos.IDateTimeComboOptions = {
			change: notifyChanges,
			dateTimeFormat: "F",
			type: "date-time",
			value: DateUtils.format(moment(settings.countdownDate, "YYYY-MM-DD HH:mm").toDate(), "F"),
		};

		this.dateTimeCombo = Controls.create(Combos.Combo, $("#datetime"), dateTimeOptions);

		const timezones = moment.tz.names();
		for (const timezone of timezones) {
			$("#timezone")
				.append($("<option></option>")
					.attr("value", timezone)
					.text(timezone));
		}

		$("#timezone").val(settings.timezone);

		this.foregroundWidthCombo = this.createWidthPicker(Controls, Combos,
			"#fgWidth", settings.foregroundWidth, notifyChanges);

		this.backgroundWidthCombo = this.createWidthPicker(Controls, Combos,
			"#bgWidth", settings.backgroundWidth, notifyChanges);

		this.createColorPicker("#days-colorpicker", settings.daysColor);
		this.createColorPicker("#hours-colorpicker", settings.hoursColor);
		this.createColorPicker("#minutes-colorpicker", settings.minutesColor);
		this.createColorPicker("#seconds-colorpicker", settings.secondsColor);

		$(".colorpicker-input, #timezone, input").on("change", notifyChanges);

		$("input[name=countdownType]").on("change", () => {
			this.dateTimeCombo.setText(DateUtils.format(moment().toDate(), "F"));
			this.updateControlsVisibility();
		});

		this.updateControlsVisibility();

		return this.WidgetHelpers.WidgetStatusHelper.Success();
	}

	public onSave() {
		const customSettings = this.getSettingsFromControls();
		return this.WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
	}

	private getSettingsFromControls() {
		const inputText = this.dateTimeCombo.getInputText();
		const date = DateUtils.parseDateString(inputText, "F");

		const customSettings = {
			data: JSON.stringify({
				backgroundWidth: this.backgroundWidthCombo.getValue(),
				countdownDate: moment(date).format("YYYY-MM-DD HH:mm"),

				countdownType: $("input[name=countdownType]:checked").val(),
				daysColor: ($("#days-colorpicker") as any).spectrum("get").toRgbString(),
				foregroundWidth: this.foregroundWidthCombo.getValue(),
				hoursColor: ($("#hours-colorpicker") as any).spectrum("get").toRgbString(),
				minutesColor: ($("#minutes-colorpicker") as any).spectrum("get").toRgbString(),
				secondsColor: ($("#seconds-colorpicker") as any).spectrum("get").toRgbString(),
				timezone: $("#timezone").prop("value"),
			}),
		};

		return customSettings;
	}

	private parseSettings(widgetSettings) {
		const settings = JSON.parse(widgetSettings.customSettings.data);

		if (!settings) {
			return {
				backgroundWidth: "Normal",
				countdownDate: moment().format("YYYY-MM-DD HH:mm"),
				countdownType: "toEndOfSprint",
				daysColor: "rgb(255, 204, 102)",
				foregroundWidth: "Normal",
				hoursColor: "rgb(153, 204, 255)",
				minutesColor: "rgb(187, 255, 187)",
				secondsColor: "rgb(255, 153, 153)",
				timezone: moment.tz.guess(),
			};
		}

		return settings;
	}

	private notifyChanges(widgetConfigurationContext) {
		const customSettings = this.getSettingsFromControls();

		widgetConfigurationContext.notify(
			this.WidgetHelpers.WidgetEvent.ConfigurationChange,
			this.WidgetHelpers.WidgetEvent.Args(customSettings));
	}

	private updateControlsVisibility() {
		if ($("input[name=countdownType]:checked").val() === "toCustomDateTime") {
			$("#datepicker-container, #timezonepicker-container").show();
		} else {
			$("#datepicker-container, #timezonepicker-container").hide();
		}
	}

	private createWidthPicker(controls, combos, jqueryIdentifier, selectedValue, notifyChanges) {
		return controls.create(combos.Combo, $(jqueryIdentifier), {
			change: notifyChanges,
			mode: "drop",
			source: ["Thin", "Normal", "Thick"],
			value: selectedValue,
		});
	}

	private createColorPicker(jqueryIdentifier, initialColor) {
		($(jqueryIdentifier) as any).spectrum({
			color: initialColor,
			hideAfterPaletteSelect: true,
			palette: ["black", "white", "tan", "turquoise", "pink", "red", "yellow", "green", "blue", "violet"],
			showPalette: true,
			showPaletteOnly: false,
		});
	}
}

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
	WidgetHelpers.IncludeWidgetConfigurationStyles();

	VSS.register("FancyCountdown-Configuration", () => {
		const configuration = new FancyConfiguration(WidgetHelpers);
		return configuration;
	});

	VSS.notifyLoadSucceeded();
});
