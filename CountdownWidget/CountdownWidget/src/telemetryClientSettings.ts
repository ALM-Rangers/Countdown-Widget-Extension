import * as tc from "telemetryclient-team-services-extension";

export const settings: tc.TelemetryClientSettings = {
	disableAjaxTracking: "true",
	disableTelemetry: "true",
	enableDebug: "false",
	extensioncontext: "CountdownWidget",
	key: "__InstrumentationKey__",
};
