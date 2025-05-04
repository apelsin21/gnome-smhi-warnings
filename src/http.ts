import "@girs/gjs";
import "@girs/gjs/dom";
import "@girs/soup-3.0";

import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import Soup from "gi://Soup?version=3.0";

import { console } from "./extension";

// export const get = (url: string): GLib.Bytes | undefined => {
// 	const session = new Soup.Session();

// 	const message = new Soup.Message({
// 		method: "GET",
// 		uri: GLib.Uri.parse(url, GLib.UriFlags.NONE),
// 	});

// 	let data: GLib.Bytes | undefined = undefined;

// 	const readBytesAsyncCallback: Gio.AsyncReadyCallback = (inputStream, res) => {
// 		try {
// 			data = (inputStream as Gio.InputStream).read_bytes_finish(res);

// 			if (!data) {
// 				throw new Error("data is null");
// 			}
// 		} catch (e) {
// 			logError(e);
// 			return;
// 		}
// 	};

// 	const send_async_callback: Gio.AsyncReadyCallback = (self, res) => {
// 		let inputStream: Gio.InputStream | null = null;

// 		try {
// 			inputStream = session.send_finish(res);

// 			if (!inputStream) {
// 				throw new Error("incomplete response");
// 			}
// 		} catch (e) {
// 			logError(e);
// 			return;
// 		}

// 		log(`GET status: ${message.statusCode} - ${message.reasonPhrase}`);

// 		message.responseHeaders.foreach((name, value) => {
// 			log(`${name}: ${value}`);
// 		});

// 		inputStream.read_bytes_async(
// 			message.responseHeaders.get_content_length(),
// 			0,
// 			null,
// 			readBytesAsyncCallback,
// 		);
// 	};

// 	session.send_async(message, 0, null, send_async_callback);

// 	return data;
// };

// imports.gi.versions.Soup = "3.0"
// const {Soup, GLib, Gio} = imports.gi

Gio._promisify(Gio.File.prototype, "create_async");
Gio._promisify(Gio.OutputStream.prototype, "write_bytes_async");
Gio._promisify(Gio.File.prototype, "replace_contents_async");
Gio._promisify(
	Gio.File.prototype,
	"replace_contents_bytes_async",
	"replace_contents_finish",
);
Gio._promisify(Soup.Session.prototype, "send_and_read_async");

const session = new Soup.Session();

export const get = async (url: string) => {
	console?.log("start of get");

	const message = Soup.Message.new("GET", url);

	const bytes = await session.send_and_read_async(
		message,
		GLib.PRIORITY_DEFAULT,
		null,
	);

	if (!bytes) {
		throw new Error("Got bad bytes");
	}

	const data = bytes.get_data();

	if (!data) {
		throw new Error("Got null from GET");
	}

	return JSON.parse(new TextDecoder().decode(data));
};
