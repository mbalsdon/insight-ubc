import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import CourseDataGen from "./CourseDataGen";
import RoomDataGen from "./RoomDataGen";
import DataHandler from "./DataHandler";

export default class AddDatasetHandler {
	private dataHandler: DataHandler;
	private zipfile = new JSZip();

	constructor(dataHandler: DataHandler) {
		this.dataHandler = dataHandler;
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.dataHandler.clearCache().then(() => {
			return this.dataHandler.loadData();
		}).then((data) => {
			return this.dataHandler.saveToCache(data);
		}).then(() => {
			return this.dataHandler.checkID(id);
		}).then(() => {
			return this.checkIfIdExists(id);
		}).then(() => {
			return this.loadZip(content);
		}).then((zipData: JSZip) => {
			switch (kind) {
				case InsightDatasetKind.Courses:
					return new CourseDataGen(this.zipfile).loadCourseData(id, zipData);
				case InsightDatasetKind.Rooms:
					return new RoomDataGen(this.zipfile).loadRoomData(id, zipData);
			}
		}).then((arr: any[]) => {
			return this.storeData(arr, id, kind);
		}).then(() => {
			return this.dataHandler.saveAllToDisk();
		}).then(() => {
			return Promise.resolve(this.dataHandler.IDs);
		});
	}

	private checkIfIdExists (id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if (this.dataHandler.IDs.includes(id)) {
				reject(new InsightError("id already exists"));
			} else {
				resolve("success");
			}
		});
	}

	private loadZip(content: string): Promise<JSZip> {
		return new Promise<JSZip>((resolve, reject) => {
			this.zipfile.loadAsync(content, {
				base64: true, createFolders: true
			}).then((zipData: JSZip) => {
				return resolve(zipData);
			}).catch(() => {
				return reject(new InsightError("not a valid zipfile"));
			});
		});
	}

	private storeData(arr: any[], id: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			if (arr.length === 0) {
				return reject(new InsightError("no valid record added"));
			} else {
				let dataSetRecord: InsightDataset = {
					id: "", kind: InsightDatasetKind.Courses, numRows: 0 };
				dataSetRecord.id = id;
				dataSetRecord.kind = kind;
				dataSetRecord.numRows = arr.length;
				this.dataHandler.insightDatasets.push(dataSetRecord);
				this.dataHandler.IDs.push(id);
				this.dataHandler.dataSets[id] = arr;
				return resolve(this.dataHandler.IDs);
			}
		});
	}
}
