// ---------------------------------------------------------------------
// <copyright file="countdownResult.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    code for a countdown result and unit.
// </summary>
// ---------------------------------------------------------------------

export class CountdownResult {
	constructor(public value: number, public unit: Unit) {
	}

	public getValueFontSize(): string {
		if (this.getDisplayValue().length >= 4) {
			return "55px";
		}

		return "72px";
	}

	public getDisplayValue(): string {
		if (this.unit === Unit.Days) {
			return this.value.toFixed(1);
		}

		return this.value.toFixed(0);
	}

	public getDisplayUnit(): string {
		return Unit[this.unit].toLowerCase();
	}
}

export enum Unit { Years, Days, Hours, Minutes, Seconds, Invalid }
