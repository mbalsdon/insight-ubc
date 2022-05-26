import {InsightError} from "./IInsightFacade";
import {QueryLogic} from "./QueryLogic";

export default class OptionsChecker {

	private columnKeys: string[];
	private dir: string;
	private orderKeys: string[];

	constructor() {
		this.columnKeys = [];
		this.dir = "UP";
		this.orderKeys = [];
	}

	public getOrderKeys(): string[] {
		return this.orderKeys;
	}

	public getColumnKeys(): string[] {
		return this.columnKeys;
	}

	public getDir(): string {
		return this.dir;
	}

	public checkOptions(options: any) {
		if (options === undefined) {
			throw new InsightError("Missing OPTIONS");
		}

		this.checkColumns(options.COLUMNS);
		this.checkOrder(options.ORDER);

	}

	private checkColumns(columns: any) {
		if (columns === undefined) {
			throw new InsightError("Missing COLUMNS");
		} else if (typeof columns[Symbol.iterator] !== "function" || columns.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array");
		}

		for (let key of columns) {
			if (!QueryLogic.isMkey(key) && !QueryLogic.isSkey(key) && !QueryLogic.isApplyKey(key)) {
				throw new InsightError("Invalid key " + key + " in COLUMNS");
			}
		}

		this.columnKeys = columns;
	}

	private checkOrder(order: any) {
		if (order === undefined) {
			return;
		} else if (typeof order === "string") {
			if (!QueryLogic.isMkey(order) && !QueryLogic.isSkey(order) && !QueryLogic.isApplyKey(order)) {
				throw new InsightError("Invalid key in ORDER");
			}
			this.orderKeys.push(order);
		} else if (typeof order !== "object" || order === null) {
			throw new InsightError("Invalid ORDER type");
		} else {
			this.checkDir(order.dir);
			this.checkKeys(order.keys);
		}
	}

	private checkDir(dir: any) {
		if (dir === undefined) {
			throw new InsightError("ORDER missing 'dir' key");
		} else if (dir !== "UP" && dir !== "DOWN") {
			throw new InsightError("Invalid ORDER direction");
		}
		this.dir = dir;
	}

	private checkKeys(keys: string[]) {
		if (keys === undefined) {
			throw new InsightError("ORDER missing 'keys' key");
		} else if (typeof keys[Symbol.iterator] !== "function" || keys.length === 0) {
			throw new InsightError("ORDER keys must be a non-empty array");
		}
		for (let key of keys) {
			if (!QueryLogic.isMkey(key) && !QueryLogic.isSkey(key) && !QueryLogic.isApplyKey(key)) {
				throw new InsightError("Invalid key " + key + " in ORDER keys");
			}
		}
		this.orderKeys = keys;
	}

}
