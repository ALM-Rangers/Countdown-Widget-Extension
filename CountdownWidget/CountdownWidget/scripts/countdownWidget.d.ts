/// <reference path="../typings/tsd.d.ts" />
export declare class CountdownWiget {
    WidgetHelpers: any;
    isSprintEndWidget: boolean;
    constructor(WidgetHelpers: any, isSprintEndWidget: boolean);
    private showSprintWidget(customSettings);
    private display(to, name, backgroundColor, foregroundColor);
    private showCountdownWidget(customSettings);
    private showCountdown(widgetSettings);
    load(widgetSettings: any): any;
    reload(widgetSettings: any): any;
}
