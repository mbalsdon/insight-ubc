import {InsightError} from "./IInsightFacade";
import JSZip from "jszip";

export default class DataGen {
	private deptRecords: string[];
	private courseIdRecords: string[];
	private zipfile: JSZip;

	constructor(zipfile: JSZip) {
		this.zipfile = zipfile;
		this.deptRecords = [];
		this.courseIdRecords = [];
	}

	public loadCourseData(id: string, zipData: JSZip): Promise<any[]> {
		return new Promise<any[]>((resolve, reject) => {
			this.getZipFiles(zipData).then((data: JSZip) => {
				return this.parseFilesToStringArray(data);
			}).then((stringArray: string[]) => {
				return this.parseZipToObject(stringArray);
			}).then((fileArray: any[]) => {
				return this.getRecordArray(id, fileArray);
			}).then((data) => {
				resolve(data);
			}).catch((error: any) => {
				reject(error);
			});
		});
	}

	private getZipFiles(zipData: JSZip): Promise<JSZip> {
		return new Promise<JSZip>((resolve, reject) => {
			let allFiles = zipData.files;
			for (let fileName of Object.keys(allFiles)) {
				if (allFiles[fileName].dir && allFiles[fileName].name === "courses/") {
					return resolve(zipData);
				}
			}
			return reject(new InsightError("no course folder"));
		});
	}

	private parseFilesToStringArray(zipData: JSZip): Promise<string[]> {
		let promises: Array<Promise<string>> = [];
		let allFiles = zipData.files;
		Object.keys(allFiles).forEach((fileName: string) => {
			if (!allFiles[fileName].dir) {
				const nameRegex1 = /^courses\/[^/]*$/g;
				const nameRegex = /^courses\/([A-Z]+)([0-9]+[A-Z]*)$/g;
				if (nameRegex1.test(fileName)) {
					let group = nameRegex.exec(fileName);
					// just doing this to get around using the ! operator since ESLint doesn't like it. -balsdon
					if (group === null) {
						throw new Error("group in parseFilesToStringArray was null - this should never happen!");
					}
					let dept: string = group[1];
					let id: string = group[2];
					this.deptRecords.push(dept.toLowerCase());
					this.courseIdRecords.push(id);
					// just doing this to get around using the ! operator since ESLint doesn't like it. -balsdon
					let intermediary = this.zipfile.file(fileName);
					if (intermediary === null) {
						throw new Error ("intermediary in parseFilesToStringArray is null - this should never happen!");
					}
					promises.push(intermediary.async("text"));
				}
			}
		});
		return Promise.all(promises);
	}

	private parseZipToObject(stringArray: string[]): Promise<any> {
		let promises: Array<Promise<any>> = [];
		for (let i = 0; i < stringArray.length; i++) {
			promises.push(this.JSONParse(stringArray[i], this.deptRecords[i], this.courseIdRecords[i]));
		}
		return Promise.all(promises);
	}

	private JSONParse(str: string, dept: string, cid: string): Promise<any> {
		return new Promise<any>((resolve) => {
			try {
				let fileObj = JSON.parse(str);
				fileObj.dept = dept;
				fileObj.courseId = cid;
				resolve(fileObj);
			} catch (e) {
				// I don't know
			}
		});
	}

	private getRecordArray(id: string, fileArray: any[]): Promise<any> {
		let promises: Array<Promise<any>> = [];
		fileArray.forEach((data: any) => {
			if (this.isValidFile(data)) {
				for (let record of data.result) {
					if (this.isValidRecord(record)) {
						record.dept = data.dept;
						let uuid = record.id;
						delete record[id];
						record.id = data.courseId;
						record.uuid = uuid.toString();
						if (Object.keys(record).includes("Section") && record.Section === "overall") {
							record.Year = 1900;
						} else {
							record.Year = Number(record.Year);
						}
						let returnObj: {[s: string]: any} = {};
						for (let ele of Object.keys(record)) {
							let value = record[ele];
							let ell = ele.toLowerCase();
							if (Object.keys(this.Componenets).includes(ell)) {
								let newKey = id + "_" + this.Componenets[ell];
								returnObj[newKey] = value;
							}
						}
						for (let key of Object.values(this.Componenets)) {
							let updateKey = id + "_" + key;
							if (returnObj[updateKey] === undefined) {
								returnObj[updateKey] = "";
							}
						}
						promises.push(Promise.resolve(returnObj));
					}
				}
			}
		});
		return Promise.all(promises);
	}

	private isValidFile = (file: any): boolean => {
		if (typeof file !== "object") {
			return false;
		}
		if (file === null || file === undefined) {
			return false;
		} else if (!(Object.keys(file).includes("result")) || !(file.result instanceof Array)) {
			return false;
		}
		return true;
	};

	private isValidRecord(record: any): boolean {
		if (typeof record !== "object") {
			return false;
		}
		if (record === null || record === undefined) {
			return false;
		} else if (!this.hasValidField(record)) {
			return false;
		}
		return true;
	}

	private hasValidField = (o: any): boolean => {
		let keys = Object.keys(o);
		for (let expectKey of this.fileKeys) {
			if (!keys.includes(expectKey)) {
				return false;
			}
		}
		if (typeof o.Title !== "string") {
			return false;
		}
		if (typeof o.id !== "number") {
			return false;
		}
		if (typeof o.Professor !== "string") {
			return false;
		}
		if (typeof o.Audit !== "number") {
			return false;
		}
		if (typeof o.Year !== "string") {
			return false;
		} else if (isNaN(Number(o.Year))) {
			return false;
		}
		if (typeof o.Pass !== "number" || typeof o.Fail !== "number" || typeof o.Avg !== "number") {
			return false;
		}
		return true;
	};

	private Componenets: { [s: string]: string} = {
		avg: "avg",
		pass: "pass",
		fail: "fail",
		audit: "audit",
		year: "year",
		dept: "dept",
		id: "id",
		professor: "instructor",
		title: "title",
		uuid: "uuid"
	};

	private fileKeys: string[] = [
		"Title",
		"id",
		"Professor",
		"Audit",
		"Year",
		"Pass",
		"Fail",
		"Avg"
	];
}
