import "@girs/gjs"; // For global types like `log()`
import St from "@girs/st-16";
import "@girs/soup-3.0";

import "@girs/gnome-shell/extensions/global"; // For global shell types
import {
	Extension,
	gettext as _,
	type ConsoleLike,
} from "@girs/gnome-shell/extensions/extension";
import * as PanelMenu from "@girs/gnome-shell/ui/panelMenu";
// import * as messageTray from "@girs/gnome-shell/ui/messageTray";
import * as Main from "@girs/gnome-shell/ui/main";

import { get } from "./http";
import { Response, WarningLevel } from "./types";

const smhiWarningsURL =
	"https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json";

const fetchSMHIWarnings = (url: string) => {};

type WarningCode = "Yellow" | "Orange" | "Red";

const warningCodeToStyleClassMap: Record<WarningCode, string> = {
	Yellow: "yellow-warning-icon",
	Orange: "orange-warning-icon",
	Red: "red-warning-icon",
};

const warningLevelSeverityMap: Record<WarningLevel, number> = {
	MESSAGE: 0,
	YELLOW: 1,
	ORANGE: 2,
	RED: 3,
};
const severityWarningLevelMap: Record<number, WarningLevel> = {
	0: "MESSAGE",
	1: "YELLOW",
	2: "ORANGE",
	3: "RED",
};

type State =
	| "Init"
	| "NetworkError"
	| "NoWarning"
	| "YellowWarning"
	| "OrangeWarning"
	| "RedWarning";

const getHighestWarningLevelFromResponse = (
	response: Response,
): WarningLevel => {
	let reachedSeverity = warningLevelSeverityMap.MESSAGE;

	for (const warning of response) {
		for (const area of warning.warningAreas) {
			const severity = warningLevelSeverityMap[area.warningLevel.code];

			if (severity > reachedSeverity) {
				reachedSeverity = severity;
			}
		}
	}

	const reachedWarningLevel = severityWarningLevelMap[reachedSeverity];

	return reachedWarningLevel ?? "MESSAGE";
};

const getStateFromResponse = (response: Response): State => {
	if (response.length) {
		const highestWarningLevel = getHighestWarningLevelFromResponse(response);

		switch (highestWarningLevel) {
			case "MESSAGE":
				return "NoWarning";
			case "YELLOW":
				return "YellowWarning";
			case "ORANGE":
				return "OrangeWarning";
			case "RED":
				return "RedWarning";
			default:
				return "NetworkError";
		}
	}

	return "NoWarning";
};

export let console: ConsoleLike | null = null;

const stateIcons: Record<State, St.Icon> = {
	Init: new St.Icon({
		icon_name: "arrows-loop-tall-symbolic",
		style_class: "system-status-icon",
	}),
	NetworkError: new St.Icon({
		icon_name: "offline-globe-symbolic",
		style_class: "system-status-icon",
	}),
	NoWarning: new St.Icon({
		styleClass: "no-warning-icon",
	}),
	YellowWarning: new St.Icon({
		styleClass: "yellow-warning-icon",
	}),
	OrangeWarning: new St.Icon({
		styleClass: "orange-warning-icon",
	}),
	RedWarning: new St.Icon({
		styleClass: "red-warning-icon",
	}),
};

export default class SMHIWarnings extends Extension {
	private _indicator: PanelMenu.Button | null = null;
	private _currentState: State = "Init";

	private updateState(newState: State) {
		console?.log(`updating with new state: ${newState}`);

		if (newState !== this._currentState && this._indicator) {
			this._indicator.remove_all_children();
			this._indicator.add_child(stateIcons[newState]);
		}
	}

	override enable() {
		if (this._indicator !== null) {
			return;
		}

		// Create a panel button
		this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

		this._indicator.add_child(stateIcons.Init);

		// Add the indicator to the panel
		Main.panel.addToStatusArea(this.uuid, this._indicator);

		console = this.getLogger();

		//Is called on enable extension
		console.log("SMHIWarnings is enabled");
		console.log("Det uppdateras igen 1933");

		get(smhiWarningsURL)
			.then((data) => {
				//Here update state and stuff.
				const newState = getStateFromResponse(data);

				this.updateState(newState);

				// this._indicator?.remove_child(warningIcons.Yellow);
				// this._indicator?.add_child(warningIcons.Red);

				// // Main.notify("SMHI Warning", JSON.stringify(data));
				// Main.notifyError("SMHI Error", "Error bodfy");
			})
			.catch((e) => {
				console?.log(`exception ${e}`);
				this._currentState = "NetworkError";
			});
	}

	override disable() {
		this._indicator?.destroy();
		this._indicator = null;
		console = null;
	}
}
