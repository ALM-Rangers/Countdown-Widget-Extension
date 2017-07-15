// ---------------------------------------------------------------------
// <copyright file="isettings.d.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>
//    This is part of the Countdown widget
//    from the ALM Rangers. This file contains the
//    typescript definition for the widget settings.
// </summary>
// ---------------------------------------------------------------------

interface ISettings {
	countDownDate: string;
	timezone: string;
	name: string;
	backgroundColor: string;
	foregroundColor: string;
	skipNonWorkingDays: boolean;
}
