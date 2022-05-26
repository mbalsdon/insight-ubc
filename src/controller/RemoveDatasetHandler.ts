import {InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import DataHandler from "./DataHandler";

export default class RemoveDatasetHandler {
	private dataHandler: DataHandler;

	constructor(dataHandler: DataHandler) {
		this.dataHandler = dataHandler;
	}

	public removeDataset(id: string): Promise<string> {
		return this.dataHandler.clearCache().then((info) => {
			return this.dataHandler.loadData();
		}).then((data) => {
			return this.dataHandler.saveToCache(data);
		}).then (() => {
			return this.dataHandler.checkID(id);
		}).then(() => {
			return this.checkIfIdExists(id);
		}).then(() => {
			return this.deleteIdInCache(id);
		}).then(() => {
			return this.removeAllDisk();
		}).then (() => {
			return this.dataHandler.saveAllToDisk();
		}).then(() => {
			return Promise.resolve(id);
		});
	}

	private checkIfIdExists (id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (!this.dataHandler.IDs.includes(id)) {
				reject(new NotFoundError("id not found"));
			} else {
				resolve("success");
			}
		});
	}

	private removeDataFromDisk = (id: string): Promise<string> => {
		return new Promise<string>((resolve, reject) => {
			try {
				fs.removeSync("./data/" + id);
				resolve("success");
			} catch (e) {
				reject(new InsightError("remove disk fail"));
			}
		});
	};

	private removeAllDisk = (): Promise<string[]> => {
		let files = fs.readdirSync("./data");
		let promises: Array<Promise<string>> = [];
		files.forEach((name) => {
			promises.push(this.removeDataFromDisk(name));
		});
		return Promise.all(promises);
	};

	private deleteIdInCache(id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			try {
				let index: number = this.dataHandler.IDs.indexOf(id);
				this.dataHandler.IDs.splice(index, 1);
				delete this.dataHandler.dataSets[id];
				for (let index2 = 0; index2 < this.dataHandler.insightDatasets.length; index2++) {
					if (this.dataHandler.insightDatasets[index2].id === id) {
						this.dataHandler.insightDatasets.splice(index2, 1);
						break;
					}
				}
				resolve(id);
			} catch (e) {
				reject(new InsightError("remove cache error"));
			}
		});
	}
}
