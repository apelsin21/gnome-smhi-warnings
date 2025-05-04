import "@girs/gjs"; // For global types like `log()`
import St from "@girs/st-16";
import "@girs/soup-3.0";

import Soup from "gi://Soup?version=3.0";
import "@girs/gnome-shell/extensions/global"; // For global shell types
import {
	Extension,
	gettext as _,
	type ConsoleLike,
} from "@girs/gnome-shell/extensions/extension";
import * as PanelMenu from "@girs/gnome-shell/ui/panelMenu";
import * as Main from "@girs/gnome-shell/ui/main";

import { get } from "./http";

const smhiWarningsURL =
	"https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json";

const fetchSMHIWarnings = (url: string) => {};

type WarningCode = "Yellow" | "Orange" | "Red";

const warningCodeToStyleClassMap: Record<WarningCode, string> = {
	Yellow: "yellow-warning-icon",
	Orange: "orange-warning-icon",
	Red: "red-warning-icon",
};

const warningCodeSeverityMap: Record<WarningCode, number> = {
	Yellow: 1,
	Orange: 2,
	Red: 3,
};

type State =
	| "NetworkError"
	| "NoWarning"
	| "YellowWarning"
	| "OrangeWarning"
	| "RedWarning";

const getStateFromApi = (apiUrl: string): State => {};

export let console: ConsoleLike | null = null;

export default class SMHIWarnings extends Extension {
	private _indicator: PanelMenu.Button | null = null;

	override enable() {
		if (this._indicator !== null) {
			return;
		}

		// Create a panel button
		this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

		const warningIcons: Record<WarningCode, St.Icon> = {
			Yellow: new St.Icon({
				styleClass: "yellow-warning-icon",
			}),
			Orange: new St.Icon({
				styleClass: "orange-warning-icon",
			}),
			Red: new St.Icon({
				styleClass: "red-warning-icon",
			}),
		};

		this._indicator.add_child(warningIcons.Yellow);

		// Add the indicator to the panel
		Main.panel.addToStatusArea(this.uuid, this._indicator);

		console = this.getLogger();

		//Is called on enable extension
		console.log("SMHIWarnings is enabled");
		console.log("Det uppdateras igen 1826");

		get(smhiWarningsURL)
			.then((data) => {
				console?.log(`got data: ${JSON.stringify(data)}`);

				//Here update state and stuff.
				this._indicator?.remove_child(warningIcons.Yellow);
				this._indicator?.add_child(warningIcons.Red);
			})
			.catch((e) => {
				console?.log(`exception ${e}`);
			});
	}

	override disable() {
		this._indicator?.destroy();
		this._indicator = null;
		console = null;
	}
}
