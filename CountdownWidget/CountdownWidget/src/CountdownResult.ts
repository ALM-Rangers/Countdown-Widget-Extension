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

	public getDisplayString(): string {
		return Unit[this.unit].toLowerCase();
	}
}

export enum Unit { Years, Days, Hours, Minutes, Seconds, Invalid }
