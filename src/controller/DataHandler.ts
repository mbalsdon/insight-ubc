import {InsightDataset, InsightError} from "./IInsightFacade";
import * as fs from "fs-extra";

export default class DataHandler {
	public IDs: string[];
	public dataSets: {[id: string]: any[]};
	public insightDatasets: InsightDataset[];

	constructor(IDs: string[], dataSets: {[id: string]: any[]}, insightDatasets: InsightDataset[] ) {
		this.IDs = IDs;
		this.dataSets = dataSets;
		this.insightDatasets = insightDatasets;
	}

	public checkID = (id: string): Promise<string> => {
		return new Promise<string>((resolve, reject) => {
			const idRegA: RegExp = /^.*_.*$/;
			const idRegB: RegExp = /^\s*$/;
			if (!(idRegA.test(id) || idRegB.test(id))) {
				resolve("sucess");
			} else  {
				reject(new InsightError("data set ID mistake"));
			}
		});
	};

	public clearCache(): Promise<string> {
		return new Promise<string>((resolve) => {
			this.IDs.splice(0, this.IDs.length);
			for (let key of Object.keys(this.dataSets)) {
				delete this.dataSets[key];
			}
			this.insightDatasets.splice(0, this.insightDatasets.length);
			resolve("success");
		});
	}

	public saveAllToDisk(): Promise<string[]> {
		let promises: Array<Promise<string>> = [];
		for (let idData of this.IDs) {
			promises.push(this.saveOneRecord(idData));
		}
		return Promise.all(promises);
	}

	private saveOneRecord(idData: string): Promise<string> {
		return new Promise<string> ((resolve, reject) => {
			let record!: InsightDataset;
			for (let val of this.insightDatasets) {
				if (val.id === idData) {
					record =  val;
				}
			}
			let arrData = this.dataSets[idData];
			let save = {insightDataset: record, data: arrData};
			let str = JSON.stringify(save);
			try {
				fs.writeFileSync("./data/" + idData, str, { encoding: "utf8" });
				resolve("success");
			} catch (e) {
				reject(new InsightError("save to disk error"));
			}
		});
	}

	public loadData(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			let files = fs.readdirSync("./data");
			let stringArray: string[] = [];
			files.forEach((fileName) => {
				stringArray.push(fs.readFileSync("./data/" + fileName, { encoding: "utf8" }).toString());
			});
			resolve(stringArray);
		});
	}

	public saveToCache(data: string[]): Promise<string[]> {
		return new Promise<string[]> ((resolve, reject) => {
			data.forEach((str) => {
				let obj = JSON.parse(str);
				let insightDataset: InsightDataset = obj.insightDataset;
				let arr = obj.data;
				for (let item of arr) {
					for (let key of Object.keys(item)) {
						if (item[key] === undefined) {
							item[key] = "";
						}
					}
				}
				this.insightDatasets.push(insightDataset);
				this.dataSets[insightDataset.id] = arr;
				this.IDs.push(insightDataset.id);
			});
			return resolve(this.IDs);
		});
	}
}
