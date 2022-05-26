import {InsightError} from "./IInsightFacade";
import {QueryLogic} from "./QueryLogic";

export default class WhereChecker {

	private referencedDatasets: string[];
	private whereKeys: string[];

	constructor() {
		this.referencedDatasets = [];
		this.whereKeys = [];
	}

	public getReferencedDatasets(): string[] {
		return this.referencedDatasets;
	}

	public getWhereKeys(): string[] {
		return this.whereKeys;
	}

	public checkWhere(where: any) {
		if (where === undefined) {
			throw new InsightError("Missing WHERE");
		} else if (typeof where !== "object") {
			throw new InsightError("WHERE must be an object");
		} else if (Object.keys(where).length === 0) {
			return;
		} else if (Object.keys(where).length > 1) {
			throw new InsightError("WHERE can only have 0 or 1 keys");
		} else if (!QueryLogic.isFilter(where)) {
			throw new InsightError("invalid FILTER key");
		} else {
			this.checkFilter(where);
		}
	}

	private checkFilter(filter: any) {
		if (QueryLogic.isLogic(filter)) {
			this.checkLogic(filter);
		} else if (QueryLogic.isMcomparison(filter)) {
			this.checkMcomparison(filter);
		} else if (QueryLogic.isScomparison(filter)) {
			this.checkScomparison(filter);
		} else if (QueryLogic.isNegation(filter)) {
			this.checkNegation(filter);
		} else {
			throw new Error("checkFilter was passed an invalid FILTER object - " +
				"this should have been checked elsewhere");
		}
	}

	private checkLogic(filter: any) {
		let logic: any;
		if (filter.AND !== undefined) {
			logic = filter.AND;
		} else if (filter.OR !== undefined) {
			logic = filter.OR;
		} else {
			throw new Error("checkLogic was passed an invalid LOGIC object - " +
				"this should have been checked elsewhere");
		}

		if (logic === undefined || typeof logic[Symbol.iterator] !== "function" || logic.length < 1) {
			throw new InsightError("LOGICCOMPARISON must be a non-empty array");
		}
		for (let filterObj of logic) {
			if (!QueryLogic.isFilter(filterObj)) {
				throw new InsightError("invalid FILTER in LOGICCOMPARISON");
			}
		}
		for (let filterObj of logic) {
			this.checkFilter(filterObj);
		}
	}

	private checkMcomparison(filter: any) {
		let mcomparison: any;
		if (filter.GT !== undefined) {
			mcomparison = filter.GT;
		} else if (filter.LT !== undefined) {
			mcomparison = filter.LT;
		} else if (filter.EQ !== undefined) {
			mcomparison = filter.EQ;
		} else {
			throw new Error("checkMcomparison was passed an invalid MCOMPARISON object - " +
				"this should have been checked elsewhere");
		}

		if ((Object.keys(mcomparison).length === 0) || (Object.keys(mcomparison).length > 1)) {
			throw new InsightError("MCOMPARISON must have 1 key");
		} else if (typeof Object.values(mcomparison)[0] !== "number") {
			throw new InsightError("MCOMPARISON value must be a number");
		} else if (!QueryLogic.isMkey(Object.keys(mcomparison)[0])) {
			throw new InsightError("invalid MKEY");
		}

		this.referencedDatasets.push(QueryLogic.getID(Object.keys(mcomparison)[0]));
		this.whereKeys.push(Object.keys(mcomparison)[0]);
	}

	private checkScomparison(filter: any) {
		let scomparison: any = filter.IS;

		if ((Object.keys(scomparison).length === 0) || (Object.keys(scomparison).length > 1)) {
			throw new InsightError("IS must have 1 key");
		} else if (typeof Object.values(scomparison)[0] !== "string") {
			throw new InsightError("IS value must be a string");
		} else if (!QueryLogic.isSkey(Object.keys(scomparison)[0])) {
			throw new InsightError("invalid SKEY");
		}
		let skeyVal: any = Object.values(scomparison)[0];
		let noFirstLastChar: string = skeyVal.substring(1, skeyVal.length - 1);
		if (noFirstLastChar.includes("*")) {
			throw new InsightError("Asterisks can only be the first or last characters of input strings");
		}

		this.referencedDatasets.push(QueryLogic.getID(Object.keys(scomparison)[0]));
		this.whereKeys.push(Object.keys(scomparison)[0]);
	}

	private checkNegation(filter: any) {
		let negation: any = filter.NOT;

		if ((Object.keys(negation).length === 0) || (Object.keys(negation).length > 1)) {
			throw new InsightError("NOT must have 1 key");
		} else if (!QueryLogic.isFilter(negation)) {
			throw new InsightError("invalid FILTER key");
		}

		this.checkFilter(negation);
	}

}
