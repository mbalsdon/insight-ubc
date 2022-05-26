import {InsightError} from "./IInsightFacade";
import WhereChecker from "./WhereChecker";
import OptionsChecker from "./OptionsChecker";
import {QueryLogic} from "./QueryLogic";
import TransformsChecker from "./TransformsChecker";

export default class SyntaxChecker {

	private whereChecker: WhereChecker;
	private optionsChecker: OptionsChecker;
	private transformsChecker: TransformsChecker;
	private isRooms: boolean;

	constructor() {
		this.whereChecker = new WhereChecker();
		this.optionsChecker = new OptionsChecker();
		this.transformsChecker = new TransformsChecker();
		this.isRooms = false;
	}

	public getColumnKeys(): string[] {
		return this.optionsChecker.getColumnKeys();
	}

	public getGroupKeys(): string[] {
		return this.transformsChecker.getGroupKeys();
	}

	public getOrderKeys(): string[] {
		return this.optionsChecker.getOrderKeys();
	}

	public getDir(): string {
		return this.optionsChecker.getDir();
	}

	public getIsRooms(): boolean {
		return this.isRooms;
	}

	public checkQuerySyntax(query: any, IDs: string[]) {
		if (query === null) {
			throw new InsightError("Invalid query - null");
		}
		this.whereChecker.checkWhere(query.WHERE);
		this.optionsChecker.checkOptions(query.OPTIONS);
		this.transformsChecker.checkTransforms(query.TRANSFORMATIONS);

		this.checkOrderKeysInColumns();

		if (query.TRANSFORMATIONS !== undefined) {
			this.checkApplyKeyUniqueness();
			this.checkColumnKeysInTransforms();
		} else {
			this.checkColumnKeysHasNoApplyKeys();
		}

		this.checkDatasetHomogeneity(query.TRANSFORMATIONS);
		this.checkDatasetExists(IDs, query.TRANSFORMATIONS);
		this.checkCourseRoomFieldHomogeneity(query.TRANSFORMATIONS);
	}

	private checkCourseRoomFieldHomogeneity(transforms: any) {
		let applyList: any[] = this.transformsChecker.getApplyList();
		let applyVals: any[] = applyList.map((obj: any) => Object.values(obj)[0]);

		let applyTargetKeys: any[] = applyVals.map((obj: any) => Object.values(obj)[0]);
		let whereKeys: string[] = this.whereChecker.getWhereKeys();
		let columnKeys: string[] = this.optionsChecker.getColumnKeys();
		let orderKeys: string[] = this.optionsChecker.getOrderKeys();
		let groupKeys: string[] = this.transformsChecker.getGroupKeys();

		this.checkFieldHomogeneity(applyTargetKeys);
		this.checkFieldHomogeneity(whereKeys);
		this.checkFieldHomogeneity(columnKeys);
		this.checkFieldHomogeneity(orderKeys);
		this.checkFieldHomogeneity(groupKeys);

		let isRooms: boolean;
		if (transforms !== undefined) {
			isRooms = QueryLogic.isRoomKey(groupKeys[0]);
			if ((whereKeys.length !== 0) && (QueryLogic.isRoomKey(whereKeys[0]) !== isRooms)) {
				throw new InsightError("Cannot use room and course keys in the same query");
			}
			if ((columnKeys.length !== 0) && (QueryLogic.isRoomKey(columnKeys[0]) !== isRooms)) {
				throw new InsightError("Cannot use room and course keys in the same query");
			}
			if ((applyTargetKeys.length !== 0) && (QueryLogic.isRoomKey(applyTargetKeys[0]) !== isRooms)) {
				throw new InsightError("Cannot use room and course keys in the same query");
			}
		} else {
			isRooms = QueryLogic.isRoomKey(columnKeys[0]);
			if ((whereKeys.length !== 0) && (QueryLogic.isRoomKey(whereKeys[0]) !== isRooms)) {
				throw new InsightError("Cannot use room and course keys in the same query");
			}
			if ((orderKeys.length !== 0) && (QueryLogic.isRoomKey(orderKeys[0]) !== isRooms)) {
				throw new InsightError("Cannot use room and course keys in the same query");
			} // TODO
		}

		this.isRooms = isRooms;
	}

	private checkFieldHomogeneity(keyList: any[]) {
		if (keyList.length === 0) {
			return;
		} else if (QueryLogic.isCourseKey(keyList[0])) {
			for (let key of keyList) {
				if (!QueryLogic.isCourseKey(key) && !QueryLogic.isApplyKey(key)) {
					throw new InsightError("Invalid key " + key);
				}
			}
		} else if (QueryLogic.isRoomKey(keyList[0])) {
			for (let key of keyList) {
				if (!QueryLogic.isRoomKey(key) && !QueryLogic.isApplyKey(key)) {
					throw new InsightError("Invalid key " + key);
				}
			}
		}
	}

	private checkDatasetHomogeneity(transforms: any) {

		let whereDatasets: string[] = this.whereChecker.getReferencedDatasets();

		let columnKeys: string[] = this.optionsChecker.getColumnKeys();
		let columnsDatasets: string[] = [];
		for (let key of columnKeys) {
			if (!QueryLogic.isApplyKey(key)) {
				columnsDatasets.push(QueryLogic.getID(key));
			}
		}

		let orderKeys: string[] = this.optionsChecker.getOrderKeys();
		let orderDatasets: string[] = [];
		for (let key of orderKeys) {
			if (!QueryLogic.isApplyKey(key)) {
				orderDatasets.push(QueryLogic.getID(key));
			}
		}

		let groupKeys: string[] = this.transformsChecker.getGroupKeys();
		let groupDatasets: string[] = groupKeys.map((key: string) => QueryLogic.getID(key));

		let applyList: any[] = this.transformsChecker.getApplyList();
		let applyVals: any[] = applyList.map((obj: any) => Object.values(obj)[0]);
		let applyTargetKeys: any[] = applyVals.map((obj: any) => Object.values(obj)[0]);
		let applyDatasets: string[] = applyTargetKeys.map((key: string) => QueryLogic.getID(key));

		if (transforms !== undefined) {
			this.checkDatasetHomogeneityUsingGroup(whereDatasets, columnsDatasets, orderDatasets, groupDatasets,
				applyDatasets);
		} else {
			this.checkDatasetHomogeneityUsingColumns(whereDatasets, columnsDatasets, orderDatasets);
		}
	}

	private checkDatasetHomogeneityUsingGroup
	(where: string[], columns: string[], order: string[], group: string[], apply: string[]) {

		if (!this.allEqual(group)
			|| !this.allEqual(where)
			|| !this.allEqual(columns)
			|| !this.allEqual(order)
			|| !this.allEqual(apply)) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((where.length !== 0) && (where[0] !== group[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((columns.length !== 0) && (columns[0] !== group[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((order.length !== 0) && (order[0] !== group[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((apply.length !== 0) && (apply[0] !== group[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
	}

	private checkDatasetHomogeneityUsingColumns(where: string[], columns: string[], order: string[]) {

		if (!this.allEqual(where)
			|| !this.allEqual(columns)
			|| !this.allEqual(order)) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((where.length !== 0) && (where[0] !== columns[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
		if ((order.length !== 0) && (order[0] !== columns[0])) {
			throw new InsightError("Cannot query more than one dataset");
		}
	}

	private checkOrderKeysInColumns() {
		let orderKeys: string[] = this.optionsChecker.getOrderKeys();
		let columnKeys: string[] = this.optionsChecker.getColumnKeys();

		// console.log(orderKeys);
		// console.log(columnKeys);

		for (let orderKey of orderKeys) {
			if (!columnKeys.includes(orderKey)) {
				throw new InsightError("All ORDER keys must be in COLUMNS");
			}
		}

		// if (!orderKeys.every((elem: string) => columnKeys.includes(elem))) {
		// 	throw new InsightError("All ORDER keys must be in COLUMNS");
		// }
	}

	private checkApplyKeyUniqueness() {
		let applyList: any[] = this.transformsChecker.getApplyList();
		let applyKeys = applyList.map((obj: any) => Object.keys(obj)[0]);

		// Taken from https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
		function unique(value: any, index: any, self: any) {
			return self.indexOf(value) === index;
		}

		if (applyKeys.length !== applyKeys.filter(unique).length) {
			throw new InsightError("Cannot have duplicate APPLYKEYs");
		}
	}

	private checkColumnKeysInTransforms() {
		let columnKeys: string[] = this.optionsChecker.getColumnKeys();
		let columnNonApplyKeys: string[] = [];
		let columnApplyKeys: string[] = [];
		for (let key of columnKeys) {
			if (QueryLogic.isMkey(key) || QueryLogic.isSkey(key)) {
				columnNonApplyKeys.push(key);
			} else if (QueryLogic.isApplyKey(key)) {
				columnApplyKeys.push(key);
			} else {
				throw new Error("checkColumnKeysInTransforms was passed an invalid key - " +
					"this should never happen!");
			}
		}

		let groupKeys: string[] = this.transformsChecker.getGroupKeys();
		let applyList: any[] = this.transformsChecker.getApplyList();
		let applyKeys = applyList.map((obj: any) => Object.keys(obj)[0]);

		if (!columnNonApplyKeys.every((elem: string) => groupKeys.includes(elem))) {
			throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
		} else if (!columnApplyKeys.every((elem: string) => applyKeys.includes(elem))) {
			throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
		}
	}

	private checkColumnKeysHasNoApplyKeys() {
		let columnKeys: string[] = this.optionsChecker.getColumnKeys();
		for (let key of columnKeys) {
			if (QueryLogic.isApplyKey(key)) {
				throw new InsightError("Invalid key " + key + " in COLUMNS");
			}
		}
	}

	private checkDatasetExists(IDs: string[], transforms: any) {
		if (transforms !== undefined) {
			let groupKeys: string[] = this.transformsChecker.getGroupKeys();
			let groupDatasets: string[] = groupKeys.map((key: string) => QueryLogic.getID(key));
			if (!IDs.includes(groupDatasets[0])) {
				throw new InsightError("Referenced dataset \"" + groupDatasets[0] + "\" not added yet");
			}
		} else {
			let columnKeys: string[] = this.optionsChecker.getColumnKeys();
			let columnDatasets: string[] = columnKeys.map((key: string) => QueryLogic.getID(key));
			if (!IDs.includes(columnDatasets[0])) {
				throw new InsightError("Referenced dataset \"" + columnDatasets[0] + "\" not added yet");
			}
		}
	}

	// Taken from https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal/21266395
	private allEqual(array: string[]) {
		return array.every((val: string) => val === array[0]);
	}

}
