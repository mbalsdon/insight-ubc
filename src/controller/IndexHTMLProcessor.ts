import {request} from "http";
import {InsightError} from "./IInsightFacade";

export default class IndexHTMLProcessor {
	private id: string;

	constructor(id: string) {
		this.id = id;
	}

	private buildingDataSet: Array<{[attribute: string]: any}> = [];

	public getBuildingAll = (id: string, doc: any): Promise<Array<{[attribute: string]: any}>> => {
		return new Promise<Array<{[p: string]: any}>>( (resolve, reject) => {
			this.addBuildingInfo(id, doc).then(() => {
				return this.getGeoLocationArray(id);
			}).then((arr) => {
				for (let i = 0; i < this.buildingDataSet.length; i++) {
					if (arr[i].lat) {
						let latAttr  = this.id + "_" + "lat";
						let lonAttr = this.id + "_" + "lon";
						this.buildingDataSet[i][latAttr] = arr[i].lat;
						this.buildingDataSet[i][lonAttr] = arr[i].lon;
					}
				}
				return resolve(this.buildingDataSet);
			}).catch((err: any) => {
				reject(err);
			});
		});
	}

	private addBuildingInfo = (id: string, doc: any): Promise<Array<{[attribute: string]: any}>> => {
		return new Promise((resolve) => {
			this.addBuildingInfoHelper(id, doc);
			return resolve(this.buildingDataSet);
		});
	}

	private addBuildingInfoHelper = (id: string, o: any): void => {
		if (this.isBuildingTr(o)) {
			this.addBuildingTrInfo(id, o);
		}
		if (typeof o === "object" && o !== null && o.childNodes && o.childNodes instanceof Array) {
			o.childNodes.forEach((child: any) => {
				this.addBuildingInfoHelper(id, child);
			});
		}
	}

	private addBuildingTrInfo = (id: string, o: any): void => {
		let info: {[attr: string]: any} = {};
		for (let node of o.childNodes) {
			if (node.nodeName === "td") {
				if (node.attrs[1].name === "views-field-field-building-code\\\"") {
					let shortNameAttr = this.id + "_" + "shortname";
					info[shortNameAttr] = this.getFieldTextString(node);
				} else if (node.attrs[1].name === "views-field-field-building-address\\\"") {
					let address = this.getFieldTextString(node);
					let addressAttr = this.id + "_" + "address";
					info[addressAttr] = address;
				} else if (node.attrs[1].name === "views-field-title\\\"") {
					let fullnameAttr = this.id + "_" + "fullname";
					info[fullnameAttr] = this.getFieldHrefString(node);
					info.file_pos = this.getFileString(node);
				}
			}
			let repeat = false;
			for (let item of this.buildingDataSet) {
				let shortnameField: string = id + "_shortname";
				if (item[shortnameField] === info[shortnameField]) {
					repeat = true;
					break;
				}
			}
			if (!repeat) {
				this.buildingDataSet.push(info);
			}
		}
	}

	private getGeoLocationArray = (id: string): Promise<any[]> => {
		let promises: Array<Promise<any>> = [];
		this.buildingDataSet.forEach((o) => {
			let addrField: string = id + "_address";
			promises.push(this.getGeoLocation(o[addrField]));
		});
		return Promise.all(promises);
	}

	private getGeoLocation = (addr: string): Promise< {
		lat?: number;
		lon?: number;
		error?: string;
	}> => {
		return new Promise((resolve, reject) => {
			let address = addr.replace(/\s+/gi, "%20");
			request({
				host: "cs310.students.cs.ubc.ca",
				path: "/api/v1/project_team163/" + address,
				method: "GET",
				port: "11316"
			}, (response) => {
				const{ statusCode } = response;
				if (statusCode === 404) {
					reject(new InsightError(address));
				}
				response.on("data", (chunk) => {
					resolve(JSON.parse(chunk.toString()));
				});
			}).end();
		});
	}

	private getFieldTextString = (o: any): string => {
		let field: string = o.childNodes[0].value;
		return field.substring(14, field.length - 10);
	}

	private getFieldHrefString = (o: any): string => {
		let nodeHref: any;
		for (let node of o.childNodes) {
			if (node.nodeName === "a") {
				nodeHref = node;
				break;
			}
		}
		return  nodeHref.childNodes[0].value;
	}

	private getFileString = (o: any): string => {
		let nodeHref: any = {};
		for (let node of o.childNodes) {
			if (node.nodeName === "a") {
				nodeHref = node;
				break;
			}
		}
		let str: string = "";
		for (let node of nodeHref.attrs) {
			if (node.name === "href") {
				str = node.value;
			}
		}
		return str.substring(2, str.length - 2);
	}

	private isBuildingTr = (o: any): boolean => {
		if (typeof o === "object" && o !== null && o.nodeName && o.nodeName === "tr") {
			if (o.childNodes && o.childNodes instanceof Array && o.childNodes.length > 0) {
				for (let node of o.childNodes) {
					if (node.nodeName === "td") {
						if (node.attrs && node.attrs instanceof Array) {
							for (let element of node.attrs) {
								if (element.name === "views-field-field-building-code\\\"" && element.value === "") {
									return true;
								}
							}
						}
					}
				}
			}
		}
		return false;
	}

}
