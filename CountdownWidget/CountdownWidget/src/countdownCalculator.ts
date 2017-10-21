// ---------------------------------------------------------------------
// <copyright file="countdownCalculator.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    code to calculate the countdown delta.
// </summary>
// ---------------------------------------------------------------------

import moment = require("moment-timezone");
import countdownResult = require("./CountdownResult");

export class CountdownCalculator {

	private from: moment.Moment;
	private to: moment.Moment;
	private workingdays: string[];

	constructor(from: moment.Moment, to: moment.Moment, workingdays: string[] = []) {
		this.from = from;
		this.to = to;
		this.workingdays = workingdays;
	}

	public getDifference(): countdownResult.CountdownResult {
		if (!this.isValid()) {
			return new countdownResult.CountdownResult(0, countdownResult.Unit.Invalid);
		}

		const diff = (unit: countdownResult.Unit) => {
			return this.to.diff(this.from, countdownResult.Unit[unit].toLowerCase(), unit === countdownResult.Unit.Days);
		};

		let numberOfExcludedDays = 0;
		if (this.workingdays.length > 0) {
			numberOfExcludedDays = this.countExcluded();
		}

		const test = diff(countdownResult.Unit.Days);
		this.to.add(-numberOfExcludedDays, countdownResult.Unit[countdownResult.Unit.Days].toLowerCase());
		const numberOfDays:number = diff(countdownResult.Unit.Days);

		if (numberOfDays >= 1.0) {
			return new countdownResult.CountdownResult(numberOfDays, countdownResult.Unit.Days); // round up to the nearest 10th of a day and remove extranneous fractional part
		} else {
			const numberOfHours = diff(countdownResult.Unit.Hours);
			if (numberOfHours >= 1) {
				return new countdownResult.CountdownResult(numberOfHours, countdownResult.Unit.Hours);
			} else {
				const numberOfMinutes = diff(countdownResult.Unit.Minutes);
				if (numberOfMinutes >= 1) {
					return new countdownResult.CountdownResult(numberOfMinutes, countdownResult.Unit.Minutes);
				} else {
					const numberOfSeconds = diff(countdownResult.Unit.Seconds);
					return new countdownResult.CountdownResult(numberOfSeconds, countdownResult.Unit.Seconds);
				}
			}
		}
	}

	public isValid(): boolean {
		return this.from.isBefore(this.to.format());
	}

	private getDayOfWeekNumber(day: any): number {
		if (typeof day === "string") { // for compatibility with old API
			switch (day) {
				case "sunday": return 0;
				case "monday": return 1;
				case "tuesday": return 2;
				case "wednesday": return 3;
				case "thursday": return 4;
				case "friday": return 5;
				case "saturday": return 6;
			}
		} else {
			return day;
		}

	}

	private isWorkDay(day: number): boolean {
		for (const dayString of this.workingdays) {
			const workingDay = this.getDayOfWeekNumber(dayString);
			if (workingDay === day) {
				return true;
			}
		}
		return false;
	}

	private countExcluded(): number {
		const days = this.to.diff(this.from, "days");
		let excludedDays = 0;
		for (let i = 1; i <= days; i++) { // starting from 1 for not include the current day
			const weekday = this.from.clone().add(i, "days").weekday();
			if (!this.isWorkDay(weekday)) {
				excludedDays++;
			}
		}
		return excludedDays;
	}
}
