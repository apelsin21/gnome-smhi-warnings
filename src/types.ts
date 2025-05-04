export type WarningLevel = "MESSAGE" | "ORANGE" | "YELLOW" | "RED";

export type WarningArea = {
	id: number;
	approximateStart: string;
	published: string;
	normalProbability: boolean;
	pushNotice: boolean;
	areaName: { sv: string };
	warningLevel: {
		sv: string;
		en: string;
		code: WarningLevel;
	};
	eventDescription: {
		sv: string;
		en: string;
		code: string;
	};
	affectedAreas: { id: number; sv: string; en: string }[];
	descriptions: {
		title: {
			sv: string;
			en: string;
			code: string;
		};
		text: {
			sv: string;
			en: string;
		};
	}[];
	area: {
		crs: { type: string; properties: { name: string } };
		type: string;
		geometry: {
			type: string;
			coordinates: number[][][];
		};
		properties: {
			en: string;
			id: number;
			sv: string;
			code: string;
		};
	};
	created: string;
};

export type Warning = {
	id: number;
	normalProbability: boolean;
	event: {
		sv: string;
		en: string;
		code: string;
		mhoClassification: {
			sv: string;
			en: string;
			code: string;
		};
	};
	descriptions: [];
	warningAreas: WarningArea[];
};

export type Response = Warning[];
