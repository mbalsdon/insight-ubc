import {InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import IndexHTMLProcessor from "./IndexHTMLProcessor";
import BuildingHTMLProcessor from "./HTMLProcessor";

export default class RoomDataGen {
	private zipfile: JSZip;
	private zipData!: JSZip;
	private indexHTMLData!: any[];
	private shortnames: string[];

	constructor(zipfile: JSZip) {
		this.zipfile = zipfile;
		this.shortnames = [];
	}

	public loadRoomData(id: string, zipData: JSZip): Promise<any[]> {
		return new Promise<any[]>((resolve, reject) => {
			this.getZipFiles(zipData).then((data) => {
				return this.getIndexHTMLString(data);
			}).then((htmlString) => {
				return this.getIndexHTMLObject(JSON.stringify(htmlString));
			}).then((dom) => {
				return RoomDataGen.getIndexHTMLInfo(id, dom);
			}).then((dom) => {
				return this.getEachHTMLString(dom);
			}).then((arr) => {
				let attachedList: any[] = [];
				for (let i = 0; i < this.shortnames.length; i++) {
					let attached: any = {};
					attached["shortname"] = this.shortnames[i];
					attached["HTML_string"] = arr[i];
					attachedList.push(attached);
				}
				return this.addEachHTMLString(id, attachedList);
			}).then((withHTML: any[]) => {
				return RoomDataGen.getBuildingHTMLInfo(id, withHTML);
			}).then((data) => {
				resolve(data);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	private getZipFiles(zipData: JSZip): Promise<JSZip> {
		return new Promise<JSZip>((resolve, reject) => {
			let allFiles = zipData.files;
			for (let fileName of Object.keys(allFiles)) {
				if (allFiles[fileName].dir && allFiles[fileName].name === "rooms/") {
					this.zipData = zipData;
					return resolve(zipData);
				}
			}
			return reject(new InsightError("no room folder"));
		});
	}

	private getIndexHTMLString(zipData: JSZip): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let allFiles = zipData.files;
			for (let fileName of Object.keys(allFiles)) {
				const nameRegex = /^rooms\/index.htm$/g;
				if (nameRegex.test(fileName)) {
					let intermediary = this.zipfile.file(fileName);
					if (intermediary === null) {
						throw new Error("intermediary in getIndexHTMLString is null - this should never happen!");
					}
					return resolve(intermediary.async("text"));
				}
			}
			return reject("this.zip.file");
		});
	}

	private getIndexHTMLObject(htmlString: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			try {
				let parse5 = require("parse5");
				let doc = parse5.parse(htmlString);
				return resolve(doc);
			} catch (err) {
				return reject(new InsightError("index.htm parse error"));
			}
		});
	}

	private static getIndexHTMLInfo(id: string, doc: any): Promise<Array<{[attribute: string]: any}>> {
		return new IndexHTMLProcessor(id).getBuildingAll(id, doc);
	}

	private static getBuildingHTMLInfo(id: string, data: any[]): Promise<any[]> {
		return new BuildingHTMLProcessor(id).getRoomInfo(data);
	}

	private getEachHTMLString(data: any[]): Promise<string[]> {
		this.indexHTMLData = data;
		let allFiles = this.zipData.files;
		let promises: Array<Promise<any>> = [];
		data.forEach((item) => {
			let filePos = item.file_pos.replace(".", "rooms");
			for (let fileName of Object.keys(allFiles)) {
				if (fileName === filePos) {
					let intermediary = this.zipfile.file(fileName);
					if (intermediary === null) {
						throw new Error("intermediary in getEachHTMLString is null - this should never happen!");
					}
					this.shortnames.push(fileName.substring(fileName.lastIndexOf("/") + 1, fileName.length));
					promises.push(intermediary.async("text"));
				}
			}
		});
		return Promise.all(promises);
	}

	private addEachHTMLString(id: string, attachedList: any[]): Promise<any> {
		return new Promise<any>((resolve) => {
			let withHTML: any[] = [];
			for (let item of this.indexHTMLData) {
				for (let attached of attachedList) {
					if (item[id + "_shortname"] === attached.shortname) {
						let updatedItem = item;
						updatedItem["HTML_string"] = attached.HTML_string;
						withHTML.push(updatedItem);
					}
				}
			}
			return resolve(withHTML);
		});
	}

}
